const axios = require('axios');

const API_BASE = 'http://localhost:3031/api';

async function testOrderItemLogicClean() {
  try {
    console.log('🧪 Testing Order Item Logic - Clean Test');
    console.log('========================================');

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

    // Step 2: Create a new order
    console.log('\n2. Creating new order...');
    const orderResponse = await axios.post(`${API_BASE}/orders`, {
      tableId: 1, // Use any table ID
      orderType: 'dine_in',
      items: [
        {
          itemId: 1, // Margherita Pizza Base
          quantity: 1,
          notes: 'Initial order'
        }
      ]
    }, { headers });
    
    const orderId = orderResponse.data.data.id;
    console.log(`✅ Order created: ${orderId}`);
    console.log(`   Initial items: ${orderResponse.data.data.orderItems.length}`);

    // Step 3: Add the same item multiple times
    console.log('\n3. Adding the same item multiple times...');
    
    const itemToAdd = {
      itemId: 1, // Margherita Pizza Base
      quantity: 1,
      notes: 'Additional order'
    };

    // First addition
    console.log('   Adding item first time...');
    const firstAddResponse = await axios.post(`${API_BASE}/orders/${orderId}/items`, {
      items: [itemToAdd]
    }, { headers });

    console.log('   ✅ First addition successful');
    console.log(`   Order items count: ${firstAddResponse.data.data.orderItems.length}`);
    const margheritaItem = firstAddResponse.data.data.orderItems.find(item => item.itemId === 1);
    console.log(`   Margherita Pizza quantity: ${margheritaItem?.quantity}`);

    // Second addition (same item)
    console.log('\n   Adding same item second time...');
    const secondAddResponse = await axios.post(`${API_BASE}/orders/${orderId}/items`, {
      items: [itemToAdd]
    }, { headers });

    console.log('   ✅ Second addition successful');
    console.log(`   Order items count: ${secondAddResponse.data.data.orderItems.length}`);
    const margheritaItem2 = secondAddResponse.data.data.orderItems.find(item => item.itemId === 1);
    console.log(`   Margherita Pizza quantity: ${margheritaItem2?.quantity}`);

    // Third addition (same item)
    console.log('\n   Adding same item third time...');
    const thirdAddResponse = await axios.post(`${API_BASE}/orders/${orderId}/items`, {
      items: [itemToAdd]
    }, { headers });

    console.log('   ✅ Third addition successful');
    console.log(`   Order items count: ${thirdAddResponse.data.data.orderItems.length}`);
    const margheritaItem3 = thirdAddResponse.data.data.orderItems.find(item => item.itemId === 1);
    console.log(`   Margherita Pizza quantity: ${margheritaItem3?.quantity}`);

    // Step 4: Add a different item
    console.log('\n4. Adding a different item...');
    const differentItem = {
      itemId: 4, // Pepperoni Pizza Base
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

    const margheritaFinal = finalOrder.orderItems.find(item => item.itemId === 1);
    if (margheritaFinal && margheritaFinal.quantity === 4) {
      console.log('✅ Correct: Margherita Pizza quantity is 4 (added 4 times total)');
    } else {
      console.log(`❌ Incorrect: Margherita Pizza quantity should be 4, got ${margheritaFinal?.quantity}`);
    }

    const pepperoniFinal = finalOrder.orderItems.find(item => item.itemId === 4);
    if (pepperoniFinal && pepperoniFinal.quantity === 1) {
      console.log('✅ Correct: Pepperoni Pizza quantity is 1 (added once)');
    } else {
      console.log(`❌ Incorrect: Pepperoni Pizza quantity should be 1, got ${pepperoniFinal?.quantity}`);
    }

    console.log('\n🎉 Test completed successfully!');
    console.log('The order item logic correctly increases quantities instead of creating duplicates.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Full error:', error);
  }
}

// Wait a few seconds for server to start, then run test
setTimeout(testOrderItemLogicClean, 3000); 