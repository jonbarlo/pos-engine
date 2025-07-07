import { Sequelize } from 'sequelize';
import { logger } from '../utils/logger';
import { config } from '../config';

// Note: dotenv is already loaded in index.ts before this module is imported
// No need to load it again here

const env = config.env;

const dbConfigs = {
  development: {
    username: process.env.DB_USERNAME || 'sa',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'pos_engine_dev',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '1433'),
    dialect: 'mssql' as const,
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
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  test: {
    username: process.env.DB_USERNAME || 'sa',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME_TEST || 'pos_engine_test',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '1433'),
    dialect: 'mssql' as const,
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
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '1433'),
    dialect: 'mssql' as const,
    dialectOptions: {
      options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
        requestTimeout: 30000,
        connectionTimeout: 30000,
        // Add these for better MSSQL compatibility
        useUTC: false,
        dateStrings: true,
      },
    },
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    // Add retry configuration for production
    retry: {
      max: 3,
      timeout: 10000
    }
  }
};

const dbConfig = dbConfigs[env as keyof typeof dbConfigs];

logger(`Environment Loaded: ${config.env}`);
logger(`Database Dialect: ${dbConfig.dialect}`);
logger(`Database Host: ${dbConfig.host}`);
logger(`Database Port: ${dbConfig.port}`);

// Debug: Log all environment variables
logger('=== ALL ENVIRONMENT VARIABLES ===');
Object.keys(process.env).forEach(key => {
  if (key.includes('DB_') || key.includes('NODE_') || key.includes('APP_') || key.includes('JWT_')) {
    logger(`${key}: ${process.env[key]}`);
  }
});
logger('=== END ENVIRONMENT VARIABLES ===');

// Validate required configuration for production
if (env === 'production') {
  console.log('[Database Config] Validating production configuration...');
  console.log(`[Database Config] DB_HOST: ${dbConfig.host}`);
  console.log(`[Database Config] DB_NAME: ${dbConfig.database}`);
  console.log(`[Database Config] DB_USERNAME: ${dbConfig.username}`);
  console.log(`[Database Config] DB_PASSWORD: ${dbConfig.password ? '[SET]' : '[MISSING]'}`);
  console.log(`[Database Config] DB_PORT: ${dbConfig.port}`);
  
  if (!dbConfig.host || !dbConfig.database || !dbConfig.username || !dbConfig.password) {
    const errorMsg = `⚠️ Database configuration incomplete for production. Some environment variables are missing:
    
Environment Variables Status:
- NODE_ENV: ${process.env.NODE_ENV}
- DB_HOST: ${dbConfig.host || 'undefined'}
- DB_NAME: ${dbConfig.database || 'undefined'}
- DB_USERNAME: ${dbConfig.username || 'undefined'}
- DB_PASSWORD: ${dbConfig.password ? '[SET]' : '[MISSING]'}
- DB_PORT: ${dbConfig.port}

⚠️ The app will start but database features will be disabled.
To enable database features, set the missing environment variables.

Current working directory: ${process.cwd()}`;

    console.warn('[Database Config] Configuration Warning:', errorMsg);
    logger(errorMsg);
  } else {
    console.log('[Database Config] ✅ All database environment variables are set correctly');
  }
}

export const sequelize = new Sequelize(
  dbConfig.database!,
  dbConfig.username!,
  dbConfig.password!,
  {
    host: dbConfig.host!,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    dialectOptions: dbConfig.dialectOptions,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    // Add retry configuration for production
    ...(env === 'production' && { retry: (dbConfig as any).retry })
  }
);

export default sequelize; 