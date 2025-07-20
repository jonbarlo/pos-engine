const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3031/api';

async function testEndpointsExist() {
  console.log('🧪 Testing if smart endpoints exist...');
  
  // Test if server is running
  try {
    const healthResponse = await axios.get(`${BASE_URL.replace('/api', '')}/health`);
    console.log('✅ Server is running');
  } catch (error) {
    console.log('❌ Server is not running');
    return;
  }

  // Test smart endpoints without auth (should return 401, not 404)
  const endpoints = [
    '/smart/inventory-summary',
    '/smart/smart-suggestions',
    '/smart/expiring-items',
    '/smart/underperforming-items'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${BASE_URL}${endpoint}`);
      console.log(`✅ ${endpoint} - Status: ${response.status}`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(`✅ ${endpoint} - Exists (401 Unauthorized)`);
      } else if (error.response?.status === 404) {
        console.log(`❌ ${endpoint} - Not found (404)`);
      } else {
        console.log(`❌ ${endpoint} - Error: ${error.response?.status} ${error.response?.data?.error || error.message}`);
      }
    }
  }
}

testEndpointsExist().catch(console.error); 