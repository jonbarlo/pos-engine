const sql = require('mssql');

const config = {
  server: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'pos_admin_db',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'YourStrong@Passw0rd',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function verifySeederResults() {
  try {
    console.log('🔍 Verifying seeder results...\n');
    
    const pool = await sql.connect(config);
    
    // Get all businesses
    const businessesResult = await pool.request().query(`
      SELECT id, name, slug FROM businesses ORDER BY id
    `);
    
    console.log('📊 BUSINESSES:');
    businessesResult.recordset.forEach(business => {
      console.log(`  ${business.id}. ${business.name} (${business.slug})`);
    });
    console.log(`  Total: ${businessesResult.recordset.length} businesses\n`);
    
    // Check data for each business
    for (const business of businessesResult.recordset) {
      console.log(`🏪 ${business.name.toUpperCase()} (ID: ${business.id}):`);
      
      // Count items
      const itemsResult = await pool.request()
        .input('businessId', sql.Int, business.id)
        .query('SELECT COUNT(*) as count FROM items WHERE businessId = @businessId');
      const itemCount = itemsResult.recordset[0].count;
      
      // Count recipes
      const recipesResult = await pool.request()
        .input('businessId', sql.Int, business.id)
        .query('SELECT COUNT(*) as count FROM recipes WHERE businessId = @businessId');
      const recipeCount = recipesResult.recordset[0].count;
      
      // Count menu items
      const menuItemsResult = await pool.request()
        .input('businessId', sql.Int, business.id)
        .query('SELECT COUNT(*) as count FROM menu_items WHERE businessId = @businessId');
      const menuItemCount = menuItemsResult.recordset[0].count;
      
      // Count recipe suggestions
      const suggestionsResult = await pool.request()
        .input('businessId', sql.Int, business.id)
        .query('SELECT COUNT(*) as count FROM recipe_suggestions WHERE businessId = @businessId');
      const suggestionCount = suggestionsResult.recordset[0].count;
      
      // Count menu categories
      const categoriesResult = await pool.request()
        .input('businessId', sql.Int, business.id)
        .query('SELECT COUNT(*) as count FROM menu_categories WHERE businessId = @businessId');
      const categoryCount = categoriesResult.recordset[0].count;
      
      console.log(`  📦 Items: ${itemCount}`);
      console.log(`  📖 Recipes: ${recipeCount}`);
      console.log(`  🍽️ Menu Items: ${menuItemCount}`);
      console.log(`  🔗 Recipe Suggestions: ${suggestionCount}`);
      console.log(`  📂 Menu Categories: ${categoryCount}`);
      
      // Show sample premium items
      const premiumItemsResult = await pool.request()
        .input('businessId', sql.Int, business.id)
        .query(`
          SELECT TOP 5 name, sku, price, category 
          FROM items 
          WHERE businessId = @businessId AND sku LIKE '%-PRE-%'
          ORDER BY price DESC
        `);
      
      if (premiumItemsResult.recordset.length > 0) {
        console.log(`  🌟 Sample Premium Items:`);
        premiumItemsResult.recordset.forEach(item => {
          console.log(`    • ${item.name} (${item.sku}) - $${item.price} [${item.category}]`);
        });
      }
      
      // Show sample recipes
      const premiumRecipesResult = await pool.request()
        .input('businessId', sql.Int, business.id)
        .query(`
          SELECT TOP 3 name, difficulty, prepTime, cookTime
          FROM recipes 
          WHERE businessId = @businessId AND name LIKE 'Premium%'
          ORDER BY name
        `);
      
      if (premiumRecipesResult.recordset.length > 0) {
        console.log(`  👨‍🍳 Sample Premium Recipes:`);
        premiumRecipesResult.recordset.forEach(recipe => {
          console.log(`    • ${recipe.name} (${recipe.difficulty}) - ${recipe.prepTime}min prep, ${recipe.cookTime}min cook`);
        });
      }
      
      console.log('');
    }
    
    // Overall statistics
    console.log('📈 OVERALL STATISTICS:');
    
    const totalItemsResult = await pool.request().query('SELECT COUNT(*) as count FROM items');
    const totalRecipesResult = await pool.request().query('SELECT COUNT(*) as count FROM recipes');
    const totalMenuItemsResult = await pool.request().query('SELECT COUNT(*) as count FROM menu_items');
    const totalSuggestionsResult = await pool.request().query('SELECT COUNT(*) as count FROM recipe_suggestions');
    
    console.log(`  📦 Total Items: ${totalItemsResult.recordset[0].count}`);
    console.log(`  📖 Total Recipes: ${totalRecipesResult.recordset[0].count}`);
    console.log(`  🍽️ Total Menu Items: ${totalMenuItemsResult.recordset[0].count}`);
    console.log(`  🔗 Total Recipe Suggestions: ${totalSuggestionsResult.recordset[0].count}`);
    
    // Premium items statistics
    const premiumItemsResult = await pool.request().query(`
      SELECT COUNT(*) as count 
      FROM items 
      WHERE sku LIKE '%-PRE-%'
    `);
    
    const premiumRecipesResult = await pool.request().query(`
      SELECT COUNT(*) as count 
      FROM recipes 
      WHERE name LIKE 'Premium%'
    `);
    
    console.log(`  🌟 Premium Items: ${premiumItemsResult.recordset[0].count}`);
    console.log(`  👨‍🍳 Premium Recipes: ${premiumRecipesResult.recordset[0].count}`);
    
    // Check for any errors or missing data
    console.log('\n🔍 DATA QUALITY CHECKS:');
    
    // Check for items without menu items
    const itemsWithoutMenuItemsResult = await pool.request().query(`
      SELECT COUNT(*) as count 
      FROM items i 
      LEFT JOIN menu_items mi ON i.id = mi.itemId 
      WHERE mi.itemId IS NULL AND i.sku LIKE '%-PRE-%'
    `);
    
    if (itemsWithoutMenuItemsResult.recordset[0].count > 0) {
      console.log(`  ⚠️ Items without menu items: ${itemsWithoutMenuItemsResult.recordset[0].count}`);
    } else {
      console.log(`  ✅ All premium items have menu items`);
    }
    
    // Check for recipes without suggestions
    const recipesWithoutSuggestionsResult = await pool.request().query(`
      SELECT COUNT(*) as count 
      FROM recipes r 
      LEFT JOIN recipe_suggestions rs ON r.id = rs.recipeId 
      WHERE rs.recipeId IS NULL AND r.name LIKE 'Premium%'
    `);
    
    if (recipesWithoutSuggestionsResult.recordset[0].count > 0) {
      console.log(`  ⚠️ Premium recipes without suggestions: ${recipesWithoutSuggestionsResult.recordset[0].count}`);
    } else {
      console.log(`  ✅ All premium recipes have suggestions`);
    }
    
    console.log('\n🎉 Verification complete!');
    
  } catch (err) {
    console.error('❌ Error during verification:', err);
  } finally {
    await sql.close();
  }
}

verifySeederResults(); 