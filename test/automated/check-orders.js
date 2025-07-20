const axios = require('axios');

async function checkOrders() {
  try {
    const loginResponse = await axios.post('http://localhost:3031/api/auth/login', {
      email: 'giuseppe@italiandelight.com',
      password: 'Password123',
      businessId: 1
    });

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    const ordersResponse = await axios.get('http://localhost:3031/api/orders', { headers });
    
    console.log('Orders:');
    ordersResponse.data.data.forEach(order => {
      console.log(`- Order ${order.orderNumber} (ID: ${order.id}): ${order.status} - ${order.orderItems?.length || 0} items`);
    });
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

checkOrders(); 