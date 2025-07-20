const axios = require('axios');

const API_BASE = 'http://localhost:3031/api';

async function testReservationsFix() {
  try {
    console.log('🧪 Testing GET Reservations Endpoint Fix');
    console.log('========================================');

    // Step 1: Login
    console.log('\n1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'marco@italiandelight.com',
      password: 'Password123',
      businessSlug: 'italian-delight'
    });

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log('✅ Login successful');
    console.log(`   User ID: ${loginResponse.data.user.id}`);
    console.log(`   Business ID: ${loginResponse.data.user.businessId}`);

    // Step 2: Test GET reservations endpoint
    console.log('\n2. Testing GET /reservations endpoint...');
    try {
      const reservationsResponse = await axios.get(`${API_BASE}/reservations`, { headers });
      console.log('✅ GET Reservations endpoint successful!');
      console.log(`   Found ${reservationsResponse.data.data.length} reservations`);
      
      if (reservationsResponse.data.data.length > 0) {
        const firstReservation = reservationsResponse.data.data[0];
        console.log(`   First reservation: ${firstReservation.customerName} for ${firstReservation.partySize} people`);
      }
    } catch (error) {
      console.log('❌ GET Reservations endpoint failed:', error.response?.data || error.message);
    }

    // Step 3: Test GET specific reservation endpoint
    console.log('\n3. Testing GET /reservations/{id} endpoint...');
    try {
      const reservationsResponse = await axios.get(`${API_BASE}/reservations`, { headers });
      if (reservationsResponse.data.data.length > 0) {
        const firstReservationId = reservationsResponse.data.data[0].id;
        const specificReservationResponse = await axios.get(`${API_BASE}/reservations/${firstReservationId}`, { headers });
        console.log('✅ GET specific reservation endpoint successful!');
        console.log(`   Reservation ID: ${specificReservationResponse.data.data.id}`);
        console.log(`   Customer: ${specificReservationResponse.data.data.customerName}`);
      } else {
        console.log('⚠️  No reservations found to test specific endpoint');
      }
    } catch (error) {
      console.log('❌ GET specific reservation endpoint failed:', error.response?.data || error.message);
    }

    console.log('\n🎉 Reservations endpoint test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Wait a few seconds for server to start, then run test
setTimeout(testReservationsFix, 3000); 