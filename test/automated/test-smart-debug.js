const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3031/api';

// Test credentials
const TEST_CREDENTIALS = {
  email: 'marco@italiandelight.com',
  password: 'Password123'
};

async function testSmartEndpoints() {
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
    console.log('Business ID:', authResponse.data.user.businessId);

    // Test basic items endpoint first
    console.log('\n🧪 Testing Basic Items Endpoint...');
    try {
      const response = await axios.get(`${BASE_URL}/items`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Items response:', response.data.success, 'Count:', response.data.data?.length || 0);
    } catch (error) {
      console.log('❌ Items error:', error.response?.data || error.message);
    }

    // Test basic recipes endpoint
    console.log('\n🧪 Testing Basic Recipes Endpoint...');
    try {
      const response = await axios.get(`${BASE_URL}/recipes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Recipes response:', response.data.success, 'Count:', response.data.data?.length || 0);
    } catch (error) {
      console.log('❌ Recipes error:', error.response?.data || error.message);
    }

    // Test inventory summary with detailed error
    console.log('\n🧪 Testing Inventory Summary...');
    try {
      const response = await axios.get(`${BASE_URL}/smart/inventory-summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Inventory summary response:', response.data);
    } catch (error) {
      console.log('❌ Inventory summary error:', error.response?.status, error.response?.data);
      if (error.response?.data?.error) {
        console.log('Error details:', error.response.data.error);
      }
    }

    // Test smart suggestions with detailed error
    console.log('\n🧪 Testing Smart Suggestions...');
    try {
      const response = await axios.get(`${BASE_URL}/smart/smart-suggestions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Smart suggestions response:', response.data);
    } catch (error) {
      console.log('❌ Smart suggestions error:', error.response?.status, error.response?.data);
      if (error.response?.data?.error) {
        console.log('Error details:', error.response.data.error);
      }
    }

  } catch (error) {
    console.log('❌ Authentication error:', error.response?.data || error.message);
  }
}

testSmartEndpoints().catch(console.error); 