const axios = require('axios');

const BASE_URL = 'http://localhost:3031';

async function testBulkLinkRecipes() {
  try {
    console.log('🧪 Testing /api/recipes/bulk-link-items...');
    
    // First get a token
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'marco@italiandelight.com',
      password: 'Password123',
      businessSlug: 'italian-delight'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Test the bulk linking endpoint
    console.log('🔗 Testing bulk recipe-item linking...');
    const response = await axios.post(`${BASE_URL}/api/recipes/bulk-link-items`, {}, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Bulk linking successful!');
    console.log('Status:', response.status);
    console.log('Response:', response.data);
    
    // Test with force parameter
    console.log('\n🔄 Testing with force=true...');
    const forceResponse = await axios.post(`${BASE_URL}/api/recipes/bulk-link-items?force=true`, {}, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Force linking successful!');
    console.log('Status:', forceResponse.status);
    console.log('Response:', forceResponse.data);
    
    // Check recipe_ingredients table
    console.log('\n📊 Checking recipe_ingredients table...');
    const checkResponse = await axios.get(`${BASE_URL}/api/recipes`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: {
        page: 1,
        limit: 5
      }
    });
    
    console.log('✅ Recipes retrieved!');
    console.log('Total recipes:', checkResponse.data.pagination?.total || 'N/A');
    console.log('Sample recipes:', checkResponse.data.data?.slice(0, 2).map(r => ({
      id: r.id,
      name: r.name,
      ingredients: r.ingredients
    })));
    
  } catch (error) {
    console.log('❌ Error:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
    console.log('Message:', error.message);
    console.log('Stack:', error.stack);
  }
}

testBulkLinkRecipes(); 