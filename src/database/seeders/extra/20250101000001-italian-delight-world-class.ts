import { QueryInterface, QueryTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  console.log('🍕 Adding Italian Delight Restaurant Data...');
  
  // Find existing Italian Delight business (created by comprehensive seeder)
  const businesses = await queryInterface.sequelize.query(
    'SELECT id, name, slug FROM businesses WHERE slug = ? ORDER BY id',
    { type: QueryTypes.SELECT, replacements: ['italian-delight'] }
  ) as any[];
  
  if (!businesses || businesses.length === 0) {
    throw new Error('Italian Delight business not found. Please run the comprehensive seeder first.');
  }
  
  const business = businesses[0];
  const businessId = business.id;
  console.log(`✅ Found Italian Delight business ID: ${businessId} (${business.name})`);
  
  if (businesses.length > 1) {
    console.log(`⚠️ Warning: Found ${businesses.length} businesses with slug 'italian-delight', using ID ${businessId}`);
  }

  // Helper function to generate random stock between 5 and 20
  const getRandomStock = () => Math.floor(Math.random() * 16) + 5;

  // Enhanced Items for Italian Delight - Inspired by Osteria Francescana, Massimo Bottura
  const enhancedItems = [
    // Premium Pizza Ingredients (Unique items not in comprehensive seeder)
    { name: 'Premium Truffle Pizza Base', description: 'Pizza dough, black truffle, mozzarella, parmesan, arugula', price: 22.99, cost: 12.50, stock: getRandomStock(), sku: 'IT-PIZ-TRU-PRE-001', barcode: '123456789100', category: 'Pizza', unit: 'piece', minStock: 5, maxStock: 40, imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 3 },
    { name: 'Premium Quattro Formaggi Base', description: 'Pizza dough, mozzarella, gorgonzola, parmesan, ricotta', price: 20.99, cost: 10.80, stock: getRandomStock(), sku: 'IT-PIZ-QUE-PRE-001', barcode: '123456789101', category: 'Pizza', unit: 'piece', minStock: 6, maxStock: 50, imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 4 },
    { name: 'Premium Prosciutto di Parma Base', description: 'Pizza dough, prosciutto di Parma, mozzarella, arugula', price: 24.99, cost: 13.50, stock: getRandomStock(), sku: 'IT-PIZ-PRO-PRE-001', barcode: '123456789102', category: 'Pizza', unit: 'piece', minStock: 4, maxStock: 35, imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 3 },
    
    // Premium Pasta Ingredients (Unique items not in comprehensive seeder)
    { name: 'Premium Black Truffle Pasta', description: 'Fresh tagliatelle, black truffle, parmesan, butter', price: 25.99, cost: 15.00, stock: getRandomStock(), sku: 'IT-PAS-TRU-PRE-001', barcode: '123456789103', category: 'Pasta', unit: 'portion', minStock: 3, maxStock: 25, imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 2 },
    { name: 'Premium Lobster Ravioli', description: 'Fresh lobster ravioli with saffron cream sauce', price: 28.99, cost: 16.50, stock: getRandomStock(), sku: 'IT-PAS-LOB-PRE-001', barcode: '123456789104', category: 'Pasta', unit: 'portion', minStock: 3, maxStock: 20, imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 2 },
    { name: 'Premium Wild Mushroom Risotto', description: 'Arborio rice, wild mushrooms, parmesan, white wine', price: 22.99, cost: 11.50, stock: getRandomStock(), sku: 'IT-RIS-MUS-PRE-001', barcode: '123456789105', category: 'Risotto', unit: 'portion', minStock: 4, maxStock: 30, imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 3 },
    
    // Premium Main Courses (Unique items not in comprehensive seeder)
    { name: 'Premium Wagyu Beef Carpaccio', description: 'Thinly sliced Wagyu beef with truffle oil, arugula, parmesan', price: 32.99, cost: 20.00, stock: getRandomStock(), sku: 'IT-MAI-WAG-PRE-001', barcode: '123456789106', category: 'Main Course', unit: 'portion', minStock: 2, maxStock: 15, imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 2 },
    { name: 'Premium Sea Bass al Cartoccio', description: 'Mediterranean sea bass baked in parchment with herbs', price: 34.99, cost: 18.50, stock: getRandomStock(), sku: 'IT-MAI-SEA-PRE-001', barcode: '123456789107', category: 'Main Course', unit: 'portion', minStock: 2, maxStock: 12, imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 2 },
    { name: 'Premium Lamb Rack with Rosemary', description: 'Herb-crusted lamb rack with roasted vegetables', price: 38.99, cost: 22.00, stock: getRandomStock(), sku: 'IT-MAI-LAM-PRE-001', barcode: '123456789108', category: 'Main Course', unit: 'portion', minStock: 2, maxStock: 10, imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 2 },
    
    // Premium Appetizers (Unique items not in comprehensive seeder)
    { name: 'Premium Burrata with Heirloom Tomatoes', description: 'Fresh burrata, heirloom tomatoes, basil, aged balsamic', price: 16.99, cost: 8.50, stock: getRandomStock(), sku: 'IT-APP-BUR-PRE-001', barcode: '123456789109', category: 'Appetizer', unit: 'portion', minStock: 5, maxStock: 40, imageUrl: 'https://images.unsplash.com/photo-1572441713131-4d09e94d8b09?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 2 },
    { name: 'Premium Truffle Arancini', description: 'Risotto balls with black truffle and mozzarella', price: 14.99, cost: 6.50, stock: getRandomStock(), sku: 'IT-APP-ARA-PRE-001', barcode: '123456789110', category: 'Appetizer', unit: 'piece', minStock: 8, maxStock: 60, imageUrl: 'https://images.unsplash.com/photo-1572441713131-4d09e94d8b09?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 2 },
    
    // Premium Desserts (Unique items not in comprehensive seeder)
    { name: 'Premium Chocolate Soufflé', description: 'Warm chocolate soufflé with vanilla gelato', price: 12.99, cost: 5.50, stock: getRandomStock(), sku: 'IT-DES-SOU-PRE-001', barcode: '123456789111', category: 'Dessert', unit: 'piece', minStock: 4, maxStock: 30, imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 2 },
    { name: 'Premium Limoncello Panna Cotta', description: 'Silky panna cotta with limoncello and berries', price: 11.99, cost: 4.80, stock: getRandomStock(), sku: 'IT-DES-LIM-PRE-001', barcode: '123456789112', category: 'Dessert', unit: 'portion', minStock: 5, maxStock: 35, imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop&crop=center', isPerishable: true, expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), shelfLifeDays: 3 },
    
    // Premium Beverages (Unique items not in comprehensive seeder)
    { name: 'Premium Barolo Riserva', description: 'Aged Barolo red wine', price: 45.99, cost: 25.00, stock: getRandomStock(), sku: 'IT-BEV-BAR-PRE-001', barcode: '123456789113', category: 'Beverage', unit: 'bottle', minStock: 2, maxStock: 15, imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop&crop=center', isPerishable: false },
    { name: 'Premium Amaro Montenegro', description: 'Italian herbal liqueur', price: 18.99, cost: 10.00, stock: getRandomStock(), sku: 'IT-BEV-AMA-PRE-001', barcode: '123456789114', category: 'Beverage', unit: 'bottle', minStock: 3, maxStock: 20, imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop&crop=center', isPerishable: false }
  ];

  // Check for existing items to avoid duplicates
  const existingSkus = await queryInterface.sequelize.query(
    'SELECT sku FROM items WHERE businessId = ? AND sku IN (?)',
    { type: QueryTypes.SELECT, replacements: [businessId, enhancedItems.map(i => i.sku)] }
  ) as any[];
  
  const existingSkuSet = new Set(existingSkus.map(item => item.sku));
  const newItems = enhancedItems.filter(item => !existingSkuSet.has(item.sku));
  
  if (newItems.length === 0) {
    console.log(`⚠️ All items for Italian Delight already exist, skipping item insertion`);
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
    
    console.log(`✅ Inserted ${newItems.length} new enhanced items for Italian Delight (${enhancedItems.length - newItems.length} already existed)`);
  }

  // Enhanced Recipes for Italian Delight
  const enhancedRecipes = [
    {
      name: 'Truffle Pizza',
      description: 'Luxury pizza with black truffle, mozzarella, parmesan, and arugula',
      ingredients: 'Pizza dough, black truffle, fresh mozzarella, parmesan, arugula, olive oil, sea salt',
      instructions: '1. Preheat oven to 450°F\n2. Roll out pizza dough\n3. Drizzle with truffle oil\n4. Add mozzarella and parmesan\n5. Bake for 12-15 minutes\n6. Top with fresh arugula and shaved truffle',
      prepTime: 25,
      cookTime: 15,
      difficulty: 'medium',
      imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop&crop=center'
    },
    {
      name: 'Quattro Formaggi Pizza',
      description: 'Four cheese pizza with mozzarella, gorgonzola, parmesan, and ricotta',
      ingredients: 'Pizza dough, mozzarella, gorgonzola, parmesan, ricotta, olive oil, black pepper',
      instructions: '1. Preheat oven to 450°F\n2. Roll out pizza dough\n3. Layer all four cheeses\n4. Drizzle with olive oil\n5. Bake for 12-15 minutes\n6. Finish with black pepper',
      prepTime: 20,
      cookTime: 15,
      difficulty: 'medium',
      imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop&crop=center'
    },
    {
      name: 'Black Truffle Pasta',
      description: 'Fresh tagliatelle with black truffle, parmesan, and butter sauce',
      ingredients: 'Fresh tagliatelle, black truffle, parmesan, butter, white wine, shallots, parsley',
      instructions: '1. Cook tagliatelle in salted water\n2. Sauté shallots in butter\n3. Add white wine and reduce\n4. Add truffle and parmesan\n5. Toss with pasta and finish with parsley',
      prepTime: 15,
      cookTime: 12,
      difficulty: 'hard',
      imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop&crop=center'
    },
    {
      name: 'Lobster Ravioli',
      description: 'Fresh lobster ravioli with saffron cream sauce',
      ingredients: 'Fresh ravioli, lobster meat, saffron, heavy cream, shallots, white wine, chives',
      instructions: '1. Prepare saffron cream sauce\n2. Cook ravioli in salted water\n3. Sauté shallots in butter\n4. Add wine and cream\n5. Add saffron and lobster\n6. Toss with ravioli',
      prepTime: 20,
      cookTime: 10,
      difficulty: 'hard',
      imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop&crop=center'
    },
    {
      name: 'Wagyu Beef Carpaccio',
      description: 'Thinly sliced Wagyu beef with truffle oil, arugula, and parmesan',
      ingredients: 'Wagyu beef, truffle oil, arugula, parmesan, lemon, olive oil, sea salt, black pepper',
      instructions: '1. Freeze beef for 30 minutes\n2. Slice very thinly\n3. Arrange on plate\n4. Drizzle with truffle oil\n5. Top with arugula and parmesan\n6. Season with salt and pepper',
      prepTime: 30,
      cookTime: 0,
      difficulty: 'medium',
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&crop=center'
    },
    {
      name: 'Chocolate Soufflé',
      description: 'Warm chocolate soufflé with vanilla gelato',
      ingredients: 'Dark chocolate, butter, eggs, sugar, flour, vanilla gelato, cocoa powder',
      instructions: '1. Melt chocolate and butter\n2. Separate eggs and beat yolks with sugar\n3. Fold in chocolate mixture\n4. Beat egg whites to stiff peaks\n5. Gently fold together\n6. Bake in ramekins',
      prepTime: 25,
      cookTime: 20,
      difficulty: 'hard',
      imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop&crop=center'
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
    servings: 4,
    difficulty: r.difficulty,
    cuisine: 'Italian',
    category: 'Premium',
    nutritionInfo: JSON.stringify({
      calories: 350,
      protein: 15,
      carbs: 40,
      fat: 12
    }),
    imageUrl: r.imageUrl,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  })));

  console.log(`✅ Inserted ${enhancedRecipes.length} enhanced recipes for Italian Delight`);

  // 🚀 MASSIVE RECIPE GENERATION - Take it to the next level!
  console.log('🚀 Generating MASSIVE amounts of additional Italian recipes...');
  
  const italianRecipeTemplates = [
    { base: 'Pizza', variations: ['Margherita', 'Pepperoni', 'Quattro Stagioni', 'Diavola', 'Prosciutto e Funghi', 'Capricciosa', 'Romana', 'Napoletana', 'Siciliana', 'Calzone', 'Focaccia', 'Pizza Bianca', 'Pizza Rossa', 'Pizza al Taglio', 'Pizza Gourmet'] },
    { base: 'Pasta', variations: ['Spaghetti', 'Fettuccine', 'Linguine', 'Penne', 'Rigatoni', 'Farfalle', 'Orecchiette', 'Gnocchi', 'Ravioli', 'Tortellini', 'Lasagna', 'Cannelloni', 'Manicotti', 'Tagliatelle', 'Pappardelle'] },
    { base: 'Risotto', variations: ['Mushroom', 'Seafood', 'Truffle', 'Saffron', 'Parmesan', 'Asparagus', 'Butternut Squash', 'Wild Mushroom', 'Lobster', 'Truffle', 'Porcini', 'Artichoke', 'Pea', 'Lemon', 'Herb'] },
    { base: 'Salad', variations: ['Caprese', 'Caesar', 'Greek', 'Mediterranean', 'Arugula', 'Spinach', 'Kale', 'Mixed Greens', 'Antipasto', 'Insalata', 'Panzenella', 'Insalata di Mare', 'Insalata di Pollo', 'Insalata di Tonno', 'Insalata di Frutta'] },
    { base: 'Soup', variations: ['Minestrone', 'Pasta e Fagioli', 'Ribollita', 'Zuppa di Pesce', 'Zuppa di Verdure', 'Zuppa di Pollo', 'Zuppa di Lenticchie', 'Zuppa di Pomodoro', 'Zuppa di Cipolle', 'Zuppa di Funghi', 'Zuppa di Patate', 'Zuppa di Carote', 'Zuppa di Spinaci', 'Zuppa di Broccoli', 'Zuppa di Asparagi'] },
    { base: 'Dessert', variations: ['Tiramisu', 'Panna Cotta', 'Gelato', 'Sorbet', 'Cannoli', 'Zeppole', 'Biscotti', 'Panettone', 'Pandoro', 'Torta', 'Budino', 'Semifreddo', 'Granita', 'Affogato', 'Baba'] },
    { base: 'Appetizer', variations: ['Bruschetta', 'Arancini', 'Calamari', 'Mozzarella di Bufala', 'Prosciutto di Parma', 'Bresaola', 'Carpaccio', 'Antipasto Misto', 'Caprese', 'Focaccia', 'Olive', 'Artichoke', 'Eggplant', 'Zucchini', 'Pepper'] }
  ];

  // Generate 500-1000 additional recipes for Italian Delight
  const additionalRecipesPerTemplate = 50 + Math.floor(Math.random() * 50); // 50-100 recipes per template
  
  for (const template of italianRecipeTemplates) {
    for (let i = 0; i < additionalRecipesPerTemplate; i++) {
      const variation = template.variations[Math.floor(Math.random() * template.variations.length)] || 'Classic';
      const recipeName = `${variation} ${template.base} ${i + 1}`;
      
      const recipe = {
        businessId,
        name: recipeName,
        description: `Authentic Italian ${variation.toLowerCase()} ${template.base.toLowerCase()} made with traditional methods`,
        ingredients: `Premium Italian ingredients, fresh herbs, quality spices, traditional methods`,
        instructions: `Prepare ${variation.toLowerCase()} ingredients using traditional Italian techniques, combine with ${template.base.toLowerCase()} base, serve authentic`,
        prepTime: 15 + Math.floor(Math.random() * 45),
        cookTime: 10 + Math.floor(Math.random() * 40),
        servings: 2 + Math.floor(Math.random() * 6),
        difficulty: Math.random() > 0.7 ? 'hard' : Math.random() > 0.4 ? 'medium' : 'easy',
        cuisine: 'Italian',
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

  console.log(`🚀 MASSIVE Italian recipe generation completed!`);

  // 🔗 Create Recipe Ingredients (N:N relationship) for Italian Delight recipes
  console.log('🔗 Creating recipe-ingredient relationships for Italian Delight recipes...');
  
  // Get all items for Italian Delight
  const allItems = await queryInterface.sequelize.query(
    'SELECT id, name, sku FROM items WHERE businessId = ?',
    { type: QueryTypes.SELECT, replacements: [businessId] }
  ) as any[];

  // Create item lookup map
  const itemMap: { [name: string]: number } = {};
  for (const item of allItems) {
    if (item.name) {
      itemMap[(item.name as string).toLowerCase()] = item.id;
    }
    if (item.sku) {
      itemMap[(item.sku as string).toLowerCase()] = item.id;
    }
  }

  // Get all recipes for Italian Delight
  const allRecipes = await queryInterface.sequelize.query(
    'SELECT id, name, ingredients FROM recipes WHERE businessId = ? AND ingredients IS NOT NULL',
    { type: QueryTypes.SELECT, replacements: [businessId] }
  ) as any[];

  const recipeIngredients: any[] = [];

  for (const recipe of allRecipes) {
    // Parse ingredients text - handle different formats
    let ingredientsList: string[] = [];
    
    if ((recipe.ingredients as string).includes(',')) {
      // Comma-separated format
      ingredientsList = (recipe.ingredients as string).split(',').map((i: string) => i.trim());
    } else if ((recipe.ingredients as string).includes('\n')) {
      // Newline-separated format
      ingredientsList = (recipe.ingredients as string).split('\n').map((i: string) => i.trim());
    } else if ((recipe.ingredients as string).includes(';')) {
      // Semicolon-separated format
      ingredientsList = (recipe.ingredients as string).split(';').map((i: string) => i.trim());
    } else {
      // Single ingredient
      ingredientsList = [(recipe.ingredients as string).trim()];
    }

    // Process each ingredient
    for (const ingredient of ingredientsList) {
      if (!ingredient || ingredient.length < 2) continue;

      // Extract ingredient name (remove quantities, units, etc.)
      let ingredientName = ingredient.toLowerCase();
      
      // Remove common quantity patterns
      ingredientName = ingredientName
        .replace(/\d+(\.\d+)?\s*(g|kg|ml|l|oz|lb|cup|cups|tbsp|tsp|pinch|dash)/gi, '')
        .replace(/^\d+(\.\d+)?\s*/, '')
        .replace(/^\d+\/\d+\s*/, '')
        .trim();

      // Remove common prefixes/suffixes
      ingredientName = ingredientName
        .replace(/^(fresh|dried|ground|whole|sliced|chopped|minced|grated|extra virgin|virgin|premium|aged)\s+/i, '')
        .replace(/\s+(optional|to taste|as needed)$/i, '')
        .trim();

      // Try to find matching item
      let itemId: number | null = null;
      
      // Direct name match
      if (itemMap[ingredientName]) {
        itemId = itemMap[ingredientName] || null;
      } else {
        // Partial matches
        for (const [itemName, id] of Object.entries(itemMap)) {
          if (itemName.includes(ingredientName) || ingredientName.includes(itemName)) {
            itemId = id as number;
            break;
          }
        }
      }

      if (itemId) {
        // Extract quantity and unit from original ingredient text
        let quantity = 1;
        let unit = 'piece';
        let isOptional = false;

        // Check if optional
        if (ingredient.toLowerCase().includes('optional') || ingredient.toLowerCase().includes('to taste')) {
          isOptional = true;
        }

        // Extract quantity
        const quantityMatch = ingredient.match(/(\d+(?:\.\d+)?)\s*(g|kg|ml|l|oz|lb|cup|cups|tbsp|tsp|pinch|dash|piece|pieces|slice|slices|clove|cloves|bunch|bunches|head|heads|can|cans|jar|jars|bottle|bottles|pack|packs|bag|bags|box|boxes|sheet|sheets|roll|rolls|stick|sticks|bar|bars|loaf|loaves|sprig|sprigs|leaf|leaves|cube|cubes|chunk|chunks|dash|pinch|drop|drops|scoop|scoops|handful|handfuls|dash|pinch|drop|drops|scoop|scoops|handful|handfuls)/i);
        if (quantityMatch && quantityMatch[1] && quantityMatch[2]) {
          quantity = parseFloat(quantityMatch[1]);
          unit = quantityMatch[2].toLowerCase();
        } else {
          // Try to extract just a number
          const numMatch = ingredient.match(/(\d+(?:\.\d+)?)/);
          if (numMatch && numMatch[1]) {
            quantity = parseFloat(numMatch[1]);
            unit = 'piece';
          }
        }

        recipeIngredients.push({
          recipeId: recipe.id,
          itemId: itemId,
          quantity: quantity,
          unit: unit,
          isOptional: isOptional,
          notes: ingredient.trim(),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }
  }

  // Insert recipe ingredients in chunks
  if (recipeIngredients.length > 0) {
    console.log(`🔗 Creating ${recipeIngredients.length} recipe-ingredient relationships for Italian Delight...`);
    const ingredientChunkSize = 100;
    for (let i = 0; i < recipeIngredients.length; i += ingredientChunkSize) {
      const chunk = recipeIngredients.slice(i, i + ingredientChunkSize);
      await queryInterface.bulkInsert('recipe_ingredients', chunk);
      console.log(`📦 Inserted ingredient chunk ${Math.floor(i / ingredientChunkSize) + 1}/${Math.ceil(recipeIngredients.length / ingredientChunkSize)}`);
    }
    console.log(`✅ Created ${recipeIngredients.length} recipe-ingredient relationships for Italian Delight`);
  }

  // 🚀 MASSIVE ITEM GENERATION - Take it to the next level!
  console.log('🚀 Generating MASSIVE amounts of additional Italian items...');
  
  // Generate 1000-2000 additional items for Italian Delight
  const additionalItemsCount = 1000 + Math.floor(Math.random() * 1000); // 1000-2000 items
  
  const italianItemCategories = ['ingredients', 'dairy', 'meat', 'seafood', 'vegetables', 'fruits', 'grains', 'spices', 'oils', 'herbs', 'wine', 'cheese', 'pasta', 'sauce', 'dessert'];
  const italianItemNames = [
    'Premium Olive Oil', 'Aged Balsamic', 'Truffle Oil', 'Parmigiano Reggiano', 'Pecorino Romano', 'Mozzarella di Bufala', 'Prosciutto di Parma', 'Mortadella', 'Salami Milano', 'Pancetta', 'Guanciale', 'Lardo', 'Speck', 'Bresaola', 'Capicola',
    'San Marzano Tomatoes', 'Arborio Rice', 'Carnaroli Rice', 'Vialone Nano Rice', '00 Flour', 'Semolina', 'Durum Wheat', 'Fresh Basil', 'Fresh Oregano', 'Fresh Thyme', 'Fresh Rosemary', 'Fresh Sage', 'Fresh Parsley', 'Fresh Mint', 'Fresh Bay Leaves',
    'Porcini Mushrooms', 'Chanterelle Mushrooms', 'Morel Mushrooms', 'Oyster Mushrooms', 'Shiitake Mushrooms', 'Crimini Mushrooms', 'Portobello Mushrooms', 'White Button Mushrooms', 'Wild Mushroom Mix', 'Dried Porcini', 'Dried Morels', 'Dried Chanterelles',
    'Artichoke Hearts', 'Sun-Dried Tomatoes', 'Roasted Red Peppers', 'Marinated Eggplant', 'Grilled Zucchini', 'Roasted Garlic', 'Caramelized Onions', 'Pickled Vegetables', 'Giardiniera', 'Olive Mix', 'Capers', 'Anchovies', 'Sardines', 'Tuna in Olive Oil',
    'Barolo Wine', 'Chianti Wine', 'Brunello Wine', 'Amarone Wine', 'Prosecco', 'Lambrusco', 'Pinot Grigio', 'Soave', 'Valpolicella', 'Barbaresco', 'Dolcetto', 'Barbera', 'Nebbiolo', 'Sangiovese', 'Montepulciano'
  ];

  for (let i = 0; i < additionalItemsCount; i++) {
    const category = italianItemCategories[Math.floor(Math.random() * italianItemCategories.length)] || 'ingredients';
    const baseName = italianItemNames[Math.floor(Math.random() * italianItemNames.length)] || 'Premium Italian Item';
    const itemName = `${baseName} ${i + 1}`;
    
    const item = {
      businessId,
      name: itemName,
      description: `Premium Italian ${category} for authentic cuisine`,
      price: 0, // Items don't have direct prices
      cost: Math.round((Math.random() * 100 + 1) * 100) / 100, // $1-$101
      stock: Math.floor(Math.random() * 200) + 10, // 10-210
      sku: `IT-MASS-${category.toUpperCase().substring(0, 3)}-${(i + 1000).toString().padStart(4, '0')}`,
      barcode: `123456789${(i + 1000).toString().padStart(6, '0')}`,
      category,
      unit: ['pieces', 'pounds', 'kilograms', 'grams', 'ounces', 'bottles', 'jars', 'cans', 'bags'][Math.floor(Math.random() * 9)],
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

  console.log(`🚀 MASSIVE Italian item generation completed! Generated ${additionalItemsCount} additional items`);

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

  const pizzaCategory = await getOrCreateCategory('Pizza');
  const pastaCategory = await getOrCreateCategory('Pasta');
  const mainCategory = await getOrCreateCategory('Main Course');
  const appetizerCategory = await getOrCreateCategory('Appetizer');
  const dessertCategory = await getOrCreateCategory('Desserts');
  const beverageCategory = await getOrCreateCategory('Beverages');

  // Enhanced Menu Items
  const enhancedMenuItems = [
    // Premium Pizzas
    { categoryId: pizzaCategory.id, name: 'Premium Truffle Pizza', description: 'Black truffle, mozzarella, parmesan, arugula', price: 28.99, cost: 12.50, sku: 'IT-MI-PIZ-TRU-PRE-001', barcode: '123456789200', itemSku: 'IT-PIZ-TRU-PRE-001', imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop' },
    { categoryId: pizzaCategory.id, name: 'Premium Quattro Formaggi', description: 'Four cheese pizza with mozzarella, gorgonzola, parmesan, ricotta', price: 24.99, cost: 10.80, sku: 'IT-MI-PIZ-QUE-PRE-001', barcode: '123456789201', itemSku: 'IT-PIZ-QUE-PRE-001', imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop' },
    { categoryId: pizzaCategory.id, name: 'Premium Prosciutto di Parma', description: 'Prosciutto di Parma, mozzarella, arugula, aged balsamic', price: 26.99, cost: 13.50, sku: 'IT-MI-PIZ-PRO-PRE-001', barcode: '123456789202', itemSku: 'IT-PIZ-PRO-PRE-001', imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop' },
    
    // Premium Pastas
    { categoryId: pastaCategory.id, name: 'Premium Black Truffle Pasta', description: 'Fresh tagliatelle, black truffle, parmesan, butter sauce', price: 25.99, cost: 15.00, sku: 'IT-MI-PAS-TRU-PRE-001', barcode: '123456789203', itemSku: 'IT-PAS-TRU-PRE-001', imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop' },
    { categoryId: pastaCategory.id, name: 'Premium Lobster Ravioli', description: 'Fresh lobster ravioli with saffron cream sauce', price: 28.99, cost: 16.50, sku: 'IT-MI-PAS-LOB-PRE-001', barcode: '123456789204', itemSku: 'IT-PAS-LOB-PRE-001', imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop' },
    { categoryId: pastaCategory.id, name: 'Premium Wild Mushroom Risotto', description: 'Arborio rice, wild mushrooms, parmesan, white wine', price: 22.99, cost: 11.50, sku: 'IT-MI-RIS-MUS-PRE-001', barcode: '123456789205', itemSku: 'IT-RIS-MUS-PRE-001', imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop' },
    
    // Premium Main Courses
    { categoryId: mainCategory.id, name: 'Premium Wagyu Beef Carpaccio', description: 'Thinly sliced Wagyu beef with truffle oil, arugula, parmesan', price: 32.99, cost: 20.00, sku: 'IT-MI-MAI-WAG-PRE-001', barcode: '123456789206', itemSku: 'IT-MAI-WAG-PRE-001', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop' },
    { categoryId: mainCategory.id, name: 'Premium Sea Bass al Cartoccio', description: 'Mediterranean sea bass baked in parchment with herbs', price: 34.99, cost: 18.50, sku: 'IT-MI-MAI-SEA-PRE-001', barcode: '123456789207', itemSku: 'IT-MAI-SEA-PRE-001', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop' },
    { categoryId: mainCategory.id, name: 'Premium Lamb Rack with Rosemary', description: 'Herb-crusted lamb rack with roasted vegetables', price: 38.99, cost: 22.00, sku: 'IT-MI-MAI-LAM-PRE-001', barcode: '123456789208', itemSku: 'IT-MAI-LAM-PRE-001', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop' },
    
    // Premium Appetizers
    { categoryId: appetizerCategory.id, name: 'Premium Burrata with Heirloom Tomatoes', description: 'Fresh burrata, heirloom tomatoes, basil, aged balsamic', price: 16.99, cost: 8.50, sku: 'IT-MI-APP-BUR-PRE-001', barcode: '123456789209', itemSku: 'IT-APP-BUR-PRE-001', imageUrl: 'https://images.unsplash.com/photo-1572441713131-4d09e94d8b09?w=400&h=300&fit=crop' },
    { categoryId: appetizerCategory.id, name: 'Premium Truffle Arancini', description: 'Risotto balls with black truffle and mozzarella', price: 14.99, cost: 6.50, sku: 'IT-MI-APP-ARA-PRE-001', barcode: '123456789210', itemSku: 'IT-APP-ARA-PRE-001', imageUrl: 'https://images.unsplash.com/photo-1572441713131-4d09e94d8b09?w=400&h=300&fit=crop' },
    
    // Premium Desserts
    { categoryId: dessertCategory.id, name: 'Premium Chocolate Soufflé', description: 'Warm chocolate soufflé with vanilla gelato', price: 12.99, cost: 5.50, sku: 'IT-MI-DES-SOU-PRE-001', barcode: '123456789211', itemSku: 'IT-DES-SOU-PRE-001', imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop' },
    { categoryId: dessertCategory.id, name: 'Premium Limoncello Panna Cotta', description: 'Silky panna cotta with limoncello and berries', price: 11.99, cost: 4.80, sku: 'IT-MI-DES-LIM-PRE-001', barcode: '123456789212', itemSku: 'IT-DES-LIM-PRE-001', imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop' },
    
    // Premium Beverages
    { categoryId: beverageCategory.id, name: 'Premium Barolo Riserva', description: 'Aged Barolo red wine', price: 45.99, cost: 25.00, sku: 'IT-MI-BEV-BAR-PRE-001', barcode: '123456789213', itemSku: 'IT-BEV-BAR-PRE-001', imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop' },
    { categoryId: beverageCategory.id, name: 'Premium Amaro Montenegro', description: 'Italian herbal liqueur', price: 18.99, cost: 10.00, sku: 'IT-MI-BEV-AMA-PRE-001', barcode: '123456789214', itemSku: 'IT-BEV-AMA-PRE-001', imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop' }
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
    console.log(`⚠️ All menu items for Italian Delight already exist, skipping menu item insertion`);
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

    console.log(`✅ Inserted ${newMenuItems.length} new enhanced menu items for Italian Delight (${enhancedMenuItems.length - newMenuItems.length} already existed)`);
  }

  // Enhanced Recipe Suggestions
  const enhancedRecipeSuggestions = [
    { recipeName: 'Truffle Pizza', suggestionType: 'premium', reason: 'High-end luxury pizza with truffle', priority: 'high', targetAudience: 'luxury_diners' },
    { recipeName: 'Quattro Formaggi Pizza', suggestionType: 'popular', reason: 'Classic four cheese combination', priority: 'medium', targetAudience: 'cheese_lovers' },
    { recipeName: 'Black Truffle Pasta', suggestionType: 'seasonal', reason: 'Truffle season special', priority: 'high', targetAudience: 'pasta_enthusiasts' },
    { recipeName: 'Lobster Ravioli', suggestionType: 'premium', reason: 'Luxury seafood pasta', priority: 'high', targetAudience: 'seafood_lovers' },
    { recipeName: 'Wagyu Beef Carpaccio', suggestionType: 'premium', reason: 'Ultra-premium beef dish', priority: 'high', targetAudience: 'meat_lovers' },
    { recipeName: 'Chocolate Soufflé', suggestionType: 'dessert', reason: 'Classic French dessert', priority: 'medium', targetAudience: 'dessert_lovers' }
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
      suggestedPrice: 25.00,
      createdAt: new Date(),
      updatedAt: new Date()
    })));

    console.log(`✅ Inserted ${newRecipeSuggestions.length} new recipe suggestions for Italian Delight (${enhancedRecipeSuggestions.length - newRecipeSuggestions.length} already existed)`);
  } else {
    console.log(`ℹ️ All recipe suggestions already exist for Italian Delight`);
  }

  // Add items specifically for smart recipe suggestions testing
  console.log('🧪 Adding items for smart recipe suggestions testing...');
  
  const smartTestItems = [
    // Items that are expiring soon (within 3 days)
    {
      name: 'Fresh Basil (Expiring Soon)',
      description: 'Fresh basil leaves for pesto and garnishing',
      price: 3.99,
      cost: 1.50,
      stock: 8,
      sku: 'IT-SMART-BAS-EXP-001',
      barcode: '123456789300',
      category: 'Herbs',
      unit: 'bunch',
      minStock: 5,
      maxStock: 20,
      imageUrl: 'https://images.unsplash.com/photo-1618377382884-c6c2c3c3c3c3?w=400&h=300&fit=crop&crop=center',
      isPerishable: true,
      expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Expires tomorrow
      manufacturingDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      shelfLifeDays: 3,
      isExpiringSoon: true,
      isUnderperforming: false,
      salesVelocity: 0.05,
      daysSinceLastSale: 5
    },
    {
      name: 'Fresh Mozzarella (Expiring Soon)',
      description: 'Fresh buffalo mozzarella for pizzas and salads',
      price: 8.99,
      cost: 4.50,
      stock: 12,
      sku: 'IT-SMART-MOZ-EXP-001',
      barcode: '123456789301',
      category: 'Dairy',
      unit: 'piece',
      minStock: 3,
      maxStock: 15,
      imageUrl: 'https://images.unsplash.com/photo-1618377382884-c6c2c3c3c3c3?w=400&h=300&fit=crop&crop=center',
      isPerishable: true,
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Expires in 2 days
      manufacturingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      shelfLifeDays: 3,
      isExpiringSoon: true,
      isUnderperforming: false,
      salesVelocity: 0.08,
      daysSinceLastSale: 3
    },
    {
      name: 'Fresh Tomatoes (Expiring Soon)',
      description: 'Ripe heirloom tomatoes for salads and sauces',
      price: 4.99,
      cost: 2.00,
      stock: 15,
      sku: 'IT-SMART-TOM-EXP-001',
      barcode: '123456789302',
      category: 'Vegetables',
      unit: 'kg',
      minStock: 2,
      maxStock: 10,
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
      name: 'Premium Saffron (Underperforming)',
      description: 'High-quality saffron threads for risotto and paella',
      price: 45.99,
      cost: 25.00,
      stock: 5,
      sku: 'IT-SMART-SAF-UND-001',
      barcode: '123456789303',
      category: 'Spices',
      unit: 'gram',
      minStock: 1,
      maxStock: 10,
      imageUrl: 'https://images.unsplash.com/photo-1618377382884-c6c2c3c3c3c3?w=400&h=300&fit=crop&crop=center',
      isPerishable: false,
      expirationDate: null,
      manufacturingDate: null,
      shelfLifeDays: null,
      isExpiringSoon: false,
      isUnderperforming: true,
      salesVelocity: 0.02, // Very low sales velocity
      daysSinceLastSale: 45 // Not sold in 45 days
    },
    {
      name: 'Truffle Oil (Underperforming)',
      description: 'Black truffle infused olive oil',
      price: 32.99,
      cost: 18.00,
      stock: 8,
      sku: 'IT-SMART-TRU-UND-001',
      barcode: '123456789304',
      category: 'Oils',
      unit: 'bottle',
      minStock: 2,
      maxStock: 12,
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
      name: 'Aged Balsamic Vinegar (Underperforming)',
      description: '25-year aged balsamic vinegar from Modena',
      price: 28.99,
      cost: 15.00,
      stock: 6,
      sku: 'IT-SMART-BAL-UND-001',
      barcode: '123456789305',
      category: 'Vinegars',
      unit: 'bottle',
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
      daysSinceLastSale: 28 // Not sold in 28 days
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
    console.log(`⚠️ All smart test items for Italian Delight already exist, skipping insertion`);
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
    
    console.log(`✅ Inserted ${newSmartItems.length} smart test items for Italian Delight (${smartTestItems.length - newSmartItems.length} already existed)`);
  }

  console.log('🎉 Italian Delight world-class enhancement complete!');
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Get business ID for Italian Delight
  const [business] = await queryInterface.sequelize.query(
    'SELECT id FROM businesses WHERE slug = ?',
    { type: QueryTypes.SELECT, replacements: ['italian-delight'] }
  ) as any[];
  
  if (!business) {
    console.log('Italian Delight business not found, skipping cleanup');
    return;
  }
  
  const businessId = business.id;

  // Clean up in reverse order
  await queryInterface.bulkDelete('recipe_suggestions', { businessId });
  await queryInterface.bulkDelete('menu_items', { businessId });
  await queryInterface.bulkDelete('recipes', { businessId });
  await queryInterface.bulkDelete('items', { businessId });

  console.log('🧹 Cleaned up Italian Delight world-class enhancement');
} 