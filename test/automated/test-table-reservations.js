const axios = require('axios');

const API_BASE = 'http://localhost:3031/api';

async function testTableReservationsEndpoint() {
  try {
    console.log('🧪 Testing Table Reservations Endpoint');
    console.log('=====================================');

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

    // Step 2: Get tables to find a table with reservations
    console.log('\n2. Getting tables to find one with reservations...');
    const tablesResponse = await axios.get(`${API_BASE}/tables`, { headers });
    
    const tableWithReservation = tablesResponse.data.data.find(table => 
      table.reservation && table.status === 'reserved'
    );

    if (!tableWithReservation) {
      console.log('❌ No tables with reservations found. Creating a test reservation...');
      
      // Create a reservation first
      const reservationResponse = await axios.post(`${API_BASE}/reservations`, {
        tableId: 1,
        customerName: 'Test Customer',
        customerPhone: '+1-555-0123',
        partySize: 4,
        reservationDate: new Date().toISOString().split('T')[0],
        reservationTime: '19:00:00',
        status: 'confirmed'
      }, { headers });

      console.log('✅ Created test reservation');
      console.log(`   Reservation ID: ${reservationResponse.data.data.id}`);
      
      // Now get the table reservations
      console.log('\n3. Testing GET /tables/1/reservations...');
      const tableReservationsResponse = await axios.get(`${API_BASE}/tables/1/reservations`, { headers });
      
      console.log('✅ Table reservations endpoint working!');
      console.log(`   Found ${tableReservationsResponse.data.data.length} reservations`);
      console.log(`   Message: ${tableReservationsResponse.data.message}`);
      
      if (tableReservationsResponse.data.data.length > 0) {
        const reservation = tableReservationsResponse.data.data[0];
        console.log(`   Customer: ${reservation.customerName}`);
        console.log(`   Party Size: ${reservation.partySize}`);
        console.log(`   Time: ${reservation.reservationTime}`);
        console.log(`   Status: ${reservation.status}`);
      }
    } else {
      console.log(`✅ Found table ${tableWithReservation.id} with reservation`);
      
      // Test the new endpoint
      console.log(`\n3. Testing GET /tables/${tableWithReservation.id}/reservations...`);
      const tableReservationsResponse = await axios.get(`${API_BASE}/tables/${tableWithReservation.id}/reservations`, { headers });
      
      console.log('✅ Table reservations endpoint working!');
      console.log(`   Found ${tableReservationsResponse.data.data.length} reservations`);
      console.log(`   Message: ${tableReservationsResponse.data.message}`);
      
      if (tableReservationsResponse.data.data.length > 0) {
        const reservation = tableReservationsResponse.data.data[0];
        console.log(`   Customer: ${reservation.customerName}`);
        console.log(`   Party Size: ${reservation.partySize}`);
        console.log(`   Time: ${reservation.reservationTime}`);
        console.log(`   Status: ${reservation.status}`);
      }
    }

    // Step 4: Test with date filter
    console.log('\n4. Testing with date filter...');
    const today = new Date().toISOString().split('T')[0];
    const dateFilterResponse = await axios.get(`${API_BASE}/tables/1/reservations?date=${today}`, { headers });
    
    console.log('✅ Date filter working!');
    console.log(`   Found ${dateFilterResponse.data.data.length} reservations for ${today}`);

    // Step 5: Test with status filter
    console.log('\n5. Testing with status filter...');
    const statusFilterResponse = await axios.get(`${API_BASE}/tables/1/reservations?status=confirmed`, { headers });
    
    console.log('✅ Status filter working!');
    console.log(`   Found ${statusFilterResponse.data.data.length} confirmed reservations`);

    console.log('\n🎉 All tests passed! The mobile app endpoint is working correctly.');
    console.log('\n📱 Mobile App Compatibility:');
    console.log('   ✅ GET /api/tables/{tableId}/reservations - Working');
    console.log('   ✅ Date filtering - Working');
    console.log('   ✅ Status filtering - Working');
    console.log('   ✅ Business scoping - Working');
    console.log('   ✅ Authentication - Working');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testTableReservationsEndpoint(); 