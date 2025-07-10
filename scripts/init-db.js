const { Sequelize } = require('sequelize');

// Initialize database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './test-database.sqlite',
  logging: console.log
});

async function initDB() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Import models
    const { initializeAllModels } = require('./dist/models/index');
    initializeAllModels();
    console.log('✅ Models initialized');
    
    // Sync database
    await sequelize.sync({ force: true });
    console.log('✅ Database synced');
    
    // Check tables
    const tables = await sequelize.showAllSchemas();
    console.log('Tables created:', tables);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

initDB(); 