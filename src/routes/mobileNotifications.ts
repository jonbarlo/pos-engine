import { Router } from 'express';
import { MobileNotificationController } from '../controllers/mobileNotificationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all mobile notification routes
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     MobileNotification:
 *       type: object
 *       required:
 *         - businessId
 *         - type
 *         - title
 *         - message
 *         - targetAudience
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated notification ID
 *         businessId:
 *           type: integer
 *           description: ID of the business this notification belongs to
 *         type:
 *           type: string
 *           enum: [promotion, recipe, general]
 *           description: Type of notification
 *         title:
 *           type: string
 *           maxLength: 255
 *           description: Notification title
 *         message:
 *           type: string
 *           description: Notification message content
 *         targetAudience:
 *           type: string
 *           enum: [waitstaff, loyalty, all]
 *           description: Target audience for the notification
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether the notification is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     
 *     MobileNotificationCreate:
 *       type: object
 *       required:
 *         - type
 *         - title
 *         - message
 *         - targetAudience
 *       properties:
 *         type:
 *           type: string
 *           enum: [promotion, recipe, general]
 *         title:
 *           type: string
 *           maxLength: 255
 *         message:
 *           type: string
 *         targetAudience:
 *           type: string
 *           enum: [waitstaff, loyalty, all]
 *     
 *     MobileNotificationUpdate:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [promotion, recipe, general]
 *         title:
 *           type: string
 *           maxLength: 255
 *         message:
 *           type: string
 *         targetAudience:
 *           type: string
 *           enum: [waitstaff, loyalty, all]
 *         isActive:
 *           type: boolean
 */

/**
 * @swagger
 * /api/mobile-notifications:
 *   get:
 *     summary: Get all mobile notifications
 *     tags: [Mobile Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [promotion, recipe, general]
 *         description: Filter by notification type
 *       - in: query
 *         name: targetAudience
 *         schema:
 *           type: string
 *           enum: [waitstaff, loyalty, all]
 *         description: Filter by target audience
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of mobile notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MobileNotification'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', MobileNotificationController.getAllNotifications);

/**
 * @swagger
 * /api/mobile-notifications/search:
 *   get:
 *     summary: Search mobile notifications
 *     tags: [Mobile Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query for title or message
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [promotion, recipe, general]
 *         description: Filter by notification type
 *       - in: query
 *         name: targetAudience
 *         schema:
 *           type: string
 *           enum: [waitstaff, loyalty, all]
 *         description: Filter by target audience
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MobileNotification'
 *                 total:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/search', MobileNotificationController.searchNotifications);

/**
 * @swagger
 * /api/mobile-notifications/stats:
 *   get:
 *     summary: Get mobile notification statistics
 *     tags: [Mobile Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mobile notification statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalNotifications:
 *                   type: integer
 *                 activeNotifications:
 *                   type: integer
 *                 inactiveNotifications:
 *                   type: integer
 *                 notificationsByType:
 *                   type: object
 *                   properties:
 *                     promotion:
 *                       type: integer
 *                     recipe:
 *                       type: integer
 *                     general:
 *                       type: integer
 *                 notificationsByAudience:
 *                   type: object
 *                   properties:
 *                     waitstaff:
 *                       type: integer
 *                     loyalty:
 *                       type: integer
 *                     all:
 *                       type: integer
 *                 recentNotifications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MobileNotification'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/stats', MobileNotificationController.getNotificationStats);

/**
 * @swagger
 * /api/mobile-notifications/{id}:
 *   get:
 *     summary: Get a mobile notification by ID
 *     tags: [Mobile Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Mobile notification ID
 *     responses:
 *       200:
 *         description: Mobile notification details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MobileNotification'
 *       404:
 *         description: Mobile notification not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/:id', MobileNotificationController.getNotificationById);

/**
 * @swagger
 * /api/mobile-notifications:
 *   post:
 *     summary: Create a new mobile notification
 *     tags: [Mobile Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MobileNotificationCreate'
 *     responses:
 *       201:
 *         description: Mobile notification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MobileNotification'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', MobileNotificationController.createNotification);

/**
 * @swagger
 * /api/mobile-notifications/{id}:
 *   put:
 *     summary: Update a mobile notification
 *     tags: [Mobile Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Mobile notification ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MobileNotificationUpdate'
 *     responses:
 *       200:
 *         description: Mobile notification updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MobileNotification'
 *       404:
 *         description: Mobile notification not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put('/:id', MobileNotificationController.updateNotification);

/**
 * @swagger
 * /api/mobile-notifications/{id}:
 *   delete:
 *     summary: Delete a mobile notification (soft delete)
 *     tags: [Mobile Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Mobile notification ID
 *     responses:
 *       200:
 *         description: Mobile notification deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Mobile notification not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', MobileNotificationController.deleteNotification);

export default router; 