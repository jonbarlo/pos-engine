import { StaffMessageRepository } from '../repositories/StaffMessageRepository';
import { StaffMessageAttributes, StaffMessageCreationAttributes, MessageType, RecipientType, MessageStatus } from '../models/StaffMessageModel';
import { StaffMessageFilters } from '../repositories/interfaces/IStaffMessageRepository';

export class StaffMessageService {
  private static repository = new StaffMessageRepository();

  static async createMessage(data: StaffMessageCreationAttributes): Promise<StaffMessageAttributes> {
    return this.repository.create(data);
  }

  static async getMessageById(id: number, businessId: number): Promise<StaffMessageAttributes | null> {
    return this.repository.findById(id, businessId);
  }

  static async getMessagesByBusiness(businessId: number, filters?: StaffMessageFilters): Promise<StaffMessageAttributes[]> {
    return this.repository.findAllByBusiness(businessId, filters);
  }

  static async getMessagesForUser(userId: number, businessId: number, userRole: string): Promise<StaffMessageAttributes[]> {
    return this.repository.findByRecipient(userId, businessId, userRole);
  }

  static async updateMessage(id: number, businessId: number, data: Partial<StaffMessageAttributes>): Promise<StaffMessageAttributes | null> {
    return this.repository.update(id, businessId, data);
  }

  static async deleteMessage(id: number, businessId: number): Promise<boolean> {
    return this.repository.delete(id, businessId);
  }

  static async markMessageAsRead(id: number, userId: number, businessId: number): Promise<boolean> {
    return this.repository.markAsRead(id, userId, businessId);
  }

  static async markMessageAsAcknowledged(id: number, userId: number, businessId: number): Promise<boolean> {
    return this.repository.markAsAcknowledged(id, userId, businessId);
  }

  static async getUnreadCount(userId: number, businessId: number, userRole: string): Promise<number> {
    return this.repository.getUnreadCount(userId, businessId, userRole);
  }

  static async getActiveMessages(businessId: number, userRole: string): Promise<StaffMessageAttributes[]> {
    return this.repository.getActiveMessages(businessId, userRole);
  }

  static async expireMessages(): Promise<number> {
    return this.repository.expireMessages();
  }
}

export default StaffMessageService; 