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

    // Test inventory summary
    console.log('\n🧪 Testing Inventory Summary...');
    try {
      const response = await axios.get(`${BASE_URL}/smart/inventory-summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Inventory summary response:', response.data);
    } catch (error) {
      console.log('❌ Inventory summary error:', error.response?.data || error.message);
    }

    // Test expiring items
    console.log('\n🧪 Testing Expiring Items...');
    try {
      const response = await axios.get(`${BASE_URL}/smart/expiring-items`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Expiring items response:', response.data);
    } catch (error) {
      console.log('❌ Expiring items error:', error.response?.data || error.message);
    }

    // Test underperforming items
    console.log('\n🧪 Testing Underperforming Items...');
    try {
      const response = await axios.get(`${BASE_URL}/smart/underperforming-items`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Underperforming items response:', response.data);
    } catch (error) {
      console.log('❌ Underperforming items error:', error.response?.data || error.message);
    }

    // Test smart suggestions
    console.log('\n🧪 Testing Smart Suggestions...');
    try {
      const response = await axios.get(`${BASE_URL}/smart/smart-suggestions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Smart suggestions response:', response.data);
    } catch (error) {
      console.log('❌ Smart suggestions error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.log('❌ Authentication error:', error.response?.data || error.message);
  }
}

testSmartEndpoints().catch(console.error); 