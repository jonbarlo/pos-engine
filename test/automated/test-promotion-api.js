const axios = require('axios');

const BASE_URL = 'http://localhost:3031/api';
let authToken = '';
let createdPromotionId = null;

// Helper function to make authenticated requests
async function makeRequest(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      },
      ...(data && { data })
    };

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

// Test functions
async function testHealthCheck() {
  console.log('🏥 Testing Health Check...');
  const result = await makeRequest('GET', '/health');
  console.log('Health Check:', result.success ? '✅ PASSED' : '❌ FAILED');
  if (result.success) {
    console.log('Response:', result.data);
  } else {
    console.log('Error:', result.error);
  }
}

async function testLogin() {
  console.log('\n🔐 Testing Login...');
  const loginData = {
    email: 'marco@italiandelight.com',
    password: 'Password123',
    businessSlug: 'italian-delight'
  };

  const result = await makeRequest('POST', '/auth/login', loginData);
  console.log('Login:', result.success ? '✅ PASSED' : '❌ FAILED');
  
  if (result.success) {
    authToken = result.data.token;
    console.log('Token received:', authToken ? '✅' : '❌');
    console.log('User info:', {
      email: result.data.user?.email,
      role: result.data.user?.role,
      businessId: result.data.user?.businessId
    });
  } else {
    console.log('Error:', result.error);
  }
}

async function testGetAllPromotions() {
  console.log('\n📋 Testing Get All Promotions...');
  const result = await makeRequest('GET', '/promotions');
  console.log('Get Promotions:', result.success ? '✅ PASSED' : '❌ FAILED');
  
  if (result.success) {
    const promotions = result.data.data || result.data.promotions || result.data;
    const pagination = result.data.pagination || result.data;
    console.log('Promotions found:', Array.isArray(promotions) ? promotions.length : 0);
    console.log('Pagination:', {
      page: pagination?.page || 1,
      limit: pagination?.limit || 20,
      total: pagination?.total || 0,
      totalPages: pagination?.totalPages || 0
    });
  } else {
    console.log('Error:', result.error);
  }
}

async function testCreatePromotion() {
  console.log('\n➕ Testing Create Promotion...');
  const promotionData = {
    name: 'Summer Special',
    description: 'Get 20% off on all pasta dishes',
    discountType: 'percentage',
    discountValue: 20.00,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    imageUrl: 'https://example.com/summer-special.jpg'
  };

  const result = await makeRequest('POST', '/promotions', promotionData);
  console.log('Create Promotion:', result.success ? '✅ PASSED' : '❌ FAILED');
  
  if (result.success) {
    console.log('Full response:', JSON.stringify(result.data, null, 2));
    const promotion = result.data.data || result.data.promotion || result.data;
    createdPromotionId = promotion?.id;
    console.log('Promotion created with ID:', createdPromotionId);
    console.log('Promotion name:', promotion?.name);
  } else {
    console.log('Error:', result.error);
  }
}

async function testGetPromotionById() {
  if (!createdPromotionId) {
    console.log('\n📖 Testing Get Promotion by ID: ❌ SKIPPED (no promotion ID)');
    return;
  }

  console.log('\n📖 Testing Get Promotion by ID...');
  const result = await makeRequest('GET', `/promotions/${createdPromotionId}`);
  console.log('Get Promotion by ID:', result.success ? '✅ PASSED' : '❌ FAILED');
  
  if (result.success) {
    const promotion = result.data.data || result.data.promotion || result.data;
    console.log('Promotion details:', {
      id: promotion?.id,
      name: promotion?.name,
      discountType: promotion?.discountType,
      discountValue: promotion?.discountValue,
      isActive: promotion?.isActive
    });
  } else {
    console.log('Error:', result.error);
  }
}

async function testUpdatePromotion() {
  if (!createdPromotionId) {
    console.log('\n✏️ Testing Update Promotion: ❌ SKIPPED (no promotion ID)');
    return;
  }

  console.log('\n✏️ Testing Update Promotion...');
  const updateData = {
    description: 'Updated description - Summer Special with extra savings!',
    discountValue: 25.00,
    imageUrl: 'https://example.com/updated-summer-special.jpg'
  };

  const result = await makeRequest('PUT', `/promotions/${createdPromotionId}`, updateData);
  console.log('Update Promotion:', result.success ? '✅ PASSED' : '❌ FAILED');
  
  if (result.success) {
    console.log('Promotion updated successfully');
    console.log('Updated fields:', updateData);
  } else {
    console.log('Error:', result.error);
  }
}

