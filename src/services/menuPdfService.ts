import puppeteer from 'puppeteer';
import { Buffer } from 'buffer';
import { BusinessModel } from '../models/BusinessModel';
import { MenuCategoryModel } from '../models/MenuCategoryModel';
import { MenuItemModel } from '../models/MenuItemModel';
import { CustomMenuTemplateModel } from '../models/CustomMenuTemplateModel';
import { isRestaurantBusiness } from '../utils/businessTypeCheck';

// Declare document for puppeteer
declare const document: any;

export interface MenuPdfOptions {
  template?: string;
  includePrices?: boolean;
  includeDescriptions?: boolean;
  includeAllergens?: boolean;
  includeCalories?: boolean;
  includeImages?: boolean;
  includeBusinessLogo?: boolean;
  orientation?: 'portrait' | 'landscape';
  fontSize?: 'small' | 'medium' | 'large';
  colorScheme?: 'dark' | 'light' | 'auto';
  customTemplateId?: number;
  // New category-based options
  categoryLayout?: 'same-page' | 'separate-page' | 'title-only';
  categoryBackgroundColor?: string;
  maxItemsPerPage?: number;
  showCategoryTitles?: boolean;
}

export interface MenuData {
  business: {
    id: number;
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
      price?: number;
      imageUrl?: string;
      isVegetarian?: boolean;
      isVegan?: boolean;
      isGlutenFree?: boolean;
      isSpicy?: boolean;
      calories?: number;
      allergens?: string[];
      preparationTime?: number;
      spiceLevel?: number;
    }>;
  }>;
}

