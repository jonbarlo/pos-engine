import { QueryInterface, QueryTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  console.log('🍣 Adding Sushi Master Restaurant Data...');
  
  // Find existing Sushi Master business (created by comprehensive seeder)
  const businesses = await queryInterface.sequelize.query(
    'SELECT id, name, slug FROM businesses WHERE slug = ? ORDER BY id',
    { type: QueryTypes.SELECT, replacements: ['sushi-master'] }
  ) as any[];
  
  if (!businesses || businesses.length === 0) {
    throw new Error('Sushi Master business not found. Please run the comprehensive seeder first.');
  }
  
  const business = businesses[0];
  const businessId = business.id;
  console.log(`✅ Found Sushi Master business ID: ${businessId} (${business.name})`);
  
  if (businesses.length > 1) {
    console.log(`⚠️ Warning: Found ${businesses.length} businesses with slug 'sushi-master', using ID ${businessId}`);
  }

  // Helper function to generate random stock between 5 and 20
  const getRandomStock = () => Math.floor(Math.random() * 16) + 5;

  // Enhanced Items for Sushi Master - Inspired by Sukiyabashi Jiro, Jiro Ono
  const enhancedItems = [
    // Premium Sushi Ingredients
    { name: 'Premium Bluefin Tuna Otoro', description: 'Fatty bluefin tuna belly for premium nigiri', price: 18.99, cost: 12.50, stock: getRandomStock(), sku: 'SU-NIG-OTO-001', barcode: '123456789300', category: 'Nigiri', unit: 'piece', minStock: 3, maxStock: 20, imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 1 },
    { name: 'Premium Uni (Sea Urchin)', description: 'Fresh Hokkaido sea urchin for premium nigiri', price: 22.99, cost: 15.00, stock: getRandomStock(), sku: 'SU-NIG-UNI-001', barcode: '123456789301', category: 'Nigiri', unit: 'piece', minStock: 2, maxStock: 15, imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 1 },
    { name: 'Premium Hamachi Toro', description: 'Fatty yellowtail belly for premium nigiri', price: 16.99, cost: 10.50, stock: getRandomStock(), sku: 'SU-NIG-HAM-001', barcode: '123456789302', category: 'Nigiri', unit: 'piece', minStock: 4, maxStock: 25, imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 1 },
    { name: 'Premium Salmon Toro', description: 'Fatty salmon belly for premium nigiri', price: 14.99, cost: 9.00, stock: getRandomStock(), sku: 'SU-NIG-SAL-001', barcode: '123456789303', category: 'Nigiri', unit: 'piece', minStock: 5, maxStock: 30, imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 1 },
    
    // Premium Roll Ingredients
    { name: 'Premium Dragon Roll Mix', description: 'Eel, avocado, cucumber, tempura shrimp, eel sauce', price: 18.99, cost: 9.50, stock: getRandomStock(), sku: 'SU-ROL-DRA-001', barcode: '123456789304', category: 'Rolls', unit: 'piece', minStock: 4, maxStock: 30, imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 2 },
    { name: 'Premium Rainbow Roll Mix', description: 'Assorted premium fish, avocado, cucumber', price: 20.99, cost: 11.00, stock: getRandomStock(), sku: 'SU-ROL-RAI-001', barcode: '123456789305', category: 'Rolls', unit: 'piece', minStock: 3, maxStock: 25, imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 2 },
    { name: 'Premium Spider Roll Mix', description: 'Soft shell crab, avocado, cucumber, spicy mayo', price: 19.99, cost: 10.50, stock: getRandomStock(), sku: 'SU-ROL-SPI-001', barcode: '123456789306', category: 'Rolls', unit: 'piece', minStock: 4, maxStock: 28, imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 2 },
    { name: 'Premium Volcano Roll Mix', description: 'Spicy tuna, avocado, cucumber, spicy mayo, tempura flakes', price: 21.99, cost: 11.50, stock: getRandomStock(), sku: 'SU-ROL-VOL-001', barcode: '123456789307', category: 'Rolls', unit: 'piece', minStock: 3, maxStock: 22, imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 2 },
    
    // Premium Sashimi
    { name: 'Premium Bluefin Tuna Sashimi', description: 'Fresh bluefin tuna sashimi', price: 24.99, cost: 16.00, stock: getRandomStock(), sku: 'SU-SAS-TUN-001', barcode: '123456789308', category: 'Sashimi', unit: 'portion', minStock: 2, maxStock: 15, imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 1 },
    { name: 'Premium Salmon Sashimi', description: 'Fresh salmon sashimi', price: 18.99, cost: 11.00, stock: getRandomStock(), sku: 'SU-SAS-SAL-001', barcode: '123456789309', category: 'Sashimi', unit: 'portion', minStock: 3, maxStock: 20, imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 1 },
    { name: 'Premium Hamachi Sashimi', description: 'Fresh yellowtail sashimi', price: 20.99, cost: 12.50, stock: getRandomStock(), sku: 'SU-SAS-HAM-001', barcode: '123456789310', category: 'Sashimi', unit: 'portion', minStock: 3, maxStock: 18, imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 1 },
    
    // Premium Appetizers
    { name: 'Premium Edamame', description: 'Steamed soybeans with sea salt and truffle oil', price: 8.99, cost: 3.50, stock: getRandomStock(), sku: 'SU-APP-EDA-001', barcode: '123456789311', category: 'Appetizer', unit: 'portion', minStock: 8, maxStock: 50, imageUrl: 'https://images.unsplash.com/photo-1572441713131-4d09e94d8b09?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 4 },
    { name: 'Premium Gyoza', description: 'Pork and vegetable dumplings with dipping sauce', price: 12.99, cost: 5.50, stock: getRandomStock(), sku: 'SU-APP-GYO-001', barcode: '123456789312', category: 'Appetizer', unit: 'piece', minStock: 6, maxStock: 40, imageUrl: 'https://images.unsplash.com/photo-1572441713131-4d09e94d8b09?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 3 },
    { name: 'Premium Tempura Mix', description: 'Shrimp, vegetables, tempura batter with dipping sauce', price: 16.99, cost: 7.50, stock: getRandomStock(), sku: 'SU-TEM-PRE-001', barcode: '123456789313', category: 'Tempura', unit: 'portion', minStock: 5, maxStock: 35, imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 2 },
    
    // Premium Soups
    { name: 'Premium Miso Soup', description: 'Traditional miso soup with tofu and seaweed', price: 6.99, cost: 2.50, stock: getRandomStock(), sku: 'SU-SOU-MIS-001', barcode: '123456789314', category: 'Soup', unit: 'bowl', minStock: 10, maxStock: 80, imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop&crop=center', isPerishable: false },
    { name: 'Premium Ramen', description: 'Rich pork broth ramen with chashu, egg, and vegetables', price: 18.99, cost: 8.50, stock: getRandomStock(), sku: 'SU-SOU-RAM-001', barcode: '123456789315', category: 'Soup', unit: 'bowl', minStock: 4, maxStock: 25, imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 2 },
    
    // Premium Beverages
    { name: 'Premium Junmai Daiginjo Sake', description: 'Premium Japanese sake', price: 32.99, cost: 18.00, stock: getRandomStock(), sku: 'SU-BEV-SAK-001', barcode: '123456789316', category: 'Beverage', unit: 'bottle', minStock: 2, maxStock: 15, imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop&crop=center', isPerishable: false },
    { name: 'Premium Matcha Green Tea', description: 'Premium Japanese matcha green tea', price: 5.99, cost: 2.00, stock: getRandomStock(), sku: 'SU-BEV-MAT-001', barcode: '123456789317', category: 'Beverage', unit: 'cup', minStock: 15, maxStock: 100, imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center', isPerishable: false },
    
    // Premium Desserts
    { name: 'Premium Mochi Ice Cream', description: 'Rice flour ice cream dessert with assorted flavors', price: 8.99, cost: 3.50, stock: getRandomStock(), sku: 'SU-DES-MOC-001', barcode: '123456789318', category: 'Dessert', unit: 'piece', minStock: 8, maxStock: 50, imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 8 },
    { name: 'Premium Green Tea Ice Cream', description: 'Premium matcha green tea ice cream', price: 7.99, cost: 3.00, stock: getRandomStock(), sku: 'SU-DES-GRE-001', barcode: '123456789319', category: 'Dessert', unit: 'scoop', minStock: 10, maxStock: 60, imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 8 }
  ];

  // Check for existing items to avoid duplicates
  const existingSkus = await queryInterface.sequelize.query(
    'SELECT sku FROM items WHERE businessId = ? AND sku IN (?)',
    { type: QueryTypes.SELECT, replacements: [businessId, enhancedItems.map(i => i.sku)] }
  ) as any[];
  
  const existingSkuSet = new Set(existingSkus.map(item => item.sku));
  const newItems = enhancedItems.filter(item => !existingSkuSet.has(item.sku));
  
  if (newItems.length === 0) {
    console.log(`⚠️ All items for Sushi Master already exist, skipping item insertion`);
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
    
    console.log(`✅ Inserted ${newItems.length} new enhanced items for Sushi Master (${enhancedItems.length - newItems.length} already existed)`);
  }

  // Enhanced Recipes for Sushi Master
  const enhancedRecipes = [
    {
      name: 'Premium Bluefin Tuna Otoro Nigiri',
      description: 'Fatty bluefin tuna belly nigiri with premium sushi rice',
      ingredients: 'Premium sushi rice, bluefin tuna otoro, wasabi, soy sauce, rice vinegar, nori',
      instructions: '1. Prepare premium sushi rice with vinegar\n2. Cut otoro into perfect slices\n3. Form rice into small ovals\n4. Add small amount of wasabi\n5. Place otoro on top and press gently\n6. Serve with soy sauce',
      prepTime: 20,
      cookTime: 0,
      difficulty: 'hard',
      imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&crop=center'
    },
    {
      name: 'Premium Uni Nigiri',
      description: 'Fresh Hokkaido sea urchin nigiri',
      ingredients: 'Premium sushi rice, fresh uni, wasabi, soy sauce, rice vinegar, nori',
      instructions: '1. Prepare premium sushi rice\n2. Carefully extract uni from shell\n3. Form rice into ovals\n4. Add wasabi\n5. Place uni gently on rice\n6. Serve immediately',
      prepTime: 25,
      cookTime: 0,
      difficulty: 'hard',
      imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&crop=center'
    },
    {
      name: 'Premium Dragon Roll',
      description: 'Eel, avocado, cucumber, tempura shrimp roll with eel sauce',
      ingredients: 'Sushi rice, nori, eel, avocado, cucumber, tempura shrimp, eel sauce, sesame seeds',
      instructions: '1. Prepare sushi rice\n2. Make tempura shrimp\n3. Place nori on bamboo mat\n4. Layer eel, avocado, cucumber\n5. Add tempura shrimp\n6. Roll tightly and top with eel sauce',
      prepTime: 30,
      cookTime: 5,
      difficulty: 'hard',
      imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&crop=center'
    },
    {
      name: 'Premium Rainbow Roll',
      description: 'Assorted premium fish, avocado, cucumber roll',
      ingredients: 'Sushi rice, nori, salmon, tuna, yellowtail, avocado, cucumber, sesame seeds',
      instructions: '1. Prepare sushi rice\n2. Place nori on bamboo mat\n3. Layer avocado and cucumber\n4. Add assorted fish slices\n5. Roll tightly\n6. Garnish with sesame seeds',
      prepTime: 25,
      cookTime: 0,
      difficulty: 'medium',
      imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&crop=center'
    },
    {
      name: 'Premium Spider Roll',
      description: 'Soft shell crab, avocado, cucumber roll with spicy mayo',
      ingredients: 'Sushi rice, nori, soft shell crab, avocado, cucumber, spicy mayo, sesame seeds',
      instructions: '1. Prepare sushi rice\n2. Fry soft shell crab\n3. Place nori on bamboo mat\n4. Add crab, avocado, cucumber\n5. Roll and top with spicy mayo\n6. Garnish with sesame seeds',
      prepTime: 28,
      cookTime: 8,
      difficulty: 'medium',
      imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&crop=center'
    },
    {
      name: 'Premium Volcano Roll',
      description: 'Spicy tuna, avocado, cucumber roll with spicy mayo and tempura flakes',
      ingredients: 'Sushi rice, nori, spicy tuna, avocado, cucumber, spicy mayo, tempura flakes',
      instructions: '1. Mix tuna with spicy mayo\n2. Place nori on bamboo mat\n3. Add spicy tuna, avocado, cucumber\n4. Roll tightly\n5. Top with spicy mayo and tempura flakes',
      prepTime: 22,
      cookTime: 0,
      difficulty: 'medium',
      imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&crop=center'
    },
    {
      name: 'Premium Ramen',
      description: 'Rich pork broth ramen with chashu, egg, and vegetables',
      ingredients: 'Ramen noodles, pork broth, chashu, soft-boiled egg, green onions, nori, bamboo shoots',
      instructions: '1. Prepare pork broth\n2. Cook ramen noodles\n3. Soft-boil eggs\n4. Slice chashu\n5. Assemble with toppings\n6. Serve hot',
      prepTime: 45,
      cookTime: 20,
      difficulty: 'hard',
      imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop&crop=center'
    }
  ];

  // Insert enhanced recipes
  await queryInterface.bulkInsert('recipes', enhancedRecipes.map(r => ({
    businessId: businessId,
    name: r.name,
    description: r.description,
    ingredients: r.ingredients,
    instructions: r.instructions,
    prepTime: r.prepTime,
    cookTime: r.cookTime,
    servings: 2,
    difficulty: r.difficulty,
    cuisine: 'Japanese',
    category: 'Premium',
    nutritionInfo: JSON.stringify({
      calories: 280,
      protein: 18,
      carbs: 35,
      fat: 8
    }),
    imageUrl: r.imageUrl,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  })));

  console.log(`✅ Inserted ${enhancedRecipes.length} enhanced recipes for Sushi Master`);

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

  const nigiriCategory = await getOrCreateCategory('Nigiri');
  const rollsCategory = await getOrCreateCategory('Rolls');
  const sashimiCategory = await getOrCreateCategory('Sashimi');
  const appetizerCategory = await getOrCreateCategory('Appetizer');
  const soupCategory = await getOrCreateCategory('Soups');
  const beverageCategory = await getOrCreateCategory('Beverages');
  const dessertCategory = await getOrCreateCategory('Desserts');

  // Enhanced Menu Items
  const enhancedMenuItems = [
    // Premium Nigiri
    { categoryId: nigiriCategory.id, name: 'Premium Bluefin Tuna Otoro', description: 'Fatty bluefin tuna belly nigiri', price: 18.99, cost: 12.50, sku: 'SU-MI-NIG-OTO-001', barcode: '123456789400', itemSku: 'SU-NIG-OTO-001', imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop' },
    { categoryId: nigiriCategory.id, name: 'Premium Uni Nigiri', description: 'Fresh Hokkaido sea urchin nigiri', price: 22.99, cost: 15.00, sku: 'SU-MI-NIG-UNI-001', barcode: '123456789401', itemSku: 'SU-NIG-UNI-001', imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop' },
    { categoryId: nigiriCategory.id, name: 'Premium Hamachi Toro', description: 'Fatty yellowtail belly nigiri', price: 16.99, cost: 10.50, sku: 'SU-MI-NIG-HAM-001', barcode: '123456789402', itemSku: 'SU-NIG-HAM-001', imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop' },
    { categoryId: nigiriCategory.id, name: 'Premium Salmon Toro', description: 'Fatty salmon belly nigiri', price: 14.99, cost: 9.00, sku: 'SU-MI-NIG-SAL-001', barcode: '123456789403', itemSku: 'SU-NIG-SAL-001', imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop' },
    
    // Premium Rolls
    { categoryId: rollsCategory.id, name: 'Premium Dragon Roll', description: 'Eel, avocado, cucumber, tempura shrimp with eel sauce', price: 18.99, cost: 9.50, sku: 'SU-MI-ROL-DRA-001', barcode: '123456789404', itemSku: 'SU-ROL-DRA-001', imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop' },
    { categoryId: rollsCategory.id, name: 'Premium Rainbow Roll', description: 'Assorted premium fish, avocado, cucumber', price: 20.99, cost: 11.00, sku: 'SU-MI-ROL-RAI-001', barcode: '123456789405', itemSku: 'SU-ROL-RAI-001', imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop' },
    { categoryId: rollsCategory.id, name: 'Premium Spider Roll', description: 'Soft shell crab, avocado, cucumber with spicy mayo', price: 19.99, cost: 10.50, sku: 'SU-MI-ROL-SPI-001', barcode: '123456789406', itemSku: 'SU-ROL-SPI-001', imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop' },
    { categoryId: rollsCategory.id, name: 'Premium Volcano Roll', description: 'Spicy tuna, avocado, cucumber with spicy mayo and tempura flakes', price: 21.99, cost: 11.50, sku: 'SU-MI-ROL-VOL-001', barcode: '123456789407', itemSku: 'SU-ROL-VOL-001', imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop' },
    
    // Premium Sashimi
    { categoryId: sashimiCategory.id, name: 'Premium Bluefin Tuna Sashimi', description: 'Fresh bluefin tuna sashimi', price: 24.99, cost: 16.00, sku: 'SU-MI-SAS-TUN-001', barcode: '123456789408', itemSku: 'SU-SAS-TUN-001', imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop' },
    { categoryId: sashimiCategory.id, name: 'Premium Salmon Sashimi', description: 'Fresh salmon sashimi', price: 18.99, cost: 11.00, sku: 'SU-MI-SAS-SAL-001', barcode: '123456789409', itemSku: 'SU-SAS-SAL-001', imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop' },
    { categoryId: sashimiCategory.id, name: 'Premium Hamachi Sashimi', description: 'Fresh yellowtail sashimi', price: 20.99, cost: 12.50, sku: 'SU-MI-SAS-HAM-001', barcode: '123456789410', itemSku: 'SU-SAS-HAM-001', imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop' },
    
    // Premium Appetizers
    { categoryId: appetizerCategory.id, name: 'Premium Edamame', description: 'Steamed soybeans with sea salt and truffle oil', price: 8.99, cost: 3.50, sku: 'SU-MI-APP-EDA-001', barcode: '123456789411', itemSku: 'SU-APP-EDA-001', imageUrl: 'https://images.unsplash.com/photo-1572441713131-4d09e94d8b09?w=400&h=300&fit=crop' },
    { categoryId: appetizerCategory.id, name: 'Premium Gyoza', description: 'Pork and vegetable dumplings with dipping sauce', price: 12.99, cost: 5.50, sku: 'SU-MI-APP-GYO-001', barcode: '123456789412', itemSku: 'SU-APP-GYO-001', imageUrl: 'https://images.unsplash.com/photo-1572441713131-4d09e94d8b09?w=400&h=300&fit=crop' },
    { categoryId: appetizerCategory.id, name: 'Premium Tempura', description: 'Shrimp, vegetables, tempura batter with dipping sauce', price: 16.99, cost: 7.50, sku: 'SU-MI-TEM-PRE-001', barcode: '123456789413', itemSku: 'SU-TEM-PRE-001', imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop' },
    
    // Premium Soups
    { categoryId: soupCategory.id, name: 'Premium Miso Soup', description: 'Traditional miso soup with tofu and seaweed', price: 6.99, cost: 2.50, sku: 'SU-MI-SOU-MIS-001', barcode: '123456789414', itemSku: 'SU-SOU-MIS-001', imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop' },
    { categoryId: soupCategory.id, name: 'Premium Ramen', description: 'Rich pork broth ramen with chashu, egg, and vegetables', price: 18.99, cost: 8.50, sku: 'SU-MI-SOU-RAM-001', barcode: '123456789415', itemSku: 'SU-SOU-RAM-001', imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop' },
    
    // Premium Beverages
    { categoryId: beverageCategory.id, name: 'Premium Junmai Daiginjo Sake', description: 'Premium Japanese sake', price: 32.99, cost: 18.00, sku: 'SU-MI-BEV-SAK-001', barcode: '123456789416', itemSku: 'SU-BEV-SAK-001', imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop' },
    { categoryId: beverageCategory.id, name: 'Premium Matcha Green Tea', description: 'Premium Japanese matcha green tea', price: 5.99, cost: 2.00, sku: 'SU-MI-BEV-MAT-001', barcode: '123456789417', itemSku: 'SU-BEV-MAT-001', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop' },
    
    // Premium Desserts
    { categoryId: dessertCategory.id, name: 'Premium Mochi Ice Cream', description: 'Rice flour ice cream dessert with assorted flavors', price: 8.99, cost: 3.50, sku: 'SU-MI-DES-MOC-001', barcode: '123456789418', itemSku: 'SU-DES-MOC-001', imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop' },
    { categoryId: dessertCategory.id, name: 'Premium Green Tea Ice Cream', description: 'Premium matcha green tea ice cream', price: 7.99, cost: 3.00, sku: 'SU-MI-DES-GRE-001', barcode: '123456789419', itemSku: 'SU-DES-GRE-001', imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop' }
  ];

  // Check for existing menu items to avoid duplicates
  const existingMenuSkus = await queryInterface.sequelize.query(
    'SELECT sku FROM menu_items WHERE businessId = ? AND sku IN (?)',
    { type: QueryTypes.SELECT, replacements: [businessId, enhancedMenuItems.map(mi => mi.sku)] }
  ) as any[];
  
  const existingMenuSkuSet = new Set(existingMenuSkus.map(item => item.sku));
  const newMenuItems = enhancedMenuItems.filter(item => !existingMenuSkuSet.has(item.sku));
  
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

  if (newMenuItems.length === 0) {
    console.log(`⚠️ All menu items for Sushi Master already exist, skipping menu item insertion`);
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
    preparationTime: 20,
    isAvailable: true,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    createdAt: new Date(),
    updatedAt: new Date()
  })));

    console.log(`✅ Inserted ${newMenuItems.length} new enhanced menu items for Sushi Master (${enhancedMenuItems.length - newMenuItems.length} already existed)`);
  }

  // Enhanced Recipe Suggestions
  const enhancedRecipeSuggestions = [
    { recipeName: 'Premium Bluefin Tuna Otoro Nigiri', suggestionType: 'premium', reason: 'Ultra-premium fatty tuna belly', priority: 'high', targetAudience: 'sushi_connoisseurs' },
    { recipeName: 'Premium Uni Nigiri', suggestionType: 'seasonal', reason: 'Fresh Hokkaido sea urchin', priority: 'high', targetAudience: 'adventurous_eaters' },
    { recipeName: 'Premium Dragon Roll', suggestionType: 'popular', reason: 'Classic eel and avocado roll', priority: 'medium', targetAudience: 'roll_lovers' },
    { recipeName: 'Premium Rainbow Roll', suggestionType: 'premium', reason: 'Assorted premium fish selection', priority: 'high', targetAudience: 'fish_lovers' },
    { recipeName: 'Premium Spider Roll', suggestionType: 'popular', reason: 'Soft shell crab specialty', priority: 'medium', targetAudience: 'seafood_lovers' },
    { recipeName: 'Premium Volcano Roll', suggestionType: 'spicy', reason: 'Spicy tuna with tempura crunch', priority: 'medium', targetAudience: 'spicy_food_lovers' },
    { recipeName: 'Premium Ramen', suggestionType: 'comfort', reason: 'Rich pork broth ramen', priority: 'high', targetAudience: 'noodle_lovers' }
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
  
  const existingSuggestionSet = new Set(existingSuggestions.map(s => s.recipeId));
  
  // Filter out existing suggestions and validate recipe existence
  const newRecipeSuggestions = enhancedRecipeSuggestions.filter(rs => {
    const recipeId = recipeIds[rs.recipeName];
    
    if (!recipeId) {
      console.log(`⚠️ Skipping recipe suggestion: Recipe not found for name "${rs.recipeName}"`);
      return false;
    }
    
    if (existingSuggestionSet.has(recipeId)) {
      console.log(`ℹ️ Recipe suggestion already exists for recipe: ${rs.recipeName}`);
      return false;
    }
    
    return true;
  });

  if (newRecipeSuggestions.length > 0) {
    // Insert enhanced recipe suggestions
    await queryInterface.bulkInsert('recipe_suggestions', newRecipeSuggestions.map(rs => ({
      businessId: businessId,
      recipeId: recipeIds[rs.recipeName],
      suggestionType: rs.suggestionType,
      reason: rs.reason,
      priority: rs.priority,
      targetAudience: rs.targetAudience,
      isActive: true,
      aiGenerated: true,
      confidence: 0.95,
      suggestedPrice: 20.00,
      createdAt: new Date(),
      updatedAt: new Date()
    })));

    console.log(`✅ Inserted ${newRecipeSuggestions.length} new enhanced recipe suggestions for Sushi Master (${enhancedRecipeSuggestions.length - newRecipeSuggestions.length} already existed)`);
  } else {
    console.log(`ℹ️ All recipe suggestions already exist for Sushi Master`);
  }

  // 🚀 MASSIVE RECIPE GENERATION - Take it to the next level!
  console.log('🚀 Generating MASSIVE amounts of additional Japanese recipes...');
  
  const japaneseRecipeTemplates = [
    { base: 'Nigiri', variations: ['Salmon', 'Tuna', 'Yellowtail', 'Eel', 'Scallop', 'Shrimp', 'Mackerel', 'Octopus', 'Tamago', 'Uni', 'Toro', 'Hamachi', 'Amaebi', 'Hotate', 'Ika', 'Tako', 'Ebi', 'Saba', 'Aji', 'Kohada'] },
    { base: 'Roll', variations: ['California', 'Spicy Tuna', 'Dragon', 'Rainbow', 'Spider', 'Volcano', 'Tiger', 'Dynamite', 'Caterpillar', 'Philadelphia', 'Alaska', 'Boston', 'New York', 'Seattle', 'Hawaiian', 'Tempura', 'Crunchy', 'Spicy', 'Sweet', 'Sour'] },
    { base: 'Sashimi', variations: ['Salmon', 'Tuna', 'Yellowtail', 'Scallop', 'Mackerel', 'Octopus', 'Uni', 'Toro', 'Hamachi', 'Amaebi', 'Hotate', 'Ika', 'Tako', 'Ebi', 'Saba', 'Aji', 'Kohada', 'Madai', 'Hirame', 'Suzuki'] },
    { base: 'Ramen', variations: ['Tonkotsu', 'Shoyu', 'Miso', 'Shio', 'Spicy', 'Vegetarian', 'Chicken', 'Beef', 'Seafood', 'Truffle', 'Curry', 'Kimchi', 'Mushroom', 'Pork', 'Duck', 'Lamb', 'Fish', 'Crab', 'Lobster', 'Scallop'] },
    { base: 'Donburi', variations: ['Gyudon', 'Katsudon', 'Oyakodon', 'Tendon', 'Unadon', 'Chirashi', 'Tekkadon', 'Negitoro', 'Salmon', 'Tuna', 'Mixed', 'Premium', 'Deluxe', 'Special', 'Chef', 'Signature', 'House', 'Traditional', 'Modern', 'Fusion'] },
    { base: 'Tempura', variations: ['Shrimp', 'Vegetable', 'Mixed', 'Seafood', 'Chicken', 'Fish', 'Mushroom', 'Sweet Potato', 'Zucchini', 'Eggplant', 'Onion', 'Carrot', 'Broccoli', 'Asparagus', 'Green Bean', 'Pumpkin', 'Lotus Root', 'Burdock', 'Bamboo', 'Seaweed'] },
    { base: 'Teriyaki', variations: ['Chicken', 'Beef', 'Salmon', 'Tuna', 'Pork', 'Duck', 'Shrimp', 'Scallop', 'Fish', 'Lamb', 'Vegetable', 'Mushroom', 'Tofu', 'Mixed', 'Premium', 'Deluxe', 'Special', 'Chef', 'Signature', 'House'] }
  ];

  // Generate 500-1000 additional recipes for Sushi Master
  const additionalRecipesPerTemplate = 50 + Math.floor(Math.random() * 50); // 50-100 recipes per template
  
  for (const template of japaneseRecipeTemplates) {
    for (let i = 0; i < additionalRecipesPerTemplate; i++) {
      const variation = template.variations[Math.floor(Math.random() * template.variations.length)] || 'Classic';
      const recipeName = `${variation} ${template.base} ${i + 1}`;
      
      const recipe = {
        businessId,
        name: recipeName,
        description: `Authentic Japanese ${variation.toLowerCase()} ${template.base.toLowerCase()} made with traditional methods`,
        ingredients: `Premium Japanese ingredients, fresh fish, quality rice, traditional methods`,
        instructions: `Prepare ${variation.toLowerCase()} ingredients using traditional Japanese techniques, combine with ${template.base.toLowerCase()} base, serve authentic`,
        prepTime: 15 + Math.floor(Math.random() * 45),
        cookTime: 10 + Math.floor(Math.random() * 40),
        servings: 2 + Math.floor(Math.random() * 6),
        difficulty: Math.random() > 0.7 ? 'hard' : Math.random() > 0.4 ? 'medium' : 'easy',
        cuisine: 'Japanese',
        category: template.base.toLowerCase(),
        nutritionInfo: JSON.stringify({
          calories: Math.floor(Math.random() * 600) + 200,
          protein: Math.floor(Math.random() * 35) + 10,
          carbs: Math.floor(Math.random() * 60) + 20,
          fat: Math.floor(Math.random() * 25) + 5
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

  console.log(`🚀 MASSIVE Japanese recipe generation completed!`);

  // 🚀 MASSIVE ITEM GENERATION - Take it to the next level!
  console.log('🚀 Generating MASSIVE amounts of additional Japanese items...');
  
  // Generate 1000-2000 additional items for Sushi Master
  const additionalItemsCount = 1000 + Math.floor(Math.random() * 1000); // 1000-2000 items
  
  const japaneseItemCategories = ['fish', 'seafood', 'ingredients', 'vegetables', 'grains', 'spices', 'sauces', 'noodles', 'rice', 'seaweed', 'pickles', 'condiments', 'beverages', 'desserts', 'snacks'];
  const japaneseItemNames = [
    'Bluefin Tuna', 'Salmon', 'Yellowtail', 'Hamachi', 'Mackerel', 'Sardines', 'Eel', 'Scallops', 'Shrimp', 'Lobster', 'Crab', 'Octopus', 'Squid', 'Uni', 'Toro', 'Amaebi', 'Hotate', 'Ika', 'Tako', 'Ebi',
    'Sushi Rice', 'Short Grain Rice', 'Brown Rice', 'Black Rice', 'Red Rice', 'Wild Rice', 'Sticky Rice', 'Jasmine Rice', 'Basmati Rice', 'Arborio Rice', 'Carnaroli Rice', 'Vialone Nano Rice',
    'Nori Sheets', 'Wakame', 'Kombu', 'Dulse', 'Arame', 'Hijiki', 'Mozuku', 'Ogonori', 'Tosaka', 'Ginnanso', 'Tengusa', 'Funori', 'Kanten', 'Carrageenan', 'Irish Moss',
    'Soy Sauce', 'Tamari', 'Shoyu', 'Teriyaki Sauce', 'Ponzu Sauce', 'Miso Paste', 'Wasabi', 'Ginger', 'Sesame Oil', 'Rice Vinegar', 'Mirin', 'Sake', 'Dashi', 'Miso Soup', 'Green Tea',
    'Daikon Radish', 'Napa Cabbage', 'Bok Choy', 'Chinese Cabbage', 'Mizuna', 'Mitsuba', 'Shiso', 'Perilla', 'Mint', 'Basil', 'Cilantro', 'Parsley', 'Chives', 'Scallions', 'Garlic Chives',
    'Pickled Ginger', 'Umeboshi', 'Takuan', 'Nukazuke', 'Shibazuke', 'Kyoto Pickles', 'Tokyo Pickles', 'Osaka Pickles', 'Hakata Pickles', 'Nagoya Pickles', 'Sapporo Pickles', 'Fukuoka Pickles'
  ];

  for (let i = 0; i < additionalItemsCount; i++) {
    const category = japaneseItemCategories[Math.floor(Math.random() * japaneseItemCategories.length)] || 'ingredients';
    const baseName = japaneseItemNames[Math.floor(Math.random() * japaneseItemNames.length)] || 'Premium Japanese Item';
    const itemName = `${baseName} ${i + 1}`;
    
    const item = {
      businessId,
      name: itemName,
      description: `Premium Japanese ${category} for authentic cuisine`,
      price: 0, // Items don't have direct prices
      cost: Math.round((Math.random() * 100 + 1) * 100) / 100, // $1-$101
      stock: Math.floor(Math.random() * 200) + 10, // 10-210
      sku: `SU-MASS-${category.toUpperCase().substring(0, 3)}-${(i + 1000).toString().padStart(4, '0')}`,
      barcode: `123456789${(i + 2000).toString().padStart(6, '0')}`,
      category,
      unit: ['pieces', 'pounds', 'kilograms', 'grams', 'ounces', 'bottles', 'jars', 'cans', 'bags', 'sheets', 'packets'][Math.floor(Math.random() * 11)],
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

  console.log(`🚀 MASSIVE Japanese item generation completed! Generated ${additionalItemsCount} additional items`);

  // Add items specifically for smart recipe suggestions testing
  console.log('🧪 Adding items for smart recipe suggestions testing...');
  
  const smartTestItems = [
    // Items that are expiring soon (within 3 days)
    {
      name: 'Fresh Wasabi (Expiring Soon)',
      description: 'Fresh wasabi root for sushi and sashimi',
      price: 12.99,
      cost: 6.50,
      stock: 3,
      sku: 'SU-SMART-WAS-EXP-001',
      barcode: '123456789500',
      category: 'Condiments',
      unit: 'piece',
      minStock: 1,
      maxStock: 5,
      imageUrl: 'https://images.unsplash.com/photo-1618377382884-c6c2c3c3c3c3?w=400&h=300&fit=crop&crop=center',
      isPerishable: true,
      expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Expires tomorrow
      manufacturingDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      shelfLifeDays: 3,
      isExpiringSoon: true,
      isUnderperforming: false,
      salesVelocity: 0.06,
      daysSinceLastSale: 4
    },
    {
      name: 'Fresh Ginger (Expiring Soon)',
      description: 'Fresh ginger root for sushi garnishing',
      price: 4.99,
      cost: 2.00,
      stock: 8,
      sku: 'SU-SMART-GIN-EXP-001',
      barcode: '123456789501',
      category: 'Vegetables',
      unit: 'kg',
      minStock: 2,
      maxStock: 10,
      imageUrl: 'https://images.unsplash.com/photo-1618377382884-c6c2c3c3c3c3?w=400&h=300&fit=crop&crop=center',
      isPerishable: true,
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Expires in 2 days
      manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      shelfLifeDays: 3,
      isExpiringSoon: true,
      isUnderperforming: false,
      salesVelocity: 0.10,
      daysSinceLastSale: 3
    },
    {
      name: 'Fresh Nori (Expiring Soon)',
      description: 'Premium seaweed sheets for sushi rolls',
      price: 8.99,
      cost: 3.50,
      stock: 12,
      sku: 'SU-SMART-NOR-EXP-001',
      barcode: '123456789502',
      category: 'Seaweed',
      unit: 'pack',
      minStock: 3,
      maxStock: 15,
      imageUrl: 'https://images.unsplash.com/photo-1618377382884-c6c2c3c3c3c3?w=400&h=300&fit=crop&crop=center',
      isPerishable: true,
      expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Expires tomorrow
      manufacturingDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      shelfLifeDays: 3,
      isExpiringSoon: true,
      isUnderperforming: false,
      salesVelocity: 0.15,
      daysSinceLastSale: 2
    },
    
    // Items that are underperforming (low sales velocity)
    {
      name: 'Premium Yuzu (Underperforming)',
      description: 'Japanese citrus fruit for seasoning',
      price: 15.99,
      cost: 8.00,
      stock: 4,
      sku: 'SU-SMART-YUZ-UND-001',
      barcode: '123456789503',
      category: 'Fruits',
      unit: 'piece',
      minStock: 1,
      maxStock: 8,
      imageUrl: 'https://images.unsplash.com/photo-1618377382884-c6c2c3c3c3c3?w=400&h=300&fit=crop&crop=center',
      isPerishable: false,
      expirationDate: null,
      manufacturingDate: null,
      shelfLifeDays: null,
      isExpiringSoon: false,
      isUnderperforming: true,
      salesVelocity: 0.02, // Very low sales velocity
      daysSinceLastSale: 42 // Not sold in 42 days
    },
    {
      name: 'Premium Mirin (Underperforming)',
      description: 'Sweet Japanese rice wine for cooking',
      price: 18.99,
      cost: 9.50,
      stock: 6,
      sku: 'SU-SMART-MIR-UND-001',
      barcode: '123456789504',
      category: 'Condiments',
      unit: 'bottle',
      minStock: 2,
      maxStock: 10,
      imageUrl: 'https://images.unsplash.com/photo-1618377382884-c6c2c3c3c3c3?w=400&h=300&fit=crop&crop=center',
      isPerishable: false,
      expirationDate: null,
      manufacturingDate: null,
      shelfLifeDays: null,
      isExpiringSoon: false,
      isUnderperforming: true,
      salesVelocity: 0.03, // Low sales velocity
      daysSinceLastSale: 38 // Not sold in 38 days
    },
    {
      name: 'Premium Dashi (Underperforming)',
      description: 'Japanese soup stock made from kombu and bonito',
      price: 22.99,
      cost: 12.00,
      stock: 5,
      sku: 'SU-SMART-DAS-UND-001',
      barcode: '123456789505',
      category: 'Stock',
      unit: 'packet',
      minStock: 1,
      maxStock: 8,
      imageUrl: 'https://images.unsplash.com/photo-1618377382884-c6c2c3c3c3c3?w=400&h=300&fit=crop&crop=center',
      isPerishable: false,
      expirationDate: null,
      manufacturingDate: null,
      shelfLifeDays: null,
      isExpiringSoon: false,
      isUnderperforming: true,
      salesVelocity: 0.04, // Low sales velocity
      daysSinceLastSale: 31 // Not sold in 31 days
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
    console.log(`⚠️ All smart test items for Sushi Master already exist, skipping insertion`);
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
      isPerishable: i.isPerishable,
      expirationDate: i.expirationDate,
      manufacturingDate: i.manufacturingDate,
      shelfLifeDays: i.shelfLifeDays,
      lastSoldDate: i.daysSinceLastSale > 0 ? new Date(Date.now() - i.daysSinceLastSale * 24 * 60 * 60 * 1000) : null,
      salesVelocity: i.salesVelocity,
      daysSinceLastSale: i.daysSinceLastSale,
      isUnderperforming: i.isUnderperforming,
      isExpiringSoon: i.isExpiringSoon,
      createdAt: new Date(),
      updatedAt: new Date()
    })));
    
    console.log(`✅ Inserted ${newSmartItems.length} smart test items for Sushi Master (${smartTestItems.length - newSmartItems.length} already existed)`);
  }

  console.log('🎉 Sushi Master world-class enhancement complete!');
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Get business ID for Sushi Master
  const [business] = await queryInterface.sequelize.query(
    'SELECT id FROM businesses WHERE slug = ?',
    { type: QueryTypes.SELECT, replacements: ['sushi-master'] }
  ) as any[];
  
  if (!business) {
    console.log('Sushi Master business not found, skipping cleanup');
    return;
  }
  
  const businessId = business.id;

  // Clean up in reverse order
  await queryInterface.bulkDelete('recipe_suggestions', { businessId });
  await queryInterface.bulkDelete('menu_items', { businessId });
  await queryInterface.bulkDelete('recipes', { businessId });
  await queryInterface.bulkDelete('items', { businessId });

  console.log('🧹 Cleaned up Sushi Master world-class enhancement');
} 