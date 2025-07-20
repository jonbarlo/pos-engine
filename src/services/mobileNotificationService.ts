import { MobileNotificationModel } from '../models/MobileNotificationModel';
import { logger } from '../utils/logger';
import { Op, fn, col } from 'sequelize';

interface NotificationFilters {
  page?: number;
  limit?: number;
  type?: string;
  targetAudience?: string;
  isActive?: boolean;
}

interface SearchFilters {
  query?: string;
  type?: string;
  targetAudience?: string;
  isActive?: boolean;
}

interface PaginationOptions {
  page: number;
  limit: number;
}

export class MobileNotificationService {
  /**
   * Get all mobile notifications with pagination and filters
   */
  async getAllNotifications(businessId: number, filters: NotificationFilters = {}) {
    try {
      const { page = 1, limit = 10, type, targetAudience, isActive } = filters;
      const offset = (page - 1) * limit;

      const whereClause: any = { businessId };

      if (type) whereClause.type = type;
      if (targetAudience) whereClause.targetAudience = targetAudience;
      if (isActive !== undefined) whereClause.isActive = isActive;

      const { count, rows } = await MobileNotificationModel.findAndCountAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      logger(`📱 Retrieved ${rows.length} mobile notifications for business ${businessId}`);
      
      return {
        data: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger(`❌ Error getting mobile notifications: ${error}`);
      throw error;
    }
  }

  /**
   * Get a single mobile notification by ID
   */
  async getNotificationById(id: number, businessId: number) {
    try {
      const notification = await MobileNotificationModel.findOne({
        where: { id, businessId }
      });

      if (notification) {
        logger(`📱 Retrieved mobile notification ${id} for business ${businessId}`);
      }

      return notification;
    } catch (error) {
      logger(`❌ Error getting mobile notification: ${error}`);
      throw error;
    }
  }

  /**
   * Create a new mobile notification
   */
  async createNotification(businessId: number, notificationData: any) {
    try {
      const notification = await MobileNotificationModel.create({
        ...notificationData,
        businessId,
        isActive: true
      });

      logger(`📱 Created mobile notification ${notification.id} for business ${businessId}`);
      return notification;
    } catch (error) {
      logger(`❌ Error creating mobile notification: ${error}`);
      throw error;
    }
  }

  /**
   * Update a mobile notification
   */
  async updateNotification(id: number, businessId: number, updateData: any) {
    try {
      const notification = await MobileNotificationModel.findOne({
        where: { id, businessId }
      });

      if (!notification) {
        return null;
      }

      await notification.update(updateData);
      
      logger(`📱 Updated mobile notification ${id} for business ${businessId}`);
      return notification;
    } catch (error) {
      logger(`❌ Error updating mobile notification: ${error}`);
      throw error;
    }
  }

  /**
   * Delete a mobile notification (soft delete)
   */
  async deleteNotification(id: number, businessId: number) {
    try {
      const notification = await MobileNotificationModel.findOne({
        where: { id, businessId }
      });

      if (!notification) {
        return false;
      }

      await notification.update({ isActive: false });
      
      logger(`📱 Deleted mobile notification ${id} for business ${businessId}`);
      return true;
    } catch (error) {
      logger(`❌ Error deleting mobile notification: ${error}`);
      throw error;
    }
  }

  /**
   * Search mobile notifications
   */
  async searchNotifications(businessId: number, filters: SearchFilters = {}) {
    try {
      const { query, type, targetAudience, isActive } = filters;

      const whereClause: any = { businessId };

      if (query) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${query}%` } },
          { message: { [Op.like]: `%${query}%` } }
        ];
      }

      if (type) whereClause.type = type;
      if (targetAudience) whereClause.targetAudience = targetAudience;
      if (isActive !== undefined) whereClause.isActive = isActive;

      const notifications = await MobileNotificationModel.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']]
      });

      logger(`📱 Searched mobile notifications for business ${businessId} with query: ${query}`);
      return { data: notifications, total: notifications.length };
    } catch (error) {
      logger(`❌ Error searching mobile notifications: ${error}`);
      throw error;
    }
  }

  /**
   * Get mobile notification statistics
   */
  async getNotificationStats(businessId: number) {
    try {
      const totalNotifications = await MobileNotificationModel.count({
        where: { businessId }
      });

      const activeNotifications = await MobileNotificationModel.count({
        where: { businessId, isActive: true }
      });

      const notificationsByType = await MobileNotificationModel.findAll({
        where: { businessId },
        attributes: [
          'type',
          [fn('COUNT', col('id')), 'count']
        ],
        group: ['type'],
        raw: true
      });

      const notificationsByAudience = await MobileNotificationModel.findAll({
        where: { businessId },
        attributes: [
          'targetAudience',
          [fn('COUNT', col('id')), 'count']
        ],
        group: ['targetAudience'],
        raw: true
      });

      const recentNotifications = await MobileNotificationModel.findAll({
        where: { businessId },
        order: [['createdAt', 'DESC']],
        limit: 5
      });

      const stats = {
        totalNotifications,
        activeNotifications,
        inactiveNotifications: totalNotifications - activeNotifications,
        notificationsByType: notificationsByType.reduce((acc: any, item: any) => {
          acc[item.type] = parseInt((item as any).count);
          return acc;
        }, {}),
        notificationsByAudience: notificationsByAudience.reduce((acc: any, item: any) => {
          acc[item.targetAudience] = parseInt((item as any).count);
          return acc;
        }, {}),
        recentNotifications
      };

      logger(`📱 Retrieved mobile notification statistics for business ${businessId}`);
      return stats;
    } catch (error) {
      logger(`❌ Error getting mobile notification statistics: ${error}`);
      throw error;
    }
  }

  /**
   * Get notifications by type
   */
  async getNotificationsByType(businessId: number, type: string, options: PaginationOptions = { page: 1, limit: 10 }) {
    try {
      const { page, limit } = options;
      const offset = (page - 1) * limit;

      const { count, rows } = await MobileNotificationModel.findAndCountAll({
        where: { businessId, type },
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      logger(`📱 Retrieved ${rows.length} ${type} notifications for business ${businessId}`);
      
      return {
        data: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger(`❌ Error getting notifications by type: ${error}`);
      throw error;
    }
  }

  /**
   * Get notifications by target audience
   */
  async getNotificationsByAudience(businessId: number, audience: string, options: PaginationOptions = { page: 1, limit: 10 }) {
    try {
      const { page, limit } = options;
      const offset = (page - 1) * limit;

      const { count, rows } = await MobileNotificationModel.findAndCountAll({
        where: { businessId, targetAudience: audience },
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      logger(`📱 Retrieved ${rows.length} notifications for audience ${audience} in business ${businessId}`);
      
      return {
        data: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger(`❌ Error getting notifications by audience: ${error}`);
      throw error;
    }
  }
} 