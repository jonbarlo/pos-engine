const axios = require('axios');

const BASE_URL = 'http://localhost:3031';

async function testSeatingAndTables() {
  try {
    console.log('🔍 Testing seating and tables endpoints...\n');

    // Step 1: Login to get token (using the same pattern as working endpoints)
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'maria@italiandelight.com',
      password: 'Password123',
      businessSlug: 'italian-delight'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // Step 2: Test seating a customer (using the same pattern as working endpoints)
    console.log('2. Testing seat customer endpoint...');
    const seatResponse = await axios.post(`${BASE_URL}/api/tables/9/seat`, {
      partySize: 4,
      serverId: 1,
      notes: 'Test seating'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Seat customer successful:');
    console.log(JSON.stringify(seatResponse.data, null, 2));
    console.log('');

    // Step 3: Test getting tables with orders (using the same pattern as working endpoints)
    console.log('3. Testing tables with orders endpoint...');
    const tablesResponse = await axios.get(`${BASE_URL}/api/tables/with-orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Tables with orders successful:');
    console.log(JSON.stringify(tablesResponse.data, null, 2));
    console.log('');

    // Step 4: Test getting all tables (using the same pattern as working endpoints)
    console.log('4. Testing get all tables endpoint...');
    const allTablesResponse = await axios.get(`${BASE_URL}/api/tables`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Get all tables successful:');
    console.log(JSON.stringify(allTablesResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
  }
}

testSeatingAndTables(); 