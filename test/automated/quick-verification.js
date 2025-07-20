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

async function quickVerification() {
  try {
    console.log('🔍 Quick Verification of Seeder Results...\n');
    
    const pool = await sql.connect(config);
    
    // Check businesses
    const businessesResult = await pool.request().query(`
      SELECT id, name, slug FROM businesses ORDER BY id
    `);
    
    console.log('📊 BUSINESSES:');
    businessesResult.recordset.forEach(business => {
      console.log(`  ${business.id}. ${business.name} (${business.slug})`);
    });
    
    // Check items count per business
    const itemsResult = await pool.request().query(`
      SELECT b.name, COUNT(i.id) as item_count 
      FROM businesses b 
      LEFT JOIN items i ON b.id = i.businessId 
      GROUP BY b.id, b.name 
      ORDER BY b.id
    `);
    
    console.log('\n📦 ITEMS PER BUSINESS:');
    itemsResult.recordset.forEach(row => {
      console.log(`  ${row.name}: ${row.item_count} items`);
    });
    
    // Check recipes count per business
    const recipesResult = await pool.request().query(`
      SELECT b.name, COUNT(r.id) as recipe_count 
      FROM businesses b 
      LEFT JOIN recipes r ON b.id = r.businessId 
      GROUP BY b.id, b.name 
      ORDER BY b.id
    `);
    
    console.log('\n👨‍🍳 RECIPES PER BUSINESS:');
    recipesResult.recordset.forEach(row => {
      console.log(`  ${row.name}: ${row.recipe_count} recipes`);
    });
    
    // Check menu items count per business
    const menuItemsResult = await pool.request().query(`
      SELECT b.name, COUNT(mi.id) as menu_item_count 
      FROM businesses b 
      LEFT JOIN menu_items mi ON b.id = mi.businessId 
      GROUP BY b.id, b.name 
      ORDER BY b.id
    `);
    
    console.log('\n🍽️ MENU ITEMS PER BUSINESS:');
    menuItemsResult.recordset.forEach(row => {
      console.log(`  ${row.name}: ${row.menu_item_count} menu items`);
    });
    
    // Check recipe suggestions count per business
    const suggestionsResult = await pool.request().query(`
      SELECT b.name, COUNT(rs.id) as suggestion_count 
      FROM businesses b 
      LEFT JOIN recipe_suggestions rs ON b.id = rs.businessId 
      GROUP BY b.id, b.name 
      ORDER BY b.id
    `);
    
    console.log('\n💡 RECIPE SUGGESTIONS PER BUSINESS:');
    suggestionsResult.recordset.forEach(row => {
      console.log(`  ${row.name}: ${row.suggestion_count} suggestions`);
    });
    
    // Show some sample premium items
    console.log('\n🌟 SAMPLE PREMIUM ITEMS:');
    const sampleItemsResult = await pool.request().query(`
      SELECT TOP 10 b.name as business, i.name, i.sku, i.price 
      FROM items i 
      JOIN businesses b ON i.businessId = b.id 
      WHERE i.sku LIKE '%PRE%' OR i.sku LIKE '%SU-%' OR i.sku LIKE '%CO-%'
      ORDER BY b.name, i.price DESC
    `);
    
    sampleItemsResult.recordset.forEach(item => {
      console.log(`  ${item.business}: ${item.name} (${item.sku}) - $${item.price}`);
    });
    
    await pool.close();
    console.log('\n✅ Verification complete!');
    
  } catch (error) {
    console.error('❌ Error during verification:', error.message);
  }
}

quickVerification(); 