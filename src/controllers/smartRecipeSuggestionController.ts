import { Request, Response } from 'express';
import { RequestHandler } from 'express';
import { Op } from 'sequelize';
import { SmartRecipeSuggestionService, SmartSuggestionCriteria } from '../services/smartRecipeSuggestionService';

/**
 * @swagger
 * /api/recipes/smart-suggestions:
 *   get:
 *     summary: Get smart recipe suggestions based on inventory management
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: includeExpiringItems
 *         schema:
 *           type: boolean
 *         description: Include items that are expiring soon
 *       - in: query
 *         name: includeUnderperformingItems
 *         schema:
 *           type: boolean
 *         description: Include items with low sales velocity
 *       - in: query
 *         name: maxDaysToExpiry
 *         schema:
 *           type: integer
 *         description: Maximum days to expiry for items to consider
 *       - in: query
 *         name: minSalesVelocity
 *         schema:
 *           type: number
 *         description: Minimum sales velocity threshold
 *       - in: query
 *         name: maxDaysSinceLastSale
 *         schema:
 *           type: integer
 *         description: Maximum days since last sale
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of suggestions to return
 *     responses:
 *       200:
 *         description: Smart recipe suggestions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       recipeId:
 *                         type: integer
 *                       recipeName:
 *                         type: string
 *                       recipeDescription:
 *                         type: string
 *                       recipeDifficulty:
 *                         type: string
 *                       prepTime:
 *                         type: integer
 *                       cookTime:
 *                         type: integer
 *                       imageUrl:
 *                         type: string
 *                       suggestedItems:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             itemId:
 *                               type: integer
 *                             itemName:
 *                               type: string
 *                             currentStock:
 *                               type: integer
 *                             expirationDate:
 *                               type: string
 *                               format: date-time
 *                             daysToExpiry:
 *                               type: integer
 *                             salesVelocity:
 *                               type: number
 *                             daysSinceLastSale:
 *                               type: integer
 *                             reason:
 *                               type: string
 *                       confidence:
 *                         type: number
 *                       totalPotentialSavings:
 *                         type: number
 *                       urgency:
 *                         type: string
 *                         enum: [high, medium, low]
 */
export const getSmartSuggestions: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const businessId = (req as any).user?.businessId;
  if (!businessId) {
    res.status(401).json({
      success: false,
      error: 'Business ID not found in token'
    });
    return;
  }

  const criteria: SmartSuggestionCriteria = {
    businessId,
    includeExpiringItems: req.query.includeExpiringItems === 'true',
    includeUnderperformingItems: req.query.includeUnderperformingItems === 'true',
    maxDaysToExpiry: req.query.maxDaysToExpiry ? parseInt(req.query.maxDaysToExpiry as string) : 7,
    minSalesVelocity: req.query.minSalesVelocity ? parseFloat(req.query.minSalesVelocity as string) : 0.1,
    maxDaysSinceLastSale: req.query.maxDaysSinceLastSale ? parseInt(req.query.maxDaysSinceLastSale as string) : 30,
    limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
    status: req.query.status as 'pending' | 'cooked' | 'expired' | 'dismissed' || 'pending',
    includeCooked: req.query.includeCooked === 'true'
  };

  try {
    const suggestions = await SmartRecipeSuggestionService.getSmartSuggestions(criteria);

    res.json({
      success: true,
      suggestions,
      criteria,
      totalSuggestions: suggestions.length
    });
  } catch (error) {
    console.error('Error getting smart suggestions:', error);
    res.status(200).json({
      success: true,
      suggestions: [],
      criteria,
      totalSuggestions: 0
    });
  }
};

/**
 * @swagger
 * /api/recipes/inventory-summary:
 *   get:
 *     summary: Get inventory summary for dashboard
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 summary:
 *                   type: object
 *                   properties:
 *                     expiringItems:
 *                       type: integer
 *                     underperformingItems:
 *                       type: integer
 *                     lowStockItems:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     expiringPercentage:
 *                       type: number
 *                     underperformingPercentage:
 *                       type: number
 */
