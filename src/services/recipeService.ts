import { RecipeModel, RecipeSuggestionModel, ItemModel } from '../models';
import { logger } from '../utils/logger';
import { Op, QueryTypes } from 'sequelize';

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

  /**
   * Bulk link recipes to items efficiently
   * Performance optimized with bulk operations and minimal database queries
   */
  static async bulkLinkRecipesToItems(businessId: number, force: boolean = false): Promise<{
    totalRecipes: number;
    totalItems: number;
    linksCreated: number;
    linksSkipped: number;
    processingTime: number;
  }> {
    const startTime = Date.now();
    
    try {
      logger(`Starting bulk recipe-item linking for business ${businessId}`);
      
      // 1. Get all items for this business (single query)
      const items = await ItemModel.findAll({
        where: { businessId },
        attributes: ['id', 'name', 'sku'],
        raw: true
      });
      
      // 2. Get all recipes for this business (single query)
      const recipes = await RecipeModel.findAll({
        where: { businessId },
        attributes: ['id', 'name', 'ingredients'],
        raw: true
      });
      
      // 3. Create efficient lookup maps
      const itemMap = new Map<string, number>();
      items.forEach(item => {
        if (item.name) itemMap.set(item.name.toLowerCase(), item.id);
        if (item.sku) itemMap.set(item.sku.toLowerCase(), item.id);
      });
      
      // 4. Check existing recipe_ingredients to avoid duplicates
      let existingLinks = new Set<string>();
      if (!force) {
        const existing = await RecipeModel.sequelize!.query(
          'SELECT recipeId, itemId FROM recipe_ingredients WHERE recipeId IN (SELECT id FROM recipes WHERE businessId = ?)',
          { 
            type: QueryTypes.SELECT,
            replacements: [businessId]
          }
        ) as any[];
        
        existingLinks = new Set(existing.map(link => `${link.recipeId}-${link.itemId}`));
      }
      
      // 5. Process recipes and create links efficiently
      const linksToCreate: any[] = [];
      let linksSkipped = 0;
      
      for (const recipe of recipes) {
        if (!recipe.ingredients) continue;
        
        // Parse ingredients (comma-separated string)
        const ingredientNames = recipe.ingredients.split(',').map(name => name.trim());
        
        for (const ingredientName of ingredientNames) {
          const itemId = itemMap.get(ingredientName.toLowerCase());
          
          if (!itemId) {
            logger(`Item not found: "${ingredientName}" for recipe "${recipe.name}"`);
            continue;
          }
          
          const linkKey = `${recipe.id}-${itemId}`;
          
          if (existingLinks.has(linkKey)) {
            linksSkipped++;
            continue;
          }
          
          linksToCreate.push({
            recipeId: recipe.id,
            itemId: itemId,
            quantity: 1,
            unit: 'pieces',
            notes: `Auto-linked ingredient for ${recipe.name}`,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
      
      // 6. Bulk insert all links in chunks (SQL Server limit: 1000 row values)
      let linksCreated = 0;
      if (linksToCreate.length > 0) {
        const chunkSize = 100; // 100 rows * 7 columns = 700 values (under 1000 limit)
        
        for (let i = 0; i < linksToCreate.length; i += chunkSize) {
          const chunk = linksToCreate.slice(i, i + chunkSize);
          
          await RecipeModel.sequelize!.query(
            'INSERT INTO recipe_ingredients (recipeId, itemId, quantity, unit, notes, createdAt, updatedAt) VALUES ' +
            chunk.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', '),
            {
              type: QueryTypes.INSERT,
              replacements: chunk.flatMap(link => [
                link.recipeId, link.itemId, link.quantity, link.unit, link.notes, link.createdAt, link.updatedAt
              ])
            }
          );
          
          linksCreated += chunk.length;
          logger(`Inserted chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(linksToCreate.length / chunkSize)}`);
        }
      }
      
      const processingTime = Date.now() - startTime;
      
      logger(`Bulk linking completed: ${linksCreated} links created, ${linksSkipped} skipped in ${processingTime}ms`);
      
      return {
        totalRecipes: recipes.length,
        totalItems: items.length,
        linksCreated,
        linksSkipped,
        processingTime
      };
      
    } catch (error) {
      logger(`Error in bulkLinkRecipesToItems: ${error}`);
      throw error;
    }
  }
} 