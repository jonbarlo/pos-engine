/**
 * Menu Item SKU Generator Utility
 * Provides standardized SKU generation for menu items
 */

/**
 * Generate menu item SKU
 * Format: {BUSINESS_PREFIX}-MI-{CATEGORY_PREFIX}-{COUNTER}
 * Example: IT-MI-PIZ-001, SU-MI-ROL-001, CO-MI-COF-001
 */
export function generateMenuItemSku(
  businessPrefix: string, 
  categoryPrefix: string, 
  counter: number
): string {
  const formattedCounter = counter.toString().padStart(3, '0');
  return `${businessPrefix}-MI-${categoryPrefix}-${formattedCounter}`;
}

/**
 * Generate menu item SKU with category mapping
 */
export function generateMenuItemSkuWithCategory(
  businessPrefix: string,
  category: string,
  counter: number
): string {
  // Map categories to short prefixes
  const categoryMap: { [key: string]: string } = {
    'Pizza': 'PIZ',
    'Pasta': 'PAS',
    'Desserts': 'DES',
    'Beverages': 'BEV',
    'Rolls': 'ROL',
    'Nigiri': 'NIG',
    'Soups': 'SOU',
    'Coffee': 'COF',
    'Pastries': 'PAS',
    'Tea': 'TEA',
    'Smoothies': 'SMO'
  };

  const categoryPrefix = categoryMap[category] || category.substring(0, 3).toUpperCase();
  return generateMenuItemSku(businessPrefix, categoryPrefix, counter);
}

/**
 * Validates if a menu item SKU is in the correct format
 */
export function validateMenuItemSku(sku: string): boolean {
  const pattern = /^[A-Z]{2,4}-MI-[A-Z]{3}-\d{3}$/;
  return pattern.test(sku);
}

/**
 * Extracts business prefix from a menu item SKU
 */
export function extractBusinessPrefixFromMenuItemSku(sku: string): string | null {
  const match = sku.match(/^([A-Z]{2,4})-MI-[A-Z]{3}-\d{3}$/);
  return match && match[1] ? match[1] : null;
}

/**
 * Extracts category from a menu item SKU
 */
export function extractCategoryFromMenuItemSku(sku: string): string | null {
  const match = sku.match(/^[A-Z]{2,4}-MI-([A-Z]{3})-\d{3}$/);
  return match && match[1] ? match[1] : null;
} 