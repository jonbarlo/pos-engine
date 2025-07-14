import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import DatabaseService from './services/databaseService';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Load environment variables FIRST
dotenv.config();
logger(`Environment loaded: ${process.env.NODE_ENV || 'development'}`);

// Import models AFTER environment is loaded
import { initializeAllModels, setupAssociations } from './models';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'POS Engine API',
      version: '1.0.0',
      description: 'Node.js/TypeScript POS system API',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/index.ts'],
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @swagger
 * components:
 *   schemas:
 *     StaffMessage:
 *       type: object
 *       required:
 *         - businessId
 *         - senderId
 *         - senderName
 *         - messageType
 *         - title
 *         - content
 *         - recipientType
 *         - status
 *         - priority
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the message
 *         businessId:
 *           type: integer
 *           description: ID of the business this message belongs to
 *         senderId:
 *           type: integer
 *           description: ID of the user who sent the message
 *         senderName:
 *           type: string
 *           description: Name of the sender
 *         messageType:
 *           type: string
 *           enum: [announcement, inventory_alert, promotion, discount, urgent, general]
 *           description: Type of message
 *         title:
 *           type: string
 *           maxLength: 200
 *           description: Message title
 *         content:
 *           type: string
 *           description: Message content
 *         recipientType:
 *           type: string
 *           enum: [all, waitstaff, kitchen, managers, specific_users]
 *           description: Type of recipients
 *         recipientIds:
 *           type: array
 *           items:
 *             type: integer
 *           description: Array of specific user IDs (when recipientType is specific_users)
 *         status:
 *           type: string
 *           enum: [sent, read, acknowledged, expired]
 *           description: Current status of the message
 *         priority:
 *           type: string
 *           enum: [low, normal, high, urgent]
 *           description: Priority level of the message
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Expiration date of the message
 *         readBy:
 *           type: array
 *           items:
 *             type: integer
 *           description: Array of user IDs who have read the message
 *         acknowledgedBy:
 *           type: array
 *           items:
 *             type: integer
 *           description: Array of user IDs who have acknowledged the message
 *         metadata:
 *           type: object
 *           description: Additional metadata for the message
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     
 *     StaffMessageCreate:
 *       type: object
 *       required:
 *         - messageType
 *         - title
 *         - content
 *         - recipientType
 *       properties:
 *         messageType:
 *           type: string
 *           enum: [announcement, inventory_alert, promotion, discount, urgent, general]
 *         title:
 *           type: string
 *           maxLength: 200
 *         content:
 *           type: string
 *         recipientType:
 *           type: string
 *           enum: [all, waitstaff, kitchen, managers, specific_users]
 *         recipientIds:
 *           type: array
 *           items:
 *             type: integer
 *         priority:
 *           type: string
 *           enum: [low, normal, high, urgent]
 *           default: normal
 *         expiresAt:
 *           type: string
 *           format: date-time
 *         metadata:
 *           type: object
 *     
 *     StaffMessageUpdate:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           maxLength: 200
 *         content:
 *           type: string
 *         recipientType:
 *           type: string
 *           enum: [all, waitstaff, kitchen, managers, specific_users]
 *         recipientIds:
 *           type: array
 *           items:
 *             type: integer
 *         priority:
 *           type: string
 *           enum: [low, normal, high, urgent]
 *         expiresAt:
 *           type: string
 *           format: date-time
 *         metadata:
 *           type: object
 *     
 *     UnreadCount:
 *       type: object
 *       properties:
 *         unreadCount:
 *           type: integer
 *           description: Number of unread messages for the user
 *     
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether the operation was successful
 */

/**
 * @swagger
 * tags:
 *   name: Staff Messages
 *   description: Internal staff communication and messaging system
 */

