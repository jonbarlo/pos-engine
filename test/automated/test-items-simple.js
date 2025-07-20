const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3031/api';

// Test credentials
const TEST_CREDENTIALS = {
  email: 'marco@italiandelight.com',
  password: 'Password123'
};

async function testItemsEndpoint() {
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

    // Test items endpoint
    console.log('\n🧪 Testing Items Endpoint...');
    try {
      const response = await axios.get(`${BASE_URL}/items`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Items response:', response.data);
      if (response.data.items && response.data.items.length > 0) {
        console.log('   Sample item fields:', Object.keys(response.data.items[0]));
        console.log('   First item:', response.data.items[0]);
      }
    } catch (error) {
      console.log('❌ Items error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.log('❌ Authentication error:', error.response?.data || error.message);
  }
}

testItemsEndpoint().catch(console.error); 