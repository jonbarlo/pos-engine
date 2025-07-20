const { sequelize } = require('../../src/models/sequelize');

async function checkRecipesTable() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    const [results] = await sequelize.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'recipes'");
    console.log('Recipes table exists:', results.length > 0);
    
    if (results.length === 0) {
      console.log('❌ Recipes table does NOT exist!');
    } else {
      console.log('✅ Recipes table exists');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkRecipesTable(); 