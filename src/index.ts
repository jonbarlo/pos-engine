import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import DatabaseService from './services/databaseService';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { 
  corsOptions, 
  helmetConfig, 
  apiLimiter, 
  requestLogger, 
  sanitizeRequest
} from './middleware/security';
import { initializeI18n } from './config/i18n';
import { i18nMiddleware, detectLanguage } from './middleware/i18n';
import cors from 'cors';

// Load environment variables FIRST - only if we're not in Railway production
// Railway injects environment variables directly, no need for dotenv
const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID;
const isProduction = process.env.NODE_ENV === 'production';

logger(`Starting app... Railway: ${isRailway ? 'Yes' : 'No'}, Production: ${isProduction ? 'Yes' : 'No'}, NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);

if (!isRailway && !isProduction) {
  logger('Loading .env file for local development...');
  dotenv.config();
} else {
  logger('Using Railway environment variables (no .env file)');
}

logger(`Environment loaded: ${process.env.NODE_ENV || 'development'}`);

// Debug: Log all database environment variables (without sensitive data)
logger(`DB Config Debug:
  - DB_HOST: ${process.env.DB_HOST || 'NOT SET'}
  - DB_PORT: ${process.env.DB_PORT || 'NOT SET'}  
  - DB_NAME: ${process.env.DB_NAME || 'NOT SET'}
  - DB_USERNAME: ${process.env.DB_USERNAME || 'NOT SET'}
  - DB_PASSWORD: ${process.env.DB_PASSWORD ? 'SET' : 'NOT SET'}
  - DATABASE_URL: ${process.env.DATABASE_URL ? 'SET' : 'NOT SET'}`);

// Import models AFTER environment is loaded
import { initializeAllModels, setupAssociations } from './models';

const app = express();
const PORT = process.env.PORT || 3000;

// Security and logging middleware
app.use(helmetConfig);
app.use(cors(corsOptions));
app.use(requestLogger);
app.use(sanitizeRequest);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting - apply to all routes
app.use('/api', apiLimiter);

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
 *     
 *     Item:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the item
 *         businessId:
 *           type: integer
 *           description: ID of the business this item belongs to
 *         name:
 *           type: string
 *           description: Item name
 *         description:
 *           type: string
 *           description: Item description
 *         price:
 *           type: number
 *           description: Selling price
 *         cost:
 *           type: number
 *           description: Cost price
 *         stock:
 *           type: integer
 *           description: Current stock level
 *         category:
 *           type: string
 *           description: Item category
 *         imageUrl:
 *           type: string
 *           description: URL to item image
 *         isActive:
 *           type: boolean
 *           description: Whether the item is active
 *         sku:
 *           type: string
 *           description: Stock keeping unit
 *         barcode:
 *           type: string
 *           description: Barcode
 *         unit:
 *           type: string
 *           description: Unit of measurement
 *         minStock:
 *           type: integer
 *           description: Minimum stock level
 *         maxStock:
 *           type: integer
 *           description: Maximum stock level
 *         preparationTime:
 *           type: integer
 *           description: Preparation time in minutes
 *         isVegetarian:
 *           type: boolean
 *           description: Whether the item is vegetarian
 *         isVegan:
 *           type: boolean
 *           description: Whether the item is vegan
 *         isGlutenFree:
 *           type: boolean
 *           description: Whether the item is gluten-free
 *         isSpicy:
 *           type: boolean
 *           description: Whether the item is spicy
 *         allergens:
 *           type: string
 *           description: Allergen information
 *         nutritionInfo:
 *           type: string
 *           description: Nutrition information
 *         expirationDate:
 *           type: string
 *           format: date-time
 *           description: Expiration date for perishable items
 *         manufacturingDate:
 *           type: string
 *           format: date-time
 *           description: Manufacturing date
 *         shelfLifeDays:
 *           type: integer
 *           description: Shelf life in days
 *         lastSoldDate:
 *           type: string
 *           format: date-time
 *           description: Date when item was last sold
 *         salesVelocity:
 *           type: number
 *           description: Average daily sales rate
 *         daysSinceLastSale:
 *           type: integer
 *           description: Number of days since last sale
 *         isPerishable:
 *           type: boolean
 *           description: Whether item has expiration date
 *         isUnderperforming:
 *           type: boolean
 *           description: Whether item is considered underperforming
 *         isExpiringSoon:
 *           type: boolean
 *           description: Whether item is expiring within 7 days
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     
 *     Recipe:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the recipe
 *         businessId:
 *           type: integer
 *           description: ID of the business this recipe belongs to
 *         name:
 *           type: string
 *           description: Recipe name
 *         description:
 *           type: string
 *           description: Recipe description
 *         ingredients:
 *           type: string
 *           description: List of ingredients
 *         instructions:
 *           type: string
 *           description: Cooking instructions
 *         prepTime:
 *           type: integer
 *           description: Preparation time in minutes
 *         cookTime:
 *           type: integer
 *           description: Cooking time in minutes
 *         servings:
 *           type: integer
 *           description: Number of servings
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard]
 *           description: Difficulty level
 *         cuisine:
 *           type: string
 *           description: Cuisine type
 *         category:
 *           type: string
 *           description: Recipe category
 *         nutritionInfo:
 *           type: string
 *           description: Nutrition information
 *         imageUrl:
 *           type: string
 *           description: URL to recipe image
 *         isActive:
 *           type: boolean
 *           description: Whether the recipe is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
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
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Table:
 *       type: object
 *       required:
 *         - businessId
 *         - tableNumber
 *         - capacity
 *         - status
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated table ID
 *         businessId:
 *           type: integer
 *           description: Business ID (must be restaurant type)
 *         tableNumber:
 *           type: string
 *           description: Table number/name
 *         capacity:
 *           type: integer
 *           description: Maximum number of guests
 *         partySize:
 *           type: integer
 *           nullable: true
 *           description: Current number of guests seated at the table
 *         status:
 *           type: string
 *           enum: [available, occupied, reserved, cleaning, out_of_service]
 *           description: Current table status
 *         section:
 *           type: string
 *           description: Table section (e.g., "patio", "window", "bar")
 *         currentOrderId:
 *           type: integer
 *           nullable: true
 *           description: Current order ID if table is occupied
 *         serverId:
 *           type: integer
 *           nullable: true
 *           description: Assigned waiter/server ID
 *         isActive:
 *           type: boolean
 *           description: Whether table is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     
 *     TableSeatRequest:
 *       type: object
 *       required:
 *         - customerCount
 *       properties:
 *         customerCount:
 *           type: integer
 *           minimum: 1
 *           description: Number of customers being seated
 *         serverId:
 *           type: integer
 *           description: ID of the waiter/server assigned
 *         notes:
 *           type: string
 *           maxLength: 500
 *           description: Additional notes about the seating
 *     
 *     TableSeatResponse:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/Table'
 *         message:
 *           type: string
 *           description: Success message with seating details
 *     
 *     Currency:
 *       type: object
 *       required:
 *         - code
 *         - name
 *         - symbol
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the currency
 *         code:
 *           type: string
 *           pattern: '^[A-Z]{3}$'
 *           description: Currency code (ISO 4217 format)
 *           example: "CRC"
 *         name:
 *           type: string
 *           description: Currency name
 *           example: "Costa Rican Colón"
 *         symbol:
 *           type: string
 *           description: Currency symbol
 *           example: "₡"
 *         decimalPlaces:
 *           type: integer
 *           default: 2
 *           description: Number of decimal places
 *           example: 2
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether the currency is active
 *           example: true
 *         isDefault:
 *           type: boolean
 *           default: false
 *           description: Whether this is the default currency
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     
 *     ExchangeRate:
 *       type: object
 *       required:
 *         - fromCurrencyId
 *         - toCurrencyId
 *         - rate
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the exchange rate
 *         fromCurrencyId:
 *           type: integer
 *           description: Source currency ID
 *           example: 2
 *         toCurrencyId:
 *           type: integer
 *           description: Target currency ID
 *           example: 1
 *         rate:
 *           type: number
 *           minimum: 0
 *           description: Exchange rate
 *           example: 0.001923
 *         effectiveDate:
 *           type: string
 *           format: date-time
 *           description: Effective date for the exchange rate
 *           example: "2025-01-01T00:00:00.000Z"
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether the exchange rate is active
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     
 *     CurrencyConversion:
 *       type: object
 *       required:
 *         - fromCurrencyId
 *         - toCurrencyId
 *         - amount
 *         - convertedAmount
 *         - rate
 *       properties:
 *         fromCurrencyId:
 *           type: integer
 *           description: Source currency ID
 *           example: 2
 *         toCurrencyId:
 *           type: integer
 *           description: Target currency ID
 *           example: 1
 *         amount:
 *           type: number
 *           minimum: 0
 *           description: Original amount
 *           example: 25.99
 *         convertedAmount:
 *           type: number
 *           minimum: 0
 *           description: Converted amount
 *           example: 13.50
 *         rate:
 *           type: number
 *           minimum: 0
 *           description: Exchange rate used
 *           example: 0.001923
 *         effectiveDate:
 *           type: string
 *           format: date-time
 *           description: Effective date for the exchange rate
 *           example: "2025-01-01T00:00:00.000Z"
 *     
 *     Error:
 *       type: object
 *       required:
 *         - success
 *         - message
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           description: Error message
 *           example: "Invalid currency ID"
 *         error:
 *           type: string
 *           description: Detailed error information
 *           example: "Currency not found"
 */

/**
 * @swagger
 * tags:
 *   name: Tables
 *   description: Restaurant table management operations
 */

/**
 * @swagger
 * /api/tables/{id}/seat:
 *   post:
 *     summary: Seat customers at a table
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Table ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               partySize:
 *                 type: integer
 *                 description: Number of customers being seated
 *               serverId:
 *                 type: integer
 *                 description: ID of the waiter/server assigned
 *               notes:
 *                 type: string
 *                 description: Additional notes about the seating
 *     responses:
 *       200:
 *         description: Table successfully seated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Table'
 *                 message:
 *                   type: string
 *                   example: Successfully seated party of 4 at table A1
 *       400:
 *         description: Invalid table ID, party size, or capacity exceeded
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Business is not restaurant type
 *       404:
 *         description: Table not found
 *       409:
 *         description: Table not available for seating
 *       500:
 *         description: Server error
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
    
    // Initialize i18n for multi-language support
    await initializeI18n();
    
    // NO SYNC - Use migrations instead of automatic table creation
    // await dbService.sync(false); // REMOVED - This conflicts with migrations
    
    setupAssociations();
    
    // Import routes AFTER models are initialized
    const authRoutes = (await import('./routes/auth')).default;
    const businessRoutes = (await import('./routes/businesses')).default;
    const publicBusinessRoutes = (await import('./routes/publicBusinesses')).default;
    const userRoutes = (await import('./routes/users')).default;
    const itemRoutes = (await import('./routes/items')).default;
    const saleRoutes = (await import('./routes/sales')).default;
    const orderRoutes = (await import('./routes/orders')).default;
    const customerRoutes = (await import('./routes/customers')).default;
    const menuRoutes = (await import('./routes/menuRoutes')).default;
    const tableRoutes = (await import('./routes/tables')).default;
    const reservationRoutes = (await import('./routes/reservations')).default;
    const deliveryRoutes = (await import('./routes/deliveries')).default;
    const kitchenRoutes = (await import('./routes/kitchen')).default;
    const splitBillingRoutes = (await import('./routes/splitBilling')).default;
    const staffMessagesRoutes = (await import('./routes/staffMessages')).default;
    const floorPlanRoutes = (await import('./routes/floorPlans')).default;
    const recipeRoutes = (await import('./routes/recipes')).default;
    const promotionRoutes = (await import('./routes/promotions')).default;
    const mobileNotificationRoutes = (await import('./routes/mobileNotifications')).default;
    const smartRecipeSuggestionRoutes = (await import('./routes/smartRecipeSuggestions')).default;
    const recipeCookingRoutes = (await import('./routes/recipeCooking')).default;
    const aiRecipeGenerationRoutes = (await import('./routes/aiRecipeGeneration')).default;
    const menuPdfRoutes = (await import('./routes/menuPdf')).default;
    const customMenuTemplateRoutes = (await import('./routes/customMenuTemplates')).default;
    const currencyRoutes = (await import('./routes/currencies')).default;
    // i18n middleware for language detection and translation
    app.use(detectLanguage);
    app.use(i18nMiddleware);
    
    // Import language routes
    const languageRoutes = (await import('./routes/language')).default;
    
    // API routes
    app.use('/api/auth', authRoutes);
    app.use('/api/businesses', businessRoutes);
    app.use('/api/public/businesses', publicBusinessRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/items', itemRoutes);
    app.use('/api/sales', saleRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/customers', customerRoutes);
    app.use('/api/menu', menuRoutes);
    app.use('/api/menu/pdf', menuPdfRoutes);
    app.use('/api/menu/templates', customMenuTemplateRoutes);
    app.use('/api/tables', tableRoutes);
    app.use('/api/reservations', reservationRoutes);
    app.use('/api/deliveries', deliveryRoutes);
    app.use('/api/kitchen', kitchenRoutes);
    app.use('/api/sales', splitBillingRoutes);
    app.use('/api/staff-messages', staffMessagesRoutes);
    app.use('/api/floor-plans', floorPlanRoutes);
    app.use('/api/recipes', recipeRoutes);
    app.use('/api/promotions', promotionRoutes);
    app.use('/api/mobile-notifications', mobileNotificationRoutes);
    app.use('/api/smart', smartRecipeSuggestionRoutes);
    app.use('/api/smart', recipeCookingRoutes);
    app.use('/api/ai', aiRecipeGenerationRoutes);
    app.use('/api/currencies', currencyRoutes);
    app.use('/api/language', languageRoutes);

    // Mobile app compatibility routes
    // Alias for /api/messages to redirect to staff-messages
    app.use('/api/messages', staffMessagesRoutes);
    
    // Simple test endpoint for floor plan data (for debugging)
    app.get('/api/test/floor-plans', async (req, res) => {
      try {
        const { FloorPlanModel } = await import('./models');
        const { TablePositionModel } = await import('./models');
        const { TableModel } = await import('./models');
        
        // Get all floor plans
        const floorPlans = await FloorPlanModel.findAll({
          where: { isActive: true },
          order: [['businessId', 'ASC'], ['name', 'ASC']]
        });

        // Get all table positions
        const tablePositions = await TablePositionModel.findAll({
          include: [
            {
              model: TableModel,
              as: 'table',
              attributes: ['id', 'tableNumber', 'capacity', 'status', 'section']
            }
          ],
          order: [['floorPlanId', 'ASC']]
        });

        res.json({
          success: true,
          data: {
            floorPlans: floorPlans.map(fp => ({
              id: fp.id,
              businessId: fp.businessId,
              name: fp.name,
              width: fp.width,
              height: fp.height
            })),
            tablePositions: tablePositions.map((tp: any) => ({
              id: tp.id,
              floorPlanId: tp.floorPlanId,
              tableId: tp.tableId,
              x: tp.x,
              y: tp.y,
              table: tp.table
            }))
          }
        });
      } catch (error) {
        console.error('Error in test endpoint:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    });
    
    // Alias for /api/menu-items to redirect to menu/items
    app.get('/api/menu-items', async (req, res) => {
      try {
        // Import the menu items route handler dynamically
        const { authenticateToken } = await import('./middleware/auth');
        const { isRestaurantBusiness } = await import('./utils/businessTypeCheck');
        const { MenuItemModel } = await import('./models');
        
        // Apply authentication middleware
        authenticateToken(req, res, async () => {
          try {
            const businessId = parseInt(req.query.businessId as string);
            if (!businessId) {
              res.status(400).json({ success: false, message: 'Business ID is required' });
              return;
            }

            // Check if business is restaurant type
            if (!(await isRestaurantBusiness(businessId))) {
              res.status(403).json({ success: false, message: 'Menu management is only available for restaurant businesses' });
              return;
            }

            const whereClause: any = { businessId };
            
            // Apply filters
            if (req.query.categoryId) {
              whereClause.categoryId = parseInt(req.query.categoryId as string);
            }
            if (req.query.isAvailable !== undefined) {
              whereClause.isAvailable = req.query.isAvailable === 'true';
            }
            if (req.query.available !== undefined) {
              whereClause.isAvailable = req.query.available === 'true';
            }
            if (req.query.vegetarian !== undefined) {
              whereClause.isVegetarian = req.query.vegetarian === 'true';
            }
            if (req.query.vegan !== undefined) {
              whereClause.isVegan = req.query.vegan === 'true';
            }
            if (req.query.glutenFree !== undefined) {
              whereClause.isGlutenFree = req.query.glutenFree === 'true';
            }
            if (req.query.spicy !== undefined) {
              whereClause.isSpicy = req.query.spicy === 'true';
            }

            const items = await MenuItemModel.findAll({
              where: whereClause,
              order: [['categoryId', 'ASC'], ['name', 'ASC']]
            });

            res.json({ success: true, data: items });
          } catch (error) {
            console.error('Error fetching menu items:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
          }
        });
      } catch (error) {
        console.error('Error in menu-items alias:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
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