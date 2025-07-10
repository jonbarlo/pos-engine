import { Request, Response, RequestHandler } from 'express';
import { logger } from '../utils/logger';
import { BusinessService } from '../services/businessService';

export class BusinessController {

    // Get all businesses
    public static getAll: RequestHandler = async (req: Request, res: Response) => {
        try {
            logger('API endpoint /businesses was called...');
            const businesses = await BusinessService.getAllActiveBusinesses();
            res.json(businesses);
        } catch (error) {
            logger(`Error getting businesses: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    // Get business by ID
    public static getBusinessById: RequestHandler = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            
            if (!id) {
                res.status(400).json({ error: 'Business ID is required' });
                return;
            }
            
            const businessId = parseInt(id);
            
            if (isNaN(businessId)) {
                res.status(400).json({ error: 'Invalid business ID' });
                return;
            }

            logger(`API endpoint /businesses/${id} was called...`);
            const business = await BusinessService.getBusinessById(businessId);
            
            if (!business) {
                res.status(404).json({ error: 'Business not found' });
                return;
            }

            res.json(business);
        } catch (error) {
            logger(`Error getting business by ID: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    // Get business by slug
    public static getBusinessBySlug: RequestHandler = async (req: Request, res: Response) => {
        try {
            const { slug } = req.params;
            
            if (!slug) {
                res.status(400).json({ error: 'Business slug is required' });
                return;
            }

            logger(`API endpoint /businesses/slug/${slug} was called...`);
            const business = await BusinessService.getBusinessBySlug(slug);
            
            if (!business) {
                res.status(404).json({ error: 'Business not found' });
                return;
            }

            res.json(business);
        } catch (error) {
            logger(`Error getting business by slug: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    // Create new business
    public static createBusiness: RequestHandler = async (req: Request, res: Response) => {
        // Require admin role
        const user = (req as any).user;
        if (!user || user.role !== 'admin') {
            res.status(403).json({ error: 'Only admin users can create new businesses' });
            return;
        }

        try {
            const { 
                name, 
                slug, 
                description, 
                logo, 
                primaryColor, 
                secondaryColor, 
                address, 
                phone, 
                email, 
                website, 
                taxRate, 
                currency, 
                timezone,
                type 
            } = req.body;

            // Validate required fields
            if (!name || !slug) {
                res.status(400).json({ 
                    error: 'Name and slug are required' 
                });
                return;
            }

            // Validate slug format
            const slugRegex = /^[a-z0-9-]+$/;
            if (!slugRegex.test(slug)) {
                res.status(400).json({ 
                    error: 'Slug must contain only lowercase letters, numbers, and hyphens' 
                });
                return;
            }

            // Check if business with slug already exists
            const slugExists = await BusinessService.businessExistsBySlug(slug);
            if (slugExists) {
                res.status(409).json({ 
                    error: 'Business with this slug already exists' 
                });
                return;
            }

            // Validate tax rate
            if (taxRate !== undefined && (taxRate < 0 || taxRate > 100)) {
                res.status(400).json({ 
                    error: 'Tax rate must be between 0 and 100' 
                });
                return;
            }

            logger('API endpoint POST /businesses was called...');
            const newBusiness = await BusinessService.createBusiness({ 
                name, 
                slug, 
                description, 
                logo, 
                primaryColor, 
                secondaryColor, 
                address, 
                phone, 
                email, 
                website, 
                taxRate: taxRate || 0, 
                currency: currency || 'USD', 
                timezone: timezone || 'UTC',
                type: type || 'generic'
            });
            res.status(201).json(newBusiness);
        } catch (error) {
            logger(`Error creating business: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    // Update business
    public static updateBusiness: RequestHandler = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            
            if (!id) {
                res.status(400).json({ error: 'Business ID is required' });
                return;
            }
            
            const businessId = parseInt(id);
            
            if (isNaN(businessId)) {
                res.status(400).json({ error: 'Invalid business ID' });
                return;
            }

            const { 
                name, 
                slug, 
                description, 
                logo, 
                primaryColor, 
                secondaryColor, 
                address, 
                phone, 
                email, 
                website, 
                taxRate, 
                currency, 
                timezone, 
                isActive 
            } = req.body;
            
            const updateData: any = {};
            
            if (name !== undefined) updateData.name = name;
            if (slug !== undefined) updateData.slug = slug;
            if (description !== undefined) updateData.description = description;
            if (logo !== undefined) updateData.logo = logo;
            if (primaryColor !== undefined) updateData.primaryColor = primaryColor;
            if (secondaryColor !== undefined) updateData.secondaryColor = secondaryColor;
            if (address !== undefined) updateData.address = address;
            if (phone !== undefined) updateData.phone = phone;
            if (email !== undefined) updateData.email = email;
            if (website !== undefined) updateData.website = website;
            if (taxRate !== undefined) updateData.taxRate = taxRate;
            if (currency !== undefined) updateData.currency = currency;
            if (timezone !== undefined) updateData.timezone = timezone;
            if (isActive !== undefined) updateData.isActive = isActive;

            if (Object.keys(updateData).length === 0) {
                res.status(400).json({ error: 'No fields to update' });
                return;
            }

            // Validate slug format if being updated
            if (updateData.slug) {
                const slugRegex = /^[a-z0-9-]+$/;
                if (!slugRegex.test(updateData.slug)) {
                    res.status(400).json({ 
                        error: 'Slug must contain only lowercase letters, numbers, and hyphens' 
                    });
                    return;
                }
            }

            // Validate tax rate if being updated
            if (updateData.taxRate !== undefined && (updateData.taxRate < 0 || updateData.taxRate > 100)) {
                res.status(400).json({ error: 'Tax rate must be between 0 and 100' });
                return;
            }

            logger(`API endpoint PUT /businesses/${id} was called...`);
            const updatedBusiness = await BusinessService.updateBusiness(businessId, updateData);
            
            if (!updatedBusiness) {
                res.status(404).json({ error: 'Business not found' });
                return;
            }

            res.json(updatedBusiness);
        } catch (error) {
            logger(`Error updating business: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    // Delete business
    public static deleteBusiness: RequestHandler = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            
            if (!id) {
                res.status(400).json({ error: 'Business ID is required' });
                return;
            }
            
            const businessId = parseInt(id);
            
            if (isNaN(businessId)) {
                res.status(400).json({ error: 'Invalid business ID' });
                return;
            }

            logger(`API endpoint DELETE /businesses/${id} was called...`);
            const deleted = await BusinessService.deleteBusiness(businessId);
            
            if (!deleted) {
                res.status(404).json({ error: 'Business not found' });
                return;
            }

            res.json({ message: 'Business deleted successfully' });
        } catch (error) {
            logger(`Error deleting business: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    // Get business statistics
    public static getBusinessStats: RequestHandler = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            
            if (!id) {
                res.status(400).json({ error: 'Business ID is required' });
                return;
            }
            
            const businessId = parseInt(id);
            
            if (isNaN(businessId)) {
                res.status(400).json({ error: 'Invalid business ID' });
                return;
            }

            logger(`API endpoint /businesses/${id}/stats was called...`);
            const stats = await BusinessService.getBusinessStats(businessId);
            
            if (!stats) {
                res.status(404).json({ error: 'Business not found' });
                return;
            }

            res.json(stats);
        } catch (error) {
            logger(`Error getting business stats: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    // Search businesses
    public static searchBusinesses: RequestHandler = async (req: Request, res: Response) => {
        try {
            const { q } = req.query;
            
            if (!q || typeof q !== 'string') {
                res.status(400).json({ error: 'Search query is required' });
                return;
            }

            logger(`API endpoint /businesses/search?q=${q} was called...`);
            const businesses = await BusinessService.searchBusinesses(q);
            res.json(businesses);
        } catch (error) {
            logger(`Error searching businesses: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    // Get businesses by timezone
    public static getBusinessesByTimezone: RequestHandler = async (req: Request, res: Response) => {
        try {
            const { timezone } = req.params;
            
            if (!timezone) {
                res.status(400).json({ error: 'Timezone is required' });
                return;
            }

            logger(`API endpoint /businesses/timezone/${timezone} was called...`);
            const businesses = await BusinessService.getBusinessesByTimezone(timezone);
            res.json(businesses);
        } catch (error) {
            logger(`Error getting businesses by timezone: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    // Get businesses by currency
    public static getBusinessesByCurrency: RequestHandler = async (req: Request, res: Response) => {
        try {
            const { currency } = req.params;
            
            if (!currency) {
                res.status(400).json({ error: 'Currency is required' });
                return;
            }

            logger(`API endpoint /businesses/currency/${currency} was called...`);
            const businesses = await BusinessService.getBusinessesByCurrency(currency);
            res.json(businesses);
        } catch (error) {
            logger(`Error getting businesses by currency: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
} 