import { Op, fn, col } from 'sequelize';
import { ItemModel } from '../models/ItemModel';
import { RecipeModel } from '../models/RecipeModel';
import { RecipeSuggestionModel } from '../models/RecipeSuggestionModel';

export interface SmartSuggestionCriteria {
  businessId: number;
  includeExpiringItems?: boolean;
  includeUnderperformingItems?: boolean;
  maxDaysToExpiry?: number;
  minSalesVelocity?: number;
  maxDaysSinceLastSale?: number;
  limit?: number;
}

export interface RecipeSuggestion {
  recipeId: number;
  recipeName: string;
  recipeDescription: string;
  recipeDifficulty: string;
  prepTime: number;
  cookTime: number;
  imageUrl?: string;
  suggestedItems: Array<{
    itemId: number;
    itemName: string;
    currentStock: number;
    expirationDate?: Date | undefined;
    daysToExpiry?: number | undefined;
    salesVelocity?: number | undefined;
    daysSinceLastSale?: number | undefined;
    reason: string;
  }>;
  confidence: number;
  totalPotentialSavings: number;
  urgency: 'high' | 'medium' | 'low';
}

export class SmartRecipeSuggestionService {
  
  /**
   * Get smart recipe suggestions based on inventory management
   */
  static async getSmartSuggestions(criteria: SmartSuggestionCriteria): Promise<RecipeSuggestion[]> {
    try {
      const {
        businessId,
        includeExpiringItems = true,
        includeUnderperformingItems = true,
        maxDaysToExpiry = 7,
        minSalesVelocity = 0.1,
        maxDaysSinceLastSale = 30,
        limit = 10
      } = criteria;

      // Get items that need attention
      const itemsToUse = await this.getItemsNeedingAttention(businessId, {
        includeExpiringItems,
        includeUnderperformingItems,
        maxDaysToExpiry,
        minSalesVelocity,
        maxDaysSinceLastSale
      });

      if (itemsToUse.length === 0) {
        console.log(`No items needing attention found for business ${businessId}`);
        return [];
      }

      // Get all recipes for the business
      console.log(`Looking for recipes for business ${businessId}`);
      let recipes = [];
      try {
        recipes = await RecipeModel.findAll({
          where: { businessId, isActive: true }
        });
      } catch (dbError) {
        console.error('Database error getting recipes:', dbError);
        return [];
      }

      console.log(`Found ${recipes.length} recipes for business ${businessId}`);
      if (recipes.length === 0) {
        console.log(`No active recipes found for business ${businessId}`);
        return [];
      }

      const suggestions: RecipeSuggestion[] = [];

      // Analyze each recipe for potential matches
      for (const recipe of recipes) {
        try {
          const recipeIngredients = this.parseIngredients(recipe.ingredients);
          const matchingItems = this.findMatchingItems(itemsToUse, recipeIngredients);
          
          if (matchingItems.length > 0) {
            const suggestion = await this.createSuggestion(recipe, matchingItems);
            suggestions.push(suggestion);
          }
        } catch (recipeError) {
          console.error(`Error processing recipe ${recipe.id}:`, recipeError);
          // Continue with other recipes instead of failing completely
          continue;
        }
      }

      // Sort by urgency and confidence
      suggestions.sort((a, b) => {
        const urgencyOrder = { high: 3, medium: 2, low: 1 };
        const urgencyDiff = urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
        if (urgencyDiff !== 0) return urgencyDiff;
        return b.confidence - a.confidence;
      });

      return suggestions.slice(0, limit);
    } catch (error) {
      console.error('Error in getSmartSuggestions:', error);
      // Return empty array instead of throwing error
      return [];
    }
  }

