const axios = require('axios');

const BASE_URL = 'http://localhost:3031';

async function testSimple() {
  try {
    console.log('Testing /api/tables/all-with-orders...');
    
    // First get a token
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'marco@italiandelight.com',
      password: 'Password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Test the new endpoint
    const response = await axios.get(`${BASE_URL}/api/tables/all-with-orders`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Endpoint successful!');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    
  } catch (error) {
    console.log('❌ Error:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
  }
}

testSimple(); 