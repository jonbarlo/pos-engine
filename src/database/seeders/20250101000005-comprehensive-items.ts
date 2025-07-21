import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  console.log('🛒 Starting comprehensive items seeder...');

  // Get business IDs
  const businessSlugs = [
    'italian-delight',
    'sushi-master', 
    'coffee-corner',
    'taco-fiesta',
    'american-diner',
    'golden-dragon',
    'indian-spice-palace',
    'peruvian-coastal-kitchen',
    'argentinian-grill-house',
    'colombian-cafe-bogota',
    'costa-rican-tropical-grill'
  ];

  const businesses: { [key: string]: number } = {};
  
  for (const slug of businessSlugs) {
    const [business] = await queryInterface.sequelize.query(
      'SELECT id FROM businesses WHERE slug = ?',
      { replacements: [slug] }
    ) as any[];
    
    if (business && business.length > 0) {
      businesses[slug] = business[0].id;
    }
  }

  // Define comprehensive items with expiring and underperforming items
  const comprehensiveItems = [
    // Italian Delight items
    {
      businessId: businesses['italian-delight'],
      name: 'Fresh Mozzarella (Expiring Soon)',
      description: 'Fresh buffalo mozzarella cheese',
      category: 'dairy',
      sku: 'IT-ING-MOZ-001',
      barcode: '123456789000',
      price: 0,
      cost: 8.50,
      stock: 12,
      minStock: 5,
      maxStock: 50,
      unit: 'pieces',
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['italian-delight'],
      name: 'Truffle Oil (Underperforming)',
      description: 'Premium black truffle oil',
      category: 'oils',
      sku: 'IT-ING-TRU-001',
      barcode: '123456789001',
      price: 0,
      cost: 18.00,
      stock: 8,
      minStock: 3,
      maxStock: 20,
      unit: 'bottles',
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['italian-delight'],
      name: 'Premium Black Truffle Pasta',
      description: 'Fresh pasta with black truffle',
      category: 'pasta',
      sku: 'IT-ING-PAS-001',
      barcode: '123456789002',
      price: 0,
      cost: 15.00,
      stock: 5,
      minStock: 2,
      maxStock: 15,
      unit: 'pounds',
      expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['italian-delight'],
      name: 'Premium Lobster Ravioli',
      description: 'Fresh lobster-filled ravioli',
      category: 'pasta',
      sku: 'IT-ING-RAV-001',
      barcode: '123456789003',
      price: 0,
      cost: 16.50,
      stock: 13,
      minStock: 5,
      maxStock: 25,
      unit: 'pieces',
      expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['italian-delight'],
      name: 'Wagyu Beef (Premium)',
      description: 'Ultra-premium Wagyu beef',
      category: 'meat',
      sku: 'IT-ING-WAG-001',
      barcode: '123456789004',
      price: 0,
      cost: 45.00,
      stock: 3,
      minStock: 1,
      maxStock: 10,
      unit: 'pounds',
      expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['italian-delight'],
      name: 'Fresh Basil',
      description: 'Fresh organic basil',
      category: 'herbs',
      sku: 'IT-ING-BAS-001',
      barcode: '123456789005',
      price: 0,
      cost: 2.50,
      stock: 20,
      minStock: 10,
      maxStock: 50,
      unit: 'bunches',
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['italian-delight'],
      name: 'Cherry Tomatoes',
      description: 'Sweet cherry tomatoes',
      category: 'vegetables',
      sku: 'IT-ING-TOM-001',
      barcode: '123456789006',
      price: 0,
      cost: 3.00,
      stock: 15,
      minStock: 8,
      maxStock: 30,
      unit: 'pints',
      expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['italian-delight'],
      name: 'Premium Saffron (Underperforming)',
      description: 'High-quality Spanish saffron',
      category: 'spices',
      sku: 'IT-ING-SAF-001',
      barcode: '123456789007',
      price: 0,
      cost: 25.00,
      stock: 5,
      minStock: 2,
      maxStock: 15,
      unit: 'grams',
      expirationDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000), // 2 years
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // Sushi Master items
    {
      businessId: businesses['sushi-master'],
      name: 'Bluefin Tuna Otoro',
      description: 'Premium fatty tuna belly',
      category: 'fish',
      sku: 'SU-ING-OTO-001',
      barcode: '123456789010',
      price: 0,
      cost: 35.00,
      stock: 2,
      minStock: 1,
      maxStock: 8,
      unit: 'pounds',
      expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['sushi-master'],
      name: 'Hokkaido Uni',
      description: 'Fresh sea urchin from Hokkaido',
      category: 'seafood',
      sku: 'SU-ING-UNI-001',
      barcode: '123456789011',
      price: 0,
      cost: 28.00,
      stock: 4,
      minStock: 2,
      maxStock: 12,
      unit: 'pieces',
      expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['sushi-master'],
      name: 'Premium Salmon',
      description: 'Fresh Atlantic salmon',
      category: 'fish',
      sku: 'SU-ING-SAL-001',
      barcode: '123456789012',
      price: 0,
      cost: 12.00,
      stock: 8,
      minStock: 5,
      maxStock: 20,
      unit: 'pounds',
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['sushi-master'],
      name: 'Soft Shell Crab',
      description: 'Fresh soft shell crab',
      category: 'seafood',
      sku: 'SU-ING-CRA-001',
      barcode: '123456789013',
      price: 0,
      cost: 18.00,
      stock: 6,
      minStock: 3,
      maxStock: 15,
      unit: 'pieces',
      expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['sushi-master'],
      name: 'Premium Rice (Underperforming)',
      description: 'High-quality sushi rice',
      category: 'grains',
      sku: 'SU-ING-RIC-001',
      barcode: '123456789014',
      price: 0,
      cost: 8.00,
      stock: 25,
      minStock: 10,
      maxStock: 50,
      unit: 'pounds',
      expirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['sushi-master'],
      name: 'Nori Sheets',
      description: 'Premium nori for sushi',
      category: 'seaweed',
      sku: 'SU-ING-NOR-001',
      barcode: '123456789015',
      price: 0,
      cost: 15.00,
      stock: 12,
      minStock: 5,
      maxStock: 30,
      unit: 'packages',
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // Coffee Corner items
    {
      businessId: businesses['coffee-corner'],
      name: 'Ethiopian Coffee Beans',
      description: 'Single origin Ethiopian coffee',
      category: 'coffee',
      sku: 'CO-ING-ETH-001',
      barcode: '123456789020',
      price: 0,
      cost: 12.00,
      stock: 15,
      minStock: 8,
      maxStock: 30,
      unit: 'pounds',
      expirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['coffee-corner'],
      name: 'Colombian Coffee Beans',
      description: 'Premium Colombian coffee',
      category: 'coffee',
      sku: 'CO-ING-COL-001',
      barcode: '123456789021',
      price: 0,
      cost: 10.00,
      stock: 20,
      minStock: 10,
      maxStock: 40,
      unit: 'pounds',
      expirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['coffee-corner'],
      name: 'Sumatra Coffee Beans',
      description: 'Dark roast Sumatra coffee',
      category: 'coffee',
      sku: 'CO-ING-SUM-001',
      barcode: '123456789022',
      price: 0,
      cost: 11.00,
      stock: 18,
      minStock: 8,
      maxStock: 35,
      unit: 'pounds',
      expirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['coffee-corner'],
      name: 'Oat Milk (Expiring Soon)',
      description: 'Fresh oat milk',
      category: 'dairy_alternative',
      sku: 'CO-ING-OAT-001',
      barcode: '123456789023',
      price: 0,
      cost: 4.50,
      stock: 8,
      minStock: 5,
      maxStock: 20,
      unit: 'gallons',
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['coffee-corner'],
      name: 'Ceremonial Matcha (Underperforming)',
      description: 'Premium ceremonial grade matcha',
      category: 'tea',
      sku: 'CO-ING-MAT-001',
      barcode: '123456789024',
      price: 0,
      cost: 22.00,
      stock: 6,
      minStock: 3,
      maxStock: 15,
      unit: 'ounces',
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['coffee-corner'],
      name: 'Acai Puree',
      description: 'Frozen acai puree',
      category: 'fruits',
      sku: 'CO-ING-ACA-001',
      barcode: '123456789025',
      price: 0,
      cost: 8.00,
      stock: 10,
      minStock: 5,
      maxStock: 25,
      unit: 'pounds',
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // Taco Fiesta items
    {
      businessId: businesses['taco-fiesta'],
      name: 'Corn Tortillas (Expiring Soon)',
      description: 'Fresh corn tortillas',
      category: 'tortillas',
      sku: 'TF-ING-TOR-001',
      barcode: '123456789030',
      price: 0,
      cost: 3.50,
      stock: 25,
      minStock: 10,
      maxStock: 50,
      unit: 'packages',
      expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['taco-fiesta'],
      name: 'Carne Asada (Premium)',
      description: 'Premium marinated beef for tacos',
      category: 'meat',
      sku: 'TF-ING-CAR-001',
      barcode: '123456789031',
      price: 0,
      cost: 18.00,
      stock: 8,
      minStock: 5,
      maxStock: 20,
      unit: 'pounds',
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['taco-fiesta'],
      name: 'Al Pastor (Underperforming)',
      description: 'Marinated pork for al pastor',
      category: 'meat',
      sku: 'TF-ING-ALP-001',
      barcode: '123456789032',
      price: 0,
      cost: 12.00,
      stock: 15,
      minStock: 8,
      maxStock: 25,
      unit: 'pounds',
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['taco-fiesta'],
      name: 'Fresh Cilantro',
      description: 'Fresh cilantro for garnishing',
      category: 'herbs',
      sku: 'TF-ING-CIL-001',
      barcode: '123456789033',
      price: 0,
      cost: 2.00,
      stock: 12,
      minStock: 5,
      maxStock: 20,
      unit: 'bunches',
      expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['taco-fiesta'],
      name: 'Limes (Expiring Soon)',
      description: 'Fresh limes for tacos',
      category: 'fruits',
      sku: 'TF-ING-LIM-001',
      barcode: '123456789034',
      price: 0,
      cost: 4.00,
      stock: 30,
      minStock: 15,
      maxStock: 60,
      unit: 'pieces',
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // American Diner items
    {
      businessId: businesses['american-diner'],
      name: 'Ground Beef (Premium)',
      description: 'Premium ground beef for burgers',
      category: 'meat',
      sku: 'AD-ING-BEE-001',
      barcode: '123456789040',
      price: 0,
      cost: 8.50,
      stock: 20,
      minStock: 10,
      maxStock: 40,
      unit: 'pounds',
      expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['american-diner'],
      name: 'Brioche Buns (Expiring Soon)',
      description: 'Fresh brioche buns for burgers',
      category: 'bread',
      sku: 'AD-ING-BUN-001',
      barcode: '123456789041',
      price: 0,
      cost: 3.00,
      stock: 18,
      minStock: 8,
      maxStock: 30,
      unit: 'packages',
      expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['american-diner'],
      name: 'Cheddar Cheese (Underperforming)',
      description: 'Sharp cheddar cheese',
      category: 'dairy',
      sku: 'AD-ING-CHE-001',
      barcode: '123456789042',
      price: 0,
      cost: 6.00,
      stock: 12,
      minStock: 5,
      maxStock: 25,
      unit: 'pounds',
      expirationDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['american-diner'],
      name: 'Russet Potatoes',
      description: 'Fresh russet potatoes for fries',
      category: 'vegetables',
      sku: 'AD-ING-POT-001',
      barcode: '123456789043',
      price: 0,
      cost: 2.50,
      stock: 25,
      minStock: 10,
      maxStock: 50,
      unit: 'pounds',
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['american-diner'],
      name: 'Bacon (Premium)',
      description: 'Premium thick-cut bacon',
      category: 'meat',
      sku: 'AD-ING-BAC-001',
      barcode: '123456789044',
      price: 0,
      cost: 12.00,
      stock: 8,
      minStock: 5,
      maxStock: 20,
      unit: 'pounds',
      expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // Golden Dragon items
    {
      businessId: businesses['golden-dragon'],
      name: 'Rice Flour (Expiring Soon)',
      description: 'Rice flour for dim sum',
      category: 'flour',
      sku: 'GD-ING-RIC-001',
      barcode: '123456789050',
      price: 0,
      cost: 4.50,
      stock: 15,
      minStock: 8,
      maxStock: 30,
      unit: 'pounds',
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['golden-dragon'],
      name: 'Shrimp (Premium)',
      description: 'Fresh shrimp for dim sum',
      category: 'seafood',
      sku: 'GD-ING-SHR-001',
      barcode: '123456789051',
      price: 0,
      cost: 16.00,
      stock: 6,
      minStock: 3,
      maxStock: 15,
      unit: 'pounds',
      expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['golden-dragon'],
      name: 'Char Siu (Underperforming)',
      description: 'Chinese BBQ pork',
      category: 'meat',
      sku: 'GD-ING-CHA-001',
      barcode: '123456789052',
      price: 0,
      cost: 14.00,
      stock: 10,
      minStock: 5,
      maxStock: 20,
      unit: 'pounds',
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['golden-dragon'],
      name: 'Bamboo Shoots',
      description: 'Fresh bamboo shoots',
      category: 'vegetables',
      sku: 'GD-ING-BAM-001',
      barcode: '123456789053',
      price: 0,
      cost: 3.50,
      stock: 8,
      minStock: 4,
      maxStock: 15,
      unit: 'cans',
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['golden-dragon'],
      name: 'Soy Sauce (Premium)',
      description: 'Premium soy sauce',
      category: 'sauces',
      sku: 'GD-ING-SOY-001',
      barcode: '123456789054',
      price: 0,
      cost: 8.00,
      stock: 12,
      minStock: 5,
      maxStock: 25,
      unit: 'bottles',
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Generate additional items for all businesses
  const itemTemplates = [
    // Italian ingredients
    { base: 'Cheese', variations: ['Parmesan', 'Pecorino', 'Gorgonzola', 'Ricotta', 'Burrata', 'Provolone', 'Fontina', 'Taleggio', 'Asiago', 'Manchego'] },
    { base: 'Pasta', variations: ['Spaghetti', 'Fettuccine', 'Penne', 'Rigatoni', 'Linguine', 'Farfalle', 'Orecchiette', 'Cavatelli', 'Tortellini', 'Lasagna'] },
    { base: 'Sauce', variations: ['Marinara', 'Pesto', 'Alfredo', 'Carbonara', 'Arrabbiata', 'Puttanesca', 'Bolognese', 'Vodka', 'Pomodoro', 'Amatriciana'] },
    { base: 'Meat', variations: ['Prosciutto', 'Salami', 'Mortadella', 'Pancetta', 'Guanciale', 'Speck', 'Bresaola', 'Capicola', 'Soppressata', 'Nduja'] },
    { base: 'Herbs', variations: ['Basil', 'Oregano', 'Thyme', 'Rosemary', 'Sage', 'Marjoram', 'Tarragon', 'Bay Leaves', 'Parsley', 'Chives'] },
    { base: 'Vegetables', variations: ['Tomatoes', 'Zucchini', 'Eggplant', 'Bell Peppers', 'Mushrooms', 'Spinach', 'Arugula', 'Artichokes', 'Asparagus', 'Broccoli'] },
    
    // Sushi ingredients
    { base: 'Fish', variations: ['Tuna', 'Salmon', 'Yellowtail', 'Mackerel', 'Snapper', 'Bass', 'Amberjack', 'Flounder', 'Halibut', 'Sea Bream'] },
    { base: 'Seafood', variations: ['Shrimp', 'Crab', 'Lobster', 'Scallops', 'Uni', 'Ikura', 'Tobiko', 'Masago', 'Eel', 'Octopus'] },
    { base: 'Rice', variations: ['Sushi Rice', 'Brown Rice', 'Jasmine Rice', 'Basmati Rice', 'Sticky Rice', 'Wild Rice', 'Black Rice', 'Red Rice', 'Forbidden Rice', 'Arborio'] },
    { base: 'Seaweed', variations: ['Nori', 'Wakame', 'Kombu', 'Dulse', 'Arame', 'Hijiki', 'Mozuku', 'Ogonori', 'Irish Moss', 'Bladderwrack'] },
    
    // Coffee ingredients
    { base: 'Coffee Bean', variations: ['Ethiopian', 'Colombian', 'Brazilian', 'Guatemalan', 'Costa Rican', 'Kenyan', 'Tanzanian', 'Peruvian', 'Mexican', 'Honduran'] },
    { base: 'Milk', variations: ['Whole', 'Skim', '2%', 'Almond', 'Soy', 'Oat', 'Coconut', 'Cashew', 'Hemp', 'Rice'] },
    { base: 'Syrup', variations: ['Vanilla', 'Caramel', 'Hazelnut', 'Mocha', 'Pumpkin', 'Peppermint', 'Cinnamon', 'Almond', 'Coconut', 'Lavender'] },
    { base: 'Tea', variations: ['Green', 'Black', 'Oolong', 'White', 'Herbal', 'Rooibos', 'Chamomile', 'Peppermint', 'Earl Grey', 'Jasmine'] }
  ];

  // Generate hundreds of additional items
  let itemId = comprehensiveItems.length + 1;
  
  for (const businessSlug of businessSlugs) {
    const businessId = businesses[businessSlug];
    if (!businessId) continue;

    for (const template of itemTemplates) {
      for (const variation of template.variations) {
        const itemName = `${variation} ${template.base}`;
        
        // Skip if already exists
        const existingItem = comprehensiveItems.find(i => i.name === itemName && i.businessId === businessId);
        if (existingItem) continue;

        // Generate item based on business type
        let category = template.base.toLowerCase();
        let cost = 5.00 + Math.random() * 20; // $5-25 range
        let stock = 5 + Math.floor(Math.random() * 20);
        let unit = 'pieces';
        let expirationDays = 30 + Math.floor(Math.random() * 335); // 30 days to 1 year

        // Adjust for business type
        if (businessSlug === 'italian-delight') {
          if (template.base === 'Cheese') cost = 8.00 + Math.random() * 15;
          if (template.base === 'Pasta') cost = 3.00 + Math.random() * 8;
          if (template.base === 'Sauce') cost = 2.00 + Math.random() * 6;
          unit = template.base === 'Cheese' ? 'pounds' : template.base === 'Pasta' ? 'pounds' : 'jars';
        } else if (businessSlug === 'sushi-master') {
          if (template.base === 'Fish') cost = 12.00 + Math.random() * 25;
          if (template.base === 'Seafood') cost = 15.00 + Math.random() * 20;
          if (template.base === 'Rice') cost = 3.00 + Math.random() * 8;
          unit = template.base === 'Fish' ? 'pounds' : template.base === 'Seafood' ? 'pounds' : 'pounds';
          expirationDays = template.base === 'Fish' || template.base === 'Seafood' ? 1 + Math.floor(Math.random() * 3) : 180;
        } else if (businessSlug === 'coffee-corner') {
          if (template.base === 'Coffee Bean') cost = 8.00 + Math.random() * 12;
          if (template.base === 'Milk') cost = 2.00 + Math.random() * 4;
          if (template.base === 'Syrup') cost = 3.00 + Math.random() * 5;
          unit = template.base === 'Coffee Bean' ? 'pounds' : template.base === 'Milk' ? 'gallons' : 'bottles';
          expirationDays = template.base === 'Coffee Bean' ? 180 : template.base === 'Milk' ? 7 : 365;
        }

        const item = {
          businessId,
          name: itemName,
          description: `Premium ${variation.toLowerCase()} ${template.base.toLowerCase()} for ${businessSlug.replace('-', ' ')}`,
          category,
          sku: `${businessSlug.substring(0, 2).toUpperCase()}-ING-${template.base.substring(0, 3).toUpperCase()}-${itemId.toString().padStart(3, '0')}`,
          barcode: `123456789${(itemId + 1000).toString().padStart(3, '0')}`, // Ensure unique barcodes
          price: 0,
          cost: Math.round(cost * 100) / 100,
          stock,
          minStock: Math.floor(stock * 0.3),
          maxStock: stock * 2,
          unit,
          expirationDate: new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        comprehensiveItems.push(item);
        itemId++;
      }
    }
  }

  // Insert items one by one to avoid SQL Server issues with large bulk inserts
  console.log(`📦 Inserting ${comprehensiveItems.length} comprehensive items one by one...`);
  
  let insertedCount = 0;
  let skippedCount = 0;
  
  for (let i = 0; i < comprehensiveItems.length; i++) {
    const item = comprehensiveItems[i];
    if (!item) continue;
    
    if (i % 100 === 0) {
      console.log(`📦 Processing item ${i + 1}/${comprehensiveItems.length}...`);
    }
    
    // Check if item already exists
    const [existingItems] = await queryInterface.sequelize.query(
      'SELECT id FROM items WHERE businessId = ? AND name = ?',
      {
        replacements: [item.businessId, item.name]
      }
    ) as any[];
    
    if (existingItems && existingItems.length > 0) {
      skippedCount++;
      continue; // Skip if item already exists
    }
    
    try {
      await queryInterface.sequelize.query(
        'INSERT INTO [items] ([businessId],[name],[description],[category],[sku],[barcode],[price],[cost],[stock],[minStock],[maxStock],[unit],[expirationDate],[isActive],[createdAt],[updatedAt]) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        {
          replacements: [
            item.businessId,
            item.name,
            item.description,
            item.category,
            item.sku,
            item.barcode,
            item.price,
            item.cost,
            item.stock,
            item.minStock,
            item.maxStock,
            item.unit,
            item.expirationDate,
            item.isActive,
            item.createdAt,
            item.updatedAt
          ]
        }
      );
      insertedCount++;
    } catch (error) {
      console.log(`⚠️ Skipping item "${item.name}" due to constraint violation`);
      skippedCount++;
    }
  }

  console.log('✅ Comprehensive items seeder completed successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - Total items processed: ${comprehensiveItems.length}`);
  console.log(`   - Items inserted: ${insertedCount}`);
  console.log(`   - Items skipped (already exist): ${skippedCount}`);
  console.log(`   - Italian Delight items: ${comprehensiveItems.filter(i => i.businessId === businesses['italian-delight']).length}`);
  console.log(`   - Sushi Master items: ${comprehensiveItems.filter(i => i.businessId === businesses['sushi-master']).length}`);
  console.log(`   - Coffee Corner items: ${comprehensiveItems.filter(i => i.businessId === businesses['coffee-corner']).length}`);
  console.log(`   - Expiring items: ${comprehensiveItems.filter(i => i.expirationDate < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length}`);
  console.log(`   - Underperforming items (high stock): ${comprehensiveItems.filter(i => i.stock > i.maxStock * 0.8).length}`);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  console.log('🗑️ Rolling back comprehensive items seeder...');
  
  // Delete items created by this seeder
  await queryInterface.sequelize.query('DELETE FROM items WHERE createdAt >= ?', {
    replacements: [new Date('2025-01-01')]
  });

  console.log('✅ Comprehensive items seeder rolled back successfully!');
} 