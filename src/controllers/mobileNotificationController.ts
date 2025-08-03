import { Request, Response, RequestHandler } from 'express';
import { logger } from '../utils/logger';
import { MobileNotificationService } from '../services/mobileNotificationService';

interface AuthRequest extends Request {
    user?: {
        userId: number;
        businessId: number;
        email: string;
        role: string;
    };
}

export class MobileNotificationController {
    private static notificationService = new MobileNotificationService();

    // Get all mobile notifications for the current business
    public static getAllNotifications: RequestHandler = async (req: AuthRequest, res: Response) => {
        try {
            logger('API endpoint /mobile-notifications was called...');
            
            if (!req.user?.businessId) {
                res.status(401).json({ error: req.t('errors.server.unauthorized') });
                return;
            }

            const { page = 1, limit = 10, type, targetAudience, isActive } = req.query;
            
            const notifications = await MobileNotificationController.notificationService.getAllNotifications(
                req.user.businessId,
                {
                    page: Number(page),
                    limit: Number(limit),
                    type: type as string,
                    targetAudience: targetAudience as string,
                    isActive: isActive === 'true'
                }
            );
            
            res.json(notifications);
        } catch (error) {
            logger(`Error getting mobile notifications: ${error}`);
            res.status(500).json({ error: req.t('mobileNotification.getAll.error') });
        }
    };

    // Get mobile notification by ID
    public static getNotificationById: RequestHandler = async (req: AuthRequest, res: Response) => {
        try {
            const { id } = req.params;
            
            if (!id) {
                res.status(400).json({ error: req.t('errors.validation.notificationIdRequired') });
                return;
            }
            
            if (!req.user?.businessId) {
                res.status(401).json({ error: req.t('errors.server.unauthorized') });
                return;
            }
            
            const notificationId = parseInt(id);
            
            if (isNaN(notificationId)) {
                res.status(400).json({ error: req.t('errors.validation.invalidNotificationId') });
                return;
            }

            logger(`API endpoint /mobile-notifications/${id} was called...`);
            const notification = await MobileNotificationController.notificationService.getNotificationById(notificationId, req.user.businessId);
            
            if (!notification) {
                res.status(404).json({ error: req.t('errors.server.notificationNotFound') });
                return;
            }

            res.json(notification);
        } catch (error) {
            logger(`Error getting mobile notification by ID: ${error}`);
            res.status(500).json({ error: req.t('mobileNotification.getById.error') });
        }
    };

    // Create new mobile notification
    public static createNotification: RequestHandler = async (req: AuthRequest, res: Response) => {
        try {
            if (!req.user?.businessId) {
                res.status(401).json({ error: req.t('errors.server.unauthorized') });
                return;
            }

            const { type, title, message, targetAudience, isActive } = req.body;

            // Validate input
            if (!type || !title || !message || !targetAudience) {
                res.status(400).json({ 
                    error: req.t('errors.validation.notificationFieldsRequired') 
                });
                return;
            }

            // Validate type
            if (!['promotion', 'recipe', 'general'].includes(type)) {
                res.status(400).json({ 
                    error: req.t('errors.validation.invalidNotificationType') 
                });
                return;
            }

            // Validate targetAudience
            if (!['waitstaff', 'loyalty', 'all'].includes(targetAudience)) {
                res.status(400).json({ 
                    error: req.t('errors.validation.invalidTargetAudience') 
                });
                return;
            }

            logger('API endpoint POST /mobile-notifications was called...');
            const newNotification = await MobileNotificationController.notificationService.createNotification(
                req.user.businessId,
                {
                    type,
                    title,
                    message,
                    targetAudience,
                    isActive: isActive !== undefined ? isActive : true
                }
            );
            
            res.status(201).json(newNotification);
        } catch (error) {
            logger(`Error creating mobile notification: ${error}`);
            res.status(500).json({ error: req.t('mobileNotification.create.error') });
        }
    };

