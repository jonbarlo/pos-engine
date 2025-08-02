

import { QueryInterface, QueryTypes } from 'sequelize';

// Nutritional database for ingredients (per 100g/serving)
const ingredientNutrition: { [key: string]: { calories: number; protein: number; carbs: number; fat: number } } = {
  // Italian Ingredients
  'wagyu beef (premium)': { calories: 250, protein: 26, carbs: 0, fat: 17 },
  'truffle oil (underperforming)': { calories: 884, protein: 0, carbs: 0, fat: 100 },
  'premium black truffle pasta': { calories: 350, protein: 12, carbs: 70, fat: 2 },
  'premium lobster ravioli': { calories: 280, protein: 18, carbs: 35, fat: 8 },
  'fresh basil': { calories: 22, protein: 3, carbs: 2, fat: 0 },
  'cherry tomatoes': { calories: 18, protein: 1, carbs: 4, fat: 0 },
  'premium saffron (underperforming)': { calories: 310, protein: 11, carbs: 65, fat: 6 },
  
  // Sushi Ingredients
  'bluefin tuna otoro': { calories: 144, protein: 23, carbs: 0, fat: 5 },
  'hokkaido uni': { calories: 125, protein: 16, carbs: 3, fat: 5 },
  'soft shell crab': { calories: 87, protein: 18, carbs: 0, fat: 1 },
  'nori sheets': { calories: 35, protein: 6, carbs: 5, fat: 0 },
  'sushi rice': { calories: 130, protein: 3, carbs: 28, fat: 0 },
  
  // Coffee Ingredients
  'ethiopian yirgacheffe beans': { calories: 2, protein: 0, carbs: 0, fat: 0 },
  'colombian supremo beans': { calories: 2, protein: 0, carbs: 0, fat: 0 },
  'matcha powder': { calories: 324, protein: 30, carbs: 39, fat: 5 },
  'chai concentrate': { calories: 50, protein: 2, carbs: 10, fat: 1 },
  'oat milk (expiring soon)': { calories: 80, protein: 3, carbs: 16, fat: 1.5 },
  'almond milk': { calories: 17, protein: 0.6, carbs: 0.6, fat: 1.1 }
};

// Function to calculate nutrition based on ingredients
function calculateNutrition(ingredients: string[], servings: number = 1): string {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  for (const ingredient of ingredients) {
    const nutritionData = ingredientNutrition[ingredient.toLowerCase()];
    if (nutritionData) {
      // Use typical serving sizes - adjust based on ingredient type
      let servingMultiplier = 1;
      if (ingredient.toLowerCase().includes('oil')) servingMultiplier = 0.15; // 15g (1 tbsp)
      else if (ingredient.toLowerCase().includes('pasta') || ingredient.toLowerCase().includes('ravioli')) servingMultiplier = 1.5; // 150g
      else if (ingredient.toLowerCase().includes('beef') || ingredient.toLowerCase().includes('tuna')) servingMultiplier = 1.2; // 120g
      else if (ingredient.toLowerCase().includes('herb') || ingredient.toLowerCase().includes('basil')) servingMultiplier = 0.1; // 10g
      else if (ingredient.toLowerCase().includes('tomato')) servingMultiplier = 0.8; // 80g
      else if (ingredient.toLowerCase().includes('milk')) servingMultiplier = 2.4; // 240ml (1 cup)
      else if (ingredient.toLowerCase().includes('matcha')) servingMultiplier = 0.02; // 2g (1 tsp)
      else if (ingredient.toLowerCase().includes('coffee') || ingredient.toLowerCase().includes('beans')) servingMultiplier = 0.18; // 18g
      
      totalCalories += nutritionData.calories * servingMultiplier;
      totalProtein += nutritionData.protein * servingMultiplier;
      totalCarbs += nutritionData.carbs * servingMultiplier;
      totalFat += nutritionData.fat * servingMultiplier;
    }
  }

  // Calculate per serving
  const caloriesPerServing = Math.round(totalCalories / servings);
  const proteinPerServing = Math.round(totalProtein / servings);
  const carbsPerServing = Math.round(totalCarbs / servings);
  const fatPerServing = Math.round(totalFat / servings);

  return `Calories: ${caloriesPerServing}, Protein: ${proteinPerServing}g, Carbs: ${carbsPerServing}g, Fat: ${fatPerServing}g`;
}