/**
 * @swagger
 * /api/staff-messages:
 *   post:
 *     summary: Create a new staff message
 *     tags: [Staff Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StaffMessageCreate'
 *     responses:
 *       201:
 *         description: Message created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StaffMessage'
 *       400:
 *         description: Missing required fields or invalid data
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Internal server error
 *   
 *   get:
 *     summary: Get all staff messages for the business
 *     tags: [Staff Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: messageType
 *         schema:
 *           type: string
 *           enum: [announcement, inventory_alert, promotion, discount, urgent, general]
 *         description: Filter by message type
 *       - in: query
 *         name: recipientType
 *         schema:
 *           type: string
 *           enum: [all, waitstaff, kitchen, managers, specific_users]
 *         description: Filter by recipient type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [sent, read, acknowledged, expired]
 *         description: Filter by message status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, normal, high, urgent]
 *         description: Filter by priority
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of staff messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StaffMessage'
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/staff-messages/{id}:
 *   get:
 *     summary: Get a specific staff message by ID
 *     tags: [Staff Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Message ID
 *     responses:
 *       200:
 *         description: Staff message details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StaffMessage'
 *       400:
 *         description: Invalid message ID
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Message not found
 *       500:
 *         description: Internal server error
 *   
 *   put:
 *     summary: Update a staff message
 *     tags: [Staff Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Message ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StaffMessageUpdate'
 *     responses:
 *       200:
 *         description: Message updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StaffMessage'
 *       400:
 *         description: Invalid message ID or data
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Message not found
 *       500:
 *         description: Internal server error
 *   
 *   delete:
 *     summary: Delete a staff message
 *     tags: [Staff Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Message ID
 *     responses:
 *       204:
 *         description: Message deleted successfully
 *       400:
 *         description: Invalid message ID
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Message not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/staff-messages/user/me:
 *   get:
 *     summary: Get messages for the current user (role-based filtering)
 *     tags: [Staff Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of messages relevant to the current user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StaffMessage'
 *       400:
 *         description: Missing user information
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/staff-messages/{id}/read:
 *   post:
 *     summary: Mark a message as read by the current user
 *     tags: [Staff Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Message ID
 *     responses:
 *       200:
 *         description: Message marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid message ID or user information
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/staff-messages/{id}/acknowledge:
 *   post:
 *     summary: Mark a message as acknowledged by the current user
 *     tags: [Staff Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Message ID
 *     responses:
 *       200:
 *         description: Message marked as acknowledged
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid message ID or user information
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/staff-messages/user/me/unread-count:
 *   get:
 *     summary: Get unread message count for the current user
 *     tags: [Staff Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread message count
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnreadCount'
 *       400:
 *         description: Missing user information
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/staff-messages/active:
 *   get:
 *     summary: Get active (non-expired) messages for the current user's role
 *     tags: [Staff Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StaffMessage'
 *       400:
 *         description: Missing business or user role information
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-07-10T01:00:00.000Z
 *                 environment:
 *                   type: string
 *                   example: development
 *
 * /api/health:
 *   get:
 *     summary: API health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-07-10T01:00:00.000Z
 *                 environment:
 *                   type: string
 *                   example: development
 */
// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development' 
  });
});

// Initialize database and start server
async function startServer() {
  try {
    logger('🚀 About to start server...');
    
    // Initialize database service
    const dbService = DatabaseService.getInstance();
    
    // Connect to database
    await dbService.connect();
    
    // Initialize models and associations AFTER database connection
    initializeAllModels();
    
    // Sync models (only in development/test) - MUST happen before associations
    if (process.env.NODE_ENV !== 'production') {
      await dbService.sync(false); // Regular sync, do not wipe data
    }
    
    setupAssociations();
    
    // Import routes AFTER models are initialized
    const authRoutes = (await import('./routes/auth')).default;
    const businessRoutes = (await import('./routes/businesses')).default;
    const userRoutes = (await import('./routes/users')).default;
    const itemRoutes = (await import('./routes/items')).default;
    const saleRoutes = (await import('./routes/sales')).default;
    const orderRoutes = (await import('./routes/orders')).default;
    const customerRoutes = (await import('./routes/customers')).default;
    // const menuRoutes = (await import('./routes/menuRoutes')).default;
    const tableRoutes = (await import('./routes/tables')).default;
    const reservationRoutes = (await import('./routes/reservations')).default;
    const deliveryRoutes = (await import('./routes/deliveries')).default;
    const kitchenRoutes = (await import('./routes/kitchen')).default;
    const splitBillingRoutes = (await import('./routes/splitBilling')).default;
    const staffMessagesRoutes = (await import('./routes/staffMessages')).default;
    // API routes
    app.use('/api/auth', authRoutes);
    app.use('/api/businesses', businessRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/items', itemRoutes);
    app.use('/api/sales', saleRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/customers', customerRoutes);
    // app.use('/api/menu', menuRoutes);
    app.use('/api/tables', tableRoutes);
    app.use('/api/reservations', reservationRoutes);
    app.use('/api/deliveries', deliveryRoutes);
    app.use('/api/kitchen', kitchenRoutes);
    app.use('/api/sales', splitBillingRoutes);
    app.use('/api/staff-messages', staffMessagesRoutes);

    // Mobile app compatibility routes
    // Alias for /api/messages to redirect to staff-messages
    app.use('/api/messages', staffMessagesRoutes);
    
    // Promotions endpoint (filtered staff messages)
    app.get('/api/promotions', async (req, res) => {
      try {
        // Import the staff message controller and auth middleware dynamically
        const { getStaffMessages } = await import('./controllers/staffMessageController');
        const { authenticateToken } = await import('./middleware/auth');
        
        // Apply authentication middleware
        authenticateToken(req, res, async () => {
          try {
            // Add promotion filter to query
            req.query.messageType = 'promotion';
            req.query.isActive = 'true';
            
            // Call the staff messages controller
            await getStaffMessages(req, res);
          } catch (error) {
            logger(`Error in promotions endpoint: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
          }
        });
      } catch (error) {
        logger(`Error in promotions endpoint: ${error}`);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    logger('Routes registered successfully.');

    // Error handling middleware (must be last)
    app.use(notFoundHandler);
    app.use(errorHandler);

    // Start server
    const server = app.listen(PORT, () => {
      logger(`✅ MyNodeAPI is running on port ${PORT} - Version: 1.0.0 - Environment: ${process.env.NODE_ENV || 'development'}`);
      logger(`✅ Health check available at: http://localhost:${PORT}/health`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger('SIGTERM received, shutting down gracefully');
      server.close(async () => {
        await dbService.disconnect();
        process.exit(0);
      });
    });
    
  } catch (error) {
    logger(`❌ Failed to start server: ${error}`);
    process.exit(1);
  }
}

// Start the server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;