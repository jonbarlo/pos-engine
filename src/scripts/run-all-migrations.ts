import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

console.log('🚀 Running all pending migrations...');

// Inline Sequelize initialization
const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USERNAME!,
  process.env.DB_PASSWORD!,
  {
    host: process.env.DB_HOST!,
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
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);



async function runMigrations() {
  try {
    // Test database connection
    console.log('🔄 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Create SequelizeMeta table if it doesn't exist
    await sequelize.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='SequelizeMeta' AND xtype='U')
      CREATE TABLE SequelizeMeta (
        name VARCHAR(255) NOT NULL PRIMARY KEY
      )
    `);
    console.log('✅ SequelizeMeta table ready.');

    // Get list of migration files
    const migrationsDir = path.join(__dirname, '../database/migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.ts'))
      .sort();

    // Get executed migrations
    const [executedResults] = await sequelize.query(
      "SELECT name FROM SequelizeMeta WHERE name IS NOT NULL"
    );
    const executedMigrations = (executedResults as any[]).map((r: any) => r.name);

    // Find pending migrations
    const pendingMigrations = migrationFiles.filter(file => 
      !executedMigrations.includes(file.replace('.ts', ''))
    );

    console.log(`📋 Found ${pendingMigrations.length} pending migrations:`);
    pendingMigrations.forEach(migration => console.log(`  - ${migration}`));

    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations to run.');
      return;
    }

    // Run each pending migration
    for (const migrationFile of pendingMigrations) {
      const migrationPath = path.join(migrationsDir, migrationFile);
      const migration = await import(migrationPath);
      
      console.log(`🔄 Running migration: ${migrationFile}`);
      await migration.up(sequelize.getQueryInterface());
      
      // Log the migration as executed
      await sequelize.query(
        "INSERT INTO SequelizeMeta (name) VALUES (?)",
        { replacements: [migrationFile.replace('.ts', '')] }
      );
      
      console.log(`✅ Completed migration: ${migrationFile}`);
    }

    console.log('✅ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runMigrations(); 