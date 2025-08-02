import { QueryInterface, QueryTypes } from 'sequelize';
import { generateSku, generateBarcode } from '../../utils/skuGenerator';
import { generateMenuItemSku } from '../../utils/menuItemSkuGenerator';
import { generateSeederOrderNumber } from '../../utils/orderNumberGenerator';
import { generateSaleNumber } from '../../utils/saleNumberGenerator';
import { generateMenuItemImageUrl, generateBusinessImageUrl, generateCategoryImageUrl } from '../../utils/dynamicImageGenerator';
import dotenv from 'dotenv';

// Enums
enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  CLEANING = 'cleaning'
}

enum OrderItemStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  READY = 'ready',
  SERVED = 'served',
  CANCELLED = 'cancelled'
}

enum SaleStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

dotenv.config();

export async function up(queryInterface: QueryInterface): Promise<void> {
  console.log('🚀 Starting comprehensive data seeder with proper foreign key order...');

  // Global counter for unique SKUs/barcodes
let globalBarcodeCounter = 1;

  // ===== PHASE 1: FOUNDATION DATA =====
  
  // 1. Currencies
  console.log('💰 Creating currencies...');
  const currencyData = [
    { code: 'USD', name: 'US Dollar', symbol: '$', isActive: true },
    { code: 'CRC', name: 'Costa Rican Colón', symbol: '₡', isActive: true }
  ];
  
  // Check if currencies already exist
  const existingCurrencies = await queryInterface.sequelize.query(
    'SELECT code FROM currencies WHERE code IN (?, ?)',
    { type: QueryTypes.SELECT, replacements: ['USD', 'CRC'] }
  ) as any[];

  const existingCodes = existingCurrencies.map((c: any) => c.code);
  const newCurrencies = currencyData.filter(c => !existingCodes.includes(c.code));
  
  if (newCurrencies.length > 0) {
    await queryInterface.bulkInsert('currencies', newCurrencies.map(c => ({
      ...c,
        createdAt: new Date(),
        updatedAt: new Date()
    })));
    console.log(`✅ Created ${newCurrencies.length} new currencies`);
  } else {
    console.log('✅ Currencies already exist, skipping creation');
  }

  // Query currency IDs
  const currencies: { [key: string]: number } = {};
  for (const currency of currencyData) {
    const [curr] = await queryInterface.sequelize.query(
    'SELECT id FROM currencies WHERE code = ?',
      { type: QueryTypes.SELECT, replacements: [currency.code] }
  ) as any[];
    currencies[currency.code] = curr.id;
  }
  console.log('✅ Currencies created:', currencies);

  // 2. Exchange Rates
  console.log('💱 Creating exchange rates...');
  const exchangeRateData = [
    { fromCurrencyId: currencies['USD'], toCurrencyId: currencies['CRC'], rate: 520.50, isActive: true },
    { fromCurrencyId: currencies['CRC'], toCurrencyId: currencies['USD'], rate: 0.00192, isActive: true }
  ];
  
  // Check if exchange rates already exist
  const existingExchangeRates = await queryInterface.sequelize.query(
    'SELECT fromCurrencyId, toCurrencyId FROM exchange_rates WHERE (fromCurrencyId = ? AND toCurrencyId = ?) OR (fromCurrencyId = ? AND toCurrencyId = ?)',
    { type: QueryTypes.SELECT, replacements: [currencies['USD'], currencies['CRC'], currencies['CRC'], currencies['USD']] }
  ) as any[];

  const existingRatePairs = existingExchangeRates.map((er: any) => `${er.fromCurrencyId}-${er.toCurrencyId}`);
  const newExchangeRates = exchangeRateData.filter(er => 
    !existingRatePairs.includes(`${er.fromCurrencyId}-${er.toCurrencyId}`)
  );
  
  if (newExchangeRates.length > 0) {
    await queryInterface.bulkInsert('exchange_rates', newExchangeRates.map(er => ({
      ...er,
      effectiveDate: new Date(), // Required field
      createdAt: new Date(),
      updatedAt: new Date()
    })));
    console.log(`✅ Created ${newExchangeRates.length} new exchange rates`);
  } else {
    console.log('✅ Exchange rates already exist, skipping creation');
  }
  console.log('✅ Exchange rates created');

  // 3. Businesses
  console.log('🏢 Creating businesses...');
  const businessData = [
    {
      slug: 'italian-delight',
      name: 'Italian Delight',
      description: 'Authentic Italian cuisine in the heart of the city',
      address: '123 Main Street, Downtown',
      phone: '+506-2222-3333',
      email: 'info@italiandelight.com',
      website: 'https://italiandelight.com',
      currencyId: currencies['CRC'],
      taxRate: 8.50, // Required field
      timezone: 'America/Costa_Rica', // Required field
      type: 'restaurant', // Required field
      isActive: true
    }
  ];

  // Generate business images
  const businessDataWithImages = businessData.map(business => ({
    ...business,
    imageUrl: generateBusinessImageUrl({
      name: business.name,
      slug: business.slug,
      type: business.type,
      description: business.description
    })
  }));
  
  // Check if businesses already exist
  const existingBusinesses = await queryInterface.sequelize.query(
    'SELECT slug FROM businesses WHERE slug = ?',
    { type: QueryTypes.SELECT, replacements: ['italian-delight'] }
  ) as any[];
  
  const existingBusinessSlugs = existingBusinesses.map((b: any) => b.slug);
  const newBusinesses = businessData.filter(b => !existingBusinessSlugs.includes(b.slug));
  
  if (newBusinesses.length > 0) {
    const businessesToInsert = businessDataWithImages.filter(b => !existingBusinessSlugs.includes(b.slug));
    await queryInterface.bulkInsert('businesses', businessesToInsert.map(b => ({
      ...b,
      createdAt: new Date(),
      updatedAt: new Date()
    })));
    console.log(`✅ Created ${businessesToInsert.length} new businesses with images`);
  } else {
    console.log('✅ Businesses already exist, skipping creation');
  }

  // Query business IDs
  const businesses: { [key: string]: number } = {};
  for (const business of businessData) {
    console.log(`🔍 DEBUG - Querying business: ${business.slug}`);
    const [biz] = await queryInterface.sequelize.query(
      'SELECT id FROM businesses WHERE slug = ?',
      { type: QueryTypes.SELECT, replacements: [business.slug] }
    ) as any[];
    console.log(`🔍 DEBUG - Business query result:`, biz);
    businesses[business.slug] = biz.id;
  }
  console.log('✅ Businesses created:', businesses);

  // ===== PHASE 2: BUSINESS-DEPENDENT DATA =====

  // 4. Users
  console.log('👥 Creating users...');
  const userData = [
    {
      businessSlug: 'italian-delight',
      email: 'giuseppe@italiandelight.com',
      name: 'Giuseppe Rossi',
      role: 'wait_staff',
      assignment: 'none',
      isActive: true
    },
    {
      businessSlug: 'italian-delight',
      email: 'marco@italiandelight.com',
      name: 'Marco Bianchi',
      role: 'kitchen_staff',
      assignment: 'kitchen_manager',
      isActive: true
    },
    {
      businessSlug: 'italian-delight',
      email: 'antonio@italiandelight.com',
      name: 'Antonio Verdi',
      role: 'cashier',
      assignment: 'none',
      isActive: true
    },
    {
      businessSlug: 'italian-delight',
      email: 'carlo@italiandelight.com',
      name: 'Carlo Admin',
      role: 'admin',
      assignment: 'none',
      isActive: true
    }
  ];
  await queryInterface.bulkInsert('users', userData.map(u => ({
    businessId: businesses[u.businessSlug],
    email: u.email,
    name: u.name,
    password: '$2b$10$Lb4NxNI99C7aNkIu7tYlme2SHO3Jkktl0tDwaoFP1twBjgzSpQ1mW', // Password123
    role: u.role,
    assignment: u.assignment,
    isActive: u.isActive,
    createdAt: new Date(),
    updatedAt: new Date()
  })));

  // Query user IDs
  const users: { [key: string]: number } = {};
  for (const user of userData) {
    console.log(`🔍 DEBUG - Querying user: ${user.email}`);
    const [usr] = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email = ?',
      { type: QueryTypes.SELECT, replacements: [user.email] }
    ) as any[];
    console.log(`🔍 DEBUG - User query result:`, usr);
    users[user.email] = usr.id;
  }
  console.log('✅ Users created:', users);

  // 5. Customers
  console.log('👤 Creating customers...');
  const customerData = [
    {
      businessSlug: 'italian-delight',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+506-8888-9999',
      isActive: true
    },
    {
      businessSlug: 'italian-delight',
      name: 'Maria Garcia',
      email: 'maria.garcia@email.com',
      phone: '+506-7777-8888',
      isActive: true
    }
  ];
  await queryInterface.bulkInsert('customers', customerData.map(c => ({
    businessId: businesses[c.businessSlug],
    name: c.name,
    email: c.email,
    phone: c.phone,
    isActive: c.isActive,
    createdAt: new Date(),
    updatedAt: new Date()
  })));

  // Query customer IDs
  const customers: { [key: string]: number } = {};
  for (const customer of customerData) {
    console.log(`🔍 DEBUG - Querying customer: ${customer.email}`);
    const [cust] = await queryInterface.sequelize.query(
      'SELECT id FROM customers WHERE email = ?',
      { type: QueryTypes.SELECT, replacements: [customer.email] }
    ) as any[];
    console.log(`🔍 DEBUG - Customer query result:`, cust);
    customers[customer.email] = cust.id;
  }
  console.log('✅ Customers created:', customers);

  // 6. Menu Categories
  console.log('📋 Creating menu categories...');
  const menuCategoryData = [
    { businessSlug: 'italian-delight', name: 'Pizza', description: 'Authentic Italian pizzas' },
    { businessSlug: 'italian-delight', name: 'Pasta', description: 'Fresh pasta dishes' },
    { businessSlug: 'italian-delight', name: 'Desserts', description: 'Sweet Italian treats' },
    { businessSlug: 'italian-delight', name: 'Beverages', description: 'Drinks and beverages' }
  ];

  // Generate category images
  const menuCategoryDataWithImages = menuCategoryData.map(category => ({
    ...category,
    imageUrl: generateCategoryImageUrl({
      name: category.name,
      businessSlug: category.businessSlug,
      description: category.description
    })
  }));

  await queryInterface.bulkInsert('menu_categories', menuCategoryDataWithImages.map(mc => ({
    businessId: businesses[mc.businessSlug],
    name: mc.name,
    description: mc.description,
    imageUrl: mc.imageUrl,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  })));

  // Query menu category IDs
  const menuCategories: { [key: string]: number } = {};
  for (const category of menuCategoryData) {
    const [cat] = await queryInterface.sequelize.query(
      'SELECT id FROM menu_categories WHERE businessId = ? AND name = ?',
      { type: QueryTypes.SELECT, replacements: [businesses[category.businessSlug], category.name] }
    ) as any[];
    menuCategories[`${category.businessSlug}-${category.name}`] = cat.id;
  }
  console.log('✅ Menu categories created:', menuCategories);

  // ===== PHASE 3: INVENTORY DATA =====

  // 7. Items (Raw Ingredients)
  console.log('📦 Creating items (raw ingredients)...');
  const itemData = [
    // Italian Delight Ingredients
    { businessSlug: 'italian-delight', name: 'Fresh Mozzarella', description: 'Fresh mozzarella cheese', price: 6495.00, cost: 4250.00, sku: generateSku('IT', globalBarcodeCounter++), barcode: generateBarcode('IT', globalBarcodeCounter++), stock: 15, unit: 'kg', category: 'dairy' },
    { businessSlug: 'italian-delight', name: 'San Marzano Tomatoes', description: 'Premium Italian tomatoes', price: 4495.00, cost: 2600.00, sku: generateSku('IT', globalBarcodeCounter++), barcode: generateBarcode('IT', globalBarcodeCounter++), stock: 20, unit: 'kg', category: 'vegetables' },
    { businessSlug: 'italian-delight', name: 'Fresh Basil', description: 'Fresh basil leaves', price: 2495.00, cost: 1250.00, sku: generateSku('IT', globalBarcodeCounter++), barcode: generateBarcode('IT', globalBarcodeCounter++), stock: 8, unit: 'bunches', category: 'herbs' },
    { businessSlug: 'italian-delight', name: 'Extra Virgin Olive Oil', description: 'Premium olive oil', price: 7995.00, cost: 5000.00, sku: generateSku('IT', globalBarcodeCounter++), barcode: generateBarcode('IT', globalBarcodeCounter++), stock: 12, unit: 'bottles', category: 'oils' },
    { businessSlug: 'italian-delight', name: '00 Flour', description: 'Italian 00 flour for pizza', price: 3495.00, cost: 2000.00, sku: generateSku('IT', globalBarcodeCounter++), barcode: generateBarcode('IT', globalBarcodeCounter++), stock: 25, unit: 'kg', category: 'grains' }
  ];

  const itemsToInsert = itemData.map(i => ({
    businessId: businesses[i.businessSlug],
      name: i.name,
      description: i.description,
      price: i.price,
      cost: i.cost,
      sku: i.sku,
      barcode: i.barcode,
    stock: i.stock,
    minStock: 5,
    maxStock: 50,
      unit: i.unit,
    category: i.category,
    currencyId: currencies['CRC'],
    allergens: JSON.stringify([]),
      isActive: true,
    isPerishable: false,
    isUnderperforming: false,
    isExpiringSoon: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
      createdAt: new Date(),
      updatedAt: new Date()
  }));
  await queryInterface.bulkInsert('items', itemsToInsert);

  // Query items by sku for IDs
  const items: { [key: string]: number } = {};
  for (const item of itemData) {
    const [itm] = await queryInterface.sequelize.query(
      'SELECT id FROM items WHERE sku = ?',
      { type: QueryTypes.SELECT, replacements: [item.sku] }
    ) as any[];
    items[item.sku] = itm.id;
  }
  console.log('✅ Items created:', items);

  // 8. Menu Items (Finished Dishes)
  console.log('🍽️ Creating menu items (finished dishes)...');
  const menuItemData = [
    // Italian Delight Menu Items
    { businessSlug: 'italian-delight', categoryKey: 'italian-delight-Pizza', name: 'Margherita Pizza', description: 'Fresh mozzarella, tomato sauce, basil', price: 9495.00, cost: 4250.00, sku: generateMenuItemSku('IT', 'Pizza', globalBarcodeCounter++), barcode: generateBarcode(`IT-MAR`, globalBarcodeCounter++), allergens: ['gluten', 'dairy'] },
    { businessSlug: 'italian-delight', categoryKey: 'italian-delight-Pizza', name: 'Pepperoni Pizza', description: 'Classic pepperoni with mozzarella', price: 10495.00, cost: 4750.00, sku: generateMenuItemSku('IT', 'Pizza', globalBarcodeCounter++), barcode: generateBarcode(`IT-PEP`, globalBarcodeCounter++), allergens: ['gluten', 'dairy', 'pork'] },
    { businessSlug: 'italian-delight', categoryKey: 'italian-delight-Pasta', name: 'Spaghetti Carbonara', description: 'Pasta with eggs, cheese, pancetta, black pepper', price: 8495.00, cost: 3600.00, sku: generateMenuItemSku('IT', 'Pasta', globalBarcodeCounter++), barcode: generateBarcode(`IT-SPA`, globalBarcodeCounter++), allergens: ['gluten', 'dairy', 'eggs', 'pork'] },
    { businessSlug: 'italian-delight', categoryKey: 'italian-delight-Pasta', name: 'Fettuccine Alfredo', description: 'Creamy alfredo sauce with parmesan', price: 8995.00, cost: 3900.00, sku: generateMenuItemSku('IT', 'Pasta', globalBarcodeCounter++), barcode: generateBarcode(`IT-FET`, globalBarcodeCounter++), allergens: ['gluten', 'dairy'] },
    { businessSlug: 'italian-delight', categoryKey: 'italian-delight-Desserts', name: 'Tiramisu', description: 'Classic Italian dessert with coffee and mascarpone', price: 4495.00, cost: 1750.00, sku: generateMenuItemSku('IT', 'Desserts', globalBarcodeCounter++), barcode: generateBarcode(`IT-TIR`, globalBarcodeCounter++), allergens: ['gluten', 'dairy', 'eggs'] },
    { businessSlug: 'italian-delight', categoryKey: 'italian-delight-Desserts', name: 'Cannoli', description: 'Crispy shells filled with sweet ricotta', price: 3495.00, cost: 1250.00, sku: generateMenuItemSku('IT', 'Desserts', globalBarcodeCounter++), barcode: generateBarcode(`IT-CAN`, globalBarcodeCounter++), allergens: ['gluten', 'dairy'] },
    { businessSlug: 'italian-delight', categoryKey: 'italian-delight-Beverages', name: 'House Red Wine', description: 'Glass of our signature red wine', price: 4495.00, cost: 1600.00, sku: generateMenuItemSku('IT', 'Beverages', globalBarcodeCounter++), barcode: generateBarcode(`IT-HOU`, globalBarcodeCounter++), allergens: [] },
    { businessSlug: 'italian-delight', categoryKey: 'italian-delight-Beverages', name: 'Italian Soda', description: 'Refreshing Italian soda', price: 1995.00, cost: 600.00, sku: generateMenuItemSku('IT', 'Beverages', globalBarcodeCounter++), barcode: generateBarcode(`IT-ITA`, globalBarcodeCounter++), allergens: [] }
  ];

  // Generate dynamic images for menu items
  const menuItemDataWithImages = menuItemData.map(item => ({
    ...item,
    imageUrl: generateMenuItemImageUrl({
      name: item.name,
      category: item.categoryKey.split('-')[1] || 'Food',
      businessSlug: item.businessSlug,
      description: item.description
    })
  }));
  
  const menuItemsToInsert = menuItemDataWithImages.map(mi => {
    const categoryId = menuCategories[mi.categoryKey];
    
    if (!categoryId) {
      throw new Error(`Category not found for key: ${mi.categoryKey}. Available categories: ${JSON.stringify(menuCategories)}`);
    }
    
    return {
      businessId: businesses[mi.businessSlug],
      categoryId: categoryId,
      itemId: null, // Menu items don't reference raw items in this case
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
    };
  });
  
  await queryInterface.bulkInsert('menu_items', menuItemsToInsert);

  // Query menu items by sku for IDs
  const menuItems: { [key: string]: number } = {};
  for (const mi of menuItemData) {
    const [menuItem] = await queryInterface.sequelize.query(
      'SELECT id FROM menu_items WHERE sku = ?',
      { type: QueryTypes.SELECT, replacements: [mi.sku] }
    ) as any[];
    menuItems[mi.sku] = menuItem.id;
  }
  console.log('✅ Menu items created:', menuItems);

  // ===== PHASE 4: PHYSICAL LAYOUT =====

  // 9. Restaurant Tables
  console.log('🪑 Creating restaurant tables...');
  const tableData = [
    { businessSlug: 'italian-delight', tableNumber: 'A1', capacity: 4, status: TableStatus.AVAILABLE, section: 'Main Floor' },
    { businessSlug: 'italian-delight', tableNumber: 'A2', capacity: 6, status: TableStatus.AVAILABLE, section: 'Main Floor' },
    { businessSlug: 'italian-delight', tableNumber: 'B1', capacity: 2, status: TableStatus.AVAILABLE, section: 'Patio' }
  ];
  await queryInterface.bulkInsert('restaurant_tables', tableData.map(t => ({
    businessId: businesses[t.businessSlug],
    tableNumber: t.tableNumber,
    capacity: t.capacity,
    status: t.status,
    section: t.section,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  })));

  // Query tables by business and table number for IDs
  const tables: { [key: string]: number } = {};
  for (const t of tableData) {
    const [table] = await queryInterface.sequelize.query(
      'SELECT id FROM restaurant_tables WHERE businessId = ? AND tableNumber = ?',
      { type: QueryTypes.SELECT, replacements: [businesses[t.businessSlug], t.tableNumber] }
    ) as any[];
    tables[`${t.businessSlug}-${t.tableNumber}`] = table.id;
  }
  console.log('✅ Tables created:', tables);

  // 10. Floor Plans
  console.log('🏗️ Creating floor plans...');
  const floorPlanData = [
    {
      businessSlug: 'italian-delight',
      name: 'Main Dining Room',
      width: 1200,
      height: 800,
      backgroundImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=800&fit=crop',
      isActive: true
    }
  ];
  await queryInterface.bulkInsert('floor_plans', floorPlanData.map(fp => ({
    businessId: businesses[fp.businessSlug],
    name: fp.name,
    width: fp.width,
    height: fp.height,
    backgroundImage: fp.backgroundImage,
    isActive: fp.isActive,
    createdAt: new Date(),
    updatedAt: new Date()
  })));

  // Query floor plans by business and name for IDs
  const floorPlans: { [key: string]: number } = {};
  for (const fp of floorPlanData) {
    const [floorPlan] = await queryInterface.sequelize.query(
      'SELECT id FROM floor_plans WHERE businessId = ? AND name = ?',
      { type: QueryTypes.SELECT, replacements: [businesses[fp.businessSlug], fp.name] }
    ) as any[];
    floorPlans[`${fp.businessSlug}-${fp.name}`] = floorPlan.id;
  }
  console.log('✅ Floor plans created:', floorPlans);

  // 11. Table Positions
  console.log('📍 Creating table positions...');
  const tablePositionData = [
    {
      floorPlanKey: 'italian-delight-Main Dining Room',
      tableKey: 'italian-delight-A1',
      x: 200,
      y: 150,
      rotation: 0,
      width: 120,
      height: 80
    },
    {
      floorPlanKey: 'italian-delight-Main Dining Room',
      tableKey: 'italian-delight-A2',
      x: 400,
      y: 150,
      rotation: 0,
      width: 140,
      height: 100
    },
    {
      floorPlanKey: 'italian-delight-Main Dining Room',
      tableKey: 'italian-delight-B1',
      x: 600,
      y: 300,
      rotation: 45,
      width: 100,
      height: 60
    }
  ];

  await queryInterface.bulkInsert('table_positions', tablePositionData.map(tp => ({
    floorPlanId: floorPlans[tp.floorPlanKey],
    tableId: tables[tp.tableKey],
    x: tp.x,
    y: tp.y,
    rotation: tp.rotation,
    width: tp.width,
    height: tp.height,
    createdAt: new Date(),
    updatedAt: new Date()
  })));
  console.log('✅ Table positions created');

  // ===== PHASE 5: ORDERS AND SALES =====

  // 12. Orders
  console.log('📋 Creating orders...');
  
  // Debug: Check what IDs we have for foreign key references
  console.log('🔍 DEBUG - Foreign Key IDs:');
  console.log('  businesses:', businesses);
  console.log('  tables:', tables);
  console.log('  users:', users);
  console.log('  customers:', customers);
  console.log('  currencies:', currencies);
  
  const orderData = [
    {
      businessSlug: 'italian-delight',
      tableKey: 'italian-delight-A2',
      serverEmail: 'giuseppe@italiandelight.com',
      customerEmail: 'john.smith@email.com',
      orderNumber: generateSeederOrderNumber('IT', 1),
      status: 'pending',
      partySize: 4,
      totalAmount: 17990.00,
      currencyId: currencies['CRC']
    },
    {
      businessSlug: 'italian-delight',
      tableKey: 'italian-delight-A1',
      serverEmail: 'giuseppe@italiandelight.com',
      customerEmail: 'maria.garcia@email.com',
      orderNumber: generateSeederOrderNumber('IT', 2),
      status: 'pending',
      partySize: 2,
      totalAmount: 10495.00,
      currencyId: currencies['CRC']
    }
  ];

  // Debug: Show what we're trying to insert
  console.log('🔍 DEBUG - Order data to insert:');
  orderData.forEach((order, index) => {
    console.log(`  Order ${index + 1}:`);
    console.log(`    businessId: ${businesses[order.businessSlug]}`);
    console.log(`    tableId: ${tables[order.tableKey]}`);
    console.log(`    serverId: ${users[order.serverEmail]}`);
    console.log(`    customerId: ${customers[order.customerEmail]}`);
    console.log(`    orderNumber: ${order.orderNumber}`);
    console.log(`    currencyId: ${order.currencyId}`);
  });

  await queryInterface.bulkInsert('orders', orderData.map(o => ({
      businessId: businesses[o.businessSlug],
    tableId: tables[o.tableKey],
    serverId: users[o.serverEmail],
    customerId: customers[o.customerEmail],
      orderNumber: o.orderNumber,
      status: o.status,
    orderType: 'dine_in',
    subtotal: o.totalAmount,
      totalAmount: o.totalAmount,
    taxAmount: 0.00,
    discountAmount: 0.00,
    tipAmount: 0.00,
    currencyId: o.currencyId,
      createdAt: new Date(),
      updatedAt: new Date()
  })));

  // Query orders by order number for IDs
  const orders: { [key: string]: number } = {};
  for (const order of orderData) {
    const [ord] = await queryInterface.sequelize.query(
      'SELECT id FROM orders WHERE orderNumber = ?',
      { type: QueryTypes.SELECT, replacements: [order.orderNumber] }
    ) as any[];
    orders[order.orderNumber] = ord.id;
  }
  console.log('✅ Orders created:', orders);

  // 13. Kitchen Orders (MUST BE IMMEDIATELY AFTER ORDERS)
  console.log('👨‍🍳 Creating kitchen orders...');
  const kitchenOrderData = [
    {
      businessSlug: 'italian-delight',
      orderNumber: orderData[0]!.orderNumber,
      chefEmail: 'marco@italiandelight.com',
      status: 'preparing',
      priority: 'normal',
      estimatedPrepTime: 25,
      specialInstructions: 'Extra cheese on pizza',
      notes: 'Table A2 - Window seat'
    }
  ];
  await queryInterface.bulkInsert('kitchen_orders', kitchenOrderData.map(ko => ({
    businessId: businesses[ko.businessSlug],
    orderId: orders[ko.orderNumber],
    orderNumber: ko.orderNumber,
    orderType: 'dine_in',
    assignedTo: users[ko.chefEmail] || null,
    assignedToName: ko.chefEmail ? ko.chefEmail.split('@')[0] : 'Unknown',
    chefId: users[ko.chefEmail] || null,
    status: ko.status,
    priority: ko.priority,
    estimatedPrepTime: ko.estimatedPrepTime,
    actualPrepTime: null,
    specialInstructions: ko.specialInstructions || null,
    notes: ko.notes || null,
    items: JSON.stringify([
      {
        id: 1,
        itemName: 'Test Item',
        quantity: 1,
        status: 'pending',
        preparationTime: 10,
        specialInstructions: ko.specialInstructions || null
      }
    ]),
    totalItems: 1,
    completedItems: 0,
    startTime: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  })));
  console.log('✅ Kitchen orders created');

  // 14. Order Items
  console.log('🍽️ Creating order items...');
  const orderItemData = [
    // Use the actual SKUs from menu items created above
    { orderNumber: orderData[0]!.orderNumber, itemSku: menuItemData[0]!.sku, itemName: 'Margherita Pizza', quantity: 1, unitPrice: 9495.00, totalPrice: 9495.00, specialInstructions: 'Extra cheese', status: OrderItemStatus.IN_PROGRESS },
    { orderNumber: orderData[0]!.orderNumber, itemSku: menuItemData[2]!.sku, itemName: 'Spaghetti Carbonara', quantity: 1, unitPrice: 8495.00, totalPrice: 8495.00, specialInstructions: null, status: OrderItemStatus.IN_PROGRESS },
    { orderNumber: orderData[1]!.orderNumber, itemSku: menuItemData[1]!.sku, itemName: 'Pepperoni Pizza', quantity: 1, unitPrice: 10495.00, totalPrice: 10495.00, specialInstructions: 'Well done', status: OrderItemStatus.PENDING }
  ];

  await queryInterface.bulkInsert('order_items', orderItemData.map(oi => {
    const itemId = menuItems[oi.itemSku];
    if (!itemId) {
      throw new Error(`Menu item not found for SKU: ${oi.itemSku}. Available menu items: ${JSON.stringify(menuItems)}`);
    }
    return {
      orderId: orders[oi.orderNumber],
      itemId: itemId,
      currencyId: currencies['CRC'],
      itemName: oi.itemName,
      quantity: oi.quantity,
      unitPrice: oi.unitPrice,
      totalPrice: oi.totalPrice,
      specialInstructions: oi.specialInstructions,
      status: oi.status,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }));
  console.log('✅ Order items created');

  // ===== PHASE 6: SALES AND TRANSACTIONS =====

  // 15. Sales
  console.log('💰 Creating sales...');
  const saleData = [
    {
      businessSlug: 'italian-delight',
      cashierEmail: 'antonio@italiandelight.com',
      customerEmail: 'john.smith@email.com',
      saleNumber: await generateSaleNumber(businesses['italian-delight']!, 'IT'),
      status: SaleStatus.COMPLETED,
      subtotal: 17990.00,
      taxAmount: 1595.00,
      discountAmount: 0.00,
      totalAmount: 19585.00,
      paymentMethod: 'credit_card',
      currencyId: currencies['CRC']
    }
  ];

  await queryInterface.bulkInsert('sales', saleData.map(s => ({
    businessId: businesses[s.businessSlug],
    userId: users[s.cashierEmail], // Changed from cashierId to userId
    customerId: customers[s.customerEmail],
    saleNumber: s.saleNumber,
    status: s.status,
    subtotal: s.subtotal,
    taxAmount: s.taxAmount,
    discountAmount: s.discountAmount,
    totalAmount: s.totalAmount,
    paymentMethod: s.paymentMethod,
    currencyId: s.currencyId,
    idempotencyKey: `sale-${s.saleNumber}-${Date.now()}`, // Required field
    createdAt: new Date(),
    updatedAt: new Date()
  })));

  // Query sales by sale number for IDs
  const sales: { [key: string]: number } = {};
  for (const sale of saleData) {
    const [saleRecord] = await queryInterface.sequelize.query(
      'SELECT id FROM sales WHERE saleNumber = ?',
      { type: QueryTypes.SELECT, replacements: [sale.saleNumber] }
    ) as any[];
    sales[sale.saleNumber] = saleRecord.id;
  }
  console.log('✅ Sales created:', sales);

  // 17. Sale Items
  console.log('🛒 Creating sale items...');
  
  // Debug: Check what we have for sale items
  console.log('🔍 DEBUG - Sale Items Data:');
  console.log('  items object:', items);
  console.log('  sales object:', sales);
  console.log('  currencies object:', currencies);
  console.log('  businesses object:', businesses);
  
  const saleItemData = [
    {
      saleNumber: saleData[0]!.saleNumber,
      itemSku: 'IT-001', // Use item SKU from items table
      itemName: 'Fresh Mozzarella',
      quantity: 1,
      unitPrice: 6495.00,
      totalPrice: 6495.00
    },
    {
      saleNumber: saleData[0]!.saleNumber,
      itemSku: 'IT-003', // Use item SKU from items table
      itemName: 'San Marzano Tomatoes',
      quantity: 1,
      unitPrice: 4495.00,
      totalPrice: 4495.00
    }
  ];

  console.log('🔍 DEBUG - Sale Item Data to process:');
  saleItemData.forEach((si, index) => {
    console.log(`  Sale Item ${index + 1}:`);
    console.log(`    saleNumber: ${si.saleNumber}`);
    console.log(`    itemSku: ${si.itemSku}`);
    console.log(`    itemName: ${si.itemName}`);
    console.log(`    quantity: ${si.quantity}`);
    console.log(`    unitPrice: ${si.unitPrice}`);
    console.log(`    totalPrice: ${si.totalPrice}`);
  });

  await queryInterface.bulkInsert('sale_items', saleItemData.map(si => {
    // Use item IDs from the items table, not menu items
    const itemId = items[si.itemSku];
    const saleId = sales[si.saleNumber];
    
    console.log(`🔍 DEBUG - Processing sale item: ${si.itemSku}`);
    console.log(`  itemId lookup result: ${itemId}`);
    console.log(`  saleId lookup result: ${saleId}`);
    
    if (!itemId) {
      throw new Error(`Item not found for SKU: ${si.itemSku}`);
    }
    if (!saleId) {
      throw new Error(`Sale not found for sale number: ${si.saleNumber}`);
    }
    
    const insertData = {
      businessId: businesses['italian-delight'],
      saleId: saleId,
      itemId: itemId,
      currencyId: currencies['CRC'],
        quantity: si.quantity,
        unitPrice: si.unitPrice,
        totalPrice: si.totalPrice,
        discountAmount: 0.00,
        finalPrice: si.totalPrice,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    
    console.log(`🔍 DEBUG - Insert data for ${si.itemSku}:`, insertData);

    return insertData;
  }));
  console.log('✅ Sale items created');

  // ===== PHASE 7: ADDITIONAL BUSINESS DATA =====

  // 19. Reservations
  console.log('📅 Creating reservations...');
  const reservationData = [
    {
      businessSlug: 'italian-delight',
      tableKey: 'italian-delight-A1',
      customerEmail: 'maria.garcia@email.com',
      customerName: 'Maria Garcia',
      customerPhone: '+506-8888-9999',
      partySize: 4,
      reservationDate: '2025-02-15',
      reservationTime: '19:00',
      duration: 120,
      status: 'confirmed',
      source: 'online',
      specialRequests: 'Window seat preferred',
      notes: 'Anniversary celebration'
    },
    {
      businessSlug: 'italian-delight',
      tableKey: 'italian-delight-B1',
      customerEmail: 'carlos.rodriguez@email.com',
      customerName: 'Carlos Rodriguez',
      customerPhone: '+506-7777-8888',
      partySize: 2,
      reservationDate: '2025-02-16',
      reservationTime: '20:30',
      duration: 90,
      status: 'pending',
      source: 'phone',
      specialRequests: 'Quiet table',
      notes: 'First time visit'
    }
  ];

  await queryInterface.bulkInsert('reservations', reservationData.map(res => ({
    businessId: businesses[res.businessSlug],
    tableId: tables[res.tableKey],
    customerId: customers[res.customerEmail],
    customerName: res.customerName,
    customerEmail: res.customerEmail,
    customerPhone: res.customerPhone,
    partySize: res.partySize,
    reservationDate: res.reservationDate,
    reservationTime: res.reservationTime,
    duration: res.duration,
    status: res.status,
    source: res.source,
    specialRequests: res.specialRequests,
    notes: res.notes,
    confirmedAt: res.status === 'confirmed' ? new Date() : null,
    createdAt: new Date(),
    updatedAt: new Date()
  })));
  console.log('✅ Reservations created');

  // 20. Staff Messages
  console.log('💬 Creating staff messages...');
  const staffMessageData = [
    {
      businessSlug: 'italian-delight',
      senderEmail: 'giuseppe@italiandelight.com',
      senderName: 'Giuseppe Rossi',
      messageType: 'general',
      title: 'Table A2 needs more bread',
      content: 'Table A2 needs more bread',
      recipientType: 'all',
      priority: 'normal',
      isRead: false
    }
  ];

  await queryInterface.bulkInsert('staff_messages', staffMessageData.map(sm => ({
    businessId: businesses[sm.businessSlug],
    senderId: users[sm.senderEmail],
    senderName: sm.senderName,
    messageType: sm.messageType,
    title: sm.title,
    content: sm.content,
    recipientType: sm.recipientType,
    status: 'sent',
    priority: sm.priority,
    isRead: sm.isRead,
    createdAt: new Date(),
    updatedAt: new Date()
  })));
  console.log('✅ Staff messages created');

  // Update table statuses to reflect current orders
  console.log('🔄 Updating table statuses...');
  const tableUpdates = [
    { tableKey: 'italian-delight-A2', orderNumber: orderData[0]!.orderNumber, serverEmail: 'giuseppe@italiandelight.com', partySize: 4 },
    { tableKey: 'italian-delight-A1', orderNumber: orderData[1]!.orderNumber, serverEmail: 'giuseppe@italiandelight.com', partySize: 2 }
  ];

  for (const update of tableUpdates) {
    const tableId = tables[update.tableKey];
    const orderId = orders[update.orderNumber];
    const serverId = users[update.serverEmail];
    
    if (tableId && orderId && serverId) {
      await queryInterface.sequelize.query(
        'UPDATE restaurant_tables SET status = ?, currentOrderId = ?, serverId = ?, partySize = ? WHERE id = ?',
        { 
          replacements: [TableStatus.OCCUPIED, orderId, serverId, update.partySize, tableId],
          type: QueryTypes.UPDATE 
        }
      );
    }
  }
  console.log('✅ Table statuses updated');

  console.log('🎉 Comprehensive data seeder completed successfully!');
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  console.log('🗑️ Rolling back comprehensive data seeder...');
  
  // Delete in reverse order to respect foreign key constraints
  await queryInterface.bulkDelete('reservations', {});
  await queryInterface.bulkDelete('sale_items', {});
  await queryInterface.bulkDelete('sales', {});
  await queryInterface.bulkDelete('order_items', {});
  await queryInterface.bulkDelete('kitchen_orders', {});
  await queryInterface.bulkDelete('orders', {});
  await queryInterface.bulkDelete('table_positions', {});
  await queryInterface.bulkDelete('floor_plans', {});
  await queryInterface.bulkDelete('restaurant_tables', {});
  await queryInterface.bulkDelete('menu_items', {});
  await queryInterface.bulkDelete('items', {});
  await queryInterface.bulkDelete('menu_categories', {});
  await queryInterface.bulkDelete('customers', {});
  await queryInterface.bulkDelete('users', {});
  await queryInterface.bulkDelete('staff_messages', {});
  await queryInterface.bulkDelete('businesses', {});
  await queryInterface.bulkDelete('exchange_rates', {});
  await queryInterface.bulkDelete('currencies', {});
  
  console.log('✅ Comprehensive data seeder rolled back successfully!');
}

 