export async function up(queryInterface: QueryInterface): Promise<void> {
  console.log('🍳 Starting comprehensive recipes seeder...');

  // Get business IDs
  const businesses = await queryInterface.sequelize.query(
    'SELECT id, slug FROM businesses WHERE slug IN (?)',
    { type: QueryTypes.SELECT, replacements: ['italian-delight'] }
  ) as any[];

  const businessMap: { [slug: string]: number } = {};
  for (const business of businesses) {
    businessMap[business.slug] = business.id;
  }

  console.log(`🏢 Found ${businesses.length} businesses:`, businessMap);

  // Get all existing items for mapping
  const allItems = await queryInterface.sequelize.query(
    'SELECT id, businessId, name, sku, category FROM items',
    { type: QueryTypes.SELECT }
  ) as any[];

  console.log(`📦 Found ${allItems.length} existing items in database`);

  // Create item lookup maps by business
  const itemMaps: { [businessId: number]: { [name: string]: number } } = {};
  for (const item of allItems) {
    if (!item.businessId) continue;
    const businessId = item.businessId as number;
    if (!itemMaps[businessId]) {
      itemMaps[businessId] = {};
    }
    if (item.name) {
      itemMaps[businessId][(item.name as string).toLowerCase()] = item.id;
    }
  }

  console.log('📋 Item maps created:', Object.keys(itemMaps).map((bizId: string) => {
    const businessId = parseInt(bizId);
    const itemMap = itemMaps[businessId];
    return `${bizId}: ${itemMap ? Object.keys(itemMap).length : 0} items`;
  }));

  // ===== PHASE 8: RECIPES AND PROMOTIONS =====

  // 20. Recipes
  console.log('📖 Creating recipes...');
  const recipeData = [
    {
      businessSlug: 'italian-delight',
      name: 'Margherita Pizza',
      description: 'Classic Italian pizza with fresh mozzarella, tomato sauce, and basil',
      ingredients: 'Fresh mozzarella, San Marzano tomatoes, fresh basil, extra virgin olive oil, 00 flour',
      instructions: '1. Prepare pizza dough\n2. Spread tomato sauce\n3. Add fresh mozzarella\n4. Bake at 450°F for 12-15 minutes\n5. Garnish with fresh basil',
      servings: 4,
      prepTime: 30,
      cookTime: 15,
      difficulty: 'medium',
      cuisine: 'Italian',
      category: 'Pizza',
      tags: ['pizza', 'vegetarian', 'classic'],
      nutritionInfo: calculateNutrition(['fresh basil', 'cherry tomatoes'], 4)
    },
    {
      businessSlug: 'italian-delight',
      name: 'Spaghetti Carbonara',
      description: 'Traditional Roman pasta with eggs, cheese, pancetta, and black pepper',
      ingredients: '00 flour, fresh mozzarella, extra virgin olive oil, eggs, pancetta, black pepper',
      instructions: '1. Cook spaghetti al dente\n2. Cook pancetta until crispy\n3. Beat eggs with cheese\n4. Combine pasta with egg mixture\n5. Add black pepper to taste',
      servings: 2,
      prepTime: 15,
      cookTime: 20,
      difficulty: 'medium',
      cuisine: 'Italian',
      category: 'Pasta',
      tags: ['pasta', 'carbonara', 'traditional'],
      nutritionInfo: calculateNutrition(['premium black truffle pasta'], 2)
    }
  ];

  // Check if recipes already exist
  const existingRecipes = await queryInterface.sequelize.query(
    'SELECT businessId, name FROM recipes WHERE businessId = ?',
    { type: QueryTypes.SELECT, replacements: [businessMap['italian-delight']] }
  ) as any[];

  console.log('🔍 Existing recipes found:', existingRecipes);

  const existingRecipeNames = existingRecipes.map((r: any) => r.name);
  const newRecipes = recipeData.filter(r => !existingRecipeNames.includes(r.name));
  
  if (newRecipes.length > 0) {
    try {
      console.log(`🔍 Attempting to insert ${newRecipes.length} recipes...`);
      const recipesToInsert = newRecipes.map(r => ({
        businessId: businessMap[r.businessSlug],
        name: r.name,
        description: r.description,
        ingredients: r.ingredients,
        instructions: r.instructions,
        servings: r.servings,
        prepTime: r.prepTime,
        cookTime: r.cookTime,
        difficulty: r.difficulty,
        cuisine: r.cuisine,
        category: r.category,
        nutritionInfo: r.nutritionInfo,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      
      console.log('🔍 Recipe data to insert:', JSON.stringify(recipesToInsert, null, 2));
      
      await queryInterface.bulkInsert('recipes', recipesToInsert);
      console.log(`✅ Created ${newRecipes.length} new recipes`);
    } catch (error: any) {
      console.error('❌ Error inserting recipes:', error);
      console.error('❌ Error details:', error.message);
      if (error.parent) {
        console.error('❌ Parent error:', error.parent.message);
        if (error.parent.errors) {
          console.error('❌ Child errors:', error.parent.errors.map((e: any) => e.message));
        }
      }
      if (error.sql) {
        console.error('❌ SQL that failed:', error.sql);
      }
      throw error;
    }
  } else {
    console.log('✅ Recipes already exist, skipping creation');
  }

  // Query recipes by name and business for IDs
  const recipes: { [key: string]: number } = {};
  for (const recipe of recipeData) {
    const [rec] = await queryInterface.sequelize.query(
      'SELECT id FROM recipes WHERE businessId = ? AND name = ?',
      { type: QueryTypes.SELECT, replacements: [businessMap[recipe.businessSlug], recipe.name] }
    ) as any[];
    recipes[`${recipe.businessSlug}-${recipe.name}`] = rec.id;
  }
  console.log('✅ Recipes created:', recipes);

  // 21. Recipe Ingredients
  console.log('🥘 Creating recipe ingredients...');
  const recipeIngredientData = [
    // Margherita Pizza ingredients
    { recipeKey: 'italian-delight-Margherita Pizza', itemName: 'Fresh Mozzarella', quantity: 200, unit: 'g', notes: 'Fresh mozzarella, torn into pieces' },
    { recipeKey: 'italian-delight-Margherita Pizza', itemName: 'San Marzano Tomatoes', quantity: 150, unit: 'g', notes: 'Crushed tomatoes for sauce' },
    { recipeKey: 'italian-delight-Margherita Pizza', itemName: 'Fresh Basil', quantity: 10, unit: 'g', notes: 'Fresh basil leaves for garnish' },
    { recipeKey: 'italian-delight-Margherita Pizza', itemName: 'Extra Virgin Olive Oil', quantity: 30, unit: 'ml', notes: 'For drizzling' },
    { recipeKey: 'italian-delight-Margherita Pizza', itemName: '00 Flour', quantity: 300, unit: 'g', notes: 'For pizza dough' },
    
    // Spaghetti Carbonara ingredients
    { recipeKey: 'italian-delight-Spaghetti Carbonara', itemName: '00 Flour', quantity: 200, unit: 'g', notes: 'For pasta dough' },
    { recipeKey: 'italian-delight-Spaghetti Carbonara', itemName: 'Fresh Mozzarella', quantity: 100, unit: 'g', notes: 'Grated cheese' },
    { recipeKey: 'italian-delight-Spaghetti Carbonara', itemName: 'Extra Virgin Olive Oil', quantity: 15, unit: 'ml', notes: 'For cooking' }
  ];

  const recipeIngredientsToInsert = recipeIngredientData.map(ri => {
    const recipeId = recipes[ri.recipeKey];
    // Fix: Extract business slug properly from recipe key
    const businessSlug = ri.recipeKey.split('-')[0] + '-' + ri.recipeKey.split('-')[1];
    if (!businessSlug) {
      console.log(`⚠️ Invalid recipe key format: ${ri.recipeKey}`);
      return null;
    }
    const businessId = businessMap[businessSlug];
    if (!businessId) {
      console.log(`⚠️ Business not found for slug: ${businessSlug}`);
      return null;
    }
    const itemMap = itemMaps[businessId];
    const itemId = itemMap ? itemMap[ri.itemName.toLowerCase()] : undefined;
    
    if (!recipeId) {
      throw new Error(`Recipe not found for key: ${ri.recipeKey}`);
    }
    if (!itemId) {
      console.log(`⚠️ Item not found: ${ri.itemName} for business ${businessId}. Available items: ${businessId ? Object.keys(itemMaps[businessId] || {}).join(', ') : 'none'}`);
      return null; // Skip this ingredient if item doesn't exist
    }
    
    return {
      recipeId: recipeId,
      itemId: itemId,
      quantity: ri.quantity,
      unit: ri.unit,
      notes: ri.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }).filter((item): item is NonNullable<typeof item> => item !== null); // Remove null entries with proper typing

  if (recipeIngredientsToInsert.length > 0) {
    await queryInterface.bulkInsert('recipe_ingredients', recipeIngredientsToInsert);
    console.log(`✅ Recipe ingredients created: ${recipeIngredientsToInsert.length} ingredients`);
  } else {
    console.log('⚠️ No recipe ingredients created - no matching items found');
  }

  // 22. Recipe Suggestions
  console.log('💡 Creating recipe suggestions...');
  const recipeSuggestionData = [
    {
      recipeKey: 'italian-delight-Margherita Pizza',
      businessSlug: 'italian-delight',
      suggestion: 'Try adding fresh arugula after baking for a peppery kick',
      type: 'enhancement',
      priority: 'medium'
    },
    {
      recipeKey: 'italian-delight-Spaghetti Carbonara',
      businessSlug: 'italian-delight',
      suggestion: 'Add a pinch of red pepper flakes for extra heat',
      type: 'enhancement',
      priority: 'low'
    }
  ];

  await queryInterface.bulkInsert('recipe_suggestions', recipeSuggestionData.map(rs => ({
    recipeId: recipes[rs.recipeKey],
    businessId: businessMap[rs.businessSlug] || 0,
    suggestionType: rs.type,
    reason: rs.suggestion,
    priority: rs.priority,
    targetAudience: 'chefs',
    aiGenerated: false,
    status: 'pending',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  })));
  console.log('✅ Recipe suggestions created');

  // ===== PHASE 9: FLOOR PLANS AND TABLES =====
  // Note: Tables and floor plans are created in the comprehensive-data seeder
  // to avoid duplicate entries. This seeder focuses on recipes only.

  console.log('🎉 Comprehensive recipes seeder completed successfully!');
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  console.log('🗑️ Rolling back comprehensive recipes seeder...');
  
  // Delete in reverse order to respect foreign key constraints
  // Note: Tables and floor plans are managed by comprehensive-data seeder
  await queryInterface.bulkDelete('recipe_suggestions', {});
  await queryInterface.bulkDelete('recipe_ingredients', {});
  await queryInterface.bulkDelete('recipes', {});
  
  console.log('✅ Comprehensive recipes seeder rolled back successfully!');
}