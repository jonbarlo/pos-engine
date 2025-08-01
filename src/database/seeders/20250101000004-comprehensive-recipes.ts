

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
    if (item.sku) {
      itemMaps[businessId][(item.sku as string).toLowerCase()] = item.id;
    }
  }

  // Create comprehensive recipes - THOUSANDS of REAL recipes using ACTUAL ingredients
  const comprehensiveRecipes: any[] = [];

  // Group items by business and category for REAL recipe creation
  const itemsByBusiness: { [businessId: number]: any[] } = {};
  for (const item of allItems) {
    if (!item.businessId) continue;
    const businessId = item.businessId as number;
    if (!itemsByBusiness[businessId]) {
      itemsByBusiness[businessId] = [];
    }
    itemsByBusiness[businessId].push(item);
  }

  // REAL RECIPE TEMPLATES using actual ingredients
  const realRecipeTemplates = {
    'italian-delight': [
      {
        name: 'Truffle Pasta with Wagyu Beef',
        mainIngredients: ['Premium Black Truffle Pasta', 'Wagyu Beef (Premium)'],
        supportingIngredients: ['Fresh Basil', 'Cherry Tomatoes', 'Truffle Oil (Underperforming)'],
        instructions: 'Cook Premium Black Truffle Pasta al dente. Sear Wagyu Beef to medium-rare. Toss pasta with Fresh Basil, Cherry Tomatoes, and Truffle Oil. Top with sliced Wagyu Beef.',
        prepTime: 15,
        cookTime: 20,
        servings: 2,
        difficulty: 'hard',
        cuisine: 'Italian',
        category: 'Pasta',
        nutritionInfo: 'Calories: 850, Protein: 45g, Carbs: 60g, Fat: 35g',
        imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d946',
        isActive: true
      },
      {
        name: 'Lobster Ravioli with Saffron Sauce',
        mainIngredients: ['Premium Lobster Ravioli'],
        supportingIngredients: ['Premium Saffron (Underperforming)', 'Fresh Basil'],
        instructions: 'Boil Premium Lobster Ravioli until floating. Create sauce with Premium Saffron, Fresh Basil, and butter. Toss ravioli in saffron sauce.',
        prepTime: 10,
        cookTime: 15,
        servings: 4,
        difficulty: 'medium',
        cuisine: 'Italian',
        category: 'Pasta',
        nutritionInfo: 'Calories: 650, Protein: 28g, Carbs: 45g, Fat: 32g',
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03246963d958',
        isActive: true
      },
      {
        name: 'Wagyu Beef Carpaccio',
        mainIngredients: ['Wagyu Beef (Premium)'],
        supportingIngredients: ['Truffle Oil (Underperforming)', 'Fresh Basil', 'Cherry Tomatoes'],
        instructions: 'Thinly slice Wagyu Beef. Arrange on plate. Drizzle with Truffle Oil. Garnish with Fresh Basil and Cherry Tomatoes.',
        prepTime: 20,
        cookTime: 0,
        servings: 6,
        difficulty: 'medium',
        cuisine: 'Italian',
        category: 'Appetizer',
        nutritionInfo: 'Calories: 320, Protein: 35g, Carbs: 5g, Fat: 18g',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947',
        isActive: true
      }
    ]
  };

    // Generate LOTS of recipes using templates + available items
  
  for (const [businessSlug, businessId] of Object.entries(businessMap)) {
    const businessIdNum = businessId as number;
    const businessItems = itemsByBusiness[businessIdNum] || [];
    
    if (businessItems.length === 0) {
      console.log(`⚠️ No items found for business ${businessSlug}, skipping...`);
      continue;
    }

    // Get templates for this business
    const templates = realRecipeTemplates[businessSlug as keyof typeof realRecipeTemplates] || [];
    
    // Create MANY recipes (800+ per business)
    const recipesPerBusiness = Math.min(800, businessItems.length * 2);
    
    for (let i = 0; i < recipesPerBusiness; i++) {
      let recipe;
      
      // First create template-based recipes
      if (i < templates.length) {
        const template = templates[i];
        
        if (template) {
          // Get all template ingredients
          const allTemplateIngredients = [...template.mainIngredients, ...template.supportingIngredients];
          
          // Find actual items that match template ingredients
          const matchedIngredients = allTemplateIngredients
            .map(ingredientName => {
              const item = businessItems.find(item => 
                item.name && item.name.toLowerCase().includes(ingredientName.toLowerCase())
              );
              return item;
            })
            .filter(Boolean);
          
          if (matchedIngredients.length > 0) {
            // Create recipe from template - ALL COLUMNS EXPLICITLY DEFINED
            recipe = {
              businessId: businessIdNum,
              name: template.name,
              description: `Authentic ${businessSlug === 'italian-delight' ? 'Italian' : businessSlug === 'sushi-master' ? 'Japanese' : 'Coffee'} recipe using premium ingredients.`,
              ingredients: matchedIngredients.map(item => item.name).join(', '),
              instructions: template.instructions,
              prepTime: template.prepTime,
              cookTime: template.cookTime,
              servings: template.servings || 2,
              difficulty: template.difficulty || 'medium',
              cuisine: template.cuisine || (businessSlug === 'italian-delight' ? 'Italian' : businessSlug === 'sushi-master' ? 'Japanese' : 'Coffee'),
              category: template.category || (businessSlug === 'italian-delight' ? 'Pasta' : businessSlug === 'sushi-master' ? 'Sushi' : 'Coffee'),
              nutritionInfo: template.nutritionInfo || calculateNutrition([...template.mainIngredients, ...template.supportingIngredients], template.servings || 2),
              imageUrl: template.imageUrl || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b',
              isActive: template.isActive !== undefined ? template.isActive : true,
              createdAt: new Date(),
              updatedAt: new Date()
            };
          }
        }
      }
      
      // If no template recipe created, create one from available items
      if (!recipe) {
        const availableItems = businessItems.filter(item => item.category && item.category !== 'beverages');
        const mainItem = availableItems[Math.floor(Math.random() * availableItems.length)];
        const supportingItems = availableItems.filter(item => item.id !== mainItem.id).slice(0, 3);
        
        if (!mainItem) continue;
        
        // Create diverse recipe names based on cuisine
        const cuisineSuffixes = {
          'italian-delight': ['Pasta', 'Risotto', 'Pizza', 'Antipasto', 'Primi Piatti']
        };
        
        const suffixes = cuisineSuffixes[businessSlug as keyof typeof cuisineSuffixes] || ['Specialty'];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        const servings = 1 + Math.floor(Math.random() * 4);
        
        // Create random recipe - ALL COLUMNS EXPLICITLY DEFINED
        recipe = {
          businessId: businessIdNum,
          name: `${mainItem.name} ${suffix}`,
          description: `Authentic Italian recipe using premium ingredients.`,
          ingredients: [mainItem, ...supportingItems].map(item => item.name).join(', '),
          instructions: `Prepare ${mainItem.name} with ${supportingItems.map(item => item.name).join(', ')}. Cook to perfection.`,
          prepTime: 10 + Math.floor(Math.random() * 20),
          cookTime: 15 + Math.floor(Math.random() * 30),
          servings: servings,
          difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as 'easy' | 'medium' | 'hard',
          cuisine: 'Italian',
          category: 'Pasta',
          nutritionInfo: calculateNutrition([mainItem, ...supportingItems].map(item => item.name), servings),
          imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
      
      comprehensiveRecipes.push(recipe);
    }
  }

  console.log(`🍳 Total recipes created: ${comprehensiveRecipes.length}`);

  // Insert recipes in chunks
  if (comprehensiveRecipes.length > 0) {
    console.log(`🍳 Inserting ${comprehensiveRecipes.length} recipes in chunks...`);
    
    const chunkSize = 100;
    for (let i = 0; i < comprehensiveRecipes.length; i += chunkSize) {
      const chunk = comprehensiveRecipes.slice(i, i + chunkSize);
      await queryInterface.bulkInsert('recipes', chunk);
      console.log(`🍳 Inserted recipe chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(comprehensiveRecipes.length / chunkSize)}`);
    }
  }

  // 🔗 Create Recipe Ingredients (N:N relationship) for comprehensive recipes
  console.log('🔗 Creating recipe-ingredient relationships for comprehensive recipes...');

  // Get all existing items for mapping
  const allItemsForIngredients = await queryInterface.sequelize.query(
    'SELECT id, businessId, name, sku FROM items WHERE businessId IS NOT NULL',
    { type: QueryTypes.SELECT }
  ) as any[];

  // Create item lookup maps by business
  const itemMapsForIngredients: { [businessId: number]: { [name: string]: number } } = {};
  for (const item of allItemsForIngredients) {
    if (!item.businessId) continue;
    const businessId = item.businessId as number;
    if (!itemMapsForIngredients[businessId]) {
      itemMapsForIngredients[businessId] = {};
    }
    if (item.name) {
      itemMapsForIngredients[businessId][(item.name as string).toLowerCase()] = item.id;
    }
    if (item.sku) {
      itemMapsForIngredients[businessId][(item.sku as string).toLowerCase()] = item.id;
    }
  }

  // Get the recipes we just created with their business info
  const createdRecipes = await queryInterface.sequelize.query(
    `SELECT r.id, r.businessId, r.name, r.ingredients, b.slug as businessSlug 
     FROM recipes r 
     JOIN businesses b ON r.businessId = b.id 
     WHERE r.createdAt >= ? AND b.slug IN (?)`,
    { type: QueryTypes.SELECT, replacements: [new Date(Date.now() - 60000), 'italian-delight'] }
  ) as any[];

  // Create recipe ingredients using the actual ingredients from recipe creation
  const recipeIngredients: any[] = [];

  for (const recipe of createdRecipes) {
    const businessId = recipe.businessId;
    const itemMap = itemMapsForIngredients[businessId];
    
    if (!itemMap) {
      console.log(`⚠️ No item map for business ${businessId}, skipping recipe ${recipe.id}`);
      continue;
    }

    // Parse the ingredients string from the recipe to get the actual items used
    const ingredientNames = recipe.ingredients.split(', ').map((name: string) => name.trim());
    
    // Find the actual item IDs for each ingredient
    for (const ingredientName of ingredientNames) {
      const itemId = itemMap[ingredientName.toLowerCase()];
      
      if (!itemId) {
        console.log(`⚠️ Item "${ingredientName}" not found for recipe "${recipe.name}"`);
        continue;
      }

      const recipeIngredient = {
        recipeId: recipe.id,
        itemId: itemId,
        quantity: 1 + Math.floor(Math.random() * 3), // 1-3 pieces
        unit: 'pieces',
        notes: `Essential ingredient for ${recipe.name}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      recipeIngredients.push(recipeIngredient);
    }
  }

  // Insert recipe ingredients in chunks with error handling
  if (recipeIngredients.length > 0) {
    console.log(`🔗 Inserting ${recipeIngredients.length} recipe-ingredient relationships in chunks...`);
    
    const ingredientChunkSize = 100;
    for (let i = 0; i < recipeIngredients.length; i += ingredientChunkSize) {
      const chunk = recipeIngredients.slice(i, i + ingredientChunkSize);
      try {
        await queryInterface.bulkInsert('recipe_ingredients', chunk);
        console.log(`🔗 Inserted ingredient chunk ${Math.floor(i / ingredientChunkSize) + 1}/${Math.ceil(recipeIngredients.length / ingredientChunkSize)}`);
      } catch (error) {
        console.log(`⚠️ Error inserting ingredient chunk ${Math.floor(i / ingredientChunkSize) + 1}, trying individual inserts...`);
        console.log(`Error details: ${error}`);
        
        // Fallback to individual inserts with error handling
        for (const ingredient of chunk) {
          try {
            await queryInterface.bulkInsert('recipe_ingredients', [ingredient]);
          } catch (individualError: any) {
            // Check if it's a unique constraint violation (duplicate recipe-ingredient)
            const errorMessage = individualError.toString();
            if (errorMessage.includes('UQ_recipe_ingredient') || errorMessage.includes('duplicate')) {
              console.log(`ℹ️ Skipping duplicate recipe-ingredient combination: recipeId ${ingredient.recipeId}, itemId ${ingredient.itemId}`);
            } else if (errorMessage.includes('foreign key') || errorMessage.includes('FK_')) {
              console.log(`⚠️ Skipping ingredient with itemId ${ingredient.itemId} - item may not exist`);
            } else {
              console.log(`⚠️ Error inserting ingredient: ${errorMessage}`);
            }
          }
        }
      }
    }
  }

  console.log('✅ Comprehensive recipes seeder completed successfully!');
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  console.log('🔄 Rolling back comprehensive recipes seeder...');

  // Delete recipe ingredients first (due to foreign key constraints)
  await queryInterface.sequelize.query(
    'DELETE FROM recipe_ingredients WHERE recipeId IN (SELECT id FROM recipes WHERE businessId IN (SELECT id FROM businesses WHERE slug IN (?)))',
    { replacements: ['italian-delight'] }
  );

  // Delete recipes
  await queryInterface.sequelize.query(
    'DELETE FROM recipes WHERE businessId IN (SELECT id FROM businesses WHERE slug IN (?))',
    { replacements: ['italian-delight'] }
  );

  console.log('✅ Comprehensive recipes seeder rolled back successfully!');
}