// Built-in templates - Professional designs based on Apple HIG and Material UI
const TEMPLATES: { [key: string]: string } = {
  elegant: `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
      
      * { box-sizing: border-box; }
      
      body { 
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
        margin: 0; 
        padding: 0; 
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        color: #1a1a1a;
        line-height: 1.6;
        font-size: 16px;
      }
      
      .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 40px 30px;
        background: white;
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        border-radius: 16px;
        margin-top: 20px;
        margin-bottom: 20px;
      }
      
      .header { 
        text-align: center; 
        margin-bottom: 50px; 
        padding-bottom: 30px;
        border-bottom: 2px solid #f0f0f0;
        position: relative;
      }
      
      .header::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 50%;
        transform: translateX(-50%);
        width: 60px;
        height: 2px;
        background: linear-gradient(90deg, #d4af37, #f4d03f);
      }
      
      .business-name { 
        font-family: 'Playfair Display', serif;
        font-size: 3.2em; 
        color: #1a1a1a; 
        margin-bottom: 15px; 
        font-weight: 600;
        letter-spacing: -0.02em;
        line-height: 1.1;
      }
      
      .business-description { 
        font-size: 1.1em; 
        color: #6c757d; 
        font-weight: 400;
        max-width: 500px;
        margin: 0 auto;
      }
      
      .category { 
        margin-bottom: 60px; 
        position: relative;
      }
      
      .category-name { 
        font-family: 'Playfair Display', serif;
        font-size: 2.2em; 
        color: #1a1a1a; 
        margin-bottom: 25px; 
        font-weight: 500;
        position: relative;
        padding-bottom: 15px;
      }
      
      .category-name::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 40px;
        height: 3px;
        background: linear-gradient(90deg, #d4af37, #f4d03f);
        border-radius: 2px;
      }
      
      .item { 
        margin-bottom: 30px; 
        padding: 25px; 
        background: #fafbfc; 
        border-radius: 12px; 
        border: 1px solid #e9ecef;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      
      .item::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 100%;
        background: linear-gradient(180deg, #d4af37, #f4d03f);
      }
      
      .item-name { 
        font-family: 'Playfair Display', serif;
        font-size: 1.4em; 
        color: #1a1a1a; 
        font-weight: 600; 
        margin-bottom: 8px;
        line-height: 1.3;
      }
      
      .item-description { 
        color: #6c757d; 
        margin-bottom: 12px; 
        line-height: 1.5;
        font-size: 0.95em;
      }
      
      .item-price { 
        font-size: 1.3em; 
        color: #d4af37; 
        font-weight: 600;
        font-family: 'Playfair Display', serif;
      }
      
      .item-details { 
        font-size: 0.85em; 
        color: #868e96; 
        margin-top: 12px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      
      .badge { 
        display: inline-flex;
        align-items: center;
        padding: 4px 12px; 
        margin: 2px; 
        border-radius: 20px; 
        font-size: 0.75em; 
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border: 1px solid transparent;
      }
      
      .vegetarian { 
        background: linear-gradient(135deg, #27ae60, #2ecc71); 
        color: white;
        box-shadow: 0 2px 4px rgba(39, 174, 96, 0.3);
      }
      
      .vegan { 
        background: linear-gradient(135deg, #2ecc71, #27ae60); 
        color: white;
        box-shadow: 0 2px 4px rgba(46, 204, 113, 0.3);
      }
      
      .gluten-free { 
        background: linear-gradient(135deg, #f39c12, #e67e22); 
        color: white;
        box-shadow: 0 2px 4px rgba(243, 156, 18, 0.3);
      }
      
      .spicy { 
        background: linear-gradient(135deg, #e74c3c, #c0392b); 
        color: white;
        box-shadow: 0 2px 4px rgba(231, 76, 60, 0.3);
      }
      
      @media print {
        body { background: white; }
        .container { box-shadow: none; margin: 0; }
      }
    </style>
  `,
  
  modern: `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
      
      * { box-sizing: border-box; }
      
      body { 
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
        margin: 0; 
        padding: 0; 
        background: #fafafa;
        color: #1a1a1a;
        line-height: 1.6;
        font-size: 16px;
      }
      
      .container {
        max-width: 850px;
        margin: 0 auto;
        padding: 50px 40px;
        background: white;
        box-shadow: 0 8px 32px rgba(0,0,0,0.08);
        border-radius: 24px;
        margin-top: 30px;
        margin-bottom: 30px;
      }
      
      .header { 
        text-align: center; 
        margin-bottom: 60px; 
        padding-bottom: 40px;
        border-bottom: 1px solid #e0e0e0;
      }
      
      .business-name { 
        font-size: 3.5em; 
        color: #1a1a1a; 
        margin-bottom: 20px; 
        font-weight: 700;
        letter-spacing: -0.03em;
        line-height: 1.1;
      }
      
      .business-description { 
        font-size: 1.2em; 
        color: #666; 
        font-weight: 400;
        max-width: 600px;
        margin: 0 auto;
      }
      
      .category { 
        margin-bottom: 70px; 
        position: relative;
      }
      
      .category-name { 
        font-size: 2.4em; 
        color: #1a1a1a; 
        margin-bottom: 30px; 
        font-weight: 600;
        position: relative;
        padding-bottom: 20px;
      }
      
      .category-name::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 50px;
        height: 4px;
        background: #007AFF;
        border-radius: 2px;
      }
      
      .item { 
        margin-bottom: 35px; 
        padding: 30px; 
        background: #f8f9fa; 
        border-radius: 16px; 
        border: 1px solid #e9ecef;
        transition: all 0.3s ease;
        position: relative;
      }
      
      .item:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.1);
      }
      
      .item-name { 
        font-size: 1.5em; 
        color: #1a1a1a; 
        font-weight: 600; 
        margin-bottom: 10px;
        line-height: 1.3;
      }
      
      .item-description { 
        color: #666; 
        margin-bottom: 15px; 
        line-height: 1.6;
        font-size: 1em;
      }
      
      .item-price { 
        font-size: 1.4em; 
        color: #007AFF; 
        font-weight: 700;
      }
      
      .item-details { 
        font-size: 0.9em; 
        color: #888; 
        margin-top: 15px;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      
      .badge { 
        display: inline-flex;
        align-items: center;
        padding: 6px 16px; 
        margin: 3px; 
        border-radius: 25px; 
        font-size: 0.8em; 
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border: none;
      }
      
      .vegetarian { 
        background: #34C759; 
        color: white;
        box-shadow: 0 2px 8px rgba(52, 199, 89, 0.3);
      }
      
      .vegan { 
        background: #30D158; 
        color: white;
        box-shadow: 0 2px 8px rgba(48, 209, 88, 0.3);
      }
      
      .gluten-free { 
        background: #FF9500; 
        color: white;
        box-shadow: 0 2px 8px rgba(255, 149, 0, 0.3);
      }
      
      .spicy { 
        background: #FF3B30; 
        color: white;
        box-shadow: 0 2px 8px rgba(255, 59, 48, 0.3);
      }
      
      @media print {
        body { background: white; }
        .container { box-shadow: none; margin: 0; }
        .item:hover { transform: none; box-shadow: none; }
      }
    </style>
  `,
  
  classic: `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&family=Source+Sans+Pro:wght@300;400;600&display=swap');
      
      * { box-sizing: border-box; }
      
      body { 
        font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
        margin: 0; 
        padding: 0; 
        background: #f5f5f5;
        color: #2c2c2c;
        line-height: 1.6;
        font-size: 16px;
      }
      
      .container {
        max-width: 750px;
        margin: 0 auto;
        padding: 45px 35px;
        background: white;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        border-radius: 8px;
        margin-top: 25px;
        margin-bottom: 25px;
      }
      
      .header { 
        text-align: center; 
        margin-bottom: 50px; 
        padding-bottom: 35px;
        border-bottom: 3px double #2c2c2c;
        position: relative;
      }
      
      .header::before {
        content: '';
        position: absolute;
        bottom: -3px;
        left: 50%;
        transform: translateX(-50%);
        width: 80px;
        height: 3px;
        background: #2c2c2c;
      }
      
      .business-name { 
        font-family: 'Crimson Text', serif;
        font-size: 3em; 
        color: #2c2c2c; 
        margin-bottom: 15px; 
        font-weight: 700;
        letter-spacing: 0.02em;
        line-height: 1.1;
      }
      
      .business-description { 
        font-size: 1.1em; 
        color: #555; 
        font-style: italic;
        max-width: 500px;
        margin: 0 auto;
      }
      
      .category { 
        margin-bottom: 55px; 
        position: relative;
      }
      
      .category-name { 
        font-family: 'Crimson Text', serif;
        font-size: 2.1em; 
        color: #2c2c2c; 
        margin-bottom: 25px; 
        font-weight: 600;
        position: relative;
        padding-bottom: 12px;
        border-bottom: 2px solid #2c2c2c;
      }
      
      .item { 
        margin-bottom: 25px; 
        padding: 22px; 
        border: 1px solid #ddd; 
        background: #fafafa;
        border-radius: 6px;
        position: relative;
      }
      
      .item::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, #2c2c2c, #555);
      }
      
      .item-name { 
        font-family: 'Crimson Text', serif;
        font-size: 1.4em; 
        color: #2c2c2c; 
        font-weight: 600; 
        margin-bottom: 8px;
        line-height: 1.3;
      }
      
      .item-description { 
        color: #555; 
        margin-bottom: 10px; 
        line-height: 1.5;
        font-size: 0.95em;
      }
      
      .item-price { 
        font-size: 1.3em; 
        color: #2c2c2c; 
        font-weight: 600;
        font-family: 'Crimson Text', serif;
      }
      
      .item-details { 
        font-size: 0.85em; 
        color: #777; 
        margin-top: 10px;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      
      .badge { 
        display: inline-flex;
        align-items: center;
        padding: 3px 10px; 
        margin: 2px; 
        border: 1px solid #2c2c2c; 
        font-size: 0.75em;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        background: transparent;
        color: #2c2c2c;
      }
      
      .vegetarian { 
        background: #f0f8f0; 
        color: #2c2c2c;
        border-color: #27ae60;
      }
      
      .vegan { 
        background: #f0f8f0; 
        color: #2c2c2c;
        border-color: #2ecc71;
      }
      
      .gluten-free { 
        background: #fff8f0; 
        color: #2c2c2c;
        border-color: #f39c12;
      }
      
      .spicy { 
        background: #fff0f0; 
        color: #2c2c2c;
        border-color: #e74c3c;
      }
      
      @media print {
        body { background: white; }
        .container { box-shadow: none; margin: 0; }
      }
    </style>
  `,
  
  minimal: `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
      
      * { box-sizing: border-box; }
      
      body { 
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
        margin: 0; 
        padding: 0; 
        background: white;
        color: #1a1a1a;
        line-height: 1.6;
        font-size: 16px;
        font-weight: 400;
      }
      
      .container {
        max-width: 700px;
        margin: 0 auto;
        padding: 60px 40px;
        background: white;
        margin-top: 40px;
        margin-bottom: 40px;
      }
      
      .header { 
        text-align: center; 
        margin-bottom: 80px; 
        padding-bottom: 50px;
        border-bottom: 1px solid #e0e0e0;
      }
      
      .business-name { 
        font-size: 2.8em; 
        color: #1a1a1a; 
        margin-bottom: 15px; 
        font-weight: 400;
        letter-spacing: -0.02em;
        line-height: 1.2;
      }
      
      .business-description { 
        font-size: 1.1em; 
        color: #666; 
        font-weight: 300;
        max-width: 450px;
        margin: 0 auto;
      }
      
      .category { 
        margin-bottom: 80px; 
        position: relative;
      }
      
      .category-name { 
        font-size: 1.8em; 
        color: #1a1a1a; 
        margin-bottom: 30px; 
        font-weight: 500;
        position: relative;
        padding-bottom: 15px;
      }
      
      .category-name::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 30px;
        height: 2px;
        background: #1a1a1a;
      }
      
      .item { 
        margin-bottom: 40px; 
        padding: 0; 
        border-bottom: 1px solid #f0f0f0;
        padding-bottom: 30px;
      }
      
      .item:last-child {
        border-bottom: none;
      }
      
      .item-name { 
        font-size: 1.3em; 
        color: #1a1a1a; 
        font-weight: 500; 
        margin-bottom: 8px;
        line-height: 1.4;
      }
      
      .item-description { 
        color: #666; 
        margin-bottom: 12px; 
        line-height: 1.5;
        font-size: 0.95em;
        font-weight: 300;
      }
      
      .item-price { 
        font-size: 1.2em; 
        color: #1a1a1a; 
        font-weight: 600;
      }
      
      .item-details { 
        font-size: 0.8em; 
        color: #999; 
        margin-top: 12px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      
      .badge { 
        display: inline-flex;
        align-items: center;
        padding: 2px 8px; 
        margin: 1px; 
        border-radius: 12px; 
        font-size: 0.7em;
        font-weight: 400;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        background: #f5f5f5;
        color: #666;
        border: 1px solid #e0e0e0;
      }
      
      .vegetarian { 
        background: #f0f8f0; 
        color: #27ae60;
        border-color: #27ae60;
      }
      
      .vegan { 
        background: #f0f8f0; 
        color: #2ecc71;
        border-color: #2ecc71;
      }
      
      .gluten-free { 
        background: #fff8f0; 
        color: #f39c12;
        border-color: #f39c12;
      }
      
      .spicy { 
        background: #fff0f0; 
        color: #e74c3c;
        border-color: #e74c3c;
      }
      
      @media print {
        body { background: white; }
        .container { margin: 0; }
      }
    </style>
  `
};

