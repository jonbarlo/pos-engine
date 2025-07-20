const axios = require('axios');

const BASE_URL = 'http://localhost:3031/api';

async function checkBusinessType() {
  try {
    console.log('🔍 Checking business type...');
    
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
    
    // Get business details
    console.log('\n2. Getting business details...');
    const businessResponse = await axios.get(`${BASE_URL}/businesses/1`, { headers });
    
    console.log('Business details:', businessResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
  }
}

checkBusinessType(); 