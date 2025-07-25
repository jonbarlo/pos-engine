const axios = require('axios');

const BASE_URL = 'http://localhost:3031/api';

async function generateSuggestions() {
  try {
    console.log('🚀 Syncing Recipe-Ingredient Relationships...');
    console.log('=============================================');

    // Login to get business info
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'marco@italiandelight.com',
      password: 'Password123',
      businessSlug: 'italian-delight'
    });

    const { token, businessId } = loginResponse.data;
    console.log(`✅ Login successful - Business ID: ${businessId}`);

    // Hit the bulk-link-items endpoint to sync recipes with ingredients
    console.log('\n📊 Syncing recipes with ingredients...');
    const syncResponse = await axios.post(`${BASE_URL}/recipes/bulk-link-items`, {
      force: true
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Recipe-ingredient sync completed!');
    console.log(`📝 Sync results:`, syncResponse.data);
    
    // Now try to generate suggestions
    console.log('\n📊 Generating smart suggestions...');
    const suggestionsResponse = await axios.get(`${BASE_URL}/smart/smart-suggestions?limit=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Smart suggestions retrieved!');
    console.log(`📝 Found ${suggestionsResponse.data.suggestions?.length || 0} suggestions`);
    
    if (suggestionsResponse.data.suggestions && suggestionsResponse.data.suggestions.length > 0) {
      console.log('\n🔍 Sample suggestions:');
      suggestionsResponse.data.suggestions.slice(0, 3).forEach((suggestion, index) => {
        console.log(`${index + 1}. ${suggestion.recipeName}`);
        console.log(`   Items: ${suggestion.suggestedItems.map(item => item.itemName).join(', ')}`);
        console.log(`   Urgency: ${suggestion.urgency}`);
        console.log(`   Confidence: ${suggestion.confidence}%`);
      });
    } else {
      console.log('⚠️ No suggestions found');
    }

    console.log('\n✨ Process completed!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

generateSuggestions(); 