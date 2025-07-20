import { Request, Response, NextFunction } from 'express';
import { PromotionService } from '../services/promotionService';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export class PromotionController {
  /**
   * Create a new promotion
   */
  public static createPromotion = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const promotionData = req.body;
      const businessId = req.user!.businessId;
      
      // Validate required fields
      if (!promotionData.name || !promotionData.discountType || !promotionData.discountValue) {
        res.status(400).json({ error: 'Name, discount type, and discount value are required' });
        return;
      }

      // Validate discount value
      if (promotionData.discountValue <= 0) {
        res.status(400).json({ error: 'Discount value must be greater than 0' });
        return;
      }

      // Validate dates
      if (promotionData.startDate && promotionData.endDate) {
        const startDate = new Date(promotionData.startDate);
        const endDate = new Date(promotionData.endDate);
        
        if (endDate <= startDate) {
          res.status(400).json({ error: 'End date must be after start date' });
          return;
        }
      }

      logger(`API endpoint POST /promotions was called...`);
      const promotion = await PromotionService.createPromotion({
        ...promotionData,
        businessId
      });
      
      res.status(201).json({
        message: 'Promotion created successfully',
        data: promotion
      });
    } catch (error) {
      logger(`Error creating promotion: ${error}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Get promotion by ID
   */
  public static getPromotionById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const businessId = req.user!.businessId;
      
      if (!id) {
        res.status(400).json({ error: 'Promotion ID is required' });
        return;
      }
      
      const promotionId = parseInt(id);
      
      if (isNaN(promotionId)) {
        res.status(400).json({ error: 'Invalid promotion ID' });
        return;
      }

      logger(`API endpoint GET /promotions/${id} was called...`);
      const promotion = await PromotionService.getPromotionById(promotionId, businessId);
      
      if (!promotion) {
        res.status(404).json({ error: 'Promotion not found' });
        return;
      }

      res.json({
        message: 'Promotion retrieved successfully',
        data: promotion
      });
    } catch (error) {
      logger(`Error getting promotion: ${error}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Get all promotions with pagination and filtering
   */
  public static getAllPromotions = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { page, limit, isActive, discountType, search } = req.query;
      const businessId = req.user!.businessId;
      
      const filters: any = { businessId };
      if (page) filters.page = parseInt(page as string);
      if (limit) filters.limit = parseInt(limit as string);
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (discountType) filters.discountType = discountType;
      if (search) filters.search = search;

      logger(`API endpoint GET /promotions was called...`);
      const result = await PromotionService.getAllPromotions(filters);
      
      res.json({
        message: 'Promotions retrieved successfully',
        data: result.promotions,
        pagination: result.pagination
      });
    } catch (error) {
      logger(`Error getting promotions: ${error}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Update promotion
   */
  public static updatePromotion = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const businessId = req.user!.businessId;
      
      if (!id) {
        res.status(400).json({ error: 'Promotion ID is required' });
        return;
      }
      
      const promotionId = parseInt(id);
      
      if (isNaN(promotionId)) {
        res.status(400).json({ error: 'Invalid promotion ID' });
        return;
      }

      // Validate dates if provided
      if (updateData.startDate && updateData.endDate) {
        const startDate = new Date(updateData.startDate);
        const endDate = new Date(updateData.endDate);
        
        if (endDate <= startDate) {
          res.status(400).json({ error: 'End date must be after start date' });
          return;
        }
      }

      logger(`API endpoint PUT /promotions/${id} was called...`);
      const promotion = await PromotionService.updatePromotion(promotionId, businessId, updateData);
      
      if (!promotion) {
        res.status(404).json({ error: 'Promotion not found' });
        return;
      }

      res.json({
        message: 'Promotion updated successfully',
        data: promotion
      });
    } catch (error) {
      logger(`Error updating promotion: ${error}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Delete promotion (soft delete)
   */
  public static deletePromotion = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const businessId = req.user!.businessId;
      
      if (!id) {
        res.status(400).json({ error: 'Promotion ID is required' });
        return;
      }
      
      const promotionId = parseInt(id);
      
      if (isNaN(promotionId)) {
        res.status(400).json({ error: 'Invalid promotion ID' });
        return;
      }

      logger(`API endpoint DELETE /promotions/${id} was called...`);
      const success = await PromotionService.deletePromotion(promotionId, businessId);
      
      if (!success) {
        res.status(404).json({ error: 'Promotion not found' });
        return;
      }

      res.json({
        message: 'Promotion deleted successfully'
      });
    } catch (error) {
      logger(`Error deleting promotion: ${error}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Search promotions
   */
  public static searchPromotions = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { q } = req.query;
      const businessId = req.user!.businessId;
      
      if (!q || typeof q !== 'string') {
        res.status(400).json({ error: 'Search query is required' });
        return;
      }

      logger(`API endpoint GET /promotions/search was called...`);
      const promotions = await PromotionService.searchPromotions(q, businessId);
      
      res.json({
        message: 'Promotions search completed',
        data: promotions
      });
    } catch (error) {
      logger(`Error searching promotions: ${error}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Get active promotions
   */
  public static getActivePromotions = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const businessId = req.user!.businessId;

      logger(`API endpoint GET /promotions/active was called...`);
      const promotions = await PromotionService.getActivePromotions(businessId);
      
      res.json({
        message: 'Active promotions retrieved successfully',
        data: promotions
      });
    } catch (error) {
      logger(`Error getting active promotions: ${error}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Get promotion statistics
   */
  public static getPromotionStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const businessId = req.user!.businessId;

      logger(`API endpoint GET /promotions/stats was called...`);
      const stats = await PromotionService.getPromotionStats(businessId);
      
      res.json({
        message: 'Promotion statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      logger(`Error getting promotion statistics: ${error}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Add items to promotion
   */
  public static addPromotionItems = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { items } = req.body;
      const businessId = req.user!.businessId;
      
      if (!id) {
        res.status(400).json({ error: 'Promotion ID is required' });
        return;
      }
      
      const promotionId = parseInt(id);
      
      if (isNaN(promotionId)) {
        res.status(400).json({ error: 'Invalid promotion ID' });
        return;
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({ error: 'Items array is required and must not be empty' });
        return;
      }

      // Validate items structure
      for (const item of items) {
        if (!item.itemId && !item.recipeId) {
          res.status(400).json({ error: 'Each item must have either itemId or recipeId' });
          return;
        }
      }

      logger(`API endpoint POST /promotions/${id}/items was called...`);
      const promotionItems = await PromotionService.addPromotionItems(promotionId, businessId, items);
      
      res.status(201).json({
        message: 'Items added to promotion successfully',
        data: promotionItems
      });
    } catch (error) {
      logger(`Error adding promotion items: ${error}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Get promotion items
   */
  public static getPromotionItems = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const businessId = req.user!.businessId;
      
      if (!id) {
        res.status(400).json({ error: 'Promotion ID is required' });
        return;
      }
      
      const promotionId = parseInt(id);
      
      if (isNaN(promotionId)) {
        res.status(400).json({ error: 'Invalid promotion ID' });
        return;
      }

      logger(`API endpoint GET /promotions/${id}/items was called...`);
      const items = await PromotionService.getPromotionItems(promotionId, businessId);
      
      res.json({
        message: 'Promotion items retrieved successfully',
        data: items
      });
    } catch (error) {
      logger(`Error getting promotion items: ${error}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Remove items from promotion
   */
  public static removePromotionItems = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { itemIds } = req.body;
      const businessId = req.user!.businessId;
      
      if (!id) {
        res.status(400).json({ error: 'Promotion ID is required' });
        return;
      }
      
      const promotionId = parseInt(id);
      
      if (isNaN(promotionId)) {
        res.status(400).json({ error: 'Invalid promotion ID' });
        return;
      }

      if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
        res.status(400).json({ error: 'Item IDs array is required and must not be empty' });
        return;
      }

      logger(`API endpoint DELETE /promotions/${id}/items was called...`);
      const success = await PromotionService.removePromotionItems(promotionId, businessId, itemIds);
      
      if (!success) {
        res.status(404).json({ error: 'No items found to remove' });
        return;
      }

      res.json({
        message: 'Items removed from promotion successfully'
      });
    } catch (error) {
      logger(`Error removing promotion items: ${error}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
} 