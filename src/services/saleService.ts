import { Model, QueryTypes } from 'sequelize';
import { SaleModel, SaleAttributes, SaleCreationAttributes } from '../models/SaleModel';
import { SaleItemModel } from '../models/SaleItemModel';
import { ItemModel } from '../models/ItemModel';
import { MenuItemModel } from '../models/MenuItemModel';
import { UserModel } from '../models/UserModel';
import { OrderModel, OrderStatus, OrderType } from '../models/OrderModel';
import { OrderItemModel } from '../models/OrderItemModel';
import { KitchenOrderModel } from '../models/KitchenOrderModel';
import { getSaleRepository } from '../repositories/RepositoryFactory';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { generateSaleNumber } from '../utils/saleNumberGenerator';

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

      // Generate sale number if not provided
      if (!saleData.saleNumber) {
        saleData.saleNumber = await generateSaleNumber(saleData.businessId);
        logger(`DEBUG: Generated sale number: ${saleData.saleNumber}`);
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

      // Generate sale number if not provided
      if (!saleData.saleNumber) {
        saleData.saleNumber = await generateSaleNumber(saleData.businessId);
        logger(`DEBUG: Generated sale number: ${saleData.saleNumber}`);
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
            businessId: saleData.businessId,
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

        // Update item stock - now using menu item's associated inventory item
        const stockUpdatePromises = orderItems.map(async item => {
          // First, get the menu item to find its associated inventory item
          const menuItem = await MenuItemModel.findByPk(item.itemId);
          if (menuItem && menuItem.itemId) {
            const itemModel = await ItemModel.findByPk(menuItem.itemId);
            if (itemModel) {
              const newStock = Math.max(0, itemModel.stock - item.quantity);
              await itemModel.update({ stock: newStock }, { transaction });
              logger(`DEBUG: Updated stock for inventory item ${menuItem.itemId} (from menu item ${item.itemId}) to ${newStock}`);
            } else {
              logger(`WARNING: Inventory item ${menuItem.itemId} not found for stock update`);
            }
          } else {
            logger(`WARNING: Menu item ${item.itemId} not found or has no associated inventory item`);
          }
        });

        await Promise.all(stockUpdatePromises);

        // Create order and kitchen order within the same transaction
        // This ensures data consistency - if order creation fails, the entire sale is rolled back
        logger(`DEBUG: Creating order and kitchen order within transaction for sale ${sale.id}`);
        await this.createOrderAndKitchenOrderFromSale(sale, orderItems, transaction);
        logger(`DEBUG: Order and kitchen order created successfully within transaction`);

        await transaction.commit();
        logger(`DEBUG: Transaction committed successfully - sale, items, stock updates, order, and kitchen order all created`);

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

  static async getSaleWithItems(id: number, businessId: number): Promise<any> {
    try {
      const sale = await SaleModel.findOne({
        where: { id, businessId },
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
  ): { subtotal: number; tax: number; totalAmount: number } {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * taxRate;
    const totalAmount = subtotal + tax - discount;
    return { subtotal, tax, totalAmount };
  }

  /**
   * Automatically create an order and kitchen order from a completed sale
   * This method must be called within a transaction to ensure data consistency
   */
  private static async createOrderAndKitchenOrderFromSale(
    sale: SaleModel,
    orderItems: Array<{
      itemId: number;
      quantity: number;
      unitPrice: number;
    }>,
    transaction: any
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
      }, { transaction });

      logger(`DEBUG: Created order ${order.id} from sale ${sale.id}`);

      // Fetch all menu items at once to reduce database calls
      const itemIds = orderItems.map(item => item.itemId);
      logger(`DEBUG: Fetching menu items with IDs: ${itemIds.join(', ')}`);
      
      const allMenuItems = await MenuItemModel.findAll({
        where: { id: itemIds },
        transaction
      });
      
      logger(`DEBUG: Found ${allMenuItems.length} menu items out of ${itemIds.length} requested`);
      
      // Create a map for quick lookup
      const itemMap = new Map(allMenuItems.map(item => [item.id, item]));

      // Create order items
      for (const item of orderItems) {
        const itemModel = itemMap.get(item.itemId);
        if (itemModel) {
          await OrderItemModel.create({
            orderId: order.id,
            itemId: item.itemId,
            itemName: itemModel.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
            status: 'confirmed'
          } as any, { transaction });
        }
      }

      logger(`DEBUG: Created order items for order ${order.id}`);

      // Create kitchen order with actual item names
      const kitchenItems = orderItems.map((item, index) => {
        const itemModel = itemMap.get(item.itemId);
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
      });

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
      }, { transaction });

      logger(`DEBUG: Created kitchen order ${kitchenOrder.id} from order ${order.id}`);

    } catch (error) {
      logger(`ERROR: Failed to create order and kitchen order from sale ${sale.id}: ${error}`);
      throw error;
    }
  }

  /**
   * Create order and kitchen order from sale without transaction (for recovery purposes)
   */
  private static async createOrderAndKitchenOrderFromSaleRecovery(
    sale: SaleModel,
    orderItems: Array<{
      itemId: number;
      quantity: number;
      unitPrice: number;
    }>
  ): Promise<void> {
    try {
      logger(`DEBUG: Creating order and kitchen order from sale ${sale.id} (recovery mode)`);

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
        notes: sale.notes || `Auto-generated from sale ${sale.id} (recovery)`
      });

      logger(`DEBUG: Created order ${order.id} from sale ${sale.id} (recovery mode)`);

      // Fetch all menu items at once to reduce database calls
      const itemIds = orderItems.map(item => item.itemId);
      logger(`DEBUG: Fetching menu items with IDs: ${itemIds.join(', ')} (recovery mode)`);
      
      const allMenuItems = await MenuItemModel.findAll({
        where: { id: itemIds }
      });
      
      logger(`DEBUG: Found ${allMenuItems.length} menu items out of ${itemIds.length} requested (recovery mode)`);
      
      // Create a map for quick lookup
      const itemMap = new Map(allMenuItems.map(item => [item.id, item]));

      // Create order items
      for (const item of orderItems) {
        const itemModel = itemMap.get(item.itemId);
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

      logger(`DEBUG: Created order items for order ${order.id} (recovery mode)`);

      // Create kitchen order with actual item names
      const kitchenItems = orderItems.map((item, index) => {
        const itemModel = itemMap.get(item.itemId);
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
      });

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
        notes: `Auto-generated from sale ${sale.id} (recovery)`
      });

      logger(`DEBUG: Created kitchen order ${kitchenOrder.id} from order ${order.id} (recovery mode)`);

    } catch (error) {
      logger(`ERROR: Failed to create order and kitchen order from sale ${sale.id} (recovery mode): ${error}`);
      throw error;
    }
  }

  /**
   * Create missing orders for existing sales that don't have associated orders
   * This is a recovery method for cases where sales were created but orders failed
   */
  static async createMissingOrdersForSales(businessId: number): Promise<{ success: number; failed: number; errors: string[] }> {
    const result = { success: 0, failed: 0, errors: [] as string[] };
    
    try {
      logger(`INFO: Starting to create missing orders for business ${businessId}`);
      
      // Find sales that don't have associated orders
      const salesWithoutOrders = await SaleModel.findAll({
        where: { businessId },
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
          }
        ]
      });

      logger(`INFO: Found ${salesWithoutOrders.length} sales to check for missing orders`);

      for (const sale of salesWithoutOrders) {
        try {
          // Check if order already exists for this sale
          const existingOrder = await OrderModel.findOne({
            where: { 
              businessId,
              notes: { [require('sequelize').Op.like]: `%Auto-generated from sale ${sale.id}%` }
            }
          });

          if (existingOrder) {
            logger(`DEBUG: Order already exists for sale ${sale.id}, skipping`);
            continue;
          }

          // Convert sale items to order items format
          const saleItems = (sale as any).saleItems || [];
          const orderItems = saleItems.map((saleItem: any) => ({
            itemId: saleItem.itemId,
            quantity: saleItem.quantity,
            unitPrice: saleItem.unitPrice
          }));

          if (orderItems.length === 0) {
            logger(`WARNING: Sale ${sale.id} has no items, skipping order creation`);
            continue;
          }

          // Create order and kitchen order (without transaction for recovery method)
          await this.createOrderAndKitchenOrderFromSaleRecovery(sale, orderItems);
          result.success++;
          logger(`SUCCESS: Created missing order for sale ${sale.id}`);

        } catch (error) {
          result.failed++;
          const errorMsg = `Failed to create order for sale ${sale.id}: ${error}`;
          result.errors.push(errorMsg);
          logger(`ERROR: ${errorMsg}`);
        }
      }

      logger(`INFO: Completed creating missing orders. Success: ${result.success}, Failed: ${result.failed}`);
      return result;

    } catch (error) {
      logger(`ERROR: Failed to create missing orders for business ${businessId}: ${error}`);
      throw error;
    }
  }

  static async getInventoryAnalytics(businessId: number): Promise<any> {
    try {
      const sequelize = SaleModel.sequelize;
      if (!sequelize) {
        throw new Error('Sequelize instance not available');
      }

      // Get low stock items
      const lowStockItems = await sequelize.query(`
        SELECT 
          i.id as itemId,
          i.name as itemName,
          i.stock as currentStock,
          i.minStock,
          CASE 
            WHEN i.stock > 0 THEN 
              CAST(i.stock / (SELECT COALESCE(AVG(si.quantity), 1) 
                             FROM sale_items si 
                             INNER JOIN sales s ON si.saleId = s.id 
                             WHERE si.itemId = i.id 
                             AND s.businessId = :businessId 
                             AND s.createdAt >= DATEADD(day, -30, GETDATE())) AS INT)
            ELSE 999
          END as daysUntilStockout
        FROM items i
        WHERE i.businessId = :businessId 
        AND i.isActive = 1
        AND i.stock <= i.minStock
        ORDER BY i.stock ASC
      `, {
        type: QueryTypes.SELECT,
        replacements: { businessId }
      });

      // Get overstocked items
      const overstockedItems = await sequelize.query(`
        SELECT 
          i.id as itemId,
          i.name as itemName,
          i.stock as currentStock,
          i.maxStock,
          CASE 
            WHEN i.stock > 0 THEN 
              CAST(i.stock / (SELECT COALESCE(AVG(si.quantity), 1) 
                             FROM sale_items si 
                             INNER JOIN sales s ON si.saleId = s.id 
                             WHERE si.itemId = i.id 
                             AND s.businessId = :businessId 
                             AND s.createdAt >= DATEADD(day, -30, GETDATE())) AS INT)
            ELSE 0
          END as daysOfInventory
        FROM items i
        WHERE i.businessId = :businessId 
        AND i.isActive = 1
        AND i.stock > i.maxStock
        ORDER BY i.stock DESC
      `, {
        type: QueryTypes.SELECT,
        replacements: { businessId }
      });

      // Get summary statistics
      const summary = await sequelize.query(`
        SELECT 
          COUNT(*) as totalItems,
          SUM(CASE WHEN stock <= minStock THEN 1 ELSE 0 END) as lowStockCount,
          SUM(CASE WHEN stock > maxStock THEN 1 ELSE 0 END) as overstockedCount,
          SUM(stock * cost) as inventoryValue
        FROM items
        WHERE businessId = :businessId AND isActive = 1
      `, {
        type: QueryTypes.SELECT,
        replacements: { businessId }
      });

      return {
        lowStockItems,
        overstockedItems,
        summary: summary[0] || {
          totalItems: 0,
          lowStockCount: 0,
          overstockedCount: 0,
          inventoryValue: 0,
          turnoverRate: 0
        }
      };
    } catch (error) {
      logger(`Error getting inventory analytics: ${error}`);
      throw error;
    }
  }

  static async getItemAnalytics(businessId: number, filters: any = {}): Promise<any> {
    try {
      const { startDate, endDate, limit = 10 } = filters;
      const sequelize = SaleModel.sequelize;
      if (!sequelize) {
        throw new Error('Sequelize instance not available');
      }

      let dateFilter = '';
      let replacements: any = { businessId, limit };

      if (startDate && endDate) {
        dateFilter = 'AND s.createdAt BETWEEN :startDate AND :endDate';
        replacements.startDate = startDate;
        replacements.endDate = endDate;
      }

      // Get top selling items
      const topSellers = await sequelize.query(`
        SELECT 
          si.itemId,
          i.name as itemName,
          SUM(si.quantity) as totalQuantity,
          SUM(si.totalPrice) as totalRevenue,
          AVG(si.unitPrice) as averagePrice,
          CASE 
            WHEN i.cost > 0 THEN 
              ((AVG(si.unitPrice) - i.cost) / AVG(si.unitPrice)) * 100
            ELSE 0
          END as profitMargin
        FROM sale_items si
        INNER JOIN sales s ON si.saleId = s.id
        INNER JOIN items i ON si.itemId = i.id
        WHERE s.businessId = :businessId 
        AND s.status = 'completed'
        ${dateFilter}
        GROUP BY si.itemId, i.name, i.cost
        ORDER BY totalQuantity DESC
        OFFSET 0 ROWS FETCH NEXT :limit ROWS ONLY
      `, {
        type: QueryTypes.SELECT,
        replacements
      });

      // Get worst selling items
      const worstSellers = await sequelize.query(`
        SELECT 
          si.itemId,
          i.name as itemName,
          SUM(si.quantity) as totalQuantity,
          SUM(si.totalPrice) as totalRevenue,
          MAX(s.createdAt) as lastSoldDate,
          DATEDIFF(day, MAX(s.createdAt), GETDATE()) as daysSinceLastSale
        FROM sale_items si
        INNER JOIN sales s ON si.saleId = s.id
        INNER JOIN items i ON si.itemId = i.id
        WHERE s.businessId = :businessId 
        AND s.status = 'completed'
        ${dateFilter}
        GROUP BY si.itemId, i.name
        ORDER BY totalQuantity ASC
        OFFSET 0 ROWS FETCH NEXT :limit ROWS ONLY
      `, {
        type: QueryTypes.SELECT,
        replacements
      });

      // Get summary
      const summary = await sequelize.query(`
        SELECT 
          COUNT(DISTINCT si.itemId) as totalItemsSold,
          SUM(si.totalPrice) as totalRevenue,
          AVG(s.totalAmount) as averageOrderValue
        FROM sale_items si
        INNER JOIN sales s ON si.saleId = s.id
        WHERE s.businessId = :businessId 
        AND s.status = 'completed'
        ${dateFilter}
      `, {
        type: QueryTypes.SELECT,
        replacements
      });

      return {
        topSellers,
        worstSellers,
        summary: summary[0] || {
          totalItemsSold: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          mostProfitableItem: '',
          leastProfitableItem: ''
        }
      };
    } catch (error) {
      logger(`Error getting item analytics: ${error}`);
      throw error;
    }
  }

  static async getRevenueAnalytics(businessId: number, filters: any = {}): Promise<any> {
    try {
      const { period = 'monthly', startDate, endDate } = filters;
      const sequelize = SaleModel.sequelize;
      if (!sequelize) {
        throw new Error('Sequelize instance not available');
      }

      let dateFilter = '';
      let replacements: any = { businessId };

      if (startDate && endDate) {
        dateFilter = 'AND s.createdAt BETWEEN :startDate AND :endDate';
        replacements.startDate = startDate;
        replacements.endDate = endDate;
      }

      let periodFormat = '';
      switch (period) {
        case 'daily':
          periodFormat = 'FORMAT(s.createdAt, \'yyyy-MM-dd\')';
          break;
        case 'weekly':
          periodFormat = 'FORMAT(DATEADD(day, -DATEPART(weekday, s.createdAt) + 1, s.createdAt), \'yyyy-MM-dd\')';
          break;
        case 'monthly':
          periodFormat = 'FORMAT(s.createdAt, \'yyyy-MM\')';
          break;
        case 'yearly':
          periodFormat = 'YEAR(s.createdAt)';
          break;
        default:
          periodFormat = 'FORMAT(s.createdAt, \'yyyy-MM\')';
      }

      // Get period data
      const periodData = await sequelize.query(`
        SELECT 
          ${periodFormat} as period,
          SUM(s.totalAmount) as revenue,
          COUNT(*) as transactions,
          AVG(s.totalAmount) as averageOrderValue
        FROM sales s
        WHERE s.businessId = :businessId 
        AND s.status = 'completed'
        ${dateFilter}
        GROUP BY ${periodFormat}
        ORDER BY period DESC
      `, {
        type: QueryTypes.SELECT,
        replacements
      });

      // Get summary
      const summary = await sequelize.query(`
        SELECT 
          SUM(s.totalAmount) as totalRevenue,
          COUNT(*) as totalTransactions,
          AVG(s.totalAmount) as averageOrderValue
        FROM sales s
        WHERE s.businessId = :businessId 
        AND s.status = 'completed'
        ${dateFilter}
      `, {
        type: QueryTypes.SELECT,
        replacements
      });

      // Get best day and hour separately
      const bestDayHour = await sequelize.query(`
        SELECT 
          DATEPART(weekday, s.createdAt) as bestDay,
          DATEPART(hour, s.createdAt) as bestHour,
          COUNT(*) as dayCount
        FROM sales s
        WHERE s.businessId = :businessId 
        AND s.status = 'completed'
        ${dateFilter}
        GROUP BY DATEPART(weekday, s.createdAt), DATEPART(hour, s.createdAt)
        ORDER BY dayCount DESC
        OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY
      `, {
        type: QueryTypes.SELECT,
        replacements
      });

      const bestDayHourData = bestDayHour[0] as any || { bestDay: 1, bestHour: 12 };
      const summaryData = summary[0] as any || {
        totalRevenue: 0,
        totalTransactions: 0,
        averageOrderValue: 0
      };
      
      return {
        periodData,
        summary: {
          ...summaryData,
          bestDay: bestDayHourData.bestDay,
          bestHour: bestDayHourData.bestHour
        }
      };
    } catch (error) {
      logger(`Error getting revenue analytics: ${error}`);
      throw error;
    }
  }

  static async getStaffAnalytics(businessId: number, filters: any = {}): Promise<any> {
    try {
      const { startDate, endDate } = filters;
      const sequelize = SaleModel.sequelize;
      if (!sequelize) {
        throw new Error('Sequelize instance not available');
      }

      let dateFilter = '';
      let subqueryDateFilter = '';
      let replacements: any = { businessId };

      if (startDate && endDate) {
        dateFilter = 'AND s.createdAt BETWEEN :startDate AND :endDate';
        subqueryDateFilter = 'AND createdAt BETWEEN :startDate AND :endDate';
        replacements.startDate = startDate;
        replacements.endDate = endDate;
      }

      // Get staff performance
      const staffPerformance = await sequelize.query(`
        SELECT 
          s.userId,
          u.name as userName,
          SUM(s.totalAmount) as totalSales,
          COUNT(*) as totalTransactions,
          AVG(s.totalAmount) as averageOrderValue,
          ROW_NUMBER() OVER (ORDER BY SUM(s.totalAmount) DESC) as performanceRank
        FROM sales s
        INNER JOIN users u ON s.userId = u.id
        WHERE s.businessId = :businessId 
        AND s.status = 'completed'
        ${dateFilter}
        GROUP BY s.userId, u.name
        ORDER BY totalSales DESC
      `, {
        type: QueryTypes.SELECT,
        replacements
      });

      // Get summary
      const summary = await sequelize.query(`
        SELECT 
          COUNT(DISTINCT s.userId) as totalStaff
        FROM sales s
        WHERE s.businessId = :businessId 
        AND s.status = 'completed'
        ${dateFilter}
      `, {
        type: QueryTypes.SELECT,
        replacements
      });

      // Get average sales per staff
      const avgSalesPerStaff = await sequelize.query(`
        SELECT AVG(totalSales) as averageSalesPerStaff
        FROM (
          SELECT userId, SUM(totalAmount) as totalSales
          FROM sales 
          WHERE businessId = :businessId 
          AND status = 'completed'
          ${subqueryDateFilter}
          GROUP BY userId
        ) staffSales
      `, {
        type: QueryTypes.SELECT,
        replacements
      });

      // Get repeat customers
      const repeatCustomers = await sequelize.query(`
        SELECT COUNT(DISTINCT customerId) as repeatCustomers
        FROM (
          SELECT customerId, COUNT(*) as orderCount
          FROM sales 
          WHERE businessId = :businessId 
          AND status = 'completed'
          AND customerId IS NOT NULL
          ${subqueryDateFilter}
          GROUP BY customerId
          HAVING COUNT(*) > 1
        ) repeatCustomers
      `, {
        type: QueryTypes.SELECT,
        replacements
      });

      // Get average customer value
      const avgCustomerValue = await sequelize.query(`
        SELECT AVG(totalSpent) as averageCustomerValue
        FROM (
          SELECT customerId, SUM(totalAmount) as totalSpent
          FROM sales 
          WHERE businessId = :businessId 
          AND status = 'completed'
          AND customerId IS NOT NULL
          ${subqueryDateFilter}
          GROUP BY customerId
        ) customerTotals
      `, {
        type: QueryTypes.SELECT,
        replacements
      });

      const summaryData = summary[0] as any || { totalStaff: 0 };
      const avgSalesData = avgSalesPerStaff[0] as any || { averageSalesPerStaff: 0 };
      const repeatCustomersData = repeatCustomers[0] as any || { repeatCustomers: 0 };
      const avgCustomerValueData = avgCustomerValue[0] as any || { averageCustomerValue: 0 };
      
      return {
        staffPerformance,
        summary: {
          ...summaryData,
          averageSalesPerStaff: avgSalesData.averageSalesPerStaff,
          repeatCustomers: repeatCustomersData.repeatCustomers,
          averageCustomerValue: avgCustomerValueData.averageCustomerValue
        }
      };
    } catch (error) {
      logger(`Error getting staff analytics: ${error}`);
      throw error;
    }
  }

  static async getCustomerAnalytics(businessId: number, filters: any = {}): Promise<any> {
    try {
      const { startDate, endDate, limit = 10 } = filters;
      const sequelize = SaleModel.sequelize;
      if (!sequelize) {
        throw new Error('Sequelize instance not available');
      }

      let dateFilter = '';
      let subqueryDateFilter = '';
      let replacements: any = { businessId, limit };

      if (startDate && endDate) {
        dateFilter = 'AND s.createdAt BETWEEN :startDate AND :endDate';
        subqueryDateFilter = 'AND createdAt BETWEEN :startDate AND :endDate';
        replacements.startDate = startDate;
        replacements.endDate = endDate;
      }

      // Get top customers
      const topCustomers = await sequelize.query(`
        SELECT 
          s.customerId,
          s.customerName,
          SUM(s.totalAmount) as totalSpent,
          COUNT(*) as totalOrders,
          AVG(s.totalAmount) as averageOrderValue,
          MAX(s.createdAt) as lastVisit
        FROM sales s
        WHERE s.businessId = :businessId 
        AND s.status = 'completed'
        AND s.customerName IS NOT NULL
        ${dateFilter}
        GROUP BY s.customerId, s.customerName
        ORDER BY totalSpent DESC
        OFFSET 0 ROWS FETCH NEXT :limit ROWS ONLY
      `, {
        type: QueryTypes.SELECT,
        replacements
      });

      // Get summary
      const summary = await sequelize.query(`
        SELECT 
          COUNT(DISTINCT s.customerId) as totalCustomers
        FROM sales s
        WHERE s.businessId = :businessId 
        AND s.status = 'completed'
        AND s.customerId IS NOT NULL
        ${dateFilter}
      `, {
        type: QueryTypes.SELECT,
        replacements
      });

      // Get repeat customers
      const repeatCustomers = await sequelize.query(`
        SELECT COUNT(DISTINCT customerId) as repeatCustomers
        FROM (
          SELECT customerId, COUNT(*) as orderCount
          FROM sales 
          WHERE businessId = :businessId 
          AND status = 'completed'
          AND customerId IS NOT NULL
          ${subqueryDateFilter}
          GROUP BY customerId
          HAVING COUNT(*) > 1
        ) repeatCustomers
      `, {
        type: QueryTypes.SELECT,
        replacements
      });

      // Get average customer value
      const avgCustomerValue = await sequelize.query(`
        SELECT AVG(totalSpent) as averageCustomerValue
        FROM (
          SELECT customerId, SUM(totalAmount) as totalSpent
          FROM sales 
          WHERE businessId = :businessId 
          AND status = 'completed'
          AND customerId IS NOT NULL
          ${subqueryDateFilter}
          GROUP BY customerId
        ) customerTotals
      `, {
        type: QueryTypes.SELECT,
        replacements
      });

      const summaryData = summary[0] as any || { totalCustomers: 0 };
      const repeatCustomersData = repeatCustomers[0] as any || { repeatCustomers: 0 };
      const avgCustomerValueData = avgCustomerValue[0] as any || { averageCustomerValue: 0 };
      
      return {
        topCustomers,
        summary: {
          ...summaryData,
          repeatCustomers: repeatCustomersData.repeatCustomers,
          averageCustomerValue: avgCustomerValueData.averageCustomerValue
        }
      };
    } catch (error) {
      logger(`Error getting customer analytics: ${error}`);
      throw error;
    }
  }
} 