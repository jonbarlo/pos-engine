const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3031/api';
const TEST_BUSINESS = {
  email: 'marco@italiandelight.com',
  password: 'Password123',
  businessSlug: 'italian-delight'
};

let authToken = null;

// Helper function to make authenticated requests
async function makeRequest(method, endpoint, data = null) {
  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    },
    ...(data && { data })
  };

  try {
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status 
    };
  }
}

async function testLogin() {
  console.log('\n🔐 Testing Login...');
  const loginData = {
    email: TEST_BUSINESS.email,
    password: TEST_BUSINESS.password,
    businessSlug: TEST_BUSINESS.businessSlug
  };

  const result = await makeRequest('POST', '/auth/login', loginData);
  console.log('Login:', result.success ? '✅ PASSED' : '❌ FAILED');
  
  if (result.success) {
    authToken = result.data.token;
    console.log('Token received:', authToken ? '✅' : '❌');
    console.log('User info:', {
      email: result.data.user.email,
      role: result.data.user.role,
      businessId: result.data.user.businessId
    });
  } else {
    console.log('Error:', result.error);
  }
}

async function testGetRecipes() {
  console.log('\n📋 Testing Get All Recipes...');
  const result = await makeRequest('GET', '/recipes');
  console.log('Get Recipes:', result.success ? '✅ PASSED' : '❌ FAILED');
  
  if (result.success) {
    console.log('Full response:', JSON.stringify(result.data, null, 2));
    console.log('Recipes found:', result.data.recipes?.length || 0);
    console.log('Pagination:', result.data.pagination);
  } else {
    console.log('Error:', result.error);
  }
}

async function testGetRecipeSuggestions() {
  console.log('\n💡 Testing Get Recipe Suggestions...');
  const result = await makeRequest('GET', '/recipes/suggestions/1'); // For item ID 1
  console.log('Get Recipe Suggestions:', result.success ? '✅ PASSED' : '❌ FAILED');
  
  if (result.success) {
    console.log('Full response:', JSON.stringify(result.data, null, 2));
    console.log('Suggestions found:', result.data.suggestions?.length || 0);
  } else {
    console.log('Error:', result.error);
  }
}

async function testGetItems() {
  console.log('\n📦 Testing Get Items...');
  const result = await makeRequest('GET', '/items');
  console.log('Get Items:', result.success ? '✅ PASSED' : '❌ FAILED');
  
  if (result.success) {
    console.log('Items found:', result.data.items?.length || 0);
    if (result.data.items && result.data.items.length > 0) {
      console.log('First few items:');
      result.data.items.slice(0, 3).forEach(item => {
        console.log(`  - ID: ${item.id}, Name: ${item.name}, SKU: ${item.sku}`);
      });
    }
  } else {
    console.log('Error:', result.error);
  }
}

async function runTests() {
  console.log('🚀 Starting Recipe Debug Tests...');
  console.log('=====================================');
  
  await testLogin();
  await testGetItems();
  await testGetRecipes();
  await testGetRecipeSuggestions();
  
  console.log('\n=====================================');
  console.log('🎉 Recipe Debug Tests Completed!');
}

runTests().catch(console.error); 