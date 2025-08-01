import { OrderModel, OrderItemModel, SaleModel, SaleItemModel, TableModel, KitchenOrderModel, MenuItemModel, ItemModel } from '../models';
import { OrderStatus, OrderType } from '../models/OrderModel';
import { TableStatus } from '../models/TableModel';
import { SaleStatus } from '../models/SaleModel';
import { logger } from '../utils/logger';
import { generateSaleNumber } from '../utils/saleNumberGenerator';
import { v4 as uuidv4 } from 'uuid';
import { QueryTypes, Op } from 'sequelize';

export interface OrderCompletionData {
  paymentMethod: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: string;
}

export interface TableClearingResult {
  success: boolean;
  ordersCompleted: number;
  salesCreated: number;
  errors: string[];
}

// Type for order with included items
interface OrderWithItems extends OrderModel {
  orderItems: OrderItemModel[];
}

export class OrderService {
  /**
   * Complete an order and create a sale
   */
  static async completeOrder(orderId: number, businessId: number, completionData: OrderCompletionData): Promise<any> {
    const sequelize = OrderModel.sequelize;
    if (!sequelize) {
      throw new Error('Sequelize instance not available');
    }

    const transaction = await sequelize.transaction();

    try {
      // Get the order with items
      const order = await OrderModel.findOne({
        where: { id: orderId, businessId },
        include: [
          {
            model: OrderItemModel,
            as: 'orderItems',
            include: [
              {
                model: MenuItemModel,
                as: 'menuItem'
              }
            ]
          }
        ],
        transaction
      }) as OrderWithItems | null;

      if (!order) {
        throw new Error('Order not found');
      }

      if (order.status === OrderStatus.COMPLETED) {
        throw new Error('Order is already completed');
      }

      if (order.status !== OrderStatus.SERVED) {
        throw new Error('Order must be served before completion');
      }

      // Calculate totals
      const subtotal = order.orderItems.reduce((sum: number, item: OrderItemModel) => sum + (item.totalPrice || 0), 0);
      const taxAmount = order.taxAmount || 0;
      const discountAmount = order.discountAmount || 0;
      const totalAmount = subtotal + taxAmount - discountAmount;

      // Generate sale number
      const saleNumber = await generateSaleNumber(businessId);

      // Create sale
      const saleData: any = {
        businessId,
        userId: order.serverId,
        saleNumber,
        totalAmount,
        paymentMethod: completionData.paymentMethod,
        status: SaleStatus.COMPLETED,
        idempotencyKey: uuidv4(),
        currencyId: order.currencyId
      };

      // Only add optional fields if they exist
      if (completionData.customerName) saleData.customerName = completionData.customerName;
      if (completionData.customerEmail) saleData.customerEmail = completionData.customerEmail;
      if (completionData.customerPhone) saleData.customerPhone = completionData.customerPhone;
      if (completionData.notes) saleData.notes = completionData.notes;

      const sale = await SaleModel.create(saleData, { transaction });

      // Create sale items
      const saleItemPromises = order.orderItems.map(async (orderItem: OrderItemModel) => {
        const saleItemData = {
          businessId,
          saleId: sale.id,
          itemId: orderItem.itemId,
          quantity: orderItem.quantity,
          unitPrice: orderItem.unitPrice,
          totalPrice: orderItem.totalPrice,
          discountAmount: 0,
          finalPrice: orderItem.totalPrice,
          currencyId: order.currencyId
        };

        return SaleItemModel.create(saleItemData, { transaction });
      });

      await Promise.all(saleItemPromises);

      // Update item stock
      const stockUpdatePromises = order.orderItems.map(async (orderItem: OrderItemModel) => {
        if ((orderItem as any).menuItem && (orderItem as any).menuItem.itemId) {
          const itemModel = await ItemModel.findByPk((orderItem as any).menuItem.itemId);
          if (itemModel) {
            const newStock = Math.max(0, itemModel.stock - orderItem.quantity);
            await itemModel.update({ stock: newStock }, { transaction });
          }
        }
      });

      await Promise.all(stockUpdatePromises);

      // Update order status
      await order.update({ 
        status: OrderStatus.COMPLETED,
        actualReadyTime: new Date()
      }, { transaction });

      // Update kitchen order if exists
      const kitchenOrder = await KitchenOrderModel.findOne({
        where: { orderId: order.id },
        transaction
      });

      if (kitchenOrder) {
        await kitchenOrder.update({ 
          status: 'served' as any,
          servedTime: new Date()
        }, { transaction });
      }

      await transaction.commit();

      logger(`Order ${orderId} completed successfully. Sale created: ${sale.id}`);

      return {
        success: true,
        order: order.toJSON(),
        sale: sale.toJSON(),
        message: 'Order completed and sale created successfully'
      };

    } catch (error) {
      await transaction.rollback();
      logger(`Error completing order ${orderId}: ${error}`);
      throw error;
    }
  }

