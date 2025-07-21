import { Transaction, Op } from 'sequelize';
import { getSequelize } from '../models/sequelize';
import { PromotionModel } from '../models/PromotionModel';

export interface PromotionUsageRequest {
  promotionId: number;
  businessId: number;
  customerId?: number;
  quantity?: number;
}

export interface PromotionUsageResult {
  success: boolean;
  promotionId: number;
  promotionName: string;
  discountApplied: number;
  remainingQuantity: number | null;
  isExpired: boolean;
  message: string;
}

export class PromotionUsageService {
  
  /**
   * Use a promotion and track usage
   */
  static async usePromotion(request: PromotionUsageRequest): Promise<PromotionUsageResult> {
    const sequelize = getSequelize();
    const transaction = await sequelize.transaction();
    
    try {
      // 1. Find the promotion
      const promotion = await PromotionModel.findOne({
        where: { 
          id: request.promotionId, 
          businessId: request.businessId,
          isActive: true
        },
        transaction
      });

      if (!promotion) {
        throw new Error(`Promotion not found or inactive: ${request.promotionId}`);
      }

      // 2. Check if promotion is available
      const now = new Date();
      if (now < promotion.startDate || now > promotion.endDate) {
        return {
          success: false,
          promotionId: promotion.id,
          promotionName: promotion.name,
          discountApplied: 0,
          remainingQuantity: promotion.getRemainingQuantity(),
          isExpired: true,
          message: 'Promotion has expired or not yet started'
        };
      }

      // 3. Check quantity availability
      if (promotion.totalQuantity !== null && promotion.usedQuantity >= (promotion.totalQuantity || 0)) {
        return {
          success: false,
          promotionId: promotion.id,
          promotionName: promotion.name,
          discountApplied: 0,
          remainingQuantity: 0,
          isExpired: false,
          message: 'Promotion is sold out'
        };
      }

      // 4. Check customer usage limits (if applicable)
      if (request.customerId && promotion.maxUsesPerCustomer !== null) {
        // In a real implementation, you'd check customer usage history
        // For now, we'll assume unlimited per customer
      }

      // 5. Update promotion usage
      const newUsedQuantity = promotion.usedQuantity + (request.quantity || 1);
      
      await promotion.update({
        usedQuantity: newUsedQuantity,
        isActive: promotion.totalQuantity === null || newUsedQuantity < (promotion.totalQuantity || 0)
      }, { transaction });

      // 6. Calculate discount (simplified - in real app this would be based on order total)
      const discountApplied = promotion.calculateDiscount(100); // Example with $100 order

      await transaction.commit();

      return {
        success: true,
        promotionId: promotion.id,
        promotionName: promotion.name,
        discountApplied,
        remainingQuantity: promotion.getRemainingQuantity(),
        isExpired: false,
        message: 'Promotion applied successfully'
      };

    } catch (error) {
      await transaction.rollback();
      console.error('Error using promotion:', error);
      throw error;
    }
  }

  /**
   * Get available promotions for a business
   */
  static async getAvailablePromotions(businessId: number): Promise<PromotionModel[]> {
    const now = new Date();
    
    return await PromotionModel.findAll({
      where: {
        businessId,
        isActive: true,
        startDate: { [Op.lte]: now },
        endDate: { [Op.gte]: now }
      },
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Get promotions linked to a specific recipe
   */
  static async getRecipePromotions(businessId: number, recipeId: number): Promise<PromotionModel[]> {
    return await PromotionModel.findAll({
      where: {
        businessId,
        recipeId,
        isActive: true
      },
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Expire promotions that have reached their quantity limit
   */
  static async expireSoldOutPromotions(): Promise<number> {
    const sequelize = getSequelize();
    const [updatedCount] = await PromotionModel.update(
      { isActive: false },
      {
        where: {
          isActive: true,
          totalQuantity: { [Op.ne]: null },
          usedQuantity: { [Op.gte]: sequelize.col('totalQuantity') }
        }
      }
    );

    return updatedCount;
  }
} 