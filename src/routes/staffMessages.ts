import { Router } from 'express';
import * as staffMessageController from '../controllers/staffMessageController';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.use(authenticateToken);

router.post('/', asyncHandler(staffMessageController.createStaffMessage));
router.get('/', asyncHandler(staffMessageController.getStaffMessages));
router.get('/active', asyncHandler(staffMessageController.getActiveStaffMessages));
router.get('/user/me', asyncHandler(staffMessageController.getStaffMessagesForUser));
router.get('/user/me/unread-count', asyncHandler(staffMessageController.getUnreadStaffMessageCount));
router.get('/:id', asyncHandler(staffMessageController.getStaffMessageById));
router.put('/:id', asyncHandler(staffMessageController.updateStaffMessage));
router.delete('/:id', asyncHandler(staffMessageController.deleteStaffMessage));
router.post('/:id/read', asyncHandler(staffMessageController.markStaffMessageAsRead));
router.post('/:id/acknowledge', asyncHandler(staffMessageController.markStaffMessageAsAcknowledged));

export default router; 