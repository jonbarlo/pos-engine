const { Sequelize } = require('sequelize');
require('dotenv').config();

const config = {
  dialect: 'mssql',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dialectOptions: {
    options: {
      encrypt: false,
      trustServerCertificate: true
    }
  }
};

const sequelize = new Sequelize(config);

async function checkWorldClassEnhancements() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Check Italian Delight enhancements
    console.log('\n🍕 Checking Italian Delight World-Class Enhancements...');
    const [italianItems] = await sequelize.query(`
      SELECT COUNT(*) as count FROM items 
      WHERE businessId = (SELECT id FROM businesses WHERE slug = 'italian-delight')
      AND sku LIKE 'IT-%'
    `);
    console.log(`✅ Italian Delight items: ${italianItems[0].count}`);
    
    const [italianRecipes] = await sequelize.query(`
      SELECT COUNT(*) as count FROM recipes 
      WHERE businessId = (SELECT id FROM businesses WHERE slug = 'italian-delight')
    `);
    console.log(`✅ Italian Delight recipes: ${italianRecipes[0].count}`);
    
    // Check Sushi Master enhancements
    console.log('\n🍣 Checking Sushi Master World-Class Enhancements...');
    const [sushiItems] = await sequelize.query(`
      SELECT COUNT(*) as count FROM items 
      WHERE businessId = (SELECT id FROM businesses WHERE slug = 'sushi-master')
      AND sku LIKE 'SU-%'
    `);
    console.log(`✅ Sushi Master items: ${sushiItems[0].count}`);
    
    const [sushiRecipes] = await sequelize.query(`
      SELECT COUNT(*) as count FROM recipes 
      WHERE businessId = (SELECT id FROM businesses WHERE slug = 'sushi-master')
    `);
    console.log(`✅ Sushi Master recipes: ${sushiRecipes[0].count}`);
    
    // Check Coffee Corner enhancements
    console.log('\n☕ Checking Coffee Corner World-Class Enhancements...');
    const [coffeeItems] = await sequelize.query(`
      SELECT COUNT(*) as count FROM items 
      WHERE businessId = (SELECT id FROM businesses WHERE slug = 'coffee-corner')
      AND sku LIKE 'CO-%'
    `);
    console.log(`✅ Coffee Corner items: ${coffeeItems[0].count}`);
    
    const [coffeeRecipes] = await sequelize.query(`
      SELECT COUNT(*) as count FROM recipes 
      WHERE businessId = (SELECT id FROM businesses WHERE slug = 'coffee-corner')
    `);
    console.log(`✅ Coffee Corner recipes: ${coffeeRecipes[0].count}`);
    
    // Show some sample premium items
    console.log('\n🌟 Sample Premium Items Added:');
    const [premiumItems] = await sequelize.query(`
      SELECT name, sku, price FROM items 
      WHERE sku IN (
        'IT-PIZ-TRU-001', 'IT-MAI-WAG-001', 'IT-DES-SOU-001',
        'SU-NIG-OTO-001', 'SU-NIG-UNI-001', 'SU-ROL-DRA-001',
        'CO-ETH-YIR-001', 'CO-MAT-PRE-001', 'CO-BOW-ACA-001'
      )
      ORDER BY sku
    `);
    
    premiumItems.forEach(item => {
      console.log(`  ${item.sku}: ${item.name} - $${item.price}`);
    });
    
    console.log('\n🎉 World-Class Enhancement Verification Complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

checkWorldClassEnhancements(); 