async function testAddPromotionItems() {
  if (!createdPromotionId) {
    console.log('\n🛍️ Testing Add Promotion Items: ❌ SKIPPED (no promotion ID)');
    return;
  }

  console.log('\n🛍️ Testing Add Promotion Items...');
  const itemsData = {
    items: [
      { itemId: 1, type: 'item' },
      { itemId: 2, type: 'item' }
    ]
  };

  const result = await makeRequest('POST', `/promotions/${createdPromotionId}/items`, itemsData);
  console.log('Add Promotion Items:', result.success ? '✅ PASSED' : '❌ FAILED');
  
  if (result.success) {
    console.log('Items added to promotion successfully');
    console.log('Response:', JSON.stringify(result.data, null, 2));
  } else {
    console.log('Error:', result.error);
  }
}

async function testGetPromotionItems() {
  if (!createdPromotionId) {
    console.log('\n📦 Testing Get Promotion Items: ❌ SKIPPED (no promotion ID)');
    return;
  }

  console.log('\n📦 Testing Get Promotion Items...');
  const result = await makeRequest('GET', `/promotions/${createdPromotionId}/items`);
  console.log('Get Promotion Items:', result.success ? '✅ PASSED' : '❌ FAILED');
  
  if (result.success) {
    const items = result.data.data || result.data.items || result.data;
    console.log('Items found:', Array.isArray(items) ? items.length : 0);
    if (Array.isArray(items) && items.length > 0) {
      console.log('First item:', items[0]);
    }
  } else {
    console.log('Error:', result.error);
  }
}

async function testDeletePromotion() {
  if (!createdPromotionId) {
    console.log('\n🗑️ Testing Delete Promotion: ❌ SKIPPED (no promotion ID)');
    return;
  }

  console.log('\n🗑️ Testing Delete Promotion...');
  const result = await makeRequest('DELETE', `/promotions/${createdPromotionId}`);
  console.log('Delete Promotion:', result.success ? '✅ PASSED' : '❌ FAILED');
  
  if (result.success) {
    console.log('Promotion deleted successfully');
  } else {
    console.log('Error:', result.error);
  }
}

async function testSearchPromotions() {
  console.log('\n🔍 Testing Search Promotions...');
  const result = await makeRequest('GET', '/promotions/search?q=summer');
  console.log('Search Promotions:', result.success ? '✅ PASSED' : '❌ FAILED');
  
  if (result.success) {
    const promotions = result.data.data || result.data.promotions || result.data;
    console.log('Search results found:', Array.isArray(promotions) ? promotions.length : 0);
    console.log('Search query: summer');
  } else {
    console.log('Error:', result.error);
  }
}

async function testGetActivePromotions() {
  console.log('\n🎯 Testing Get Active Promotions...');
  const result = await makeRequest('GET', '/promotions/active');
  console.log('Get Active Promotions:', result.success ? '✅ PASSED' : '❌ FAILED');
  
  if (result.success) {
    const promotions = result.data.data || result.data.promotions || result.data;
    console.log('Active promotions found:', Array.isArray(promotions) ? promotions.length : 0);
  } else {
    console.log('Error:', result.error);
  }
}

async function testGetPromotionStatistics() {
  console.log('\n📊 Testing Get Promotion Statistics...');
  const result = await makeRequest('GET', '/promotions/stats');
  console.log('Get Promotion Stats:', result.success ? '✅ PASSED' : '❌ FAILED');
  
  if (result.success) {
    console.log('Promotion statistics:', JSON.stringify(result.data, null, 2));
  } else {
    console.log('Error:', result.error);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Promotion API Tests...');
  
  await testHealthCheck();
  await testLogin();
  await testGetAllPromotions();
  await testCreatePromotion();
  await testGetPromotionById();
  await testUpdatePromotion();
  await testAddPromotionItems();
  await testGetPromotionItems();
  await testDeletePromotion();
  await testSearchPromotions();
  await testGetActivePromotions();
  await testGetPromotionStatistics();
  
  console.log('\n=====================================');
  console.log('🎉 Promotion API Tests Completed!');
  console.log('=====================================\n');
}

// Run the tests
runAllTests().catch(console.error); 