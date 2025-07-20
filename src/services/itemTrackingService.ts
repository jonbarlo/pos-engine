import { Op, fn, col, literal } from 'sequelize';
import { ItemModel } from '../models/ItemModel';
import { SaleItemModel } from '../models/SaleItemModel';
import { SaleModel } from '../models/SaleModel';

export class ItemTrackingService {
  
  /**
   * Update item tracking data when a sale occurs
   */
  static async updateItemTrackingOnSale(saleId: number): Promise<void> {
    try {
      // Get all items in the sale
      const saleItems = await SaleItemModel.findAll({
        where: { saleId },
        include: [
          {
            model: SaleModel,
            as: 'sale',
            attributes: ['createdAt']
          }
        ]
      });

      for (const saleItem of saleItems) {
        const sale = (saleItem as any).sale;
        if (sale) {
          await this.updateItemTracking(saleItem.itemId, saleItem.quantity, sale.createdAt);
        }
      }
    } catch (error) {
      console.error('Error updating item tracking on sale:', error);
      throw error;
    }
  }

  /**
   * Update tracking data for a specific item
   */
  static async updateItemTracking(itemId: number, quantitySold: number, saleDate: Date): Promise<void> {
    try {
      const item = await ItemModel.findByPk(itemId);
      if (!item) {
        console.warn(`Item ${itemId} not found for tracking update`);
        return;
      }

      // Update last sold date
      await item.update({
        lastSoldDate: saleDate
      });

      // Recalculate sales velocity (average daily sales over last 30 days)
      await this.recalculateSalesVelocity(itemId);
      
      // Update days since last sale
      await this.updateDaysSinceLastSale(itemId);
      
      // Update flags
      await this.updateItemFlags(itemId);
      
    } catch (error) {
      console.error(`Error updating tracking for item ${itemId}:`, error);
      throw error;
    }
  }

  /**
   * Recalculate sales velocity for an item
   */
  private static async recalculateSalesVelocity(itemId: number): Promise<void> {
    try {
      // Get sales data for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const salesData = await SaleItemModel.findAll({
        where: {
          itemId,
          createdAt: {
            [Op.gte]: thirtyDaysAgo
          }
        },
        attributes: [
          [fn('SUM', col('quantity')), 'totalQuantity'],
          [fn('COUNT', col('id')), 'saleCount']
        ],
        raw: true
      });

