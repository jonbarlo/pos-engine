import { Op, fn, col, QueryTypes } from 'sequelize';
import { ItemModel } from '../models/ItemModel';
import { RecipeModel } from '../models/RecipeModel';
import { RecipeSuggestionModel } from '../models/RecipeSuggestionModel';
//import RecipeIngredientModel from '../models/RecipeIngredientModel';

export interface SmartSuggestionCriteria {
  businessId: number;
  includeExpiringItems?: boolean;
  includeUnderperformingItems?: boolean;
  maxDaysToExpiry?: number;
  minSalesVelocity?: number;
  maxDaysSinceLastSale?: number;
  limit?: number;
  status?: 'pending' | 'cooked' | 'expired' | 'dismissed';
  includeCooked?: boolean;
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
    quantity?: number;
    unit?: string;
    isOptional?: boolean;
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
        limit = 10,
        status = 'pending',
        includeCooked = false
      } = criteria;

      // First, check if we have existing suggestions in the database
      console.log(`Checking for existing suggestions for business ${businessId} with status: ${status}`);
      const existingSuggestions = await this.getExistingSuggestions(businessId, {
        status,
        includeCooked,
        limit
      });

      console.log(`Found ${existingSuggestions.length} existing suggestions`);
      if (existingSuggestions.length > 0) {
        console.log(`Returning ${existingSuggestions.length} existing suggestions with status: ${status}`);
        return existingSuggestions;
      }

      // If no existing suggestions, generate new ones
      console.log('No existing suggestions found, generating new ones...');
      const newSuggestions = await this.generateNewSuggestions(criteria);
      console.log(`Generated ${newSuggestions.length} new suggestions`);
      return newSuggestions;
    } catch (error) {
      console.error('Error in getSmartSuggestions:', error);
      return [];
    }
  }

  /**
   * Get existing suggestions from database with status filtering
   */
  private static async getExistingSuggestions(
    businessId: number, 
    options: { status: string; includeCooked: boolean; limit: number }
  ): Promise<RecipeSuggestion[]> {
    try {
      const { status, includeCooked, limit } = options;
      
      // Build where clause for status filtering
      const statusFilter = includeCooked 
        ? { [Op.or]: [{ status: 'pending' }, { status: 'cooked' }] }
        : { status };

      const suggestions = await RecipeSuggestionModel.findAll({
        where: {
          businessId,
          isActive: true,
          ...statusFilter
        },
        include: [{
          model: RecipeModel,
          as: 'recipe',
          attributes: ['id', 'name', 'description', 'difficulty', 'prepTime', 'cookTime', 'imageUrl']
        }],
        order: [['priority', 'DESC'], ['confidence', 'DESC']],
        limit
      });

      return suggestions.map(suggestion => this.mapSuggestionToRecipeSuggestion(suggestion));
    } catch (error) {
      console.error('Error getting existing suggestions:', error);
      return [];
    }
  }

  /**
   * Generate new smart suggestions based on inventory analysis
   */
  private static async generateNewSuggestions(criteria: SmartSuggestionCriteria): Promise<RecipeSuggestion[]> {
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
      const itemsNeedingAttention = await this.getItemsNeedingAttention(businessId, {
        includeExpiringItems,
        includeUnderperformingItems,
        maxDaysToExpiry,
        minSalesVelocity,
        maxDaysSinceLastSale
      });

      if (itemsNeedingAttention.length === 0) {
        console.log('No items need attention for smart suggestions');
        return [];
      }

      console.log(`Found ${itemsNeedingAttention.length} items needing attention`);

      // Get all recipes for this business with their ingredients
      const recipes = await RecipeModel.findAll({
        where: { businessId, isActive: true },
        include: [{
          model: ItemModel,
          as: 'recipeIngredients',
          through: { 
            attributes: ['quantity', 'unit', 'isOptional']
          },
          where: {
            id: { [Op.in]: itemsNeedingAttention.map(item => item.id) }
          }
        }],
        order: [['name', 'ASC']]
      });

      console.log(`Found ${recipes.length} recipes that use items needing attention`);

      const suggestions: RecipeSuggestion[] = [];

      // Generate suggestions for each recipe
      for (const recipe of recipes) {
        const matchingItems = (recipe as any).recipeIngredients?.filter((ingredient: any) => 
          itemsNeedingAttention.some(item => item.id === ingredient.id)
        ) || [];

        if (matchingItems.length > 0) {
          const suggestion = await this.createSuggestion(recipe, matchingItems);
          suggestions.push(suggestion);
        }
      }

      // Sort by urgency and confidence, then limit
      return suggestions
        .sort((a, b) => {
          const urgencyOrder = { high: 3, medium: 2, low: 1 };
          const urgencyDiff = urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
          if (urgencyDiff !== 0) return urgencyDiff;
          return b.confidence - a.confidence;
        })
        .slice(0, limit);

    } catch (error) {
      console.error('Error generating new suggestions:', error);
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

        if (options.includeExpiringItems) {
          if (item.expirationDate) {
            const daysToExpiry = Math.ceil((new Date(item.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            if (daysToExpiry <= options.maxDaysToExpiry && daysToExpiry >= 0) {
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
        // Sort by expiring soon first (using runtime calculation)
        const aDaysToExpiry = a.expirationDate ? Math.ceil((new Date(a.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : Infinity;
        const bDaysToExpiry = b.expirationDate ? Math.ceil((new Date(b.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : Infinity;
        
        const aIsExpiringSoon = aDaysToExpiry <= 7 && aDaysToExpiry >= 0;
        const bIsExpiringSoon = bDaysToExpiry <= 7 && bDaysToExpiry >= 0;
        
        if (aIsExpiringSoon && !bIsExpiringSoon) return -1;
        if (!aIsExpiringSoon && bIsExpiringSoon) return 1;
        
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

        // Get quantity and unit from recipe-ingredient relationship
        const recipeIngredient = (recipe as any).recipeIngredients?.find((ing: any) => ing.id === item.id);
        const quantity = recipeIngredient?.RecipeIngredient?.quantity || 1;
        const unit = recipeIngredient?.RecipeIngredient?.unit || 'piece';
        const isOptional = recipeIngredient?.RecipeIngredient?.isOptional || false;

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

        // Reduce confidence for optional ingredients
        if (isOptional) {
          itemConfidence *= 0.7;
        }

        confidence += itemConfidence;
        totalPotentialSavings += itemSavings;
        urgencyScore += itemUrgency;

        return {
          itemId: item.id,
          itemName: item.name,
          currentStock: item.stock || 0,
          expirationDate: item.expirationDate,
          daysToExpiry: item.expirationDate ? 
            Math.ceil((new Date(item.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 
            undefined,
          salesVelocity: item.salesVelocity,
          daysSinceLastSale: item.daysSinceLastSale,
          quantity: quantity,
          unit: unit,
          isOptional: isOptional,
          reason: this.getReasonForInclusion(item)
        };
      });

      // Calculate overall urgency
      const urgency = urgencyScore > 2 ? 'high' : urgencyScore > 1 ? 'medium' : 'low';

      // Normalize confidence
      confidence = Math.min(confidence / suggestedItems.length, 1.0);

      return {
        recipeId: recipe.id,
        recipeName: recipe.name,
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
      throw error;
    }
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
   * Map database suggestion to RecipeSuggestion interface
   */
  private static mapSuggestionToRecipeSuggestion(suggestion: any): RecipeSuggestion {
    return {
      recipeId: suggestion.recipeId,
      recipeName: suggestion.recipe?.name || 'Unknown Recipe',
      recipeDescription: suggestion.recipe?.description || '',
      recipeDifficulty: suggestion.recipe?.difficulty || 'medium',
      prepTime: suggestion.recipe?.prepTime || 0,
      cookTime: suggestion.recipe?.cookTime || 0,
      imageUrl: suggestion.recipe?.imageUrl,
      suggestedItems: [], // Will be populated when needed
      confidence: suggestion.confidence || 0,
      totalPotentialSavings: 0, // Will be calculated when needed
      urgency: suggestion.priority || 'medium'
    };
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
          type: QueryTypes.UPDATE
        }
      );

      // Update expiring soon flag
      await sequelize.query(
        'UPDATE items SET isExpiringSoon = CASE WHEN expirationDate <= DATEADD(day, 7, GETDATE()) THEN 1 ELSE 0 END WHERE businessId = :businessId AND expirationDate IS NOT NULL',
        {
          replacements: { businessId },
          type: QueryTypes.UPDATE
        }
      );

      // Update underperforming flag
      await sequelize.query(
        'UPDATE items SET isUnderperforming = CASE WHEN salesVelocity < 0.1 OR daysSinceLastSale > 30 THEN 1 ELSE 0 END WHERE businessId = :businessId',
        {
          replacements: { businessId },
          type: QueryTypes.UPDATE
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

  /**
   * Get expiring items specifically for waste prevention
   */
  static async getExpiringItemsForWastePrevention(
    businessId: number, 
    maxDaysToExpiry: number = 7
  ): Promise<any[]> {
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + maxDaysToExpiry);

      const expiringItems = await ItemModel.findAll({
        where: {
          businessId,
          isActive: true,
          stock: { [Op.gt]: 0 },
          expirationDate: {
            [Op.lte]: expiryDate,
            [Op.gt]: new Date() // Not already expired
          }
        },
        attributes: [
          'id',
          'name',
          'description',
          'category',
          'stock',
          'cost',
          'expirationDate',
          [fn('DATEDIFF', 'day', fn('GETDATE'), col('expirationDate')), 'daysToExpiry']
        ],
        order: [
          [col('daysToExpiry'), 'ASC'], // Most urgent first
          ['stock', 'DESC'] // Higher stock first
        ]
      });

      return expiringItems.map(item => {
        const itemData = item.toJSON();
        const daysToExpiry = parseInt((item as any).getDataValue('daysToExpiry') || '0');
        return {
          ...itemData,
          daysToExpiry,
          potentialWaste: itemData.cost * itemData.stock
        };
      });
    } catch (error) {
      console.error('Error getting expiring items for waste prevention:', error);
      return [];
    }
  }

  /**
   * Generate waste prevention suggestions based on expiring items
   */
  static async generateWastePreventionSuggestions(
    businessId: number,
    expiringItems: any[],
    limit: number = 10
  ): Promise<RecipeSuggestion[]> {
    try {
      if (expiringItems.length === 0) {
        return [];
      }

      // Get all recipes for this business
      const recipes = await RecipeModel.findAll({
        where: {
          businessId,
          isActive: true
        },
        attributes: [
          'id',
          'name',
          'description',
          'difficulty',
          'prepTime',
          'cookTime',
          'imageUrl',
          'ingredients'
        ]
      });

      const suggestions: RecipeSuggestion[] = [];

      // For each expiring item, find recipes that use it
      for (const expiringItem of expiringItems) {
        const matchingRecipes = this.findRecipesUsingItem(recipes, expiringItem);
        
        for (const recipe of matchingRecipes) {
          const urgency = this.calculateUrgency(expiringItem.daysToExpiry, expiringItem.stock);
          const confidence = this.calculateConfidence(expiringItem);
          
          const suggestion: RecipeSuggestion = {
            recipeId: recipe.id,
            recipeName: recipe.name,
            recipeDescription: recipe.description,
            recipeDifficulty: recipe.difficulty,
            prepTime: recipe.prepTime,
            cookTime: recipe.cookTime,
            imageUrl: recipe.imageUrl,
            suggestedItems: [{
              itemId: expiringItem.id,
              itemName: expiringItem.name,
              currentStock: expiringItem.stock,
              expirationDate: expiringItem.expirationDate,
              daysToExpiry: expiringItem.daysToExpiry,
              reason: `Expiring in ${expiringItem.daysToExpiry} days - prevent waste`
            }],
            confidence,
            totalPotentialSavings: expiringItem.potentialWaste,
            urgency
          };

          suggestions.push(suggestion);

          // Stop if we've reached the limit
          if (suggestions.length >= limit) {
            break;
          }
        }

        // Stop if we've reached the limit
        if (suggestions.length >= limit) {
          break;
        }
      }

      // Sort by urgency and confidence
      return suggestions
        .sort((a, b) => {
          // First by urgency (high > medium > low)
          const urgencyOrder = { high: 3, medium: 2, low: 1 };
          const urgencyDiff = urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
          if (urgencyDiff !== 0) return urgencyDiff;
          
          // Then by confidence
          return b.confidence - a.confidence;
        })
        .slice(0, limit);

    } catch (error) {
      console.error('Error generating waste prevention suggestions:', error);
      return [];
    }
  }

  /**
   * Find recipes that use a specific item
   */
  private static findRecipesUsingItem(recipes: any[], item: any): any[] {
    const matchingRecipes: any[] = [];
    const itemName = item.name.toLowerCase();
    const itemCategory = item.category.toLowerCase();

    for (const recipe of recipes) {
      const ingredients = (recipe as any).ingredients?.map((ing: any) => ing.name.toLowerCase()) || [];
      
      // Check if recipe ingredients contain the expiring item
      const hasMatchingIngredient = ingredients?.some((ingredient: string) => {
        const ingredientLower = ingredient.toLowerCase();
        return ingredientLower.includes(itemName) || 
               ingredientLower.includes(itemCategory) ||
               itemName.includes(ingredientLower);
      });

      if (hasMatchingIngredient) {
        matchingRecipes.push(recipe);
      }
    }

    return matchingRecipes;
  }

  /**
   * Calculate urgency based on days to expiry and stock level
   */
  private static calculateUrgency(daysToExpiry: number, stock: number): 'high' | 'medium' | 'low' {
    if (daysToExpiry <= 2 || stock > 50) return 'high';
    if (daysToExpiry <= 5 || stock > 20) return 'medium';
    return 'low';
  }

  /**
   * Calculate confidence score for the suggestion
   */
  private static calculateConfidence(item: any): number {
    let confidence = 0.5; // Base confidence

    // Higher confidence for items expiring very soon
    if (item.daysToExpiry <= 1) confidence += 0.3;
    else if (item.daysToExpiry <= 3) confidence += 0.2;
    else if (item.daysToExpiry <= 7) confidence += 0.1;

    // Higher confidence for higher stock levels
    if (item.stock > 50) confidence += 0.2;
    else if (item.stock > 20) confidence += 0.1;

    // Higher confidence for higher value items
    if (item.potentialWaste > 100) confidence += 0.1;
    else if (item.potentialWaste > 50) confidence += 0.05;

    return Math.min(confidence, 1.0); // Cap at 1.0
  }
} 