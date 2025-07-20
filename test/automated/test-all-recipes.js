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

async function testGetAllRecipes() {
  console.log('\n📋 Testing Get ALL Recipes (including inactive)...');
  
  // Try to get recipes without the isActive filter by modifying the request
  const result = await makeRequest('GET', '/recipes?isActive=false');
  console.log('Get All Recipes:', result.success ? '✅ PASSED' : '❌ FAILED');
  
  if (result.success) {
    console.log('Full response:', JSON.stringify(result.data, null, 2));
    console.log('Total recipes found:', result.data.data?.length || 0);
    
    if (result.data.data && result.data.data.length > 0) {
      console.log('\n📝 Recipe details:');
      result.data.data.forEach((recipe, index) => {
        console.log(`${index + 1}. ID: ${recipe.id}, Name: ${recipe.name}, Active: ${recipe.isActive}, Business: ${recipe.businessId}`);
      });
    }
  } else {
    console.log('Error:', result.error);
  }
}

async function testGetRecipeSuggestions() {
  console.log('\n💡 Testing Get Recipe Suggestions...');
  
  // Try different item IDs to see if we can find suggestions
  for (let itemId = 1; itemId <= 5; itemId++) {
    const result = await makeRequest('GET', `/recipes/suggestions/${itemId}`);
    console.log(`Item ${itemId} suggestions:`, result.success ? '✅' : '❌');
    
    if (result.success && result.data.data && result.data.data.length > 0) {
      console.log(`  Found ${result.data.data.length} suggestions for item ${itemId}`);
      result.data.data.forEach(suggestion => {
        console.log(`    - Recipe ID: ${suggestion.recipeId}, Confidence: ${suggestion.confidence}`);
      });
    }
  }
}

async function testGetItems() {
  console.log('\n📦 Testing Get Items...');
  const result = await makeRequest('GET', '/items');
  console.log('Get Items:', result.success ? '✅ PASSED' : '❌ FAILED');
  
  if (result.success) {
    console.log('Items found:', result.data.data?.length || 0);
    if (result.data.data && result.data.data.length > 0) {
      console.log('First few items:');
      result.data.data.slice(0, 5).forEach(item => {
        console.log(`  - ID: ${item.id}, Name: ${item.name}, SKU: ${item.sku}, Business: ${item.businessId}`);
      });
    }
  } else {
    console.log('Error:', result.error);
  }
}

async function runTests() {
  console.log('🚀 Starting All Recipes Debug Test...');
  console.log('=====================================');
  
  await testLogin();
  await testGetItems();
  await testGetAllRecipes();
  await testGetRecipeSuggestions();
  
  console.log('\n=====================================');
  console.log('🎉 All Recipes Debug Test Completed!');
}

runTests().catch(console.error); 