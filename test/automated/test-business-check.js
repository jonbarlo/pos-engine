const axios = require('axios');

const BASE_URL = 'http://localhost:3031';

async function testBusinessCheck() {
  try {
    console.log('🔍 Testing business type check step by step...\n');

    // 1. Login to get a token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'marco@italiandelight.com',
      password: 'Password123',
      businessSlug: 'italian-delight'
    });

    const token = loginResponse.data.token;
    const businessId = loginResponse.data.user.businessId;
    console.log('✅ Login successful');
    console.log('Business ID:', businessId);
    console.log('');

    // 2. Test the basic tables endpoint first
    console.log('2. Testing basic /api/tables endpoint...');
    try {
      const basicTablesResponse = await axios.get(`${BASE_URL}/api/tables`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Basic tables endpoint successful!');
      console.log('Response status:', basicTablesResponse.status);
      console.log('Tables found:', basicTablesResponse.data.data?.length || 0);
    } catch (error) {
      console.log('❌ Basic tables endpoint failed:');
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data);
    }

    // 3. Test the tables endpoint without businessId in query params
    console.log('3. Testing /api/tables/tables-with-orders (new endpoint)...');
    console.log('🔍 DEBUG: Calling URL:', `${BASE_URL}/api/tables/tables-with-orders`);
    console.log('🔍 DEBUG: Headers:', { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    
    try {
      const tablesResponse = await axios.get(`${BASE_URL}/api/tables/with-orders`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Tables endpoint successful!');
      console.log('Response status:', tablesResponse.status);
      console.log('Tables found:', tablesResponse.data.data?.length || 0);
    } catch (error) {
      console.log('❌ Test failed:');
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data);
      console.log('Full error:', error.message);
      console.log('Response headers:', error.response?.headers);
    }

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

testBusinessCheck(); 