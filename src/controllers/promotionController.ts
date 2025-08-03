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
      if (!promotionData.name || !promotionData.type || !promotionData.discountType || !promotionData.discountValue) {
        res.status(400).json({ error: req.t('errors.validation.promotionFieldsRequired') });
        return;
      }

      // Validate discount value
      if (promotionData.discountValue <= 0) {
        res.status(400).json({ error: req.t('errors.validation.discountValueMustBePositive') });
        return;
      }

      // Validate dates
      if (promotionData.startDate && promotionData.endDate) {
        const startDate = new Date(promotionData.startDate);
        const endDate = new Date(promotionData.endDate);
        
        if (endDate <= startDate) {
          res.status(400).json({ error: req.t('errors.validation.endDateAfterStartDate') });
          return;
        }
      }

      logger(`API endpoint POST /promotions was called...`);
      const promotion = await PromotionService.createPromotion({
        ...promotionData,
        businessId
      });
      
      res.status(201).json({
        message: req.t('promotions.create.success'),
        data: promotion
      });
    } catch (error) {
      logger(`Error creating promotion: ${error}`);
      res.status(500).json({ error: req.t('promotions.create.error') });
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
        res.status(400).json({ error: req.t('errors.validation.promotionIdRequired') });
        return;
      }
      
      const promotionId = parseInt(id);
      
      if (isNaN(promotionId)) {
        res.status(400).json({ error: req.t('errors.validation.invalidPromotionId') });
        return;
      }

      logger(`API endpoint GET /promotions/${id} was called...`);
      const promotion = await PromotionService.getPromotionById(promotionId, businessId);
      
      if (!promotion) {
        res.status(404).json({ error: req.t('errors.server.promotionNotFound') });
        return;
      }

      res.json({
        message: req.t('promotions.getById.success'),
        data: promotion
      });
    } catch (error) {
      logger(`Error getting promotion: ${error}`);
      res.status(500).json({ error: req.t('promotions.getById.error') });
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
        message: req.t('promotions.getAll.success'),
        data: result.promotions,
        pagination: result.pagination
      });
    } catch (error) {
      logger(`Error getting promotions: ${error}`);
      res.status(500).json({ error: req.t('promotions.getAll.error') });
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
          res.status(400).json({ error: req.t('errors.validation.endDateAfterStartDate') });
          return;
        }
      }

      logger(`API endpoint PUT /promotions/${id} was called...`);
      const promotion = await PromotionService.updatePromotion(promotionId, businessId, updateData);
      
      if (!promotion) {
        res.status(404).json({ error: req.t('errors.server.promotionNotFound') });
        return;
      }

      res.json({
        message: req.t('promotions.update.success'),
        data: promotion
      });
    } catch (error) {
      logger(`Error updating promotion: ${error}`);
      res.status(500).json({ error: req.t('promotions.update.error') });
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
        res.status(404).json({ error: req.t('errors.server.promotionNotFound') });
        return;
      }

      res.json({
        message: req.t('promotions.delete.success')
      });
    } catch (error) {
      logger(`Error deleting promotion: ${error}`);
      res.status(500).json({ error: req.t('promotions.delete.error') });
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
        res.status(400).json({ error: req.t('errors.validation.searchQueryRequired') });
        return;
      }

      logger(`API endpoint GET /promotions/search was called...`);
      const promotions = await PromotionService.searchPromotions(q, businessId);
      
      res.json({
        message: req.t('promotions.search.success'),
        data: promotions
      });
    } catch (error) {
      logger(`Error searching promotions: ${error}`);
      res.status(500).json({ error: req.t('promotions.search.error') });
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
        message: req.t('promotions.getActive.success'),
        data: promotions
      });
    } catch (error) {
      logger(`Error getting active promotions: ${error}`);
      res.status(500).json({ error: req.t('promotions.getActive.error') });
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
        message: req.t('promotions.getStats.success'),
        data: stats
      });
    } catch (error) {
      logger(`Error getting promotion statistics: ${error}`);
      res.status(500).json({ error: req.t('promotions.getStats.error') });
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
        res.status(400).json({ error: req.t('errors.validation.promotionItemsArrayRequired') });
        return;
      }

      // Validate items structure
      for (const item of items) {
        if (!item.itemId && !item.recipeId) {
          res.status(400).json({ error: req.t('errors.validation.promotionItemStructureRequired') });
          return;
        }
      }

      logger(`API endpoint POST /promotions/${id}/items was called...`);
      const promotionItems = await PromotionService.addPromotionItems(promotionId, businessId, items);
      
      res.status(201).json({
        message: req.t('promotions.addItems.success'),
        data: promotionItems
      });
    } catch (error) {
      logger(`Error adding promotion items: ${error}`);
      res.status(500).json({ error: req.t('promotions.addItems.error') });
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
        message: req.t('promotions.getItems.success'),
        data: items
      });
    } catch (error) {
      logger(`Error getting promotion items: ${error}`);
      res.status(500).json({ error: req.t('promotions.getItems.error') });
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
        res.status(400).json({ error: req.t('errors.validation.promotionItemIdsArrayRequired') });
        return;
      }

      logger(`API endpoint DELETE /promotions/${id}/items was called...`);
      const success = await PromotionService.removePromotionItems(promotionId, businessId, itemIds);
      
      if (!success) {
        res.status(404).json({ error: req.t('errors.server.noItemsToRemove') });
        return;
      }

      res.json({
        message: req.t('promotions.removeItems.success')
      });
    } catch (error) {
      logger(`Error removing promotion items: ${error}`);
      res.status(500).json({ error: req.t('promotions.removeItems.error') });
    }
  };
} 