const axios = require('axios');

const BASE_URL = 'http://localhost:3031/api';

async function checkUsers() {
  try {
    console.log('🔍 Checking what users exist...');
    
    // Try different credentials from the seeder
    const testCredentials = [
      { email: 'marco@italiandelight.com', password: 'Password123', businessId: 1 },
      { email: 'sophia@italiandelight.com', password: 'Password123', businessId: 1 },
      { email: 'antonio@italiandelight.com', password: 'Password123', businessId: 1 },
      { email: 'lucia@italiandelight.com', password: 'Password123', businessId: 1 },
      { email: 'giuseppe@italiandelight.com', password: 'Password123', businessId: 1 },
      { email: 'yuki@sushimaster.com', password: 'Password123', businessId: 2 },
      { email: 'sarah@coffeecorner.com', password: 'Password123', businessId: 3 }
    ];
    
    for (const cred of testCredentials) {
      try {
        console.log(`\nTrying: ${cred.email}`);
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, cred);
        console.log(`✅ SUCCESS: ${cred.email} - Token: ${loginResponse.data.token.substring(0, 20)}...`);
        return loginResponse.data.token;
      } catch (error) {
        console.log(`❌ FAILED: ${cred.email} - ${error.response?.data?.error?.message || error.message}`);
      }
    }
    
    console.log('\n❌ No valid credentials found');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkUsers(); 