const axios = require('axios');

const BASE_URL = 'http://localhost:3031';

async function checkTables() {
  try {
    console.log('🔍 Checking available tables...\n');

    // Login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'maria@italiandelight.com',
      password: 'Password123',
      businessSlug: 'italian-delight'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // Get all tables
    console.log('2. Getting all tables...');
    const tablesResponse = await axios.get(`${BASE_URL}/api/tables`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Tables retrieved:');
    const tables = tablesResponse.data.data;
    tables.forEach(table => {
      console.log(`Table ${table.id} (${table.tableNumber}): ${table.status} - Capacity: ${table.capacity} - Party Size: ${table.partySize || 'N/A'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
  }
}

checkTables(); 