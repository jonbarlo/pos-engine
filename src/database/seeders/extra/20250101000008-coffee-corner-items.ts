import { QueryInterface, QueryTypes } from 'sequelize';
import { generateBarcode } from '../../../utils/skuGenerator';
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
    'milk': '1556909114-f6e7ad7d3136',
    'bowls': '1565958011703-44f9829ba187',
    'toast': '1628840042765-356cda07504e',
    'default': '1604382354936-07c5d9983bd3'
  };

  const photoId = validPhotoIds[category as keyof typeof validPhotoIds] || validPhotoIds.default;
  return `https://images.unsplash.com/photo-${photoId}?w=400&h=300&fit=crop&crop=center`;
}

dotenv.config();

export async function up(queryInterface: QueryInterface): Promise<void> {
  console.log('☕ Starting Coffee Corner items seeder...');

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

  // Track existing barcodes to ensure uniqueness
  const existingBarcodes = new Set<string>();

  // Coffee Corner Items Database
  const coffeeItems = [
    // COFFEE CORNER - INGREDIENTS
    {
      businessId: coffeeBusinessId,
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
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
      expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: coffeeBusinessId,
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
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
      expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: coffeeBusinessId,
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
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
      expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: coffeeBusinessId,
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
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
      expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: coffeeBusinessId,
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
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
      expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: coffeeBusinessId,
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
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
      expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: coffeeBusinessId,
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
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: coffeeBusinessId,
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
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: coffeeBusinessId,
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
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: coffeeBusinessId,
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
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: coffeeBusinessId,
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
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: coffeeBusinessId,
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
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: coffeeBusinessId,
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
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
      expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: coffeeBusinessId,
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
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
      expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: coffeeBusinessId,
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
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: coffeeBusinessId,
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
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: coffeeBusinessId,
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
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: coffeeBusinessId,
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
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
      expirationDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: coffeeBusinessId,
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
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: coffeeBusinessId,
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
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
      expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: coffeeBusinessId,
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
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
      expirationDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Insert Coffee Corner items
  const chunkSize = 50;
  for (let i = 0; i < coffeeItems.length; i += chunkSize) {
    const chunk = coffeeItems.slice(i, i + chunkSize);
    try {
      await queryInterface.bulkInsert('items', chunk);
      console.log(`✅ Inserted Coffee Corner chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(coffeeItems.length / chunkSize)}`);
    } catch (error) {
      console.log(`⚠️ Bulk insert failed for Coffee Corner chunk ${Math.floor(i / chunkSize) + 1}, trying individual inserts... Error: ${(error as Error).message}`);
      // Fallback to individual inserts
      for (const item of chunk) {
        try {
          await queryInterface.bulkInsert('items', [item]);
        } catch (itemError) {
          console.log(`❌ Failed to insert Coffee Corner item: ${item.name} - Error: ${(itemError as Error).message}`);
        }
      }
    }
  }

  // Generate additional Coffee Corner items
  console.log('🔄 Generating additional Coffee Corner items...');
  
  const additionalCoffeeItems: any[] = [];
  
  // Generate 500-1000 additional items for Coffee Corner
  const additionalItemsCount = Math.floor(Math.random() * 500) + 500; // 500-1000 items
  
  for (let i = 0; i < additionalItemsCount; i++) {
    const itemId = i + 1;
    
    // Generate unique barcode
    const barcode = generateBarcode('CO', itemId + 1000, existingBarcodes);
    
    // Coffee-specific categories
    const coffeeCategories = ['coffee', 'tea', 'dairy', 'pastry', 'bread', 'fruits', 'sweeteners', 'syrups'];
    const category = coffeeCategories[Math.floor(Math.random() * coffeeCategories.length)] || 'coffee';
    
    // Realistic units based on category
    const unitMap = {
      'coffee': ['pounds', 'kilograms', 'bags'],
      'tea': ['ounces', 'pounds', 'bags'],
      'dairy': ['gallons', 'pounds', 'pieces', 'quarts'],
      'pastry': ['pieces', 'pounds', 'dozens'],
      'bread': ['loaves', 'pieces', 'pounds'],
      'fruits': ['pounds', 'pieces', 'bunches'],
      'sweeteners': ['pounds', 'kilograms', 'bags'],
      'syrups': ['bottles', 'gallons', 'liters']
    };
    
    const units = unitMap[category as keyof typeof unitMap] || ['pieces'];
    const unit = units[itemId % units.length];
    
    // Realistic pricing and stock based on category
    const costMap = {
      'coffee': 12.80,
      'tea': 6.40,
      'dairy': 3.25,
      'pastry': 4.60,
      'bread': 2.90,
      'fruits': 4.20,
      'sweeteners': 3.20,
      'syrups': 7.85
    };
    
    const stockMap = {
      'coffee': 20,
      'tea': 15,
      'dairy': 15,
      'pastry': 12,
      'bread': 8,
      'fruits': 18,
      'sweeteners': 25,
      'syrups': 8
    };
    
    const cost = costMap[category as keyof typeof costMap] || 5.00;
    const stock = stockMap[category as keyof typeof stockMap] || 15;
    const minStock = Math.floor(stock * 0.3);
    const maxStock = stock * 2;
    
    // Realistic expiration based on category
    const daysToExpiry = category === 'fruits' ? 10 : 
                         category === 'dairy' ? 14 : 
                         category === 'bread' ? 3 : 
                         category === 'pastry' ? 2 : 365;
    
    const expirationDate = new Date(Date.now() + daysToExpiry * 24 * 60 * 60 * 1000);
    
    // Generate realistic item name based on category
    const itemNames = {
      coffee: ['Ethiopian Beans', 'Colombian Beans', 'Brazilian Beans', 'Guatemalan Beans', 'Kenyan Beans', 'Costa Rican Beans', 'Peruvian Beans', 'Mexican Beans', 'Nicaraguan Beans', 'Honduran Beans', 'El Salvador Beans', 'Panamanian Beans', 'Jamaican Beans', 'Hawaiian Beans', 'Sumatra Beans', 'Java Beans', 'Sulawesi Beans', 'Timor Beans', 'Papua New Guinea Beans', 'Yemeni Beans'],
      tea: ['Green Tea', 'Chamomile', 'Peppermint', 'Rooibos', 'Oolong', 'Black Tea', 'White Tea', 'Earl Grey', 'Jasmine Tea', 'Lavender Tea', 'Lemon Tea', 'Ginger Tea', 'Hibiscus Tea', 'Rose Tea', 'Bergamot Tea', 'Darjeeling Tea', 'Assam Tea', 'Ceylon Tea', 'Keemun Tea', 'Lapsang Souchong'],
      dairy: ['Fresh Milk', 'Cream', 'Butter', 'Yogurt', 'Ricotta', 'Parmesan', 'Mozzarella', 'Cheddar', 'Swiss', 'Provolone', 'Gouda', 'Brie', 'Blue Cheese', 'Feta', 'Cottage Cheese', 'Sour Cream', 'Heavy Cream', 'Half and Half', 'Buttermilk', 'Whipping Cream'],
      pastry: ['Croissant Dough', 'Muffin Mix', 'Scone Mix', 'Danish Dough', 'Puff Pastry', 'Pie Crust', 'Tart Shells', 'Phyllo Dough', 'Brioche Dough', 'Challah Dough', 'Focaccia Dough', 'Pizza Dough', 'Bread Dough', 'Cookie Dough', 'Brownie Mix', 'Cake Mix', 'Cupcake Mix', 'Donut Dough', 'Cinnamon Roll Dough', 'Sticky Bun Dough'],
      bread: ['Sourdough', 'Whole Wheat', 'Rye Bread', 'Baguette', 'Ciabatta', 'Focaccia', 'Challah', 'Brioche', 'Pumpernickel', 'Multigrain', 'French Bread', 'Italian Bread', 'Pita Bread', 'Naan Bread', 'Tortillas', 'English Muffins', 'Bagels', 'Croissants', 'Dinner Rolls', 'Hamburger Buns'],
      fruits: ['Apples', 'Bananas', 'Oranges', 'Strawberries', 'Blueberries', 'Lemons', 'Limes', 'Grapes', 'Pineapple', 'Mango', 'Peaches', 'Plums', 'Cherries', 'Raspberries', 'Blackberries', 'Kiwi', 'Pears', 'Nectarines', 'Apricots', 'Figs'],
      sweeteners: ['Sugar', 'Honey', 'Maple Syrup', 'Agave', 'Stevia', 'Splenda', 'Equal', 'Sweet N Low', 'Monk Fruit', 'Erythritol', 'Xylitol', 'Sorbitol', 'Maltitol', 'Lactitol', 'Isomalt', 'Tagatose', 'Trehalose', 'Allulose', 'Yacon Syrup', 'Date Syrup'],
      syrups: ['Vanilla Syrup', 'Caramel Syrup', 'Chocolate Syrup', 'Hazelnut Syrup', 'Almond Syrup', 'Coconut Syrup', 'Strawberry Syrup', 'Raspberry Syrup', 'Blueberry Syrup', 'Mango Syrup', 'Peach Syrup', 'Pineapple Syrup', 'Orange Syrup', 'Lemon Syrup', 'Lime Syrup', 'Mint Syrup', 'Lavender Syrup', 'Rose Syrup', 'Cinnamon Syrup', 'Ginger Syrup']
    };
    
    const names = itemNames[category as keyof typeof itemNames] || ['Generic Item'];
    const nameIndex = itemId % names.length;
    const name = names[nameIndex] || 'Generic Item';
    
    additionalCoffeeItems.push({
      businessId: coffeeBusinessId,
      name,
      description: `High-quality ${name.toLowerCase()} for coffee-corner`,
      category,
      sku: `CO-${category.toUpperCase().substring(0, 3)}-${(itemId + 1000).toString().padStart(3, '0')}`,
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
      isPerishable: category === 'fruits' || category === 'dairy' || category === 'bread' || category === 'pastry',
      expirationDate,
      manufacturingDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      shelfLifeDays: category === 'fruits' ? 14 : category === 'dairy' ? 21 : category === 'bread' ? 3 : category === 'pastry' ? 2 : 365,
      lastSoldDate: null,
      salesVelocity: 0,
      daysSinceLastSale: 0,
      isUnderperforming: stock < minStock,
      isExpiringSoon: daysToExpiry <= 7,
      isVegetarian: category === 'fruits' || category === 'dairy' || category === 'bread' || category === 'pastry',
      isVegan: category === 'fruits' || category === 'bread' || category === 'pastry',
      isGlutenFree: category === 'fruits' || category === 'dairy',
      isSpicy: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // Insert additional Coffee Corner items in chunks
  for (let i = 0; i < additionalCoffeeItems.length; i += chunkSize) {
    const chunk = additionalCoffeeItems.slice(i, i + chunkSize);
    try {
      await queryInterface.bulkInsert('items', chunk);
      console.log(`✅ Inserted additional Coffee Corner chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(additionalCoffeeItems.length / chunkSize)}`);
    } catch (error) {
      console.log(`⚠️ Bulk insert failed for additional Coffee Corner chunk ${Math.floor(i / chunkSize) + 1}, trying individual inserts... Error: ${(error as Error).message}`);
      // Fallback to individual inserts
      for (const item of chunk) {
        try {
          await queryInterface.bulkInsert('items', [item]);
        } catch (itemError) {
          console.log(`❌ Failed to insert additional Coffee Corner item: ${item.name}`);
        }
      }
    }
  }

  console.log(`🎉 Coffee Corner items seeder completed! Total items: ${coffeeItems.length + additionalCoffeeItems.length}`);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  console.log('🔄 Rolling back Coffee Corner items seeder...');
  
  // Delete all items from Coffee Corner business
  const [coffeeBusiness] = await queryInterface.sequelize.query(
    'SELECT id FROM businesses WHERE slug = ?',
    { type: QueryTypes.SELECT, replacements: ['coffee-corner'] }
  ) as any[];
  
  if (coffeeBusiness && coffeeBusiness.length > 0) {
    await queryInterface.bulkDelete('items', { businessId: coffeeBusiness[0].id });
    console.log(`🗑️ Deleted items for coffee-corner`);
  }
  
  console.log('✅ Coffee Corner items seeder rolled back!');
} 