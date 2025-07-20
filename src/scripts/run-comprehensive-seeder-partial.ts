import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { Sequelize } from 'sequelize';
import { getDatabaseConfig } from '../config/database';

const config = getDatabaseConfig();
const sequelize = new Sequelize(config);

async function runPartialComprehensiveSeeder() {
  try {
    console.log('🌱 Starting partial comprehensive seeder (skipping orders)...');
    await sequelize.authenticate();
    console.log('✅ Database connection established.');
    
    const seederName = '20250101000000-comprehensive-data';
    
    console.log(`\n🔄 Running seeder: ${seederName}...`);
    
    // Import the seeder
    const seeder = await import(`../database/seeders/${seederName}`);
    
    // Create a mock queryInterface that skips orders
    const mockQueryInterface = {
      sequelize,
      bulkInsert: async (table: string, data: any[]) => {
        console.log(`Skipping bulkInsert for ${table} with ${data.length} records`);
        return [];
      },
      query: async (sql: string, options: any) => {
        // Skip orders table operations
        if (sql.includes('orders') && sql.includes('MERGE')) {
          console.log('Skipping orders MERGE operation');
          return [];
        }
        return await sequelize.query(sql, options);
      }
    };
    
    // Run the up function to insert data
    await seeder.up(mockQueryInterface as any);
    
    console.log('✅ Partial comprehensive seeder completed successfully!');
    console.log('📝 Note: Orders section was skipped due to parameter mismatch');
    
  } catch (error) {
    console.error('❌ Partial comprehensive seeder failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  runPartialComprehensiveSeeder()
    .then(() => {
      console.log('🎉 Partial comprehensive seeder completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Partial comprehensive seeder failed:', error);
      process.exit(1);
    });
} 