  /**
   * Get items that need attention (expiring or underperforming)
   */
  private static async getItemsNeedingAttention(
    businessId: number,
    options: {
      includeExpiringItems: boolean;
      includeUnderperformingItems: boolean;
      maxDaysToExpiry: number;
      minSalesVelocity: number;
      maxDaysSinceLastSale: number;
    }
  ) {
    try {
      // Get all items for the business first
      let allItems = [];
      try {
        allItems = await ItemModel.findAll({
          where: {
            businessId,
            isActive: true,
            stock: { [Op.gt]: 0 }
          }
        });
      } catch (dbError) {
        console.error('Database error in getItemsNeedingAttention:', dbError);
        return [];
      }

      // Filter items based on criteria
      const filteredItems = allItems.filter(item => {
        const orConditions = [];

        if (options.includeExpiringItems && item.isExpiringSoon) {
          if (item.expirationDate) {
            const daysToExpiry = Math.ceil((new Date(item.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            if (daysToExpiry <= options.maxDaysToExpiry) {
              orConditions.push(true);
            }
          }
        }

        if (options.includeUnderperformingItems) {
          if ((item.salesVelocity && item.salesVelocity < options.minSalesVelocity) ||
              (item.daysSinceLastSale && item.daysSinceLastSale > options.maxDaysSinceLastSale)) {
            orConditions.push(true);
          }
        }

        return orConditions.length > 0;
      });

      // Sort items
      filteredItems.sort((a, b) => {
        // Sort by expiring soon first
        if (a.isExpiringSoon && !b.isExpiringSoon) return -1;
        if (!a.isExpiringSoon && b.isExpiringSoon) return 1;
        
        // Then by expiration date
        if (a.expirationDate && b.expirationDate) {
          return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
        }
        
        // Then by sales velocity
        if (a.salesVelocity && b.salesVelocity) {
          return a.salesVelocity - b.salesVelocity;
        }
        
        // Then by days since last sale
        if (a.daysSinceLastSale && b.daysSinceLastSale) {
          return b.daysSinceLastSale - a.daysSinceLastSale;
        }
        
        return 0;
      });

      return filteredItems;
    } catch (error) {
      console.error('Error in getItemsNeedingAttention:', error);
      return [];
    }
  }

  /**
   * Parse recipe ingredients into searchable terms
   */
  private static parseIngredients(ingredients: string | null | undefined): string[] {
    if (!ingredients || typeof ingredients !== 'string') {
      return [];
    }
    
    return ingredients
      .toLowerCase()
      .split(/[,;]/)
      .map(ingredient => ingredient.trim())
      .filter(ingredient => ingredient.length > 0)
      .map(ingredient => {
        // Remove common words and quantities
        return ingredient
          .replace(/\d+\s*(g|kg|ml|l|oz|lb|cup|tbsp|tsp)/g, '')
          .replace(/\b(a|an|the|of|with|and|or)\b/g, '')
          .trim();
      })
      .filter(ingredient => ingredient.length > 2);
  }

  /**
   * Find items that match recipe ingredients
   */
  private static findMatchingItems(items: any[], recipeIngredients: string[]): any[] {
    const matchingItems: any[] = [];

    for (const item of items) {
      const itemName = item.name.toLowerCase();
      const itemDescription = (item.description || '').toLowerCase();
      
      for (const ingredient of recipeIngredients) {
        if (itemName.includes(ingredient) || itemDescription.includes(ingredient)) {
          matchingItems.push({
            ...item.toJSON(),
            reason: this.getReasonForInclusion(item)
          });
          break; // Only include each item once per recipe
        }
      }
    }

    return matchingItems;
  }

  /**
   * Get reason why item is being suggested
   */
  private static getReasonForInclusion(item: any): string {
    if (item.isExpiringSoon && item.expirationDate) {
      const daysToExpiry = Math.ceil((new Date(item.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return `Expires in ${daysToExpiry} days`;
    }
    
    if (item.salesVelocity < 0.1) {
      return 'Low sales velocity';
    }
    
    if (item.daysSinceLastSale > 30) {
      return `Not sold in ${item.daysSinceLastSale} days`;
    }
    
    return 'Inventory optimization';
  }

  /**
   * Create a recipe suggestion with confidence scoring
   */
  private static async createSuggestion(recipe: any, matchingItems: any[]): Promise<RecipeSuggestion> {
    try {
      let confidence = 0;
      let totalPotentialSavings = 0;
      let urgencyScore = 0;

      const suggestedItems = matchingItems.map(item => {
        let itemConfidence = 0.5; // Base confidence
        let itemSavings = 0;
        let itemUrgency = 0;

        // Calculate confidence based on item characteristics
        if (item.isExpiringSoon && item.expirationDate) {
          try {
            const daysToExpiry = Math.ceil((new Date(item.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            itemConfidence += 0.3;
            itemUrgency += Math.max(0, 7 - daysToExpiry) * 0.1; // Higher urgency for items expiring sooner
            itemSavings += (item.cost || 0) * (item.stock || 0) * 0.8; // Potential loss if not used
          } catch (dateError) {
            console.error('Error calculating days to expiry:', dateError);
          }
        }

        if ((item.salesVelocity || 0) < 0.1) {
          itemConfidence += 0.2;
          itemUrgency += 0.2;
          itemSavings += (item.cost || 0) * (item.stock || 0) * 0.5; // Potential loss from slow-moving inventory
        }

        if ((item.daysSinceLastSale || 0) > 30) {
          itemConfidence += 0.2;
          itemUrgency += 0.3;
          itemSavings += (item.cost || 0) * (item.stock || 0) * 0.6; // Potential loss from stale inventory
        }

        confidence += itemConfidence;
        totalPotentialSavings += itemSavings;
        urgencyScore += itemUrgency;

        return {
          itemId: item.id || 0,
          itemName: item.name || 'Unknown Item',
          currentStock: item.stock || 0,
          expirationDate: item.expirationDate,
          daysToExpiry: item.expirationDate ? 
            Math.ceil((new Date(item.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 
            undefined,
          salesVelocity: item.salesVelocity || 0,
          daysSinceLastSale: item.daysSinceLastSale || 0,
          reason: item.reason || 'Inventory optimization'
        };
      });

      // Normalize confidence
      confidence = matchingItems.length > 0 ? Math.min(1.0, confidence / matchingItems.length) : 0;

      // Determine urgency level
      let urgency: 'high' | 'medium' | 'low' = 'low';
      if (urgencyScore > 0.5) urgency = 'high';
      else if (urgencyScore > 0.2) urgency = 'medium';

      return {
        recipeId: recipe.id || 0,
        recipeName: recipe.name || 'Unknown Recipe',
        recipeDescription: recipe.description || '',
        recipeDifficulty: recipe.difficulty || 'medium',
        prepTime: recipe.prepTime || 0,
        cookTime: recipe.cookTime || 0,
        imageUrl: recipe.imageUrl,
        suggestedItems,
        confidence,
        totalPotentialSavings,
        urgency
      };
    } catch (error) {
      console.error('Error creating suggestion:', error);
      // Return a basic suggestion instead of failing
      return {
        recipeId: recipe.id || 0,
        recipeName: recipe.name || 'Unknown Recipe',
        recipeDescription: recipe.description || '',
        recipeDifficulty: recipe.difficulty || 'medium',
        prepTime: recipe.prepTime || 0,
        cookTime: recipe.cookTime || 0,
        imageUrl: recipe.imageUrl,
        suggestedItems: [],
        confidence: 0,
        totalPotentialSavings: 0,
        urgency: 'low'
      };
    }
  }

  /**
   * Update item inventory tracking data
   */
  static async updateItemTracking(businessId: number): Promise<void> {
    try {
      // Update days since last sale
      const { getSequelize } = await import('../models/sequelize');
      const sequelize = getSequelize();
      await sequelize.query(
        'UPDATE items SET daysSinceLastSale = DATEDIFF(day, lastSoldDate, GETDATE()) WHERE businessId = :businessId AND lastSoldDate IS NOT NULL',
        {
          replacements: { businessId },
          type: require('sequelize').QueryTypes.UPDATE
        }
      );

      // Update expiring soon flag
      await sequelize.query(
        'UPDATE items SET isExpiringSoon = CASE WHEN expirationDate <= DATEADD(day, 7, GETDATE()) THEN 1 ELSE 0 END WHERE businessId = :businessId AND expirationDate IS NOT NULL',
        {
          replacements: { businessId },
          type: require('sequelize').QueryTypes.UPDATE
        }
      );

      // Update underperforming flag
      await sequelize.query(
        'UPDATE items SET isUnderperforming = CASE WHEN salesVelocity < 0.1 OR daysSinceLastSale > 30 THEN 1 ELSE 0 END WHERE businessId = :businessId',
        {
          replacements: { businessId },
          type: require('sequelize').QueryTypes.UPDATE
        }
      );
    } catch (error) {
      console.error('Error updating item tracking:', error);
      // Don't throw error, just log it
    }
  }

  /**
   * Get inventory summary for dashboard
   */
  static async getInventorySummary(businessId: number) {
    try {
      // Get all items for the business
      let allItems = [];
      try {
        allItems = await ItemModel.findAll({
          where: { businessId, isActive: true },
          attributes: ['id', 'stock', 'minStock', 'isExpiringSoon', 'isUnderperforming']
        });
      } catch (dbError) {
        console.error('Database error in getInventorySummary:', dbError);
        return {
          expiringItems: 0,
          underperformingItems: 0,
          lowStockItems: 0,
          totalItems: 0,
          expiringPercentage: 0,
          underperformingPercentage: 0
        };
      }

      const totalItems = allItems.length;
      const expiringItems = allItems.filter(item => item.isExpiringSoon && (item.stock || 0) > 0).length;
      const underperformingItems = allItems.filter(item => item.isUnderperforming && (item.stock || 0) > 0).length;
      const lowStockItems = allItems.filter(item => (item.stock || 0) < (item.minStock || 0)).length;

      return {
        expiringItems,
        underperformingItems,
        lowStockItems,
        totalItems,
        expiringPercentage: totalItems > 0 ? (expiringItems / totalItems) * 100 : 0,
        underperformingPercentage: totalItems > 0 ? (underperformingItems / totalItems) * 100 : 0
      };
    } catch (error) {
      console.error('Error in getInventorySummary:', error);
      // Return default values instead of throwing error
      return {
        expiringItems: 0,
        underperformingItems: 0,
        lowStockItems: 0,
        totalItems: 0,
        expiringPercentage: 0,
        underperformingPercentage: 0
      };
    }
  }
} 