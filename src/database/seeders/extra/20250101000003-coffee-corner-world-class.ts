import { QueryInterface, QueryTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  console.log('☕ Adding Coffee Corner Restaurant Data...');
  
  // Find existing Coffee Corner business (created by comprehensive seeder)
  const businesses = await queryInterface.sequelize.query(
    'SELECT id, name, slug FROM businesses WHERE slug = ? ORDER BY id',
    { type: QueryTypes.SELECT, replacements: ['coffee-corner'] }
  ) as any[];
  
  if (!businesses || businesses.length === 0) {
    throw new Error('Coffee Corner business not found. Please run the comprehensive seeder first.');
  }
  
  const business = businesses[0];
  const businessId = business.id;
  console.log(`✅ Found Coffee Corner business ID: ${businessId} (${business.name})`);
  
  if (businesses.length > 1) {
    console.log(`⚠️ Warning: Found ${businesses.length} businesses with slug 'coffee-corner', using ID ${businessId}`);
  }

  // Helper function to generate random stock between 5 and 20
  const getRandomStock = () => Math.floor(Math.random() * 16) + 5;

  // Enhanced Items for Coffee Corner - Inspired by Blue Bottle Coffee, James Freeman
  const enhancedItems = [
    // Premium Coffee Beans
    { name: 'Ethiopian Yirgacheffe Single Origin', description: 'Light roast Ethiopian coffee with floral notes', price: 6.50, cost: 2.60, stock: getRandomStock(), sku: 'CO-ETH-YIR-001', barcode: '123456789500', category: 'Coffee', unit: 'cup', minStock: 15, maxStock: 120, imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&crop=center', isPerishable: false },
    { name: 'Colombian Supremo Single Origin', description: 'Medium roast Colombian coffee with chocolate notes', price: 6.00, cost: 2.40, stock: getRandomStock(), sku: 'CO-COL-SUP-001', barcode: '123456789501', category: 'Coffee', unit: 'cup', minStock: 15, maxStock: 120, imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&crop=center', isPerishable: false },
    { name: 'Sumatra Mandheling Single Origin', description: 'Dark roast Indonesian coffee with earthy notes', price: 6.25, cost: 2.50, stock: getRandomStock(), sku: 'CO-SUM-MAN-001', barcode: '123456789502', category: 'Coffee', unit: 'cup', minStock: 15, maxStock: 120, imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&crop=center', isPerishable: false },
    { name: 'Guatemala Antigua Single Origin', description: 'Medium-dark roast Guatemalan coffee with spice notes', price: 6.75, cost: 2.70, stock: getRandomStock(), sku: 'CO-GUA-ANT-001', barcode: '123456789503', category: 'Coffee', unit: 'cup', minStock: 15, maxStock: 120, imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&crop=center', isPerishable: false },
    { name: 'Kenya AA Single Origin', description: 'Bright Kenyan coffee with citrus and berry notes', price: 7.00, cost: 2.80, stock: getRandomStock(), sku: 'CO-KEN-AA-001', barcode: '123456789504', category: 'Coffee', unit: 'cup', minStock: 12, maxStock: 100, imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&crop=center', isPerishable: false },
    
    // Premium Alternative Milks
    { name: 'Oat Milk Barista Blend', description: 'Barista oat milk for dairy-free drinks', price: 4.50, cost: 1.80, stock: getRandomStock(), sku: 'CO-OAT-BAR-001', barcode: '123456789505', category: 'Coffee', unit: 'cup', minStock: 10, maxStock: 80, imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 8 },
    { name: 'Almond Milk Barista Blend', description: 'Barista almond milk for dairy-free drinks', price: 4.75, cost: 1.90, stock: getRandomStock(), sku: 'CO-ALM-BAR-001', barcode: '123456789506', category: 'Coffee', unit: 'cup', minStock: 10, maxStock: 80, imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 8 },
    { name: 'Coconut Milk Barista Blend', description: 'Barista coconut milk for dairy-free drinks', price: 4.25, cost: 1.70, stock: getRandomStock(), sku: 'CO-COC-BAR-001', barcode: '123456789507', category: 'Coffee', unit: 'cup', minStock: 10, maxStock: 80, imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 8 },
    
    // Premium Pastries
    { name: 'Pain au Chocolat', description: 'Buttery croissant with dark chocolate', price: 5.99, cost: 2.40, stock: getRandomStock(), sku: 'CO-PAS-PAI-001', barcode: '123456789508', category: 'Pastry', unit: 'piece', minStock: 6, maxStock: 40, imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 3 },
    { name: 'Almond Croissant', description: 'Buttery croissant with almond filling and sliced almonds', price: 6.49, cost: 2.60, stock: getRandomStock(), sku: 'CO-PAS-ALM-001', barcode: '123456789509', category: 'Pastry', unit: 'piece', minStock: 5, maxStock: 35, imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 3 },
    { name: 'Cinnamon Roll', description: 'Sweet cinnamon roll with cream cheese frosting', price: 5.49, cost: 2.20, stock: getRandomStock(), sku: 'CO-PAS-CIN-001', barcode: '123456789510', category: 'Pastry', unit: 'piece', minStock: 6, maxStock: 45, imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 3 },
    { name: 'Blueberry Scone', description: 'Buttery scone with fresh blueberries', price: 4.99, cost: 2.00, stock: getRandomStock(), sku: 'CO-PAS-SCO-001', barcode: '123456789511', category: 'Pastry', unit: 'piece', minStock: 8, maxStock: 50, imageUrl: 'https://images.unsplash.com/photo-1607958996338-0106d5c0c1e1?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 4 },
    
    // Premium Breads
    { name: 'Sourdough Bread', description: 'Artisan sourdough bread', price: 6.99, cost: 2.80, stock: getRandomStock(), sku: 'CO-BRE-SOU-001', barcode: '123456789512', category: 'Bread', unit: 'loaf', minStock: 5, maxStock: 35, imageUrl: 'https://images.unsplash.com/photo-1607958996338-0106d5c0c1e1?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 4 },
    { name: 'Whole Grain Bread', description: 'Nutritious whole grain bread', price: 5.99, cost: 2.40, stock: getRandomStock(), sku: 'CO-BRE-WHO-001', barcode: '123456789513', category: 'Bread', unit: 'loaf', minStock: 6, maxStock: 40, imageUrl: 'https://images.unsplash.com/photo-1607958996338-0106d5c0c1e1?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 4 },
    
    // Premium Toasts
    { name: 'Avocado Toast', description: 'Sourdough, avocado, microgreens, poached egg', price: 9.99, cost: 4.00, stock: getRandomStock(), sku: 'CO-TOA-AVO-001', barcode: '123456789514', category: 'Toast', unit: 'piece', minStock: 4, maxStock: 25, imageUrl: 'https://images.unsplash.com/photo-1607958996338-0106d5c0c1e1?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 2 },
    { name: 'Smoked Salmon Toast', description: 'Sourdough, cream cheese, smoked salmon, capers, red onion', price: 12.99, cost: 5.20, stock: getRandomStock(), sku: 'CO-TOA-SAL-001', barcode: '123456789515', category: 'Toast', unit: 'piece', minStock: 3, maxStock: 20, imageUrl: 'https://images.unsplash.com/photo-1607958996338-0106d5c0c1e1?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 2 },
    
    // Premium Teas
    { name: 'Premium Matcha Powder', description: 'Premium Japanese matcha green tea powder', price: 7.50, cost: 3.00, stock: getRandomStock(), sku: 'CO-MAT-PRE-001', barcode: '123456789516', category: 'Tea', unit: 'cup', minStock: 8, maxStock: 60, imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center', isPerishable: false },
    { name: 'Earl Grey Tea', description: 'Classic Earl Grey tea with bergamot', price: 4.99, cost: 1.50, stock: getRandomStock(), sku: 'CO-TEA-EAR-001', barcode: '123456789517', category: 'Tea', unit: 'cup', minStock: 10, maxStock: 80, imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center', isPerishable: false },
    { name: 'Chai Concentrate', description: 'Spiced chai tea concentrate', price: 6.50, cost: 2.60, stock: getRandomStock(), sku: 'CO-CHA-CON-001', barcode: '123456789518', category: 'Tea', unit: 'cup', minStock: 8, maxStock: 60, imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 8 },
    
    // Premium Smoothies and Bowls
    { name: 'Acai Bowl', description: 'Acai berry bowl with granola, banana, and honey', price: 11.99, cost: 4.80, stock: getRandomStock(), sku: 'CO-BOW-ACA-001', barcode: '123456789519', category: 'Bowl', unit: 'bowl', minStock: 4, maxStock: 25, imageUrl: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 2 },
    { name: 'Fresh Fruit Bowl', description: 'Seasonal fresh fruit medley', price: 8.99, cost: 3.60, stock: getRandomStock(), sku: 'CO-BOW-FRU-001', barcode: '123456789520', category: 'Bowl', unit: 'bowl', minStock: 5, maxStock: 30, imageUrl: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 3 },
    { name: 'Granola Bowl', description: 'House-made granola with yogurt and honey', price: 7.99, cost: 3.20, stock: getRandomStock(), sku: 'CO-BOW-GRA-001', barcode: '123456789521', category: 'Bowl', unit: 'bowl', minStock: 6, maxStock: 35, imageUrl: 'https://images.unsplash.com/photo-1607958996338-0106d5c0c1e1?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 2 }
  ];

  // Check for existing items to avoid duplicates
  const existingSkus = await queryInterface.sequelize.query(
    'SELECT sku FROM items WHERE businessId = ? AND sku IN (?)',
    { type: QueryTypes.SELECT, replacements: [businessId, enhancedItems.map(i => i.sku)] }
  ) as any[];
  
  const existingSkuSet = new Set(existingSkus.map(item => item.sku));
  const newItems = enhancedItems.filter(item => !existingSkuSet.has(item.sku));
  
  if (newItems.length === 0) {
    console.log(`⚠️ All items for Coffee Corner already exist, skipping item insertion`);
  } else {
    // Insert enhanced items
    await queryInterface.bulkInsert('items', newItems.map(i => ({
      businessId: businessId,
      name: i.name,
      description: i.description,
      price: i.price,
      cost: i.cost,
      stock: i.stock,
      sku: i.sku,
      barcode: i.barcode,
      category: i.category,
      unit: i.unit,
      minStock: i.minStock,
      maxStock: i.maxStock,
      imageUrl: i.imageUrl,
      isActive: true,
      isPerishable: i.isPerishable || false,
      expirationDate: i.expirationDate || null,
      manufacturingDate: i.manufacturingDate || null,
      shelfLifeDays: i.shelfLifeDays || null,
      lastSoldDate: null,
      salesVelocity: 0,
      daysSinceLastSale: 0,
      isUnderperforming: false,
      isExpiringSoon: false,
      createdAt: new Date(),
      updatedAt: new Date()
    })));
    
    console.log(`✅ Inserted ${newItems.length} new enhanced items for Coffee Corner (${enhancedItems.length - newItems.length} already existed)`);
  }

  // Enhanced Recipes for Coffee Corner
  const enhancedRecipes = [
    {
      name: 'Ethiopian Pour Over',
      description: 'Single origin Ethiopian coffee brewed with pour over method',
      ingredients: 'Ethiopian Yirgacheffe coffee beans, filtered water, pour over filter, coffee grinder',
      instructions: '1. Grind coffee beans to medium-fine consistency\n2. Heat water to 200°F\n3. Rinse filter and warm vessel\n4. Add coffee grounds and bloom with 60g water\n5. Pour remaining water in circular motion\n6. Total brew time should be 3-4 minutes',
      prepTime: 5,
      cookTime: 4,
      servings: 1,
      cuisine: 'Ethiopian',
      category: 'Coffee',
      difficulty: 'medium',
      nutritionInfo: JSON.stringify({ calories: 5, protein: 0, carbs: 1, fat: 0, fiber: 0 }),
      imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&crop=center'
    },
    {
      name: 'Colombian French Press',
      description: 'Medium roast Colombian coffee brewed with French press',
      ingredients: 'Colombian Supremo coffee beans, filtered water, French press, coffee grinder',
      instructions: '1. Grind coffee beans to coarse consistency\n2. Heat water to 200°F\n3. Add coffee grounds to French press\n4. Pour hot water and stir gently\n5. Let steep for 4 minutes\n6. Press plunger slowly and serve',
      prepTime: 5,
      cookTime: 4,
      servings: 1,
      cuisine: 'Colombian',
      category: 'Coffee',
      difficulty: 'easy',
      nutritionInfo: JSON.stringify({ calories: 5, protein: 0, carbs: 1, fat: 0, fiber: 0 }),
      imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&crop=center'
    },
    {
      name: 'Sumatra Cold Brew',
      description: 'Dark roast Indonesian coffee brewed cold for 24 hours',
      ingredients: 'Sumatra Mandheling coffee beans, cold filtered water, cold brew container, coffee grinder',
      instructions: '1. Grind coffee beans to coarse consistency\n2. Add coffee grounds to cold brew container\n3. Pour cold filtered water\n4. Stir gently to ensure all grounds are wet\n5. Let steep for 24 hours in refrigerator\n6. Strain and serve over ice',
      prepTime: 10,
      cookTime: 1440, // 24 hours
      servings: 1,
      cuisine: 'Indonesian',
      category: 'Coffee',
      difficulty: 'easy',
      nutritionInfo: JSON.stringify({ calories: 5, protein: 0, carbs: 1, fat: 0, fiber: 0 }),
      imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&crop=center'
    },
    {
      name: 'Oat Milk Latte',
      description: 'Espresso with steamed oat milk',
      ingredients: 'Espresso beans, oat milk barista blend, espresso machine, milk steamer',
      instructions: '1. Pull double shot of espresso\n2. Steam oat milk to 140°F\n3. Pour steamed milk into espresso\n4. Create latte art if desired\n5. Serve immediately',
      prepTime: 3,
      cookTime: 2,
      servings: 1,
      cuisine: 'Italian',
      category: 'Coffee',
      difficulty: 'medium',
      nutritionInfo: JSON.stringify({ calories: 120, protein: 4, carbs: 18, fat: 4, fiber: 2 }),
      imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&h=300&fit=crop&crop=center'
    },
    {
      name: 'Matcha Latte',
      description: 'Premium Japanese matcha with steamed milk',
      ingredients: 'Premium matcha powder, steamed milk, hot water, bamboo whisk',
      instructions: '1. Sift matcha powder into bowl\n2. Add small amount of hot water\n3. Whisk vigorously until frothy\n4. Steam milk to 140°F\n5. Pour matcha into cup\n6. Add steamed milk and stir gently',
      prepTime: 5,
      cookTime: 3,
      servings: 1,
      cuisine: 'Japanese',
      category: 'Tea',
      difficulty: 'medium',
      nutritionInfo: JSON.stringify({ calories: 140, protein: 6, carbs: 20, fat: 5, fiber: 1 }),
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center'
    },
    {
      name: 'Chai Latte',
      description: 'Spiced chai with steamed milk',
      ingredients: 'Chai concentrate, steamed milk, cinnamon, honey',
      instructions: '1. Heat chai concentrate\n2. Steam milk to 140°F\n3. Combine chai and milk\n4. Add honey to taste\n5. Sprinkle with cinnamon\n6. Serve hot',
      prepTime: 3,
      cookTime: 2,
      servings: 1,
      cuisine: 'Indian',
      category: 'Tea',
      difficulty: 'easy',
      nutritionInfo: JSON.stringify({ calories: 180, protein: 6, carbs: 25, fat: 6, fiber: 1 }),
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center'
    },
    {
      name: 'Avocado Toast',
      description: 'Sourdough toast with avocado, microgreens, and poached egg',
      ingredients: 'Sourdough bread, ripe avocado, microgreens, poached egg, sea salt, black pepper, red pepper flakes',
      instructions: '1. Toast sourdough bread\n2. Mash ripe avocado with salt and pepper\n3. Spread avocado on toast\n4. Poach egg to desired doneness\n5. Place egg on avocado\n6. Top with microgreens and red pepper flakes',
      prepTime: 8,
      cookTime: 5,
      servings: 1,
      cuisine: 'American',
      category: 'Breakfast',
      difficulty: 'medium',
      nutritionInfo: JSON.stringify({ calories: 320, protein: 12, carbs: 25, fat: 18, fiber: 8 }),
      imageUrl: 'https://images.unsplash.com/photo-1607958996338-0106d5c0c1e1?w=400&h=300&fit=crop&crop=center'
    },
    {
      name: 'Acai Bowl',
      description: 'Acai berry bowl with granola, banana, and honey',
      ingredients: 'Acai puree, granola, banana, honey, coconut flakes, chia seeds, fresh berries',
      instructions: '1. Blend acai puree until smooth\n2. Pour into serving bowl\n3. Top with granola\n4. Add sliced banana\n5. Drizzle with honey\n6. Garnish with coconut flakes, chia seeds, and berries',
      prepTime: 10,
      cookTime: 0,
      servings: 1,
      cuisine: 'Brazilian',
      category: 'Breakfast',
      difficulty: 'easy',
      nutritionInfo: JSON.stringify({ calories: 280, protein: 6, carbs: 45, fat: 8, fiber: 12 }),
      imageUrl: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop&crop=center'
    }
  ];

  // Check for existing recipes to avoid duplicates
  const existingRecipeNames = await queryInterface.sequelize.query(
    'SELECT name FROM recipes WHERE businessId = ? AND name IN (?)',
    { type: QueryTypes.SELECT, replacements: [businessId, enhancedRecipes.map(r => r.name)] }
  ) as any[];
  
  const existingRecipeNameSet = new Set(existingRecipeNames.map(recipe => recipe.name));
  const newRecipes = enhancedRecipes.filter(recipe => !existingRecipeNameSet.has(recipe.name));
  
  if (newRecipes.length === 0) {
    console.log(`⚠️ All recipes for Coffee Corner already exist, skipping recipe insertion`);
  } else {
    // Insert enhanced recipes
    await queryInterface.bulkInsert('recipes', newRecipes.map(r => ({
      businessId: businessId,
      name: r.name,
      description: r.description,
      ingredients: r.ingredients,
      instructions: r.instructions,
      prepTime: r.prepTime,
      cookTime: r.cookTime,
      servings: r.servings,
      cuisine: r.cuisine,
      category: r.category,
      difficulty: r.difficulty,
      nutritionInfo: r.nutritionInfo,
      imageUrl: r.imageUrl,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })));
    
    console.log(`✅ Inserted ${newRecipes.length} new enhanced recipes for Coffee Corner (${enhancedRecipes.length - newRecipes.length} already existed)`);
  }

  // Get or create category IDs
  const getOrCreateCategory = async (name: string) => {
    let [category] = await queryInterface.sequelize.query(
      'SELECT id FROM menu_categories WHERE businessId = ? AND name = ?',
      { type: QueryTypes.SELECT, replacements: [businessId, name] }
    ) as any[];
    
    if (!category) {
      console.log(`⚠️ Category '${name}' not found, creating it...`);
      await queryInterface.bulkInsert('menu_categories', [{
        businessId: businessId,
        name: name,
        description: `${name} menu category`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }]);
      
      // Get the newly created category
      [category] = await queryInterface.sequelize.query(
        'SELECT id FROM menu_categories WHERE businessId = ? AND name = ?',
        { type: QueryTypes.SELECT, replacements: [businessId, name] }
      ) as any[];
    }
    
    return category;
  };

  const coffeeCategory = await getOrCreateCategory('Coffee');
  const pastryCategory = await getOrCreateCategory('Pastries');
  const teaCategory = await getOrCreateCategory('Tea');
  const smoothieCategory = await getOrCreateCategory('Smoothies');

  // Enhanced Menu Items
  const enhancedMenuItems = [
    // Premium Coffees
    { categoryId: coffeeCategory.id, name: 'Ethiopian Pour Over', description: 'Single origin Ethiopian coffee with floral notes', price: 6.50, cost: 2.60, sku: 'CO-MI-COF-ETH-001', barcode: '123456789600', itemSku: 'CO-ETH-YIR-001', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop' },
    { categoryId: coffeeCategory.id, name: 'Colombian French Press', description: 'Medium roast Colombian coffee with chocolate notes', price: 6.00, cost: 2.40, sku: 'CO-MI-COF-COL-001', barcode: '123456789601', itemSku: 'CO-COL-SUP-001', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop' },
    { categoryId: coffeeCategory.id, name: 'Sumatra Cold Brew', description: 'Dark roast Indonesian cold brew with earthy notes', price: 6.25, cost: 2.50, sku: 'CO-MI-COF-SUM-001', barcode: '123456789602', itemSku: 'CO-SUM-MAN-001', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop' },
    { categoryId: coffeeCategory.id, name: 'Guatemala Antigua', description: 'Medium-dark roast Guatemalan coffee with spice notes', price: 6.75, cost: 2.70, sku: 'CO-MI-COF-GUA-001', barcode: '123456789603', itemSku: 'CO-GUA-ANT-001', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop' },
    { categoryId: coffeeCategory.id, name: 'Kenya AA', description: 'Bright Kenyan coffee with citrus and berry notes', price: 7.00, cost: 2.80, sku: 'CO-MI-COF-KEN-001', barcode: '123456789604', itemSku: 'CO-KEN-AA-001', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop' },
    { categoryId: coffeeCategory.id, name: 'Oat Milk Latte', description: 'Espresso with steamed oat milk', price: 5.50, cost: 2.20, sku: 'CO-MI-COF-OAT-001', barcode: '123456789605', itemSku: 'CO-OAT-BAR-001', imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&h=300&fit=crop' },
    { categoryId: coffeeCategory.id, name: 'Almond Milk Cappuccino', description: 'Cappuccino with steamed almond milk', price: 5.75, cost: 2.30, sku: 'CO-MI-COF-ALM-001', barcode: '123456789606', itemSku: 'CO-ALM-BAR-001', imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c06b?w=400&h=300&fit=crop' },
    { categoryId: coffeeCategory.id, name: 'Coconut Milk Mocha', description: 'Espresso with chocolate and steamed coconut milk', price: 5.25, cost: 2.10, sku: 'CO-MI-COF-COC-001', barcode: '123456789607', itemSku: 'CO-COC-BAR-001', imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&h=300&fit=crop' },
    
    // Premium Pastries
    { categoryId: pastryCategory.id, name: 'Pain au Chocolat', description: 'Buttery croissant with dark chocolate', price: 5.99, cost: 2.40, sku: 'CO-MI-PAS-PAI-001', barcode: '123456789608', itemSku: 'CO-PAS-PAI-001', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop' },
    { categoryId: pastryCategory.id, name: 'Almond Croissant', description: 'Buttery croissant with almond filling and sliced almonds', price: 6.49, cost: 2.60, sku: 'CO-MI-PAS-ALM-001', barcode: '123456789609', itemSku: 'CO-PAS-ALM-001', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop' },
    { categoryId: pastryCategory.id, name: 'Cinnamon Roll', description: 'Sweet cinnamon roll with cream cheese frosting', price: 5.49, cost: 2.20, sku: 'CO-MI-PAS-CIN-001', barcode: '123456789610', itemSku: 'CO-PAS-CIN-001', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop' },
    { categoryId: pastryCategory.id, name: 'Blueberry Scone', description: 'Buttery scone with fresh blueberries', price: 4.99, cost: 2.00, sku: 'CO-MI-PAS-SCO-001', barcode: '123456789611', itemSku: 'CO-PAS-SCO-001', imageUrl: 'https://images.unsplash.com/photo-1607958996338-0106d5c0c1e1?w=400&h=300&fit=crop' },
    
    // Premium Teas
    { categoryId: teaCategory.id, name: 'Matcha Latte', description: 'Premium Japanese matcha with steamed milk', price: 7.50, cost: 3.00, sku: 'CO-MI-TEA-MAT-001', barcode: '123456789612', itemSku: 'CO-MAT-PRE-001', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop' },
    { categoryId: teaCategory.id, name: 'Premium Earl Grey Tea', description: 'Classic Earl Grey tea with bergamot', price: 4.99, cost: 1.50, sku: 'CO-MI-TEA-EAR-001', barcode: '123456789613', itemSku: 'CO-TEA-EAR-001', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop' },
    { categoryId: teaCategory.id, name: 'Chai Latte', description: 'Spiced chai with steamed milk', price: 6.50, cost: 2.60, sku: 'CO-MI-TEA-CHA-001', barcode: '123456789614', itemSku: 'CO-CHA-CON-001', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop' },
    
    // Premium Bowls
    { categoryId: smoothieCategory.id, name: 'Acai Bowl', description: 'Acai berry bowl with granola, banana, and honey', price: 11.99, cost: 4.80, sku: 'CO-MI-BOW-ACA-001', barcode: '123456789615', itemSku: 'CO-BOW-ACA-001', imageUrl: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop' },
    { categoryId: smoothieCategory.id, name: 'Fresh Fruit Bowl', description: 'Seasonal fresh fruit medley', price: 8.99, cost: 3.60, sku: 'CO-MI-BOW-FRU-001', barcode: '123456789616', itemSku: 'CO-BOW-FRU-001', imageUrl: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop' },
    { categoryId: smoothieCategory.id, name: 'Granola Bowl', description: 'House-made granola with yogurt and honey', price: 7.99, cost: 3.20, sku: 'CO-MI-BOW-GRA-001', barcode: '123456789617', itemSku: 'CO-BOW-GRA-001', imageUrl: 'https://images.unsplash.com/photo-1607958996338-0106d5c0c1e1?w=400&h=300&fit=crop' }
  ];

  // Get item IDs for menu items - check both existing and newly created items
  const itemIds: { [key: string]: number } = {};
  
  // First check for existing items
  for (const item of enhancedItems) {
    const [dbItem] = await queryInterface.sequelize.query(
      'SELECT id FROM items WHERE sku = ? AND businessId = ?',
      { type: QueryTypes.SELECT, replacements: [item.sku, businessId] }
    ) as any[];
    if (dbItem) {
      itemIds[item.sku] = dbItem.id;
    }
  }
  
  // If items were skipped (already existed), we need to get their IDs
  if (Object.keys(itemIds).length === 0) {
    console.log('🔍 Items were skipped, fetching existing item IDs...');
    for (const item of enhancedItems) {
      const [dbItem] = await queryInterface.sequelize.query(
        'SELECT id FROM items WHERE sku = ? AND businessId = ?',
        { type: QueryTypes.SELECT, replacements: [item.sku, businessId] }
      ) as any[];
      if (dbItem) {
        itemIds[item.sku] = dbItem.id;
      }
    }
  }

  // Check for existing menu items to avoid duplicates
  const existingMenuSkus = await queryInterface.sequelize.query(
    'SELECT sku FROM menu_items WHERE businessId = ? AND sku IN (?)',
    { type: QueryTypes.SELECT, replacements: [businessId, enhancedMenuItems.map(mi => mi.sku)] }
  ) as any[];
  
  const existingMenuSkuSet = new Set(existingMenuSkus.map(item => item.sku));
  const newMenuItems = enhancedMenuItems.filter(item => !existingMenuSkuSet.has(item.sku));
  
  if (newMenuItems.length === 0) {
    console.log(`⚠️ All menu items for Coffee Corner already exist, skipping menu item insertion`);
  } else {
    // Insert enhanced menu items
    await queryInterface.bulkInsert('menu_items', newMenuItems.map(mi => ({
      businessId: businessId,
      categoryId: mi.categoryId,
      itemId: itemIds[mi.itemSku] || null,
      name: mi.name,
      description: mi.description,
      price: mi.price,
      cost: mi.cost,
      sku: mi.sku,
      barcode: mi.barcode,
      imageUrl: mi.imageUrl,
      preparationTime: 15,
      isAvailable: true,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isSpicy: false,
      createdAt: new Date(),
      updatedAt: new Date()
    })));
    
    console.log(`✅ Inserted ${newMenuItems.length} new enhanced menu items for Coffee Corner (${enhancedMenuItems.length - newMenuItems.length} already existed)`);
  }

  // Enhanced Recipe Suggestions
  const enhancedRecipeSuggestions = [
    { 
      itemSku: 'CO-ETH-YIR-001', 
      recipeName: 'Ethiopian Pour Over', 
      suggestionType: 'pairing',
      reason: 'Perfect coffee bean for pour over brewing method',
      priority: 'high',
      targetAudience: 'coffee enthusiasts',
      aiGenerated: true, 
      confidence: 0.98, 
      suggestedPrice: 6.50 
    },
    { 
      itemSku: 'CO-COL-SUP-001', 
      recipeName: 'Colombian French Press', 
      suggestionType: 'pairing',
      reason: 'Medium roast beans ideal for French press brewing',
      priority: 'high',
      targetAudience: 'coffee lovers',
      aiGenerated: true, 
      confidence: 0.97, 
      suggestedPrice: 6.00 
    },
    { 
      itemSku: 'CO-SUM-MAN-001', 
      recipeName: 'Sumatra Cold Brew', 
      suggestionType: 'pairing',
      reason: 'Dark roast beans perfect for cold brewing',
      priority: 'medium',
      targetAudience: 'cold brew fans',
      aiGenerated: true, 
      confidence: 0.96, 
      suggestedPrice: 6.25 
    },
    { 
      itemSku: 'CO-OAT-BAR-001', 
      recipeName: 'Oat Milk Latte', 
      suggestionType: 'substitution',
      reason: 'Barista oat milk creates perfect latte texture',
      priority: 'high',
      targetAudience: 'dairy-free customers',
      aiGenerated: true, 
      confidence: 0.95, 
      suggestedPrice: 5.50 
    },
    { 
      itemSku: 'CO-MAT-PRE-001', 
      recipeName: 'Matcha Latte', 
      suggestionType: 'pairing',
      reason: 'Premium matcha powder for authentic Japanese latte',
      priority: 'high',
      targetAudience: 'tea enthusiasts',
      aiGenerated: true, 
      confidence: 0.94, 
      suggestedPrice: 7.50 
    },
    { 
      itemSku: 'CO-CHA-CON-001', 
      recipeName: 'Chai Latte', 
      suggestionType: 'pairing',
      reason: 'Spiced chai concentrate for authentic Indian latte',
      priority: 'medium',
      targetAudience: 'spiced tea lovers',
      aiGenerated: true, 
      confidence: 0.93, 
      suggestedPrice: 6.50 
    },
    { 
      itemSku: 'CO-BOW-ACA-001', 
      recipeName: 'Acai Bowl', 
      suggestionType: 'enhancement',
      reason: 'Acai puree creates authentic Brazilian bowl',
      priority: 'medium',
      targetAudience: 'health-conscious customers',
      aiGenerated: true, 
      confidence: 0.92, 
      suggestedPrice: 11.99 
    },
    { 
      itemSku: 'CO-BOW-FRU-001', 
      recipeName: 'Fresh Fruit Bowl', 
      suggestionType: 'enhancement',
      reason: 'Seasonal fruits for refreshing breakfast bowl',
      priority: 'medium',
      targetAudience: 'breakfast customers',
      aiGenerated: true, 
      confidence: 0.91, 
      suggestedPrice: 8.99 
    }
  ];

  // Get recipe IDs
  const recipeIds: { [key: string]: number } = {};
  for (const recipe of enhancedRecipes) {
    const [dbRecipe] = await queryInterface.sequelize.query(
      'SELECT id FROM recipes WHERE name = ? AND businessId = ?',
      { type: QueryTypes.SELECT, replacements: [recipe.name, businessId] }
    ) as any[];
    if (dbRecipe) {
      recipeIds[recipe.name] = dbRecipe.id;
    }
  }

  // Check for existing recipe suggestions to avoid duplicates
  const existingSuggestions = await queryInterface.sequelize.query(
    'SELECT recipeId FROM recipe_suggestions WHERE businessId = ?',
    { type: QueryTypes.SELECT, replacements: [businessId] }
  ) as any[];
  
  const existingRecipeIdSet = new Set(existingSuggestions.map(s => s.recipeId));
  
  // Filter out existing suggestions and validate recipe existence
  const newSuggestions = enhancedRecipeSuggestions.filter(rs => {
    const recipeId = recipeIds[rs.recipeName];
    
    if (!recipeId) {
      console.log(`⚠️ Skipping recipe suggestion: Recipe not found for name "${rs.recipeName}"`);
      return false;
    }
    
    if (existingRecipeIdSet.has(recipeId)) {
      console.log(`ℹ️ Recipe suggestion already exists for recipe: ${rs.recipeName}`);
      return false;
    }
    
    return true;
  });
  
  if (newSuggestions.length === 0) {
    console.log(`⚠️ All recipe suggestions for Coffee Corner already exist, skipping recipe suggestion insertion`);
  } else {
    // Insert enhanced recipe suggestions
    await queryInterface.bulkInsert('recipe_suggestions', newSuggestions.map(rs => ({
      businessId: businessId,
      recipeId: recipeIds[rs.recipeName],
      suggestionType: rs.suggestionType,
      reason: rs.reason,
      priority: rs.priority,
      targetAudience: rs.targetAudience,
      isActive: true,
      aiGenerated: rs.aiGenerated,
      confidence: rs.confidence,
      suggestedPrice: rs.suggestedPrice,
      createdAt: new Date(),
      updatedAt: new Date()
    })));
    
    console.log(`✅ Inserted ${newSuggestions.length} new enhanced recipe suggestions for Coffee Corner (${enhancedRecipeSuggestions.length - newSuggestions.length} already existed)`);
  }

  // Add items specifically for smart recipe suggestions testing
  console.log('🧪 Adding items for smart recipe suggestions testing...');
  
  const smartTestItems = [
    // Items that are expiring soon (within 3 days)
    {
      name: 'Fresh Milk (Expiring Soon)',
      description: 'Fresh whole milk for coffee and lattes',
      price: 3.99,
      cost: 1.80,
      stock: 10,
      sku: 'CO-SMART-MIL-EXP-001',
      barcode: '123456789600',
      category: 'Dairy',
      unit: 'liter',
      minStock: 5,
      maxStock: 20,
      imageUrl: 'https://images.unsplash.com/photo-1618377382884-c6c2c3c3c3c3?w=400&h=300&fit=crop&crop=center',
      isPerishable: true,
      expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Expires tomorrow
      manufacturingDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      shelfLifeDays: 3,
      isExpiringSoon: true,
      isUnderperforming: false,
      salesVelocity: 0.08,
      daysSinceLastSale: 3
    },
    {
      name: 'Fresh Cream (Expiring Soon)',
      description: 'Heavy cream for coffee and desserts',
      price: 4.99,
      cost: 2.20,
      stock: 6,
      sku: 'CO-SMART-CRE-EXP-001',
      barcode: '123456789601',
      category: 'Dairy',
      unit: 'liter',
      minStock: 2,
      maxStock: 10,
      imageUrl: 'https://images.unsplash.com/photo-1618377382884-c6c2c3c3c3c3?w=400&h=300&fit=crop&crop=center',
      isPerishable: true,
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Expires in 2 days
      manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      shelfLifeDays: 3,
      isExpiringSoon: true,
      isUnderperforming: false,
      salesVelocity: 0.06,
      daysSinceLastSale: 4
    },
    {
      name: 'Fresh Berries (Expiring Soon)',
      description: 'Fresh mixed berries for smoothies and bowls',
      price: 8.99,
      cost: 4.50,
      stock: 8,
      sku: 'CO-SMART-BER-EXP-001',
      barcode: '123456789602',
      category: 'Fruits',
      unit: 'kg',
      minStock: 2,
      maxStock: 8,
      imageUrl: 'https://images.unsplash.com/photo-1618377382884-c6c2c3c3c3c3?w=400&h=300&fit=crop&crop=center',
      isPerishable: true,
      expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Expires tomorrow
      manufacturingDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      shelfLifeDays: 3,
      isExpiringSoon: true,
      isUnderperforming: false,
      salesVelocity: 0.12,
      daysSinceLastSale: 2
    },
    
    // Items that are underperforming (low sales velocity)
    {
      name: 'Premium Vanilla Extract (Underperforming)',
      description: 'Pure Madagascar vanilla extract for baking',
      price: 24.99,
      cost: 12.00,
      stock: 4,
      sku: 'CO-SMART-VAN-UND-001',
      barcode: '123456789603',
      category: 'Baking',
      unit: 'bottle',
      minStock: 1,
      maxStock: 6,
      imageUrl: 'https://images.unsplash.com/photo-1618377382884-c6c2c3c3c3c3?w=400&h=300&fit=crop&crop=center',
      isPerishable: false,
      expirationDate: null,
      manufacturingDate: null,
      shelfLifeDays: null,
      isExpiringSoon: false,
      isUnderperforming: true,
      salesVelocity: 0.02, // Very low sales velocity
      daysSinceLastSale: 48 // Not sold in 48 days
    },
    {
      name: 'Premium Cinnamon (Underperforming)',
      description: 'Ceylon cinnamon for coffee and baking',
      price: 18.99,
      cost: 9.00,
      stock: 6,
      sku: 'CO-SMART-CIN-UND-001',
      barcode: '123456789604',
      category: 'Spices',
      unit: 'jar',
      minStock: 1,
      maxStock: 8,
      imageUrl: 'https://images.unsplash.com/photo-1618377382884-c6c2c3c3c3c3?w=400&h=300&fit=crop&crop=center',
      isPerishable: false,
      expirationDate: null,
      manufacturingDate: null,
      shelfLifeDays: null,
      isExpiringSoon: false,
      isUnderperforming: true,
      salesVelocity: 0.03, // Low sales velocity
      daysSinceLastSale: 35 // Not sold in 35 days
    },
    {
      name: 'Premium Honey (Underperforming)',
      description: 'Raw wildflower honey for coffee and tea',
      price: 16.99,
      cost: 8.50,
      stock: 5,
      sku: 'CO-SMART-HON-UND-001',
      barcode: '123456789605',
      category: 'Sweeteners',
      unit: 'jar',
      minStock: 1,
      maxStock: 6,
      imageUrl: 'https://images.unsplash.com/photo-1618377382884-c6c2c3c3c3c3?w=400&h=300&fit=crop&crop=center',
      isPerishable: false,
      expirationDate: null,
      manufacturingDate: null,
      shelfLifeDays: null,
      isExpiringSoon: false,
      isUnderperforming: true,
      salesVelocity: 0.04, // Low sales velocity
      daysSinceLastSale: 29 // Not sold in 29 days
    }
  ];

  // Check for existing smart test items to avoid duplicates
  const existingSmartSkus = await queryInterface.sequelize.query(
    'SELECT sku FROM items WHERE businessId = ? AND sku IN (?)',
    { type: QueryTypes.SELECT, replacements: [businessId, smartTestItems.map(i => i.sku)] }
  ) as any[];
  
  const existingSmartSkuSet = new Set(existingSmartSkus.map(item => item.sku));
  const newSmartItems = smartTestItems.filter(item => !existingSmartSkuSet.has(item.sku));
  
  if (newSmartItems.length === 0) {
    console.log(`⚠️ All smart test items for Coffee Corner already exist, skipping insertion`);
  } else {
    // Insert smart test items
    await queryInterface.bulkInsert('items', newSmartItems.map(i => ({
      businessId: businessId,
      name: i.name,
      description: i.description,
      price: i.price,
      cost: i.cost,
      stock: i.stock,
      sku: i.sku,
      barcode: i.barcode,
      category: i.category,
      unit: i.unit,
      minStock: i.minStock,
      maxStock: i.maxStock,
      imageUrl: i.imageUrl,
      isActive: true,
      isPerishable: i.isPerishable || false,
      expirationDate: i.expirationDate || null,
      manufacturingDate: i.manufacturingDate || null,
      shelfLifeDays: i.shelfLifeDays || null,
      lastSoldDate: null,
      salesVelocity: i.salesVelocity || 0,
      daysSinceLastSale: i.daysSinceLastSale || 0,
      isUnderperforming: i.isUnderperforming || false,
      isExpiringSoon: i.isExpiringSoon || false,
      createdAt: new Date(),
      updatedAt: new Date()
    })));
    
    console.log(`✅ Inserted ${newSmartItems.length} new smart test items for Coffee Corner (${smartTestItems.length - newSmartItems.length} already existed)`);
  }

  // 🚀 MASSIVE RECIPE GENERATION - Take it to the next level!
  console.log('🚀 Generating MASSIVE amounts of additional Coffee recipes...');
  
  const coffeeRecipeTemplates = [
    { base: 'Coffee', variations: ['Americano', 'Cappuccino', 'Latte', 'Mocha', 'Macchiato', 'Flat White', 'Cortado', 'Piccolo', 'Long Black', 'Ristretto', 'Espresso', 'Doppio', 'Lungo', 'Con Panna', 'Affogato', 'Cafe au Lait', 'Cafe Breve', 'Cafe Misto', 'Cafe Con Leche', 'Cafe Bombon'] },
    { base: 'Tea', variations: ['Green', 'Black', 'Herbal', 'Chai', 'Matcha', 'Earl Grey', 'Jasmine', 'Oolong', 'Rooibos', 'Chamomile', 'Peppermint', 'Lavender', 'Rose', 'Hibiscus', 'Lemongrass', 'Ginger', 'Turmeric', 'Cinnamon', 'Vanilla', 'Bergamot'] },
    { base: 'Smoothie', variations: ['Berry', 'Green', 'Tropical', 'Protein', 'Acai', 'Mango', 'Strawberry', 'Banana', 'Pineapple', 'Mixed Fruit', 'Peach', 'Blueberry', 'Raspberry', 'Blackberry', 'Cherry', 'Orange', 'Lemon', 'Lime', 'Grape', 'Apple'] },
    { base: 'Bowl', variations: ['Acai', 'Poke', 'Buddha', 'Grain', 'Fruit', 'Yogurt', 'Smoothie', 'Breakfast', 'Lunch', 'Dinner', 'Quinoa', 'Oatmeal', 'Chia', 'Granola', 'Muesli', 'Cereal', 'Rice', 'Noodle', 'Salad', 'Dessert'] },
    { base: 'Pastry', variations: ['Croissant', 'Danish', 'Muffin', 'Scone', 'Biscotti', 'Cookie', 'Brownie', 'Cake', 'Tart', 'Pie', 'Donut', 'Bagel', 'Bread', 'Roll', 'Bun', 'Sticky Bun', 'Cinnamon Roll', 'Pain au Chocolat', 'Almond Croissant', 'Cheese Danish'] },
    { base: 'Sandwich', variations: ['Breakfast', 'Lunch', 'Veggie', 'Chicken', 'Turkey', 'Ham', 'Cheese', 'Egg', 'Bacon', 'Avocado', 'Tuna', 'Salmon', 'Roast Beef', 'Pastrami', 'Corned Beef', 'BLT', 'Club', 'Reuben', 'Monte Cristo', 'Grilled Cheese'] },
    { base: 'Salad', variations: ['Garden', 'Caesar', 'Greek', 'Cobb', 'Wedge', 'Spinach', 'Kale', 'Arugula', 'Mixed Greens', 'Fruit', 'Grain', 'Pasta', 'Potato', 'Macaroni', 'Coleslaw', 'Waldorf', 'Nicoise', 'Caprese', 'Antipasto', 'Insalata'] }
  ];

  // Generate 500-1000 additional recipes for Coffee Corner
  const additionalRecipesPerTemplate = 50 + Math.floor(Math.random() * 50); // 50-100 recipes per template
  
  for (const template of coffeeRecipeTemplates) {
    for (let i = 0; i < additionalRecipesPerTemplate; i++) {
      const variation = template.variations[Math.floor(Math.random() * template.variations.length)] || 'Classic';
      const recipeName = `${variation} ${template.base} ${i + 1}`;
      
      const recipe = {
        businessId,
        name: recipeName,
        description: `Premium ${variation.toLowerCase()} ${template.base.toLowerCase()} made with artisanal methods`,
        ingredients: `Premium ingredients, fresh herbs, quality spices, artisanal methods`,
        instructions: `Prepare ${variation.toLowerCase()} ingredients using artisanal techniques, combine with ${template.base.toLowerCase()} base, serve premium`,
        prepTime: 10 + Math.floor(Math.random() * 30),
        cookTime: 5 + Math.floor(Math.random() * 25),
        servings: 1 + Math.floor(Math.random() * 4),
        difficulty: Math.random() > 0.7 ? 'hard' : Math.random() > 0.4 ? 'medium' : 'easy',
        cuisine: 'International',
        category: template.base.toLowerCase(),
        nutritionInfo: JSON.stringify({
          calories: Math.floor(Math.random() * 500) + 100,
          protein: Math.floor(Math.random() * 25) + 5,
          carbs: Math.floor(Math.random() * 50) + 10,
          fat: Math.floor(Math.random() * 20) + 2
        }),
        imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&crop=center',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await queryInterface.bulkInsert('recipes', [recipe]);
    }
    console.log(`✅ Generated ${additionalRecipesPerTemplate} additional ${template.base} recipes`);
  }

  console.log(`🚀 MASSIVE Coffee recipe generation completed!`);

  // 🚀 MASSIVE ITEM GENERATION - Take it to the next level!
  console.log('🚀 Generating MASSIVE amounts of additional Coffee items...');
  
  // Generate 1000-2000 additional items for Coffee Corner
  const additionalItemsCount = 1000 + Math.floor(Math.random() * 1000); // 1000-2000 items
  
  const coffeeItemCategories = ['coffee', 'tea', 'dairy', 'pastry', 'bread', 'fruits', 'sweeteners', 'syrups', 'ingredients', 'beverages', 'desserts', 'snacks', 'condiments', 'toppings', 'garnishes'];
  const coffeeItemNames = [
    'Ethiopian Yirgacheffe', 'Colombian Supremo', 'Brazilian Santos', 'Guatemalan Antigua', 'Kenyan AA', 'Costa Rican Tarrazu', 'Panamanian Geisha', 'Jamaican Blue Mountain', 'Hawaiian Kona', 'Sumatra Mandheling',
    'Earl Grey Tea', 'Green Tea', 'Chamomile Tea', 'Peppermint Tea', 'Rooibos Tea', 'Oolong Tea', 'Jasmine Tea', 'Matcha Powder', 'Chai Spice', 'Herbal Blend',
    'Fresh Milk', 'Almond Milk', 'Oat Milk', 'Soy Milk', 'Coconut Milk', 'Cashew Milk', 'Hemp Milk', 'Rice Milk', 'Heavy Cream', 'Half and Half',
    'Vanilla Syrup', 'Caramel Syrup', 'Hazelnut Syrup', 'Chocolate Syrup', 'Pumpkin Spice Syrup', 'Peppermint Syrup', 'Cinnamon Syrup', 'Lavender Syrup', 'Rose Syrup', 'Maple Syrup',
    'Croissant Dough', 'Danish Dough', 'Muffin Mix', 'Scone Mix', 'Biscotti Dough', 'Cookie Dough', 'Brownie Mix', 'Cake Mix', 'Tart Shells', 'Pie Crust',
    'Fresh Berries', 'Bananas', 'Apples', 'Oranges', 'Lemons', 'Limes', 'Mangoes', 'Pineapples', 'Strawberries', 'Blueberries',
    'Raw Sugar', 'Brown Sugar', 'Honey', 'Agave Nectar', 'Stevia', 'Monk Fruit', 'Maple Syrup', 'Molasses', 'Coconut Sugar', 'Date Syrup'
  ];

  for (let i = 0; i < additionalItemsCount; i++) {
    const category = coffeeItemCategories[Math.floor(Math.random() * coffeeItemCategories.length)] || 'ingredients';
    const baseName = coffeeItemNames[Math.floor(Math.random() * coffeeItemNames.length)] || 'Premium Coffee Item';
    const itemName = `${baseName} ${i + 1}`;
    
    const item = {
      businessId,
      name: itemName,
      description: `Premium ${category} for artisanal coffee and cafe cuisine`,
      price: 0, // Items don't have direct prices
      cost: Math.round((Math.random() * 100 + 1) * 100) / 100, // $1-$101
      stock: Math.floor(Math.random() * 200) + 10, // 10-210
      sku: `CO-MASS-${category.toUpperCase().substring(0, 3)}-${(i + 1000).toString().padStart(4, '0')}`,
      barcode: `123456789${(i + 3000).toString().padStart(6, '0')}`,
      category,
      unit: ['pieces', 'pounds', 'kilograms', 'grams', 'ounces', 'bottles', 'jars', 'cans', 'bags', 'packets', 'sachets'][Math.floor(Math.random() * 11)],
      minStock: 5,
      maxStock: 500,
      imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&crop=center',
      isActive: true,
      isPerishable: Math.random() > 0.3,
      expirationDate: new Date(Date.now() + Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000),
      manufacturingDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
      shelfLifeDays: Math.floor(Math.random() * 365) + 1,
      lastSoldDate: null,
      salesVelocity: Math.random() * 2,
      daysSinceLastSale: Math.floor(Math.random() * 30),
      isUnderperforming: Math.random() > 0.8,
      isExpiringSoon: Math.random() > 0.9,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await queryInterface.bulkInsert('items', [item]);
  }

  console.log(`🚀 MASSIVE Coffee item generation completed! Generated ${additionalItemsCount} additional items`);

  console.log('🎉 Coffee Corner world-class enhancement complete!');
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Get business ID for Coffee Corner
  const [business] = await queryInterface.sequelize.query(
    'SELECT id FROM businesses WHERE slug = ?',
    { type: QueryTypes.SELECT, replacements: ['coffee-corner'] }
  ) as any[];
  
  if (!business) {
    console.log('Coffee Corner business not found, skipping cleanup');
    return;
  }
  
  const businessId = business.id;

  // Clean up in reverse order
  await queryInterface.bulkDelete('recipe_suggestions', { businessId });
  await queryInterface.bulkDelete('menu_items', { businessId });
  await queryInterface.bulkDelete('recipes', { businessId });
  await queryInterface.bulkDelete('items', { businessId });

  console.log('🧹 Cleaned up Coffee Corner world-class enhancement');
} 