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
    'default': '1604382354936-07c5d9983bd3'
  };

  const photoId = validPhotoIds[category as keyof typeof validPhotoIds] || validPhotoIds.default;
  return `https://images.unsplash.com/photo-${photoId}?w=400&h=300&fit=crop&crop=center`;
}

dotenv.config();

export async function up(queryInterface: QueryInterface): Promise<void> {
  console.log('🍣 Starting Sushi Master items seeder...');

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

  // Track existing barcodes to ensure uniqueness
  const existingBarcodes = new Set<string>();

  // Sushi Master Items Database
  const sushiItems = [
    // SUSHI MASTER - INGREDIENTS
    {
      businessId: sushiBusinessId,
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
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: sushiBusinessId,
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
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
      expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: sushiBusinessId,
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
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
      expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: sushiBusinessId,
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
      currencyId: crcId, // CRC (Costa Rican Colón) - default currency
      expirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Insert Sushi Master items
  const chunkSize = 50;
  for (let i = 0; i < sushiItems.length; i += chunkSize) {
    const chunk = sushiItems.slice(i, i + chunkSize);
    try {
      await queryInterface.bulkInsert('items', chunk);
      console.log(`✅ Inserted Sushi Master chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(sushiItems.length / chunkSize)}`);
    } catch (error) {
      console.log(`⚠️ Bulk insert failed for Sushi Master chunk ${Math.floor(i / chunkSize) + 1}, trying individual inserts... Error: ${(error as Error).message}`);
      // Fallback to individual inserts
      for (const item of chunk) {
        try {
          await queryInterface.bulkInsert('items', [item]);
        } catch (itemError) {
          console.log(`❌ Failed to insert Sushi Master item: ${item.name} - Error: ${(itemError as Error).message}`);
        }
      }
    }
  }

  // Generate additional Sushi Master items
  console.log('🔄 Generating additional Sushi Master items...');
  
  const additionalSushiItems: any[] = [];
  
  // Generate 500-1000 additional items for Sushi Master
  const additionalItemsCount = Math.floor(Math.random() * 500) + 500; // 500-1000 items
  
  for (let i = 0; i < additionalItemsCount; i++) {
    const itemId = i + 1;
    
    // Generate unique barcode
    const barcode = generateBarcode('SU', itemId + 1000, existingBarcodes);
    
    // Sushi-specific categories
    const sushiCategories = ['fish', 'seafood', 'ingredients', 'vegetables', 'grains', 'spices', 'sauces'];
    const category = sushiCategories[Math.floor(Math.random() * sushiCategories.length)] || 'ingredients';
    
    // Realistic units based on category
    const unitMap = {
      'fish': ['pounds', 'pieces', 'kilograms'],
      'seafood': ['pounds', 'pieces', 'kilograms'],
      'ingredients': ['pieces', 'pounds', 'kilograms', 'grams', 'ounces'],
      'vegetables': ['pounds', 'pieces', 'bunches', 'heads'],
      'grains': ['pounds', 'kilograms', 'bags'],
      'spices': ['grams', 'ounces', 'pounds'],
      'sauces': ['bottles', 'gallons', 'liters']
    };
    
    const units = unitMap[category as keyof typeof unitMap] || ['pieces'];
    const unit = units[itemId % units.length];
    
    // Realistic pricing and stock based on category
    const costMap = {
      'fish': 22.00,
      'seafood': 18.50,
      'ingredients': 5.50,
      'vegetables': 2.80,
      'grains': 3.90,
      'spices': 8.75,
      'sauces': 4.50
    };
    
    const stockMap = {
      'fish': 6,
      'seafood': 5,
      'ingredients': 25,
      'vegetables': 20,
      'grains': 30,
      'spices': 12,
      'sauces': 12
    };
    
    const cost = costMap[category as keyof typeof costMap] || 5.00;
    const stock = stockMap[category as keyof typeof stockMap] || 15;
    const minStock = Math.floor(stock * 0.3);
    const maxStock = stock * 2;
    
    // Realistic expiration based on category
    const daysToExpiry = category === 'vegetables' ? 5 : 
                         category === 'fish' ? 2 : 
                         category === 'seafood' ? 2 : 365;
    
    const expirationDate = new Date(Date.now() + daysToExpiry * 24 * 60 * 60 * 1000);
    
    // Generate realistic item name based on category
    const itemNames = {
      fish: ['Bluefin Tuna', 'Yellowtail', 'Hamachi', 'Mackerel', 'Sardines', 'Albacore', 'Skipjack', 'Bigeye Tuna', 'Swordfish', 'Mahi Mahi', 'Wahoo', 'Amberjack', 'Grouper', 'Red Snapper', 'Sea Bass', 'Flounder', 'Sole', 'Turbot', 'Monkfish', 'Rockfish'],
      seafood: ['Salmon Fillet', 'Tuna Steak', 'Shrimp', 'Lobster', 'Scallops', 'Mussels', 'Clams', 'Cod', 'Halibut', 'Mahi Mahi', 'Red Snapper', 'Sea Bass', 'Tilapia', 'Crab', 'Oysters', 'Squid', 'Octopus', 'Mackerel', 'Sardines', 'Anchovies'],
      ingredients: ['Premium Flour', 'Organic Eggs', 'Fresh Herbs', 'Quality Salt', 'Pure Vanilla', 'Baking Soda', 'Yeast', 'Sugar', 'Brown Sugar', 'Powdered Sugar', 'Cornstarch', 'Baking Powder', 'Cocoa Powder', 'Chocolate Chips', 'Nuts', 'Dried Fruits', 'Honey', 'Maple Syrup', 'Molasses', 'Corn Syrup'],
      vegetables: ['Fresh Tomatoes', 'Organic Carrots', 'Spinach', 'Onions', 'Garlic', 'Mushrooms', 'Bell Peppers', 'Cucumber', 'Lettuce', 'Kale', 'Arugula', 'Broccoli', 'Cauliflower', 'Zucchini', 'Eggplant', 'Asparagus', 'Green Beans', 'Peas', 'Corn', 'Potatoes'],
      grains: ['Pasta', 'Bread', 'Quinoa', 'Oats', 'Barley', 'Wheat', 'Rice', 'Cornmeal', 'Polenta', 'Farro', 'Bulgur', 'Couscous', 'Millet', 'Buckwheat', 'Rye', 'Spelt', 'Amaranth', 'Teff', 'Sorghum', 'Wild Rice'],
      spices: ['Black Pepper', 'Cinnamon', 'Paprika', 'Cumin', 'Oregano', 'Basil', 'Thyme', 'Rosemary', 'Sage', 'Bay Leaves', 'Nutmeg', 'Allspice', 'Cardamom', 'Cloves', 'Ginger', 'Turmeric', 'Cayenne', 'Chili Powder', 'Garlic Powder', 'Onion Powder'],
      sauces: ['Soy Sauce', 'Teriyaki Sauce', 'Ponzu Sauce', 'Miso Paste', 'Wasabi', 'Sriracha', 'Hot Sauce', 'BBQ Sauce', 'Ketchup', 'Mustard', 'Mayonnaise', 'Ranch Dressing', 'Blue Cheese Dressing', 'Italian Dressing', 'French Dressing', 'Thousand Island', 'Honey Mustard', 'Sweet Chili Sauce', 'Fish Sauce', 'Oyster Sauce']
    };
    
    const names = itemNames[category as keyof typeof itemNames] || ['Generic Item'];
    const nameIndex = itemId % names.length;
    const name = names[nameIndex] || 'Generic Item';
    
    additionalSushiItems.push({
      businessId: sushiBusinessId,
      name,
      description: `High-quality ${name.toLowerCase()} for sushi-master`,
      category,
      sku: `SU-${category.toUpperCase().substring(0, 3)}-${(itemId + 1000).toString().padStart(3, '0')}`,
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
      isPerishable: category === 'vegetables' || category === 'fish' || category === 'seafood',
      expirationDate,
      manufacturingDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      shelfLifeDays: category === 'vegetables' ? 7 : category === 'fish' ? 2 : category === 'seafood' ? 2 : 365,
      lastSoldDate: null,
      salesVelocity: 0,
      daysSinceLastSale: 0,
      isUnderperforming: stock < minStock,
      isExpiringSoon: daysToExpiry <= 7,
      isVegetarian: category === 'vegetables' || category === 'grains',
      isVegan: category === 'vegetables' || category === 'grains',
      isGlutenFree: category === 'vegetables' || category === 'fish' || category === 'seafood',
      isSpicy: category === 'spices' || name.toLowerCase().includes('spicy') || name.toLowerCase().includes('hot'),
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // Insert additional Sushi Master items in chunks
  for (let i = 0; i < additionalSushiItems.length; i += chunkSize) {
    const chunk = additionalSushiItems.slice(i, i + chunkSize);
    try {
      await queryInterface.bulkInsert('items', chunk);
      console.log(`✅ Inserted additional Sushi Master chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(additionalSushiItems.length / chunkSize)}`);
    } catch (error) {
      console.log(`⚠️ Bulk insert failed for additional Sushi Master chunk ${Math.floor(i / chunkSize) + 1}, trying individual inserts... Error: ${(error as Error).message}`);
      // Fallback to individual inserts
      for (const item of chunk) {
        try {
          await queryInterface.bulkInsert('items', [item]);
        } catch (itemError) {
          console.log(`❌ Failed to insert additional Sushi Master item: ${item.name}`);
        }
      }
    }
  }

  console.log(`🎉 Sushi Master items seeder completed! Total items: ${sushiItems.length + additionalSushiItems.length}`);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  console.log('🔄 Rolling back Sushi Master items seeder...');
  
  // Delete all items from Sushi Master business
  const [sushiBusiness] = await queryInterface.sequelize.query(
    'SELECT id FROM businesses WHERE slug = ?',
    { type: QueryTypes.SELECT, replacements: ['sushi-master'] }
  ) as any[];
  
  if (sushiBusiness && sushiBusiness.length > 0) {
    await queryInterface.bulkDelete('items', { businessId: sushiBusiness[0].id });
    console.log(`🗑️ Deleted items for sushi-master`);
  }
  
  console.log('✅ Sushi Master items seeder rolled back!');
} 