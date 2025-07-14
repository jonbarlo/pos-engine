import StaffMessageService from './staffMessageService';
import { StaffMessageRepository } from '../repositories/StaffMessageRepository';
import { StaffMessageAttributes, StaffMessageCreationAttributes, MessageType, RecipientType, MessageStatus } from '../models/StaffMessageModel';

jest.mock('../repositories/StaffMessageRepository');

const mockRepo = new StaffMessageRepository() as jest.Mocked<StaffMessageRepository>;
(StaffMessageService as any).repository = mockRepo;

describe('StaffMessageService', () => {
  const baseMessage: StaffMessageAttributes = {
    id: 1,
    businessId: 1,
    senderId: 1,
    senderName: 'test@example.com',
    messageType: MessageType.ANNOUNCEMENT,
    title: 'Test',
    content: 'Test message',
    recipientType: RecipientType.ALL,
    status: MessageStatus.SENT,
    priority: 'normal',
    isRead: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a message', async () => {
    mockRepo.create.mockResolvedValue(baseMessage);
    const data: StaffMessageCreationAttributes = {
      businessId: 1,
      senderId: 1,
      senderName: 'test@example.com',
      messageType: MessageType.ANNOUNCEMENT,
      title: 'Test',
      content: 'Test message',
      recipientType: RecipientType.ALL,
      status: MessageStatus.SENT,
      priority: 'normal',
      isRead: false,
    };
    const result = await StaffMessageService.createMessage(data);
    expect(result).toEqual(baseMessage);
    expect(mockRepo.create).toHaveBeenCalledWith(data);
  });

  it('gets a message by id', async () => {
    mockRepo.findById.mockResolvedValue(baseMessage);
    const result = await StaffMessageService.getMessageById(1, 1);
    expect(result).toEqual(baseMessage);
    expect(mockRepo.findById).toHaveBeenCalledWith(1, 1);
  });

  it('gets messages by business', async () => {
    mockRepo.findAllByBusiness.mockResolvedValue([baseMessage]);
    const result = await StaffMessageService.getMessagesByBusiness(1);
    expect(result).toEqual([baseMessage]);
    expect(mockRepo.findAllByBusiness).toHaveBeenCalledWith(1, undefined);
  });

  it('gets messages for user', async () => {
    mockRepo.findByRecipient.mockResolvedValue([baseMessage]);
    const result = await StaffMessageService.getMessagesForUser(1, 1, 'wait_staff');
    expect(result).toEqual([baseMessage]);
    expect(mockRepo.findByRecipient).toHaveBeenCalledWith(1, 1, 'wait_staff');
  });

  it('updates a message', async () => {
    mockRepo.update.mockResolvedValue({ ...baseMessage, title: 'Updated' });
    const result = await StaffMessageService.updateMessage(1, 1, { title: 'Updated' });
    expect(result).toEqual({ ...baseMessage, title: 'Updated' });
    expect(mockRepo.update).toHaveBeenCalledWith(1, 1, { title: 'Updated' });
  });

  it('deletes a message', async () => {
    mockRepo.delete.mockResolvedValue(true);
    const result = await StaffMessageService.deleteMessage(1, 1);
    expect(result).toBe(true);
    expect(mockRepo.delete).toHaveBeenCalledWith(1, 1);
  });

  it('marks a message as read', async () => {
    mockRepo.markAsRead.mockResolvedValue(true);
    const result = await StaffMessageService.markMessageAsRead(1, 2, 1);
    expect(result).toBe(true);
    expect(mockRepo.markAsRead).toHaveBeenCalledWith(1, 2, 1);
  });

  it('marks a message as acknowledged', async () => {
    mockRepo.markAsAcknowledged.mockResolvedValue(true);
    const result = await StaffMessageService.markMessageAsAcknowledged(1, 2, 1);
    expect(result).toBe(true);
    expect(mockRepo.markAsAcknowledged).toHaveBeenCalledWith(1, 2, 1);
  });

  it('gets unread count', async () => {
    mockRepo.getUnreadCount.mockResolvedValue(3);
    const result = await StaffMessageService.getUnreadCount(1, 1, 'wait_staff');
    expect(result).toBe(3);
    expect(mockRepo.getUnreadCount).toHaveBeenCalledWith(1, 1, 'wait_staff');
  });

  it('gets active messages', async () => {
    mockRepo.getActiveMessages.mockResolvedValue([baseMessage]);
    const result = await StaffMessageService.getActiveMessages(1, 'wait_staff');
    expect(result).toEqual([baseMessage]);
    expect(mockRepo.getActiveMessages).toHaveBeenCalledWith(1, 'wait_staff');
  });

  it('expires messages', async () => {
    mockRepo.expireMessages.mockResolvedValue(2);
    const result = await StaffMessageService.expireMessages();
    expect(result).toBe(2);
    expect(mockRepo.expireMessages).toHaveBeenCalled();
  });
}); 