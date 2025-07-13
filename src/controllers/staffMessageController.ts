import { AuthRequest } from '../middleware/auth';
import StaffMessageService from '../services/staffMessageService';
import { Response } from 'express';

export const createStaffMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const senderId = req.user?.userId;
    const senderName = req.user?.email; // fallback to email
    if (!businessId || !senderId || !senderName) {
      res.status(400).json({ error: 'Missing business or sender info' });
      return;
    }
    const data = {
      ...req.body,
      businessId,
      senderId,
      senderName
    };
    const message = await StaffMessageService.createMessage(data);
    res.status(201).json(message);
  } catch (error) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'SequelizeValidationError') {
      const err = error as any;
      res.status(400).json({ error: err.errors?.map((e: any) => e.message).join(', ') || err.message });
    } else {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  }
};

export const getStaffMessageById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const id = req.params.id ? parseInt(req.params.id, 10) : NaN;
    if (!businessId || isNaN(id)) {
      res.status(400).json({ error: 'Invalid business or message ID' });
      return;
    }
    const message = await StaffMessageService.getMessageById(id, businessId);
    if (!message) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : error });
  }
};

export const getStaffMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(400).json({ error: 'Missing businessId' });
      return;
    }
    const filters = req.query;
    const messages = await StaffMessageService.getMessagesByBusiness(businessId, filters);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : error });
  }
};

export const getStaffMessagesForUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const userId = req.user?.userId;
    const userRole = req.user?.role || '';
    if (!businessId || !userId || !userRole) {
      res.status(400).json({ error: 'Missing user or business info' });
      return;
    }
    const messages = await StaffMessageService.getMessagesForUser(userId, businessId, userRole);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : error });
  }
};

export const updateStaffMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const id = req.params.id ? parseInt(req.params.id, 10) : NaN;
    if (!businessId || isNaN(id)) {
      res.status(400).json({ error: 'Invalid business or message ID' });
      return;
    }
    const updated = await StaffMessageService.updateMessage(id, businessId, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }
    res.json(updated);
  } catch (error) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'SequelizeValidationError') {
      const err = error as any;
      res.status(400).json({ error: err.errors?.map((e: any) => e.message).join(', ') || err.message });
    } else {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  }
};

export const deleteStaffMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const id = req.params.id ? parseInt(req.params.id, 10) : NaN;
    if (!businessId || isNaN(id)) {
      res.status(400).json({ error: 'Invalid business or message ID' });
      return;
    }
    const deleted = await StaffMessageService.deleteMessage(id, businessId);
    if (!deleted) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : error });
  }
};

export const markStaffMessageAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const userId = req.user?.userId;
    const id = req.params.id ? parseInt(req.params.id, 10) : NaN;
    if (!businessId || !userId || isNaN(id)) {
      res.status(400).json({ error: 'Invalid user, business, or message ID' });
      return;
    }
    const result = await StaffMessageService.markMessageAsRead(id, userId, businessId);
    res.json({ success: result });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : error });
  }
};

export const markStaffMessageAsAcknowledged = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const userId = req.user?.userId;
    const id = req.params.id ? parseInt(req.params.id, 10) : NaN;
    if (!businessId || !userId || isNaN(id)) {
      res.status(400).json({ error: 'Invalid user, business, or message ID' });
      return;
    }
    const result = await StaffMessageService.markMessageAsAcknowledged(id, userId, businessId);
    res.json({ success: result });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : error });
  }
};

export const getUnreadStaffMessageCount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const userId = req.user?.userId;
    const userRole = req.user?.role || '';
    if (!businessId || !userId || !userRole) {
      res.status(400).json({ error: 'Missing user or business info' });
      return;
    }
    const count = await StaffMessageService.getUnreadCount(userId, businessId, userRole);
    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : error });
  }
};

export const getActiveStaffMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const userRole = req.user?.role || '';
    if (!businessId || !userRole) {
      res.status(400).json({ error: 'Missing business or user role' });
      return;
    }
    const messages = await StaffMessageService.getActiveMessages(businessId, userRole);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : error });
  }
}; 