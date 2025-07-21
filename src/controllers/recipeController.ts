import { Request, Response } from 'express';
import { RecipeService, RecipeData } from '../services/recipeService';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export class RecipeController {
  /**
   * Get all recipes with pagination and filtering
   */
  static async getRecipes(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businessId = req.user!.businessId;
      const { 
        difficulty, 
        search, 
        isActive, 
        page = 1, 
        limit = 20 
      } = req.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const result = await RecipeService.getRecipes({
        businessId,
        difficulty: difficulty as 'easy' | 'medium' | 'hard',
        search: search as string | undefined,
        isActive: isActive === undefined ? true : isActive === 'true',
        limit: parseInt(limit as string),
        offset
      });

      res.status(200).json({
        data: result.recipes,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: result.total,
          totalPages: Math.ceil(result.total / parseInt(limit as string))
        }
      });
    } catch (error) {
      logger(`Error in getRecipes: ${error}`);
      res.status(500).json({ error: 'Failed to get recipes' });
    }
  }

  /**
   * Get recipe by ID
   */
  static async getRecipeById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businessId = req.user!.businessId;
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ error: 'Recipe ID is required' });
        return;
      }

      const recipe = await RecipeService.getRecipeById(parseInt(id), businessId);

      if (!recipe) {
        res.status(404).json({ error: 'Recipe not found' });
        return;
      }

      res.status(200).json({ data: recipe });
    } catch (error) {
      logger(`Error in getRecipeById: ${error}`);
      res.status(500).json({ error: 'Failed to get recipe' });
    }
  }

  /**
   * Create new recipe
   */
  static async createRecipe(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businessId = req.user!.businessId;
      const recipeData: RecipeData = {
        ...req.body,
        businessId
      };

      // Validate required fields
      if (!recipeData.name || !recipeData.ingredients || !recipeData.instructions) {
        res.status(400).json({ 
          error: 'Missing required fields: name, ingredients, instructions' 
        });
        return;
      }

      if (!recipeData.prepTime || !recipeData.cookTime || !recipeData.difficulty) {
        res.status(400).json({ 
          error: 'Missing required fields: prepTime, cookTime, difficulty' 
        });
        return;
      }

      const recipe = await RecipeService.createRecipe(recipeData);

      res.status(201).json({ 
        message: 'Recipe created successfully',
        data: recipe 
      });
    } catch (error) {
      logger(`Error in createRecipe: ${error}`);
      res.status(500).json({ error: 'Failed to create recipe' });
    }
  }

  /**
   * Update recipe
   */
  static async updateRecipe(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businessId = req.user!.businessId;
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        res.status(400).json({ error: 'Recipe ID is required' });
        return;
      }

      const recipe = await RecipeService.updateRecipe(parseInt(id), businessId, updateData);

      if (!recipe) {
        res.status(404).json({ error: 'Recipe not found' });
        return;
      }

      res.status(200).json({ 
        message: 'Recipe updated successfully',
        data: recipe 
      });
    } catch (error) {
      logger(`Error in updateRecipe: ${error}`);
      res.status(500).json({ error: 'Failed to update recipe' });
    }
  }

  /**
   * Delete recipe (soft delete)
   */
  static async deleteRecipe(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businessId = req.user!.businessId;
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ error: 'Recipe ID is required' });
        return;
      }

      const success = await RecipeService.deleteRecipe(parseInt(id), businessId);

      if (!success) {
        res.status(404).json({ error: 'Recipe not found' });
        return;
      }

      res.status(200).json({ message: 'Recipe deleted successfully' });
    } catch (error) {
      logger(`Error in deleteRecipe: ${error}`);
      res.status(500).json({ error: 'Failed to delete recipe' });
    }
  }

  /**
   * Search recipes
   */
  static async searchRecipes(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businessId = req.user!.businessId;
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        res.status(400).json({ error: 'Search query is required' });
        return;
      }

      const recipes = await RecipeService.searchRecipes(q, businessId);

      res.status(200).json({ 
        data: recipes,
        total: recipes.length 
      });
    } catch (error) {
      logger(`Error in searchRecipes: ${error}`);
      res.status(500).json({ error: 'Failed to search recipes' });
    }
  }

  /**
   * Get recipes by difficulty
   */
  static async getRecipesByDifficulty(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businessId = req.user!.businessId;
      const { difficulty } = req.params;

      if (!difficulty || !['easy', 'medium', 'hard'].includes(difficulty)) {
        res.status(400).json({ error: 'Valid difficulty level is required' });
        return;
      }

      const recipes = await RecipeService.getRecipesByDifficulty(
        difficulty as 'easy' | 'medium' | 'hard', 
        businessId
      );

      res.status(200).json({ 
        data: recipes,
        total: recipes.length 
      });
    } catch (error) {
      logger(`Error in getRecipesByDifficulty: ${error}`);
      res.status(500).json({ error: 'Failed to get recipes by difficulty' });
    }
  }

  /**
   * Upload recipe image
   */
  static async uploadImage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businessId = req.user!.businessId;
      const { id } = req.params;
      const { imageUrl } = req.body;

      if (!id) {
        res.status(400).json({ error: 'Recipe ID is required' });
        return;
      }

      if (!imageUrl) {
        res.status(400).json({ error: 'Image URL is required' });
        return;
      }

      const recipe = await RecipeService.uploadImage(parseInt(id), businessId, imageUrl);

      if (!recipe) {
        res.status(404).json({ error: 'Recipe not found' });
        return;
      }

      res.status(200).json({ 
        message: 'Image uploaded successfully',
        data: recipe 
      });
    } catch (error) {
      logger(`Error in uploadImage: ${error}`);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  }

  /**
   * Get recipe suggestions for a business
   */
  static async getRecipeSuggestions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businessId = req.user!.businessId;

      const suggestions = await RecipeService.getRecipeSuggestions(businessId);

      res.status(200).json({ 
        data: suggestions,
        total: suggestions.length 
      });
    } catch (error) {
      logger(`Error in getRecipeSuggestions: ${error}`);
      res.status(500).json({ error: 'Failed to get recipe suggestions' });
    }
  }

  /**
   * Create recipe suggestion
   */
  static async createRecipeSuggestion(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businessId = req.user!.businessId;
      const { recipeId, suggestionType, reason, priority, targetAudience, aiGenerated, confidence, suggestedPrice } = req.body;

      if (!recipeId || !suggestionType || !reason || !priority || !targetAudience) {
        res.status(400).json({ error: 'Recipe ID, suggestion type, reason, priority, and target audience are required' });
        return;
      }

      const suggestion = await RecipeService.createRecipeSuggestion(
        businessId,
        parseInt(recipeId),
        suggestionType,
        reason,
        priority,
        targetAudience,
        aiGenerated || false,
        confidence,
        suggestedPrice
      );

      res.status(201).json({ 
        message: 'Recipe suggestion created successfully',
        data: suggestion 
      });
    } catch (error) {
      logger(`Error in createRecipeSuggestion: ${error}`);
      res.status(500).json({ error: 'Failed to create recipe suggestion' });
    }
  }

  /**
   * Get recipe statistics
   */
  static async getRecipeStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businessId = req.user!.businessId;

      const stats = await RecipeService.getRecipeStats(businessId);

      res.status(200).json({ data: stats });
    } catch (error) {
      logger(`Error in getRecipeStats: ${error}`);
      res.status(500).json({ error: 'Failed to get recipe statistics' });
    }
  }
} 