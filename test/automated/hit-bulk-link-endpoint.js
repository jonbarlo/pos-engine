const axios = require('axios');

const BASE_URL = 'http://localhost:3031/api';

async function hitBulkLinkEndpoint() {
  try {
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'marco@italiandelight.com',
      password: 'Password123',
      businessSlug: 'italian-delight'
    });

    const { token } = loginResponse.data;
    console.log('✅ Login successful');

    console.log('\n📊 Hitting bulk-link-items endpoint...');
    const response = await axios.post(`${BASE_URL}/recipes/bulk-link-items?force=true`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Response:', response.data);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

hitBulkLinkEndpoint(); 