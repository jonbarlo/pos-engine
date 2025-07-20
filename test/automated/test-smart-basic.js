const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3031/api';

async function testSmartEndpoints() {
  console.log('🔐 Authenticating...');
  
  try {
    // Try different credentials
    const authResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'marco@italiandelight.com',
      password: 'Password123',
      businessSlug: 'italian-delight'
    });

    if (!authResponse.data.token) {
      console.log('❌ Authentication failed:', authResponse.data);
      return;
    }

    const token = authResponse.data.token;
    console.log('✅ Authentication successful');

    // Test inventory summary
    console.log('\n🧪 Testing Inventory Summary...');
    try {
      const response = await axios.get(`${BASE_URL}/smart/inventory-summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Inventory summary response:', response.data);
    } catch (error) {
      console.log('❌ Inventory summary error:', error.response?.status, error.response?.data);
    }

    // Test smart suggestions
    console.log('\n🧪 Testing Smart Suggestions...');
    try {
      const response = await axios.get(`${BASE_URL}/smart/smart-suggestions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Smart suggestions response:', response.data);
    } catch (error) {
      console.log('❌ Smart suggestions error:', error.response?.status, error.response?.data);
    }

  } catch (error) {
    console.log('❌ Authentication error:', error.response?.data || error.message);
  }
}

testSmartEndpoints().catch(console.error); 