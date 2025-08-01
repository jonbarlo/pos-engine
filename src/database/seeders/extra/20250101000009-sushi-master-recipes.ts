import { QueryInterface, QueryTypes } from 'sequelize';

// Nutritional database for ingredients (per 100g/serving)
const ingredientNutrition: { [key: string]: { calories: number; protein: number; carbs: number; fat: number } } = {
  // Sushi Ingredients
  'bluefin tuna otoro': { calories: 144, protein: 23, carbs: 0, fat: 5 },
  'hokkaido uni': { calories: 125, protein: 16, carbs: 3, fat: 5 },
  'soft shell crab': { calories: 87, protein: 18, carbs: 0, fat: 1 },
  'nori sheets': { calories: 35, protein: 6, carbs: 5, fat: 0 },
  'sushi rice': { calories: 130, protein: 3, carbs: 28, fat: 0 }
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
      if (ingredient.toLowerCase().includes('tuna') || ingredient.toLowerCase().includes('uni')) servingMultiplier = 1.2; // 120g
      else if (ingredient.toLowerCase().includes('crab')) servingMultiplier = 1.0; // 100g
      else if (ingredient.toLowerCase().includes('nori')) servingMultiplier = 0.1; // 10g
      else if (ingredient.toLowerCase().includes('rice')) servingMultiplier = 1.5; // 150g
      
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
  console.log('🍣 Starting Sushi Master recipes seeder...');

  // Get business ID for Sushi Master
  const [sushiBusiness] = await queryInterface.sequelize.query(
    'SELECT id FROM businesses WHERE slug = ?',
    { type: QueryTypes.SELECT, replacements: ['sushi-master'] }
  ) as any[];

  if (!sushiBusiness) {
    console.log('❌ Sushi Master business not found, skipping seeder...');
    return;
  }

  const sushiBusinessId = sushiBusiness.id;

  // Get all existing items for Sushi Master
  const sushiItems = await queryInterface.sequelize.query(
    'SELECT id, businessId, name, sku, category FROM items WHERE businessId = ?',
    { type: QueryTypes.SELECT, replacements: [sushiBusinessId] }
  ) as any[];

  console.log(`📦 Found ${sushiItems.length} existing items for Sushi Master`);

  // Create item lookup map for Sushi Master
  const sushiItemMap: { [name: string]: number } = {};
  for (const item of sushiItems) {
    if (item.name) {
      sushiItemMap[(item.name as string).toLowerCase()] = item.id;
    }
    if (item.sku) {
      sushiItemMap[(item.sku as string).toLowerCase()] = item.id;
    }
  }

  // Sushi Master Recipe Templates
  const sushiRecipeTemplates = [
    {
      name: 'Bluefin Tuna Otoro Nigiri',
      mainIngredients: ['Bluefin Tuna Otoro'],
      supportingIngredients: ['Nori Sheets'],
      instructions: 'Form sushi rice into nigiri shape. Top with Bluefin Tuna Otoro. Wrap with Nori Sheets if desired.',
      prepTime: 25,
      cookTime: 0,
      servings: 8,
      difficulty: 'hard',
      cuisine: 'Japanese',
      category: 'Sushi',
      nutritionInfo: 'Calories: 180, Protein: 22g, Carbs: 15g, Fat: 5g',
      imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351',
      isActive: true
    },
    {
      name: 'Hokkaido Uni Sushi',
      mainIngredients: ['Hokkaido Uni'],
      supportingIngredients: ['Nori Sheets'],
      instructions: 'Form sushi rice into nigiri shape. Carefully place Hokkaido Uni on top. Serve immediately.',
      prepTime: 20,
      cookTime: 0,
      servings: 6,
      difficulty: 'hard',
      cuisine: 'Japanese',
      category: 'Sushi',
      nutritionInfo: 'Calories: 145, Protein: 18g, Carbs: 12g, Fat: 3g',
      imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754',
      isActive: true
    },
    {
      name: 'Soft Shell Crab Roll',
      mainIngredients: ['Soft Shell Crab'],
      supportingIngredients: ['Nori Sheets'],
      instructions: 'Tempura fry Soft Shell Crab. Roll with sushi rice and Nori Sheets. Cut into pieces.',
      prepTime: 30,
      cookTime: 10,
      servings: 8,
      difficulty: 'medium',
      cuisine: 'Japanese',
      category: 'Sushi',
      nutritionInfo: 'Calories: 280, Protein: 24g, Carbs: 18g, Fat: 12g',
      imageUrl: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56',
      isActive: true
    }
  ];

  // Create comprehensive recipes for Sushi Master
  const sushiRecipes: any[] = [];

  // First create template-based recipes
  for (const template of sushiRecipeTemplates) {
    // Get all template ingredients
    const allTemplateIngredients = [...template.mainIngredients, ...template.supportingIngredients];
    
    // Find actual items that match template ingredients
    const matchedIngredients = allTemplateIngredients
      .map(ingredientName => {
        const item = sushiItems.find(item => 
          item.name && item.name.toLowerCase().includes(ingredientName.toLowerCase())
        );
        return item;
      })
      .filter(Boolean);
    
    if (matchedIngredients.length > 0) {
      // Create recipe from template
      const recipe = {
        businessId: sushiBusinessId,
        name: template.name,
        description: `Authentic Japanese recipe using premium ingredients.`,
        ingredients: matchedIngredients.map(item => item.name).join(', '),
        instructions: template.instructions,
        prepTime: template.prepTime,
        cookTime: template.cookTime,
        servings: template.servings || 2,
        difficulty: template.difficulty || 'medium',
        cuisine: template.cuisine || 'Japanese',
        category: template.category || 'Sushi',
        nutritionInfo: template.nutritionInfo || calculateNutrition([...template.mainIngredients, ...template.supportingIngredients], template.servings || 2),
        imageUrl: template.imageUrl || 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351',
        isActive: template.isActive !== undefined ? template.isActive : true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      sushiRecipes.push(recipe);
    }
  }

  // Generate additional recipes using available items
  const availableItems = sushiItems.filter(item => item.category && item.category !== 'beverages');
  const recipesPerBusiness = Math.min(400, availableItems.length * 2); // 400 recipes for Sushi Master
  
  for (let i = sushiRecipes.length; i < recipesPerBusiness; i++) {
    const mainItem = availableItems[Math.floor(Math.random() * availableItems.length)];
    const supportingItems = availableItems.filter(item => item.id !== mainItem.id).slice(0, 3);
    
    if (!mainItem) continue;
    
    // Create diverse recipe names based on Japanese cuisine
    const cuisineSuffixes = ['Sushi', 'Nigiri', 'Maki', 'Sashimi', 'Temaki', 'Uramaki', 'Gunkan'];
    const suffix = cuisineSuffixes[Math.floor(Math.random() * cuisineSuffixes.length)];
    const servings = 1 + Math.floor(Math.random() * 4);
    
    // Create random recipe
    const recipe = {
      businessId: sushiBusinessId,
      name: `${mainItem.name} ${suffix}`,
      description: `Authentic Japanese recipe using premium ingredients.`,
      ingredients: [mainItem, ...supportingItems].map(item => item.name).join(', '),
      instructions: `Prepare ${mainItem.name} with ${supportingItems.map(item => item.name).join(', ')}. Cook to perfection.`,
      prepTime: 10 + Math.floor(Math.random() * 20),
      cookTime: 15 + Math.floor(Math.random() * 30),
      servings: servings,
      difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as 'easy' | 'medium' | 'hard',
      cuisine: 'Japanese',
      category: 'Sushi',
      nutritionInfo: calculateNutrition([mainItem, ...supportingItems].map(item => item.name), servings),
      imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    sushiRecipes.push(recipe);
  }

  console.log(`🍣 Total Sushi Master recipes created: ${sushiRecipes.length}`);

  // Insert recipes in chunks
  if (sushiRecipes.length > 0) {
    console.log(`🍣 Inserting ${sushiRecipes.length} Sushi Master recipes in chunks...`);
    
    const chunkSize = 100;
    for (let i = 0; i < sushiRecipes.length; i += chunkSize) {
      const chunk = sushiRecipes.slice(i, i + chunkSize);
      await queryInterface.bulkInsert('recipes', chunk);
      console.log(`🍣 Inserted Sushi Master recipe chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(sushiRecipes.length / chunkSize)}`);
    }
  }

  // Create Recipe Ingredients (N:N relationship) for Sushi Master recipes
  console.log('🔗 Creating recipe-ingredient relationships for Sushi Master recipes...');

  // Get the recipes we just created
  const createdSushiRecipes = await queryInterface.sequelize.query(
    `SELECT r.id, r.businessId, r.name, r.ingredients, b.slug as businessSlug 
     FROM recipes r 
     JOIN businesses b ON r.businessId = b.id 
     WHERE r.createdAt >= ? AND b.slug = ?`,
    { type: QueryTypes.SELECT, replacements: [new Date(Date.now() - 60000), 'sushi-master'] }
  ) as any[];

  // Create recipe ingredients using the actual ingredients from recipe creation
  const sushiRecipeIngredients: any[] = [];

  for (const recipe of createdSushiRecipes) {
    const businessId = recipe.businessId;
    const itemMap = sushiItemMap;
    
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
      sushiRecipeIngredients.push(recipeIngredient);
    }
  }

  // Insert recipe ingredients in chunks with error handling
  if (sushiRecipeIngredients.length > 0) {
    console.log(`🔗 Inserting ${sushiRecipeIngredients.length} Sushi Master recipe-ingredient relationships in chunks...`);
    
    const ingredientChunkSize = 100;
    for (let i = 0; i < sushiRecipeIngredients.length; i += ingredientChunkSize) {
      const chunk = sushiRecipeIngredients.slice(i, i + ingredientChunkSize);
      try {
        await queryInterface.bulkInsert('recipe_ingredients', chunk);
        console.log(`🔗 Inserted Sushi Master ingredient chunk ${Math.floor(i / ingredientChunkSize) + 1}/${Math.ceil(sushiRecipeIngredients.length / ingredientChunkSize)}`);
      } catch (error) {
        console.log(`⚠️ Error inserting Sushi Master ingredient chunk ${Math.floor(i / ingredientChunkSize) + 1}, trying individual inserts...`);
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

  console.log('✅ Sushi Master recipes seeder completed successfully!');
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  console.log('🔄 Rolling back Sushi Master recipes seeder...');

  // Delete recipe ingredients first (due to foreign key constraints)
  await queryInterface.sequelize.query(
    'DELETE FROM recipe_ingredients WHERE recipeId IN (SELECT id FROM recipes WHERE businessId IN (SELECT id FROM businesses WHERE slug = ?))',
    { replacements: ['sushi-master'] }
  );

  // Delete recipes
  await queryInterface.sequelize.query(
    'DELETE FROM recipes WHERE businessId IN (SELECT id FROM businesses WHERE slug = ?)',
    { replacements: ['sushi-master'] }
  );

  console.log('✅ Sushi Master recipes seeder rolled back successfully!');
} 