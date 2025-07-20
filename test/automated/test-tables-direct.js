const axios = require('axios');

const BASE_URL = 'http://localhost:3031/api';

async function testTablesDirect() {
  try {
    console.log('🔍 Testing tables endpoint directly...');
    
    // Login to get a token
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'marco@italiandelight.com',
      password: 'Password123',
      businessId: 1
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Set up headers with token
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Test tables endpoint
    console.log('\n2. Testing /tables endpoint...');
    const tablesResponse = await axios.get(`${BASE_URL}/tables`, { headers });
    
    console.log('Tables response:', tablesResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
    if (error.response?.data) {
      console.error('Full error response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testTablesDirect(); 