// Cover page templates for each template style
const COVER_TEMPLATES: { [key: string]: string } = {
  elegant: `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');
      
      .cover-page {
        page-break-after: always;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #000;
        margin: 0;
        padding: 0;
      }
      
      .cover-container {
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
        padding: 60px 40px;
        text-align: center;
        position: relative;
        border: 2px solid #d4af37;
        background: #000;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
      
      .cover-logo {
        margin-bottom: 40px;
        max-width: 200px;
        max-height: 100px;
        object-fit: contain;
      }
      
      .cover-page .business-name { 
        font-family: 'Playfair Display', serif;
        font-size: 4.5em; 
        color: #d4af37; 
        margin-bottom: 20px; 
        font-weight: 600;
        letter-spacing: 0.05em;
        line-height: 1.1;
        text-transform: uppercase;
        margin: 0;
      }
      
      .cover-page .business-tagline { 
        font-family: 'Playfair Display', serif;
        font-size: 1.4em; 
        color: #fff; 
        font-weight: 400;
        font-style: italic;
        margin-bottom: 60px;
        letter-spacing: 0.02em;
        margin: 0;
      }
      
      .cover-icon {
        font-size: 6em;
        color: #d4af37;
        margin-bottom: 40px;
        opacity: 0.8;
      }
      
      .cover-icon::before {
        content: '🍷';
        display: block;
      }
      
      .menu-content {
        page-break-before: always;
      }
      
      @media print {
        .cover-page { 
          background: #000; 
          page-break-after: always;
        }
        .menu-content { 
          page-break-before: always;
        }
      }
    </style>
  `,
  
  modern: `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
      
      .cover-page {
        page-break-after: always;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #a8e6cf 0%, #f7cac9 100%);
        margin: 0;
        padding: 0;
      }
      
      .cover-container {
        width: 100%;
        max-width: 700px;
        margin: 0 auto;
        padding: 80px 40px;
        text-align: center;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        backdrop-filter: blur(10px);
        min-height: 80vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
      
      .cover-icon {
        font-size: 8em;
        margin-bottom: 30px;
        color: #4a90e2;
      }
      
      .cover-icon::before {
        content: '☕';
        display: block;
      }
      
      .cover-page .business-name { 
        font-family: 'Inter', sans-serif;
        font-size: 3.5em; 
        color: #333; 
        margin-bottom: 20px; 
        font-weight: 600;
        letter-spacing: -0.02em;
        line-height: 1.1;
        text-transform: uppercase;
        margin: 0;
      }
      
      .cover-page .business-tagline { 
        font-family: 'Inter', sans-serif;
        font-size: 1.3em; 
        color: #666; 
        font-weight: 400;
        letter-spacing: 0.02em;
        line-height: 1.4;
        margin: 0;
      }
      
      .menu-content {
        page-break-before: always;
      }
      
      @media print {
        .cover-page { 
          background: white; 
          page-break-after: always;
        }
        .menu-content { 
          page-break-before: always;
        }
      }
    </style>
  `,
  
  classic: `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Lobster:wght@400&family=Source+Sans+Pro:wght@300;400;600&display=swap');
      
      .cover-page {
        page-break-after: always;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #d2691e 0%, #8fbc8f 100%);
        margin: 0;
        padding: 0;
      }
      
      .cover-container {
        width: 100%;
        max-width: 750px;
        margin: 0 auto;
        padding: 70px 50px;
        text-align: center;
        background: rgba(255, 248, 220, 0.95);
        border: 3px solid #8b4513;
        border-radius: 15px;
        box-shadow: 0 15px 30px rgba(0,0,0,0.2);
        min-height: 80vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        position: relative;
      }
      
      .cover-container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><defs><pattern id="wood" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse"><rect width="100" height="100" fill="%23f5f5dc"/><path d="M0 20 L100 20 M0 40 L100 40 M0 60 L100 60 M0 80 L100 80" stroke="%23d2b48c" stroke-width="1" opacity="0.3"/></pattern></defs><rect width="100" height="100" fill="url(%23wood)"/></svg>');
        opacity: 0.1;
        border-radius: 12px;
        pointer-events: none;
      }
      
      .cover-icon {
        font-size: 6em;
        margin-bottom: 30px;
        color: #8b4513;
      }
      
      .cover-icon::before {
        content: '🫒';
        display: block;
      }
      
      .cover-page .business-name { 
        font-family: 'Lobster', cursive;
        font-size: 4em; 
        color: #8b4513; 
        margin-bottom: 20px; 
        font-weight: 400;
        letter-spacing: 0.02em;
        line-height: 1.1;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        margin: 0;
      }
      
      .cover-page .business-tagline { 
        font-family: 'Source Sans Pro', sans-serif;
        font-size: 1.4em; 
        color: #556b2f; 
        font-weight: 400;
        font-style: italic;
        letter-spacing: 0.02em;
        margin: 0;
      }
      
      .menu-content {
        page-break-before: always;
      }
      
      @media print {
        .cover-page { 
          background: #f5f5dc; 
          page-break-after: always;
        }
        .menu-content { 
          page-break-before: always;
        }
      }
    </style>
  `,
  
  minimal: `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600&display=swap');
      
      .cover-page {
        page-break-after: always;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #ff6b6b 0%, #ffd93d 50%, #6bcf7f 100%);
        margin: 0;
        padding: 0;
      }
      
      .cover-container {
        width: 100%;
        max-width: 700px;
        margin: 0 auto;
        padding: 60px 40px;
        text-align: center;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 25px;
        box-shadow: 0 25px 50px rgba(0,0,0,0.15);
        min-height: 80vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        position: relative;
        overflow: hidden;
      }
      
      .cover-container::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: 
          radial-gradient(circle at 20% 20%, rgba(255, 107, 107, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(255, 217, 61, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(107, 207, 127, 0.1) 0%, transparent 50%);
        animation: rotate 20s linear infinite;
        pointer-events: none;
      }
      
      @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      .food-icons {
        font-size: 4em;
        margin-bottom: 30px;
        color: #333;
        display: flex;
        justify-content: center;
        gap: 20px;
        flex-wrap: wrap;
      }
      
      .food-icons::before {
        content: '🌮 🍔 🥟';
        display: block;
      }
      
      .cover-page .business-name { 
        font-family: 'Bebas Neue', sans-serif;
        font-size: 4.5em; 
        color: #333; 
        margin-bottom: 20px; 
        font-weight: 400;
        letter-spacing: 0.05em;
        line-height: 1;
        text-transform: uppercase;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        margin: 0;
      }
      
      .cover-page .business-tagline { 
        font-family: 'Inter', sans-serif;
        font-size: 1.3em; 
        color: #666; 
        font-weight: 500;
        letter-spacing: 0.02em;
        text-transform: uppercase;
        margin: 0;
      }
      
      .menu-content {
        page-break-before: always;
      }
      
      @media print {
        .cover-page { 
          background: white; 
          page-break-after: always;
        }
        .menu-content { 
          page-break-before: always;
        }
      }
    </style>
  `
};

