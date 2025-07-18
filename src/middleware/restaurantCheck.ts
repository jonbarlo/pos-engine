import { Request, Response, NextFunction } from 'express';
import { requireRestaurantBusiness } from '../utils/businessTypeCheck';
import { logger } from '../utils/logger';

// Extend Express Request interface to include businessType
declare global {
  namespace Express {
    interface Request {
      businessType?: string;
    }
  }
}

/**
 * Middleware to ensure the business is of restaurant type
 * Extracts businessId from request params, query, or body
 */
export const requireRestaurant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract businessId from various possible sources
    const businessId = req.params.businessId || 
                      req.query.businessId || 
                      req.body.businessId ||
                      (req as any).user?.businessId;

    logger(`🔍 DEBUG: requireRestaurant - businessId: ${businessId}, user: ${JSON.stringify((req as any).user)}`);

    if (!businessId) {
      logger(`❌ DEBUG: No businessId found in request`);
      res.status(400).json({
        error: 'Business ID is required',
        message: 'Please provide a business ID to access this feature'
      });
      return;
    }

    logger(`🔍 DEBUG: Calling requireRestaurantBusiness with businessId: ${businessId}`);
    await requireRestaurantBusiness(Number(businessId));
    logger(`✅ DEBUG: Restaurant check passed for businessId: ${businessId}`);
    next();
  } catch (error) {
    logger(`❌ DEBUG: Restaurant check failed: ${error}`);
    res.status(403).json({
      error: 'Feature not available',
      message: 'This feature is only available for restaurant businesses',
      requiredType: 'restaurant'
    });
    return;
  }
};

/**
 * Middleware to check business type and add it to request
 */
export const addBusinessType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const businessId = req.params.businessId || 
                      req.query.businessId || 
                      req.body.businessId ||
                      (req as any).user?.businessId;

    if (businessId) {
      const { getBusinessType } = await import('../utils/businessTypeCheck');
      const businessType = await getBusinessType(Number(businessId));
      req.businessType = businessType;
    }
    
    next();
  } catch (error) {
    logger(`Error adding business type: ${error}`);
    next(); // Continue even if we can't get business type
  }
}; 