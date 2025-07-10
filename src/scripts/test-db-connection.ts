import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load test environment
process.env.NODE_ENV = 'test';
dotenv.config({ path: '.env.test' });

const testConnection = async () => {
  try {
    console.log('🔍 Testing database connection...');
    console.log('Environment:', process.env.NODE_ENV);
    
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    await sequelize.authenticate();
    console.log('✅ SQLite connection successful!');
    
    // Test basic operations
    await sequelize.query('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)');
    await sequelize.query('INSERT INTO test (name) VALUES (?)', { replacements: ['test'] });
    const [results] = await sequelize.query('SELECT * FROM test');
    console.log('✅ Basic SQLite operations successful:', results);
    
    await sequelize.close();
    console.log('✅ Connection closed successfully');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

testConnection(); 