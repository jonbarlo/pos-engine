import { QueryInterface, QueryTypes } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export async function up(queryInterface: QueryInterface): Promise<void> {
  console.log('🌍 Starting comprehensive recipe seeder...');

  // Get business IDs
  const businesses: { [key: string]: number } = {};
  const businessSlugs = ['italian-delight', 'sushi-master', 'coffee-corner', 'taco-fiesta', 'american-diner', 'golden-dragon', 'indian-spice-palace', 'peruvian-coastal-kitchen', 'argentinian-grill-house', 'colombian-cafe-bogota', 'costa-rican-tropical-grill'];
  
  for (const slug of businessSlugs) {
    const [biz] = await queryInterface.sequelize.query(
      'SELECT id FROM businesses WHERE slug = ?',
      { type: QueryTypes.SELECT, replacements: [slug] }
    ) as any[];
    if (biz) {
      businesses[slug] = biz.id;
    }
  }

  // Comprehensive Recipe Database - Start with empty array, will be populated dynamically
  const comprehensiveRecipes: any[] = [];

  // Hardcoded recipes (not templates)
  const hardcodedRecipes = [
    {
      businessId: businesses['italian-delight'],
      name: 'Quattro Formaggi Pizza',
      description: 'Four cheese pizza with mozzarella, gorgonzola, parmesan, and ricotta',
      ingredients: 'Pizza dough, mozzarella, gorgonzola, parmesan, ricotta, olive oil',
      instructions: 'Stretch dough, add four cheeses, bake until golden',
      prepTime: 20,
      cookTime: 10,
      servings: 4,
      difficulty: 'medium',
      cuisine: 'Italian',
      category: 'pizza',
      nutritionInfo: JSON.stringify({calories: 400, protein: 15, carbs: 50, fat: 12}),
      imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop&crop=center',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['italian-delight'],
      name: 'Spaghetti Carbonara',
      description: 'Classic Roman pasta with eggs, cheese, pancetta, and black pepper',
      ingredients: 'Spaghetti, eggs, pecorino romano, pancetta, black pepper, salt',
      instructions: 'Cook pasta, crisp pancetta, mix with eggs and cheese',
      prepTime: 15,
      cookTime: 12,
      servings: 4,
      difficulty: 'medium',
      cuisine: 'Italian',
      category: 'pasta',
      nutritionInfo: JSON.stringify({calories: 400, protein: 15, carbs: 50, fat: 12}),
      imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop&crop=center',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['italian-delight'],
      name: 'Black Truffle Pasta',
      description: 'Luxury pasta with black truffle, parmesan, and butter',
      ingredients: 'Fettuccine, black truffle, parmesan, butter, olive oil, salt',
      instructions: 'Cook pasta, sauté truffle, combine with cheese and butter',
      prepTime: 20,
      cookTime: 15,
      servings: 4,
      difficulty: 'hard',
      cuisine: 'Italian',
      category: 'pasta',
      nutritionInfo: JSON.stringify({calories: 400, protein: 15, carbs: 50, fat: 12}),
      imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop&crop=center',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['italian-delight'],
      name: 'Lobster Ravioli',
      description: 'Fresh ravioli filled with lobster and ricotta in cream sauce',
      ingredients: 'Fresh pasta, lobster, ricotta, cream, parmesan, herbs',
      instructions: 'Make ravioli, fill with lobster mixture, serve in cream sauce',
      prepTime: 45,
      cookTime: 8,
      servings: 4,
      difficulty: 'hard',
      cuisine: 'Italian',
      category: 'pasta',
      nutritionInfo: JSON.stringify({calories: 400, protein: 15, carbs: 50, fat: 12}),
      imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop&crop=center',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['italian-delight'],
      name: 'Wagyu Beef Carpaccio',
      description: 'Ultra-premium beef carpaccio with truffle oil and parmesan',
      ingredients: 'Wagyu beef, truffle oil, parmesan, arugula, lemon, olive oil',
      instructions: 'Slice beef thinly, arrange, drizzle with truffle oil, garnish',
      prepTime: 20,
      cookTime: 0,
      servings: 4,
      difficulty: 'hard',
      cuisine: 'Italian',
      category: 'appetizer',
      nutritionInfo: JSON.stringify({calories: 400, protein: 15, carbs: 50, fat: 12}),
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&crop=center',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['italian-delight'],
      name: 'Chocolate Soufflé',
      description: 'Classic French chocolate soufflé with vanilla ice cream',
      ingredients: 'Dark chocolate, eggs, sugar, butter, vanilla, flour',
      instructions: 'Melt chocolate, fold in egg whites, bake until risen',
      prepTime: 30,
      cookTime: 20,
      servings: 4,
      difficulty: 'hard',
      cuisine: 'French',
      category: 'dessert',
      nutritionInfo: JSON.stringify({calories: 400, protein: 15, carbs: 50, fat: 12}),
      imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop&crop=center',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // JAPANESE CUISINE (50+ recipes)
    {
      businessId: businesses['sushi-master'],
      name: 'Premium Bluefin Tuna Otoro Nigiri',
      description: 'Ultra-premium fatty tuna belly nigiri',
      ingredients: 'Bluefin tuna otoro, sushi rice, wasabi, soy sauce',
      instructions: 'Form rice, top with otoro, add wasabi, serve with soy',
      prepTime: 15,
      cookTime: 0,
      servings: 4,
      difficulty: 'hard',
      cuisine: 'Japanese',
      category: 'nigiri',
      nutritionInfo: JSON.stringify({calories: 400, protein: 15, carbs: 50, fat: 12}),
      imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&crop=center',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['sushi-master'],
      name: 'Premium Uni Nigiri',
      description: 'Fresh Hokkaido sea urchin nigiri',
      ingredients: 'Hokkaido uni, sushi rice, wasabi, nori',
      instructions: 'Form rice, top with uni, wrap with nori strip',
      prepTime: 12,
      cookTime: 0,
      servings: 4,
      difficulty: 'hard',
      cuisine: 'Japanese',
      category: 'nigiri',
      nutritionInfo: JSON.stringify({calories: 400, protein: 15, carbs: 50, fat: 12}),
      imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&crop=center',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['sushi-master'],
      name: 'Premium Dragon Roll',
      description: 'Classic eel and avocado roll with eel sauce',
      ingredients: 'Sushi rice, nori, eel, avocado, cucumber, eel sauce',
      instructions: 'Roll eel and avocado, top with avocado, drizzle sauce',
      prepTime: 20,
      cookTime: 0,
      servings: 4,
      difficulty: 'medium',
      cuisine: 'Japanese',
      category: 'rolls',
      nutritionInfo: JSON.stringify({calories: 400, protein: 15, carbs: 50, fat: 12}),
      imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&crop=center',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['sushi-master'],
      name: 'Premium Rainbow Roll',
      description: 'Assorted premium fish selection roll',
      ingredients: 'Sushi rice, nori, tuna, salmon, yellowtail, avocado, cucumber',
      instructions: 'Roll fish and avocado, top with assorted fish',
      prepTime: 25,
      cookTime: 0,
      servings: 4,
      difficulty: 'hard',
      cuisine: 'Japanese',
      category: 'rolls',
      nutritionInfo: JSON.stringify({calories: 400, protein: 15, carbs: 50, fat: 12}),
      imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&crop=center',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['sushi-master'],
      name: 'Premium Spider Roll',
      description: 'Soft shell crab specialty roll',
      ingredients: 'Sushi rice, nori, soft shell crab, avocado, cucumber, spicy mayo',
      instructions: 'Roll crab and vegetables, top with avocado, drizzle mayo',
      prepTime: 22,
      cookTime: 0,
      servings: 4,
      difficulty: 'medium',
      cuisine: 'Japanese',
      category: 'rolls',
      nutritionInfo: JSON.stringify({calories: 400, protein: 15, carbs: 50, fat: 12}),
      imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&crop=center',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['sushi-master'],
      name: 'Premium Volcano Roll',
      description: 'Spicy tuna with tempura crunch',
      ingredients: 'Sushi rice, nori, spicy tuna, tempura flakes, spicy mayo, eel sauce',
      instructions: 'Roll spicy tuna, top with tempura, drizzle sauces',
      prepTime: 18,
      cookTime: 0,
      servings: 4,
      difficulty: 'medium',
      cuisine: 'Japanese',
      category: 'rolls',
      nutritionInfo: JSON.stringify({calories: 400, protein: 15, carbs: 50, fat: 12}),
      imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&crop=center',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['sushi-master'],
      name: 'Premium Ramen',
      description: 'Rich pork broth ramen with chashu and egg',
      ingredients: 'Ramen noodles, pork broth, chashu, soft boiled egg, nori, green onions',
      instructions: 'Cook noodles, assemble with broth, chashu, egg, and toppings',
      prepTime: 30,
      cookTime: 15,
      servings: 4,
      difficulty: 'medium',
      cuisine: 'Japanese',
      category: 'noodles',
      nutritionInfo: JSON.stringify({calories: 400, protein: 15, carbs: 50, fat: 12}),
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop&crop=center',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // COFFEE & CAFE CUISINE (50+ recipes)
    {
      businessId: businesses['coffee-corner'],
      name: 'Ethiopian Pour Over',
      description: 'Single origin Ethiopian coffee with floral notes',
      ingredients: 'Ethiopian coffee beans, filtered water, pour over equipment',
      instructions: 'Grind beans, heat water, pour in circular motion',
      prepTime: 5,
      cookTime: 4,
      servings: 4,
      difficulty: 'medium',
      cuisine: 'Coffee',
      category: 'coffee',
      nutritionInfo: JSON.stringify({calories: 400, protein: 15, carbs: 50, fat: 12}),
      imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&crop=center',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['coffee-corner'],
      name: 'Colombian French Press',
      description: 'Full-bodied Colombian coffee with chocolate notes',
      ingredients: 'Colombian coffee beans, hot water, French press',
      instructions: 'Coarse grind, add hot water, steep 4 minutes, press',
      prepTime: 5,
      cookTime: 4,
      servings: 4,
      difficulty: 'easy',
      cuisine: 'Coffee',
      category: 'coffee',
      nutritionInfo: JSON.stringify({calories: 400, protein: 15, carbs: 50, fat: 12}),
      imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&crop=center',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['coffee-corner'],
      name: 'Sumatra Cold Brew',
      description: 'Smooth cold brew with earthy notes',
      ingredients: 'Sumatra coffee beans, cold water, time',
      instructions: 'Coarse grind, cold water, steep 18-24 hours, filter',
      prepTime: 10,
      cookTime: 1440, // 24 hours
      servings: 4,
      difficulty: 'easy',
      cuisine: 'Coffee',
      category: 'coffee',
      nutritionInfo: JSON.stringify({calories: 400, protein: 15, carbs: 50, fat: 12}),
      imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&crop=center',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['coffee-corner'],
      name: 'Oat Milk Latte',
      description: 'Smooth latte with creamy oat milk',
      ingredients: 'Espresso, oat milk, steamed milk',
      instructions: 'Pull espresso, steam oat milk, combine',
      prepTime: 3,
      cookTime: 2,
      servings: 4,
      difficulty: 'medium',
      cuisine: 'Coffee',
      category: 'coffee',
      nutritionInfo: JSON.stringify({calories: 400, protein: 15, carbs: 50, fat: 12}),
      imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&crop=center',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['coffee-corner'],
      name: 'Matcha Latte',
      description: 'Ceremonial grade matcha with steamed milk',
      ingredients: 'Ceremonial matcha, hot water, steamed milk, honey',
      instructions: 'Whisk matcha with water, add steamed milk, sweeten',
      prepTime: 5,
      cookTime: 3,
      servings: 4,
      difficulty: 'medium',
      cuisine: 'Tea',
      category: 'tea',
      nutritionInfo: JSON.stringify({calories: 400, protein: 15, carbs: 50, fat: 12}),
      imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&crop=center',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['coffee-corner'],
      name: 'Chai Latte',
      description: 'Spiced chai tea with steamed milk',
      ingredients: 'Chai tea, steamed milk, honey, cinnamon',
      instructions: 'Steep chai, add steamed milk, sweeten with honey',
      prepTime: 5,
      cookTime: 5,
      servings: 4,
      difficulty: 'easy',
      cuisine: 'Tea',
      category: 'tea',
      nutritionInfo: JSON.stringify({calories: 400, protein: 15, carbs: 50, fat: 12}),
      imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&crop=center',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['coffee-corner'],
      name: 'Acai Bowl',
      description: 'Fresh acai bowl with granola and fruits',
      ingredients: 'Acai puree, granola, banana, berries, honey, coconut',
      instructions: 'Blend acai, top with granola and fruits, drizzle honey',
      prepTime: 10,
      cookTime: 0,
      servings: 4,
      difficulty: 'easy',
      cuisine: 'Breakfast',
      category: 'breakfast',
      nutritionInfo: JSON.stringify({calories: 400, protein: 15, carbs: 50, fat: 12}),
      imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&crop=center',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['coffee-corner'],
      name: 'Fresh Fruit Bowl',
      description: 'Seasonal fresh fruit bowl with yogurt',
      ingredients: 'Seasonal fruits, Greek yogurt, honey, mint',
      instructions: 'Arrange fruits, add yogurt, drizzle honey, garnish',
      prepTime: 8,
      cookTime: 0,
      servings: 4,
      difficulty: 'easy',
      cuisine: 'Breakfast',
      category: 'breakfast',
      nutritionInfo: JSON.stringify({calories: 400, protein: 15, carbs: 50, fat: 12}),
      imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&crop=center',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Add hardcoded recipes to comprehensive recipes
  comprehensiveRecipes.push(...hardcodedRecipes);

  // Add hundreds more recipes with variations
  const recipeTemplates = [
    // Italian variations
    { base: 'Pizza', variations: ['Pepperoni', 'Hawaiian', 'BBQ Chicken', 'Veggie Supreme', 'Meat Lovers', 'Buffalo Chicken', 'Greek', 'Mediterranean', 'Pesto', 'White Pizza'] },
    { base: 'Pasta', variations: ['Bolognese', 'Alfredo', 'Pesto', 'Arrabbiata', 'Puttanesca', 'Amatriciana', 'Cacio e Pepe', 'Gnocchi', 'Lasagna', 'Fettuccine'] },
    { base: 'Risotto', variations: ['Mushroom', 'Seafood', 'Truffle', 'Saffron', 'Parmesan', 'Asparagus', 'Butternut Squash', 'Wild Mushroom', 'Lobster', 'Truffle'] },
    { base: 'Salad', variations: ['Caprese', 'Caesar', 'Greek', 'Mediterranean', 'Arugula', 'Spinach', 'Kale', 'Mixed Greens', 'Antipasto', 'Insalata'] },
    
    // Japanese variations
    { base: 'Nigiri', variations: ['Salmon', 'Tuna', 'Yellowtail', 'Eel', 'Scallop', 'Shrimp', 'Mackerel', 'Octopus', 'Tamago', 'Uni'] },
    { base: 'Roll', variations: ['California', 'Spicy Tuna', 'Dragon', 'Rainbow', 'Spider', 'Volcano', 'Tiger', 'Dynamite', 'Caterpillar', 'Philadelphia'] },
    { base: 'Sashimi', variations: ['Salmon', 'Tuna', 'Yellowtail', 'Scallop', 'Mackerel', 'Octopus', 'Uni', 'Toro', 'Hamachi', 'Amaebi'] },
    { base: 'Ramen', variations: ['Tonkotsu', 'Shoyu', 'Miso', 'Shio', 'Spicy', 'Vegetarian', 'Chicken', 'Beef', 'Seafood', 'Truffle'] },
    
    // Coffee variations
    { base: 'Coffee', variations: ['Americano', 'Cappuccino', 'Latte', 'Mocha', 'Macchiato', 'Flat White', 'Cortado', 'Piccolo', 'Long Black', 'Ristretto'] },
    { base: 'Tea', variations: ['Green', 'Black', 'Herbal', 'Chai', 'Matcha', 'Earl Grey', 'Jasmine', 'Oolong', 'Rooibos', 'Chamomile'] },
    { base: 'Smoothie', variations: ['Berry', 'Green', 'Tropical', 'Protein', 'Acai', 'Mango', 'Strawberry', 'Banana', 'Pineapple', 'Mixed Fruit'] },
    { base: 'Bowl', variations: ['Acai', 'Poke', 'Buddha', 'Grain', 'Fruit', 'Yogurt', 'Smoothie', 'Breakfast', 'Lunch', 'Dinner'] },
    
    // Mexican variations
    { base: 'Taco', variations: ['Carne Asada', 'Al Pastor', 'Carnitas', 'Fish', 'Shrimp', 'Chicken', 'Veggie', 'Bean', 'Lengua', 'Tripa'] },
    { base: 'Burrito', variations: ['California', 'Mission', 'Wet', 'Breakfast', 'Veggie', 'Bean', 'Chicken', 'Steak', 'Carnitas', 'Shrimp'] },
    { base: 'Quesadilla', variations: ['Chicken', 'Steak', 'Veggie', 'Bean', 'Shrimp', 'Mushroom', 'Spinach', 'Cheese', 'Mixed', 'Special'] },
    { base: 'Enchilada', variations: ['Red', 'Green', 'Mole', 'Cheese', 'Chicken', 'Beef', 'Veggie', 'Bean', 'Shrimp', 'Mixed'] },
    
    // American variations
    { base: 'Burger', variations: ['Classic', 'Bacon', 'Cheese', 'Veggie', 'Turkey', 'Chicken', 'Mushroom', 'BBQ', 'Jalapeño', 'Deluxe'] },
    { base: 'Sandwich', variations: ['Club', 'BLT', 'Reuben', 'Pastrami', 'Turkey', 'Chicken', 'Veggie', 'Tuna', 'Egg', 'Grilled Cheese'] },
    { base: 'Steak', variations: ['Ribeye', 'Filet Mignon', 'Strip', 'T-Bone', 'Porterhouse', 'Flank', 'Skirt', 'Hanger', 'Flat Iron', 'Tomahawk'] },
    { base: 'Salad', variations: ['Caesar', 'Cobb', 'Garden', 'Greek', 'Wedge', 'Spinach', 'Kale', 'Mixed Greens', 'Potato', 'Macaroni'] },
    
    // Asian variations
    { base: 'Dim Sum', variations: ['Har Gow', 'Char Siu Bao', 'Siu Mai', 'Xiao Long Bao', 'Turnip Cake', 'Rice Noodle Roll', 'Egg Tart', 'Phoenix Claws', 'Beef Ball', 'Shrimp Toast'] },
    { base: 'Noodle', variations: ['Chow Mein', 'Lo Mein', 'Pad Thai', 'Pho', 'Ramen', 'Udon', 'Soba', 'Rice Noodles', 'Glass Noodles', 'Wonton Noodles'] },
    { base: 'Rice', variations: ['Fried Rice', 'Steamed Rice', 'Sticky Rice', 'Bibimbap', 'Curry Rice', 'Teriyaki Rice', 'Kimchi Rice', 'Coconut Rice', 'Jasmine Rice', 'Brown Rice'] },
    { base: 'Stir Fry', variations: ['Kung Pao', 'Sweet and Sour', 'General Tso', 'Orange', 'Lemon', 'Garlic', 'Ginger', 'Szechuan', 'Teriyaki', 'Mongolian'] }
  ];

  // Generate additional recipes (limited to prevent overwhelming the database)
  let recipeId = comprehensiveRecipes.length + 1;
  
  for (const businessSlug of businessSlugs) {
    const businessId = businesses[businessSlug];
    if (!businessId) continue;

    // Limit to first 2-3 variations per template to keep it manageable
    for (const template of recipeTemplates) {
      const limitedVariations = template.variations.slice(0, 2 + Math.floor(Math.random() * 2)); // 2-3 variations
      for (const variation of limitedVariations) {
        const recipeName = `${variation} ${template.base}`;
        
        // Skip if already exists (check both name and businessId)
        const existingRecipe = comprehensiveRecipes.find(r => r.name === recipeName && r.businessId === businessId);
        if (existingRecipe) {
          console.log(`   ⚠️ Skipping duplicate recipe: ${recipeName} for business ${businessSlug}`);
          continue;
        }

        // Generate recipe based on business type
        let category = template.base.toLowerCase();
        let price = 15.00 + Math.random() * 25; // $15-40 range
        let difficulty = Math.random() > 0.7 ? 'hard' : Math.random() > 0.4 ? 'medium' : 'easy';
        let prepTime = 10 + Math.floor(Math.random() * 30);
        let cookTime = 5 + Math.floor(Math.random() * 25);

        // Adjust for business type
        if (businessSlug === 'italian-delight') {
          if (template.base === 'Pizza') price = 18.00 + Math.random() * 15;
          if (template.base === 'Pasta') price = 20.00 + Math.random() * 12;
        } else if (businessSlug === 'sushi-master') {
          if (template.base === 'Nigiri') price = 8.00 + Math.random() * 8;
          if (template.base === 'Roll') price = 16.00 + Math.random() * 12;
          if (template.base === 'Sashimi') price = 22.00 + Math.random() * 15;
        } else if (businessSlug === 'coffee-corner') {
          if (template.base === 'Coffee') price = 4.50 + Math.random() * 4;
          if (template.base === 'Tea') price = 5.00 + Math.random() * 3;
          if (template.base === 'Smoothie') price = 8.00 + Math.random() * 4;
        }

        const recipe = {
          businessId,
          name: recipeName,
          description: `Delicious ${variation.toLowerCase()} ${template.base.toLowerCase()} made with premium ingredients`,
          ingredients: `Premium ${variation.toLowerCase()} ingredients, fresh herbs, quality spices`,
          instructions: `Prepare ${variation.toLowerCase()} ingredients, combine with ${template.base.toLowerCase()} base, serve fresh`,
          prepTime,
          cookTime,
          servings: 4,
          difficulty,
          cuisine: 'International',
          category,
          nutritionInfo: JSON.stringify({
            calories: Math.floor(Math.random() * 500) + 200,
            protein: Math.floor(Math.random() * 30) + 10,
            carbs: Math.floor(Math.random() * 50) + 20,
            fat: Math.floor(Math.random() * 20) + 5
          }),
          imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&crop=center',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        comprehensiveRecipes.push(recipe);
        recipeId++;
      }
    }
  }

  // Insert all recipes in chunks
  console.log(`📝 Inserting ${comprehensiveRecipes.length} comprehensive recipes in chunks...`);
  
  const chunkSize = 1; // Insert 1 recipe at a time (minimal to prevent SQL Server issues)
  for (let i = 0; i < comprehensiveRecipes.length; i += chunkSize) {
    const chunk = comprehensiveRecipes.slice(i, i + chunkSize);
    console.log(`📦 Inserting chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(comprehensiveRecipes.length / chunkSize)} (${chunk.length} recipes)...`);
    await queryInterface.bulkInsert('recipes', chunk);
  }

  // Create recipe suggestions for smart recommendations
  console.log('🧠 Creating recipe suggestions for smart recommendations...');
  
  const recipeSuggestions = [];
  for (const recipe of comprehensiveRecipes) {
    // Create multiple suggestions per recipe
    const suggestionTypes = ['popular', 'seasonal', 'premium', 'comfort', 'healthy', 'quick'];
    const reasons = [
      'High customer demand',
      'Seasonal ingredients available',
      'Premium quality ingredients',
      'Comfort food favorite',
      'Healthy option',
      'Quick preparation time',
      'Chef recommendation',
      'Staff favorite',
      'Customer favorite',
      'New addition to menu'
    ];
    const priorities = ['high', 'medium', 'low'];
    const targetAudiences = [
      'general_customers',
      'food_enthusiasts',
      'health_conscious',
      'luxury_diners',
      'quick_service',
      'family_diners',
      'date_night',
      'business_lunch',
      'casual_dining',
      'fine_dining'
    ];

    // Create 1-2 suggestions per recipe (reduced to prevent overwhelming)
    const numSuggestions = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < numSuggestions; i++) {
      const suggestion = {
        businessId: recipe.businessId,
        recipeId: recipeId,
        suggestionType: suggestionTypes[Math.floor(Math.random() * suggestionTypes.length)],
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        targetAudience: targetAudiences[Math.floor(Math.random() * targetAudiences.length)],
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      recipeSuggestions.push(suggestion);
    }
  }

  // Get recipe IDs for suggestions
  const recipeIds: { [key: string]: number } = {};
  for (const recipe of comprehensiveRecipes) {
    const [dbRecipe] = await queryInterface.sequelize.query(
      'SELECT id FROM recipes WHERE name = ? AND businessId = ?',
      { type: QueryTypes.SELECT, replacements: [recipe.name, recipe.businessId] }
    ) as any[];
    if (dbRecipe) {
      recipeIds[`${recipe.name}-${recipe.businessId}`] = dbRecipe.id;
    }
  }

  // Update recipe suggestions with actual recipe IDs
  for (const suggestion of recipeSuggestions) {
    const recipe = comprehensiveRecipes.find(r => r.businessId === suggestion.businessId);
    if (recipe) {
      const recipeId = recipeIds[`${recipe.name}-${recipe.businessId}`];
      if (recipeId) {
        suggestion.recipeId = recipeId;
      }
    }
  }

  // Filter out suggestions without valid recipe IDs
  const validSuggestions = recipeSuggestions.filter(s => s.recipeId && typeof s.recipeId === 'number');

  // Insert recipe suggestions in chunks
  console.log(`💡 Inserting ${validSuggestions.length} recipe suggestions in chunks...`);
  
  const suggestionChunkSize = 20; // Insert 20 suggestions at a time (reduced to prevent SQL Server issues)
  for (let i = 0; i < validSuggestions.length; i += suggestionChunkSize) {
    const chunk = validSuggestions.slice(i, i + suggestionChunkSize);
    console.log(`💡 Inserting suggestion chunk ${Math.floor(i / suggestionChunkSize) + 1}/${Math.ceil(validSuggestions.length / suggestionChunkSize)} (${chunk.length} suggestions)...`);
    await queryInterface.bulkInsert('recipe_suggestions', chunk);
  }

  console.log('✅ Comprehensive recipe seeder completed successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - Total recipes created: ${comprehensiveRecipes.length}`);
  console.log(`   - Total recipe suggestions: ${validSuggestions.length}`);
  console.log(`   - Italian Delight recipes: ${comprehensiveRecipes.filter(r => r.businessId === businesses['italian-delight']).length}`);
  console.log(`   - Sushi Master recipes: ${comprehensiveRecipes.filter(r => r.businessId === businesses['sushi-master']).length}`);
  console.log(`   - Coffee Corner recipes: ${comprehensiveRecipes.filter(r => r.businessId === businesses['coffee-corner']).length}`);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  console.log('🗑️ Rolling back comprehensive recipe seeder...');
  
  // Delete recipe suggestions first (due to foreign key)
  await queryInterface.sequelize.query('DELETE FROM recipe_suggestions WHERE createdAt >= ?', {
    replacements: [new Date('2025-01-01')]
  });

  // Delete recipes
  await queryInterface.sequelize.query('DELETE FROM recipes WHERE createdAt >= ?', {
    replacements: [new Date('2025-01-01')]
  });

  console.log('✅ Comprehensive recipe seeder rolled back successfully!');
} 