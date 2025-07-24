import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { Sequelize } from 'sequelize';
import { getDatabaseConfig } from '../config/database';

const config = getDatabaseConfig();
const sequelize = new Sequelize(config);

async function runSeeder() {
  try {
    console.log('🌱 Starting comprehensive seeder...');
    await sequelize.authenticate();
    console.log('✅ Database connection established.');
    
    // Define all seeders in order
    const seeders = [
      '20250101000000-comprehensive-data',      
      '20250101000005-comprehensive-items',
      '20250101000004-comprehensive-recipes'
    ];
    
    for (const seederName of seeders) {
      try {
        console.log(`\n🔄 Running seeder: ${seederName}...`);
        
        // Import the seeder
        const seeder = await import(`../database/seeders/${seederName}`);
        
        // Run the up function to insert data
        await seeder.up(sequelize.getQueryInterface());
        console.log(`✅ ${seederName} completed successfully!`);
        
      } catch (error) {
        console.error(`❌ Error running seeder ${seederName}:`, error);
        // Continue with other seeders even if one fails
      }
    }
    
    console.log('\n🎉 All seeders completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Auto-run when called directly
runSeeder(); 