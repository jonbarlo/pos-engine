const axios = require('axios');

async function testBusinessRecipes() {
  console.log('🔍 Testing recipes for different business IDs...');
  
  // Try different business IDs to see what recipes exist
  for (let businessId = 1; businessId <= 6; businessId++) {
    try {
      // First, try to find a user for this business
      const users = [
        { email: 'marco@italiandelight.com', password: 'Password123', businessSlug: 'italian-delight' },
        { email: 'yuki@sushimaster.com', password: 'Password123', businessSlug: 'sushi-master' },
        { email: 'sarah@coffeecorner.com', password: 'Password123', businessSlug: 'coffee-corner' }
      ];
      
      let userFound = false;
      let token = null;
      
      for (const user of users) {
        try {
          const loginResponse = await axios.post('http://localhost:3031/api/auth/login', user);
          if (loginResponse.data.user.businessId === businessId) {
            token = loginResponse.data.token;
            userFound = true;
            console.log(`✅ Found user for business ${businessId}: ${user.email}`);
            break;
          }
        } catch (error) {
          // Continue to next user
        }
      }
      
      if (!userFound) {
        console.log(`❌ No user found for business ${businessId}`);
        continue;
      }
      
      // Try to get recipes for this business
      const recipesResponse = await axios.get('http://localhost:3031/api/recipes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const recipes = recipesResponse.data.data || [];
      console.log(`📝 Business ${businessId}: Found ${recipes.length} recipes`);
      
      if (recipes.length > 0) {
        recipes.forEach(recipe => {
          console.log(`   - ID: ${recipe.id}, Name: ${recipe.name}, Active: ${recipe.isActive}`);
        });
      }
      
      // Try to get items for this business
      const itemsResponse = await axios.get('http://localhost:3031/api/items', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const items = itemsResponse.data.data || [];
      console.log(`📦 Business ${businessId}: Found ${items.length} items`);
      
      if (items.length > 0) {
        items.slice(0, 3).forEach(item => {
          console.log(`   - ID: ${item.id}, Name: ${item.name}, SKU: ${item.sku}`);
        });
      }
      
    } catch (error) {
      console.log(`❌ Business ${businessId}: Error - ${error.response?.data?.error || error.message}`);
    }
    
    console.log('---');
  }
}

testBusinessRecipes().catch(console.error); 