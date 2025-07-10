import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { getSequelize } from '../models/sequelize';
import { QueryTypes } from 'sequelize';

async function cleanupDatabase() {
  const sequelize = getSequelize();
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Get all user tables (exclude system tables)
    const tables = (await sequelize.query(
      `SELECT TABLE_NAME as tableName FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = 'dbo'`,
      { type: QueryTypes.SELECT }
    )) as { tableName: string }[];

    // Drop all tables (MS SQL Server will handle foreign key constraints automatically)
    for (const { tableName } of tables) {
      try {
        // Use CASCADE to automatically handle foreign key dependencies
        await sequelize.query(`DROP TABLE [${tableName}] CASCADE`);
        console.log(`🗑️ Dropped table: ${tableName}`);
      } catch (err) {
        // If CASCADE fails, try without it
        try {
          await sequelize.query(`DROP TABLE [${tableName}]`);
          console.log(`🗑️ Dropped table: ${tableName}`);
        } catch (err2) {
          console.error(`❌ Failed to drop table ${tableName}:`, err2);
        }
      }
    }

    console.log('🎉 Database cleanup complete!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  cleanupDatabase();
} 