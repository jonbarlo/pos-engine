import { OrderModel } from '../models/OrderModel';
import { BusinessModel } from '../models/BusinessModel';
import { logger } from './logger';
import { Op } from 'sequelize';

/**
 * Generates a unique order number for a business
 * Format: {BUSINESS_CODE}-{YEAR}-{SEQUENTIAL_NUMBER}
 * Example: IT-2024-001, IT-2024-002
 */
export async function generateOrderNumber(businessId: number, businessCode?: string): Promise<string> {
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
    
    // Get the last order number for this business in the current year
    const lastOrder = await OrderModel.findOne({
      where: {
        businessId,
        orderNumber: {
          [Op.like]: `${businessPrefix}-${currentYear}-%`
        }
      },
      order: [['orderNumber', 'DESC']],
      attributes: ['orderNumber']
    });

    let nextNumber = 1;
    
    if (lastOrder && lastOrder.orderNumber) {
      // Extract the number from the last order number
      const match = lastOrder.orderNumber.match(new RegExp(`${businessPrefix}-${currentYear}-(\\d+)`));
      if (match && match[1]) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    // Format the number with leading zeros (3 digits)
    const formattedNumber = nextNumber.toString().padStart(3, '0');
    const orderNumber = `${businessPrefix}-${currentYear}-${formattedNumber}`;
    
    logger(`Generated order number: ${orderNumber} for business ${businessId}`);
    return orderNumber;
  } catch (error) {
    logger(`Error generating order number: ${error}`);
    // Fallback to timestamp-based number if there's an error
    const timestamp = Date.now();
    const businessPrefix = businessCode || 'BIZ';
    return `${businessPrefix}-${timestamp}`;
  }
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