import puppeteer from 'puppeteer';
import { logger } from '../utils/logger';
import { MenuItemModel, MenuCategoryModel, BusinessModel } from '../models';
import { isRestaurantBusiness } from '../utils/businessTypeCheck';

export interface MenuPdfOptions {
  template?: 'elegant' | 'modern' | 'classic' | 'minimal';
  includeImages?: boolean;
  includePrices?: boolean;
  includeDescriptions?: boolean;
  includeAllergens?: boolean;
  includeCalories?: boolean;
  colorScheme?: 'dark' | 'light' | 'auto';
  fontSize?: 'small' | 'medium' | 'large';
  orientation?: 'portrait' | 'landscape';
}

export interface MenuData {
  business: {
    name: string;
    description?: string;
    logo?: string;
    address?: string;
    phone?: string;
    website?: string;
  };
  categories: Array<{
    id: number;
    name: string;
    description?: string;
    colorCode?: string;
    items: Array<{
      id: number;
      name: string;
      description?: string;
      price: number;
      imageUrl?: string;
      ingredients?: string[];
      allergens?: string[];
      calories?: number;
      isVegetarian: boolean;
      isVegan: boolean;
      isGlutenFree: boolean;
      isSpicy: boolean;
      spiceLevel?: number;
      preparationTime?: number;
    }>;
  }>;
}

