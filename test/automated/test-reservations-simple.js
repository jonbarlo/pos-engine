const axios = require('axios');

const API_BASE = 'http://localhost:3031/api';

async function testReservationsSimple() {
  try {
    console.log('🧪 Testing Reservations - Simple Test');
    console.log('=====================================');

    // Step 1: Login
    console.log('\n1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'giuseppe@italiandelight.com',
      password: 'Password123',
      businessId: 1
    });

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log('✅ Login successful');
    console.log(`   User ID: ${loginResponse.data.user.id}`);
    console.log(`   Business ID: ${loginResponse.data.user.businessId}`);

    // Step 2: Test GET reservations without date filter
    console.log('\n2. Testing GET reservations...');
    try {
      const reservationsResponse = await axios.get(`${API_BASE}/reservations`, { headers });
      console.log('✅ GET reservations successful');
      console.log(`   Found ${reservationsResponse.data.data.length} reservations`);
      reservationsResponse.data.data.forEach((reservation, index) => {
        console.log(`   ${index + 1}. ${reservation.customerName} - ${reservation.partySize} people - ${reservation.reservationDate} ${reservation.reservationTime}`);
      });
    } catch (error) {
      console.log('❌ GET reservations failed:', error.response?.data || error.message);
    }

    // Step 3: Test GET reservations with date filter
    console.log('\n3. Testing GET reservations with date filter...');
    const today = new Date().toISOString().split('T')[0];
    try {
      const reservationsWithDateResponse = await axios.get(`${API_BASE}/reservations?date=${today}`, { headers });
      console.log('✅ GET reservations with date filter successful');
      console.log(`   Found ${reservationsWithDateResponse.data.data.length} reservations for today`);
    } catch (error) {
      console.log('❌ GET reservations with date filter failed:', error.response?.data || error.message);
    }

    // Step 4: Test GET specific reservation
    console.log('\n4. Testing GET specific reservation...');
    try {
      const specificReservationResponse = await axios.get(`${API_BASE}/reservations/4`, { headers });
      console.log('✅ GET specific reservation successful');
      console.log(`   Reservation: ${specificReservationResponse.data.data.customerName} - ${specificReservationResponse.data.data.partySize} people`);
    } catch (error) {
      console.log('❌ GET specific reservation failed:', error.response?.data || error.message);
    }

    console.log('\n🎉 Simple reservations test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Wait a few seconds for server to start, then run test
setTimeout(testReservationsSimple, 3000); 