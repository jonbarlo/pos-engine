const axios = require('axios');

const BASE_URL = 'http://localhost:3031';

async function testCheckinFix() {
  try {
    console.log('🧪 Testing Check-in Fix...\n');

    // 1. Login to get a token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'marco@italiandelight.com',
      password: 'Password123',
      businessSlug: 'italian-delight'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // 2. Get current reservations
    console.log('2. Getting current reservations...');
    const reservationsResponse = await axios.get(`${BASE_URL}/api/reservations`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const reservations = reservationsResponse.data.data;
    console.log(`Found ${reservations.length} reservations`);

    // Find a confirmed reservation with a table
    const confirmedReservation = reservations.find(r => 
      r.status === 'confirmed' && r.tableId && r.customerName
    );

    if (!confirmedReservation) {
      console.log('❌ No confirmed reservation with table found for testing');
      return;
    }

    console.log(`\nTesting with reservation: ${confirmedReservation.customerName} (ID: ${confirmedReservation.id})`);
    console.log(`Table ID: ${confirmedReservation.tableId}`);
    console.log(`Special Requests: ${confirmedReservation.specialRequests || 'None'}`);

    // 3. Get table info before check-in
    console.log('\n3. Getting table info before check-in...');
    const tablesResponse = await axios.get(`${BASE_URL}/api/tables`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const tableBefore = tablesResponse.data.data.find(t => t.id === confirmedReservation.tableId);
    console.log('Table before check-in:', {
      id: tableBefore.id,
      tableNumber: tableBefore.tableNumber,
      status: tableBefore.status,
      customerName: tableBefore.customerName || 'None',
      notes: tableBefore.notes || 'None'
    });

    // 4. Perform check-in (update reservation status to 'seated')
    console.log('\n4. Performing check-in...');
    const checkinResponse = await axios.put(`${BASE_URL}/api/reservations/${confirmedReservation.id}`, {
      status: 'seated'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Check-in successful');
    console.log('Updated reservation:', checkinResponse.data.data);

    // 5. Get table info after check-in
    console.log('\n5. Getting table info after check-in...');
    const tablesAfterResponse = await axios.get(`${BASE_URL}/api/tables`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const tableAfter = tablesAfterResponse.data.data.find(t => t.id === confirmedReservation.tableId);
    console.log('Table after check-in:', {
      id: tableAfter.id,
      tableNumber: tableAfter.tableNumber,
      status: tableAfter.status,
      customerName: tableAfter.customerName || 'None',
      notes: tableAfter.notes || 'None'
    });

    // 6. Verify the fix
    console.log('\n6. Verifying the fix...');
    const customerNameUpdated = tableAfter.customerName === confirmedReservation.customerName;
    const notesUpdated = tableAfter.notes === (confirmedReservation.specialRequests || null);
    const statusUpdated = tableAfter.status === 'occupied';

    console.log(`✅ Customer name updated: ${customerNameUpdated}`);
    console.log(`✅ Notes updated: ${notesUpdated}`);
    console.log(`✅ Status updated to occupied: ${statusUpdated}`);

    if (customerNameUpdated && notesUpdated && statusUpdated) {
      console.log('\n🎉 SUCCESS: Check-in fix is working! Table data is now fresh with customer information.');
    } else {
      console.log('\n❌ FAILED: Check-in fix is not working properly.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testCheckinFix(); 