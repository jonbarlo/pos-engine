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
  const crcCurrency = await queryInterface.sequelize.query(
    'SELECT id FROM currencies WHERE code = ?',
    {
      replacements: ['CRC'],
      type: QueryTypes.SELECT
    }
  ) as any[];

  const crcId = crcCurrency[0]?.id;
  console.log('🔍 CRC Currency lookup result:', crcCurrency);
  console.log('🔍 CRC ID found:', crcId);
  if (!crcId) {
    console.log('⚠️ CRC currency not found');
    return;
  }

  // ===== PHASE 3: ADDITIONAL INVENTORY DATA =====
  // This seeder adds additional items to the existing ones from the main seeder

  // Additional Items Database - Items that complement the main seeder
  const additionalItems = [
    // ITALIAN DELIGHT - ADDITIONAL INGREDIENTS
    {
      businessId: businesses['italian-delight'],
      name: 'Truffle Oil (Underperforming)',
      description: 'Premium black truffle oil',
      category: 'oils',
             sku: generateSku('IT', 1000),
       barcode: generateBarcode('IT', 1000),
      price: 23.40,
      cost: 18.00,
      stock: 8,
      minStock: 3,
      maxStock: 20,
      unit: 'bottles',
      currencyId: crcId,
      imageUrl: getImageUrlForCategory('oils'),
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['italian-delight'],
      name: 'Premium Black Truffle Pasta',
      description: 'Handcrafted pasta with black truffle',
      category: 'pasta',
      sku: generateSku('IT', 1001),
      barcode: generateBarcode('IT', 1001),
      price: 15.99,
      cost: 8.50,
      stock: 12,
      minStock: 5,
      maxStock: 25,
      unit: 'kg',
      currencyId: crcId,
      imageUrl: getImageUrlForCategory('pasta'),
      expirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['italian-delight'],
      name: 'Premium Lobster Ravioli',
      description: 'Fresh lobster-filled ravioli',
      category: 'pasta',
      sku: generateSku('IT', 1002),
      barcode: generateBarcode('IT', 1002),
      price: 28.99,
      cost: 15.00,
      stock: 6,
      minStock: 2,
      maxStock: 15,
      unit: 'kg',
      currencyId: crcId,
      imageUrl: getImageUrlForCategory('pasta'),
      expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['italian-delight'],
      name: 'Wagyu Beef (Premium)',
      description: 'Premium Japanese Wagyu beef',
      category: 'meat',
      sku: generateSku('IT', 1003),
      barcode: generateBarcode('IT', 1003),
      price: 89.99,
      cost: 45.00,
      stock: 4,
      minStock: 1,
      maxStock: 10,
      unit: 'kg',
      currencyId: crcId,
      imageUrl: getImageUrlForCategory('meat'),
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: businesses['italian-delight'],
      name: 'Premium Saffron (Underperforming)',
      description: 'High-quality Spanish saffron threads',
      category: 'spices',
      sku: generateSku('IT', 1004),
      barcode: generateBarcode('IT', 1004),
      price: 45.99,
      cost: 25.00,
      stock: 3,
      minStock: 1,
      maxStock: 8,
      unit: 'grams',
      currencyId: crcId,
      imageUrl: getImageUrlForCategory('spices'),
      expirationDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Insert additional items
  await queryInterface.bulkInsert('items', additionalItems);
  console.log(`✅ Added ${additionalItems.length} additional items`);

  // Query the newly created items for verification
  const newItemSkus = additionalItems.map(item => item.sku);
  const createdItems = await queryInterface.sequelize.query(
    'SELECT id, name, sku FROM items WHERE sku IN (?)',
    { type: QueryTypes.SELECT, replacements: [newItemSkus] }
  ) as any[];
  
  console.log(`✅ Verified ${createdItems.length} items were created successfully`);
  console.log('📦 Created items:', createdItems.map(item => `${item.name} (${item.sku})`));

  console.log('🎉 Comprehensive items seeder completed successfully!');
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  console.log('🗑️ Rolling back comprehensive items seeder...');
  
  // Delete the additional items created by this seeder
  const additionalSkus = [
    generateSku('IT', 1000),
    generateSku('IT', 1001),
    generateSku('IT', 1002),
    generateSku('IT', 1003),
    generateSku('IT', 1004)
  ];
  
  await queryInterface.bulkDelete('items', {
    sku: additionalSkus
  });
  
  console.log('✅ Comprehensive items seeder rolled back successfully!');
} 
