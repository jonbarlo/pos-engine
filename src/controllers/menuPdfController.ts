import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { MenuPdfService, MenuPdfOptions } from '../services/menuPdfService';
import { logger } from '../utils/logger';

export class MenuPdfController {
  /**
   * Generate and download PDF menu
   */
  public static generatePdf = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const businessId = parseInt(req.params.businessId || '0');
      
      if (!businessId) {
        res.status(400).json({ success: false, message: 'Business ID is required' });
        return;
      }

      // Validate user has access to this business
      if (req.user?.businessId && req.user.businessId !== businessId) {
        res.status(403).json({ success: false, message: 'Access denied to this business' });
        return;
      }

      // Debug: Log the received parameters
      logger(`PDF Generation Request Body: ${JSON.stringify(req.body)}`);
      logger(`Received categoryBackgroundColor: ${req.body.categoryBackgroundColor}`);

      const options: MenuPdfOptions = {
        template: req.body.template || 'elegant',
        includePrices: req.body.includePrices !== false,
        includeDescriptions: req.body.includeDescriptions !== false,
        includeAllergens: req.body.includeAllergens !== false,
        includeCalories: req.body.includeCalories !== false,
        includeImages: req.body.includeImages !== false,
        includeBusinessLogo: req.body.includeBusinessLogo !== false,
        orientation: req.body.orientation || 'portrait',
        fontSize: req.body.fontSize || 'medium',
        colorScheme: req.body.colorScheme || 'light',
        // New category-based options
        categoryLayout: req.body.categoryLayout || 'same-page',
        categoryBackgroundColor: req.body.categoryBackgroundColor || '#f8f9fa',
        maxItemsPerPage: req.body.maxItemsPerPage || 8,
        showCategoryTitles: req.body.showCategoryTitles !== false
      };

      logger(`API endpoint POST /menu/${businessId}/pdf was called...`);
      logger(`Applied categoryBackgroundColor: ${options.categoryBackgroundColor}`);
      
      // Generate PDF
      const pdfBuffer = await MenuPdfService.generateMenuPdf(businessId, options);
      
      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="menu-${businessId}-${Date.now()}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length.toString());
      
      // Send PDF buffer
      res.send(pdfBuffer);
      
    } catch (error) {
      logger(`Error generating PDF menu: ${error}`);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  };

  /**
   * Get available PDF templates
   */
  public static getTemplates = async (req: Request, res: Response): Promise<void> => {
    try {
      logger('API endpoint GET /menu/pdf/templates was called...');
      
      const templates = MenuPdfService.getAvailableTemplates();
      
      res.json({
        success: true,
        data: templates
      });
      
    } catch (error) {
      logger(`Error getting PDF templates: ${error}`);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  };

  /**
   * Preview menu data (without generating PDF)
   */
  public static previewMenu = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const businessId = parseInt(req.params.businessId || '0');
      
      if (!businessId) {
        res.status(400).json({ success: false, message: 'Business ID is required' });
        return;
      }

      // Validate user has access to this business
      if (req.user?.businessId && req.user.businessId !== businessId) {
        res.status(403).json({ success: false, message: 'Access denied to this business' });
        return;
      }

      logger(`API endpoint GET /menu/${businessId}/preview was called...`);
      
      // Get menu data directly from models
      const { BusinessModel, MenuCategoryModel, MenuItemModel } = await import('../models');
      
      const business = await BusinessModel.findByPk(businessId);
      if (!business) {
        res.status(404).json({ success: false, message: 'Business not found' });
        return;
      }

      const categories = await MenuCategoryModel.findAll({
        where: { businessId, isActive: true },
        include: [{
          model: MenuItemModel,
          as: 'menuItems',
          where: { isAvailable: true },
          required: false
        }],
        order: [['displayOrder', 'ASC'], ['name', 'ASC']]
      });

      const menuData = {
        business: {
          name: business.name,
          description: business.description,
          logo: business.logo,
          address: business.address,
          phone: business.phone,
          website: business.website
        },
        categories: categories.map(category => ({
          id: category.id,
          name: category.name,
          description: category.description,
          colorCode: category.colorCode,
          itemCount: category.menuItems?.length || 0,
          items: category.menuItems?.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            isVegetarian: item.isVegetarian,
            isVegan: item.isVegan,
            isGlutenFree: item.isGlutenFree,
            isSpicy: item.isSpicy
          })) || []
        }))
      };
      
      res.json({
        success: true,
        data: menuData
      });
      
    } catch (error) {
      logger(`Error previewing menu: ${error}`);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  };
} 