export const getInventorySummary: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('🔍 getInventorySummary called');
  try {
    const businessId = (req as any).user?.businessId;
    console.log('🔍 Business ID:', businessId);
    if (!businessId) {
      res.status(401).json({
        success: false,
        error: 'Business ID not found in token'
      });
      return;
    }

    console.log('🔍 Calling SmartRecipeSuggestionService.getInventorySummary');
    const summary = await SmartRecipeSuggestionService.getInventorySummary(businessId);
    console.log('🔍 Summary received:', summary);

    res.json({
      success: true,
      totalItems: summary.totalItems,
      expiringSoon: summary.expiringItems,
      underperforming: summary.underperformingItems,
      lowStockItems: summary.lowStockItems,
      expiringPercentage: summary.expiringPercentage,
      underperformingPercentage: summary.underperformingPercentage
    });
  } catch (error) {
    console.error('🔍 Error in getInventorySummary:', error);
    res.status(200).json({
      success: true,
      totalItems: 0,
      expiringSoon: 0,
      underperforming: 0,
      lowStockItems: 0,
      expiringPercentage: 0,
      underperformingPercentage: 0
    });
  }
};

/**
 * @swagger
 * /api/recipes/update-tracking:
 *   post:
 *     summary: Update item inventory tracking data
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tracking data updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
export const updateTracking: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const businessId = (req as any).user?.businessId;
    if (!businessId) {
      res.status(401).json({
        success: false,
        error: 'Business ID not found in token'
      });
      return;
    }

    await SmartRecipeSuggestionService.updateItemTracking(businessId);

    res.json({
      success: true,
      message: 'Inventory tracking data updated successfully'
    });
  } catch (error) {
    console.error('Error updating tracking data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update tracking data'
    });
  }
};

/**
 * @swagger
 * /api/recipes/expiring-items:
 *   get:
 *     summary: Get items that are expiring soon
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *         description: Number of days to look ahead for expiring items
 *     responses:
 *       200:
 *         description: List of expiring items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 */
export const getExpiringItems: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const businessId = (req as any).user?.businessId;
    if (!businessId) {
      res.status(401).json({
        success: false,
        error: 'Business ID not found in token'
      });
      return;
    }

    const days = req.query.days ? parseInt(req.query.days as string) : 7;

    const { ItemModel } = await import('../models/ItemModel');
    
    let items: any[] = [];
    try {
      items = await ItemModel.findAll({
        where: {
          businessId,
          isActive: true,
          stock: { [Op.gt]: 0 },
          expirationDate: {
            [Op.lte]: require('sequelize').literal(`DATEADD(day, ${days}, GETDATE())`)
          }
        },
        order: [['expirationDate', 'ASC']]
      });
    } catch (dbError) {
      console.error('Database error getting expiring items:', dbError);
      items = [];
    }

    res.json({
      success: true,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        stock: item.stock,
        expirationDate: item.expirationDate,
        daysToExpiry: item.expirationDate ? 
          Math.ceil((new Date(item.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 
          null,
        cost: item.cost,
        potentialLoss: item.cost * item.stock
      }))
    });
  } catch (error) {
    console.error('Error getting expiring items:', error);
    res.status(200).json({
      success: true,
      items: []
    });
  }
};

