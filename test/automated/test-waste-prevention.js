const axios = require('axios');

async function testWastePreventionEndpoint() {
  try {
    console.log('🧪 Testing Waste Prevention Endpoint...');
    
    // First, get a token
    const loginResponse = await axios.post('http://localhost:3031/api/auth/login', {
      email: 'admin@italian-delight.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, got token');
    
    // Test the waste prevention endpoint
    const wasteResponse = await axios.post('http://localhost:3031/api/smart/waste-prevention-suggestions', {
      maxDaysToExpiry: 7,
      limit: 5
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Waste prevention endpoint working!');
    console.log('📊 Response:', JSON.stringify(wasteResponse.data, null, 2));
    
    // Test with different parameters
    const wasteResponse2 = await axios.post('http://localhost:3031/api/smart/waste-prevention-suggestions', {
      maxDaysToExpiry: 3,
      limit: 3
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Second test successful!');
    console.log('📊 Response 2:', JSON.stringify(wasteResponse2.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing waste prevention endpoint:', error.response?.data || error.message);
  }
}

testWastePreventionEndpoint(); 