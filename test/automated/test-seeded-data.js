const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'pos_engine',
  user: process.env.DB_USERNAME || 'sa',
  password: process.env.DB_PASSWORD || 'YourStrong@Passw0rd',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function testSeededData() {
  try {
    console.log('🔍 Testing Seeded Data...');
    
    const pool = await sql.connect(config);
    
    // Test businesses
    const businesses = await pool.request().query(`
      SELECT id, name, slug, type FROM businesses 
      WHERE slug IN ('italian-delight', 'sushi-master', 'coffee-corner')
      ORDER BY id
    `);
    
    console.log('\n🏢 Businesses:');
    businesses.recordset.forEach(biz => {
      console.log(`  ${biz.id}: ${biz.name} (${biz.slug}) - ${biz.type}`);
    });
    
    // Test items count per business
    const itemsCount = await pool.request().query(`
      SELECT businessId, COUNT(*) as itemCount 
      FROM items 
      WHERE businessId IN (${businesses.recordset.map(b => b.id).join(',')})
      GROUP BY businessId
    `);
    
    console.log('\n📦 Items per Business:');
    itemsCount.recordset.forEach(item => {
      const biz = businesses.recordset.find(b => b.id === item.businessId);
      console.log(`  ${biz.name}: ${item.itemCount} items`);
    });
    
    // Test recipes count per business
    const recipesCount = await pool.request().query(`
      SELECT businessId, COUNT(*) as recipeCount 
      FROM recipes 
      WHERE businessId IN (${businesses.recordset.map(b => b.id).join(',')})
      GROUP BY businessId
    `);
    
    console.log('\n👨‍🍳 Recipes per Business:');
    recipesCount.recordset.forEach(recipe => {
      const biz = businesses.recordset.find(b => b.id === recipe.businessId);
      console.log(`  ${biz.name}: ${recipe.recipeCount} recipes`);
    });
    
    // Test menu items count per business
    const menuItemsCount = await pool.request().query(`
      SELECT businessId, COUNT(*) as menuItemCount 
      FROM menu_items 
      WHERE businessId IN (${businesses.recordset.map(b => b.id).join(',')})
      GROUP BY businessId
    `);
    
    console.log('\n🍽️ Menu Items per Business:');
    menuItemsCount.recordset.forEach(menuItem => {
      const biz = businesses.recordset.find(b => b.id === menuItem.businessId);
      console.log(`  ${biz.name}: ${menuItem.menuItemCount} menu items`);
    });
    
    // Test recipe suggestions count per business
    const suggestionsCount = await pool.request().query(`
      SELECT businessId, COUNT(*) as suggestionCount 
      FROM recipe_suggestions 
      WHERE businessId IN (${businesses.recordset.map(b => b.id).join(',')})
      GROUP BY businessId
    `);
    
    console.log('\n🤖 Recipe Suggestions per Business:');
    suggestionsCount.recordset.forEach(suggestion => {
      const biz = businesses.recordset.find(b => b.id === suggestion.businessId);
      console.log(`  ${biz.name}: ${suggestion.suggestionCount} suggestions`);
    });
    
    // Show some sample recipes
    console.log('\n🍕 Sample Recipes:');
    const sampleRecipes = await pool.request().query(`
      SELECT TOP 5 r.name, r.description, b.name as businessName
      FROM recipes r
      JOIN businesses b ON r.businessId = b.id
      WHERE r.businessId IN (${businesses.recordset.map(b => b.id).join(',')})
      ORDER BY r.businessId, r.name
    `);
    
    sampleRecipes.recordset.forEach(recipe => {
      console.log(`  ${recipe.businessName}: ${recipe.name}`);
    });
    
    await pool.close();
    console.log('\n✅ Seeded data verification complete!');
    
  } catch (error) {
    console.error('❌ Error testing seeded data:', error.message);
  }
}

testSeededData(); 