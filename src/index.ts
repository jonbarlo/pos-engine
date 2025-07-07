import dotenv from 'dotenv';
import path from 'path';
import config from './services/configService';

// Load environment variables from .env file
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

import express from 'express';
import cors from 'cors';
import { Sequelize } from 'sequelize';
import { logger } from './utils/logger';
import userRouter from './routes/users';
import itemRouter from './routes/items';
import authRouter from './routes/auth';
import salesRouter from './routes/sales';
import businessRouter from './routes/businesses';
//import { UserController } from './controllers/userController';

// Import models initialization function
import { initializeModels } from './models';

logger(`Environment loaded: ${config.NODE_ENV}`);



const app = express();

app.use(cors());
app.use(express.json());

// Add a health check endpoint for IIS
app.get('/health', (req, res) => {
    logger('Health check endpoint called');
    res.status(200).json({ 
        status: 'OK', 
        message: 'API is running',
        environment: config.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Add a root endpoint
app.get('/', (req, res) => {
    logger('Root endpoint called');
    res.status(200).json({ 
        message: 'Node.js API is running',
        environment: config.NODE_ENV,
        version: process.env.VERSION || '1.0.0'
    });
});

// Add a simple test endpoint that doesn't require database
app.get('/test', (req, res) => {
    logger('Test endpoint called');
    res.status(200).json({ 
        message: 'Test endpoint works!',
        environment: config.NODE_ENV,
        timestamp: new Date().toISOString(),
        note: 'This endpoint works without database access'
    });
});

// Add a test registration endpoint that doesn't require database
app.post('/test-register', (req, res) => {
    logger('Test registration endpoint called');
    res.status(200).json({ 
        message: 'Test registration endpoint works!',
        body: req.body,
        environment: config.NODE_ENV,
        timestamp: new Date().toISOString(),
        note: 'This endpoint works without database access'
    });
});

// Register routes immediately (they will work with or without database)
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/items', itemRouter);
app.use('/api/sales', salesRouter);
app.use('/api/businesses', businessRouter);
logger('Routes registered successfully.');

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger(`Error occurred: ${err.message}`);
    logger(`Stack trace: ${err.stack}`);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: err.message,
        stack: err.stack,
        environment: config.NODE_ENV
    });
});

// Database connection and server startup
const startServer = async () => {
    try {
        // Create Sequelize instance
        const sequelize = new Sequelize(
          process.env.DB_NAME || 'pos_engine_dev',
          process.env.DB_USERNAME || 'sa',
          process.env.DB_PASSWORD || 'password',
          {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '1433'),
            dialect: 'mssql',
            dialectOptions: {
              options: {
                encrypt: false,
                trustServerCertificate: true,
                enableArithAbort: true,
                requestTimeout: 30000,
                connectionTimeout: 30000,
                useUTC: false,
                dateStrings: true,
              },
            },
            logging: config.NODE_ENV === 'development' ? console.log : false,
            pool: {
              max: 5,
              min: 0,
              acquire: 30000,
              idle: 10000
            }
          }
        );
        
        // Test database connection
        await sequelize.authenticate();
        logger('Database connection established successfully.');

        // Initialize models
        initializeModels(sequelize);
        logger('Models initialized successfully.');

        // Sync database (in development)
        if (config.NODE_ENV === 'development') {
            // Force sync to recreate tables with correct schema
            await sequelize.sync({ force: true });
            logger('Database synchronized with force sync.');
        }

        // Start server
        const port = process.env.PORT || 3031;
        logger(`Starting server on port ${port}...`);
        app.listen(port, () => {
            logger(`✅ ${process.env.APP_NAME || 'Node.js API'} is running on port ${port} - Version: ${process.env.VERSION || '1.0.0'} - Environment: ${process.env.NODE_ENV || 'development'}`);
            logger(`✅ Health check available at: http://localhost:${port}/health`);
        });
    } catch (error) {
        logger(`❌ Database connection failed: ${error}`);
        logger('Starting server without database connection...');
        
        // Start server even if database fails
        const port = process.env.PORT || 3031;
        logger(`Starting server on port ${port} (NO DATABASE)...`);
        app.listen(port, () => {
            logger(`✅ ${process.env.APP_NAME || 'Node.js API'} is running on port ${port} (NO DATABASE) - Version: ${process.env.VERSION || '1.0.0'} - Environment: ${process.env.NODE_ENV || 'development'}`);
            logger(`✅ Health check available at: http://localhost:${port}/health`);
        });
    }
};

logger('🚀 About to start server...');
startServer();
logger('🚀 startServer() called - check if it executed properly');

// Fallback: If PORT is set, ensure server starts (for Railway)
if (process.env.PORT) {
    const port = process.env.PORT;
    logger(`🔄 Fallback: Starting server on port ${port}...`);
    app.listen(port, () => {
        logger(`✅ FALLBACK: Server is running on port ${port}`);
        logger(`✅ Health check available at: http://localhost:${port}/health`);
    });
}

// Export the app for IIS
export default app;

// app.get('/items', (req: Request, res: Response) => {
//     res.json(items);
// });

// app.get('/items', (req: Request, res: Response) => {
//     logger('API endpoint /items was called...');
//     const { name } = req.query;
//     const filteredItems = name ? items.filter(item => item.name.includes(name as string)) : items;
//     res.json(filteredItems);
// });

// app.post('/items', (req: Request, res: Response) => {
//     const item: Item = req.body;
//     items.push(item);
//     res.status(201).json(item);
// });

// app.use((err: any, req: Request, res: Response, next: Function) => {

//     res.status(500).send('Something broke!');
// });