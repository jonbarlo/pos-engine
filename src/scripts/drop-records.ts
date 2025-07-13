import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { getSequelize } from '../models/sequelize';
import { QueryTypes } from 'sequelize';

async function dropRecords() {
  const sequelize = getSequelize();
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Get all tables
    const tables = (await sequelize.query(
      `SELECT TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'`,
      { type: QueryTypes.SELECT }
    )) as { TABLE_SCHEMA: string; TABLE_NAME: string }[];

    // Disable foreign key constraints temporarily
    await sequelize.query('EXEC sp_MSforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT all"');
    console.log('🔓 Disabled foreign key constraints');

    // Delete all records from each table
    for (const { TABLE_SCHEMA, TABLE_NAME } of tables) {
      const fullName = `[${TABLE_SCHEMA}].[${TABLE_NAME}]`;
      try {
        const result = await sequelize.query(`DELETE FROM ${fullName}`);
        console.log(`🗑️ Deleted records from: ${fullName}`);
      } catch (err) {
        console.error(`❌ Failed to delete records from ${fullName}:`, err);
      }
    }

    // Re-enable foreign key constraints
    await sequelize.query('EXEC sp_MSforeachtable "ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all"');
    console.log('🔒 Re-enabled foreign key constraints');

    console.log('🎉 All records deleted successfully! Tables structure preserved.');
  } catch (error) {
    console.error('❌ Error deleting records:', error);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  dropRecords();
} 