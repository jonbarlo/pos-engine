import { Request, Response, NextFunction } from 'express';
import { SaleService } from '../services/saleService';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export class SaleController {
  /**
   * Create a new sale
   */
  public static createSale = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { existingOrderId, ...saleData } = req.body;
      
      if (!saleData.userId || saleData.totalAmount === undefined || !saleData.businessId) {
        res.status(400).json({ error: req.t('errors.validation.saleFieldsRequired') });
        return;
      }

      logger(`API endpoint POST /sales was called...`);
      logger(`DEBUG: Existing order ID: ${existingOrderId}`);
      const sale = await SaleService.createSale(saleData, existingOrderId);
      
      res.status(201).json({
        message: req.t('sales.create.success'),
        sale
      });
    } catch (error) {
      logger(`Error creating sale: ${error}`);
      res.status(500).json({ error: req.t('errors.server.internal') });
    }
  };

  /**
   * Get sale by ID
   */
  public static getSaleById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: req.t('errors.validation.saleIdRequired') });
        return;
      }
      
      const saleId = parseInt(id);
      
      if (isNaN(saleId)) {
        res.status(400).json({ error: req.t('errors.validation.invalidSaleId') });
        return;
      }

      logger(`API endpoint GET /sales/${id} was called...`);
      const businessId = req.user!.businessId;
      const sale = await SaleService.getSaleById(saleId, businessId);
      
      if (!sale) {
        res.status(404).json({ error: req.t('errors.server.saleNotFound') });
        return;
      }

      res.json(sale);
    } catch (error) {
      logger(`Error getting sale: ${error}`);
      res.status(500).json({ error: req.t('errors.server.internal') });
    }
  };

  /**
   * Get all sales with optional filtering and pagination
   */
  public static getAllSales = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { page, limit, status, userId, startDate, endDate } = req.query;
      
      const filters: any = {};
      if (page) filters.page = parseInt(page as string);
      if (limit) filters.limit = parseInt(limit as string);
      if (status) filters.status = status;
      if (userId) filters.userId = parseInt(userId as string);
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      logger(`API endpoint GET /sales was called...`);
      const sales = await SaleService.getAllSales(filters);
      
      res.json(sales);
    } catch (error) {
      logger(`Error getting sales: ${error}`);
      res.status(500).json({ error: req.t('errors.server.internal') });
    }
  };

  /**
   * Update sale by ID
   */
  public static updateSale = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      if (!id) {
        res.status(400).json({ error: req.t('errors.validation.saleIdRequired') });
        return;
      }
      
      const saleId = parseInt(id);
      
      if (isNaN(saleId)) {
        res.status(400).json({ error: req.t('errors.validation.invalidSaleId') });
        return;
      }

      if (Object.keys(updateData).length === 0) {
        res.status(400).json({ error: req.t('errors.validation.noFieldsToUpdate') });
        return;
      }

      logger(`API endpoint PUT /sales/${id} was called...`);
      const businessId = req.user!.businessId;
      const updatedSale = await SaleService.updateSale(saleId, businessId, updateData);
      
      if (!updatedSale) {
        res.status(404).json({ error: req.t('errors.server.saleNotFound') });
        return;
      }

      res.json({
        message: req.t('sales.update.success'),
        sale: updatedSale
      });
    } catch (error) {
      logger(`Error updating sale: ${error}`);
      res.status(500).json({ error: req.t('errors.server.internal') });
    }
  };

  /**
   * Delete sale by ID
   */
  public static deleteSale = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: req.t('errors.validation.saleIdRequired') });
        return;
      }
      
      const saleId = parseInt(id);
      
      if (isNaN(saleId)) {
        res.status(400).json({ error: req.t('errors.validation.invalidSaleId') });
        return;
      }

      logger(`API endpoint DELETE /sales/${id} was called...`);
      const businessId = req.user!.businessId;
      const deleted = await SaleService.deleteSale(saleId, businessId);
      
      if (!deleted) {
        res.status(404).json({ error: req.t('errors.server.saleNotFound') });
        return;
      }

      res.json({ message: req.t('sales.delete.success') });
    } catch (error) {
      logger(`Error deleting sale: ${error}`);
      res.status(500).json({ error: req.t('errors.server.internal') });
    }
  };

  /**
   * Get sales by user ID
   */
  public static getSalesByUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        res.status(400).json({ error: req.t('errors.validation.userIdRequired') });
        return;
      }
      
      const userIdNum = parseInt(userId);
      
      if (isNaN(userIdNum)) {
        res.status(400).json({ error: req.t('errors.validation.invalidUserId') });
        return;
      }

      logger(`API endpoint GET /sales/user/${userId} was called...`);
      const businessId = req.user!.businessId;
      const sales = await SaleService.getSalesByUser(userIdNum, businessId);
      
      res.json(sales);
    } catch (error) {
      logger(`Error getting sales by user: ${error}`);
      res.status(500).json({ error: req.t('errors.server.internal') });
    }
  };

  /**
   * Get sales statistics
   */
  public static getSalesStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      logger('API endpoint GET /sales/stats was called...');
      const stats = await SaleService.getSalesStats();
      
      res.json(stats);
    } catch (error) {
      logger(`Error getting sales stats: ${error}`);
      res.status(500).json({ error: req.t('errors.server.internal') });
    }
  };

  /**
   * Create sale with order items
   */
  public static createSaleWithItems = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { orderItems, existingOrderId, ...saleData } = req.body;
      // Log the incoming data for debugging
      logger(`DEBUG: Incoming request body: ${JSON.stringify(req.body)}`);
      logger(`DEBUG: Extracted saleData: ${JSON.stringify(saleData)}`);
      logger(`DEBUG: Extracted orderItems: ${JSON.stringify(orderItems)}`);
      logger(`DEBUG: Existing order ID: ${existingOrderId}`);

      if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
        res.status(400).json({ error: req.t('errors.validation.orderItemsRequired') });
        return;
      }

      // Validate required fields for sale creation
      if (!saleData.userId || !saleData.businessId) {
        res.status(400).json({ error: req.t('errors.validation.userAndBusinessIdRequired') });
        return;
      }

      // Validate order items
      for (const item of orderItems) {
        if (!item.itemId || !item.quantity || !item.unitPrice) {
          res.status(400).json({ 
            error: req.t('errors.validation.orderItemFieldsRequired') 
          });
          return;
        }
      }

      logger('API endpoint POST /sales/with-items was called...');
      const sale = await SaleService.createSaleWithItems(saleData, orderItems, existingOrderId);
      
      // Update item tracking data after successful sale creation
      try {
        const { ItemTrackingService } = await import('../services/itemTrackingService');
        await ItemTrackingService.updateItemTrackingOnSale(sale.id);
        logger(`Item tracking updated for sale ${sale.id}`);
      } catch (trackingError) {
        logger(`Warning: Failed to update item tracking for sale ${sale.id}: ${trackingError}`);
        // Don't fail the sale creation if tracking update fails
      }
      
      res.status(201).json({
        message: req.t('sales.createWithItems.success'),
        sale
      });
    } catch (error) {
      logger('ERROR: Full error object:');
      logger(`ERROR: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: req.t('errors.server.internal') });
    }
  };

  /**
   * Get sale with order items
   */
  public static getSaleWithItems = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: req.t('errors.validation.saleIdRequired') });
        return;
      }
      
      const saleId = parseInt(id);
      
      if (isNaN(saleId)) {
        res.status(400).json({ error: req.t('errors.validation.invalidSaleId') });
        return;
      }

      logger(`API endpoint GET /sales/${id}/with-items was called...`);
      const businessId = req.user!.businessId;
      const sale = await SaleService.getSaleWithItems(saleId, businessId);
      
      if (!sale) {
        res.status(404).json({ error: req.t('errors.server.saleNotFound') });
        return;
      }

      res.json(sale);
    } catch (error) {
      logger(`Error getting sale with items: ${error}`);
      res.status(500).json({ error: req.t('errors.server.internal') });
    }
  };

  /**
   * Get sales by date range
   */
  public static getSalesByDateRange = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        res.status(400).json({ error: req.t('errors.validation.dateRangeRequired') });
        return;
      }
      
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({ error: req.t('errors.validation.invalidDateFormat') });
        return;
      }

      logger(`API endpoint GET /sales/date-range was called...`);
      const businessId = req.user!.businessId;
      const sales = await SaleService.getSalesByDateRange(start, end, businessId);
      
      res.json(sales);
    } catch (error) {
      logger(`Error getting sales by date range: ${error}`);
      res.status(500).json({ error: req.t('errors.server.internal') });
    }
  };

  /**
   * Create missing orders for existing sales (data recovery endpoint)
   * This endpoint should be used when sales exist but orders are missing
   */
  public static createMissingOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      logger(`API endpoint POST /sales/create-missing-orders was called...`);
      
      const businessId = req.user!.businessId;
      
      // This is a potentially expensive operation, so we should add some safety checks
      const result = await SaleService.createMissingOrdersForSales(businessId);
      
      res.json({
        message: req.t('sales.createMissingOrders.success'),
        result: {
          success: result.success,
          failed: result.failed,
          totalProcessed: result.success + result.failed,
          errors: result.errors
        }
      });
    } catch (error) {
      logger(`Error creating missing orders: ${error}`);
      res.status(500).json({ error: req.t('errors.server.internal') });
    }
  };

  /**
   * Get item performance analytics
   */
  public static getItemAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate, limit = 10 } = req.query;
      const businessId = req.user!.businessId;
      
      const filters: any = {};
      
      // Set default date range to include seeded data if no dates provided
      if (startDate) {
        filters.startDate = new Date(startDate as string);
      } else {
        // Default to 6 months ago to include seeded data
        filters.startDate = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
      }
      
      if (endDate) {
        filters.endDate = new Date(endDate as string);
      } else {
        // Default to 6 months in the future to include seeded data
        filters.endDate = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000);
      }
      
      if (limit) filters.limit = parseInt(limit as string);

      logger(`API endpoint GET /sales/analytics/items was called...`);
      const analytics = await SaleService.getItemAnalytics(businessId, filters);
      
      res.json(analytics);
    } catch (error) {
      logger(`Error getting item analytics: ${error}`);
      res.status(500).json({ error: req.t('errors.server.internal') });
    }
  };

  /**
   * Get revenue analytics and trends
   */
  public static getRevenueAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { period = 'monthly', startDate, endDate } = req.query;
      const businessId = req.user!.businessId;
      
      const filters: any = { period: period as string };
      
      // Set default date range to include seeded data if no dates provided
      if (startDate) {
        filters.startDate = new Date(startDate as string);
      } else {
        // Default to 6 months ago to include seeded data
        filters.startDate = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
      }
      
      if (endDate) {
        filters.endDate = new Date(endDate as string);
      } else {
        // Default to 6 months in the future to include seeded data
        filters.endDate = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000);
      }

      logger(`API endpoint GET /sales/analytics/revenue was called...`);
      const analytics = await SaleService.getRevenueAnalytics(businessId, filters);
      
      res.json(analytics);
    } catch (error) {
      logger(`Error getting revenue analytics: ${error}`);
      res.status(500).json({ error: req.t('errors.server.internal') });
    }
  };

  /**
   * Get staff performance analytics
   */
  public static getStaffAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query;
      const businessId = req.user!.businessId;
      
      const filters: any = {};
      
      // Set default date range to include seeded data if no dates provided
      if (startDate) {
        filters.startDate = new Date(startDate as string);
      } else {
        // Default to 6 months ago to include seeded data
        filters.startDate = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
      }
      
      if (endDate) {
        filters.endDate = new Date(endDate as string);
      } else {
        // Default to 6 months in the future to include seeded data
        filters.endDate = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000);
      }

      logger(`API endpoint GET /sales/analytics/staff was called...`);
      const analytics = await SaleService.getStaffAnalytics(businessId, filters);
      
      res.json(analytics);
    } catch (error) {
      logger(`Error getting staff analytics: ${error}`);
      res.status(500).json({ error: req.t('errors.server.internal') });
    }
  };

  /**
   * Get customer analytics
   */
  public static getCustomerAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate, limit = 10 } = req.query;
      const businessId = req.user!.businessId;
      
      const filters: any = {};
      
      // Set default date range to include seeded data if no dates provided
      if (startDate) {
        filters.startDate = new Date(startDate as string);
      } else {
        // Default to 6 months ago to include seeded data
        filters.startDate = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
      }
      
      if (endDate) {
        filters.endDate = new Date(endDate as string);
      } else {
        // Default to 6 months in the future to include seeded data
        filters.endDate = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000);
      }
      
      if (limit) filters.limit = parseInt(limit as string);

      logger(`API endpoint GET /sales/analytics/customers was called...`);
      const analytics = await SaleService.getCustomerAnalytics(businessId, filters);
      
      res.json(analytics);
    } catch (error) {
      logger(`Error getting customer analytics: ${error}`);
      res.status(500).json({ error: req.t('errors.server.internal') });
    }
  };

  /**
   * Get inventory performance analytics
   */
  public static getInventoryAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const businessId = req.user!.businessId;

      logger(`API endpoint GET /sales/analytics/inventory was called...`);
      const analytics = await SaleService.getInventoryAnalytics(businessId);
      
      res.json(analytics);
    } catch (error) {
      logger(`Error getting inventory analytics: ${error}`);
      res.status(500).json({ error: req.t('errors.server.internal') });
    }
  };
} 