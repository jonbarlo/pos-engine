import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import { initializeAllModels } from '../models/index';
import { logger } from '../utils/logger';

// Load environment variables
dotenv.config();

async function runMigration() {
  const sequelize = new Sequelize({
    dialect: 'mssql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '1433'),
    username: process.env.DB_USERNAME || 'sa',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'pos_engine_dev',
    dialectOptions: {
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    },
    logging: false,
  });

  try {
    await sequelize.authenticate();
    logger('Database connection established successfully.');

    // Initialize models
    initializeAllModels();

    // Add the type column to businesses table
    await sequelize.query(`
      IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'businesses' AND COLUMN_NAME = 'type'
      )
      BEGIN
        ALTER TABLE businesses ADD type NVARCHAR(20) NOT NULL DEFAULT 'generic';
        
        -- Create the enum constraint
        ALTER TABLE businesses ADD CONSTRAINT CK_businesses_type 
        CHECK (type IN ('generic', 'restaurant'));
      END
    `);

    logger('Migration completed successfully: Added type column to businesses table');

    // Update existing businesses to have 'generic' type if they don't have it
    await sequelize.query(`
      UPDATE businesses 
      SET type = 'generic' 
      WHERE type IS NULL OR type = ''
    `);

    logger('Updated existing businesses with default type');

  } catch (error) {
    logger(`Migration failed: ${error}`);
    throw error;
  } finally {
    await sequelize.close();
  }
}

runMigration()
  .then(() => {
    logger('Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger(`Migration script failed: ${error}`);
    process.exit(1);
  }); 