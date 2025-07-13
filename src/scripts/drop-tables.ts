import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { getSequelize } from '../models/sequelize';
import { QueryTypes } from 'sequelize';

async function dropTables() {
  const sequelize = getSequelize();
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Drop all foreign key constraints first
    const constraints = await sequelize.query(
      `SELECT TABLE_SCHEMA, TABLE_NAME, CONSTRAINT_NAME
       FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
       WHERE CONSTRAINT_TYPE = 'FOREIGN KEY'`,
      { type: QueryTypes.SELECT }
    ) as { TABLE_SCHEMA: string; TABLE_NAME: string; CONSTRAINT_NAME: string }[];

    for (const { TABLE_SCHEMA, TABLE_NAME, CONSTRAINT_NAME } of constraints) {
      const sql = `ALTER TABLE [${TABLE_SCHEMA}].[${TABLE_NAME}] DROP CONSTRAINT [${CONSTRAINT_NAME}]`;
      try {
        await sequelize.query(sql);
        console.log(`🔓 Dropped constraint: ${CONSTRAINT_NAME} on ${TABLE_SCHEMA}.${TABLE_NAME}`);
      } catch (err) {
        console.error(`❌ Failed to drop constraint ${CONSTRAINT_NAME}:`, err);
      }
    }

    // Get all tables
    const tables = (await sequelize.query(
      `SELECT TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'`,
      { type: QueryTypes.SELECT }
    )) as { TABLE_SCHEMA: string; TABLE_NAME: string }[];

    // Drop all tables
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
      console.log('🎉 All tables dropped successfully!');
    } else {
      console.log('⚠️ Some tables could not be dropped:');
      for (const t of remaining) {
        console.log(`- ${t.TABLE_SCHEMA}.${t.TABLE_NAME}`);
      }
    }
  } catch (error) {
    console.error('❌ Error dropping tables:', error);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  dropTables();
} 