import { QueryInterface, QueryTypes } from 'sequelize';
import { generateBarcode } from '../../utils/skuGenerator';
import dotenv from 'dotenv';

dotenv.config();

export async function up(queryInterface: QueryInterface): Promise<void> {
  console.log('🛒 Starting comprehensive items seeder...');

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
      sku: 'IT-ING-TRU-001',
      barcode: generateBarcode('IT', 101, existingBarcodes),
      price: 23.40,
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
      barcode: generateBarcode('IT', 102, existingBarcodes),
      price: 19.50,
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
      barcode: generateBarcode('IT', 103, existingBarcodes),
      price: 21.45,
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
      description: 'Premium Japanese Wagyu beef',
      category: 'meat',
      sku: 'IT-ING-WAG-001',
      barcode: generateBarcode('IT', 104, existingBarcodes),
      price: 45.60,
      cost: 35.00,
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
      description: 'Fresh organic basil leaves',
      category: 'herbs',
      sku: 'IT-ING-BAS-001',
      barcode: generateBarcode('IT', 105, existingBarcodes),
      price: 4.20,
      cost: 2.50,
      stock: 25,
      minStock: 10,
      maxStock: 50,
      unit: 'bunches',
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
      sku: 'IT-ING-TOM-001',
      barcode: generateBarcode('IT', 106, existingBarcodes),
      price: 6.80,
      cost: 4.20,
      stock: 18,
      minStock: 8,
      maxStock: 40,
      unit: 'pints',
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
      sku: 'IT-ING-SAF-001',
      barcode: generateBarcode('IT', 107, existingBarcodes),
      price: 28.90,
      cost: 22.00,
      stock: 6,
      minStock: 2,
      maxStock: 15,
      unit: 'grams',
      expirationDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000), // 2 years

      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // SUSHI MASTER - INGREDIENTS - REMOVED "Salmon" and "Rice" duplicates
    {
      businessId: businesses['sushi-master'],
      name: 'Bluefin Tuna Otoro',
      description: 'Premium fatty tuna belly',
      category: 'fish',
      sku: 'SU-ING-OTO-001',
      barcode: generateBarcode('SU', 201, existingBarcodes),
      price: 35.75,
      cost: 28.00,
      stock: 4,
      minStock: 1,
      maxStock: 8,
      unit: 'pounds',
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days

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
      barcode: generateBarcode('SU', 202, existingBarcodes),
      price: 42.30,
      cost: 32.50,
      stock: 2,
      minStock: 1,
      maxStock: 5,
      unit: 'trays',
      expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day

      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['sushi-master'],
      name: 'Soft Shell Crab',
      description: 'Fresh soft shell crab',
      category: 'seafood',
      sku: 'SU-ING-CRB-001',
      barcode: generateBarcode('SU', 203, existingBarcodes),
      price: 18.90,
      cost: 14.50,
      stock: 7,
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
      name: 'Nori Sheets',
      description: 'Premium roasted nori sheets',
      category: 'ingredients',
      sku: 'SU-ING-NOR-001',
      barcode: generateBarcode('SU', 204, existingBarcodes),
      price: 12.60,
      cost: 9.70,
      stock: 15,
      minStock: 5,
      maxStock: 30,
      unit: 'packages',
      expirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months

      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // COFFEE CORNER - INGREDIENTS - REMOVED "Earl Grey Tea" duplicate
    {
      businessId: businesses['coffee-corner'],
      name: 'Ethiopian Yirgacheffe Beans',
      description: 'Single origin Ethiopian coffee beans',
      category: 'coffee',
      sku: 'CO-ING-ETH-001',
      barcode: generateBarcode('CO', 301, existingBarcodes),
      price: 16.80,
      cost: 12.90,
      stock: 12,
      minStock: 5,
      maxStock: 25,
      unit: 'pounds',
      expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months

      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['coffee-corner'],
      name: 'Colombian Supremo Beans',
      description: 'Premium Colombian coffee beans',
      category: 'coffee',
      sku: 'CO-ING-COL-001',
      barcode: generateBarcode('CO', 302, existingBarcodes),
      price: 14.50,
      cost: 11.20,
      stock: 18,
      minStock: 8,
      maxStock: 35,
      unit: 'pounds',
      expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months

      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['coffee-corner'],
      name: 'Sumatra Mandheling Beans',
      description: 'Full-bodied Indonesian coffee beans',
      category: 'coffee',
      sku: 'CO-ING-SUM-001',
      barcode: generateBarcode('CO', 303, existingBarcodes),
      price: 15.90,
      cost: 12.20,
      stock: 10,
      minStock: 4,
      maxStock: 20,
      unit: 'pounds',
      expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months

      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['coffee-corner'],
      name: 'Guatemala Antigua Beans',
      description: 'Smooth Guatemalan coffee beans',
      category: 'coffee',
      sku: 'CO-ING-GUA-001',
      barcode: generateBarcode('CO', 304, existingBarcodes),
      price: 13.70,
      cost: 10.50,
      stock: 14,
      minStock: 6,
      maxStock: 28,
      unit: 'pounds',
      expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months

      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['coffee-corner'],
      name: 'Kenya AA Beans',
      description: 'Bright Kenyan coffee beans',
      category: 'coffee',
      sku: 'CO-ING-KEN-001',
      barcode: generateBarcode('CO', 305, existingBarcodes),
      price: 17.20,
      cost: 13.20,
      stock: 8,
      minStock: 3,
      maxStock: 15,
      unit: 'pounds',
      expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months

      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['coffee-corner'],
      name: 'Oat Milk (Expiring Soon)',
      description: 'Barista oat milk',
      category: 'milk',
      sku: 'CO-ING-OAT-001',
      barcode: generateBarcode('CO', 306, existingBarcodes),
      price: 5.40,
      cost: 4.15,
      stock: 22,
      minStock: 10,
      maxStock: 45,
      unit: 'quarts',
      expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days

      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['coffee-corner'],
      name: 'Almond Milk',
      description: 'Unsweetened almond milk',
      category: 'milk',
      sku: 'CO-ING-ALM-001',
      barcode: generateBarcode('CO', 307, existingBarcodes),
      price: 6.20,
      cost: 4.75,
      stock: 16,
      minStock: 8,
      maxStock: 32,
      unit: 'quarts',
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days

      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['coffee-corner'],
      name: 'Coconut Milk',
      description: 'Full-fat coconut milk',
      category: 'milk',
      sku: 'CO-ING-COC-001',
      barcode: generateBarcode('CO', 308, existingBarcodes),
      price: 7.80,
      cost: 6.00,
      stock: 12,
      minStock: 5,
      maxStock: 25,
      unit: 'quarts',
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days

      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['coffee-corner'],
      name: 'Pain au Chocolat Dough',
      description: 'Buttery croissant dough with chocolate',
      category: 'pastry',
      sku: 'CO-ING-PAC-001',
      barcode: generateBarcode('CO', 309, existingBarcodes),
      price: 8.90,
      cost: 6.85,
      stock: 9,
      minStock: 4,
      maxStock: 18,
      unit: 'pieces',
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days

      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['coffee-corner'],
      name: 'Almond Croissant Dough',
      description: 'Buttery croissant dough with almond filling',
      category: 'pastry',
      sku: 'CO-ING-ALC-001',
      barcode: generateBarcode('CO', 310, existingBarcodes),
      price: 9.20,
      cost: 7.08,
      stock: 7,
      minStock: 3,
      maxStock: 15,
      unit: 'pieces',
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days

      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['coffee-corner'],
      name: 'Cinnamon Roll Dough',
      description: 'Sweet cinnamon roll dough',
      category: 'pastry',
      sku: 'CO-ING-CIN-001',
      barcode: generateBarcode('CO', 311, existingBarcodes),
      price: 7.50,
      cost: 5.77,
      stock: 11,
      minStock: 5,
      maxStock: 22,
      unit: 'pieces',
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days

      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['coffee-corner'],
      name: 'Scone Mix',
      description: 'Traditional scone mix',
      category: 'pastry',
      sku: 'CO-ING-SCO-001',
      barcode: generateBarcode('CO', 312, existingBarcodes),
      price: 6.80,
      cost: 5.23,
      stock: 13,
      minStock: 6,
      maxStock: 26,
      unit: 'pieces',
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days

      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['coffee-corner'],
      name: 'Sourdough Bread',
      description: 'Artisanal sourdough bread',
      category: 'bread',
      sku: 'CO-ING-SOU-001',
      barcode: generateBarcode('CO', 313, existingBarcodes),
      price: 4.90,
      cost: 3.77,
      stock: 8,
      minStock: 4,
      maxStock: 16,
      unit: 'loaves',
      expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days

      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['coffee-corner'],
      name: 'Whole Wheat Bread',
      description: 'Healthy whole wheat bread',
      category: 'bread',
      sku: 'CO-ING-WHE-001',
      barcode: generateBarcode('CO', 314, existingBarcodes),
      price: 4.20,
      cost: 3.23,
      stock: 10,
      minStock: 5,
      maxStock: 20,
      unit: 'loaves',
      expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days

      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['coffee-corner'],
      name: 'Avocado Toast Base',
      description: 'Fresh bread for avocado toast',
      category: 'toast',
      sku: 'CO-ING-AVO-001',
      barcode: generateBarcode('CO', 315, existingBarcodes),
      price: 3.60,
      cost: 2.77,
      stock: 15,
      minStock: 8,
      maxStock: 30,
      unit: 'slices',
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days

      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['coffee-corner'],
      name: 'Salmon Toast Base',
      description: 'Fresh bread for salmon toast',
      category: 'toast',
      sku: 'CO-ING-SAL-001',
      barcode: generateBarcode('CO', 316, existingBarcodes),
      price: 4.10,
      cost: 3.15,
      stock: 12,
      minStock: 6,
      maxStock: 24,
      unit: 'slices',
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days

      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['coffee-corner'],
      name: 'Matcha Powder',
      description: 'Premium Japanese matcha powder',
      category: 'tea',
      sku: 'CO-ING-MAT-001',
      barcode: generateBarcode('CO', 317, existingBarcodes),
      price: 22.40,
      cost: 17.23,
      stock: 6,
      minStock: 2,
      maxStock: 12,
      unit: 'grams',
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year

      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['coffee-corner'],
      name: 'Chai Concentrate',
      description: 'Spiced chai tea concentrate',
      category: 'tea',
      sku: 'CO-ING-CHA-001',
      barcode: generateBarcode('CO', 318, existingBarcodes),
      price: 12.80,
      cost: 9.85,
      stock: 8,
      minStock: 4,
      maxStock: 16,
      unit: 'quarts',
      expirationDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days

      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['coffee-corner'],
      name: 'Acai Bowl Base',
      description: 'Frozen acai puree for bowls',
      category: 'bowls',
      sku: 'CO-ING-ACA-001',
      barcode: generateBarcode('CO', 319, existingBarcodes),
      price: 18.60,
      cost: 14.31,
      stock: 5,
      minStock: 2,
      maxStock: 10,
      unit: 'packages',
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days

      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['coffee-corner'],
      name: 'Fresh Fruit Bowl Mix',
      description: 'Mixed fresh fruits for bowls',
      category: 'bowls',
      sku: 'CO-ING-FRU-001',
      barcode: generateBarcode('CO', 320, existingBarcodes),
      price: 8.90,
      cost: 6.85,
      stock: 14,
      minStock: 7,
      maxStock: 28,
      unit: 'pounds',
      expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days

      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['coffee-corner'],
      name: 'Granola Mix',
      description: 'Homemade granola mix',
      category: 'bowls',
      sku: 'CO-ING-GRA-001',
      barcode: generateBarcode('CO', 321, existingBarcodes),
      price: 11.20,
      cost: 8.62,
      stock: 9,
      minStock: 4,
      maxStock: 18,
      unit: 'pounds',
      expirationDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days

      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
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
      const unit = units[Math.floor(Math.random() * units.length)];
      
      // Random pricing and stock
      const cost = Math.round((Math.random() * 50 + 1) * 100) / 100; // $1-$51
      const stock = Math.floor(Math.random() * 100) + 1; // 1-100
      const minStock = Math.floor(stock * 0.2);
      const maxStock = stock + Math.floor(Math.random() * 50);
      
      // Random expiration (some expiring soon, some not)
      const daysToExpiry = Math.random() > 0.3 ? 
        Math.floor(Math.random() * 365) + 30 : // 30-395 days
        Math.floor(Math.random() * 7) + 1; // 1-7 days (expiring soon)
      
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
      const nameIndex = (itemId - 1) % names.length;
      const name = names[nameIndex] || 'Generic Item';
      
      allDynamicItems.push({
        businessId,
        name,
        description: `High-quality ${name.toLowerCase()} for ${businessSlug}`,
        category,
        sku: `${prefix}-${category.toUpperCase().substring(0, 3)}-${(itemId + 1000).toString().padStart(3, '0')}`,
        barcode,
        price: Math.round((cost * (1 + Math.random() * 0.5 + 0.3)) * 100) / 100, // 30-80% markup
        cost,
        stock,
        minStock,
        maxStock,
        unit,
        imageUrl: `https://images.unsplash.com/photo-${Math.random().toString(36).substring(2, 15)}?w=400&h=300&fit=crop&crop=center`,
        isActive: true,
        isPerishable: Math.random() > 0.3,
        expirationDate,
        manufacturingDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        shelfLifeDays: Math.floor(Math.random() * 365) + 1,
        lastSoldDate: null,
        salesVelocity: 0,
        daysSinceLastSale: 0,
        isUnderperforming: Math.random() > 0.8,
        isExpiringSoon: daysToExpiry <= 7,
        isVegetarian: Math.random() > 0.6,
        isVegan: Math.random() > 0.8,
        isGlutenFree: Math.random() > 0.7,
        isSpicy: Math.random() > 0.8,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }

  // Add missing ingredients that recipe templates need
  const missingIngredients = [
    // Italian Delight missing ingredients
    {
      businessId: businesses['italian-delight'],
      name: 'Premium Saffron (Underperforming)',
      description: 'Premium Spanish saffron threads',
      category: 'spices',
      sku: 'IT-ING-SAF-001',
      barcode: generateBarcode('IT', 999, existingBarcodes),
      price: 89.99,
      cost: 65.00,
      stock: 2,
      minStock: 1,
      maxStock: 5,
      unit: 'grams',
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
      isPerishable: false,
      isUnderperforming: true,
      isExpiringSoon: false,
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      isSpicy: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['italian-delight'],
      name: 'Fresh Basil',
      description: 'Fresh organic basil leaves',
      category: 'herbs',
      sku: 'IT-ING-BAS-001',
      barcode: generateBarcode('IT', 998, existingBarcodes),
      price: 4.99,
      cost: 2.50,
      stock: 15,
      minStock: 5,
      maxStock: 30,
      unit: 'bunches',
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      isPerishable: true,
      isUnderperforming: false,
      isExpiringSoon: false,
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      isSpicy: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['italian-delight'],
      name: 'Cherry Tomatoes',
      description: 'Sweet cherry tomatoes',
      category: 'vegetables',
      sku: 'IT-ING-TOM-001',
      barcode: generateBarcode('IT', 997, existingBarcodes),
      price: 6.99,
      cost: 4.00,
      stock: 12,
      minStock: 3,
      maxStock: 25,
      unit: 'pints',
      expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      isActive: true,
      isPerishable: true,
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
      sku: 'CC-ING-ETH-001',
      barcode: generateBarcode('CC', 999, existingBarcodes),
      price: 24.99,
      cost: 18.00,
      stock: 8,
      minStock: 3,
      maxStock: 20,
      unit: 'pounds',
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
      sku: 'CC-ING-COL-001',
      barcode: generateBarcode('CC', 998, existingBarcodes),
      price: 22.99,
      cost: 16.50,
      stock: 10,
      minStock: 4,
      maxStock: 25,
      unit: 'pounds',
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
      sku: 'CC-ING-OAT-001',
      barcode: generateBarcode('CC', 997, existingBarcodes),
      price: 5.99,
      cost: 3.50,
      stock: 6,
      minStock: 2,
      maxStock: 15,
      unit: 'quarts',
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
  
  // Delete all items from all businesses
  const businessSlugs = ['italian-delight', 'sushi-master', 'coffee-corner', 'taco-fiesta', 'american-diner', 'golden-dragon', 'indian-spice-palace', 'peruvian-coastal-kitchen', 'argentinian-grill-house', 'colombian-cafe-bogota', 'costa-rican-tropical-grill'];

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
