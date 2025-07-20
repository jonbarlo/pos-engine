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

async function testGetRecipes() {
  console.log('\n📋 Testing Get All Recipes...');
  const result = await makeRequest('GET', '/recipes');
  console.log('Get Recipes:', result.success ? '✅ PASSED' : '❌ FAILED');
  
  if (result.success) {
    console.log('Recipes found:', result.data.recipes?.length || 0);
    console.log('Pagination:', result.data.pagination);
  } else {
    console.log('Error:', result.error);
  }
}

async function testCreateRecipe() {
  console.log('\n➕ Testing Create Recipe...');
  const recipeData = {
    name: 'Spaghetti Carbonara',
    description: 'Classic Italian pasta dish with eggs, cheese, and pancetta',
    ingredients: '400g spaghetti, 200g pancetta, 4 large eggs, 100g Pecorino Romano cheese, 100g Parmigiano-Reggiano, Black pepper, Salt',
    instructions: '1. Cook spaghetti in salted water until al dente\n2. Meanwhile, cook pancetta until crispy\n3. Beat eggs with grated cheese and pepper\n4. Drain pasta, add to pancetta pan\n5. Remove from heat, add egg mixture and toss quickly\n6. Serve immediately with extra cheese and pepper',
    prepTime: 10,
    cookTime: 15,
    difficulty: 'medium',
    imageUrl: 'https://example.com/carbonara.jpg'
  };

  const result = await makeRequest('POST', '/recipes', recipeData);
  console.log('Create Recipe:', result.success ? '✅ PASSED' : '❌ FAILED');
  
  if (result.success) {
    console.log('Full response:', JSON.stringify(result.data, null, 2));
    const recipeId = result.data.data?.id || result.data.recipe?.id || result.data.id;
    console.log('Recipe created with ID:', recipeId);
    console.log('Recipe name:', result.data.data?.name || result.data.recipe?.name || result.data.name);
    return recipeId;
  } else {
    console.log('Error:', result.error);
    return null;
  }
}

async function testGetRecipeById(recipeId) {
  if (!recipeId) {
    console.log('\n📖 Testing Get Recipe by ID: ❌ SKIPPED (no recipe ID)');
    return;
  }

  console.log('\n📖 Testing Get Recipe by ID...');
  const result = await makeRequest('GET', `/recipes/${recipeId}`);
  console.log('Get Recipe by ID:', result.success ? '✅ PASSED' : '❌ FAILED');
  
  if (result.success) {
    const recipe = result.data.data || result.data.recipe || result.data;
    console.log('Recipe details:', {
      id: recipe.id,
      name: recipe.name,
      difficulty: recipe.difficulty,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime
    });
  } else {
    console.log('Error:', result.error);
  }
}

async function testUpdateRecipe(recipeId) {
  if (!recipeId) {
    console.log('\n✏️ Testing Update Recipe: ❌ SKIPPED (no recipe ID)');
    return;
  }

  console.log('\n✏️ Testing Update Recipe...');
  const updateData = {
    description: 'Updated description for Spaghetti Carbonara - now with extra flavor!',
    prepTime: 12,
    difficulty: 'hard'
  };

  const result = await makeRequest('PUT', `/recipes/${recipeId}`, updateData);
  console.log('Update Recipe:', result.success ? '✅ PASSED' : '❌ FAILED');
  
  if (result.success) {
    console.log('Recipe updated successfully');
    console.log('Updated fields:', updateData);
  } else {
    console.log('Error:', result.error);
  }
}

async function testSearchRecipes() {
  console.log('\n🔍 Testing Search Recipes...');
  const result = await makeRequest('GET', '/recipes/search?q=pasta');
  console.log('Search Recipes:', result.success ? '✅ PASSED' : '❌ FAILED');
  
  if (result.success) {
    console.log('Search results found:', result.data.recipes?.length || 0);
    console.log('Search query: pasta');
  } else {
    console.log('Error:', result.error);
  }
}

