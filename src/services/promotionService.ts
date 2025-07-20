import { PromotionModel, PromotionAttributes, PromotionCreationAttributes } from '../models/PromotionModel';
import { PromotionItemModel } from '../models/PromotionItemModel';
import { ItemModel } from '../models/ItemModel';
import { RecipeModel } from '../models/RecipeModel';
import { Op } from 'sequelize';
import { logger } from '../utils/logger';

export class PromotionService {
  /**
   * Create a new promotion
   */
  public static async createPromotion(promotionData: PromotionCreationAttributes): Promise<PromotionModel> {
    try {
      logger(`Creating promotion: ${promotionData.name} for business ${promotionData.businessId}`);
      
      const promotion = await PromotionModel.create(promotionData);
      
      logger(`Promotion created successfully with ID: ${promotion.id}`);
      return promotion;
    } catch (error) {
      logger(`Error creating promotion: ${error}`);
      throw error;
    }
  }

  /**
   * Get promotion by ID
   */
  public static async getPromotionById(id: number, businessId: number): Promise<PromotionModel | null> {
    try {
      logger(`Getting promotion: ${id} for business ${businessId}`);
      
      const promotion = await PromotionModel.findOne({
        where: { id, businessId }
      });
      
      if (promotion) {
        logger(`Found promotion: ${promotion.name}`);
      } else {
        logger(`Promotion not found: ${id}`);
      }
      
      return promotion;
    } catch (error) {
      logger(`Error getting promotion: ${error}`);
      throw error;
    }
  }

