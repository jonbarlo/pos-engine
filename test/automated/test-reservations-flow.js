const axios = require('axios');

const API_BASE = 'http://localhost:3031/api';

async function testReservationsFlow() {
  try {
    console.log('🧪 Testing Reservations Flow');
    console.log('============================');

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

    // Step 2: Get tables (including reserved ones)
    console.log('\n2. Getting tables...');
    const tablesResponse = await axios.get(`${API_BASE}/tables`, { headers });
    const reservedTable = tablesResponse.data.data.find(table => table.status === 'reserved');
    
    if (!reservedTable) {
      console.log('❌ No reserved tables found for testing');
      return;
    }

    console.log(`✅ Found reserved table: ${reservedTable.tableNumber} (ID: ${reservedTable.id})`);
    console.log(`   Current status: ${reservedTable.status}`);
    if (reservedTable.reservation) {
      console.log(`   Existing reservation: ${reservedTable.reservation.customerName} - ${reservedTable.reservation.partySize} people`);
    }

    // Step 3: Create a reservation
    console.log('\n3. Creating reservation...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(19, 0, 0, 0); // 7:00 PM

    const reservationData = {
      tableId: reservedTable.id,
      customerName: 'John Smith',
      customerPhone: '+1234567890',
      customerEmail: 'john.smith@email.com',
      partySize: 4,
      reservationDate: tomorrow.toISOString().split('T')[0], // YYYY-MM-DD
      reservationTime: '19:00',
      notes: 'Window seat preferred'
    };

    const createReservationResponse = await axios.post(`${API_BASE}/reservations`, reservationData, { headers });
    
    console.log('✅ Reservation created successfully');
    console.log(`   Reservation ID: ${createReservationResponse.data.data.id}`);
    console.log(`   Customer: ${createReservationResponse.data.data.customerName}`);
    console.log(`   Date: ${createReservationResponse.data.data.reservationDate}`);
    console.log(`   Time: ${createReservationResponse.data.data.reservationTime}`);

    // Step 4: Get today's reservations
    console.log('\n4. Getting today\'s reservations...');
    const today = new Date().toISOString().split('T')[0];
    const todayReservationsResponse = await axios.get(`${API_BASE}/reservations?date=${today}`, { headers });
    
    console.log(`✅ Found ${todayReservationsResponse.data.data.length} reservations for today`);
    todayReservationsResponse.data.data.forEach((reservation, index) => {
      console.log(`   ${index + 1}. ${reservation.customerName} - ${reservation.partySize} people - ${reservation.reservationTime}`);
    });

    // Step 5: Get tomorrow's reservations
    console.log('\n5. Getting tomorrow\'s reservations...');
    const tomorrowDate = tomorrow.toISOString().split('T')[0];
    const tomorrowReservationsResponse = await axios.get(`${API_BASE}/reservations?date=${tomorrowDate}`, { headers });
    
    console.log(`✅ Found ${tomorrowReservationsResponse.data.data.length} reservations for tomorrow`);
    tomorrowReservationsResponse.data.data.forEach((reservation, index) => {
      console.log(`   ${index + 1}. ${reservation.customerName} - ${reservation.partySize} people - ${reservation.reservationTime}`);
    });

    // Step 6: Check tables with reservations
    console.log('\n6. Checking tables with reservations...');
    const tablesWithReservationsResponse = await axios.get(`${API_BASE}/tables`, { headers });
    
    console.log('✅ Tables with reservation data:');
    tablesWithReservationsResponse.data.data.forEach(table => {
      if (table.reservation) {
        console.log(`   Table ${table.tableNumber}: ${table.reservation.customerName} - ${table.reservation.partySize} people - ${table.reservation.reservationTime}`);
      }
    });

    // Step 7: Update reservation
    console.log('\n7. Updating reservation...');
    const reservationId = createReservationResponse.data.data.id;
    const updateData = {
      partySize: 6,
      notes: 'Window seat preferred, anniversary celebration'
    };

    const updateReservationResponse = await axios.put(`${API_BASE}/reservations/${reservationId}`, updateData, { headers });
    
    console.log('✅ Reservation updated successfully');
    console.log(`   New party size: ${updateReservationResponse.data.data.partySize}`);
    console.log(`   Updated notes: ${updateReservationResponse.data.data.notes}`);

    // Step 8: Get specific reservation
    console.log('\n8. Getting specific reservation...');
    const getReservationResponse = await axios.get(`${API_BASE}/reservations/${reservationId}`, { headers });
    
    console.log('✅ Reservation details:');
    console.log(`   ID: ${getReservationResponse.data.data.id}`);
    console.log(`   Customer: ${getReservationResponse.data.data.customerName}`);
    console.log(`   Phone: ${getReservationResponse.data.data.customerPhone}`);
    console.log(`   Email: ${getReservationResponse.data.data.customerEmail}`);
    console.log(`   Party Size: ${getReservationResponse.data.data.partySize}`);
    console.log(`   Date: ${getReservationResponse.data.data.reservationDate}`);
    console.log(`   Time: ${getReservationResponse.data.data.reservationTime}`);
    console.log(`   Status: ${getReservationResponse.data.data.status}`);
    console.log(`   Notes: ${getReservationResponse.data.data.notes}`);

    // Step 9: Test seating a reserved table
    console.log('\n9. Testing seating for reserved table...');
    try {
      const seatResponse = await axios.post(`${API_BASE}/tables/${reservedTable.id}/seat`, {
        partySize: 6,
        serverId: loginResponse.data.user.id,
        notes: 'Seating reserved party'
      }, { headers });

      console.log('✅ Reserved table seated successfully');
      console.log(`   Table status: ${seatResponse.data.data.status}`);
      console.log(`   Party size: ${seatResponse.data.data.partySize}`);
    } catch (error) {
      console.log('❌ Could not seat reserved table (expected if table is now occupied)');
      console.log(`   Error: ${error.response?.data?.error || error.message}`);
    }

    // Step 10: Cancel reservation
    console.log('\n10. Cancelling reservation...');
    const cancelReservationResponse = await axios.delete(`${API_BASE}/reservations/${reservationId}`, { headers });
    
    console.log('✅ Reservation cancelled successfully');
    console.log(`   Status: ${cancelReservationResponse.data.message}`);

    // Step 11: Verify cancellation
    console.log('\n11. Verifying cancellation...');
    const cancelledReservationResponse = await axios.get(`${API_BASE}/reservations/${reservationId}`, { headers });
    
    console.log('✅ Cancelled reservation details:');
    console.log(`   Status: ${cancelledReservationResponse.data.data.status}`);

    console.log('\n🎉 Reservations flow test completed successfully!');
    console.log('All reservation operations are working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Full error:', error);
  }
}

// Wait a few seconds for server to start, then run test
setTimeout(testReservationsFlow, 3000); 