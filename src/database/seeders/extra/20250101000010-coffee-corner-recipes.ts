import { QueryInterface, QueryTypes } from 'sequelize';

// Nutritional database for ingredients (per 100g/serving)
const ingredientNutrition: { [key: string]: { calories: number; protein: number; carbs: number; fat: number } } = {
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
      if (ingredient.toLowerCase().includes('coffee') || ingredient.toLowerCase().includes('beans')) servingMultiplier = 0.18; // 18g
      else if (ingredient.toLowerCase().includes('matcha')) servingMultiplier = 0.02; // 2g (1 tsp)
      else if (ingredient.toLowerCase().includes('milk')) servingMultiplier = 2.4; // 240ml (1 cup)
      else if (ingredient.toLowerCase().includes('chai')) servingMultiplier = 2.4; // 240ml (1 cup)
      
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
  console.log('☕ Starting Coffee Corner recipes seeder...');

  // Get business ID for Coffee Corner
  const [coffeeBusiness] = await queryInterface.sequelize.query(
    'SELECT id FROM businesses WHERE slug = ?',
    { type: QueryTypes.SELECT, replacements: ['coffee-corner'] }
  ) as any[];

  if (!coffeeBusiness) {
    console.log('❌ Coffee Corner business not found, skipping seeder...');
    return;
  }

  const coffeeBusinessId = coffeeBusiness.id;

  // Get all existing items for Coffee Corner
  const coffeeItems = await queryInterface.sequelize.query(
    'SELECT id, businessId, name, sku, category FROM items WHERE businessId = ?',
    { type: QueryTypes.SELECT, replacements: [coffeeBusinessId] }
  ) as any[];

  console.log(`📦 Found ${coffeeItems.length} existing items for Coffee Corner`);

  // Create item lookup map for Coffee Corner
  const coffeeItemMap: { [name: string]: number } = {};
  for (const item of coffeeItems) {
    if (item.name) {
      coffeeItemMap[(item.name as string).toLowerCase()] = item.id;
    }
    if (item.sku) {
      coffeeItemMap[(item.sku as string).toLowerCase()] = item.id;
    }
  }

  // Coffee Corner Recipe Templates
  const coffeeRecipeTemplates = [
    {
      name: 'Ethiopian Yirgacheffe Pour Over',
      mainIngredients: ['Ethiopian Yirgacheffe Beans'],
      supportingIngredients: [],
      instructions: 'Grind Ethiopian Yirgacheffe Beans medium-fine. Use pour over method with 200°F water. Brew for 3-4 minutes.',
      prepTime: 5,
      cookTime: 4,
      servings: 1,
      difficulty: 'medium',
      cuisine: 'Ethiopian',
      category: 'Coffee',
      nutritionInfo: 'Calories: 5, Protein: 0g, Carbs: 1g, Fat: 0g',
      imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf',
      isActive: true
    },
    {
      name: 'Colombian Supremo Latte',
      mainIngredients: ['Colombian Supremo Beans'],
      supportingIngredients: ['Oat Milk (Expiring Soon)'],
      instructions: 'Espresso with Colombian Supremo Beans. Steam Oat Milk to 140°F. Combine for perfect latte.',
      prepTime: 3,
      cookTime: 2,
      servings: 1,
      difficulty: 'easy',
      cuisine: 'Colombian',
      category: 'Coffee',
      nutritionInfo: 'Calories: 150, Protein: 8g, Carbs: 15g, Fat: 5g',
      imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735',
      isActive: true
    },
    {
      name: 'Matcha Green Tea Latte',
      mainIngredients: ['Matcha Powder'],
      supportingIngredients: ['Almond Milk'],
      instructions: 'Whisk Matcha Powder with hot water. Steam Almond Milk. Combine for smooth matcha latte.',
      prepTime: 5,
      cookTime: 3,
      servings: 1,
      difficulty: 'medium',
      cuisine: 'Japanese',
      category: 'Coffee',
      nutritionInfo: 'Calories: 120, Protein: 6g, Carbs: 12g, Fat: 4g',
      imageUrl: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7',
      isActive: true
    },
    {
      name: 'Chai Spiced Latte',
      mainIngredients: ['Chai Concentrate'],
      supportingIngredients: ['Oat Milk (Expiring Soon)'],
      instructions: 'Heat Chai Concentrate. Steam Oat Milk. Combine for aromatic chai latte.',
      prepTime: 3,
      cookTime: 2,
      servings: 1,
      difficulty: 'easy',
      cuisine: 'Indian',
      category: 'Coffee',
      nutritionInfo: 'Calories: 140, Protein: 7g, Carbs: 18g, Fat: 4g',
      imageUrl: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f',
      isActive: true
    }
  ];

  // Create comprehensive recipes for Coffee Corner
  const coffeeRecipes: any[] = [];

  // First create template-based recipes
  for (const template of coffeeRecipeTemplates) {
    // Get all template ingredients
    const allTemplateIngredients = [...template.mainIngredients, ...template.supportingIngredients];
    
    // Find actual items that match template ingredients
    const matchedIngredients = allTemplateIngredients
      .map(ingredientName => {
        const item = coffeeItems.find(item => 
          item.name && item.name.toLowerCase().includes(ingredientName.toLowerCase())
        );
        return item;
      })
      .filter(Boolean);
    
    if (matchedIngredients.length > 0) {
      // Create recipe from template
      const recipe = {
        businessId: coffeeBusinessId,
        name: template.name,
        description: `Authentic Coffee recipe using premium ingredients.`,
        ingredients: matchedIngredients.map(item => item.name).join(', '),
        instructions: template.instructions,
        prepTime: template.prepTime,
        cookTime: template.cookTime,
        servings: template.servings || 2,
        difficulty: template.difficulty || 'medium',
        cuisine: template.cuisine || 'Coffee',
        category: template.category || 'Coffee',
        nutritionInfo: template.nutritionInfo || calculateNutrition([...template.mainIngredients, ...template.supportingIngredients], template.servings || 2),
        imageUrl: template.imageUrl || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
        isActive: template.isActive !== undefined ? template.isActive : true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      coffeeRecipes.push(recipe);
    }
  }

  // Generate additional recipes using available items
  const availableItems = coffeeItems.filter(item => item.category && item.category !== 'beverages');
  const recipesPerBusiness = Math.min(400, availableItems.length * 2); // 400 recipes for Coffee Corner
  
  for (let i = coffeeRecipes.length; i < recipesPerBusiness; i++) {
    const mainItem = availableItems[Math.floor(Math.random() * availableItems.length)];
    const supportingItems = availableItems.filter(item => item.id !== mainItem.id).slice(0, 3);
    
    if (!mainItem) continue;
    
    // Create diverse recipe names based on coffee cuisine
    const cuisineSuffixes = ['Latte', 'Cappuccino', 'Espresso', 'Pour Over', 'Specialty', 'Americano', 'Macchiato', 'Mocha'];
    const suffix = cuisineSuffixes[Math.floor(Math.random() * cuisineSuffixes.length)];
    const servings = 1 + Math.floor(Math.random() * 4);
    
    // Create random recipe
    const recipe = {
      businessId: coffeeBusinessId,
      name: `${mainItem.name} ${suffix}`,
      description: `Authentic Coffee recipe using premium ingredients.`,
      ingredients: [mainItem, ...supportingItems].map(item => item.name).join(', '),
      instructions: `Prepare ${mainItem.name} with ${supportingItems.map(item => item.name).join(', ')}. Brew to perfection.`,
      prepTime: 10 + Math.floor(Math.random() * 20),
      cookTime: 15 + Math.floor(Math.random() * 30),
      servings: servings,
      difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as 'easy' | 'medium' | 'hard',
      cuisine: 'Coffee',
      category: 'Coffee',
      nutritionInfo: calculateNutrition([mainItem, ...supportingItems].map(item => item.name), servings),
      imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    coffeeRecipes.push(recipe);
  }

  console.log(`☕ Total Coffee Corner recipes created: ${coffeeRecipes.length}`);

  // Insert recipes in chunks
  if (coffeeRecipes.length > 0) {
    console.log(`☕ Inserting ${coffeeRecipes.length} Coffee Corner recipes in chunks...`);
    
    const chunkSize = 100;
    for (let i = 0; i < coffeeRecipes.length; i += chunkSize) {
      const chunk = coffeeRecipes.slice(i, i + chunkSize);
      await queryInterface.bulkInsert('recipes', chunk);
      console.log(`☕ Inserted Coffee Corner recipe chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(coffeeRecipes.length / chunkSize)}`);
    }
  }

  // Create Recipe Ingredients (N:N relationship) for Coffee Corner recipes
  console.log('🔗 Creating recipe-ingredient relationships for Coffee Corner recipes...');

  // Get the recipes we just created
  const createdCoffeeRecipes = await queryInterface.sequelize.query(
    `SELECT r.id, r.businessId, r.name, r.ingredients, b.slug as businessSlug 
     FROM recipes r 
     JOIN businesses b ON r.businessId = b.id 
     WHERE r.createdAt >= ? AND b.slug = ?`,
    { type: QueryTypes.SELECT, replacements: [new Date(Date.now() - 60000), 'coffee-corner'] }
  ) as any[];

  // Create recipe ingredients using the actual ingredients from recipe creation
  const coffeeRecipeIngredients: any[] = [];

  for (const recipe of createdCoffeeRecipes) {
    const businessId = recipe.businessId;
    const itemMap = coffeeItemMap;
    
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
      coffeeRecipeIngredients.push(recipeIngredient);
    }
  }

  // Insert recipe ingredients in chunks with error handling
  if (coffeeRecipeIngredients.length > 0) {
    console.log(`🔗 Inserting ${coffeeRecipeIngredients.length} Coffee Corner recipe-ingredient relationships in chunks...`);
    
    const ingredientChunkSize = 100;
    for (let i = 0; i < coffeeRecipeIngredients.length; i += ingredientChunkSize) {
      const chunk = coffeeRecipeIngredients.slice(i, i + ingredientChunkSize);
      try {
        await queryInterface.bulkInsert('recipe_ingredients', chunk);
        console.log(`🔗 Inserted Coffee Corner ingredient chunk ${Math.floor(i / ingredientChunkSize) + 1}/${Math.ceil(coffeeRecipeIngredients.length / ingredientChunkSize)}`);
      } catch (error) {
        console.log(`⚠️ Error inserting Coffee Corner ingredient chunk ${Math.floor(i / ingredientChunkSize) + 1}, trying individual inserts...`);
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

  console.log('✅ Coffee Corner recipes seeder completed successfully!');
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  console.log('🔄 Rolling back Coffee Corner recipes seeder...');

  // Delete recipe ingredients first (due to foreign key constraints)
  await queryInterface.sequelize.query(
    'DELETE FROM recipe_ingredients WHERE recipeId IN (SELECT id FROM recipes WHERE businessId IN (SELECT id FROM businesses WHERE slug = ?))',
    { replacements: ['coffee-corner'] }
  );

  // Delete recipes
  await queryInterface.sequelize.query(
    'DELETE FROM recipes WHERE businessId IN (SELECT id FROM businesses WHERE slug = ?)',
    { replacements: ['coffee-corner'] }
  );

  console.log('✅ Coffee Corner recipes seeder rolled back successfully!');
} 