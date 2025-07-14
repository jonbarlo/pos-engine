import { Op } from 'sequelize';
import { StaffMessageModel, StaffMessageAttributes, StaffMessageCreationAttributes, MessageStatus, RecipientType } from '../models/StaffMessageModel';
import { IStaffMessageRepository, StaffMessageFilters } from './interfaces/IStaffMessageRepository';
import { logger } from '../utils/logger';

export class StaffMessageRepository implements IStaffMessageRepository {

  async create(data: StaffMessageCreationAttributes): Promise<StaffMessageAttributes> {
    try {
      const message = await StaffMessageModel.create(data);
      return message.toJSON();
    } catch (error) {
      logger(`Error creating staff message: ${error}`);
      throw error;
    }
  }

  async findById(id: number, businessId: number): Promise<StaffMessageAttributes | null> {
    try {
      const message = await StaffMessageModel.findOne({
        where: { id, businessId }
      });
      return message ? message.toJSON() : null;
    } catch (error) {
      logger(`Error finding staff message by ID: ${error}`);
      throw error;
    }
  }

  async findAllByBusiness(businessId: number, filters: StaffMessageFilters = {}): Promise<StaffMessageAttributes[]> {
    try {
      const {
        messageType,
        recipientType,
        status,
        priority,
        senderId,
        startDate,
        endDate,
        page = 1,
        limit = 50
      } = filters;

      const where: any = { businessId };

      if (messageType) where.messageType = messageType;
      if (recipientType) where.recipientType = recipientType;
      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (senderId) where.senderId = senderId;

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = startDate;
        if (endDate) where.createdAt[Op.lte] = endDate;
      }

      const messages = await StaffMessageModel.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit,
        offset: (page - 1) * limit
      });

      return messages.map((message: any) => message.toJSON());
    } catch (error) {
      logger(`Error finding staff messages by business: ${error}`);
      throw error;
    }
  }

  async findByRecipient(userId: number, businessId: number, userRole: string): Promise<StaffMessageAttributes[]> {
    try {
      const where: any = {
        businessId,
        [Op.or]: [
          { recipientType: RecipientType.ALL },
          { recipientType: RecipientType.SPECIFIC_USERS }
        ]
      };

      // Add role-based filtering
      if (userRole === 'wait_staff') {
        where[Op.or].push({ recipientType: RecipientType.WAITSTAFF });
      } else if (userRole === 'kitchen_staff' || userRole === 'chef') {
        where[Op.or].push({ recipientType: RecipientType.KITCHEN });
      } else if (userRole === 'manager' || userRole === 'admin') {
        where[Op.or].push({ recipientType: RecipientType.MANAGERS });
      }

      // Filter out expired messages
      where[Op.and] = [
        {
          [Op.or]: [
            { expiresAt: null },
            { expiresAt: { [Op.gt]: new Date() } }
          ]
        }
      ];

      const messages = await StaffMessageModel.findAll({
        where,
        order: [
          ['priority', 'DESC'],
          ['createdAt', 'DESC']
        ]
      });

      // Filter specific users in JavaScript since SQLite doesn't support JSON operations well
      const filteredMessages = messages.map(message => message.toJSON()).filter(message => {
        if (message.recipientType === RecipientType.SPECIFIC_USERS) {
          const recipientIds = message.recipientIds || [];
          return recipientIds.includes(userId);
        }
        return true;
      });

      return filteredMessages;
    } catch (error) {
      logger(`Error finding staff messages by recipient: ${error}`);
      throw error;
    }
  }

  async update(id: number, businessId: number, data: Partial<StaffMessageAttributes>): Promise<StaffMessageAttributes | null> {
    try {
      const message = await StaffMessageModel.findOne({
        where: { id, businessId }
      });

      if (!message) return null;

      await message.update(data);
      return message.toJSON();
    } catch (error) {
      logger(`Error updating staff message: ${error}`);
      throw error;
    }
  }

  async delete(id: number, businessId: number): Promise<boolean> {
    try {
      const deleted = await StaffMessageModel.destroy({
        where: { id, businessId }
      });
      return deleted > 0;
    } catch (error) {
      logger(`Error deleting staff message: ${error}`);
      throw error;
    }
  }

  async markAsRead(id: number, userId: number, businessId: number): Promise<boolean> {
    try {
      const message = await StaffMessageModel.findOne({
        where: { id, businessId }
      });

      if (!message) return false;

      const readBy = message.readBy || [];
      if (!readBy.includes(userId)) {
        readBy.push(userId);
        const now = new Date();
        await message.update({ 
          readBy,
          readAt: now,
          isRead: true,
          status: readBy.length > 0 ? MessageStatus.READ : MessageStatus.SENT
        });
      }

      return true;
    } catch (error) {
      logger(`Error marking staff message as read: ${error}`);
      throw error;
    }
  }

  async markAsAcknowledged(id: number, userId: number, businessId: number): Promise<boolean> {
    try {
      const message = await StaffMessageModel.findOne({
        where: { id, businessId }
      });

      if (!message) return false;

      const acknowledgedBy = message.acknowledgedBy || [];
      if (!acknowledgedBy.includes(userId)) {
        acknowledgedBy.push(userId);
        await message.update({ 
          acknowledgedBy,
          status: MessageStatus.ACKNOWLEDGED
        });
      }

      return true;
    } catch (error) {
      logger(`Error marking staff message as acknowledged: ${error}`);
      throw error;
    }
  }

  async getUnreadCount(userId: number, businessId: number, userRole: string): Promise<number> {
    try {
      const messages = await this.findByRecipient(userId, businessId, userRole);
      return messages.filter(message => {
        const readBy = message.readBy || [];
        return !readBy.includes(userId);
      }).length;
    } catch (error) {
      logger(`Error getting unread count: ${error}`);
      throw error;
    }
  }

  async getActiveMessages(businessId: number, userRole: string): Promise<StaffMessageAttributes[]> {
    try {
      const where: any = {
        businessId,
        status: { [Op.ne]: MessageStatus.EXPIRED },
        [Op.or]: [
          { expiresAt: null },
          { expiresAt: { [Op.gt]: new Date() } }
        ]
      };

      // Add role-based filtering
      if (userRole === 'wait_staff') {
        where[Op.or] = [
          { recipientType: RecipientType.ALL },
          { recipientType: RecipientType.WAITSTAFF }
        ];
      } else if (userRole === 'kitchen_staff' || userRole === 'chef') {
        where[Op.or] = [
          { recipientType: RecipientType.ALL },
          { recipientType: RecipientType.KITCHEN }
        ];
      } else if (userRole === 'manager' || userRole === 'admin') {
        where[Op.or] = [
          { recipientType: RecipientType.ALL },
          { recipientType: RecipientType.MANAGERS }
        ];
      }

      const messages = await StaffMessageModel.findAll({
        where,
        order: [
          ['priority', 'DESC'],
          ['createdAt', 'DESC']
        ]
      });

      return messages.map(message => message.toJSON());
    } catch (error) {
      logger(`Error getting active messages: ${error}`);
      throw error;
    }
  }

  async expireMessages(): Promise<number> {
    try {
      const expired = await StaffMessageModel.update(
        { status: MessageStatus.EXPIRED },
        {
          where: {
            expiresAt: { [Op.lt]: new Date() },
            status: { [Op.ne]: MessageStatus.EXPIRED }
          }
        }
      );
      return expired[0];
    } catch (error) {
      logger(`Error expiring messages: ${error}`);
      throw error;
    }
  }
} 