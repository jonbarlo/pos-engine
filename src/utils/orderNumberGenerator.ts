import { OrderModel } from '../models/OrderModel';
import { BusinessModel } from '../models/BusinessModel';
import { logger } from './logger';
import { Op } from 'sequelize';

/**
 * Generates a unique order number for a business
 * Format: {BUSINESS_CODE}-{YEAR}-{SEQUENTIAL_NUMBER}
 * Example: IT-2024-001, IT-2024-002
 */
export async function generateOrderNumber(businessId: number, businessCode?: string, counter?: number): Promise<string> {
  try {
    const currentYear = new Date().getFullYear();
    let businessPrefix = businessCode || 'BIZ';
    
    // If no business code provided, try to get it from the business slug
    if (!businessCode) {
      try {
        const business = await BusinessModel.findByPk(businessId);
        if (business && business.slug) {
          // Extract a short code from the slug (first 2-4 characters)
          businessPrefix = business.slug.substring(0, 4).toUpperCase();
          // Remove any non-alphanumeric characters
          businessPrefix = businessPrefix.replace(/[^A-Z0-9]/g, '');
          // Ensure it's at least 2 characters
          if (businessPrefix.length < 2) {
            businessPrefix = 'BIZ';
          }
        }
      } catch (error) {
        logger(`Warning: Could not get business slug for business ${businessId}: ${error}`);
        businessPrefix = 'BIZ';
      }
    }
    
    let nextNumber = counter || 1;
    
    // Format the number with leading zeros (3 digits)
    const formattedNumber = nextNumber.toString().padStart(3, '0');
    const orderNumber = `${businessPrefix}-${currentYear}-${formattedNumber}`;
    
    logger(`Generated order number: ${orderNumber} for business ${businessId}`);
    return orderNumber;
  } catch (error) {
    logger(`Error generating order number: ${error}`);
    // Fallback to counter-based number if there's an error
    const businessPrefix = businessCode || 'BIZ';
    const fallbackCounter = counter || 1;
    return `${businessPrefix}-${fallbackCounter}`;
  }
}

/**
 * Generates a simple order number for seeders (synchronous)
 * Format: {BUSINESS_CODE}-ORD-{SEQUENTIAL_NUMBER}
 * Example: IT-ORD-001, IT-ORD-002
 */
export function generateSeederOrderNumber(businessCode: string, counter: number): string {
  const formattedNumber = counter.toString().padStart(3, '0');
  return `${businessCode}-ORD-${formattedNumber}`;
}

/**
 * Validates if an order number is in the correct format
 */
export function validateOrderNumber(orderNumber: string): boolean {
  const pattern = /^[A-Z]{2,4}-\d{4}-\d{3}$/;
  return pattern.test(orderNumber);
}

/**
 * Extracts business code from an order number
 */
export function extractBusinessCodeFromOrderNumber(orderNumber: string): string | null {
  const match = orderNumber.match(/^([A-Z]{2,4})-\d{4}-\d{3}$/);
  return match && match[1] ? match[1] : null;
} 