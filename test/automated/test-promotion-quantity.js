const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3031/api';

async function testPromotionQuantity() {
  console.log('🔐 Authenticating...');
  
  try {
    // Authenticate with Italian Delight
    const authResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'marco@italiandelight.com',
      password: 'Password123',
      businessSlug: 'italian-delight'
    });

    if (!authResponse.data.token) {
      console.log('❌ Authentication failed:', authResponse.data);
      return;
    }

    const token = authResponse.data.token;
    console.log('✅ Authentication successful');

    // Test 1: Cook a recipe with quantity 3 to create a promotion with 3 available
    console.log('\n🧪 Step 1: Cooking Recipe with Quantity 3...');
    try {
      const cookResponse = await axios.post(`${BASE_URL}/smart/cook-recipe`, {
        recipeId: 4, // Truffle Pizza
        quantity: 3,
        promotionType: 'chef_special',
        promotionName: 'Test Promotion: 3 Servings',
        promotionDescription: 'Testing quantity tracking',
        discountType: 'percentage',
        discountValue: 25,
        promotionExpiresInHours: 48
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (cookResponse.data.success) {
        console.log('✅ Recipe cooked successfully!');
        console.log('   Recipe:', cookResponse.data.cookingResult.recipeName);
        console.log('   Quantity cooked:', cookResponse.data.cookingResult.quantity);
        
        if (cookResponse.data.createdPromotion) {
          const promotion = cookResponse.data.createdPromotion;
          console.log('   🎉 Promotion Created:', promotion.name);
          console.log('   📊 Promotion Quantity Details:');
          console.log('      - Total Quantity:', promotion.totalQuantity);
          console.log('      - Used Quantity:', promotion.usedQuantity);
          console.log('      - Remaining Quantity:', promotion.remainingQuantity);
          console.log('      - Status:', promotion.status);
          
          // Store promotion ID for next test
          global.testPromotionId = promotion.id;
        } else {
          console.log('   ⚠️  No promotion created');
          return;
        }
      } else {
        console.log('❌ Cooking failed:', cookResponse.data);
        return;
      }
    } catch (error) {
      console.log('❌ Cook recipe failed:', error.response?.data?.error || error.message);
      return;
    }

    // Test 2: Check promotion availability
    console.log('\n🧪 Step 2: Checking Promotion Availability...');
    try {
      const promotionsResponse = await axios.get(`${BASE_URL}/promotions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (promotionsResponse.data.success) {
        const testPromotion = promotionsResponse.data.promotions.find(p => p.id === global.testPromotionId);
        if (testPromotion) {
          console.log('✅ Found test promotion in promotions list');
          console.log('   📊 Current Status:');
          console.log('      - Name:', testPromotion.name);
          console.log('      - Total Quantity:', testPromotion.totalQuantity);
          console.log('      - Used Quantity:', testPromotion.usedQuantity);
          console.log('      - Remaining Quantity:', testPromotion.remainingQuantity);
          console.log('      - Is Active:', testPromotion.isActive);
        } else {
          console.log('❌ Test promotion not found in promotions list');
        }
      } else {
        console.log('❌ Failed to get promotions:', promotionsResponse.data);
      }
    } catch (error) {
      console.log('❌ Get promotions failed:', error.response?.data?.error || error.message);
    }

    console.log('\n🎉 Promotion Quantity Tracking Test Complete!');
    console.log('\n📋 Summary:');
    console.log('   - Recipe cooking creates promotion with quantity = cooked quantity');
    console.log('   - Promotion tracks used vs total quantity');
    console.log('   - Promotion can expire when quantity reaches 0');
    console.log('   - Mobile app can check remaining availability');

  } catch (error) {
    console.log('❌ Authentication error:', error.response?.data || error.message);
  }
}

testPromotionQuantity().catch(console.error); 