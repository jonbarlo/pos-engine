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

async function checkBusinessIds() {
  try {
    console.log('🔍 Checking Business IDs...\n');
    
    const pool = await sql.connect(config);
    
    // Check all businesses
    const businessesResult = await pool.request().query(`
      SELECT id, name, slug, createdAt FROM businesses ORDER BY id
    `);
    
    console.log('📊 ALL BUSINESSES:');
    businessesResult.recordset.forEach(business => {
      console.log(`  ID: ${business.id} | ${business.name} (${business.slug}) | Created: ${business.createdAt}`);
    });
    
    // Check for duplicate slugs
    const duplicatesResult = await pool.request().query(`
      SELECT slug, COUNT(*) as count, STRING_AGG(CAST(id AS VARCHAR), ', ') as ids
      FROM businesses 
      GROUP BY slug 
      HAVING COUNT(*) > 1
    `);
    
    if (duplicatesResult.recordset.length > 0) {
      console.log('\n⚠️ DUPLICATE BUSINESS SLUGS FOUND:');
      duplicatesResult.recordset.forEach(dup => {
        console.log(`  Slug: ${dup.slug} | Count: ${dup.count} | IDs: ${dup.ids}`);
      });
    } else {
      console.log('\n✅ No duplicate business slugs found');
    }
    
    // Check items per business
    const itemsResult = await pool.request().query(`
      SELECT b.id, b.name, b.slug, COUNT(i.id) as item_count 
      FROM businesses b 
      LEFT JOIN items i ON b.id = i.businessId 
      GROUP BY b.id, b.name, b.slug 
      ORDER BY b.id
    `);
    
    console.log('\n📦 ITEMS PER BUSINESS:');
    itemsResult.recordset.forEach(row => {
      console.log(`  ${row.id}. ${row.name} (${row.slug}): ${row.item_count} items`);
    });
    
    await pool.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkBusinessIds(); 