      if (salesData.length > 0 && salesData[0] && (salesData[0] as any).totalQuantity) {
        const totalQuantity = parseFloat((salesData[0] as any).totalQuantity as string);
        const salesVelocity = totalQuantity / 30; // Average daily sales

        await ItemModel.update(
          { salesVelocity },
          { where: { id: itemId } }
        );
      } else {
        // No sales in last 30 days
        await ItemModel.update(
          { salesVelocity: 0 },
          { where: { id: itemId } }
        );
      }
    } catch (error) {
      console.error(`Error recalculating sales velocity for item ${itemId}:`, error);
    }
  }

  /**
   * Update days since last sale
   */
  private static async updateDaysSinceLastSale(itemId: number): Promise<void> {
    try {
      const { getSequelize } = await import('../models/sequelize');
      const sequelize = getSequelize();
      await sequelize.query(
        'UPDATE items SET daysSinceLastSale = DATEDIFF(day, lastSoldDate, GETDATE()) WHERE id = :itemId AND lastSoldDate IS NOT NULL',
        {
          replacements: { itemId },
          type: require('sequelize').QueryTypes.UPDATE
        }
      );
    } catch (error) {
      console.error(`Error updating days since last sale for item ${itemId}:`, error);
    }
  }

  /**
   * Update item flags (isUnderperforming, isExpiringSoon)
   */
  private static async updateItemFlags(itemId: number): Promise<void> {
    try {
      const { getSequelize } = await import('../models/sequelize');
      const sequelize = getSequelize();
      
      // Update expiring soon flag
      await sequelize.query(
        'UPDATE items SET isExpiringSoon = CASE WHEN expirationDate <= DATEADD(day, 7, GETDATE()) THEN 1 ELSE 0 END WHERE id = :itemId AND expirationDate IS NOT NULL',
        {
          replacements: { itemId },
          type: require('sequelize').QueryTypes.UPDATE
        }
      );

      // Update underperforming flag
      await sequelize.query(
        'UPDATE items SET isUnderperforming = CASE WHEN salesVelocity < 0.1 OR daysSinceLastSale > 30 THEN 1 ELSE 0 END WHERE id = :itemId',
        {
          replacements: { itemId },
          type: require('sequelize').QueryTypes.UPDATE
        }
      );
    } catch (error) {
      console.error(`Error updating flags for item ${itemId}:`, error);
    }
  }

  /**
   * Set item as perishable and add expiration date
   */
  static async setItemPerishable(
    itemId: number, 
    expirationDate: Date, 
    manufacturingDate?: Date, 
    shelfLifeDays?: number
  ): Promise<void> {
    try {
      const updateData: any = {
        isPerishable: true,
        expirationDate
      };

      if (manufacturingDate) {
        updateData.manufacturingDate = manufacturingDate;
      }

      if (shelfLifeDays) {
        updateData.shelfLifeDays = shelfLifeDays;
      }

      await ItemModel.update(updateData, { where: { id: itemId } });
      
      // Update flags after setting expiration date
      await this.updateItemFlags(itemId);
      
    } catch (error) {
      console.error(`Error setting item ${itemId} as perishable:`, error);
      throw error;
    }
  }

  /**
   * Get items that need attention (for notifications)
   */
  static async getItemsNeedingAttention(businessId: number): Promise<{
    expiringSoon: any[];
    underperforming: any[];
    lowStock: any[];
  }> {
    try {
      const [expiringSoon, underperforming, lowStock] = await Promise.all([
        // Items expiring in next 3 days
        ItemModel.findAll({
          where: {
            businessId,
            isActive: true,
            stock: { [Op.gt]: 0 },
            expirationDate: {
              [Op.lte]: literal('DATEADD(day, 3, GETDATE())')
            }
          },
          order: [['expirationDate', 'ASC']]
        }),

        // Underperforming items with high stock
        ItemModel.findAll({
          where: {
            businessId,
            isActive: true,
            stock: { [Op.gt]: 10 },
            [Op.or]: [
              { salesVelocity: { [Op.lt]: 0.1 } },
              { daysSinceLastSale: { [Op.gt]: 30 } }
            ]
          },
          order: [['stock', 'DESC']]
        }),

        // Items below minimum stock
        ItemModel.findAll({
          where: {
            businessId,
            isActive: true,
            stock: { [Op.lt]: col('minStock') }
          },
          order: [['stock', 'ASC']]
        })
      ]);

      return {
        expiringSoon,
        underperforming,
        lowStock
      };
    } catch (error) {
      console.error('Error getting items needing attention:', error);
      throw error;
    }
  }

  /**
   * Get inventory health score for a business
   */
  static async getInventoryHealthScore(businessId: number): Promise<{
    score: number;
    totalItems: number;
    healthyItems: number;
    issues: {
      expiringItems: number;
      underperformingItems: number;
      lowStockItems: number;
    };
  }> {
    try {
      const [
        totalItems,
        expiringItems,
        underperformingItems,
        lowStockItems
      ] = await Promise.all([
        ItemModel.count({
          where: { businessId, isActive: true }
        }),
        ItemModel.count({
          where: {
            businessId,
            isActive: true,
            stock: { [Op.gt]: 0 },
            expirationDate: {
              [Op.lte]: literal('DATEADD(day, 7, GETDATE())')
            }
          }
        }),
        ItemModel.count({
          where: {
            businessId,
            isActive: true,
            stock: { [Op.gt]: 0 },
            [Op.or]: [
              { salesVelocity: { [Op.lt]: 0.1 } },
              { daysSinceLastSale: { [Op.gt]: 30 } }
            ]
          }
        }),
        ItemModel.count({
          where: {
            businessId,
            isActive: true,
            stock: { [Op.lt]: col('minStock') }
          }
        })
      ]);

      const issues = expiringItems + underperformingItems + lowStockItems;
      const healthyItems = totalItems - issues;
      const score = totalItems > 0 ? Math.round((healthyItems / totalItems) * 100) : 100;

      return {
        score,
        totalItems,
        healthyItems,
        issues: {
          expiringItems,
          underperformingItems,
          lowStockItems
        }
      };
    } catch (error) {
      console.error('Error calculating inventory health score:', error);
      throw error;
    }
  }
} 