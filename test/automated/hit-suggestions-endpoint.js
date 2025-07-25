const axios = require('axios');

const BASE_URL = 'http://localhost:3031/api';

async function hitSuggestionsEndpoint() {
  try {
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'marco@italiandelight.com',
      password: 'Password123',
      businessSlug: 'italian-delight'
    });

    const { token } = loginResponse.data;
    console.log('✅ Login successful');

    console.log('\n📊 Hitting smart suggestions endpoint...');
    const response = await axios.get(`${BASE_URL}/smart/smart-suggestions?limit=10&includeExpiringItems=true&includeUnderperformingItems=true`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Response:', response.data);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

hitSuggestionsEndpoint(); 