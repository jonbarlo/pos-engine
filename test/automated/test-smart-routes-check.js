const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3031/api';
const TEST_BUSINESS_ID = 1;

// Test credentials (copy from last working test)
const TEST_CREDENTIALS = {
  email: 'marco@italiandelight.com',
  password: 'Password123'
};

let authToken = '';

// Helper function to get auth token
async function getAuthToken() {
  try {
    console.log('🔐 Authenticating...');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_CREDENTIALS.email,
      password: TEST_CREDENTIALS.password,
      businessSlug: 'italian-delight'
    });

    if (response.data.token) {
      authToken = response.data.token;
      console.log('✅ Authentication successful');
      return true;
    } else {
      console.log('❌ Authentication failed:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Authentication error:', error.response?.data || error.message);
    return false;
  }
}

// Test smart recipe suggestion routes
async function testSmartRoutes() {
  console.log('\n🧪 Testing Smart Recipe Suggestion Routes...\n');

  // Test 1: Check if routes are registered
  console.log('1️⃣ Testing route registration...');
  
  try {
    // Test inventory summary endpoint
    const summaryResponse = await axios.get(`${BASE_URL}/smart/inventory-summary`, {
      headers: {
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      }
    });
    console.log('✅ Inventory summary route accessible');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Inventory summary route exists (requires auth)');
    } else {
      console.log('❌ Inventory summary route error:', error.response?.status || error.message);
    }
  }

  try {
    // Test expiring items endpoint
    const expiringResponse = await axios.get(`${BASE_URL}/smart/expiring-items`, {
      headers: {
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      }
    });
    console.log('✅ Expiring items route accessible');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Expiring items route exists (requires auth)');
    } else {
      console.log('❌ Expiring items route error:', error.response?.status || error.message);
    }
  }

  try {
    // Test underperforming items endpoint
    const underperformingResponse = await axios.get(`${BASE_URL}/smart/underperforming-items`, {
      headers: {
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      }
    });
    console.log('✅ Underperforming items route accessible');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Underperforming items route exists (requires auth)');
    } else {
      console.log('❌ Underperforming items route error:', error.response?.status || error.message);
    }
  }

  try {
    // Test recipe suggestions endpoint
    const suggestionsResponse = await axios.get(`${BASE_URL}/smart/recipe-suggestions`, {
      headers: {
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      }
    });
    console.log('✅ Recipe suggestions route accessible');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Recipe suggestions route exists (requires auth)');
    } else {
      console.log('❌ Recipe suggestions route error:', error.response?.status || error.message);
    }
  }

  console.log('\n🎯 Route testing completed!');
}

// Main test execution
async function runTests() {
  console.log('🚀 Starting Smart Routes Check Test...\n');
  
  // Authenticate first
  const authSuccess = await getAuthToken();
  if (!authSuccess) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }

  // Run tests
  await testSmartRoutes();
  
  console.log('\n✨ All tests completed!');
}

// Run the tests
runTests().catch(console.error); 
