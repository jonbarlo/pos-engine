const axios = require('axios');

async function checkSeederData() {
  console.log('🔍 Checking seeder data...');
  
  try {
    // First, let's check what businesses exist
    console.log('\n🏢 Checking businesses...');
    
    // Try to login with different users to see what business IDs they have
    const users = [
      { email: 'marco@italiandelight.com', password: 'Password123', businessSlug: 'italian-delight' },
      { email: 'yuki@sushimaster.com', password: 'Password123', businessSlug: 'sushi-master' },
      { email: 'sarah@coffeecorner.com', password: 'Password123', businessSlug: 'coffee-corner' }
    ];
    
    for (const user of users) {
      try {
        const loginResponse = await axios.post('http://localhost:3031/api/auth/login', user);
        const businessId = loginResponse.data.user.businessId;
        console.log(`✅ ${user.email}: Business ID = ${businessId}`);
        
        // Check recipes for this business
        const recipesResponse = await axios.get('http://localhost:3031/api/recipes?isActive=false', {
          headers: { 'Authorization': `Bearer ${loginResponse.data.token}` }
        });
        
        const recipes = recipesResponse.data.data || [];
        console.log(`   📝 Recipes: ${recipes.length} total`);
        
        if (recipes.length > 0) {
          recipes.forEach(recipe => {
            console.log(`      - ID: ${recipe.id}, Name: ${recipe.name}, Active: ${recipe.isActive}`);
          });
        }
        
        // Check items for this business
        const itemsResponse = await axios.get('http://localhost:3031/api/items', {
          headers: { 'Authorization': `Bearer ${loginResponse.data.token}` }
        });
        
        const items = itemsResponse.data.data || [];
        console.log(`   📦 Items: ${items.length} total`);
        
        if (items.length > 0) {
          items.slice(0, 3).forEach(item => {
            console.log(`      - ID: ${item.id}, Name: ${item.name}, SKU: ${item.sku}`);
          });
        }
        
        // Check recipe suggestions for this business
        console.log(`   💡 Recipe suggestions:`);
        for (let itemId = 1; itemId <= 3; itemId++) {
          try {
            const suggestionsResponse = await axios.get(`http://localhost:3031/api/recipes/suggestions/${itemId}`, {
              headers: { 'Authorization': `Bearer ${loginResponse.data.token}` }
            });
            
            const suggestions = suggestionsResponse.data.data || [];
            if (suggestions.length > 0) {
              console.log(`      Item ${itemId}: ${suggestions.length} suggestions`);
              suggestions.forEach(suggestion => {
                console.log(`        - Recipe ID: ${suggestion.recipeId}, Confidence: ${suggestion.confidence}`);
              });
            }
          } catch (error) {
            // No suggestions for this item
          }
        }
        
      } catch (error) {
        console.log(`❌ ${user.email}: Login failed - ${error.response?.data?.error || error.message}`);
      }
      
      console.log('---');
    }
    
    // Check if there are any recipes in the database that don't belong to any user
    console.log('\n🔍 Checking for orphaned recipes...');
    
    // Try to access recipes with different business IDs directly
    for (let businessId = 1; businessId <= 10; businessId++) {
      try {
        // Try to find a user for this business ID
        let userFound = false;
        let token = null;
        
        for (const user of users) {
          try {
            const loginResponse = await axios.post('http://localhost:3031/api/auth/login', user);
            if (loginResponse.data.user.businessId === businessId) {
              token = loginResponse.data.token;
              userFound = true;
              break;
            }
          } catch (error) {
            // Continue to next user
          }
        }
        
        if (userFound && token) {
          const recipesResponse = await axios.get(`http://localhost:3031/api/recipes?isActive=false`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          const recipes = recipesResponse.data.data || [];
          if (recipes.length > 0) {
            console.log(`Business ${businessId}: Found ${recipes.length} recipes`);
            recipes.forEach(recipe => {
              console.log(`  - ID: ${recipe.id}, Name: ${recipe.name}, Active: ${recipe.isActive}`);
            });
          }
        }
        
      } catch (error) {
        // Business ID doesn't exist or no access
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkSeederData(); 