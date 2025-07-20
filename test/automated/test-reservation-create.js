const axios = require('axios');

const API_BASE = 'http://localhost:3031/api';

async function testReservationCreate() {
  try {
    console.log('🧪 Testing POST /reservations Endpoint');
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

    // Step 2: Test creating a reservation
    console.log('\n2. Testing POST /reservations...');
    const reservationData = {
      tableId: 1,
      customerName: 'John Smith',
      customerPhone: '+1-555-0101',
      customerEmail: 'john@example.com',
      partySize: 4,
      reservationDate: new Date().toISOString().split('T')[0],
      reservationTime: '19:00:00',
      status: 'pending',
      specialRequests: 'Window seat preferred'
    };

    console.log('Request data:', JSON.stringify(reservationData, null, 2));

    const createResponse = await axios.post(`${API_BASE}/reservations`, reservationData, { headers });
    
    console.log('✅ Reservation created successfully!');
    console.log(`   Reservation ID: ${createResponse.data.data.id}`);
    console.log(`   Customer: ${createResponse.data.data.customerName}`);
    console.log(`   Party Size: ${createResponse.data.data.partySize}`);
    console.log(`   Date: ${createResponse.data.data.reservationDate}`);
    console.log(`   Time: ${createResponse.data.data.reservationTime}`);
    console.log(`   Status: ${createResponse.data.data.status}`);

  } catch (error) {
    console.error('❌ Test failed:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data || error.message);
    
    if (error.response?.data?.error) {
      console.error('\n🔍 Error Details:');
      console.error(error.response.data.error);
    }
    
    process.exit(1);
  }
}

testReservationCreate(); 