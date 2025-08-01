import { QueryInterface, QueryTypes } from 'sequelize';
import { generateSku, generateBarcode } from '../../utils/skuGenerator';
import dotenv from 'dotenv';

// Function to get valid Unsplash image URL based on category
function getImageUrlForCategory(category: string): string {
  const validPhotoIds = {
    'pizza': '1565299624946-b28f40a0ca4b',
    'pasta': '1621996346565-e3dbc353d946',
    'salad': '1540420773420-3366772f4999',
    'dessert': '1565958011703-44f9829ba187',
    'coffee': '1509042239860-f550ce710b93',
    'tea': '1541167760496-1628856ab772',
    'wine': '1510812431401-41d2bd2722f3',
    'beer': '1556909114-f6e7ad7d3136',
    'vegetables': '1556909114-f6e7ad7d3136',
    'fruits': '1565299624946-b28f40a0ca4b',
    'meat': '1544025162-d76694265947',
    'seafood': '1556909114-f6e7ad7d3136',
    'dairy': '1556909114-f6e7ad7d3136',
    'grains': '1607958996338-0106d5c0c1e1',
    'spices': '1565557623262-b51c2513a641',
    'herbs': '1565299624946-b28f40a0ca4b',
    'ingredients': '1604382354936-07c5d9983bd3',
    'fish': '1579584425555-c3ce17fd4351',
    'pastry': '1571877227200-a0d98ea607e9',
    'bread': '1628840042765-356cda07504e',
    'sweeteners': '1551183053-bf91a1d81141',
    'syrups': '1551024506-0bccd828d307',
    'sauces': '1547592166-23ac45744acd',
    'oils': '1553621042-f6e147245754',
    'default': '1604382354936-07c5d9983bd3'
  };

  const photoId = validPhotoIds[category as keyof typeof validPhotoIds] || validPhotoIds.default;
  return `https://images.unsplash.com/photo-${photoId}?w=400&h=300&fit=crop&crop=center`;
}

dotenv.config();