    // Update mobile notification
    public static updateNotification: RequestHandler = async (req: AuthRequest, res: Response) => {
        try {
            const { id } = req.params;
            
            if (!id) {
                res.status(400).json({ error: req.t('errors.validation.notificationIdRequired') });
                return;
            }
            
            if (!req.user?.businessId) {
                res.status(401).json({ error: req.t('errors.server.unauthorized') });
                return;
            }
            
            const notificationId = parseInt(id);
            
            if (isNaN(notificationId)) {
                res.status(400).json({ error: req.t('errors.validation.invalidNotificationId') });
                return;
            }

            const { type, title, message, targetAudience, isActive } = req.body;
            const updateData: any = {};
            
            if (type) {
                if (!['promotion', 'recipe', 'general'].includes(type)) {
                    res.status(400).json({ 
                        error: req.t('errors.validation.invalidNotificationType') 
                    });
                    return;
                }
                updateData.type = type;
            }
            if (title) updateData.title = title;
            if (message) updateData.message = message;
            if (targetAudience) {
                if (!['waitstaff', 'loyalty', 'all'].includes(targetAudience)) {
                    res.status(400).json({ 
                        error: req.t('errors.validation.invalidTargetAudience') 
                    });
                    return;
                }
                updateData.targetAudience = targetAudience;
            }
            if (isActive !== undefined) updateData.isActive = isActive;

            if (Object.keys(updateData).length === 0) {
                res.status(400).json({ error: req.t('errors.validation.noFieldsToUpdate') });
                return;
            }

            logger(`API endpoint PUT /mobile-notifications/${id} was called...`);
            const updatedNotification = await MobileNotificationController.notificationService.updateNotification(notificationId, req.user.businessId, updateData);
            
            if (!updatedNotification) {
                res.status(404).json({ error: req.t('errors.server.notificationNotFound') });
                return;
            }

            res.json(updatedNotification);
        } catch (error) {
            logger(`Error updating mobile notification: ${error}`);
            res.status(500).json({ error: req.t('mobileNotification.update.error') });
        }
    };

    // Delete mobile notification
    public static deleteNotification: RequestHandler = async (req: AuthRequest, res: Response) => {
        try {
            const { id } = req.params;
            
            if (!id) {
                res.status(400).json({ error: req.t('errors.validation.notificationIdRequired') });
                return;
            }
            
            if (!req.user?.businessId) {
                res.status(401).json({ error: req.t('errors.server.unauthorized') });
                return;
            }
            
            const notificationId = parseInt(id);
            
            if (isNaN(notificationId)) {
                res.status(400).json({ error: req.t('errors.validation.invalidNotificationId') });
                return;
            }

            logger(`API endpoint DELETE /mobile-notifications/${id} was called...`);
            const deleted = await MobileNotificationController.notificationService.deleteNotification(notificationId, req.user.businessId);
            
            if (!deleted) {
                res.status(404).json({ error: req.t('errors.server.notificationNotFound') });
                return;
            }

            res.json({ message: req.t('mobileNotification.delete.success') });
        } catch (error) {
            logger(`Error deleting mobile notification: ${error}`);
            res.status(500).json({ error: req.t('mobileNotification.delete.error') });
        }
    };

    // Search mobile notifications
    public static searchNotifications: RequestHandler = async (req: AuthRequest, res: Response) => {
        try {
            if (!req.user?.businessId) {
                res.status(401).json({ error: req.t('errors.server.unauthorized') });
                return;
            }

            const { q } = req.query;
            
            if (!q || typeof q !== 'string') {
                res.status(400).json({ error: req.t('errors.validation.searchQueryRequired') });
                return;
            }

            logger(`API endpoint /mobile-notifications/search was called with query: ${q}`);
            const results = await MobileNotificationController.notificationService.searchNotifications(
                req.user.businessId,
                {
                    query: q
                }
            );
            
            res.json(results);
        } catch (error) {
            logger(`Error searching mobile notifications: ${error}`);
            res.status(500).json({ error: req.t('mobileNotification.search.error') });
        }
    };

    // Get notification statistics
    public static getNotificationStats: RequestHandler = async (req: AuthRequest, res: Response) => {
        try {
            if (!req.user?.businessId) {
                res.status(401).json({ error: req.t('errors.server.unauthorized') });
                return;
            }

            logger('API endpoint /mobile-notifications/stats was called...');
            const stats = await MobileNotificationController.notificationService.getNotificationStats(req.user.businessId);
            
            res.json(stats);
        } catch (error) {
            logger(`Error getting mobile notification stats: ${error}`);
            res.status(500).json({ error: req.t('mobileNotification.getStats.error') });
        }
    };
} 