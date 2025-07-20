const axios = require('axios');

async function checkTables() {
  try {
    const loginResponse = await axios.post('http://localhost:3031/api/auth/login', {
      email: 'giuseppe@italiandelight.com',
      password: 'Password123',
      businessId: 1
    });

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    const tablesResponse = await axios.get('http://localhost:3031/api/tables', { headers });
    
    console.log('Tables:');
    tablesResponse.data.data.forEach(table => {
      console.log(`- Table ${table.tableNumber} (ID: ${table.id}): ${table.status}`);
    });
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

checkTables(); 