export class MenuPdfService {
  private static readonly TEMPLATES = {
    elegant: {
      name: 'Elegant',
      description: 'Sophisticated design with serif fonts and gold accents',
      css: `
        body { font-family: 'Georgia', serif; margin: 0; padding: 20px; background: #fafafa; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #d4af37; padding-bottom: 20px; }
        .business-name { font-size: 2.5em; color: #2c3e50; margin-bottom: 10px; }
        .business-description { font-size: 1.1em; color: #7f8c8d; font-style: italic; }
        .category { margin-bottom: 40px; }
        .category-name { font-size: 1.8em; color: #d4af37; border-bottom: 1px solid #d4af37; padding-bottom: 10px; margin-bottom: 20px; }
        .item { margin-bottom: 25px; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .item-name { font-size: 1.3em; color: #2c3e50; margin-bottom: 8px; font-weight: bold; }
        .item-description { color: #7f8c8d; margin-bottom: 8px; line-height: 1.4; }
        .item-price { font-size: 1.2em; color: #d4af37; font-weight: bold; float: right; }
        .item-details { font-size: 0.9em; color: #95a5a6; }
        .dietary-badges { margin-top: 8px; }
        .badge { display: inline-block; padding: 2px 8px; margin-right: 5px; border-radius: 12px; font-size: 0.8em; }
        .badge-vegetarian { background: #27ae60; color: white; }
        .badge-vegan { background: #2ecc71; color: white; }
        .badge-gluten-free { background: #f39c12; color: white; }
        .badge-spicy { background: #e74c3c; color: white; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ecf0f1; color: #7f8c8d; }
      `
    },
    modern: {
      name: 'Modern',
      description: 'Clean and contemporary design with sans-serif fonts',
      css: `
        body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; background: #ffffff; }
        .header { text-align: center; margin-bottom: 40px; }
        .business-name { font-size: 2.8em; color: #34495e; margin-bottom: 15px; font-weight: 300; }
        .business-description { font-size: 1.2em; color: #7f8c8d; }
        .category { margin-bottom: 50px; }
        .category-name { font-size: 2em; color: #3498db; margin-bottom: 25px; font-weight: 300; text-transform: uppercase; letter-spacing: 2px; }
        .item { margin-bottom: 30px; padding: 20px; border-left: 4px solid #3498db; background: #f8f9fa; }
        .item-name { font-size: 1.4em; color: #2c3e50; margin-bottom: 10px; font-weight: 600; }
        .item-description { color: #7f8c8d; margin-bottom: 10px; line-height: 1.5; }
        .item-price { font-size: 1.3em; color: #e74c3c; font-weight: bold; float: right; }
        .item-details { font-size: 0.9em; color: #95a5a6; }
        .dietary-badges { margin-top: 10px; }
        .badge { display: inline-block; padding: 4px 10px; margin-right: 8px; border-radius: 15px; font-size: 0.8em; font-weight: 600; }
        .badge-vegetarian { background: #27ae60; color: white; }
        .badge-vegan { background: #2ecc71; color: white; }
        .badge-gluten-free { background: #f39c12; color: white; }
        .badge-spicy { background: #e74c3c; color: white; }
        .footer { text-align: center; margin-top: 50px; padding-top: 30px; border-top: 2px solid #ecf0f1; color: #7f8c8d; }
      `
    },
    classic: {
      name: 'Classic',
      description: 'Traditional restaurant menu style',
      css: `
        body { font-family: 'Times New Roman', serif; margin: 0; padding: 25px; background: #fff; }
        .header { text-align: center; margin-bottom: 35px; }
        .business-name { font-size: 2.2em; color: #000; margin-bottom: 10px; font-weight: bold; }
        .business-description { font-size: 1em; color: #666; }
        .category { margin-bottom: 35px; }
        .category-name { font-size: 1.6em; color: #000; margin-bottom: 15px; font-weight: bold; text-transform: uppercase; }
        .item { margin-bottom: 20px; }
        .item-name { font-size: 1.2em; color: #000; margin-bottom: 5px; font-weight: bold; }
        .item-description { color: #666; margin-bottom: 5px; font-style: italic; }
        .item-price { font-size: 1.1em; color: #000; font-weight: bold; float: right; }
        .item-details { font-size: 0.85em; color: #888; }
        .dietary-badges { margin-top: 5px; }
        .badge { display: inline-block; padding: 2px 6px; margin-right: 5px; border-radius: 8px; font-size: 0.75em; }
        .badge-vegetarian { background: #27ae60; color: white; }
        .badge-vegan { background: #2ecc71; color: white; }
        .badge-gluten-free { background: #f39c12; color: white; }
        .badge-spicy { background: #e74c3c; color: white; }
        .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ccc; color: #666; }
      `
    },
    minimal: {
      name: 'Minimal',
      description: 'Clean and simple design with focus on content',
      css: `
        body { font-family: 'Helvetica', sans-serif; margin: 0; padding: 30px; background: #ffffff; }
        .header { text-align: center; margin-bottom: 50px; }
        .business-name { font-size: 2.5em; color: #333; margin-bottom: 15px; font-weight: 300; }
        .business-description { font-size: 1.1em; color: #666; }
        .category { margin-bottom: 60px; }
        .category-name { font-size: 1.8em; color: #333; margin-bottom: 30px; font-weight: 400; }
        .item { margin-bottom: 40px; }
        .item-name { font-size: 1.3em; color: #333; margin-bottom: 8px; font-weight: 500; }
        .item-description { color: #666; margin-bottom: 8px; line-height: 1.6; }
        .item-price { font-size: 1.2em; color: #333; font-weight: 500; float: right; }
        .item-details { font-size: 0.9em; color: #999; }
        .dietary-badges { margin-top: 8px; }
        .badge { display: inline-block; padding: 3px 8px; margin-right: 6px; border-radius: 12px; font-size: 0.8em; }
        .badge-vegetarian { background: #27ae60; color: white; }
        .badge-vegan { background: #2ecc71; color: white; }
        .badge-gluten-free { background: #f39c12; color: white; }
        .badge-spicy { background: #e74c3c; color: white; }
        .footer { text-align: center; margin-top: 60px; padding-top: 40px; border-top: 1px solid #eee; color: #999; }
      `
    }
  };

  static async generateMenuPdf(businessId: number, options: MenuPdfOptions = {}): Promise<Buffer> {
    try {
      logger(`Generating PDF menu for business ${businessId} with template: ${options.template || 'elegant'}`);

      // Validate business is restaurant type
      if (!(await isRestaurantBusiness(businessId))) {
        throw new Error('Menu PDF generation is only available for restaurant businesses');
      }

      // Get menu data
      const menuData = await this.getMenuData(businessId);
      
      // Generate HTML
      const html = this.generateHtml(menuData, options);
      
      // Generate PDF
      const pdf = await this.htmlToPdf(html, options);
      
      logger(`PDF menu generated successfully for business ${businessId}`);
      return pdf;
    } catch (error) {
      logger(`Error generating PDF menu: ${error}`);
      throw error;
    }
  }

