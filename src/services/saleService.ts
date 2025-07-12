import { Model, QueryTypes } from 'sequelize';
import { SaleModel, SaleAttributes, SaleCreationAttributes } from '../models/SaleModel';
import { SaleItemModel } from '../models/SaleItemModel';
import { ItemModel } from '../models/ItemModel';
import { UserModel } from '../models/UserModel';
import { OrderModel, OrderStatus, OrderType } from '../models/OrderModel';
import { OrderItemModel } from '../models/OrderItemModel';
import { KitchenOrderModel } from '../models/KitchenOrderModel';
import { getSaleRepository } from '../repositories/RepositoryFactory';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface SaleFilters {
  page?: number;
  limit?: number;
  status?: string;
  userId?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface SalesStats {
  totalSales: number;
  totalTransactions: number;
  averageOrderValue: number;
  topSellingItems: any[];
}

export class SaleService {
  static async createSale(saleData: SaleCreationAttributes): Promise<SaleAttributes> {
    try {
      if (!saleData.userId || saleData.totalAmount === undefined || !saleData.businessId) {
        throw new Error('Missing required fields: userId, businessId, totalAmount');
      }
      
      // Always generate idempotencyKey on the backend, ignore any client value
      saleData.idempotencyKey = uuidv4();
      logger(`DEBUG: Backend-generated idempotencyKey for createSale: ${saleData.idempotencyKey}`);
      
      // Check for idempotency
      const existingSale = await SaleModel.findOne({
        where: { idempotencyKey: saleData.idempotencyKey }
      });
      if (existingSale) {
        logger(`DEBUG: Found existing sale with idempotencyKey ${saleData.idempotencyKey}, returning existing sale`);
        return existingSale.toJSON();
      }
      
      const saleRepository = getSaleRepository();
      return await saleRepository.create(saleData);
    } catch (error) {
      logger(`Error creating sale: ${error}`);
      throw error;
    }
  }

  static async getSaleById(id: number, businessId?: number): Promise<SaleAttributes | null> {
    try {
      if (businessId) {
        const saleRepository = getSaleRepository();
        return await saleRepository.findById(id, businessId);
      }
      // fallback for legacy usage
      const sale = await SaleModel.findByPk(id);
      if (!sale) return null;
      return sale.toJSON();
    } catch (error) {
      logger(`Error getting sale by ID: ${error}`);
      throw error;
    }
  }

  static async getAllSales(filters: SaleFilters = {}): Promise<SaleAttributes[]> {
    try {
      const { page = 1, limit = 50, status, userId, startDate, endDate } = filters;
      const where: any = {};
      
      if (status) where.status = status;
      if (userId) where.userId = userId;
      
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.$gte = startDate;
        if (endDate) where.createdAt.$lte = endDate;
      }

      const sales = await SaleModel.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit,
        offset: (page - 1) * limit,
        include: []
      });

      return sales.map((sale: SaleModel) => sale.toJSON());
    } catch (error) {
      logger(`Error getting all sales: ${error}`);
      throw error;
    }
  }

  static async updateSale(id: number, businessId: number, updateData: Partial<SaleAttributes>): Promise<SaleAttributes | null> {
    try {
      const saleRepository = getSaleRepository();
      return await saleRepository.update(id, businessId, updateData);
    } catch (error) {
      logger(`Error updating sale: ${error}`);
      throw error;
    }
  }

  static async deleteSale(id: number, businessId: number): Promise<boolean> {
    try {
      const saleRepository = getSaleRepository();
      return await saleRepository.delete(id, businessId);
    } catch (error) {
      logger(`Error deleting sale: ${error}`);
      throw error;
    }
  }

  static async getSalesByUser(userId: number, businessId: number): Promise<SaleAttributes[]> {
    try {
      const saleRepository = getSaleRepository();
      const sales = await saleRepository.findAllByBusiness(businessId);
      return sales.filter((sale: SaleAttributes) => sale.userId === userId);
    } catch (error) {
      logger(`Error getting sales by user: ${error}`);
      throw error;
    }
  }

  static async getSalesByDateRange(startDate: Date, endDate: Date, businessId: number): Promise<SaleAttributes[]> {
    try {
      const saleRepository = getSaleRepository();
      const sales = await saleRepository.findAllByBusiness(businessId);
      return sales.filter((sale: SaleAttributes) => {
        const createdAt = new Date(sale.createdAt);
        return createdAt >= startDate && createdAt <= endDate;
      });
    } catch (error) {
      logger(`Error getting sales by date range: ${error}`);
      throw error;
    }
  }

  static async getSalesStats(): Promise<SalesStats> {
    try {
      const sales = await SaleModel.findAll({
        attributes: ['totalAmount', 'createdAt', 'status']
      });
      const totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount.toString()), 0);
      const totalTransactions = sales.length;
      const averageOrderValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;
      const sequelize = SaleModel.sequelize || SaleItemModel.sequelize;
      if (!sequelize) {
        throw new Error('Sequelize instance not available');
      }
      const topSellingItems = await sequelize.query(`
        SELECT 
          si.itemId,
          SUM(si.quantity) as totalQuantity
        FROM sale_items si
        INNER JOIN sales s ON si.saleId = s.id
        GROUP BY si.itemId
        ORDER BY SUM(si.quantity) DESC
        OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY
      `, {
        type: QueryTypes.SELECT
      });
      return {
        totalSales,
        totalTransactions,
        averageOrderValue,
        topSellingItems: topSellingItems || []
      };
    } catch (error) {
      logger(`Error getting sales stats: ${error}`);
      throw error;
    }
  }

  static async createSaleWithItems(
    saleData: SaleCreationAttributes,
    orderItems: Array<{
      itemId: number;
      quantity: number;
      unitPrice: number;
    }>
  ): Promise<SaleAttributes> {
    try {
      logger(`DEBUG: Service received saleData: ${JSON.stringify(saleData)}`);
      logger(`DEBUG: Service received orderItems: ${JSON.stringify(orderItems)}`);
      // Always generate idempotencyKey on the backend, ignore any client value
      saleData.idempotencyKey = uuidv4();
      logger(`DEBUG: Backend-generated idempotencyKey: ${saleData.idempotencyKey}`);
      // Check for idempotency - if idempotencyKey is provided, check for existing sale
      const existingSale = await SaleModel.findOne({
        where: { idempotencyKey: saleData.idempotencyKey }
      });
      if (existingSale) {
        logger(`DEBUG: Found existing sale with idempotencyKey ${saleData.idempotencyKey}, returning existing sale`);
        return existingSale.toJSON();
      }
      const sequelize = SaleModel.sequelize || SaleItemModel.sequelize;
      if (!sequelize) {
        throw new Error('Sequelize instance not available');
      }
      const transaction = await sequelize.transaction();
      try {
        logger(`DEBUG: About to create sale with data: ${JSON.stringify(saleData)}`);
        // Create the sale
        const sale = await SaleModel.create(saleData, { transaction });
        logger(`DEBUG: Sale created successfully with ID: ${sale.id}`);

        // Create sale items
        const saleItemPromises = orderItems.map(async item => {
          const discountAmount = 0; // Calculate discount if needed
          const totalPrice = item.quantity * item.unitPrice;
          const finalPrice = totalPrice - discountAmount;
          
          const saleItemData = {
            saleId: sale.id,
            itemId: item.itemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: finalPrice,
            discountAmount: discountAmount,
            finalPrice: finalPrice
          };
          
          logger(`DEBUG: Creating sale item: ${JSON.stringify(saleItemData)}`);
          return SaleItemModel.create(saleItemData, { transaction });
        });

        await Promise.all(saleItemPromises);
        logger(`DEBUG: All sale items created successfully`);

        // Update item stock
        const stockUpdatePromises = orderItems.map(async item => {
          const itemModel = await ItemModel.findByPk(item.itemId);
          if (itemModel) {
            const newStock = Math.max(0, itemModel.stock - item.quantity);
            await itemModel.update({ stock: newStock }, { transaction });
            logger(`DEBUG: Updated stock for item ${item.itemId} to ${newStock}`);
          } else {
            logger(`WARNING: Item ${item.itemId} not found for stock update`);
          }
        });

        await Promise.all(stockUpdatePromises);

        await transaction.commit();
        logger(`DEBUG: Transaction committed successfully`);

        // Automatically create order and kitchen order for all sales with items
        // This follows POS industry standards where kitchen orders are created immediately when orders are placed
        try {
          await this.createOrderAndKitchenOrderFromSale(sale, orderItems);
          logger(`DEBUG: Automatically created order and kitchen order for sale ${sale.id} (status: ${sale.status})`);
        } catch (error) {
          logger(`WARNING: Failed to create automatic order and kitchen order for sale ${sale.id}: ${error}`);
          // Don't fail the sale creation if kitchen order creation fails
        }

        return sale.toJSON();
      } catch (error) {
        const err: any = error;
        if (err.name === 'SequelizeUniqueConstraintError') {
          logger(`ERROR: Unique constraint violation on idempotencyKey: ${saleData.idempotencyKey}`);
          // Try to find the conflicting sale
          const conflict = await SaleModel.findOne({ where: { idempotencyKey: saleData.idempotencyKey } });
          if (conflict) {
            logger(`ERROR: Conflicting sale found: ${JSON.stringify(conflict.toJSON())}`);
          } else {
            logger(`ERROR: No conflicting sale found for idempotencyKey: ${saleData.idempotencyKey}`);
          }
        }
        logger(`ERROR: Database operation failed: ${error}`);
        logger(`ERROR: Database error stack: ${error instanceof Error ? error.stack : 'No stack trace'}`);
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      logger(`ERROR: Service error: ${error}`);
      logger(`ERROR: Service error stack: ${error instanceof Error ? error.stack : 'No stack trace'}`);
      throw error;
    }
  }

  static async getSaleWithItems(id: number): Promise<any> {
    try {
      const sale = await SaleModel.findByPk(id, {
        include: [
          {
            model: SaleItemModel,
            as: 'saleItems',
            include: [
              {
                model: ItemModel,
                as: 'item'
              }
            ]
          },
          {
            model: UserModel,
            as: 'user'
          }
        ]
      });

      if (!sale) return null;
      return sale.toJSON();
    } catch (error) {
      logger(`Error getting sale with items: ${error}`);
      throw error;
    }
  }

  static calculateSaleTotals(
    items: Array<{ quantity: number; unitPrice: number }>,
    taxRate: number = 0.10,
    discount: number = 0
  ): { subtotal: number; tax: number; total: number } {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * taxRate;
    const total = subtotal + tax - discount;
    return { subtotal, tax, total };
  }

  /**
   * Automatically create an order and kitchen order from a completed sale
   */
  private static async createOrderAndKitchenOrderFromSale(
    sale: SaleModel,
    orderItems: Array<{
      itemId: number;
      quantity: number;
      unitPrice: number;
    }>
  ): Promise<void> {
    try {
      logger(`DEBUG: Creating order and kitchen order from sale ${sale.id}`);

      // Generate unique order number
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      const saleId = sale.id;
      const orderNumber = `ORD-${timestamp}-${random}-${saleId}`;

      // Create order
      const order = await OrderModel.create({
        businessId: sale.businessId,
        serverId: sale.userId,
        orderNumber,
        orderType: OrderType.DINE_IN, // Default to dine-in, can be enhanced later
        status: OrderStatus.CONFIRMED,
        subtotal: sale.totalAmount,
        taxAmount: 0, // Could be calculated from sale data
        discountAmount: 0,
        totalAmount: sale.totalAmount,
        notes: sale.notes || `Auto-generated from sale ${sale.id}`
      });

      logger(`DEBUG: Created order ${order.id} from sale ${sale.id}`);

      // Create order items
      for (const item of orderItems) {
        const itemModel = await ItemModel.findByPk(item.itemId);
        if (itemModel) {
          await OrderItemModel.create({
            orderId: order.id,
            itemId: item.itemId,
            itemName: itemModel.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
            status: 'confirmed'
          } as any);
        }
      }

      logger(`DEBUG: Created order items for order ${order.id}`);

      // Create kitchen order with actual item names
      const kitchenItems = await Promise.all(orderItems.map(async (item, index) => {
        const itemModel = await ItemModel.findByPk(item.itemId);
        return {
          id: index + 1,
          itemName: itemModel?.name || `Item ${item.itemId}`,
          quantity: item.quantity,
          status: 'pending' as const,
          specialInstructions: '',
          modifications: [],
          allergens: [],
          preparationTime: 15 // Default preparation time
        };
      }));

      const kitchenOrder = await KitchenOrderModel.create({
        businessId: sale.businessId,
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: sale.customerName || 'Customer',
        orderType: 'dine_in',
        priority: 'normal',
        status: 'pending',
        estimatedPrepTime: 15,
        items: kitchenItems,
        totalItems: kitchenItems.length,
        completedItems: 0,
        notes: `Auto-generated from sale ${sale.id}`
      });

      logger(`DEBUG: Created kitchen order ${kitchenOrder.id} from order ${order.id}`);

    } catch (error) {
      logger(`ERROR: Failed to create order and kitchen order from sale ${sale.id}: ${error}`);
      throw error;
    }
  }
} 