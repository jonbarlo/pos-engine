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

// Test smart recipe suggestions
async function testSmartRecipeSuggestions() {
  console.log('\n🧪 Testing Smart Recipe Suggestions...\n');

  // Test 1: Inventory Summary
  console.log('1️⃣ Testing Inventory Summary...');
  try {
    const response = await axios.get(`${BASE_URL}/smart/inventory-summary`, {
      headers: {
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      }
    });
    
    if (response.data.success) {
      console.log('✅ Inventory summary retrieved successfully');
      console.log(`   Total Items: ${response.data.totalItems || 'N/A'}`);
      console.log(`   Perishable Items: ${response.data.perishableItems || 'N/A'}`);
      console.log(`   Expiring Soon: ${response.data.expiringSoon || 'N/A'}`);
      console.log(`   Underperforming: ${response.data.underperforming || 'N/A'}`);
    } else {
      console.log('❌ Inventory summary failed:', response.data);
    }
  } catch (error) {
    console.log('❌ Inventory summary error:', error.response?.data || error.message);
  }

  // Test 2: Expiring Items
  console.log('\n2️⃣ Testing Expiring Items...');
  try {
    const response = await axios.get(`${BASE_URL}/smart/expiring-items`, {
      headers: {
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      }
    });
    
    if (response.data.success) {
      console.log('✅ Expiring items retrieved successfully');
      console.log(`   Count: ${response.data.items?.length || 0} items`);
      if (response.data.items && response.data.items.length > 0) {
        console.log('   Sample items:');
        response.data.items.slice(0, 3).forEach(item => {
          console.log(`     - ${item.name} (expires: ${item.expirationDate})`);
        });
      }
    } else {
      console.log('❌ Expiring items failed:', response.data);
    }
  } catch (error) {
    console.log('❌ Expiring items error:', error.response?.data || error.message);
  }

  // Test 3: Underperforming Items
  console.log('\n3️⃣ Testing Underperforming Items...');
  try {
    const response = await axios.get(`${BASE_URL}/smart/underperforming-items`, {
      headers: {
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      }
    });
    
    if (response.data.success) {
      console.log('✅ Underperforming items retrieved successfully');
      console.log(`   Count: ${response.data.items?.length || 0} items`);
      if (response.data.items && response.data.items.length > 0) {
        console.log('   Sample items:');
        response.data.items.slice(0, 3).forEach(item => {
          console.log(`     - ${item.name} (velocity: ${item.salesVelocity})`);
        });
      }
    } else {
      console.log('❌ Underperforming items failed:', response.data);
    }
  } catch (error) {
    console.log('❌ Underperforming items error:', error.response?.data || error.message);
  }

  // Test 4: Recipe Suggestions
  console.log('\n4️⃣ Testing Recipe Suggestions...');
  try {
    const response = await axios.get(`${BASE_URL}/smart/smart-suggestions`, {
      headers: {
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      }
    });
    
    if (response.data.success) {
      console.log('✅ Recipe suggestions retrieved successfully');
      console.log(`   Count: ${response.data.suggestions?.length || 0} suggestions`);
      if (response.data.suggestions && response.data.suggestions.length > 0) {
        console.log('   Sample suggestions:');
        response.data.suggestions.slice(0, 3).forEach(suggestion => {
          console.log(`     - ${suggestion.name} (priority: ${suggestion.priority})`);
        });
      }
    } else {
      console.log('❌ Recipe suggestions failed:', response.data);
    }
  } catch (error) {
    console.log('❌ Recipe suggestions error:', error.response?.data || error.message);
  }
}

// Main test execution
async function runTests() {
  console.log('🚀 Starting Smart Recipe Suggestions API Tests');
  console.log('=============================================');
  console.log(`📍 Testing against: ${BASE_URL}`);
  
  // Authenticate first
  const authSuccess = await getAuthToken();
  if (!authSuccess) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }

  // Run tests
  await testSmartRecipeSuggestions();
  
  console.log('\n✨ All tests completed!');
}

// Run the tests
runTests().catch(console.error); 
