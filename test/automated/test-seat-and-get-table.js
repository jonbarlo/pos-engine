const axios = require('axios');

const BASE_URL = 'http://localhost:3031/api';
const LOGIN_EMAIL = 'test@example.com';
const LOGIN_PASSWORD = 'password123';

async function getToken() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: LOGIN_EMAIL,
      password: LOGIN_PASSWORD
    });
    return response.data.token;
  } catch (error) {
    console.error('Login error:', error.response ? error.response.data : error.message);
    throw error;
  }
}

async function seatCustomer(token) {
  try {
    const response = await axios.post(
      `${BASE_URL}/tables/42/seat`,
      {
        partySize: 4,
        customerName: 'John Smith',
        customerPhone: '555-1234',
        notes: 'Window seat preferred'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Seat customer response:', response.data);
  } catch (error) {
    console.error('Seat customer error:', error.response ? error.response.data : error.message);
  }
}

async function getTables(token) {
  try {
    const response = await axios.get(`${BASE_URL}/tables`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    // Print only the table with id 42 and its customer info
    const table = response.data.data.find(t => t.id === 42);
    console.log('Table 42:', JSON.stringify(table, null, 2));
  } catch (error) {
    console.error('Get tables error:', error.response ? error.response.data : error.message);
  }
}

(async () => {
  const token = await getToken();
  if (!token) return;
  await seatCustomer(token);
  await getTables(token);
})(); 