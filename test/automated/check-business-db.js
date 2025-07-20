const { BusinessModel } = require('../../src/models');

async function checkBusinessDB() {
  try {
    console.log('🔍 Checking business in database...');
    
    const business = await BusinessModel.findByPk(1);
    
    if (business) {
      console.log('✅ Business found:');
      console.log(`   ID: ${business.id}`);
      console.log(`   Name: ${business.name}`);
      console.log(`   Type: ${business.type}`);
      console.log(`   Is Active: ${business.isActive}`);
      console.log(`   Created: ${business.createdAt}`);
      console.log(`   Updated: ${business.updatedAt}`);
    } else {
      console.log('❌ Business not found');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkBusinessDB(); 