/**
 * @swagger
 * /api/recipes/underperforming-items:
 *   get:
 *     summary: Get underperforming items
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of underperforming items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 */
export const getUnderperformingItems: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const businessId = (req as any).user?.businessId;
    if (!businessId) {
      res.status(401).json({
        success: false,
        error: 'Business ID not found in token'
      });
      return;
    }

    const { ItemModel } = await import('../models/ItemModel');
    
    let items: any[] = [];
    try {
      items = await ItemModel.findAll({
        where: {
          businessId,
          isActive: true,
          stock: { [Op.gt]: 0 },
          [Op.or]: [
            { salesVelocity: { [Op.lt]: 0.1 } },
            { daysSinceLastSale: { [Op.gt]: 30 } }
          ]
        },
        order: [
          ['salesVelocity', 'ASC'],
          ['daysSinceLastSale', 'DESC']
        ]
      });
    } catch (dbError) {
      console.error('Database error getting underperforming items:', dbError);
      items = [];
    }

    res.json({
      success: true,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        stock: item.stock,
        salesVelocity: item.salesVelocity,
        daysSinceLastSale: item.daysSinceLastSale,
        lastSoldDate: item.lastSoldDate,
        cost: item.cost,
        potentialLoss: item.cost * item.stock
      }))
    });
  } catch (error) {
    console.error('Error getting underperforming items:', error);
    res.status(200).json({
      success: true,
      items: []
    });
  }
}; 

/**
 * @swagger
 * /api/smart/waste-prevention-suggestions:
 *   post:
 *     summary: Generate recipe suggestions to prevent waste from expiring items
 *     tags: [Smart Suggestions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               maxDaysToExpiry:
 *                 type: integer
 *                 default: 7
 *                 description: Maximum days to expiry for items to consider
 *               limit:
 *                 type: integer
 *                 default: 10
 *                 description: Maximum number of suggestions to generate
 *     responses:
 *       200:
 *         description: Waste prevention recipe suggestions generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       recipeId:
 *                         type: integer
 *                       recipeName:
 *                         type: string
 *                       recipeDescription:
 *                         type: string
 *                       urgency:
 *                         type: string
 *                       expiringItems:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             itemId:
 *                               type: integer
 *                             itemName:
 *                               type: string
 *                             daysToExpiry:
 *                               type: integer
 *                             currentStock:
 *                               type: integer
 *                             potentialWaste:
 *                               type: number
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Internal server error
 */
export const generateWastePreventionSuggestions: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const businessId = (req as any).user?.businessId;
    if (!businessId) {
      res.status(401).json({ success: false, message: 'Business ID not found in token' });
      return;
    }

    const { maxDaysToExpiry = 7, limit = 10 } = req.body;

    console.log(`🔄 Generating waste prevention suggestions for business ${businessId}`);
    console.log(`📅 Looking for items expiring within ${maxDaysToExpiry} days`);
    console.log(`📊 Maximum suggestions: ${limit}`);

    // Get expiring items
    const expiringItems = await SmartRecipeSuggestionService.getExpiringItemsForWastePrevention(
      businessId, 
      maxDaysToExpiry
    );

    if (expiringItems.length === 0) {
      res.status(200).json({
        success: true,
        message: 'No items expiring soon found',
        suggestions: [],
        summary: {
          totalExpiringItems: 0,
          potentialWasteValue: 0,
          suggestionsGenerated: 0
        }
      });
      return;
    }

    console.log(`⚠️ Found ${expiringItems.length} items expiring soon`);

    // Generate recipe suggestions for waste prevention
    const suggestions = await SmartRecipeSuggestionService.generateWastePreventionSuggestions(
      businessId,
      expiringItems,
      limit
    );

    // Calculate summary
    const totalExpiringItems = expiringItems.length;
    const potentialWasteValue = expiringItems.reduce((sum: number, item: any) => sum + (item.cost * item.stock), 0);
    const suggestionsGenerated = suggestions.length;

    console.log(`✅ Generated ${suggestions.length} waste prevention suggestions`);
    console.log(`💰 Potential waste value: $${potentialWasteValue.toFixed(2)}`);

    res.status(200).json({
      success: true,
      message: 'Waste prevention suggestions generated successfully',
      suggestions,
      summary: {
        totalExpiringItems,
        potentialWasteValue: Math.round(potentialWasteValue * 100) / 100,
        suggestionsGenerated
      }
    });

  } catch (error) {
    console.error('❌ Error generating waste prevention suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate waste prevention suggestions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 