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
            res.status(500).json({ error: req.t('errors.server.internal') });
        }
    };

    // Get business by ID
    public static getBusinessById: RequestHandler = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            
            if (!id) {
                res.status(400).json({ error: req.t('errors.validation.businessIdRequired') });
                return;
            }
            
            const businessId = parseInt(id);
            
            if (isNaN(businessId)) {
                res.status(400).json({ error: req.t('errors.validation.invalidBusinessId') });
                return;
            }

            logger(`API endpoint /businesses/${id} was called...`);
            const business = await BusinessService.getBusinessById(businessId);
            
            if (!business) {
                res.status(404).json({ error: req.t('errors.server.businessNotFound') });
                return;
            }

            res.json(business);
        } catch (error) {
            logger(`Error getting business by ID: ${error}`);
            res.status(500).json({ error: req.t('errors.server.internal') });
        }
    };

    // Get business by slug
    public static getBusinessBySlug: RequestHandler = async (req: Request, res: Response) => {
        try {
            const { slug } = req.params;
            
            if (!slug) {
                res.status(400).json({ error: req.t('errors.validation.businessSlugRequired') });
                return;
            }

            logger(`API endpoint /businesses/slug/${slug} was called...`);
            const business = await BusinessService.getBusinessBySlug(slug);
            
            if (!business) {
                res.status(404).json({ error: req.t('errors.server.businessNotFound') });
                return;
            }

            res.json(business);
        } catch (error) {
            logger(`Error getting business by slug: ${error}`);
            res.status(500).json({ error: req.t('errors.server.internal') });
        }
    };

    // Create new business
    public static createBusiness: RequestHandler = async (req: Request, res: Response) => {
        // Require admin role
        const user = (req as any).user;
        if (!user || user.role !== 'admin') {
            res.status(403).json({ error: req.t('errors.server.adminOnly') });
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
                currencyId, 
                timezone, 
                type 
            } = req.body;

            // Validate required fields
            if (!name || !slug) {
                res.status(400).json({ 
                    error: req.t('errors.validation.businessNameAndSlugRequired') 
                });
                return;
            }

            // Validate slug format
            const slugRegex = /^[a-z0-9-]+$/;
            if (!slugRegex.test(slug)) {
                res.status(400).json({ 
                    error: req.t('errors.validation.businessSlugFormat') 
                });
                return;
            }

            // Check if business with slug already exists
            const slugExists = await BusinessService.businessExistsBySlug(slug);
            if (slugExists) {
                res.status(409).json({ 
                    error: req.t('errors.validation.businessSlugExists') 
                });
                return;
            }

            // Validate tax rate
            if (taxRate !== undefined && (taxRate < 0 || taxRate > 100)) {
                res.status(400).json({ 
                    error: req.t('errors.validation.taxRateRange') 
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
                currencyId: currencyId || 2, // Default to CRC (ID: 2) 
                timezone: timezone || 'UTC',
                type: type || 'generic',
                defaultLanguage: 'en-US'
            });
            res.status(201).json(newBusiness);
        } catch (error) {
            logger(`Error creating business: ${error}`);
            res.status(500).json({ error: req.t('errors.server.internal') });
        }
    };

    // Update business
    public static updateBusiness: RequestHandler = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            
            if (!id) {
                res.status(400).json({ error: req.t('errors.validation.businessIdRequired') });
                return;
            }
            
            const businessId = parseInt(id);
            
            if (isNaN(businessId)) {
                res.status(400).json({ error: req.t('errors.validation.invalidBusinessId') });
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
                currencyId, 
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
            if (currencyId !== undefined) updateData.currencyId = currencyId;
            if (timezone !== undefined) updateData.timezone = timezone;
            if (isActive !== undefined) updateData.isActive = isActive;

            if (Object.keys(updateData).length === 0) {
                res.status(400).json({ error: req.t('errors.validation.noFieldsToUpdate') });
                return;
            }

            // Validate slug format if being updated
            if (updateData.slug) {
                const slugRegex = /^[a-z0-9-]+$/;
                if (!slugRegex.test(updateData.slug)) {
                    res.status(400).json({ 
                        error: req.t('errors.validation.businessSlugFormat') 
                    });
                    return;
                }
            }

            // Validate tax rate if being updated
            if (updateData.taxRate !== undefined && (updateData.taxRate < 0 || updateData.taxRate > 100)) {
                res.status(400).json({ error: req.t('errors.validation.taxRateRange') });
                return;
            }

            logger(`API endpoint PUT /businesses/${id} was called...`);
            const updatedBusiness = await BusinessService.updateBusiness(businessId, updateData);
            
            if (!updatedBusiness) {
                res.status(404).json({ error: req.t('errors.server.businessNotFound') });
                return;
            }

            res.json(updatedBusiness);
        } catch (error) {
            logger(`Error updating business: ${error}`);
            res.status(500).json({ error: req.t('errors.server.internal') });
        }
    };

    // Delete business
    public static deleteBusiness: RequestHandler = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            
            if (!id) {
                res.status(400).json({ error: req.t('errors.validation.businessIdRequired') });
                return;
            }
            
            const businessId = parseInt(id);
            
            if (isNaN(businessId)) {
                res.status(400).json({ error: req.t('errors.validation.invalidBusinessId') });
                return;
            }

            logger(`API endpoint DELETE /businesses/${id} was called...`);
            const deleted = await BusinessService.deleteBusiness(businessId);
            
            if (!deleted) {
                res.status(404).json({ error: req.t('errors.server.businessNotFound') });
                return;
            }

            res.json({ message: req.t('businesses.delete.success') });
        } catch (error) {
            logger(`Error deleting business: ${error}`);
            res.status(500).json({ error: req.t('errors.server.internal') });
        }
    };

    // Get business statistics
    public static getBusinessStats: RequestHandler = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            
            if (!id) {
                res.status(400).json({ error: req.t('errors.validation.businessIdRequired') });
                return;
            }
            
            const businessId = parseInt(id);
            
            if (isNaN(businessId)) {
                res.status(400).json({ error: req.t('errors.validation.invalidBusinessId') });
                return;
            }

            logger(`API endpoint /businesses/${id}/stats was called...`);
            const stats = await BusinessService.getBusinessStats(businessId);
            
            if (!stats) {
                res.status(404).json({ error: req.t('errors.server.businessNotFound') });
                return;
            }

            res.json(stats);
        } catch (error) {
            logger(`Error getting business stats: ${error}`);
            res.status(500).json({ error: req.t('errors.server.internal') });
        }
    };

    // Search businesses
    public static searchBusinesses: RequestHandler = async (req: Request, res: Response) => {
        try {
            const { q } = req.query;
            
            if (!q || typeof q !== 'string') {
                res.status(400).json({ error: req.t('errors.validation.searchQueryRequired') });
                return;
            }

            logger(`API endpoint /businesses/search?q=${q} was called...`);
            const businesses = await BusinessService.searchBusinesses(q);
            res.json(businesses);
        } catch (error) {
            logger(`Error searching businesses: ${error}`);
            res.status(500).json({ error: req.t('errors.server.internal') });
        }
    };

    // Get businesses by timezone
    public static getBusinessesByTimezone: RequestHandler = async (req: Request, res: Response) => {
        try {
            const { timezone } = req.params;
            
            if (!timezone) {
                res.status(400).json({ error: req.t('errors.validation.timezoneRequired') });
                return;
            }

            logger(`API endpoint /businesses/timezone/${timezone} was called...`);
            const businesses = await BusinessService.getBusinessesByTimezone(timezone);
            res.json(businesses);
        } catch (error) {
            logger(`Error getting businesses by timezone: ${error}`);
            res.status(500).json({ error: req.t('errors.server.internal') });
        }
    };

    // Get businesses by currency
    public static getBusinessesByCurrency: RequestHandler = async (req: Request, res: Response) => {
        try {
            const { currencyId } = req.params;
            
            if (!currencyId) {
                res.status(400).json({ error: req.t('errors.validation.currencyIdRequired') });
                return;
            }

            const currencyIdNum = parseInt(currencyId);
            if (isNaN(currencyIdNum)) {
                res.status(400).json({ error: req.t('errors.validation.invalidCurrencyId') });
                return;
            }

            logger(`API endpoint /businesses/currency/${currencyId} was called...`);
            const businesses = await BusinessService.getBusinessesByCurrency(currencyIdNum);
            res.json(businesses);
        } catch (error) {
            logger(`Error getting businesses by currency ID: ${error}`);
            res.status(500).json({ error: req.t('errors.server.internal') });
        }
    };

    // Get public business information by slug (no authentication required)
    public static getPublicBusinessBySlug: RequestHandler = async (req: Request, res: Response) => {
        try {
            const { slug } = req.params;

            if (!slug) {
                res.status(400).json({
                    success: false,
                    error: req.t('errors.validation.businessSlugRequired')
                });
                return;
            }

            logger(`Public API endpoint /public/businesses/slug/${slug} was called...`);
            const business = await BusinessService.getPublicBusinessBySlug(slug);

            if (!business) {
                res.status(404).json({
                    success: false,
                    error: req.t('errors.server.businessNotFound')
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: business
            });

        } catch (error) {
            logger(`Error retrieving public business info: ${error}`);
            res.status(500).json({
                success: false,
                error: req.t('errors.server.internal')
            });
        }
    };
} 