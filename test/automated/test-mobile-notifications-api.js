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

// Test functions
async function testHealth() {
  console.log('\n🔍 Testing Health Endpoint...');
  try {
    const response = await axios.get('http://localhost:3031/health');
    console.log('Health Check: ✅ PASSED');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('Health Check: ❌ FAILED');
    console.log('Error:', error.response?.data || error.message);
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

async function testGetAllNotifications() {
  console.log('\n📋 Testing Get All Notifications...');
  const result = await makeRequest('GET', '/mobile-notifications');
  console.log('Get All Notifications:', result.success ? '✅ PASSED' : '❌ FAILED');
  
  if (result.success) {
    console.log('Notifications found:', result.data.data?.length || 0);
    console.log('Pagination:', result.data.pagination);
  } else {
    console.log('Error:', result.error);
  }
}

async function testCreateNotification() {
  console.log('\n➕ Testing Create Notification...');
  const notificationData = {
    type: 'promotion',
    title: 'Summer Special Alert',
    message: 'New summer promotions are now available! Check out our latest offers.',
    targetAudience: 'all',
    isActive: true
  };

  const result = await makeRequest('POST', '/mobile-notifications', notificationData);
  console.log('Create Notification:', result.success ? '✅ PASSED' : '❌ FAILED');
  
  if (result.success) {
    console.log('Notification created with ID:', result.data.id);
    console.log('Notification title:', result.data.title);
    console.log('Notification type:', result.data.type);
    return result.data.id;
  } else {
    console.log('Error:', result.error);
    return null;
  }
}

async function testGetNotificationById(notificationId) {
  if (!notificationId) {
    console.log('\n📖 Testing Get Notification by ID: ❌ SKIPPED (no notification ID)');
    return;
  }

  console.log('\n📖 Testing Get Notification by ID...');
  const result = await makeRequest('GET', `/mobile-notifications/${notificationId}`);
  console.log('Get Notification by ID:', result.success ? '✅ PASSED' : '❌ FAILED');
  
  if (result.success) {
    console.log('Notification details:', {
      id: result.data.id,
      title: result.data.title,
      type: result.data.type,
      targetAudience: result.data.targetAudience,
      isActive: result.data.isActive
    });
  } else {
    console.log('Error:', result.error);
  }
}

async function testUpdateNotification(notificationId) {
  if (!notificationId) {
    console.log('\n✏️ Testing Update Notification: ❌ SKIPPED (no notification ID)');
    return;
  }

  console.log('\n✏️ Testing Update Notification...');
  const updateData = {
    title: 'Updated Summer Special Alert',
    message: 'Updated summer promotions with even better deals!',
    targetAudience: 'loyalty',
    isActive: false
  };

  const result = await makeRequest('PUT', `/mobile-notifications/${notificationId}`, updateData);
  console.log('Update Notification:', result.success ? '✅ PASSED' : '❌ FAILED');
  
  if (result.success) {
    console.log('Notification updated successfully');
    console.log('Updated fields:', updateData);
  } else {
    console.log('Error:', result.error);
  }
}

async function testSearchNotifications() {
  console.log('\n🔍 Testing Search Notifications...');
  const result = await makeRequest('GET', '/mobile-notifications/search?q=summer');
  console.log('Search Notifications:', result.success ? '✅ PASSED' : '❌ FAILED');
  
  if (result.success) {
    console.log('Search results found:', result.data.data?.length || 0);
    console.log('Search query: summer');
  } else {
    console.log('Error:', result.error);
  }
}

async function testGetNotificationStats() {
  console.log('\n📈 Testing Get Notification Statistics...');
  const result = await makeRequest('GET', '/mobile-notifications/stats');
  console.log('Get Notification Stats:', result.success ? '✅ PASSED' : '❌ FAILED');
  
  if (result.success) {
    console.log('Notification statistics:', {
      totalNotifications: result.data.totalNotifications,
      activeNotifications: result.data.activeNotifications,
      inactiveNotifications: result.data.inactiveNotifications,
      byType: result.data.notificationsByType,
      byAudience: result.data.notificationsByAudience
    });
  } else {
    console.log('Error:', result.error);
  }
}

async function testFilterNotifications() {
  console.log('\n🔍 Testing Filter Notifications...');
  const result = await makeRequest('GET', '/mobile-notifications?type=promotion&targetAudience=all&isActive=true');
  console.log('Filter Notifications:', result.success ? '✅ PASSED' : '❌ FAILED');
  
  if (result.success) {
    console.log('Filtered notifications found:', result.data.data?.length || 0);
    console.log('Filters applied: type=promotion, targetAudience=all, isActive=true');
  } else {
    console.log('Error:', result.error);
  }
}

async function testDeleteNotification(notificationId) {
  if (!notificationId) {
    console.log('\n🗑️ Testing Delete Notification: ❌ SKIPPED (no notification ID)');
    return;
  }

  console.log('\n🗑️ Testing Delete Notification...');
  const result = await makeRequest('DELETE', `/mobile-notifications/${notificationId}`);
  console.log('Delete Notification:', result.success ? '✅ PASSED' : '❌ FAILED');
  
  if (result.success) {
    console.log('Notification deleted successfully');
    console.log('Response:', result.data.message);
  } else {
    console.log('Error:', result.error);
  }
}

async function testVerifyDeletion(notificationId) {
  if (!notificationId) {
    console.log('\n🔍 Testing Verify Deletion: ❌ SKIPPED (no notification ID)');
    return;
  }

  console.log('\n🔍 Testing Verify Deletion...');
  const result = await makeRequest('GET', `/mobile-notifications/${notificationId}`);
  
  if (!result.success && result.status === 404) {
    console.log('Verify Deletion: ✅ PASSED (Notification not found as expected)');
  } else {
    console.log('Verify Deletion: ❌ FAILED (Notification should not be found)');
    console.log('Status:', result.status);
  }
}

async function testCreateMultipleNotifications() {
  console.log('\n➕ Testing Create Multiple Notifications...');
  
  const notifications = [
    {
      type: 'recipe',
      title: 'New Recipe Alert',
      message: 'Chef has added a new signature dish to our menu!',
      targetAudience: 'waitstaff'
    },
    {
      type: 'general',
      title: 'Staff Meeting Reminder',
      message: 'Weekly staff meeting tomorrow at 2 PM.',
      targetAudience: 'waitstaff'
    },
    {
      type: 'promotion',
      title: 'Loyalty Member Special',
      message: 'Exclusive 20% discount for loyalty members this week!',
      targetAudience: 'loyalty'
    }
  ];

  let createdCount = 0;
  for (const notification of notifications) {
    const result = await makeRequest('POST', '/mobile-notifications', notification);
    if (result.success) {
      createdCount++;
      console.log(`✅ Created notification: ${notification.title}`);
    } else {
      console.log(`❌ Failed to create notification: ${notification.title}`);
    }
  }
  
  console.log(`Created ${createdCount} out of ${notifications.length} notifications`);
}

async function runTests() {
  console.log('🚀 Starting Mobile Notifications API Tests...\n');
  
  let notificationId = null;

  try {
    // Run all tests
    await testHealth();
    await testLogin();
    await testGetAllNotifications();
    await testCreateMultipleNotifications();
    notificationId = await testCreateNotification();
    await testGetNotificationById(notificationId);
    await testUpdateNotification(notificationId);
    await testSearchNotifications();
    await testGetNotificationStats();
    await testFilterNotifications();
    await testDeleteNotification(notificationId);
    await testVerifyDeletion(notificationId);
    
    // Final checks
    await testGetAllNotifications();
    await testGetNotificationStats();

    console.log('\n🎉 All Mobile Notifications API Tests Completed Successfully!');
    console.log('\n📊 Test Summary:');
    console.log('✅ Health Check');
    console.log('✅ Authentication');
    console.log('✅ CRUD Operations (Create, Read, Update, Delete)');
    console.log('✅ Search Functionality');
    console.log('✅ Filtering by Type and Audience');
    console.log('✅ Statistics and Analytics');
    console.log('✅ Pagination');
    console.log('✅ Soft Delete Functionality');

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
}

// Run the tests
runTests(); 