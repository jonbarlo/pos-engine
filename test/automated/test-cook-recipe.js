const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3031/api';

async function testCookRecipe() {
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

    // Test 1: Get smart suggestions to find a recipe with suggestions
    console.log('\n🧪 Step 1: Getting Smart Suggestions...');
    let recipeToCook = null;
    try {
      const suggestionsResponse = await axios.get(`${BASE_URL}/smart/smart-suggestions?includeExpiringItems=true&includeUnderperformingItems=true`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('🔍 Smart suggestions response:', JSON.stringify(suggestionsResponse.data, null, 2));
      
      if (suggestionsResponse.data.success && suggestionsResponse.data.suggestions.length > 0) {
        recipeToCook = suggestionsResponse.data.suggestions[0];
        console.log('✅ Found recipe with smart suggestions:', recipeToCook.recipeName);
        console.log('   Recipe ID:', recipeToCook.recipeId);
        console.log('   Suggested items:', recipeToCook.suggestedItems.length);
      } else {
        console.log('❌ No smart suggestions available - cannot test cook flow');
        console.log('   The cook-recipe endpoint only works with recipes that have suggestions');
        console.log('   (recipes with expiring or underperforming items to consume)');
        return;
      }
    } catch (error) {
      console.log('❌ Smart suggestions error:', error.response?.status, error.response?.data);
      return;
    }

    // Test 2: Cook the recipe successfully using recipeId
    console.log('\n🧪 Step 2: Cooking Recipe Successfully...');
    console.log('   Using recipeId:', recipeToCook.recipeId);
    try {
      const cookResponse = await axios.post(`${BASE_URL}/smart/cook-recipe`, {
        recipeId: recipeToCook.recipeId,
        quantity: 1,
        promotionType: 'chef_special',
        promotionName: 'Kitchen Special: Truffle Pizza',
        promotionDescription: 'Freshly prepared luxury pizza with premium ingredients',
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
        console.log('✅ Recipe cooked successfully! (200 status)');
        console.log('   Recipe:', cookResponse.data.cookingResult.recipeName);
        console.log('   Quantity:', cookResponse.data.cookingResult.quantity);
        console.log('   Cost Savings:', cookResponse.data.cookingResult.costSavings);
        console.log('   Waste Reduction:', cookResponse.data.cookingResult.wasteReduction);
        console.log('   Consumed Items:', cookResponse.data.cookingResult.consumedItems.length);
        
        // Validate that cooking actually worked
        if (cookResponse.data.cookingResult.costSavings === 0 && cookResponse.data.cookingResult.wasteReduction === 0) {
          console.log('❌ COOKING LOGIC ERROR: Cost savings and waste reduction are both 0');
          console.log('   This indicates the cooking service is not properly calculating savings');
          console.log('   Expected: Non-zero values since items were consumed');
        } else {
          console.log('✅ Cooking logic working correctly');
        }
        
        if (cookResponse.data.createdPromotion) {
          console.log('   🎉 Promotion Created:', cookResponse.data.createdPromotion.name);
          console.log('   📊 Promotion Details:');
          console.log('      - Type:', cookResponse.data.createdPromotion.type);
          console.log('      - Discount:', cookResponse.data.createdPromotion.discountValue + '%');
          console.log('      - Total Quantity:', cookResponse.data.createdPromotion.totalQuantity);
          console.log('      - Used Quantity:', cookResponse.data.createdPromotion.usedQuantity);
          console.log('      - Remaining:', cookResponse.data.createdPromotion.totalQuantity - cookResponse.data.createdPromotion.usedQuantity);
        } else {
          console.log('   ⚠️  No promotion created (waste reduction = 0)');
        }
      } else {
        console.log('❌ Cooking failed:', cookResponse.data);
      }
    } catch (error) {
      console.log('❌ Cook recipe failed:', error.response?.data?.error || error.message);
      console.log('   Status:', error.response?.status);
    }

    // Test 3: Test invalid recipe ID
    console.log('\n🧪 Step 3: Testing Invalid Recipe ID...');
    try {
      const invalidResponse = await axios.post(`${BASE_URL}/smart/cook-recipe`, {
        recipeId: 50,
        quantity: 1
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('❌ Invalid recipe should have failed:', invalidResponse.data);
    } catch (error) {
      console.log('✅ Invalid recipe test failed as expected');
      console.log('   Error:', error.response?.data?.error || error.message);
      console.log('   Status Code:', error.response?.status);
    }

    console.log('\n🎉 Cook Recipe Testing Complete!');

  } catch (error) {
    console.log('❌ Authentication error:', error.response?.data || error.message);
  }
}

testCookRecipe().catch(console.error); 