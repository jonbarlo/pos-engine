import { SaleModel } from '../models/SaleModel';
import { BusinessModel } from '../models/BusinessModel';
import { logger } from './logger';
import { Op } from 'sequelize';

/**
 * Generates a unique sale number for a business
 * Format: SALE-{BUSINESS_CODE}-{YEAR}-{SEQUENTIAL_NUMBER}
 * Example: SALE-IT-2024-001, SALE-IT-2024-002
 */
export async function generateSaleNumber(businessId: number, businessCode?: string): Promise<string> {
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
    
    // Get the last sale number for this business in the current year
    const lastSale = await SaleModel.findOne({
      where: {
        businessId,
        saleNumber: {
          [Op.like]: `SALE-${businessPrefix}-${currentYear}-%`
        }
      },
      order: [['saleNumber', 'DESC']],
      attributes: ['saleNumber']
    });

    let nextNumber = 1;
    
    if (lastSale && lastSale.saleNumber) {
      // Extract the number from the last sale number
      const match = lastSale.saleNumber.match(new RegExp(`SALE-${businessPrefix}-${currentYear}-(\\d+)`));
      if (match && match[1]) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    // Format the number with leading zeros (3 digits)
    const formattedNumber = nextNumber.toString().padStart(3, '0');
    const saleNumber = `SALE-${businessPrefix}-${currentYear}-${formattedNumber}`;
    
    logger(`Generated sale number: ${saleNumber} for business ${businessId}`);
    return saleNumber;
  } catch (error) {
    logger(`Error generating sale number: ${error}`);
    // Fallback to timestamp-based number if there's an error
    const timestamp = Date.now();
    const businessPrefix = businessCode || 'BIZ';
    return `SALE-${businessPrefix}-${timestamp}`;
  }
}

/**
 * Validates if a sale number is in the correct format
 */
export function validateSaleNumber(saleNumber: string): boolean {
  const pattern = /^SALE-[A-Z]{2,4}-\d{4}-\d{3}$/;
  return pattern.test(saleNumber);
}

/**
 * Extracts business code from a sale number
 */
export function extractBusinessCodeFromSaleNumber(saleNumber: string): string | null {
  const match = saleNumber.match(/^SALE-([A-Z]{2,4})-\d{4}-\d{3}$/);
  return match && match[1] ? match[1] : null;
} 