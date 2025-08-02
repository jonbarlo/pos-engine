import { v4 as uuidv4 } from 'uuid';

/**
 * SKU Generator Utility
 * Provides standardized SKU generation for different business types and item categories
 */

/**
 * Generate barcode - using simple counter for guaranteed uniqueness
 */
export function generateBarcode(prefix: string, counter?: number): string {
  if (!counter) {
    counter = 1;
  }
  const counterPart = counter.toString().padStart(3, '0');
  return `BC ${prefix}-${counterPart}`;
}

/**
 * Generate SKU for inventory items
 */
export function generateSku(prefix: string, counter?: number): string {
  if (!counter) {
    counter = 1;
  }
  const counterPart = counter.toString().padStart(3, '0');
  return `${prefix}-${counterPart}`;
}

/**
 * Generate SKU for menu items
 */
export function generateMenuSku(prefix: string, category: string, counter?: number): string {
  if (!counter) {
    counter = 1;
  }
  const categoryCode = category.substring(0, 3).toUpperCase();
  const counterPart = counter.toString().padStart(2, '0');
  return `${prefix}-${categoryCode}-${counterPart}`;
}

/**
 * Generate SKU for order items
 */
export function generateOrderSku(prefix: string, category: string, counter?: number): string {
  if (!counter) {
    counter = 1;
  }
  const categoryCode = category.substring(0, 3).toUpperCase();
  const counterPart = counter.toString().padStart(3, '0');
  return `${prefix}-ORD-${categoryCode}-${counterPart}`;
}

/**
 * Generate menu item SKU with category - for backward compatibility
 */
export function generateMenuItemSkuWithCategory(prefix: string, category: string, counter?: number): string {
  return generateMenuSku(prefix, category, counter);
}