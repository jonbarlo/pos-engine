const axios = require('axios');

async function checkMenuItems() {
  try {
    const loginResponse = await axios.post('http://localhost:3031/api/auth/login', {
      email: 'giuseppe@italiandelight.com',
      password: 'Password123',
      businessId: 1
    });

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    const itemsResponse = await axios.get('http://localhost:3031/api/items', { headers });
    
    console.log('Response:', JSON.stringify(itemsResponse.data, null, 2));
    
    if (itemsResponse.data.data) {
      console.log('Menu Items:');
      itemsResponse.data.data.forEach(item => {
        console.log(`- ${item.name} (ID: ${item.id}): $${item.price}`);
      });
    } else {
      console.log('No data found in response');
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

checkMenuItems(); 