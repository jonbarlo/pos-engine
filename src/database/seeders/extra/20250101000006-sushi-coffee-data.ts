import { QueryInterface, QueryTypes } from 'sequelize';
import { generateSku, generateBarcode } from '../../../utils/skuGenerator';
import { generateMenuItemSkuWithCategory } from '../../../utils/menuItemSkuGenerator';
import { generateInventoryImageUrl, generateMenuItemImageUrl, ItemData } from '../../../utils/dynamicImageGenerator';
import dotenv from 'dotenv';

dotenv.config();

export async function up(queryInterface: QueryInterface): Promise<void> {
  console.log('🍣☕ Starting Sushi & Coffee data seeder...');

  // Get business IDs
  const businesses: { [key: string]: number } = {};
  const businessSlugs = ['sushi-master', 'coffee-corner'];
  
  for (const slug of businessSlugs) {
    const [biz] = await queryInterface.sequelize.query(
      'SELECT id FROM businesses WHERE slug = ?',
      { type: QueryTypes.SELECT, replacements: [slug] }
    ) as any[];
    if (biz) {
      businesses[slug] = biz.id;
    }
  }

  console.log(`🏢 Found ${Object.keys(businesses).length} businesses:`, businesses);

  // 1. Create Sushi Master Inventory Items (Raw Ingredients)
  const sushiInventoryDataRaw = [
    { businessSlug: 'sushi-master', name: 'Premium Sushi Rice', description: 'Premium short-grain sushi rice', price: 4.99, cost: 2.20, stock: 15, sku: generateSku('SU', 101), barcode: generateBarcode('SU', 101), category: 'Grains', unit: 'pound', minStock: 10, maxStock: 100, allergens: [] },
    { businessSlug: 'sushi-master', name: 'Fresh Bluefin Tuna', description: 'Premium bluefin tuna for sashimi', price: 25.99, cost: 18.50, stock: 8, sku: generateSku('SU', 102), barcode: generateBarcode('SU', 102), category: 'Fish', unit: 'pound', minStock: 5, maxStock: 50, allergens: ['fish'] },
    { businessSlug: 'sushi-master', name: 'Fresh Salmon', description: 'Fresh salmon for nigiri and rolls', price: 18.99, cost: 12.80, stock: 12, sku: generateSku('SU', 103), barcode: generateBarcode('SU', 103), category: 'Fish', unit: 'pound', minStock: 8, maxStock: 80, allergens: ['fish'] },
    { businessSlug: 'sushi-master', name: 'Hokkaido Uni', description: 'Premium sea urchin roe', price: 45.99, cost: 32.50, stock: 3, sku: generateSku('SU', 104), barcode: generateBarcode('SU', 104), category: 'Seafood', unit: 'ounce', minStock: 2, maxStock: 20, allergens: ['fish'] },
    { businessSlug: 'sushi-master', name: 'Soft Shell Crab', description: 'Fresh soft shell crab for tempura', price: 12.99, cost: 8.50, stock: 6, sku: generateSku('SU', 105), barcode: generateBarcode('SU', 105), category: 'Seafood', unit: 'piece', minStock: 4, maxStock: 30, allergens: ['fish'] },
    { businessSlug: 'sushi-master', name: 'Nori Sheets', description: 'Premium nori sheets for rolls', price: 8.99, cost: 4.20, stock: 25, sku: generateSku('SU', 106), barcode: generateBarcode('SU', 106), category: 'Grains', unit: 'pack', minStock: 15, maxStock: 150, allergens: [] },
    { businessSlug: 'sushi-master', name: 'Wasabi Root', description: 'Fresh wasabi root', price: 15.99, cost: 9.80, stock: 4, sku: generateSku('SU', 107), barcode: generateBarcode('SU', 107), category: 'Spices', unit: 'ounce', minStock: 2, maxStock: 15, allergens: [] },
    { businessSlug: 'sushi-master', name: 'Pickled Ginger', description: 'Gari (pickled ginger)', price: 6.99, cost: 3.20, stock: 18, sku: generateSku('SU', 108), barcode: generateBarcode('SU', 108), category: 'Spices', unit: 'jar', minStock: 10, maxStock: 100, allergens: [] },
    { businessSlug: 'sushi-master', name: 'Soy Sauce Premium', description: 'Premium soy sauce', price: 12.99, cost: 6.50, stock: 20, sku: generateSku('SU', 109), barcode: generateBarcode('SU', 109), category: 'Sauces', unit: 'bottle', minStock: 12, maxStock: 120, allergens: ['soy'] },
    { businessSlug: 'sushi-master', name: 'Miso Paste', description: 'Traditional miso paste for soup', price: 9.99, cost: 4.80, stock: 15, sku: generateSku('SU', 110), barcode: generateBarcode('SU', 110), category: 'Soup', unit: 'pound', minStock: 8, maxStock: 80, allergens: ['soy'] },
    { businessSlug: 'sushi-master', name: 'Green Tea Leaves', description: 'Premium Japanese green tea', price: 14.99, cost: 7.50, stock: 12, sku: generateSku('SU', 111), barcode: generateBarcode('SU', 111), category: 'Tea', unit: 'ounce', minStock: 8, maxStock: 60, allergens: [] },
    { businessSlug: 'sushi-master', name: 'Premium Sake', description: 'Premium sake for service', price: 35.99, cost: 22.50, stock: 8, sku: generateSku('SU', 112), barcode: generateBarcode('SU', 112), category: 'Beverages', unit: 'bottle', minStock: 5, maxStock: 40, allergens: [] }
  ];

  // Generate dynamic images for sushi inventory items
  const sushiInventoryData = sushiInventoryDataRaw.map(item => ({
    ...item,
    imageUrl: generateInventoryImageUrl({
      name: item.name,
      category: item.category,
      businessSlug: item.businessSlug,
      description: item.description
    })
  }));

  await queryInterface.bulkInsert('items', sushiInventoryData.map(i => ({
    businessId: businesses[i.businessSlug],
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
    allergens: JSON.stringify(i.allergens || []),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  })));

  // 2. Create Coffee Corner Inventory Items (Raw Ingredients)
  const coffeeInventoryDataRaw = [
    { businessSlug: 'coffee-corner', name: 'Ethiopian Yirgacheffe Beans', description: 'Single origin Ethiopian coffee beans', price: 18.99, cost: 12.50, stock: 25, sku: generateSku('CO', 101), barcode: generateBarcode('CO', 101), category: 'Coffee', unit: 'pound', minStock: 15, maxStock: 200, allergens: [] },
    { businessSlug: 'coffee-corner', name: 'Colombian Supremo Beans', description: 'Premium Colombian coffee beans', price: 16.99, cost: 11.20, stock: 30, sku: generateSku('CO', 102), barcode: generateBarcode('CO', 102), category: 'Coffee', unit: 'pound', minStock: 20, maxStock: 250, allergens: [] },
    { businessSlug: 'coffee-corner', name: 'Matcha Powder', description: 'Premium Japanese matcha powder', price: 24.99, cost: 16.80, stock: 8, sku: generateSku('CO', 103), barcode: generateBarcode('CO', 103), category: 'Tea', unit: 'ounce', minStock: 5, maxStock: 50, allergens: [] },
    { businessSlug: 'coffee-corner', name: 'Chai Concentrate', description: 'Spiced chai tea concentrate', price: 12.99, cost: 7.50, stock: 15, sku: generateSku('CO', 104), barcode: generateBarcode('CO', 104), category: 'Tea', unit: 'bottle', minStock: 10, maxStock: 100, allergens: [] },
    { businessSlug: 'coffee-corner', name: 'Oat Milk', description: 'Barista oat milk (expiring soon)', price: 4.99, cost: 2.80, stock: 12, sku: generateSku('CO', 105), barcode: generateBarcode('CO', 105), category: 'Beverages', unit: 'quart', minStock: 8, maxStock: 80, allergens: [] },
    { businessSlug: 'coffee-corner', name: 'Almond Milk', description: 'Barista almond milk', price: 5.99, cost: 3.20, stock: 18, sku: generateSku('CO', 106), barcode: generateBarcode('CO', 106), category: 'Beverages', unit: 'quart', minStock: 12, maxStock: 120, allergens: ['nuts'] },
    { businessSlug: 'coffee-corner', name: 'Fresh Whole Milk', description: 'Fresh whole milk for lattes', price: 3.99, cost: 2.20, stock: 25, sku: generateSku('CO', 107), barcode: generateBarcode('CO', 107), category: 'Dairy', unit: 'gallon', minStock: 15, maxStock: 150, allergens: ['dairy'] },
    { businessSlug: 'coffee-corner', name: 'Vanilla Syrup', description: 'Vanilla syrup for drinks', price: 8.99, cost: 4.50, stock: 20, sku: generateSku('CO', 108), barcode: generateBarcode('CO', 108), category: 'Syrups', unit: 'bottle', minStock: 12, maxStock: 100, allergens: [] },
    { businessSlug: 'coffee-corner', name: 'Caramel Syrup', description: 'Caramel syrup for drinks', price: 8.99, cost: 4.50, stock: 18, sku: generateSku('CO', 109), barcode: generateBarcode('CO', 109), category: 'Syrups', unit: 'bottle', minStock: 10, maxStock: 90, allergens: [] },
    { businessSlug: 'coffee-corner', name: 'Blueberry Muffin Mix', description: 'Fresh blueberry muffin mix', price: 6.99, cost: 3.80, stock: 10, sku: generateSku('CO', 110), barcode: generateBarcode('CO', 110), category: 'Pastry', unit: 'batch', minStock: 5, maxStock: 50, allergens: ['gluten', 'dairy', 'eggs'] },
    { businessSlug: 'coffee-corner', name: 'Croissant Dough', description: 'Buttery croissant dough', price: 7.99, cost: 4.20, stock: 8, sku: generateSku('CO', 111), barcode: generateBarcode('CO', 111), category: 'Pastry', unit: 'batch', minStock: 4, maxStock: 40, allergens: ['gluten', 'dairy', 'eggs'] },
    { businessSlug: 'coffee-corner', name: 'Mixed Berries', description: 'Fresh mixed berries for smoothies', price: 9.99, cost: 5.50, stock: 15, sku: generateSku('CO', 112), barcode: generateBarcode('CO', 112), category: 'Fruits', unit: 'pound', minStock: 8, maxStock: 60, allergens: [] }
  ];

  // Generate dynamic images for coffee inventory items
  const coffeeInventoryData = coffeeInventoryDataRaw.map(item => ({
    ...item,
    imageUrl: generateInventoryImageUrl({
      name: item.name,
      category: item.category,
      businessSlug: item.businessSlug,
      description: item.description
    })
  }));

  await queryInterface.bulkInsert('items', coffeeInventoryData.map(i => ({
    businessId: businesses[i.businessSlug],
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
    allergens: JSON.stringify(i.allergens || []),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  })));

  // 3. Get menu categories for Sushi and Coffee
  const categories: { [key: string]: number } = {};
  for (const businessSlug of businessSlugs) {
    const businessCategories = await queryInterface.sequelize.query(
      'SELECT id, name FROM menu_categories WHERE businessId = ?',
      { type: QueryTypes.SELECT, replacements: [businesses[businessSlug]] }
    ) as any[];
    
    for (const cat of businessCategories) {
      categories[`${businessSlug}-${cat.name}`] = cat.id;
    }
  }

  console.log('📂 Found categories:', categories);

  // 4. Create Sushi Master Menu Items (Finished Dishes)
  const sushiMenuDataRaw = [
    { businessSlug: 'sushi-master', categoryKey: 'sushi-master-Rolls', name: 'California Roll', description: 'Crab, avocado, cucumber', price: 12.99, cost: 5.80, sku: generateSku('SU', 201), barcode: generateBarcode('SU', 201), itemSku: generateMenuItemSkuWithCategory('SU', 'Rolls', 1), allergens: ['fish', 'soy'] },
    { businessSlug: 'sushi-master', categoryKey: 'sushi-master-Rolls', name: 'Spicy Tuna Roll', description: 'Spicy tuna with cucumber', price: 14.99, cost: 6.50, sku: generateSku('SU', 202), barcode: generateBarcode('SU', 202), itemSku: generateMenuItemSkuWithCategory('SU', 'Rolls', 2), allergens: ['fish', 'soy'] },
    { businessSlug: 'sushi-master', categoryKey: 'sushi-master-Rolls', name: 'Dragon Roll', description: 'Eel, avocado, cucumber', price: 16.99, cost: 7.80, sku: generateSku('SU', 203), barcode: generateBarcode('SU', 203), itemSku: generateMenuItemSkuWithCategory('SU', 'Rolls', 3), allergens: ['fish', 'soy'] },
    { businessSlug: 'sushi-master', categoryKey: 'sushi-master-Rolls', name: 'Rainbow Roll', description: 'Assorted fish with avocado', price: 18.99, cost: 8.50, sku: generateSku('SU', 204), barcode: generateBarcode('SU', 204), itemSku: generateMenuItemSkuWithCategory('SU', 'Rolls', 4), allergens: ['fish', 'soy'] },
    { businessSlug: 'sushi-master', categoryKey: 'sushi-master-Nigiri', name: 'Salmon Nigiri', description: 'Fresh salmon over rice', price: 6.99, cost: 3.20, sku: generateSku('SU', 205), barcode: generateBarcode('SU', 205), itemSku: generateMenuItemSkuWithCategory('SU', 'Nigiri', 1), allergens: ['fish'] },
    { businessSlug: 'sushi-master', categoryKey: 'sushi-master-Nigiri', name: 'Tuna Nigiri', description: 'Fresh tuna over rice', price: 7.99, cost: 3.80, sku: generateSku('SU', 206), barcode: generateBarcode('SU', 206), itemSku: generateMenuItemSkuWithCategory('SU', 'Nigiri', 2), allergens: ['fish'] },
    { businessSlug: 'sushi-master', categoryKey: 'sushi-master-Nigiri', name: 'Uni Nigiri', description: 'Sea urchin over rice', price: 12.99, cost: 8.50, sku: generateSku('SU', 207), barcode: generateBarcode('SU', 207), itemSku: generateMenuItemSkuWithCategory('SU', 'Nigiri', 3), allergens: ['fish'] },
    { businessSlug: 'sushi-master', categoryKey: 'sushi-master-Soups', name: 'Miso Soup', description: 'Traditional Japanese soup', price: 4.99, cost: 1.80, sku: generateSku('SU', 208), barcode: generateBarcode('SU', 208), itemSku: generateMenuItemSkuWithCategory('SU', 'Soups', 1), allergens: ['soy'] },
    { businessSlug: 'sushi-master', categoryKey: 'sushi-master-Soups', name: 'Tonkotsu Ramen', description: 'Rich pork bone broth ramen', price: 15.99, cost: 7.20, sku: generateSku('SU', 209), barcode: generateBarcode('SU', 209), itemSku: generateMenuItemSkuWithCategory('SU', 'Soups', 2), allergens: ['soy', 'pork'] },
    { businessSlug: 'sushi-master', categoryKey: 'sushi-master-Beverages', name: 'Green Tea', description: 'Premium Japanese green tea', price: 2.99, cost: 0.80, sku: generateSku('SU', 210), barcode: generateBarcode('SU', 210), itemSku: generateMenuItemSkuWithCategory('SU', 'Beverages', 1), allergens: [] },
    { businessSlug: 'sushi-master', categoryKey: 'sushi-master-Beverages', name: 'Premium Sake', description: 'Premium sake', price: 12.99, cost: 5.20, sku: generateSku('SU', 211), barcode: generateBarcode('SU', 211), itemSku: generateMenuItemSkuWithCategory('SU', 'Beverages', 2), allergens: [] },
    { businessSlug: 'sushi-master', categoryKey: 'sushi-master-Beverages', name: 'Japanese Beer', description: 'Asahi or Sapporo', price: 6.99, cost: 2.80, sku: generateSku('SU', 212), barcode: generateBarcode('SU', 212), itemSku: generateMenuItemSkuWithCategory('SU', 'Beverages', 3), allergens: ['gluten'] }
  ];

  // Generate dynamic images for sushi menu items
  const sushiMenuData = sushiMenuDataRaw.map(item => ({
    ...item,
    imageUrl: generateMenuItemImageUrl({
      name: item.name,
      category: item.categoryKey.split('-')[1] || 'Food',
      businessSlug: item.businessSlug,
      description: item.description
    })
  }));

  await queryInterface.bulkInsert('menu_items', sushiMenuData.map(mi => ({
    businessId: businesses[mi.businessSlug],
    categoryId: categories[mi.categoryKey],
    itemId: null, // No direct item mapping for menu items
    name: mi.name,
    description: mi.description,
    price: mi.price,
    cost: mi.cost,
    sku: mi.sku,
    barcode: mi.barcode,
    imageUrl: mi.imageUrl,
    allergens: JSON.stringify(mi.allergens || []),
    preparationTime: 15,
    isAvailable: true,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    createdAt: new Date(),
    updatedAt: new Date()
  })));

  // 5. Create Coffee Corner Menu Items (Finished Dishes)
  const coffeeMenuDataRaw = [
    { businessSlug: 'coffee-corner', categoryKey: 'coffee-corner-Coffee', name: 'Espresso', description: 'Single shot of espresso', price: 3.50, cost: 1.20, sku: generateSku('CO', 201), barcode: generateBarcode('CO', 201), itemSku: generateMenuItemSkuWithCategory('CO', 'Coffee', 1), allergens: [] },
    { businessSlug: 'coffee-corner', categoryKey: 'coffee-corner-Coffee', name: 'Cappuccino', description: 'Espresso with steamed milk and foam', price: 4.99, cost: 1.80, sku: generateSku('CO', 202), barcode: generateBarcode('CO', 202), itemSku: generateMenuItemSkuWithCategory('CO', 'Coffee', 2), allergens: ['dairy'] },
    { businessSlug: 'coffee-corner', categoryKey: 'coffee-corner-Coffee', name: 'Latte', description: 'Espresso with steamed milk', price: 4.49, cost: 1.60, sku: generateSku('CO', 203), barcode: generateBarcode('CO', 203), itemSku: generateMenuItemSkuWithCategory('CO', 'Coffee', 3), allergens: ['dairy'] },
    { businessSlug: 'coffee-corner', categoryKey: 'coffee-corner-Coffee', name: 'Americano', description: 'Espresso with hot water', price: 3.99, cost: 1.40, sku: generateSku('CO', 204), barcode: generateBarcode('CO', 204), itemSku: generateMenuItemSkuWithCategory('CO', 'Coffee', 4), allergens: [] },
    { businessSlug: 'coffee-corner', categoryKey: 'coffee-corner-Coffee', name: 'Mocha', description: 'Espresso with chocolate and steamed milk', price: 5.49, cost: 2.20, sku: generateSku('CO', 205), barcode: generateBarcode('CO', 205), itemSku: generateMenuItemSkuWithCategory('CO', 'Coffee', 5), allergens: ['dairy'] },
    { businessSlug: 'coffee-corner', categoryKey: 'coffee-corner-Tea', name: 'Earl Grey Tea', description: 'Classic Earl Grey tea', price: 3.99, cost: 1.20, sku: generateSku('CO', 206), barcode: generateBarcode('CO', 206), itemSku: generateMenuItemSkuWithCategory('CO', 'Tea', 1), allergens: [] },
    { businessSlug: 'coffee-corner', categoryKey: 'coffee-corner-Tea', name: 'Chai Latte', description: 'Spiced chai with steamed milk', price: 4.99, cost: 1.80, sku: generateSku('CO', 207), barcode: generateBarcode('CO', 207), itemSku: generateMenuItemSkuWithCategory('CO', 'Tea', 2), allergens: ['dairy'] },
    { businessSlug: 'coffee-corner', categoryKey: 'coffee-corner-Tea', name: 'Matcha Latte', description: 'Green tea with steamed milk', price: 5.49, cost: 2.20, sku: generateSku('CO', 208), barcode: generateBarcode('CO', 208), itemSku: generateMenuItemSkuWithCategory('CO', 'Tea', 3), allergens: ['dairy'] },
    { businessSlug: 'coffee-corner', categoryKey: 'coffee-corner-Pastries', name: 'Blueberry Muffin', description: 'Fresh baked blueberry muffin', price: 3.99, cost: 1.50, sku: generateSku('CO', 209), barcode: generateBarcode('CO', 209), itemSku: generateMenuItemSkuWithCategory('CO', 'Pastries', 1), allergens: ['gluten', 'dairy', 'eggs'] },
    { businessSlug: 'coffee-corner', categoryKey: 'coffee-corner-Pastries', name: 'Chocolate Croissant', description: 'Buttery croissant with chocolate', price: 4.49, cost: 1.80, sku: generateSku('CO', 210), barcode: generateBarcode('CO', 210), itemSku: generateMenuItemSkuWithCategory('CO', 'Pastries', 2), allergens: ['gluten', 'dairy', 'eggs'] },
    { businessSlug: 'coffee-corner', categoryKey: 'coffee-corner-Pastries', name: 'Cinnamon Roll', description: 'Fresh cinnamon roll with icing', price: 4.99, cost: 2.00, sku: generateSku('CO', 211), barcode: generateBarcode('CO', 211), itemSku: generateMenuItemSkuWithCategory('CO', 'Pastries', 3), allergens: ['gluten', 'dairy', 'eggs'] },
    { businessSlug: 'coffee-corner', categoryKey: 'coffee-corner-Smoothies', name: 'Berry Blast Smoothie', description: 'Mixed berry smoothie', price: 5.99, cost: 2.20, sku: generateSku('CO', 212), barcode: generateBarcode('CO', 212), itemSku: generateMenuItemSkuWithCategory('CO', 'Smoothies', 1), allergens: ['dairy'] },
    { businessSlug: 'coffee-corner', categoryKey: 'coffee-corner-Smoothies', name: 'Green Power Smoothie', description: 'Spinach, banana, and almond milk', price: 6.49, cost: 2.50, sku: generateSku('CO', 213), barcode: generateBarcode('CO', 213), itemSku: generateMenuItemSkuWithCategory('CO', 'Smoothies', 2), allergens: ['nuts'] }
  ];

  // Generate dynamic images for coffee menu items
  const coffeeMenuData = coffeeMenuDataRaw.map(item => ({
    ...item,
    imageUrl: generateMenuItemImageUrl({
      name: item.name,
      category: item.categoryKey.split('-')[1] || 'Food',
      businessSlug: item.businessSlug,
      description: item.description
    })
  }));

  await queryInterface.bulkInsert('menu_items', coffeeMenuData.map(mi => ({
    businessId: businesses[mi.businessSlug],
    categoryId: categories[mi.categoryKey],
    itemId: null, // No direct item mapping for menu items
    name: mi.name,
    description: mi.description,
    price: mi.price,
    cost: mi.cost,
    sku: mi.sku,
    barcode: mi.barcode,
    imageUrl: mi.imageUrl,
    allergens: JSON.stringify(mi.allergens || []),
    preparationTime: 15,
    isAvailable: true,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    createdAt: new Date(),
    updatedAt: new Date()
  })));

  console.log('✅ Sushi & Coffee data seeder completed successfully!');
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  console.log('🔄 Rolling back Sushi & Coffee data...');
  
  // Delete menu items first (due to foreign key constraints)
  await queryInterface.bulkDelete('menu_items', {
    sku: {
      [QueryInterface.Op.like]: 'SU-%'
    }
  });
  
  await queryInterface.bulkDelete('menu_items', {
    sku: {
      [QueryInterface.Op.like]: 'CO-%'
    }
  });

  // Delete inventory items
  await queryInterface.bulkDelete('items', {
    sku: {
      [QueryInterface.Op.like]: 'SU-%'
    }
  });
  
  await queryInterface.bulkDelete('items', {
    sku: {
      [QueryInterface.Op.like]: 'CO-%'
    }
  });

  console.log('✅ Sushi & Coffee data rollback completed!');
} 