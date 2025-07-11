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
    const menuRoutes = (await import('./routes/menuRoutes')).default;
    const tableRoutes = (await import('./routes/tables')).default;
    const reservationRoutes = (await import('./routes/reservations')).default;
    const deliveryRoutes = (await import('./routes/deliveries')).default;
    const kitchenRoutes = (await import('./routes/kitchen')).default;
    const splitBillingRoutes = (await import('./routes/splitBilling')).default;

    // API routes
    app.use('/api/auth', authRoutes);
    app.use('/api/businesses', businessRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/items', itemRoutes);
    app.use('/api/sales', saleRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/customers', customerRoutes);
    app.use('/api/menu', menuRoutes);
    app.use('/api/tables', tableRoutes);
    app.use('/api/reservations', reservationRoutes);
    app.use('/api/deliveries', deliveryRoutes);
    app.use('/api/kitchen', kitchenRoutes);
    app.use('/api/sales', splitBillingRoutes);

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

// Start the server
startServer();

export default app;