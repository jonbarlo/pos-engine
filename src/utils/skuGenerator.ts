import { faker } from '@faker-js/faker';

/**
 * Generates a SKU with a prefix, random alphanumeric part, and optional counter.
 * @param prefix - Business or category prefix (e.g., 'COF', 'BVI')
 * @param counter - Optional number to ensure uniqueness (e.g., 1, 2, 3)
 * @param existingSkus - Optional Set of existing SKUs to avoid collisions
 * @returns SKU string (e.g., 'COF-AB12CD-001')
 */
export function generateSku(prefix: string, counter?: number, existingSkus?: Set<string>): string {
  let sku: string;
  let attempts = 0;
  const maxAttempts = 100; // Prevent infinite loops
  
  do {
    const randomPart = faker.string.alphanumeric(6).toUpperCase();
    sku = `${prefix}-${randomPart}`;
    if (typeof counter === 'number') {
      sku += `-${counter.toString().padStart(3, '0')}`;
    }
    attempts++;
    
    // If no existing SKUs provided or SKU is unique, break
    if (!existingSkus || !existingSkus.has(sku)) {
      break;
    }
  } while (attempts < maxAttempts);
  
  // If we hit max attempts, add a timestamp to ensure uniqueness
  if (attempts >= maxAttempts) {
    const timestamp = Date.now().toString().slice(-4);
    sku = `${sku}-${timestamp}`;
  }
  
  return sku;
}

/**
 * Generates a barcode with a prefix and random numeric part.
 * @param prefix - Business or category prefix (e.g., 'COF', 'BVI')
 * @param counter - Optional number to ensure uniqueness (e.g., 1, 2, 3)
 * @param existingBarcodes - Optional Set of existing barcodes to avoid collisions
 * @returns Barcode string (e.g., 'COF123456789')
 */
export function generateBarcode(prefix: string, counter?: number, existingBarcodes?: Set<string>): string {
  let barcode: string;
  let attempts = 0;
  const maxAttempts = 100; // Prevent infinite loops
  
  do {
    const randomPart = faker.string.numeric(9); // 9-digit numeric part
    barcode = `${prefix}${randomPart}`;
    if (typeof counter === 'number') {
      barcode += `${counter.toString().padStart(3, '0')}`;
    }
    attempts++;
    
    // If no existing barcodes provided or barcode is unique, break
    if (!existingBarcodes || !existingBarcodes.has(barcode)) {
      break;
    }
  } while (attempts < maxAttempts);
  
  // If we hit max attempts, add a timestamp to ensure uniqueness
  if (attempts >= maxAttempts) {
    const timestamp = Date.now().toString().slice(-4);
    barcode = `${barcode}${timestamp}`;
  }
  
  return barcode;
} 