const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3031/api';
let authToken = '';

async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'marco@italiandelight.com',
      password: 'Password123',
      businessId: 1
    });
    
    authToken = response.data.token;
    console.log('🔐 Authenticated successfully');
    return true;
  } catch (error) {
    console.error('❌ Authentication failed:', error.response?.data || error.message);
    return false;
  }
}

async function testSmartSuggestionsWithFlags() {
  console.log('🧪 Testing Smart Suggestions with flags enabled...');
  
  try {
    const response = await axios.get(`${BASE_URL}/smart/smart-suggestions`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: {
        includeExpiringItems: true,
        includeUnderperformingItems: true,
        maxDaysToExpiry: 7,
        minSalesVelocity: 0.1,
        maxDaysSinceLastSale: 30,
        limit: 10
      }
    });
    
    console.log('✅ Smart suggestions with flags response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.suggestions.length === 0) {
      console.log('💡 No suggestions found - this is expected since there are no recipes in the database');
      console.log('📝 To see suggestions, you need to add recipes that use the expiring/underperforming items');
    }
    
  } catch (error) {
    console.error('❌ Smart suggestions error:', error.response?.status, error.response?.data);
  }
}

async function main() {
  console.log('🚀 Testing Smart Recipe Suggestions with Flags...\n');
  
  if (!(await login())) {
    return;
  }
  
  await testSmartSuggestionsWithFlags();
  
  console.log('\n✅ Test completed!');
}

main().catch(console.error); 