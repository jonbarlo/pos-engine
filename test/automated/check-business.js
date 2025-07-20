const { BusinessModel } = require('../../src/models/index');
const { sequelize } = require('../../src/models/sequelize');

async function checkBusiness() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    const businesses = await BusinessModel.findAll();
    console.log(`\n📊 Found ${businesses.length} businesses:`);
    
    businesses.forEach(business => {
      console.log(`  ID: ${business.id}, Name: "${business.name}", Type: "${business.type}"`);
    });
    
    // Check specific business ID 1 (which is likely what's being used)
    const business1 = await BusinessModel.findByPk(1);
    if (business1) {
      console.log(`\n🎯 Business ID 1: "${business1.name}" (Type: "${business1.type}")`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkBusiness(); 