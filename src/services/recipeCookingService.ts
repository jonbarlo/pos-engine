import { Transaction, Op } from 'sequelize';
import { getSequelize } from '../models/sequelize';
import { RecipeModel } from '../models/RecipeModel';
import { ItemModel } from '../models/ItemModel';
import { RecipeCookingHistoryModel, ConsumedItem } from '../models/RecipeCookingHistoryModel';
import { PromotionModel } from '../models/PromotionModel';
import { RecipeSuggestionModel } from '../models/RecipeSuggestionModel';
import { SmartRecipeSuggestionService } from './smartRecipeSuggestionService';

export interface CookingRequest {
  recipeId: number;
  quantity: number;
  businessId: number;
  promotionType?: string;
  promotionName?: string;
  promotionDescription?: string;
  discountType?: 'percentage' | 'fixed' | 'free_item' | 'bogo';
  discountValue?: number;
  promotionExpiresInHours?: number;
}

export interface CookingResult {
  recipeId: number;
  recipeName: string;
  quantity: number;
  consumedItems: ConsumedItem[];
  costSavings: number;
  wasteReduction: number;
  createdPromotionId?: number | undefined;
}

export class RecipeCookingService {
  
  /**
   * Cook a recipe and consume inventory items
   */
  static async cookRecipe(request: CookingRequest): Promise<CookingResult> {
    const sequelize = getSequelize();
    const transaction = await sequelize.transaction();
    
    try {
      // 1. Validate recipe exists and is active
      const recipe = await RecipeModel.findOne({
        where: { 
          id: request.recipeId, 
          businessId: request.businessId, 
          isActive: true 
        },
        transaction
      });

      if (!recipe) {
        throw new Error(`Recipe not found or inactive: ${request.recipeId}`);
      }

      // 2. Get suggested items for this recipe
      const suggestions = await SmartRecipeSuggestionService.getSmartSuggestions({
        businessId: request.businessId,
        limit: 50
      });

      const recipeSuggestion = suggestions.find(s => s.recipeId === request.recipeId);
      if (!recipeSuggestion) {
        throw new Error(`No smart suggestion found for recipe: ${request.recipeId}`);
      }

      // 3. Validate stock availability
      const insufficientItems = [];
      for (const item of recipeSuggestion.suggestedItems) {
        const requiredQuantity = request.quantity;
        if (item.currentStock < requiredQuantity) {
          insufficientItems.push({
            itemId: item.itemId,
            itemName: item.itemName,
            required: requiredQuantity,
            available: item.currentStock
          });
        }
      }

      if (insufficientItems.length > 0) {
        const errorMsg = insufficientItems.map(i => `${i.itemName} (${i.available}/${i.required})`).join(', ');
        throw new Error(`Insufficient stock: ${errorMsg}`);
      }

      // 4. Consume items
      const consumedItems: ConsumedItem[] = [];
      for (const item of recipeSuggestion.suggestedItems) {
        const quantityToConsume = request.quantity;
        
        // Update item stock
        const [updatedRows] = await ItemModel.update(
          { 
            stock: item.currentStock - quantityToConsume,
            updatedAt: new Date()
          },
          {
            where: { 
              id: item.itemId, 
              businessId: request.businessId,
              stock: { [Op.gte]: quantityToConsume }
            },
            transaction
          }
        );

        if (updatedRows === 0) {
          throw new Error(`Failed to update stock for item: ${item.itemName}`);
        }

        // Get updated item for accurate remaining stock
        const updatedItem = await ItemModel.findByPk(item.itemId, { transaction });
        if (!updatedItem) {
          throw new Error(`Item not found after update: ${item.itemId}`);
        }

        consumedItems.push({
          itemId: item.itemId,
          itemName: item.itemName,
          quantityConsumed: quantityToConsume,
          remainingStock: updatedItem.stock,
          originalStock: item.currentStock,
          unitCost: updatedItem.cost || 0 // Use actual item cost from database
        });
      }

      // 5. Calculate savings and waste reduction
      let totalCostSavings = 0;
      let totalWasteReduction = 0;

      for (const item of consumedItems) {
        const itemCost = item.unitCost * item.quantityConsumed;
        totalCostSavings += itemCost;
        totalWasteReduction += itemCost * 0.8; // 80% as waste reduction
      }

      const costSavings = Math.round(totalCostSavings * 100) / 100;
      const wasteReduction = Math.round(totalWasteReduction * 100) / 100;

      // 6. Create cooking history record
      const cookingHistory = await RecipeCookingHistoryModel.create({
        recipeId: request.recipeId,
        businessId: request.businessId,
        quantity: request.quantity,
        consumedItems: JSON.stringify(consumedItems),
        wasteReduction,
        costSavings,
        cookedAt: new Date()
      }, { transaction });

      // 7. Generate promotion if there's waste reduction
      let createdPromotionId: number | undefined;
      console.log('🔍 Checking if promotion should be created. Waste reduction:', wasteReduction);
      if (wasteReduction > 0) {
        try {
          console.log('🔍 Creating promotion for recipe:', recipe.name);
          const promotionName = request.promotionName || `Chef's Special: ${recipe.name}`;
          const promotionDescription = request.promotionDescription || `Freshly prepared ${recipe.name} using premium ingredients`;
          const expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + (request.promotionExpiresInHours || 24), 59, 59, 999);

          const promotion = await PromotionModel.create({
            businessId: request.businessId,
            name: promotionName,
            description: promotionDescription,
            type: request.promotionType || 'discount',
            discountType: request.discountType || 'percentage',
            discountValue: request.discountValue || 20,
            startDate: new Date(),
            endDate: expiresAt,
            isActive: true,
            totalQuantity: request.quantity, // Link promotion quantity to cooked quantity
            usedQuantity: 0,
            recipeId: request.recipeId // Link to the recipe that was cooked
          }, { transaction });

          createdPromotionId = promotion.id;
          console.log('✅ Promotion created successfully with ID:', createdPromotionId);
          
          // Update cooking history with promotion ID
          await cookingHistory.update({ createdPromotionId }, { transaction });
        } catch (promotionError: any) {
          console.error('❌ Error generating promotion:', promotionError);
          console.error('❌ Promotion error details:', {
            message: promotionError.message,
            stack: promotionError.stack
          });
          // Don't fail the cooking process if promotion creation fails
        }
      } else {
        console.log('🔍 No promotion created - waste reduction is 0');
      }

      // 8. Mark recipe suggestions as cooked
      try {
        await RecipeSuggestionModel.update(
          { status: 'cooked' },
          {
            where: {
              businessId: request.businessId,
              recipeId: request.recipeId,
              status: 'pending'
            },
            transaction
          }
        );
        console.log('✅ Marked recipe suggestions as cooked for recipe:', request.recipeId);
      } catch (suggestionError) {
        console.error('❌ Error marking suggestions as cooked:', suggestionError);
        // Don't fail the cooking process if suggestion update fails
      }

      await transaction.commit();

      return {
        recipeId: request.recipeId,
        recipeName: recipe.name,
        quantity: request.quantity,
        consumedItems,
        costSavings,
        wasteReduction,
        createdPromotionId
      };

    } catch (error) {
      await transaction.rollback();
      console.error('Error cooking recipe:', error);
      throw error;
    }
  }

  /**
   * Get cooking history for a business
   */
  static async getCookingHistory(
    businessId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<{
    history: any[];
    total: number;
  }> {
    const { count, rows } = await RecipeCookingHistoryModel.findAndCountAll({
      where: { businessId },
      order: [['cookedAt', 'DESC']],
      limit,
      offset
    });

    return {
      history: rows,
      total: count
    };
  }

  /**
   * Get cooking analytics for a business
   */
  static async getCookingAnalytics(businessId: number): Promise<{
    totalCooked: number;
    totalWasteReduction: number;
    totalCostSavings: number;
    averageEfficiency: number;
  }> {
    const history = await RecipeCookingHistoryModel.findAll({
      where: { businessId },
      order: [['cookedAt', 'DESC']]
    });

    const totalCooked = history.length;
    const totalWasteReduction = history.reduce((sum, h) => sum + h.wasteReduction, 0);
    const totalCostSavings = history.reduce((sum, h) => sum + h.costSavings, 0);
    const averageEfficiency = totalCostSavings > 0 ? (totalWasteReduction / totalCostSavings) * 100 : 0;

    return {
      totalCooked,
      totalWasteReduction: Math.round(totalWasteReduction * 100) / 100,
      totalCostSavings: Math.round(totalCostSavings * 100) / 100,
      averageEfficiency: Math.round(averageEfficiency * 100) / 100
    };
  }
} 