const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3031/api';

// Test credentials
const TEST_CREDENTIALS = {
  email: 'marco@italiandelight.com',
  password: 'Password123'
};

async function testRecipesEndpoint() {
  console.log('🔐 Authenticating...');
  
  try {
    const authResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_CREDENTIALS.email,
      password: TEST_CREDENTIALS.password,
      businessSlug: 'italian-delight'
    });

    if (!authResponse.data.token) {
      console.log('❌ Authentication failed:', authResponse.data);
      return;
    }

    const token = authResponse.data.token;
    console.log('✅ Authentication successful');

    // Test recipes endpoint
    console.log('\n🧪 Testing Recipes Endpoint...');
    try {
      const response = await axios.get(`${BASE_URL}/recipes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Recipes response:', response.data);
      if (response.data.recipes && response.data.recipes.length > 0) {
        console.log('   Number of recipes:', response.data.recipes.length);
        console.log('   Sample recipe fields:', Object.keys(response.data.recipes[0]));
        console.log('   First recipe:', response.data.recipes[0]);
      } else {
        console.log('   No recipes found');
      }
    } catch (error) {
      console.log('❌ Recipes error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.log('❌ Authentication error:', error.response?.data || error.message);
  }
}

testRecipesEndpoint().catch(console.error); 