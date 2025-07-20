const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create direct database connection
const sequelize = new Sequelize(
  process.env.DB_NAME || 'pos_engine',
  process.env.DB_USER || 'sa',
  process.env.DB_PASSWORD || 'YourStrong@Passw0rd',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 1433,
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: false,
        trustServerCertificate: true
      }
    },
    logging: false
  }
);

async function checkRecipesData() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Check recipes table
    const [recipes] = await sequelize.query("SELECT COUNT(*) as count FROM recipes");
    console.log('📋 Total recipes in database:', recipes[0].count);
    
    if (recipes[0].count > 0) {
      const [recipeList] = await sequelize.query(`
        SELECT id, name, businessId, difficulty, isActive 
        FROM recipes 
        ORDER BY businessId, name
      `);
      console.log('📝 Recipe list:');
      recipeList.forEach(recipe => {
        console.log(`  - ID: ${recipe.id}, Name: ${recipe.name}, Business: ${recipe.businessId}, Difficulty: ${recipe.difficulty}, Active: ${recipe.isActive}`);
      });
    }
    
    // Check recipe suggestions table
    const [suggestions] = await sequelize.query("SELECT COUNT(*) as count FROM recipe_suggestions");
    console.log('💡 Total recipe suggestions in database:', suggestions[0].count);
    
    if (suggestions[0].count > 0) {
      const [suggestionList] = await sequelize.query(`
        SELECT rs.id, rs.itemId, rs.recipeId, rs.confidence, rs.suggestedPrice, rs.aiGenerated,
               r.name as recipeName, i.name as itemName
        FROM recipe_suggestions rs
        LEFT JOIN recipes r ON rs.recipeId = r.id
        LEFT JOIN items i ON rs.itemId = i.id
        ORDER BY rs.businessId, rs.confidence DESC
      `);
      console.log('💡 Recipe suggestions list:');
      suggestionList.forEach(suggestion => {
        console.log(`  - ID: ${suggestion.id}, Item: ${suggestion.itemName} (${suggestion.itemId}), Recipe: ${suggestion.recipeName} (${suggestion.recipeId}), Confidence: ${suggestion.confidence}, Price: $${suggestion.suggestedPrice}, AI: ${suggestion.aiGenerated}`);
      });
    }
    
    // Check items table for context
    const [items] = await sequelize.query("SELECT COUNT(*) as count FROM items");
    console.log('📦 Total items in database:', items[0].count);
    
    if (items[0].count > 0) {
      const [itemList] = await sequelize.query(`
        SELECT id, name, sku, businessId 
        FROM items 
        ORDER BY businessId, name
        LIMIT 10
      `);
      console.log('📦 Sample items:');
      itemList.forEach(item => {
        console.log(`  - ID: ${item.id}, Name: ${item.name}, SKU: ${item.sku}, Business: ${item.businessId}`);
      });
    }
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

checkRecipesData(); 