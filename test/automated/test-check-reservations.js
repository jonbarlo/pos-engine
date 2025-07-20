const axios = require('axios');

const BASE_URL = 'http://localhost:3031';

async function checkReservations() {
  try {
    console.log('🔍 Checking reservations in database...\n');

    // Step 1: Login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'maria@italiandelight.com',
      password: 'Password123',
      businessSlug: 'italian-delight'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // Step 2: Test the reservations endpoint directly
    console.log('2. Testing reservations endpoint...');
    try {
      const reservationsResponse = await axios.get(`${BASE_URL}/api/reservations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ Reservations endpoint response:');
      console.log(JSON.stringify(reservationsResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Reservations endpoint error:', error.response?.data || error.message);
    }

    // Step 3: Check today's date
    console.log('\n3. Today\'s date info:');
    const today = new Date();
    console.log(`Today's date: ${today.toISOString().split('T')[0]}`);
    console.log(`Today's full date: ${today.toISOString()}`);

    // Step 4: Test getting a specific table with more detailed logging
    console.log('\n4. Testing get specific table with detailed logging...');
    const tableResponse = await axios.get(`${BASE_URL}/api/tables/3`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Table 3 response:');
    console.log(JSON.stringify(tableResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
  }
}

checkReservations(); 