export class MenuPdfService {
  static async generateMenuPdf(businessId: number, options: MenuPdfOptions = {}): Promise<Buffer> {
    // Validate business is a restaurant
    const business = await BusinessModel.findByPk(businessId);
    if (!business || !(await isRestaurantBusiness(businessId))) {
      throw new Error('Business not found or not a restaurant');
    }

    const menuData = await this.getMenuData(businessId);
    const html = await this.generateHtml(menuData, options, businessId);
    return await this.htmlToPdf(html, options);
  }

  static async getMenuData(businessId: number): Promise<MenuData> {
    const business = await BusinessModel.findByPk(businessId);
    if (!business) {
      throw new Error('Business not found');
    }

    const categories = await MenuCategoryModel.findAll({
      where: { businessId, isActive: true },
      include: [{
        model: MenuItemModel,
        as: 'menuItems',
        where: { isAvailable: true },
        required: false
      }],
      order: [
        ['displayOrder', 'ASC'],
        ['name', 'ASC'],
        [{ model: MenuItemModel, as: 'menuItems' }, 'name', 'ASC']
      ]
    });

    return {
      business: {
        id: business.id,
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
          ...(item.price && { price: item.price }),
          ...(item.imageUrl && { imageUrl: item.imageUrl }),
          ...(item.isVegetarian && { isVegetarian: item.isVegetarian }),
          ...(item.isVegan && { isVegan: item.isVegan }),
          ...(item.isGlutenFree && { isGlutenFree: item.isGlutenFree }),
          ...(item.isSpicy && { isSpicy: item.isSpicy }),
          ...(item.calories && { calories: item.calories }),
          ...(item.allergens && typeof item.allergens === 'string' && item.allergens.trim() && (() => {
            try {
              return { allergens: JSON.parse(item.allergens) };
            } catch (error) {
              console.warn(`Failed to parse allergens for item ${item.id}: ${item.allergens}`, error);
              return {};
            }
          })()),
          ...(item.preparationTime && { preparationTime: item.preparationTime }),
          ...(item.spiceLevel && { spiceLevel: item.spiceLevel })
        })) || []
      }))
    };
  }

  private static async generateHtml(menuData: MenuData, options: MenuPdfOptions, businessId: number): Promise<string> {
    let css: string;
    const templateName = options.template || 'elegant';
    
    if (options.customTemplateId) {
      const customTemplate = await CustomMenuTemplateModel.findOne({
        where: {
          id: options.customTemplateId,
          businessId: businessId,
          isActive: true
        }
      });
      if (customTemplate) {
        css = customTemplate.css;
      } else {
        throw new Error('Custom template not found or not active');
      }
    } else {
      // Use built-in template
      
      switch (templateName) {
        case 'modern':
          css = TEMPLATES.modern as string;
          break;
        case 'classic':
          css = TEMPLATES.classic as string;
          break;
        case 'minimal':
          css = TEMPLATES.minimal as string;
          break;
        default:
          css = TEMPLATES.elegant as string;
      }
      
    }

    // Add category-specific CSS
    const categoryBackgroundColor = options.categoryBackgroundColor || '#f8f9fa';
    const maxItemsPerPage = options.maxItemsPerPage || 8;
    const categoryLayout = options.categoryLayout || 'same-page';
    const showCategoryTitles = options.showCategoryTitles !== false;

    const categoryCss = `
      <style>
        /* Category-specific styles with proper specificity to override template CSS */
        html body .menu-content .menu-category-page {
          page-break-before: always;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: ${categoryBackgroundColor};
          background: ${categoryBackgroundColor};
        }
        
        html body .menu-content .menu-category-title-page {
          text-align: center;
          padding: 2rem;
          background-color: ${categoryBackgroundColor};
          background: ${categoryBackgroundColor};
        }
        
        html body .menu-content .menu-category-title {
          font-size: 3rem;
          font-weight: bold;
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        
        html body .menu-content .menu-category-description {
          font-size: 1.2rem;
          opacity: 0.8;
          max-width: 600px;
        }
        
        html body .menu-content .menu-items-container {
          page-break-inside: avoid;
          background: white;
        }
        
        html body .menu-content .menu-category-section {
          margin-bottom: 2rem;
          background: white;
        }
        
        html body .menu-content .menu-category-header {
          background-color: ${categoryBackgroundColor};
          background: ${categoryBackgroundColor};
          padding: 1rem;
          margin-bottom: 1rem;
          border-radius: 8px;
          color: #333;
        }
        
        html body .menu-content .menu-category-name {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
          color: #333;
        }
        
        html body .menu-content .menu-category-description-small {
          font-size: 0.9rem;
          opacity: 0.7;
          color: #333;
        }
        
        html body .menu-content .menu-items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
          background: white;
          padding: 1rem;
        }
        
        html body .menu-content .menu-items-wrapper {
          background: white;
          padding: 1rem;
          border-radius: 8px;
          margin-top: 1rem;
        }
        
        /* Menu item styles with proper namespacing */
        html body .menu-content .menu-item {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 1rem;
          background: white;
          transition: transform 0.2s;
          margin-bottom: 1rem;
          position: relative;
          overflow: visible;
        }
        
        html body .menu-content .menu-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        html body .menu-content .menu-item-name {
          font-weight: bold;
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
          color: #333;
        }
        
        html body .menu-content .menu-item-description {
          color: #666;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }
        
        html body .menu-content .menu-item-price {
          font-weight: bold;
          font-size: 1.2rem;
          color: #2e7d32;
          margin-top: 0.5rem;
        }
        
        html body .menu-content .menu-item-image {
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 10px;
        }
        
        html body .menu-content .menu-item-details {
          margin-top: 0.5rem;
        }
        
        html body .menu-content .menu-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: bold;
          margin-right: 0.5rem;
          margin-bottom: 0.25rem;
        }
        
        html body .menu-content .menu-badge.vegetarian { 
          background-color: #4caf50; 
          color: white; 
        }
        
        html body .menu-content .menu-badge.vegan { 
          background-color: #8bc34a; 
          color: white; 
        }
        
        html body .menu-content .menu-badge.gluten-free { 
          background-color: #ff9800; 
          color: white; 
        }
        
        html body .menu-content .menu-badge.spicy { 
          background-color: #f44336; 
          color: white; 
        }
        
        html body .menu-content .menu-allergens {
          font-size: 0.8rem;
          color: #d32f2f;
          font-weight: bold;
        }
        
        html body .menu-content .menu-calories {
          font-size: 0.8rem;
          color: #666;
        }
        
        /* Override template body background for category pages */
        html body .menu-content .menu-category-page body {
          background: ${categoryBackgroundColor};
          background-color: ${categoryBackgroundColor};
        }
        
        /* Ensure category pages override any template gradients */
        html body .menu-content .menu-category-page,
        html body .menu-content .menu-category-page * {
          background-image: none;
        }
        
        html body .menu-content .menu-category-page {
          background: ${categoryBackgroundColor};
          background-color: ${categoryBackgroundColor};
          background-image: none;
        }
        
        @media print {
          html body .menu-content .menu-category-page {
            page-break-before: always;
            background-color: ${categoryBackgroundColor};
            background: ${categoryBackgroundColor};
            background-image: none;
          }
          html body .menu-content .menu-items-container {
            page-break-inside: avoid;
            background: white;
          }
          html body .menu-content .menu-item {
            background: white;
          }
        }
      </style>
    `;

    let html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${menuData.business.name} - Menu</title>
        ${css}
        ${COVER_TEMPLATES[templateName] || COVER_TEMPLATES.elegant}
        ${categoryCss}
      </head>
      <body>
        <!-- Cover Page -->
        <div class="cover-page">
          <div class="cover-container">
            ${menuData.business.logo && options.includeBusinessLogo !== false ? 
              `<div class="business-logo"><img src="${menuData.business.logo}" alt="${menuData.business.name}" class="cover-logo"></div>` : ''
            }
            <div class="cover-icon"></div>
            <h1 class="business-name">${menuData.business.name}</h1>
            ${menuData.business.description ? `<p class="business-tagline">${menuData.business.description}</p>` : ''}
          </div>
        </div>
        
        <!-- Menu Content -->
        <div class="menu-content">
          <div class="container">
            <header class="header">
              ${menuData.business.logo && options.includeBusinessLogo !== false ? 
                `<div class="business-logo"><img src="${menuData.business.logo}" alt="${menuData.business.name}" style="max-width: 200px; max-height: 100px; object-fit: contain; margin-bottom: 20px;"></div>` : ''
              }
              <h1 class="business-name">${menuData.business.name}</h1>
              ${menuData.business.description ? `<p class="business-description">${menuData.business.description}</p>` : ''}
            </header>
    `;

    // Generate category-based layout
    if (categoryLayout === 'separate-page' && showCategoryTitles) {
      // Create separate title pages for each category
      menuData.categories.forEach((category) => {
        
        html += `
          <div class="menu-category-page" style="min-height: 100vh; width: 100%; background-color: ${categoryBackgroundColor}; background: ${categoryBackgroundColor};">
            <div class="menu-category-title-page">
              <div class="menu-category-title">${category.name}</div>
              ${category.description ? `<div class="menu-category-description">${category.description}</div>` : ''}
            </div>
          </div>
        `;
        
        // Add items page(s) for this category
        const items = category.items;
        const itemPages = Math.ceil(items.length / maxItemsPerPage);
        
        for (let page = 0; page < itemPages; page++) {
          const startIndex = page * maxItemsPerPage;
          const endIndex = Math.min(startIndex + maxItemsPerPage, items.length);
          const pageItems = items.slice(startIndex, endIndex);
          
          html += `
            <div class="menu-items-container">
              <div class="menu-items-wrapper">
                <div class="menu-items-grid">
          `;
          
          pageItems.forEach(item => {
            html += this.generateItemHtml(item, options);
          });
          
          html += `
                </div>
              </div>
            </div>
          `;
        }
      });
    } else {
      // Same-page layout (default)
      menuData.categories.forEach(category => {
        html += `
          <div class="menu-category-section">
            <div class="menu-category-header">
              <div class="menu-category-name">${category.name}</div>
              ${category.description ? `<div class="menu-category-description-small">${category.description}</div>` : ''}
            </div>
            <div class="menu-items-wrapper">
              <div class="menu-items-grid">
        `;

        category.items.forEach(item => {
          html += this.generateItemHtml(item, options);
        });

        html += `
              </div>
            </div>
          </div>
        `;
      });
    }

    html += `</div></div></body></html>`;
    
    return html;
  }

  private static generateItemHtml(item: any, options: MenuPdfOptions): string {
    const badges = [];
    if (item.isVegetarian) badges.push('<span class="menu-badge vegetarian">Vegetarian</span>');
    if (item.isVegan) badges.push('<span class="menu-badge vegan">Vegan</span>');
    if (item.isGlutenFree) badges.push('<span class="menu-badge gluten-free">Gluten Free</span>');
    if (item.isSpicy) badges.push('<span class="menu-badge spicy">Spicy</span>');

    return `
      <div class="menu-item">
        ${item.imageUrl && options.includeImages !== false ? 
          `<div class="menu-item-image"><img src="${item.imageUrl}" alt="${item.name}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;"></div>` : ''
        }
        <div class="menu-item-name">${item.name}</div>
        ${item.description && options.includeDescriptions ? `<div class="menu-item-description">${item.description}</div>` : ''}
        ${item.price && options.includePrices ? `<div class="menu-item-price">$${item.price.toFixed(2)}</div>` : ''}
        <div class="menu-item-details">
          ${badges.join('')}
          ${item.calories && options.includeCalories ? `<span class="menu-calories">${item.calories} cal</span>` : ''}
          ${item.allergens && options.includeAllergens ? `<span class="menu-allergens">Allergens: ${item.allergens.join(', ')}</span>` : ''}
        </div>
      </div>
    `;
  }

  private static async htmlToPdf(html: string, options: MenuPdfOptions): Promise<Buffer> {
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      await page.setContent(html);
      
      const pdfOptions = {
        format: 'A4' as any,
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        }
      };

      if (options.orientation === 'landscape') {
        pdfOptions.format = 'A4' as any;
        await page.evaluate(() => {
          const body = document.body as any;
          body.style.width = '297mm';
          body.style.height = '210mm';
        });
      }

      const pdf = await page.pdf(pdfOptions);
      return pdf;
    } finally {
      await browser.close();
    }
  }

  static getAvailableTemplates(): Array<{ id: string; name: string; description: string }> {
    return [
      {
        id: 'elegant',
        name: 'Elegant',
        description: 'Sophisticated design with serif fonts and gold accents - perfect for fine dining establishments'
      },
      {
        id: 'modern',
        name: 'Modern',
        description: 'Clean and contemporary design with sans-serif fonts - ideal for modern restaurants and cafes'
      },
      {
        id: 'classic',
        name: 'Classic',
        description: 'Traditional restaurant menu style with refined typography - great for classic dining establishments'
      },
      {
        id: 'minimal',
        name: 'Minimal',
        description: 'Clean and simple design with focus on content - perfect for minimalist restaurants and cafes'
      }
    ];
  }

  static async getCustomTemplates(businessId: number): Promise<CustomMenuTemplateModel[]> {
    return await CustomMenuTemplateModel.findAll({
      where: { businessId, isActive: true },
      order: [['name', 'ASC']]
    });
  }

  static async createCustomTemplate(templateData: {
    businessId: number;
    name: string;
    description?: string;
    css: string;
    html?: string;
    isDefault?: boolean;
  }): Promise<CustomMenuTemplateModel> {
    const createData: any = {
      businessId: templateData.businessId,
      name: templateData.name,
      css: templateData.css,
      isDefault: templateData.isDefault || false,
      isActive: true
    };

    if (templateData.description) {
      createData.description = templateData.description;
    }

    if (templateData.html) {
      createData.html = templateData.html;
    }

    return await CustomMenuTemplateModel.create(createData);
  }

  static async updateCustomTemplate(
    templateId: number, 
    businessId: number, 
    updates: Partial<CustomMenuTemplateModel>
  ): Promise<CustomMenuTemplateModel | null> {
    const template = await CustomMenuTemplateModel.findOne({
      where: { id: templateId, businessId }
    });

    if (!template) {
      return null;
    }

    await template.update(updates);
    return template;
  }

  static async deleteCustomTemplate(templateId: number, businessId: number): Promise<boolean> {
    const deleted = await CustomMenuTemplateModel.destroy({
      where: { id: templateId, businessId }
    });
    return deleted > 0;
  }
}