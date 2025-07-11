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

    // Get all tables in all schemas
    const tables = (await sequelize.query(
      `SELECT TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'`,
      { type: QueryTypes.SELECT }
    )) as { TABLE_SCHEMA: string; TABLE_NAME: string }[];

    // Drop all tables, handling foreign key constraints
    for (const { TABLE_SCHEMA, TABLE_NAME } of tables) {
      const fullName = `[${TABLE_SCHEMA}].[${TABLE_NAME}]`;
      try {
        await sequelize.query(`DROP TABLE ${fullName}`);
        console.log(`🗑️ Dropped table: ${fullName}`);
      } catch (err) {
        console.error(`❌ Failed to drop table ${fullName}:`, err);
      }
    }

    // Double-check: print remaining tables
    const remaining = (await sequelize.query(
      `SELECT TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'`,
      { type: QueryTypes.SELECT }
    )) as { TABLE_SCHEMA: string; TABLE_NAME: string }[];
    if (remaining.length === 0) {
      console.log('🎉 Database cleanup complete! No tables remain.');
    } else {
      console.log('⚠️ Some tables could not be dropped:');
      for (const t of remaining) {
        console.log(`- ${t.TABLE_SCHEMA}.${t.TABLE_NAME}`);
      }
    }
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  cleanupDatabase();
} 