const axios = require('axios');

const BASE_URL = 'http://localhost:3031';

async function testReservationAPI() {
  try {
    console.log('🧪 Testing Reservation API Integration...\n');

    // 1. First, login to get a token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'marco@italiandelight.com',
      password: 'Password123',
      businessSlug: 'italian-delight'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // 2. Test floor plans with tables endpoint for all floor plans
    console.log('2. Testing /api/floor-plans/:id/tables endpoint for all floor plans...');
    
    // Get all floor plans first
    const floorPlansResponse = await axios.get(`${BASE_URL}/api/floor-plans`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Available floor plans:', floorPlansResponse.data.map(fp => ({ id: fp.id, name: fp.name })));
    
    let totalReservedTables = 0;
    
    // Test each floor plan
    for (const floorPlan of floorPlansResponse.data) {
      console.log(`\n--- Testing Floor Plan: ${floorPlan.name} (ID: ${floorPlan.id}) ---`);
      
      const floorPlanResponse = await axios.get(`${BASE_URL}/api/floor-plans/${floorPlan.id}/tables`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const tablePositions = floorPlanResponse.data.tablePositions || [];
      const reservedTables = tablePositions.filter(table => table.tableStatus === 'reserved');
      
      console.log(`Found ${reservedTables.length} reserved tables in ${floorPlan.name}:`);
      
      reservedTables.forEach(table => {
        totalReservedTables++;
        console.log(`  - Table ${table.tableNumber} (ID: ${table.tableId})`);
        if (table.reservation) {
          console.log(`    ✅ Has reservation data:`, {
            customerName: table.reservation.customerName,
            partySize: table.reservation.partySize,
            reservationDate: table.reservation.reservationDate,
            reservationTime: table.reservation.reservationTime,
            notes: table.reservation.notes
          });
        } else {
          console.log(`    ❌ Missing reservation data`);
        }
      });
    }

    console.log(`\n📊 Total reserved tables found: ${totalReservedTables}`);

    // 3. Test tables with orders endpoint
    console.log('\n3. Testing /api/tables/with-orders endpoint...');
    try {
      const tablesResponse = await axios.get(`${BASE_URL}/api/tables/with-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Tables with orders response:');
      console.log(JSON.stringify(tablesResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Error testing tables with orders API:', error.response?.data || error.message);
    }

    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testReservationAPI(); 