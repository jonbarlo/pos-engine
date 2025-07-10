import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const sequelize = new Sequelize({
  dialect: 'mssql',
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT || '1433'),
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  dialectOptions: {
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
  },
  logging: false,
});

async function fixBusinessType() {
  try {
    console.log('🔧 Fixing business type column...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // First, try to add the column directly
    try {
      await sequelize.query(`
        ALTER TABLE businesses ADD type VARCHAR(255) DEFAULT 'generic'
      `);
      console.log('✅ Type column added successfully!');
    } catch (error: any) {
      if (error.message.includes('already exists') || error.message.includes('duplicate column')) {
        console.log('ℹ️ Type column already exists');
      } else {
        throw error;
      }
    }
    
    // Update the demo restaurant to have type 'restaurant'
    try {
      await sequelize.query(`
        UPDATE businesses SET type = 'restaurant' WHERE slug = 'demo-restaurant'
      `);
      console.log('✅ Updated demo restaurant type');
    } catch (error: any) {
      console.log('⚠️ Could not update demo restaurant type:', error.message);
    }
    
    // Verify the fix
    const result = await sequelize.query(`
      SELECT id, name, slug, type FROM businesses WHERE slug = 'demo-restaurant'
    `);
    
    console.log('📋 Business data:', result[0]);
    
  } catch (error) {
    console.error('❌ Error fixing business type:', error);
  } finally {
    await sequelize.close();
  }
}

fixBusinessType(); 