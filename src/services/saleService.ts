import { SaleModel, OrderItemModel, UserModel, ItemModel } from '../models';
import { SaleAttributes, SaleCreationAttributes } from '../models';
import { QueryTypes } from 'sequelize';

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
  /**
   * Create a new sale
   */
  static async createSale(saleData: SaleCreationAttributes): Promise<SaleAttributes> {
    // Validate required fields
    if (!saleData.userId || saleData.subtotal === undefined || saleData.total === undefined) {
      throw new Error('Missing required fields: userId, subtotal, total');
    }

    const sale = await SaleModel.create(saleData);
    return sale.toJSON();
  }

  /**
   * Get sale by ID
   */
  static async getSaleById(id: number): Promise<SaleAttributes | null> {
    const sale = await SaleModel.findByPk(id);
    if (!sale) return null;
    return sale.toJSON();
  }

  /**
   * Get all sales with optional filtering and pagination
   */
  static async getAllSales(filters: SaleFilters = {}): Promise<SaleAttributes[]> {
    const {
      page = 1,
      limit = 50,
      status,
      userId,
      startDate,
      endDate
    } = filters;

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
  }

  /**
   * Update sale by ID
   */
  static async updateSale(id: number, updateData: Partial<SaleAttributes>): Promise<SaleAttributes | null> {
    const sale = await SaleModel.findByPk(id);
    if (!sale) {
      return null;
    }

    await sale.update(updateData);
    return sale.toJSON();
  }

  /**
   * Delete sale by ID
   */
  static async deleteSale(id: number): Promise<boolean> {
    const sale = await SaleModel.findByPk(id);
    if (!sale) {
      return false;
    }

    await sale.destroy();
    return true;
  }

  /**
   * Get sales by user ID
   */
  static async getSalesByUser(userId: number): Promise<SaleAttributes[]> {
    const sales = await SaleModel.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      include: []
    });

    return sales.map((sale: SaleModel) => sale.toJSON());
  }

  /**
   * Get sales within a date range
   */
  static async getSalesByDateRange(startDate: Date, endDate: Date): Promise<SaleAttributes[]> {
    const sales = await SaleModel.findAll({
      where: {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      },
      order: [['createdAt', 'DESC']],
      include: []
    });

    return sales.map((sale: SaleModel) => sale.toJSON());
  }

  /**
   * Get sales statistics
   */
  static async getSalesStats(): Promise<SalesStats> {
    try {
      // Get all sales (not just completed) for now to avoid empty results
      const sales = await SaleModel.findAll({
        attributes: ['total', 'createdAt', 'status']
      });

      const totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale.total.toString()), 0);
      const totalTransactions = sales.length;
      const averageOrderValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;

      // Get top selling items with explicit MS SQL Server compatible query
      const sequelize = SaleModel.sequelize || OrderItemModel.sequelize;
      if (!sequelize) {
        throw new Error('Sequelize instance not available');
      }

      // Use raw query for better MS SQL Server compatibility
      // Modified to work even if no sales exist
      const topSellingItems = await sequelize.query(`
        SELECT 
          oi.itemId,
          SUM(oi.quantity) as totalQuantity
        FROM order_items oi
        INNER JOIN sales s ON oi.saleId = s.id
        GROUP BY oi.itemId
        ORDER BY SUM(oi.quantity) DESC
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
      throw error;
    }
  }

  /**
   * Create a complete sale with order items
   */
  static async createSaleWithItems(
    saleData: SaleCreationAttributes,
    orderItems: Array<{
      itemId: number;
      quantity: number;
      unitPrice: number;
    }>
  ): Promise<SaleAttributes> {
    // Get sequelize instance from any model
    const sequelize = SaleModel.sequelize || OrderItemModel.sequelize;
    if (!sequelize) {
      throw new Error('Sequelize instance not available');
    }

    const transaction = await sequelize.transaction();

    try {
      // Create the sale
      const sale = await SaleModel.create(saleData, { transaction });

      // Create order items
      const orderItemPromises = orderItems.map(item => 
        OrderItemModel.create({
          saleId: sale.id,
          businessId: saleData.businessId,
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice
        }, { transaction })
      );

      await Promise.all(orderItemPromises);

      // Update item stock
      const stockUpdatePromises = orderItems.map(async item => {
        const itemModel = await ItemModel.findByPk(item.itemId);
        if (itemModel) {
          const newStock = Math.max(0, itemModel.stock - item.quantity);
          await itemModel.update({ stock: newStock }, { transaction });
        }
      });

      await Promise.all(stockUpdatePromises);

      await transaction.commit();
      return sale.toJSON();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get sale with order items
   */
  static async getSaleWithItems(id: number): Promise<any> {
    const sale = await SaleModel.findByPk(id, {
      include: [
        {
          model: OrderItemModel,
          as: 'orderItems',
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
  }

  /**
   * Calculate sale totals
   */
  static calculateSaleTotals(
    items: Array<{ quantity: number; unitPrice: number }>,
    taxRate: number = 0.10,
    discount: number = 0
  ): { subtotal: number; tax: number; total: number } {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * taxRate;
    const total = subtotal + tax - discount;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  }
} 