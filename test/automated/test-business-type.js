const axios = require('axios');

async function testBusinessType() {
  console.log('🔍 Testing Business Type...');
  
  // Login first
  const loginData = {
    email: 'marco@italiandelight.com',
    password: 'Password123',
    businessSlug: 'italian-delight'
  };

  try {
    const loginResponse = await axios.post('http://localhost:3031/api/auth/login', loginData);
    const token = loginResponse.data.token;
    
    console.log('✅ Login successful');
    console.log('User businessId:', loginResponse.data.user.businessId);
    
    // Test business type check directly
    const businessResponse = await axios.get('http://localhost:3031/api/businesses', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Business data retrieved');
    console.log('Full response:', JSON.stringify(businessResponse.data, null, 2));
    
    const businesses = businessResponse.data.businesses || businessResponse.data;
    const business = businesses.find(b => b.id === 1);
    console.log('Business type:', business?.type);
    console.log('Business name:', business?.name);
    console.log('Business slug:', business?.slug);
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

testBusinessType(); 