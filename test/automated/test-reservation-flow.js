const axios = require('axios');

const BASE_URL = 'http://localhost:3031';

async function testReservationFlow() {
  try {
    console.log('🔍 Testing reservation flow...\n');

    // Step 1: Login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'maria@italiandelight.com',
      password: 'Password123',
      businessSlug: 'italian-delight'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // Step 2: Test getting all tables to see reservation data
    console.log('2. Testing get all tables endpoint...');
    const tablesResponse = await axios.get(`${BASE_URL}/api/tables`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ All tables retrieved:');
    const tables = tablesResponse.data.data;
    tables.forEach(table => {
      console.log(`\nTable ${table.id} (${table.tableNumber}):`);
      console.log(`  Status: ${table.status}`);
      console.log(`  Capacity: ${table.capacity}`);
      console.log(`  Party Size: ${table.partySize || 'N/A'}`);
      console.log(`  Section: ${table.section}`);
      console.log(`  Server ID: ${table.serverId || 'N/A'}`);
      console.log(`  Current Order ID: ${table.currentOrderId || 'N/A'}`);
      
      // Check if reservation data is included
      if (table.reservation) {
        console.log(`  📅 RESERVATION DATA:`);
        console.log(`    Customer: ${table.reservation.customer?.name || 'N/A'}`);
        console.log(`    Phone: ${table.reservation.customer?.phone || 'N/A'}`);
        console.log(`    Email: ${table.reservation.customer?.email || 'N/A'}`);
        console.log(`    Date: ${table.reservation.reservationDate}`);
        console.log(`    Time: ${table.reservation.reservationTime}`);
        console.log(`    Party Size: ${table.reservation.partySize}`);
        console.log(`    Status: ${table.reservation.status}`);
      } else if (table.status === 'reserved') {
        console.log(`  ⚠️  Table is reserved but no reservation data in response`);
      }
    });

    // Step 3: Test getting tables with orders to see if reservations are included there too
    console.log('\n3. Testing tables with orders endpoint...');
    const tablesWithOrdersResponse = await axios.get(`${BASE_URL}/api/tables/with-orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Tables with orders retrieved:');
    const tablesWithOrders = tablesWithOrdersResponse.data.data;
    tablesWithOrders.forEach(table => {
      if (table.status === 'reserved' || table.reservation) {
        console.log(`\n📅 RESERVED TABLE ${table.id} (${table.tableNumber}):`);
        console.log(`  Status: ${table.status}`);
        console.log(`  Orders: ${table.orders?.length || 0}`);
        console.log(`  Total Pending: $${table.totalPendingAmount || 0}`);
        
        if (table.reservation) {
          console.log(`  📅 RESERVATION DATA:`);
          console.log(`    Customer: ${table.reservation.customer?.name || 'N/A'}`);
          console.log(`    Phone: ${table.reservation.customer?.phone || 'N/A'}`);
          console.log(`    Email: ${table.reservation.customer?.email || 'N/A'}`);
          console.log(`    Date: ${table.reservation.reservationDate}`);
          console.log(`    Time: ${table.reservation.reservationTime}`);
          console.log(`    Party Size: ${table.reservation.partySize}`);
          console.log(`    Status: ${table.reservation.status}`);
        } else {
          console.log(`  ⚠️  No reservation data in response`);
        }
      }
    });

    // Step 4: Test getting a specific reserved table
    console.log('\n4. Testing get specific reserved table...');
    const reservedTableResponse = await axios.get(`${BASE_URL}/api/tables/3`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Reserved table details:');
    console.log(JSON.stringify(reservedTableResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
  }
}

testReservationFlow(); 