export async function up(queryInterface: QueryInterface): Promise<void> {
  console.log('🛒 Starting comprehensive items seeder...');

  // Get business IDs
  const businesses: { [key: string]: number } = {};
  const businessSlugs = ['italian-delight'];
  
  for (const slug of businessSlugs) {
    const [biz] = await queryInterface.sequelize.query(
      'SELECT id FROM businesses WHERE slug = ?',
      { type: QueryTypes.SELECT, replacements: [slug] }
    ) as any[];
    if (biz) {
      businesses[slug] = biz.id;
    } else {
      console.log(`⚠️ Business not found: ${slug}`);
    }
  }

  // Get CRC currency ID
  const [crcCurrency] = await queryInterface.sequelize.query(
    'SELECT id FROM currencies WHERE code = ?',
    { type: QueryTypes.SELECT, replacements: ['CRC'] }
  ) as any[];
  
  const crcId = crcCurrency?.id;
  if (!crcId) {
    console.log('⚠️ CRC currency not found');
    return;
  }

  // Track existing barcodes to ensure uniqueness
  const existingBarcodes = new Set<string>();

  // Comprehensive Items Database - REMOVED DUPLICATES that exist in first seeder
  const comprehensiveItems = [
    // ITALIAN DELIGHT - INGREDIENTS (100+ items) - REMOVED "Fresh Mozzarella" duplicate
    {
      businessId: businesses['italian-delight'],
      name: 'Truffle Oil (Underperforming)',
      description: 'Premium black truffle oil',
      category: 'oils',
      sku: generateSku('IT', 101),
      barcode: generateBarcode('IT', 101, existingBarcodes),
      price: 23.40,
      cost: 18.00,
      stock: 8,
      minStock: 3,
      maxStock: 20,
      unit: 'bottles',
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
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
      sku: generateSku('IT', 102),
      barcode: generateBarcode('IT', 102, existingBarcodes),
      price: 19.50,
      cost: 15.00,
      stock: 5,
      minStock: 2,
      maxStock: 15,
      unit: 'pounds',
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
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
      sku: generateSku('IT', 103),
      barcode: generateBarcode('IT', 103, existingBarcodes),
      price: 21.45,
      cost: 16.50,
      stock: 13,
      minStock: 5,
      maxStock: 25,
      unit: 'pieces',
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
      expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day

      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['italian-delight'],
      name: 'Wagyu Beef (Premium)',
      description: 'Premium Japanese Wagyu beef',
      category: 'meat',
      sku: generateSku('IT', 104),
      barcode: generateBarcode('IT', 104, existingBarcodes),
      price: 45.60,
      cost: 35.00,
      stock: 3,
      minStock: 1,
      maxStock: 10,
      unit: 'pounds',
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
      expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days

      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['italian-delight'],
      name: 'Fresh Basil',
      description: 'Fresh organic basil leaves',
      category: 'herbs',
      sku: generateSku('IT', 105),
      barcode: generateBarcode('IT', 105, existingBarcodes),
      price: 4.20,
      cost: 2.50,
      stock: 25,
      minStock: 10,
      maxStock: 50,
      unit: 'bunches',
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
      expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days

      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['italian-delight'],
      name: 'Cherry Tomatoes',
      description: 'Sweet cherry tomatoes',
      category: 'vegetables',
      sku: generateSku('IT', 106),
      barcode: generateBarcode('IT', 106, existingBarcodes),
      price: 6.80,
      cost: 4.20,
      stock: 18,
      minStock: 8,
      maxStock: 40,
      unit: 'pints',
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
      expirationDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days

      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['italian-delight'],
      name: 'Premium Saffron (Underperforming)',
      description: 'Premium Spanish saffron threads',
      category: 'spices',
      sku: generateSku('IT', 107),
      barcode: generateBarcode('IT', 107, existingBarcodes),
      price: 28.90,
      cost: 22.00,
      stock: 6,
      minStock: 2,
      maxStock: 15,
      unit: 'grams',
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
      expirationDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000), // 2 years

      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },


  ];

  // Insert hardcoded items first
  const chunkSize = 50;
  for (let i = 0; i < comprehensiveItems.length; i += chunkSize) {
    const chunk = comprehensiveItems.slice(i, i + chunkSize);
    try {
      await queryInterface.bulkInsert('items', chunk);
      console.log(`✅ Inserted hardcoded chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(comprehensiveItems.length / chunkSize)}`);
    } catch (error) {
      console.log(`⚠️ Bulk insert failed for hardcoded chunk ${Math.floor(i / chunkSize) + 1}, trying individual inserts... Error: ${(error as Error).message}`);
      // Fallback to individual inserts
      for (const item of chunk) {
        try {
          await queryInterface.bulkInsert('items', [item]);
        } catch (itemError) {
          console.log(`❌ Failed to insert hardcoded item: ${item.name} - Error: ${(itemError as Error).message}`);
        }
      }
    }
  }

  // Now generate massive amounts of additional items for each business
  console.log('🔄 Generating massive amounts of additional items...');
  
  const allDynamicItems: any[] = [];
  
  for (const [businessSlug, businessId] of Object.entries(businesses)) {
    if (!businessId || !businessSlug) continue;
    
    console.log(`📦 Generating additional items for ${businessSlug}...`);
    
    // Generate 1000-2000 additional items per business for MASSIVE database
    const additionalItemsPerBusiness = Math.floor(Math.random() * 1000) + 1000; // 1000-2000 items
    
    for (let i = 0; i < additionalItemsPerBusiness; i++) {
      const itemId = i + 1;
      const prefix = (businessSlug as any).split('-')[0].toUpperCase();
      
      // Generate unique barcode
      const barcode = generateBarcode(prefix, itemId + 1000, existingBarcodes);
      
      // Random item properties based on business type
      const businessCategories = {
        'italian-delight': ['ingredients', 'dairy', 'meat', 'seafood', 'vegetables', 'fruits', 'grains', 'spices', 'oils', 'herbs'],
        'sushi-master': ['fish', 'seafood', 'ingredients', 'vegetables', 'grains', 'spices', 'sauces'],
        'coffee-corner': ['coffee', 'tea', 'dairy', 'pastry', 'bread', 'fruits', 'sweeteners', 'syrups']
      };
      
      const categories = businessCategories[businessSlug as keyof typeof businessCategories] || ['ingredients'];
      const category = categories[Math.floor(Math.random() * categories.length)] || 'ingredients';
      
      // Realistic units based on category
      const unitMap = {
        'ingredients': ['pieces', 'pounds', 'kilograms', 'grams', 'ounces'],
        'dairy': ['gallons', 'pounds', 'pieces', 'quarts'],
        'meat': ['pounds', 'pieces', 'kilograms'],
        'seafood': ['pounds', 'pieces', 'kilograms'],
        'fish': ['pounds', 'pieces', 'kilograms'],
        'vegetables': ['pounds', 'pieces', 'bunches', 'heads'],
        'fruits': ['pounds', 'pieces', 'bunches'],
        'grains': ['pounds', 'kilograms', 'bags'],
        'spices': ['grams', 'ounces', 'pounds'],
        'oils': ['bottles', 'gallons', 'liters'],
        'herbs': ['bunches', 'pieces', 'grams'],
        'coffee': ['pounds', 'kilograms', 'bags'],
        'tea': ['ounces', 'pounds', 'bags'],
        'pastry': ['pieces', 'pounds', 'dozens'],
        'bread': ['loaves', 'pieces', 'pounds'],
        'sweeteners': ['pounds', 'kilograms', 'bags'],
        'syrups': ['bottles', 'gallons', 'liters'],
        'sauces': ['bottles', 'gallons', 'liters']
      };
      
      const units = unitMap[category as keyof typeof unitMap] || ['pieces'];
      const unit = units[itemId % units.length]; // Deterministic unit selection
      
      // Realistic pricing and stock based on category
      const costMap = {
        'ingredients': 5.50,
        'dairy': 3.25,
        'meat': 12.75,
        'seafood': 18.50,
        'fish': 22.00,
        'vegetables': 2.80,
        'fruits': 4.20,
        'grains': 3.90,
        'spices': 8.75,
        'oils': 15.30,
        'herbs': 3.45,
        'coffee': 12.80,
        'tea': 6.40,
        'pastry': 4.60,
        'bread': 2.90,
        'sweeteners': 3.20,
        'syrups': 7.85,
        'sauces': 4.50
      };
      
      const stockMap = {
        'ingredients': 25,
        'dairy': 15,
        'meat': 8,
        'seafood': 5,
        'fish': 6,
        'vegetables': 20,
        'fruits': 18,
        'grains': 30,
        'spices': 12,
        'oils': 10,
        'herbs': 15,
        'coffee': 20,
        'tea': 15,
        'pastry': 12,
        'bread': 8,
        'sweeteners': 25,
        'syrups': 8,
        'sauces': 12
      };
      
      const cost = costMap[category as keyof typeof costMap] || 5.00;
      const stock = stockMap[category as keyof typeof stockMap] || 15;
      const minStock = Math.floor(stock * 0.3);
      const maxStock = stock * 2;
      
      // Realistic expiration based on category
      const daysToExpiry = category === 'vegetables' ? 5 : 
                           category === 'fruits' ? 10 : 
                           category === 'dairy' ? 14 : 
                           category === 'meat' ? 3 : 
                           category === 'seafood' ? 2 : 
                           category === 'fish' ? 2 : 365;
      
      const expirationDate = new Date(Date.now() + daysToExpiry * 24 * 60 * 60 * 1000);
      
      // Generate realistic item name based on category and business
      const itemNames = {
        ingredients: ['Premium Flour', 'Organic Eggs', 'Fresh Herbs', 'Quality Salt', 'Pure Vanilla', 'Baking Soda', 'Yeast', 'Sugar', 'Brown Sugar', 'Powdered Sugar', 'Cornstarch', 'Baking Powder', 'Cocoa Powder', 'Chocolate Chips', 'Nuts', 'Dried Fruits', 'Honey', 'Maple Syrup', 'Molasses', 'Corn Syrup'],
        dairy: ['Fresh Milk', 'Cream', 'Butter', 'Yogurt', 'Ricotta', 'Parmesan', 'Mozzarella', 'Cheddar', 'Swiss', 'Provolone', 'Gouda', 'Brie', 'Blue Cheese', 'Feta', 'Cottage Cheese', 'Sour Cream', 'Heavy Cream', 'Half and Half', 'Buttermilk', 'Whipping Cream'],
        meat: ['Beef Tenderloin', 'Chicken Breast', 'Pork Chops', 'Lamb Shank', 'Duck Breast', 'Veal', 'Turkey', 'Bacon', 'Ham', 'Sausage', 'Ground Beef', 'Ground Pork', 'Ground Turkey', 'Beef Ribs', 'Pork Ribs', 'Chicken Wings', 'Chicken Thighs', 'Beef Brisket', 'Pork Belly', 'Lamb Chops'],
        seafood: ['Salmon Fillet', 'Tuna Steak', 'Shrimp', 'Lobster', 'Scallops', 'Mussels', 'Clams', 'Cod', 'Halibut', 'Mahi Mahi', 'Red Snapper', 'Sea Bass', 'Tilapia', 'Crab', 'Oysters', 'Squid', 'Octopus', 'Mackerel', 'Sardines', 'Anchovies'],
        fish: ['Bluefin Tuna', 'Yellowtail', 'Hamachi', 'Mackerel', 'Sardines', 'Albacore', 'Skipjack', 'Bigeye Tuna', 'Swordfish', 'Mahi Mahi', 'Wahoo', 'Amberjack', 'Grouper', 'Red Snapper', 'Sea Bass', 'Flounder', 'Sole', 'Turbot', 'Monkfish', 'Rockfish'],
        vegetables: ['Fresh Tomatoes', 'Organic Carrots', 'Spinach', 'Onions', 'Garlic', 'Mushrooms', 'Bell Peppers', 'Cucumber', 'Lettuce', 'Kale', 'Arugula', 'Broccoli', 'Cauliflower', 'Zucchini', 'Eggplant', 'Asparagus', 'Green Beans', 'Peas', 'Corn', 'Potatoes'],
        fruits: ['Apples', 'Bananas', 'Oranges', 'Strawberries', 'Blueberries', 'Lemons', 'Limes', 'Grapes', 'Pineapple', 'Mango', 'Peaches', 'Plums', 'Cherries', 'Raspberries', 'Blackberries', 'Kiwi', 'Pears', 'Nectarines', 'Apricots', 'Figs'],
        grains: ['Pasta', 'Bread', 'Quinoa', 'Oats', 'Barley', 'Wheat', 'Rice', 'Cornmeal', 'Polenta', 'Farro', 'Bulgur', 'Couscous', 'Millet', 'Buckwheat', 'Rye', 'Spelt', 'Amaranth', 'Teff', 'Sorghum', 'Wild Rice'],
        spices: ['Black Pepper', 'Cinnamon', 'Paprika', 'Cumin', 'Oregano', 'Basil', 'Thyme', 'Rosemary', 'Sage', 'Bay Leaves', 'Nutmeg', 'Allspice', 'Cardamom', 'Cloves', 'Ginger', 'Turmeric', 'Cayenne', 'Chili Powder', 'Garlic Powder', 'Onion Powder'],
        oils: ['Sesame Oil', 'Truffle Oil', 'Avocado Oil', 'Canola Oil', 'Grapeseed Oil', 'Walnut Oil', 'Hazelnut Oil', 'Almond Oil', 'Peanut Oil', 'Sunflower Oil', 'Safflower Oil', 'Palm Oil', 'Coconut Oil', 'Olive Oil', 'Flaxseed Oil', 'Pumpkin Seed Oil', 'Argan Oil', 'Jojoba Oil', 'Tea Tree Oil', 'Lavender Oil'],
        herbs: ['Rosemary', 'Thyme', 'Sage', 'Mint', 'Parsley', 'Cilantro', 'Dill', 'Chives', 'Tarragon', 'Marjoram', 'Lavender', 'Lemon Balm', 'Lemon Grass', 'Bay Leaves', 'Oregano', 'Basil', 'Chervil', 'Borage', 'Fennel', 'Anise'],
        coffee: ['Ethiopian Beans', 'Colombian Beans', 'Brazilian Beans', 'Guatemalan Beans', 'Kenyan Beans', 'Costa Rican Beans', 'Peruvian Beans', 'Mexican Beans', 'Nicaraguan Beans', 'Honduran Beans', 'El Salvador Beans', 'Panamanian Beans', 'Jamaican Beans', 'Hawaiian Beans', 'Sumatra Beans', 'Java Beans', 'Sulawesi Beans', 'Timor Beans', 'Papua New Guinea Beans', 'Yemeni Beans'],
        tea: ['Green Tea', 'Chamomile', 'Peppermint', 'Rooibos', 'Oolong', 'Black Tea', 'White Tea', 'Earl Grey', 'Jasmine Tea', 'Lavender Tea', 'Lemon Tea', 'Ginger Tea', 'Hibiscus Tea', 'Rose Tea', 'Bergamot Tea', 'Darjeeling Tea', 'Assam Tea', 'Ceylon Tea', 'Keemun Tea', 'Lapsang Souchong'],
        pastry: ['Croissant Dough', 'Muffin Mix', 'Scone Mix', 'Danish Dough', 'Puff Pastry', 'Pie Crust', 'Tart Shells', 'Phyllo Dough', 'Brioche Dough', 'Challah Dough', 'Focaccia Dough', 'Pizza Dough', 'Bread Dough', 'Cookie Dough', 'Brownie Mix', 'Cake Mix', 'Cupcake Mix', 'Donut Dough', 'Cinnamon Roll Dough', 'Sticky Bun Dough'],
        bread: ['Sourdough', 'Whole Wheat', 'Rye Bread', 'Baguette', 'Ciabatta', 'Focaccia', 'Challah', 'Brioche', 'Pumpernickel', 'Multigrain', 'French Bread', 'Italian Bread', 'Pita Bread', 'Naan Bread', 'Tortillas', 'English Muffins', 'Bagels', 'Croissants', 'Dinner Rolls', 'Hamburger Buns'],
        sweeteners: ['Sugar', 'Honey', 'Maple Syrup', 'Agave', 'Stevia', 'Splenda', 'Equal', 'Sweet N Low', 'Monk Fruit', 'Erythritol', 'Xylitol', 'Sorbitol', 'Maltitol', 'Lactitol', 'Isomalt', 'Tagatose', 'Trehalose', 'Allulose', 'Yacon Syrup', 'Date Syrup'],
        syrups: ['Vanilla Syrup', 'Caramel Syrup', 'Chocolate Syrup', 'Hazelnut Syrup', 'Almond Syrup', 'Coconut Syrup', 'Strawberry Syrup', 'Raspberry Syrup', 'Blueberry Syrup', 'Mango Syrup', 'Peach Syrup', 'Pineapple Syrup', 'Orange Syrup', 'Lemon Syrup', 'Lime Syrup', 'Mint Syrup', 'Lavender Syrup', 'Rose Syrup', 'Cinnamon Syrup', 'Ginger Syrup'],
        sauces: ['Soy Sauce', 'Teriyaki Sauce', 'Ponzu Sauce', 'Miso Paste', 'Wasabi', 'Sriracha', 'Hot Sauce', 'BBQ Sauce', 'Ketchup', 'Mustard', 'Mayonnaise', 'Ranch Dressing', 'Blue Cheese Dressing', 'Italian Dressing', 'French Dressing', 'Thousand Island', 'Honey Mustard', 'Sweet Chili Sauce', 'Fish Sauce', 'Oyster Sauce']
      };
      
      const names = itemNames[category as keyof typeof itemNames] || ['Generic Item'];
      const nameIndex = itemId % names.length;
      const name = names[nameIndex] || 'Generic Item';
      
      allDynamicItems.push({
        businessId,
        name,
        description: `High-quality ${name.toLowerCase()} for ${businessSlug}`,
        category,
                 sku: generateSku(prefix, itemId + 1000),
        barcode,
        price: Math.round((cost * 1.4) * 100) / 100, // Fixed 40% markup for consistency
        cost,
        stock,
        minStock,
        maxStock,
        unit,
        currencyId: crcId, // CRC (Costa Rican Colón) - default currency
        imageUrl: getImageUrlForCategory(category),
        isActive: true,
        isPerishable: category === 'vegetables' || category === 'fruits' || category === 'dairy' || category === 'meat' || category === 'seafood',
        expirationDate,
        manufacturingDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        shelfLifeDays: category === 'vegetables' ? 7 : category === 'fruits' ? 14 : category === 'dairy' ? 21 : category === 'meat' ? 3 : category === 'seafood' ? 2 : 365,
        lastSoldDate: null,
        salesVelocity: 0,
        daysSinceLastSale: 0,
        isUnderperforming: stock < minStock,
        isExpiringSoon: daysToExpiry <= 7,
        isVegetarian: category === 'vegetables' || category === 'fruits' || category === 'grains' || category === 'dairy',
        isVegan: category === 'vegetables' || category === 'fruits' || category === 'grains',
        isGlutenFree: category === 'vegetables' || category === 'fruits' || category === 'meat' || category === 'seafood' || category === 'dairy',
        isSpicy: category === 'spices' || name.toLowerCase().includes('spicy') || name.toLowerCase().includes('hot'),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }

  // Add missing ingredients that recipe templates need
  const missingIngredients = [
    // Sushi Master missing ingredients
    {
      businessId: businesses['sushi-master'],
      name: 'Nori Sheets',
      description: 'Premium roasted seaweed sheets for sushi',
      category: 'ingredients',
      sku: generateSku('SM', 999),
      barcode: generateBarcode('SM', 999, existingBarcodes),
      price: 12.99,
      cost: 8.00,
      stock: 25,
      minStock: 10,
      maxStock: 50,
      unit: 'sheets',
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
      isPerishable: false,
      isUnderperforming: false,
      isExpiringSoon: false,
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      isSpicy: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    // Sushi Master missing ingredients
    {
      businessId: businesses['sushi-master'],
      name: 'Nori Sheets',
      description: 'Premium roasted seaweed sheets for sushi',
      category: 'ingredients',
      sku: 'SM-ING-NOR-001',
      barcode: generateBarcode('SM', 999, existingBarcodes),
      price: 12.99,
      cost: 8.00,
      stock: 25,
      minStock: 10,
      maxStock: 50,
      unit: 'sheets',
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
      isPerishable: false,
      isUnderperforming: false,
      isExpiringSoon: false,
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      isSpicy: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    // Coffee Corner missing ingredients
    {
      businessId: businesses['coffee-corner'],
      name: 'Ethiopian Yirgacheffe Beans',
      description: 'Premium Ethiopian Yirgacheffe coffee beans',
      category: 'coffee',
      sku: generateSku('CC', 999),
      barcode: generateBarcode('CC', 999, existingBarcodes),
      price: 24.99,
      cost: 18.00,
      stock: 8,
      minStock: 3,
      maxStock: 20,
      unit: 'pounds',
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
      expirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      isActive: true,
      isPerishable: false,
      isUnderperforming: false,
      isExpiringSoon: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['coffee-corner'],
      name: 'Colombian Supremo Beans',
      description: 'Premium Colombian Supremo coffee beans',
      category: 'coffee',
      sku: generateSku('CC', 998),
      barcode: generateBarcode('CC', 998, existingBarcodes),
      price: 22.99,
      cost: 16.50,
      stock: 10,
      minStock: 4,
      maxStock: 25,
      unit: 'pounds',
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
      expirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      isActive: true,
      isPerishable: false,
      isUnderperforming: false,
      isExpiringSoon: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['coffee-corner'],
      name: 'Oat Milk (Expiring Soon)',
      description: 'Organic oat milk',
      category: 'dairy',
      sku: generateSku('CC', 997),
      barcode: generateBarcode('CC', 997, existingBarcodes),
      price: 5.99,
      cost: 3.50,
      stock: 6,
      minStock: 2,
      maxStock: 15,
      unit: 'quarts',
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
      expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      isActive: true,
      isPerishable: true,
      isUnderperforming: false,
      isExpiringSoon: true,
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      isSpicy: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Insert missing ingredients
  if (missingIngredients.length > 0) {
    console.log(`🔧 Adding ${missingIngredients.length} missing ingredients for recipe templates...`);
    try {
      await queryInterface.bulkInsert('items', missingIngredients);
      console.log(`✅ Added missing ingredients successfully`);
    } catch (error) {
      console.log(`⚠️ Error adding missing ingredients: ${(error as Error).message}`);
    }
  }

  console.log(`📦 Generated ${allDynamicItems.length} additional items total`);

  // Insert dynamic items in chunks
  for (let i = 0; i < allDynamicItems.length; i += chunkSize) {
    const chunk = allDynamicItems.slice(i, i + chunkSize);
    try {
      await queryInterface.bulkInsert('items', chunk);
      console.log(`✅ Inserted dynamic chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(allDynamicItems.length / chunkSize)}`);
    } catch (error) {
      console.log(`⚠️ Bulk insert failed for chunk ${Math.floor(i / chunkSize) + 1}, trying individual inserts... Error: ${(error as Error).message}`);
      // Fallback to individual inserts
      for (const item of chunk) {
        try {
          await queryInterface.bulkInsert('items', [item]);
        } catch (itemError) {
          console.log(`❌ Failed to insert item: ${item.name}`);
          console.log(`   Full error: ${JSON.stringify(itemError, null, 2)}`);
        }
      }
    }
  }

  console.log(`🎉 Comprehensive items seeder completed! Total items: ${comprehensiveItems.length + allDynamicItems.length}`);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  console.log('🔄 Rolling back comprehensive items seeder...');
  
  // Delete all items from Italian Delight business
  const businessSlugs = ['italian-delight'];

  for (const slug of businessSlugs) {
    const [business] = await queryInterface.sequelize.query(
      'SELECT id FROM businesses WHERE slug = ?',
      { type: QueryTypes.SELECT, replacements: [slug] }
    ) as any[];
    
    if (business && business.length > 0) {
      await queryInterface.bulkDelete('items', { businessId: business[0].id });
      console.log(`🗑️ Deleted items for ${slug}`);
    }
  }
  
  console.log('✅ Comprehensive items seeder rolled back!');
} 
