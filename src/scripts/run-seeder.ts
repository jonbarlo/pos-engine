import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { Sequelize } from 'sequelize';
import { getDatabaseConfig } from '../config/database';

const config = getDatabaseConfig();
const sequelize = new Sequelize(config);

async function runSeeder() {
  try {
    console.log('🌱 Starting seeder...');
    await sequelize.authenticate();
    console.log('✅ Database connection established.');
    
    // Import the seeder
    const seeder = await import('../database/seeders/20250101000000-comprehensive-data');
    
    // First run down function to clean up existing data
    console.log('🧹 Cleaning up existing data...');
    await seeder.down(sequelize.getQueryInterface());
    console.log('✅ Data cleanup completed.');
    
    // Then run up function to insert new data
    console.log('🌱 Inserting new data...');
    await seeder.up(sequelize.getQueryInterface());
    console.log('✅ Seeder completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  runSeeder();
} 