  private static async getMenuData(businessId: number): Promise<MenuData> {
    // Get business info
    const business = await BusinessModel.findByPk(businessId);
    if (!business) {
      throw new Error('Business not found');
    }

    // Get categories with items
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

    return {
      business: {
        name: business.name,
        ...(business.description && { description: business.description }),
        ...(business.logo && { logo: business.logo }),
        ...(business.address && { address: business.address }),
        ...(business.phone && { phone: business.phone }),
        ...(business.website && { website: business.website })
      },
      categories: categories.map(category => ({
        id: category.id,
        name: category.name,
        ...(category.description && { description: category.description }),
        ...(category.colorCode && { colorCode: category.colorCode }),
        items: category.menuItems?.map(item => ({
          id: item.id,
          name: item.name,
          ...(item.description && { description: item.description }),
          price: item.price,
          ...(item.imageUrl && { imageUrl: item.imageUrl }),
          ...(item.ingredients && { ingredients: item.ingredients }),
          ...(item.allergens && { allergens: item.allergens }),
          ...(item.calories && { calories: item.calories }),
          isVegetarian: item.isVegetarian,
          isVegan: item.isVegan,
          isGlutenFree: item.isGlutenFree,
          isSpicy: item.isSpicy,
          ...(item.spiceLevel && { spiceLevel: item.spiceLevel }),
          ...(item.preparationTime && { preparationTime: item.preparationTime })
        })) || []
      }))
    };
  }

  private static generateHtml(menuData: MenuData, options: MenuPdfOptions): string {
    const template = this.TEMPLATES[options.template || 'elegant'];
    const includePrices = options.includePrices !== false;
    const includeDescriptions = options.includeDescriptions !== false;
    const includeAllergens = options.includeAllergens !== false;
    const includeCalories = options.includeCalories !== false;

    const categoriesHtml = menuData.categories.map(category => `
      <div class="category">
        <h2 class="category-name">${category.name}</h2>
        ${category.items.map(item => `
          <div class="item">
            <div class="item-header">
              <span class="item-name">${item.name}</span>
              ${includePrices ? `<span class="item-price">$${item.price.toFixed(2)}</span>` : ''}
            </div>
            ${includeDescriptions && item.description ? `<div class="item-description">${item.description}</div>` : ''}
            <div class="item-details">
              ${item.preparationTime ? `<span>⏱️ ${item.preparationTime} min</span>` : ''}
              ${includeCalories && item.calories ? `<span>🔥 ${item.calories} cal</span>` : ''}
              ${includeAllergens && item.allergens && item.allergens.length > 0 ? 
                `<span>⚠️ Allergens: ${item.allergens.join(', ')}</span>` : ''}
            </div>
            <div class="dietary-badges">
              ${item.isVegetarian ? '<span class="badge badge-vegetarian">Vegetarian</span>' : ''}
              ${item.isVegan ? '<span class="badge badge-vegan">Vegan</span>' : ''}
              ${item.isGlutenFree ? '<span class="badge badge-gluten-free">Gluten-Free</span>' : ''}
              ${item.isSpicy ? `<span class="badge badge-spicy">Spicy${item.spiceLevel ? ` (${item.spiceLevel}/5)` : ''}</span>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${menuData.business.name} - Menu</title>
          <style>
            ${template.css}
            .item-header { display: flex; justify-content: space-between; align-items: center; }
            .item-details span { margin-right: 15px; }
            @media print {
              body { margin: 0; }
              .item { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="business-name">${menuData.business.name}</h1>
            ${menuData.business.description ? `<p class="business-description">${menuData.business.description}</p>` : ''}
            ${menuData.business.address || menuData.business.phone ? `
              <div class="business-info">
                ${menuData.business.address ? `<p>📍 ${menuData.business.address}</p>` : ''}
                ${menuData.business.phone ? `<p>📞 ${menuData.business.phone}</p>` : ''}
              </div>
            ` : ''}
          </div>
          
          ${categoriesHtml}
          
          <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString()}</p>
            ${menuData.business.website ? `<p>Visit us at: ${menuData.business.website}</p>` : ''}
          </div>
        </body>
      </html>
    `;
  }

  private static async htmlToPdf(html: string, options: MenuPdfOptions): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfOptions: any = {
        format: 'A4' as any,
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        },
        ...(options.orientation === 'landscape' && { landscape: true })
      };

      const pdf = await page.pdf(pdfOptions);
      return pdf;
    } finally {
      await browser.close();
    }
  }

  static getAvailableTemplates(): Array<{id: string, name: string, description: string}> {
    return Object.entries(this.TEMPLATES).map(([id, template]) => ({
      id,
      name: template.name,
      description: template.description
    }));
  }
} 