  /**
   * Clear a table and complete all pending orders
   */
  static async clearTable(tableId: number, businessId: number): Promise<TableClearingResult> {
    const sequelize = OrderModel.sequelize;
    if (!sequelize) {
      throw new Error('Sequelize instance not available');
    }

    const transaction = await sequelize.transaction();
    const result: TableClearingResult = {
      success: true,
      ordersCompleted: 0,
      salesCreated: 0,
      errors: []
    };

    try {
      // Get all pending orders for this table
      const pendingOrders = await OrderModel.findAll({
        where: {
          tableId,
          businessId,
          status: {
            [Op.in]: [OrderStatus.SERVED, OrderStatus.READY]
          }
        },
        include: [
          {
            model: OrderItemModel,
            as: 'orderItems',
            include: [
              {
                model: MenuItemModel,
                as: 'menuItem'
              }
            ]
          }
        ],
        transaction
      }) as OrderWithItems[];

      logger(`Found ${pendingOrders.length} pending orders for table ${tableId}`);

      // Complete each order
      for (const order of pendingOrders) {
        try {
          // Calculate totals
          const subtotal = order.orderItems.reduce((sum: number, item: OrderItemModel) => sum + (item.totalPrice || 0), 0);
          const taxAmount = order.taxAmount || 0;
          const discountAmount = order.discountAmount || 0;
          const totalAmount = subtotal + taxAmount - discountAmount;

          // Generate sale number
          const saleNumber = await generateSaleNumber(businessId);

          // Create sale
          const saleData: any = {
            businessId,
            userId: order.serverId,
            saleNumber,
            totalAmount,
            paymentMethod: 'cash', // Default payment method for table clearing
            status: SaleStatus.COMPLETED,
            customerName: 'Table Customer',
            notes: `Auto-completed from table ${tableId}`,
            idempotencyKey: uuidv4(),
            currencyId: order.currencyId
          };

          const sale = await SaleModel.create(saleData, { transaction });

          // Create sale items
          const saleItemPromises = order.orderItems.map(async (orderItem: OrderItemModel) => {
            const saleItemData = {
              businessId,
              saleId: sale.id,
              itemId: orderItem.itemId,
              quantity: orderItem.quantity,
              unitPrice: orderItem.unitPrice,
              totalPrice: orderItem.totalPrice,
              discountAmount: 0,
              finalPrice: orderItem.totalPrice,
              currencyId: order.currencyId
            };

            return SaleItemModel.create(saleItemData, { transaction });
          });

          await Promise.all(saleItemPromises);

          // Update item stock
          const stockUpdatePromises = order.orderItems.map(async (orderItem: OrderItemModel) => {
            if ((orderItem as any).menuItem && (orderItem as any).menuItem.itemId) {
              const itemModel = await ItemModel.findByPk((orderItem as any).menuItem.itemId);
              if (itemModel) {
                const newStock = Math.max(0, itemModel.stock - orderItem.quantity);
                await itemModel.update({ stock: newStock }, { transaction });
              }
            }
          });

          await Promise.all(stockUpdatePromises);

          // Update order status
          await order.update({ 
            status: OrderStatus.COMPLETED,
            actualReadyTime: new Date()
          }, { transaction });

          // Update kitchen order if exists
          const kitchenOrder = await KitchenOrderModel.findOne({
            where: { orderId: order.id },
            transaction
          });

          if (kitchenOrder) {
            await kitchenOrder.update({ 
              status: 'served' as any,
              servedTime: new Date()
            }, { transaction });
          }

          result.ordersCompleted++;
          result.salesCreated++;

        } catch (error) {
          const errorMsg = `Failed to complete order ${order.id}: ${error}`;
          logger(errorMsg);
          result.errors.push(errorMsg);
        }
      }

      // Update table status to available
      await TableModel.update({
        status: TableStatus.AVAILABLE,
        currentOrderId: null,
        serverId: null
      }, {
        where: { id: tableId, businessId },
        transaction
      });

      await transaction.commit();

      logger(`Table ${tableId} cleared successfully. Completed ${result.ordersCompleted} orders, created ${result.salesCreated} sales`);

      return result;

    } catch (error) {
      await transaction.rollback();
      logger(`Error clearing table ${tableId}: ${error}`);
      result.success = false;
      result.errors.push(`Failed to clear table: ${error}`);
      return result;
    }
  }

  /**
   * Get orders by table
   */
  static async getOrdersByTable(tableId: number, businessId: number): Promise<any[]> {
    try {
      const orders = await OrderModel.findAll({
        where: { tableId, businessId },
        include: [
          {
            model: OrderItemModel,
            as: 'orderItems'
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return orders.map(order => order.toJSON());
    } catch (error) {
      logger(`Error getting orders by table ${tableId}: ${error}`);
      throw error;
    }
  }

  /**
   * Get pending orders for the business
   */
  static async getPendingOrders(businessId: number): Promise<any[]> {
    try {
      const orders = await OrderModel.findAll({
        where: {
          businessId,
          status: {
            [Op.notIn]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED]
          }
        },
        include: [
          {
            model: OrderItemModel,
            as: 'orderItems'
          }
        ],
        order: [['createdAt', 'ASC']]
      });

      return orders.map(order => order.toJSON());
    } catch (error) {
      logger(`Error getting pending orders for business ${businessId}: ${error}`);
      throw error;
    }
  }

  /**
   * Get completed orders for the business
   */
  static async getCompletedOrders(businessId: number, startDate?: Date, endDate?: Date): Promise<any[]> {
    try {
      const whereClause: any = {
        businessId,
        status: OrderStatus.COMPLETED
      };

      if (startDate && endDate) {
        whereClause.createdAt = {
          [Op.between]: [startDate, endDate]
        };
      }

      const orders = await OrderModel.findAll({
        where: whereClause,
        include: [
          {
            model: OrderItemModel,
            as: 'orderItems'
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return orders.map(order => order.toJSON());
    } catch (error) {
      logger(`Error getting completed orders for business ${businessId}: ${error}`);
      throw error;
    }
  }
} 