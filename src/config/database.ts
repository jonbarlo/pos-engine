import { Sequelize } from 'sequelize';

console.log('🔍 [Database Config] Starting database configuration...');

const env = process.env.NODE_ENV || 'development';
console.log('🔍 [Database Config] Environment:', env);

// Simple configuration object
const dbConfig = {
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
  logging: env === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

console.log('🔍 [Database Config] Config:', {
  host: dbConfig.host,
  database: dbConfig.database,
  username: dbConfig.username,
  port: dbConfig.port
});

// Create Sequelize instance
console.log('🔍 [Database Config] Creating Sequelize instance...');
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    dialectOptions: dbConfig.dialectOptions,
    logging: dbConfig.logging,
    pool: dbConfig.pool
  }
);

console.log('🔍 [Database Config] Sequelize instance created successfully');
console.log('🔍 [Database Config] Sequelize type:', typeof sequelize);
console.log('🔍 [Database Config] Sequelize has authenticate method:', typeof sequelize.authenticate);

// Export the Sequelize instance
export { sequelize };
export default sequelize; 