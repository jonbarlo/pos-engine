const { Sequelize } = require('sequelize');

// Test database connection
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './test-database.sqlite',
  logging: console.log
});

async function testDB() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Test sync
    await sequelize.sync({ force: true });
    console.log('✅ Database sync successful');
    
    // Check if tables were created
    const tables = await sequelize.showAllSchemas();
    console.log('Tables:', tables);
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await sequelize.close();
  }
}

testDB(); 