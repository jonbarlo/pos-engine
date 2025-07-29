import { Request, Response } from 'express';
import { MenuPdfService } from '../services/menuPdfService';

export class CustomMenuTemplateController {
  static async getCustomTemplates(req: Request, res: Response): Promise<void> {
    try {
      const businessIdParam = req.params.businessId;
      if (!businessIdParam) {
        res.status(400).json({ success: false, message: 'Business ID is required' });
        return;
      }
      
      const businessId = parseInt(businessIdParam);
      
      if (isNaN(businessId)) {
        res.status(400).json({ success: false, message: 'Invalid business ID' });
        return;
      }

      const templates = await MenuPdfService.getCustomTemplates(businessId);
      
      res.status(200).json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Error getting custom templates:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async createCustomTemplate(req: Request, res: Response): Promise<void> {
    try {
      const businessIdParam = req.params.businessId;
      if (!businessIdParam) {
        res.status(400).json({ success: false, message: 'Business ID is required' });
        return;
      }
      
      const businessId = parseInt(businessIdParam);
      
      if (isNaN(businessId)) {
        res.status(400).json({ success: false, message: 'Invalid business ID' });
        return;
      }

      const { name, description, css, html, isDefault } = req.body;

      if (!name || !css) {
        res.status(400).json({ success: false, message: 'Name and CSS are required' });
        return;
      }

      const template = await MenuPdfService.createCustomTemplate({
        businessId,
        name,
        description,
        css,
        html,
        isDefault
      });

      res.status(201).json({
        success: true,
        data: template
      });
    } catch (error) {
      console.error('Error creating custom template:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async updateCustomTemplate(req: Request, res: Response): Promise<void> {
    try {
      const businessIdParam = req.params.businessId;
      const templateIdParam = req.params.templateId;
      
      if (!businessIdParam || !templateIdParam) {
        res.status(400).json({ success: false, message: 'Business ID and template ID are required' });
        return;
      }
      
      const businessId = parseInt(businessIdParam);
      const templateId = parseInt(templateIdParam);
      
      if (isNaN(businessId) || isNaN(templateId)) {
        res.status(400).json({ success: false, message: 'Invalid business ID or template ID' });
        return;
      }

      const { name, description, css, html, isActive, isDefault } = req.body;

      const template = await MenuPdfService.updateCustomTemplate(templateId, businessId, {
        name,
        description,
        css,
        html,
        isActive,
        isDefault
      });

      if (!template) {
        res.status(404).json({ success: false, message: 'Template not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: template
      });
    } catch (error) {
      console.error('Error updating custom template:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async deleteCustomTemplate(req: Request, res: Response): Promise<void> {
    try {
      const businessIdParam = req.params.businessId;
      const templateIdParam = req.params.templateId;
      
      if (!businessIdParam || !templateIdParam) {
        res.status(400).json({ success: false, message: 'Business ID and template ID are required' });
        return;
      }
      
      const businessId = parseInt(businessIdParam);
      const templateId = parseInt(templateIdParam);
      
      if (isNaN(businessId) || isNaN(templateId)) {
        res.status(400).json({ success: false, message: 'Invalid business ID or template ID' });
        return;
      }

      const deleted = await MenuPdfService.deleteCustomTemplate(templateId, businessId);

      if (!deleted) {
        res.status(404).json({ success: false, message: 'Template not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Template deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting custom template:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}