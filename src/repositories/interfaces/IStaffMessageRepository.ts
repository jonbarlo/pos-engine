import { StaffMessageAttributes, StaffMessageCreationAttributes, MessageType, RecipientType, MessageStatus } from '../../models/StaffMessageModel';

export interface IStaffMessageRepository {
  create(data: StaffMessageCreationAttributes): Promise<StaffMessageAttributes>;
  findById(id: number, businessId: number): Promise<StaffMessageAttributes | null>;
  findAllByBusiness(businessId: number, filters?: StaffMessageFilters): Promise<StaffMessageAttributes[]>;
  findByRecipient(userId: number, businessId: number, userRole: string): Promise<StaffMessageAttributes[]>;
  update(id: number, businessId: number, data: Partial<StaffMessageAttributes>): Promise<StaffMessageAttributes | null>;
  delete(id: number, businessId: number): Promise<boolean>;
  markAsRead(id: number, userId: number, businessId: number): Promise<boolean>;
  markAsAcknowledged(id: number, userId: number, businessId: number): Promise<boolean>;
  getUnreadCount(userId: number, businessId: number, userRole: string): Promise<number>;
  getActiveMessages(businessId: number, userRole: string): Promise<StaffMessageAttributes[]>;
  expireMessages(): Promise<number>;
}

export interface StaffMessageFilters {
  messageType?: MessageType;
  recipientType?: RecipientType;
  status?: MessageStatus;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  senderId?: number;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
} 