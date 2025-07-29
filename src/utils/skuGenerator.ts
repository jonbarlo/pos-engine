/**
 * SKU Generator Utility
 * Provides standardized SKU generation for different business types and item categories
 */

/**
 * Generate barcode - backward compatible with existing seeders
 */
export function generateBarcode(prefix: string, counter?: number, existingBarcodes?: Set<string>): string {
  // Simple barcode generation - in production, you might want to use a proper barcode library
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `123456789${timestamp}${random}`;
}

/**
 * Generate SKU - backward compatible with existing seeders
 */
export function generateSku(prefix: string, counter?: number, existingSkus?: Set<string>): string {
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const sku = `${prefix}-${randomPart}`;
  return counter ? `${sku}-${counter.toString().padStart(3, '0')}` : sku;
}