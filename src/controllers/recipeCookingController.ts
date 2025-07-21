import { Request, Response } from 'express';
import { RequestHandler } from 'express';
import { RecipeCookingService, CookingRequest } from '../services/recipeCookingService';

/**
 * @swagger
 * /api/smart/cook-recipe:
 *   post:
 *     summary: Cook a recipe and consume inventory items
 *     tags: [Smart Cooking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipeId
 *               - quantity
 *             properties:
 *               recipeId:
 *                 type: integer
 *                 description: ID of the recipe to cook
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Number of servings to cook
 *     responses:
 *       200:
 *         description: Recipe cooked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 cookingResult:
 *                   type: object
 *                   properties:
 *                     recipeId:
 *                       type: integer
 *                     recipeName:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     consumedItems:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           itemId:
 *                             type: integer
 *                           itemName:
 *                             type: string
 *                           quantityConsumed:
 *                             type: integer
 *                           remainingStock:
 *                             type: integer
 *                           originalStock:
 *                             type: integer
 *                           unitCost:
 *                             type: number
 *                     costSavings:
 *                       type: number
 *                     wasteReduction:
 *                       type: number
 *                 createdPromotion:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     discountType:
 *                       type: string
 *                     discountValue:
 *                       type: number
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid request or insufficient stock
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                 details:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const cookRecipe: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      recipeId, 
      quantity, 
      promotionType,
      promotionName,
      promotionDescription,
      discountType,
      discountValue,
      promotionExpiresInHours
    } = req.body;
    const businessId = (req as any).user?.businessId;

    if (!businessId) {
      res.status(401).json({
        success: false,
        error: 'Business ID not found in user context'
      });
      return;
    }

    // Validate input
    if (!recipeId || typeof recipeId !== 'number' || recipeId <= 0) {
      res.status(400).json({
        success: false,
        error: 'Invalid recipe ID. Must be a positive number.'
      });
      return;
    }

    if (!quantity || typeof quantity !== 'number' || quantity < 1) {
      res.status(400).json({
        success: false,
        error: 'Invalid quantity. Must be at least 1.'
      });
      return;
    }

    const cookingRequest: CookingRequest = {
      recipeId,
      quantity,
      businessId,
      promotionType,
      promotionName,
      promotionDescription,
      discountType,
      discountValue,
      promotionExpiresInHours
    };

    const result = await RecipeCookingService.cookRecipe(cookingRequest);

    // Get promotion details if created
    let createdPromotion = null;
    if (result.createdPromotionId) {
      // Fetch the actual promotion details from database
      const { PromotionModel } = await import('../models/PromotionModel');
      const promotion = await PromotionModel.findByPk(result.createdPromotionId);
      if (promotion) {
        createdPromotion = {
          id: promotion.id,
          name: promotion.name,
          type: promotion.type,
          discountType: promotion.discountType,
          discountValue: promotion.discountValue,
          totalQuantity: promotion.totalQuantity,
          usedQuantity: promotion.usedQuantity,
          remainingQuantity: promotion.getRemainingQuantity(),
          status: promotion.getStatus(),
          expiresAt: promotion.endDate.toISOString()
        };
      }
    }

    res.status(200).json({
      success: true,
      cookingResult: {
        recipeId: result.recipeId,
        recipeName: result.recipeName,
        quantity: result.quantity,
        consumedItems: result.consumedItems,
        costSavings: result.costSavings,
        wasteReduction: result.wasteReduction
      },
      createdPromotion
    });

  } catch (error: any) {
    console.error('Error in cookRecipe controller:', error);

    if (error.message.includes('Recipe not found')) {
      res.status(404).json({
        success: false,
        error: error.message
      });
      return;
    }

    if (error.message.includes('Insufficient stock')) {
      res.status(400).json({
        success: false,
        error: error.message,
        details: {
          type: 'insufficient_stock'
        }
      });
      return;
    }

    if (error.message.includes('No smart suggestion found')) {
      res.status(400).json({
        success: false,
        error: error.message,
        details: {
          type: 'no_suggestion'
        }
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error while cooking recipe'
    });
  }
};

/**
 * @swagger
 * /api/smart/cooking-history:
 *   get:
 *     summary: Get cooking history for the business
 *     tags: [Smart Cooking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip
 *     responses:
 *       200:
 *         description: Cooking history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 history:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       recipeId:
 *                         type: integer
 *                       quantity:
 *                         type: integer
 *                       cookedAt:
 *                         type: string
 *                         format: date-time
 *                       wasteReduction:
 *                         type: number
 *                       costSavings:
 *                         type: number
 *                       createdPromotionId:
 *                         type: integer
 *                 total:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const getCookingHistory: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const businessId = (req as any).user?.businessId;

    if (!businessId) {
      res.status(401).json({
        success: false,
        error: 'Business ID not found in user context'
      });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    // Validate pagination parameters
    if (limit < 1 || limit > 100) {
      res.status(400).json({
        success: false,
        error: 'Limit must be between 1 and 100'
      });
      return;
    }

    if (offset < 0) {
      res.status(400).json({
        success: false,
        error: 'Offset must be non-negative'
      });
      return;
    }

    const result = await RecipeCookingService.getCookingHistory(businessId, limit, offset);

    res.status(200).json({
      success: true,
      history: result.history,
      total: result.total,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < result.total
      }
    });

  } catch (error: any) {
    console.error('Error in getCookingHistory controller:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while retrieving cooking history'
    });
  }
};

/**
 * @swagger
 * /api/smart/cooking-analytics:
 *   get:
 *     summary: Get cooking analytics for the business
 *     tags: [Smart Cooking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cooking analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 analytics:
 *                   type: object
 *                   properties:
 *                     totalCooked:
 *                       type: integer
 *                     totalWasteReduction:
 *                       type: number
 *                     totalCostSavings:
 *                       type: number
 *                     averageEfficiency:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const getCookingAnalytics: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const businessId = (req as any).user?.businessId;

    if (!businessId) {
      res.status(401).json({
        success: false,
        error: 'Business ID not found in user context'
      });
      return;
    }

    const analytics = await RecipeCookingService.getCookingAnalytics(businessId);

    res.status(200).json({
      success: true,
      analytics
    });

  } catch (error: any) {
    console.error('Error in getCookingAnalytics controller:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while retrieving cooking analytics'
    });
  }
}; 