async function testGetRecipesByDifficulty() {
  console.log('\n📊 Testing Get Recipes by Difficulty...');
  const result = await makeRequest('GET', '/recipes/difficulty/medium');
  console.log('Get Recipes by Difficulty:', result.success ? '✅ PASSED' : '❌ FAILED');
  
  if (result.success) {
    console.log('Medium difficulty recipes found:', result.data.recipes?.length || 0);
  } else {
    console.log('Error:', result.error);
  }
}

async function testGetRecipeStats() {
  console.log('\n📈 Testing Get Recipe Statistics...');
  const result = await makeRequest('GET', '/recipes/stats');
  console.log('Get Recipe Stats:', result.success ? '✅ PASSED' : '❌ FAILED');
  
  if (result.success) {
    console.log('Recipe statistics:', result.data.stats);
  } else {
    console.log('Error:', result.error);
  }
}

async function testCreateRecipeSuggestion(recipeId) {
  if (!recipeId) {
    console.log('\n💡 Testing Create Recipe Suggestion: ❌ SKIPPED (no recipe ID)');
    return;
  }

  console.log('\n💡 Testing Create Recipe Suggestion...');
  const suggestionData = {
    itemId: 1, // Assuming item ID 1 exists
    recipeId: recipeId,
    aiGenerated: true,
    confidence: 0.85,
    suggestedPrice: 18.99
  };

  const result = await makeRequest('POST', '/recipes/suggestions', suggestionData);
  console.log('Create Recipe Suggestion:', result.success ? '✅ PASSED' : '❌ FAILED');
  
  if (result.success) {
    console.log('Full response:', JSON.stringify(result.data, null, 2));
    const suggestion = result.data.data || result.data.suggestion || result.data;
    console.log('Suggestion created with ID:', suggestion?.id);
    console.log('Confidence:', suggestion?.confidence);
  } else {
    console.log('Error:', result.error);
  }
}

async function testGetRecipeSuggestions() {
  console.log('\n💡 Testing Get Recipe Suggestions...');
  const result = await makeRequest('GET', '/recipes/suggestions/1'); // For item ID 1
  console.log('Get Recipe Suggestions:', result.success ? '✅ PASSED' : '❌ FAILED');
  
  if (result.success) {
    console.log('Suggestions found:', result.data.suggestions?.length || 0);
  } else {
    console.log('Error:', result.error);
  }
}

async function testDeleteRecipe(recipeId) {
  if (!recipeId) {
    console.log('\n🗑️ Testing Delete Recipe: ❌ SKIPPED (no recipe ID)');
    return;
  }

  console.log('\n🗑️ Testing Delete Recipe...');
  const result = await makeRequest('DELETE', `/recipes/${recipeId}`);
  console.log('Delete Recipe:', result.success ? '✅ PASSED' : '❌ FAILED');
  
  if (result.success) {
    console.log('Recipe deleted successfully');
  } else {
    console.log('Error:', result.error);
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Recipe API Tests...');
  console.log('=====================================');

  // Test health endpoint first
  await testHealth();

  // Test authentication
  await testLogin();

  if (!authToken) {
    console.log('\n❌ Authentication failed. Stopping tests.');
    return;
  }

  // Test recipe endpoints
  await testGetRecipes();
  
  const recipeId = await testCreateRecipe();
  
  if (recipeId) {
    await testGetRecipeById(recipeId);
    await testUpdateRecipe(recipeId);
    await testCreateRecipeSuggestion(recipeId);
    await testDeleteRecipe(recipeId);
  }

  await testSearchRecipes();
  await testGetRecipesByDifficulty();
  await testGetRecipeStats();
  await testGetRecipeSuggestions();

  console.log('\n=====================================');
  console.log('🎉 Recipe API Tests Completed!');
}

// Run the tests
runTests().catch(error => {
  console.error('Test runner error:', error);
}); 