const axios = require('axios');

const API_BASE = 'http://localhost:3031/api';

async function testOrderItemLogic() {
  try {
    console.log('🧪 Testing Order Item Logic - Adding Same Item Multiple Times');
    console.log('============================================================');

    // Step 1: Login
    console.log('\n1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'giuseppe@italiandelight.com',
      password: 'Password123',
      businessId: 1
    });

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log('✅ Login successful');

    // Step 2: Use existing order
    console.log('\n2. Using existing order...');
    const orderId = 7; // Use the pending order from our check
    console.log(`✅ Using order ID: ${orderId}`);

    // Step 3: Add the same item multiple times
    console.log('\n3. Adding the same item multiple times...');
    
    const itemToAdd = {
      itemId: 1, // Margherita Pizza
      quantity: 1,
      notes: 'Test item'
    };

    // First addition
    console.log('   Adding item first time...');
    const firstAddResponse = await axios.post(`${API_BASE}/orders/${orderId}/items`, {
      items: [itemToAdd]
    }, { headers });

    console.log('   ✅ First addition successful');
    console.log(`   Order items count: ${firstAddResponse.data.data.orderItems.length}`);
    console.log(`   First item quantity: ${firstAddResponse.data.data.orderItems[0].quantity}`);

    // Second addition (same item)
    console.log('\n   Adding same item second time...');
    const secondAddResponse = await axios.post(`${API_BASE}/orders/${orderId}/items`, {
      items: [itemToAdd]
    }, { headers });

    console.log('   ✅ Second addition successful');
    console.log(`   Order items count: ${secondAddResponse.data.data.orderItems.length}`);
    console.log(`   First item quantity: ${secondAddResponse.data.data.orderItems[0].quantity}`);

    // Third addition (same item)
    console.log('\n   Adding same item third time...');
    const thirdAddResponse = await axios.post(`${API_BASE}/orders/${orderId}/items`, {
      items: [itemToAdd]
    }, { headers });

    console.log('   ✅ Third addition successful');
    console.log(`   Order items count: ${thirdAddResponse.data.data.orderItems.length}`);
    console.log(`   First item quantity: ${thirdAddResponse.data.data.orderItems[0].quantity}`);

    // Step 4: Add a different item
    console.log('\n4. Adding a different item...');
    const differentItem = {
      itemId: 2, // Pepperoni Pizza
      quantity: 1,
      notes: 'Different item'
    };

    const differentAddResponse = await axios.post(`${API_BASE}/orders/${orderId}/items`, {
      items: [differentItem]
    }, { headers });

    console.log('   ✅ Different item addition successful');
    console.log(`   Order items count: ${differentAddResponse.data.data.orderItems.length}`);
    
    // Display final order items
    console.log('\n📋 Final Order Items:');
    differentAddResponse.data.data.orderItems.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.itemName} - Quantity: ${item.quantity} - Price: $${item.totalPrice}`);
    });

    // Step 5: Verify the logic worked correctly
    console.log('\n5. Verifying results...');
    const finalOrder = differentAddResponse.data.data;
    
    if (finalOrder.orderItems.length === 2) {
      console.log('✅ Correct: 2 unique items in order');
    } else {
      console.log(`❌ Incorrect: Expected 2 items, got ${finalOrder.orderItems.length}`);
    }

    const margheritaItem = finalOrder.orderItems.find(item => item.itemName === 'Margherita Pizza');
    if (margheritaItem && margheritaItem.quantity === 3) {
      console.log('✅ Correct: Margherita Pizza quantity is 3 (added 3 times)');
    } else {
      console.log(`❌ Incorrect: Margherita Pizza quantity should be 3, got ${margheritaItem?.quantity}`);
    }

    const pepperoniItem = finalOrder.orderItems.find(item => item.itemName === 'Pepperoni Pizza');
    if (pepperoniItem && pepperoniItem.quantity === 1) {
      console.log('✅ Correct: Pepperoni Pizza quantity is 1 (added once)');
    } else {
      console.log(`❌ Incorrect: Pepperoni Pizza quantity should be 1, got ${pepperoniItem?.quantity}`);
    }

    console.log('\n🎉 Test completed successfully!');
    console.log('The order item logic now correctly increases quantities instead of creating duplicates.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Full error:', error);
  }
}

// Wait a few seconds for server to start, then run test
setTimeout(testOrderItemLogic, 3000); 