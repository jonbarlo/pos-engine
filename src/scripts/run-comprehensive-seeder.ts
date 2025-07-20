import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { Sequelize } from 'sequelize';
import { getDatabaseConfig } from '../config/database';

const config = getDatabaseConfig();
const sequelize = new Sequelize(config);

async function runComprehensiveSeeder() {
  try {
    console.log('🌱 Starting comprehensive seeder only...');
    await sequelize.authenticate();
    console.log('✅ Database connection established.');
    
    const seederName = '20250101000000-comprehensive-data';
    
    console.log(`\n🔄 Running seeder: ${seederName}...`);
    
    // Import the seeder
    const seeder = await import(`../database/seeders/${seederName}`);
    
    // Run the up function to insert data
    await seeder.up(sequelize.getQueryInterface());
    console.log(`✅ ${seederName} completed successfully!`);
    
    console.log('\n🎉 Comprehensive seeder completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Comprehensive seeder failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  runComprehensiveSeeder();
} 