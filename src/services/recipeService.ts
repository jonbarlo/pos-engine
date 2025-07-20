import { RecipeModel, RecipeSuggestionModel, ItemModel } from '../models';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';

export interface RecipeData {
  businessId: number;
  name: string;
  description?: string;
  ingredients: string;
  instructions: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  cuisine: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
  nutritionInfo?: string;
  isActive?: boolean;
}

export interface RecipeUpdateData extends Partial<RecipeData> {
  id: number;
}

export interface RecipeSearchParams {
  businessId: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  search?: string | undefined;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export class RecipeService {
  /**
   * Create a new recipe
   */
  static async createRecipe(data: RecipeData): Promise<RecipeModel> {
    try {
      logger(`Creating recipe: ${data.name} for business ${data.businessId}`);
      
      const recipe = await RecipeModel.create({
        ...data,
        isActive: data.isActive ?? true
      });

      logger(`Recipe created successfully with ID: ${recipe.id}`);
      return recipe;
    } catch (error) {
      logger(`Error creating recipe: ${error}`);
      throw error;
    }
  }

  /**
   * Get recipe by ID
   */
  static async getRecipeById(id: number, businessId: number): Promise<RecipeModel | null> {
    try {
      const recipe = await RecipeModel.findOne({
        where: { id, businessId }
      });

      if (!recipe) {
        logger(`Recipe not found: ${id} for business ${businessId}`);
        return null;
      }

      return recipe;
    } catch (error) {
      logger(`Error getting recipe by ID: ${error}`);
      throw error;
    }
  }

  /**
   * Update recipe
   */
  static async updateRecipe(id: number, businessId: number, data: Partial<RecipeData>): Promise<RecipeModel | null> {
    try {
      logger(`Updating recipe: ${id} for business ${businessId}`);
      
      const recipe = await RecipeModel.findOne({
        where: { id, businessId }
      });

      if (!recipe) {
        logger(`Recipe not found for update: ${id} for business ${businessId}`);
        return null;
      }

      await recipe.update(data);
      logger(`Recipe updated successfully: ${id}`);
      return recipe;
    } catch (error) {
      logger(`Error updating recipe: ${error}`);
      throw error;
    }
  }

  /**
   * Delete recipe (soft delete)
   */
  static async deleteRecipe(id: number, businessId: number): Promise<boolean> {
    try {
      logger(`Deleting recipe: ${id} for business ${businessId}`);
      
      const recipe = await RecipeModel.findOne({
        where: { id, businessId }
      });

      if (!recipe) {
        logger(`Recipe not found for deletion: ${id} for business ${businessId}`);
        return false;
      }

      await recipe.update({ isActive: false });
      logger(`Recipe deleted successfully: ${id}`);
      return true;
    } catch (error) {
      logger(`Error deleting recipe: ${error}`);
      throw error;
    }
  }

  /**
   * Get recipes with search and filtering
   */
  static async getRecipes(params: RecipeSearchParams): Promise<{ recipes: RecipeModel[]; total: number }> {
    try {
      const { businessId, difficulty, search, isActive = true, limit = 20, offset = 0 } = params;
      
      const whereClause: any = {
        businessId,
        isActive
      };

      if (difficulty) {
        whereClause.difficulty = difficulty;
      }

      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
          { ingredients: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows } = await RecipeModel.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      logger(`Found ${count} recipes for business ${businessId}`);
      return { recipes: rows, total: count };
    } catch (error) {
      logger(`Error getting recipes: ${error}`);
      throw error;
    }
  }

  /**
   * Search recipes by name or ingredients
   */
  static async searchRecipes(query: string, businessId: number): Promise<RecipeModel[]> {
    try {
      const recipes = await RecipeModel.findAll({
        where: {
          businessId,
          isActive: true,
          [Op.or]: [
            { name: { [Op.like]: `%${query}%` } },
            { description: { [Op.like]: `%${query}%` } },
            { ingredients: { [Op.like]: `%${query}%` } }
          ]
        },
        order: [['name', 'ASC']],
        limit: 50
      });

      logger(`Found ${recipes.length} recipes matching "${query}" for business ${businessId}`);
      return recipes;
    } catch (error) {
      logger(`Error searching recipes: ${error}`);
      throw error;
    }
  }

  /**
   * Get recipes by difficulty level
   */
  static async getRecipesByDifficulty(difficulty: 'easy' | 'medium' | 'hard', businessId: number): Promise<RecipeModel[]> {
    try {
      const recipes = await RecipeModel.findAll({
        where: {
          businessId,
          difficulty,
          isActive: true
        },
        order: [['name', 'ASC']]
      });

      logger(`Found ${recipes.length} ${difficulty} recipes for business ${businessId}`);
      return recipes;
    } catch (error) {
      logger(`Error getting recipes by difficulty: ${error}`);
      throw error;
    }
  }

  /**
   * Upload recipe image
   */
  static async uploadImage(recipeId: number, businessId: number, imageUrl: string): Promise<RecipeModel | null> {
    try {
      logger(`Uploading image for recipe: ${recipeId} for business ${businessId}`);
      
      const recipe = await RecipeModel.findOne({
        where: { id: recipeId, businessId }
      });

      if (!recipe) {
        logger(`Recipe not found for image upload: ${recipeId} for business ${businessId}`);
        return null;
      }

      await recipe.update({ imageUrl });
      logger(`Image uploaded successfully for recipe: ${recipeId}`);
      return recipe;
    } catch (error) {
      logger(`Error uploading recipe image: ${error}`);
      throw error;
    }
  }

  /**
   * Get recipe suggestions for a business
   */
  static async getRecipeSuggestions(businessId: number): Promise<RecipeSuggestionModel[]> {
    try {
      const suggestions = await RecipeSuggestionModel.findAll({
        where: { businessId },
        include: [
          {
            model: RecipeModel,
            as: 'recipe',
            where: { isActive: true }
          }
        ],
        order: [['confidence', 'DESC'], ['createdAt', 'DESC']]
      });

      logger(`Found ${suggestions.length} recipe suggestions for business ${businessId}`);
      return suggestions;
    } catch (error) {
      logger(`Error getting recipe suggestions: ${error}`);
      throw error;
    }
  }

  /**
   * Create recipe suggestion
   */
  static async createRecipeSuggestion(
    businessId: number,
    recipeId: number,
    suggestionType: string,
    reason: string,
    priority: 'low' | 'medium' | 'high',
    targetAudience: string,
    aiGenerated: boolean = false,
    confidence?: number,
    suggestedPrice?: number
  ): Promise<RecipeSuggestionModel> {
    try {
      logger(`Creating recipe suggestion for recipe ${recipeId}`);
      
      const suggestionData: any = {
        businessId,
        recipeId,
        suggestionType,
        reason,
        priority,
        targetAudience,
        aiGenerated
      };

      if (confidence !== undefined) suggestionData.confidence = confidence;
      if (suggestedPrice !== undefined) suggestionData.suggestedPrice = suggestedPrice;

      const suggestion = await RecipeSuggestionModel.create(suggestionData);

      logger(`Recipe suggestion created successfully: ${suggestion.id}`);
      return suggestion;
    } catch (error) {
      logger(`Error creating recipe suggestion: ${error}`);
      throw error;
    }
  }

  /**
   * Get recipe statistics
   */
  static async getRecipeStats(businessId: number): Promise<any> {
    try {
      const totalRecipes = await RecipeModel.count({
        where: { businessId, isActive: true }
      });

      const recipesByDifficulty = await RecipeModel.findAll({
        where: { businessId, isActive: true },
        attributes: [
          'difficulty',
          [RecipeModel.sequelize!.fn('COUNT', RecipeModel.sequelize!.col('id')), 'count']
        ],
        group: ['difficulty'],
        raw: true
      });

      const recentRecipes = await RecipeModel.count({
        where: {
          businessId,
          isActive: true,
          createdAt: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      });

      const stats = {
        totalRecipes,
        recipesByDifficulty: recipesByDifficulty.reduce((acc: any, item: any) => {
          acc[item.difficulty] = parseInt((item as any).count);
          return acc;
        }, {}),
        recentRecipes,
        averagePrepTime: 0,
        averageCookTime: 0
      };

      // Calculate average times
      const timeStats = await RecipeModel.findOne({
        where: { businessId, isActive: true },
        attributes: [
          [RecipeModel.sequelize!.fn('AVG', RecipeModel.sequelize!.col('prepTime')), 'avgPrepTime'],
          [RecipeModel.sequelize!.fn('AVG', RecipeModel.sequelize!.col('cookTime')), 'avgCookTime']
        ],
        raw: true
      });

      if (timeStats) {
        const avgPrepTime = (timeStats as any).avgPrepTime;
        const avgCookTime = (timeStats as any).avgCookTime;
        stats.averagePrepTime = Math.round(parseFloat(avgPrepTime?.toString() || '0'));
        stats.averageCookTime = Math.round(parseFloat(avgCookTime?.toString() || '0'));
      }

      logger(`Recipe stats calculated for business ${businessId}`);
      return stats;
    } catch (error) {
      logger(`Error getting recipe stats: ${error}`);
      throw error;
    }
  }
} 