  /**
   * Get all promotions with pagination and filtering
   */
  public static async getAllPromotions(filters: any = {}): Promise<{ promotions: PromotionModel[], pagination: any }> {
    try {
      const { page = 1, limit = 20, businessId, isActive, discountType, search } = filters;
      const offset = (page - 1) * limit;
      
      logger(`Getting promotions for business ${businessId} with filters: ${JSON.stringify(filters)}`);
      
      const whereClause: any = { businessId };
      
      if (isActive !== undefined) {
        whereClause.isActive = isActive;
      }
      
      if (discountType) {
        whereClause.discountType = discountType;
      }
      
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }
      
      const { count, rows: promotions } = await PromotionModel.findAndCountAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      });
      
      const totalPages = Math.ceil(count / limit);
      
      logger(`Found ${promotions.length} promotions for business ${businessId}`);
      
      return {
        promotions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages
        }
      };
    } catch (error) {
      logger(`Error getting promotions: ${error}`);
      throw error;
    }
  }

  /**
   * Update promotion
   */
  public static async updatePromotion(id: number, businessId: number, updateData: Partial<PromotionAttributes>): Promise<PromotionModel | null> {
    try {
      logger(`Updating promotion: ${id} for business ${businessId}`);
      
      const promotion = await PromotionModel.findOne({
        where: { id, businessId }
      });
      
      if (!promotion) {
        logger(`Promotion not found: ${id}`);
        return null;
      }
      
      await promotion.update(updateData);
      
      logger(`Promotion updated successfully: ${id}`);
      return promotion;
    } catch (error) {
      logger(`Error updating promotion: ${error}`);
      throw error;
    }
  }

  /**
   * Delete promotion (soft delete)
   */
  public static async deletePromotion(id: number, businessId: number): Promise<boolean> {
    try {
      logger(`Deleting promotion: ${id} for business ${businessId}`);
      
      const promotion = await PromotionModel.findOne({
        where: { id, businessId }
      });
      
      if (!promotion) {
        logger(`Promotion not found: ${id}`);
        return false;
      }
      
      await promotion.update({ isActive: false });
      
      logger(`Promotion deleted successfully: ${id}`);
      return true;
    } catch (error) {
      logger(`Error deleting promotion: ${error}`);
      throw error;
    }
  }

  /**
   * Search promotions
   */
  public static async searchPromotions(query: string, businessId: number, limit: number = 50): Promise<PromotionModel[]> {
    try {
      logger(`Searching promotions with query: "${query}" for business ${businessId}`);
      
      const promotions = await PromotionModel.findAll({
        where: {
          businessId,
          isActive: true,
          [Op.or]: [
            { name: { [Op.like]: `%${query}%` } },
            { description: { [Op.like]: `%${query}%` } }
          ]
        },
        order: [['name', 'ASC']],
        limit
      });
      
      logger(`Found ${promotions.length} promotions matching "${query}" for business ${businessId}`);
      return promotions;
    } catch (error) {
      logger(`Error searching promotions: ${error}`);
      throw error;
    }
  }

  /**
   * Get active promotions
   */
  public static async getActivePromotions(businessId: number): Promise<PromotionModel[]> {
    try {
      logger(`Getting active promotions for business ${businessId}`);
      
      const now = new Date();
      const promotions = await PromotionModel.findAll({
        where: {
          businessId,
          isActive: true,
          startDate: { [Op.lte]: now },
          endDate: { [Op.gte]: now }
        },
        order: [['createdAt', 'DESC']]
      });
      
      logger(`Found ${promotions.length} active promotions for business ${businessId}`);
      return promotions;
    } catch (error) {
      logger(`Error getting active promotions: ${error}`);
      throw error;
    }
  }

  /**
   * Get promotion statistics
   */
  public static async getPromotionStats(businessId: number): Promise<any> {
    try {
      logger(`Getting promotion statistics for business ${businessId}`);
      
      const [
        totalPromotions,
        activePromotions,
        expiredPromotions,
        scheduledPromotions,
        discountTypeStats
      ] = await Promise.all([
        PromotionModel.count({ where: { businessId } }),
        PromotionModel.count({
          where: {
            businessId,
            isActive: true,
            startDate: { [Op.lte]: new Date() },
            endDate: { [Op.gte]: new Date() }
          }
        }),
        PromotionModel.count({
          where: {
            businessId,
            endDate: { [Op.lt]: new Date() }
          }
        }),
        PromotionModel.count({
          where: {
            businessId,
            isActive: true,
            startDate: { [Op.gt]: new Date() }
          }
        }),
        PromotionModel.findAll({
          where: { businessId },
          attributes: [
            'discountType',
            [PromotionModel.sequelize!.fn('COUNT', PromotionModel.sequelize!.col('id')), 'count']
          ],
          group: ['discountType']
        })
      ]);
      
      const stats = {
        totalPromotions,
        activePromotions,
        expiredPromotions,
        scheduledPromotions,
        discountTypeBreakdown: discountTypeStats.reduce((acc: any, stat: any) => {
          acc[stat.discountType] = parseInt(stat.get('count'));
          return acc;
        }, {})
      };
      
      logger(`Promotion statistics for business ${businessId}: ${JSON.stringify(stats)}`);
      return stats;
    } catch (error) {
      logger(`Error getting promotion statistics: ${error}`);
      throw error;
    }
  }

  /**
   * Add items to promotion
   */
  public static async addPromotionItems(promotionId: number, businessId: number, items: Array<{ itemId?: number, recipeId?: number }>): Promise<PromotionItemModel[]> {
    try {
      logger(`Adding ${items.length} items to promotion ${promotionId} for business ${businessId}`);
      
      // Verify promotion exists and belongs to business
      const promotion = await PromotionModel.findOne({
        where: { id: promotionId, businessId }
      });
      
      if (!promotion) {
        throw new Error('Promotion not found');
      }
      
      // Validate items exist
      for (const item of items) {
        if (item.itemId) {
          const itemExists = await ItemModel.findOne({
            where: { id: item.itemId, businessId }
          });
          if (!itemExists) {
            throw new Error(`Item ${item.itemId} not found`);
          }
        }
        
        if (item.recipeId) {
          const recipeExists = await RecipeModel.findOne({
            where: { id: item.recipeId, businessId }
          });
          if (!recipeExists) {
            throw new Error(`Recipe ${item.recipeId} not found`);
          }
        }
      }
      
      // Create promotion items
      const promotionItems = await PromotionItemModel.bulkCreate(
        items.map(item => {
          const promotionItem: any = { promotionId };
          if (item.itemId) promotionItem.itemId = item.itemId;
          if (item.recipeId) promotionItem.recipeId = item.recipeId;
          return promotionItem;
        })
      );
      
      logger(`Successfully added ${promotionItems.length} items to promotion ${promotionId}`);
      return promotionItems;
    } catch (error) {
      logger(`Error adding promotion items: ${error}`);
      throw error;
    }
  }

  /**
   * Get promotion items
   */
  public static async getPromotionItems(promotionId: number, businessId: number): Promise<any[]> {
    try {
      logger(`Getting items for promotion ${promotionId} for business ${businessId}`);
      
      // Verify promotion exists and belongs to business
      const promotion = await PromotionModel.findOne({
        where: { id: promotionId, businessId }
      });
      
      if (!promotion) {
        throw new Error('Promotion not found');
      }
      
      const promotionItems = await PromotionItemModel.findAll({
        where: { promotionId },
        include: [
          {
            model: ItemModel,
            as: 'item',
            attributes: ['id', 'name', 'description', 'price', 'imageUrl']
          },
          {
            model: RecipeModel,
            as: 'recipe',
            attributes: ['id', 'name', 'description', 'imageUrl']
          }
        ]
      });
      
      logger(`Found ${promotionItems.length} items for promotion ${promotionId}`);
      return promotionItems;
    } catch (error) {
      logger(`Error getting promotion items: ${error}`);
      throw error;
    }
  }

  /**
   * Remove items from promotion
   */
  public static async removePromotionItems(promotionId: number, businessId: number, itemIds: number[]): Promise<boolean> {
    try {
      logger(`Removing ${itemIds.length} items from promotion ${promotionId} for business ${businessId}`);
      
      // Verify promotion exists and belongs to business
      const promotion = await PromotionModel.findOne({
        where: { id: promotionId, businessId }
      });
      
      if (!promotion) {
        throw new Error('Promotion not found');
      }
      
      const deletedCount = await PromotionItemModel.destroy({
        where: {
          promotionId,
          id: { [Op.in]: itemIds }
        }
      });
      
      logger(`Successfully removed ${deletedCount} items from promotion ${promotionId}`);
      return deletedCount > 0;
    } catch (error) {
      logger(`Error removing promotion items: ${error}`);
      throw error;
    }
  }
} 