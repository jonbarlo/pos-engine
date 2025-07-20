const axios = require('axios');

const BASE_URL = 'http://localhost:3031';

async function testTablesEndpoint() {
  try {
    console.log('🧪 Testing /api/tables/with-orders endpoint directly...\n');

    // 1. First, login to get a token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'marco@italiandelight.com',
      password: 'Password123',
      businessSlug: 'italian-delight'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log('Token:', token.substring(0, 20) + '...');
    console.log('User businessId:', loginResponse.data.user.businessId);
    console.log('');

    // 2. Test the problematic endpoint
    console.log('2. Testing /api/tables/with-orders endpoint...');
    const tablesResponse = await axios.get(`${BASE_URL}/api/tables/with-orders`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Tables endpoint successful!');
    console.log('Response status:', tablesResponse.status);
    console.log('Tables found:', tablesResponse.data.data?.length || 0);
    console.log('Sample table:', tablesResponse.data.data?.[0] || 'No tables');

  } catch (error) {
    console.log('❌ Test failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testTablesEndpoint(); 