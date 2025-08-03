import { AuthRequest } from '../middleware/auth';
import StaffMessageService from '../services/staffMessageService';
import { Response } from 'express';

export const createStaffMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const senderId = req.user?.userId;
    const senderName = req.user?.email; // fallback to email
    if (!businessId || !senderId || !senderName) {
      res.status(400).json({ error: req.t('errors.validation.missingBusinessOrSenderInfo') });
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
        res.status(500).json({ error: req.t('errors.server.internal') });
      }
    }
};

export const getStaffMessageById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const id = req.params.id ? parseInt(req.params.id, 10) : NaN;
    if (!businessId || isNaN(id)) {
      res.status(400).json({ error: req.t('errors.validation.invalidBusinessOrMessageId') });
      return;
    }
    const message = await StaffMessageService.getMessageById(id, businessId);
    if (!message) {
      res.status(404).json({ error: req.t('errors.server.messageNotFound') });
      return;
    }
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: req.t('errors.server.internal') });
  }
};

export const getStaffMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(400).json({ error: req.t('errors.validation.missingBusinessId') });
      return;
    }
    const filters = req.query;
    const messages = await StaffMessageService.getMessagesByBusiness(businessId, filters);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: req.t('errors.server.internal') });
  }
};

export const getStaffMessagesForUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const userId = req.user?.userId;
    const userRole = req.user?.role || '';
    if (!businessId || !userId || !userRole) {
      res.status(400).json({ error: req.t('errors.validation.missingUserOrBusinessInfo') });
      return;
    }
    const messages = await StaffMessageService.getMessagesForUser(userId, businessId, userRole);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: req.t('errors.server.internal') });
  }
};

export const updateStaffMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const id = req.params.id ? parseInt(req.params.id, 10) : NaN;
    if (!businessId || isNaN(id)) {
      res.status(400).json({ error: req.t('errors.validation.invalidBusinessOrMessageId') });
      return;
    }
    const updated = await StaffMessageService.updateMessage(id, businessId, req.body);
    if (!updated) {
      res.status(404).json({ error: req.t('errors.server.messageNotFound') });
      return;
    }
    res.json(updated);
  } catch (error) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'SequelizeValidationError') {
      const err = error as any;
      res.status(400).json({ error: err.errors?.map((e: any) => e.message).join(', ') || err.message });
    } else {
      res.status(500).json({ error: req.t('errors.server.internal') });
    }
  }
};

export const deleteStaffMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const id = req.params.id ? parseInt(req.params.id, 10) : NaN;
    if (!businessId || isNaN(id)) {
      res.status(400).json({ error: req.t('errors.validation.invalidBusinessOrMessageId') });
      return;
    }
    const deleted = await StaffMessageService.deleteMessage(id, businessId);
    if (!deleted) {
      res.status(404).json({ error: req.t('errors.server.messageNotFound') });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: req.t('errors.server.internal') });
  }
};

export const markStaffMessageAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const userId = req.user?.userId;
    const id = req.params.id ? parseInt(req.params.id, 10) : NaN;
    if (!businessId || !userId || isNaN(id)) {
      res.status(400).json({ error: req.t('errors.validation.invalidUserBusinessOrMessageId') });
      return;
    }
    const result = await StaffMessageService.markMessageAsRead(id, userId, businessId);
    res.json({ success: result });
  } catch (error) {
    res.status(500).json({ error: req.t('errors.server.internal') });
  }
};

export const markStaffMessageAsAcknowledged = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const userId = req.user?.userId;
    const id = req.params.id ? parseInt(req.params.id, 10) : NaN;
    if (!businessId || !userId || isNaN(id)) {
      res.status(400).json({ error: req.t('errors.validation.invalidUserBusinessOrMessageId') });
      return;
    }
    const result = await StaffMessageService.markMessageAsAcknowledged(id, userId, businessId);
    res.json({ success: result });
  } catch (error) {
    res.status(500).json({ error: req.t('errors.server.internal') });
  }
};

export const getUnreadStaffMessageCount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const userId = req.user?.userId;
    const userRole = req.user?.role || '';
    if (!businessId || !userId || !userRole) {
      res.status(400).json({ error: req.t('errors.validation.missingUserOrBusinessInfo') });
      return;
    }
    const count = await StaffMessageService.getUnreadCount(userId, businessId, userRole);
    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ error: req.t('errors.server.internal') });
  }
};

export const getActiveStaffMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const userRole = req.user?.role || '';
    if (!businessId || !userRole) {
      res.status(400).json({ error: req.t('errors.validation.missingBusinessOrUserRole') });
      return;
    }
    const messages = await StaffMessageService.getActiveMessages(businessId, userRole);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: req.t('errors.server.internal') });
  }
}; 