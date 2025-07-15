import { QueryInterface, QueryTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { UserRole, KitchenAssignment } from '../../models/UserModel';
import { OrderStatus, OrderType } from '../../models/OrderModel';
import { TableStatus } from '../../models/TableModel';
import { SaleStatus } from '../../models/SaleModel';
import { OrderItemStatus } from '../../models/OrderItemModel';
import { MessageType, MessageStatus, RecipientType } from '../../models/StaffMessageModel';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

export async function up(queryInterface: QueryInterface): Promise<void> {
  // 1. Create Businesses
  const businessData = [
    {
      name: 'Italian Delight Restaurant',
      slug: 'italian-delight',
      description: 'Authentic Italian cuisine in a cozy atmosphere',
      logo: 'https://example.com/italian-logo.png',
      primaryColor: '#D4AF37',
      secondaryColor: '#8B0000',
      address: '123 Main Street, Downtown, NY 10001',
      phone: '+1-555-0123',
      email: 'info@italiandelight.com',
      website: 'https://italiandelight.com',
      taxRate: 8.875,
      currency: 'USD',
      timezone: 'America/New_York',
      isActive: true,
      type: 'restaurant',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Sushi Master',
      slug: 'sushi-master',
      description: 'Fresh sushi and Japanese cuisine',
      logo: 'https://example.com/sushi-logo.png',
      primaryColor: '#FF6B6B',
      secondaryColor: '#4ECDC4',
      address: '456 Ocean Drive, Beach City, CA 90210',
      phone: '+1-555-0456',
      email: 'contact@sushimaster.com',
      website: 'https://sushimaster.com',
      taxRate: 9.25,
      currency: 'USD',
      timezone: 'America/Los_Angeles',
      isActive: true,
      type: 'restaurant',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Coffee Corner',
      slug: 'coffee-corner',
      description: 'Artisanal coffee and light fare',
      logo: 'https://example.com/coffee-logo.png',
      primaryColor: '#8B4513',
      secondaryColor: '#DEB887',
      address: '789 Brew Street, Coffee Town, WA 98101',
      phone: '+1-555-0789',
      email: 'hello@coffeecorner.com',
      website: 'https://coffeecorner.com',
      taxRate: 10.1,
      currency: 'USD',
      timezone: 'America/Seattle',
      isActive: true,
      type: 'restaurant',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  await queryInterface.bulkInsert('businesses', businessData);

  // Query businesses by slug for IDs
  const businesses: { [key: string]: number } = {};
  for (const b of businessData) {
    const [biz] = await queryInterface.sequelize.query(
      'SELECT id FROM businesses WHERE slug = ?',
      { type: QueryTypes.SELECT, replacements: [b.slug] }
    ) as any[];
    businesses[b.slug] = biz.id;
  }

  // 2. Create Users
  const userData = [
    // Italian Delight
    { businessSlug: 'italian-delight', name: 'Marco Rossi', email: 'marco@italiandelight.com', role: UserRole.OWNER, assignment: KitchenAssignment.KITCHEN_MANAGER },
    { businessSlug: 'italian-delight', name: 'Sofia Bianchi', email: 'sofia@italiandelight.com', role: UserRole.MANAGER, assignment: KitchenAssignment.NONE },
    { businessSlug: 'italian-delight', name: 'Giuseppe Verdi', email: 'giuseppe@italiandelight.com', role: UserRole.WAIT_STAFF, assignment: KitchenAssignment.NONE },
    { businessSlug: 'italian-delight', name: 'Maria Esposito', email: 'maria@italiandelight.com', role: UserRole.WAIT_STAFF, assignment: KitchenAssignment.NONE },
    { businessSlug: 'italian-delight', name: 'Antonio Romano', email: 'antonio@italiandelight.com', role: UserRole.CASHIER, assignment: KitchenAssignment.NONE },
    { businessSlug: 'italian-delight', name: 'Elena Conti', email: 'elena@italiandelight.com', role: UserRole.VIEWER, assignment: KitchenAssignment.KITCHEN_READ },
    { businessSlug: 'italian-delight', name: 'Carlo Moretti', email: 'carlo@italiandelight.com', role: UserRole.ADMIN, assignment: KitchenAssignment.NONE },
    // Sushi Master
    { businessSlug: 'sushi-master', name: 'Yuki Tanaka', email: 'yuki@sushimaster.com', role: UserRole.OWNER, assignment: KitchenAssignment.KITCHEN_MANAGER },
    { businessSlug: 'sushi-master', name: 'Kenji Yamamoto', email: 'kenji@sushimaster.com', role: UserRole.MANAGER, assignment: KitchenAssignment.NONE },
    { businessSlug: 'sushi-master', name: 'Aiko Sato', email: 'aiko@sushimaster.com', role: UserRole.WAIT_STAFF, assignment: KitchenAssignment.NONE },
    { businessSlug: 'sushi-master', name: 'Hiroshi Nakamura', email: 'hiroshi@sushimaster.com', role: UserRole.CASHIER, assignment: KitchenAssignment.NONE },
    { businessSlug: 'sushi-master', name: 'Mika Suzuki', email: 'mika@sushimaster.com', role: UserRole.VIEWER, assignment: KitchenAssignment.KITCHEN_READ },
    // Coffee Corner
    { businessSlug: 'coffee-corner', name: 'Sarah Johnson', email: 'sarah@coffeecorner.com', role: UserRole.OWNER, assignment: KitchenAssignment.NONE },
    { businessSlug: 'coffee-corner', name: 'Mike Chen', email: 'mike@coffeecorner.com', role: UserRole.MANAGER, assignment: KitchenAssignment.NONE },
    { businessSlug: 'coffee-corner', name: 'Emma Davis', email: 'emma@coffeecorner.com', role: UserRole.WAIT_STAFF, assignment: KitchenAssignment.NONE },
    { businessSlug: 'coffee-corner', name: 'Alex Thompson', email: 'alex@coffeecorner.com', role: UserRole.CASHIER, assignment: KitchenAssignment.NONE },
    { businessSlug: 'coffee-corner', name: 'Lisa Wang', email: 'lisa@coffeecorner.com', role: UserRole.VIEWER, assignment: KitchenAssignment.KITCHEN_READ }
  ];
  const hashedPassword = await bcrypt.hash('Password123', 10);
  await queryInterface.bulkInsert('users', userData.map(u => ({
    businessId: businesses[u.businessSlug],
    name: u.name,
    email: u.email,
    password: hashedPassword,
    role: u.role,
    isActive: true,
    assignment: u.assignment,
    createdAt: new Date(),
    updatedAt: new Date()
  })));

  // Query users by email for IDs
  const users: { [key: string]: number } = {};
  for (const u of userData) {
    const [user] = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email = ?',
      { type: QueryTypes.SELECT, replacements: [u.email] }
    ) as any[];
    users[u.email] = user.id;
    console.log(`User ${u.email} has ID: ${user.id}`);
  }

  console.log('Users object:', users);

  // 3. Create Items (Inventory)
  const itemData = [
    // Italian Delight Items
    { businessSlug: 'italian-delight', name: 'Margherita Pizza Base', description: 'Pizza dough, tomato sauce, mozzarella', price: 12.99, cost: 5.50, stock: 50, sku: 'IT-PIZ-001', barcode: '123456789001', category: 'Pizza', unit: 'piece', minStock: 10, maxStock: 100 },
    { businessSlug: 'italian-delight', name: 'Spaghetti Pasta', description: 'Fresh spaghetti pasta', price: 8.99, cost: 3.20, stock: 30, sku: 'IT-PAS-001', barcode: '123456789002', category: 'Pasta', unit: 'piece', minStock: 5, maxStock: 80 },
    { businessSlug: 'italian-delight', name: 'Tiramisu Mix', description: 'Mascarpone, coffee, ladyfingers', price: 6.99, cost: 2.50, stock: 20, sku: 'IT-DES-001', barcode: '123456789003', category: 'Dessert', unit: 'piece', minStock: 5, maxStock: 50 },
    { businessSlug: 'italian-delight', name: 'Pepperoni Pizza Base', description: 'Pizza dough, tomato sauce, pepperoni', price: 14.99, cost: 6.50, stock: 40, sku: 'IT-PIZ-002', barcode: '123456789004', category: 'Pizza', unit: 'piece', minStock: 8, maxStock: 80 },
    { businessSlug: 'italian-delight', name: 'Fettuccine Alfredo', description: 'Fresh fettuccine with alfredo sauce', price: 10.99, cost: 4.20, stock: 25, sku: 'IT-PAS-002', barcode: '123456789005', category: 'Pasta', unit: 'piece', minStock: 5, maxStock: 60 },
    { businessSlug: 'italian-delight', name: 'Cannoli Shells', description: 'Crispy cannoli shells with filling', price: 5.99, cost: 2.00, stock: 35, sku: 'IT-DES-002', barcode: '123456789006', category: 'Dessert', unit: 'piece', minStock: 10, maxStock: 70 },
    // Sushi Master Items
    { businessSlug: 'sushi-master', name: 'California Roll Mix', description: 'Crab, avocado, cucumber, rice', price: 8.99, cost: 3.80, stock: 40, sku: 'SU-ROL-001', barcode: '123456789007', category: 'Rolls', unit: 'piece', minStock: 10, maxStock: 100 },
    { businessSlug: 'sushi-master', name: 'Salmon Sashimi', description: 'Fresh salmon for nigiri', price: 4.99, cost: 2.20, stock: 60, sku: 'SU-NIG-001', barcode: '123456789008', category: 'Nigiri', unit: 'piece', minStock: 15, maxStock: 120 },
    { businessSlug: 'sushi-master', name: 'Miso Soup Base', description: 'Miso paste, dashi, tofu', price: 2.99, cost: 0.80, stock: 80, sku: 'SU-SOU-001', barcode: '123456789009', category: 'Soup', unit: 'bowl', minStock: 20, maxStock: 150 },
    { businessSlug: 'sushi-master', name: 'Spicy Tuna Roll Mix', description: 'Tuna, spicy mayo, rice', price: 9.99, cost: 4.20, stock: 35, sku: 'SU-ROL-002', barcode: '123456789010', category: 'Rolls', unit: 'piece', minStock: 8, maxStock: 80 },
    { businessSlug: 'sushi-master', name: 'Tuna Sashimi', description: 'Fresh tuna for nigiri', price: 5.99, cost: 2.80, stock: 45, sku: 'SU-NIG-002', barcode: '123456789011', category: 'Nigiri', unit: 'piece', minStock: 12, maxStock: 100 },
    // Coffee Corner Items
    { businessSlug: 'coffee-corner', name: 'Espresso Beans', description: 'Premium espresso coffee beans', price: 2.50, cost: 0.80, stock: 200, sku: 'CO-ESP-001', barcode: '123456789012', category: 'Coffee', unit: 'shot', minStock: 50, maxStock: 500 },
    { businessSlug: 'coffee-corner', name: 'Milk for Cappuccino', description: 'Fresh whole milk for cappuccino', price: 3.50, cost: 1.20, stock: 150, sku: 'CO-CAP-001', barcode: '123456789013', category: 'Coffee', unit: 'cup', minStock: 30, maxStock: 300 },
    { businessSlug: 'coffee-corner', name: 'Blueberry Muffin Mix', description: 'Fresh baked blueberry muffin mix', price: 2.99, cost: 1.00, stock: 25, sku: 'CO-PAS-001', barcode: '123456789014', category: 'Pastry', unit: 'piece', minStock: 5, maxStock: 60 },
    { businessSlug: 'coffee-corner', name: 'Chocolate Croissant Dough', description: 'Buttery croissant dough with chocolate', price: 3.50, cost: 1.30, stock: 30, sku: 'CO-PAS-002', barcode: '123456789015', category: 'Pastry', unit: 'piece', minStock: 8, maxStock: 70 },
    { businessSlug: 'coffee-corner', name: 'Latte Milk', description: 'Steamed milk for lattes', price: 3.00, cost: 1.00, stock: 120, sku: 'CO-LAT-001', barcode: '123456789016', category: 'Coffee', unit: 'cup', minStock: 25, maxStock: 250 }
  ];
  await queryInterface.bulkInsert('items', itemData.map(i => ({
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
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  })));

  // Query items by sku for IDs
  const items: { [key: string]: number } = {};
  for (const i of itemData) {
    const [item] = await queryInterface.sequelize.query(
      'SELECT id FROM items WHERE sku = ?',
      { type: QueryTypes.SELECT, replacements: [i.sku] }
    ) as any[];
    items[i.sku] = item.id;
  }

  // 4. Create Tables
  const tableData = [
    // Italian Delight Tables
    { businessSlug: 'italian-delight', tableNumber: 'A1', capacity: 4, status: TableStatus.AVAILABLE, section: 'Main Floor' },
    { businessSlug: 'italian-delight', tableNumber: 'A2', capacity: 6, status: TableStatus.OCCUPIED, section: 'Main Floor' },
    { businessSlug: 'italian-delight', tableNumber: 'B1', capacity: 2, status: TableStatus.RESERVED, section: 'Patio' },
    // Sushi Master Tables
    { businessSlug: 'sushi-master', tableNumber: 'S1', capacity: 4, status: TableStatus.AVAILABLE, section: 'Main Floor' },
    { businessSlug: 'sushi-master', tableNumber: 'S2', capacity: 8, status: TableStatus.OCCUPIED, section: 'Bar' },
    // Coffee Corner Tables
    { businessSlug: 'coffee-corner', tableNumber: 'C1', capacity: 2, status: TableStatus.AVAILABLE, section: 'Indoor' },
    { businessSlug: 'coffee-corner', tableNumber: 'C2', capacity: 4, status: TableStatus.CLEANING, section: 'Outdoor' }
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

  // 5. Create Customers
  const customerData = [
    { businessSlug: 'italian-delight', name: 'John Smith', email: 'john.smith@email.com', phone: '+1-555-0101', address: '123 Oak Street, Downtown, NY 10001', loyaltyPoints: 150 },
    { businessSlug: 'italian-delight', name: 'Maria Garcia', email: 'maria.garcia@email.com', phone: '+1-555-0102', address: '456 Pine Avenue, Midtown, NY 10002', loyaltyPoints: 75 },
    { businessSlug: 'sushi-master', name: 'David Kim', email: 'david.kim@email.com', phone: '+1-555-0201', address: '789 Beach Road, Ocean City, CA 90211', loyaltyPoints: 200 },
    { businessSlug: 'coffee-corner', name: 'Jennifer Lee', email: 'jennifer.lee@email.com', phone: '+1-555-0301', address: '321 Coffee Lane, Brew Town, WA 98102', loyaltyPoints: 300 }
  ];
  await queryInterface.bulkInsert('customers', customerData.map(c => ({
    businessId: businesses[c.businessSlug],
    name: c.name,
    email: c.email,
    phone: c.phone,
    address: c.address,
    loyaltyPoints: c.loyaltyPoints,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  })));

  // Query customers by email for IDs
  const customers: { [key: string]: number } = {};
  for (const c of customerData) {
    const [customer] = await queryInterface.sequelize.query(
      'SELECT id FROM customers WHERE email = ?',
      { type: QueryTypes.SELECT, replacements: [c.email] }
    ) as any[];
    customers[c.email] = customer.id;
  }

  // Print all users in the database before inserting orders
  const allUsers = await queryInterface.sequelize.query(
    'SELECT id, name, email, role, businessId FROM users ORDER BY id',
    { type: QueryTypes.SELECT }
  );
  console.log('All users in DB before inserting orders:', allUsers);

  // 6. Create Orders
  const orderData = [
    {
      businessSlug: 'italian-delight',
      serverEmail: 'giuseppe@italiandelight.com',
      customerEmail: 'john.smith@email.com',
      tableKey: 'italian-delight-A2',
      orderNumber: 'IT-2024-001',
      status: OrderStatus.CONFIRMED,
      orderType: OrderType.DINE_IN,
      subtotal: 35.98,
      taxAmount: 3.19,
      discountAmount: 0.00,
      totalAmount: 39.17,
      notes: 'Table A2 - Window seat',
      specialInstructions: 'Extra cheese on pizza',
      estimatedReadyTime: new Date(Date.now() + 30 * 60 * 1000)
    },
    {
      businessSlug: 'italian-delight',
      serverEmail: 'giuseppe@italiandelight.com',
      customerEmail: 'maria.garcia@email.com',
      tableKey: 'italian-delight-A1',
      orderNumber: 'IT-2024-002',
      status: OrderStatus.PENDING,
      orderType: OrderType.DINE_IN,
      subtotal: 20.99,
      taxAmount: 1.86,
      discountAmount: 0.00,
      totalAmount: 22.85,
      notes: 'Table A1 - First time customer',
      specialInstructions: 'Well done pizza',
      estimatedReadyTime: new Date(Date.now() + 25 * 60 * 1000)
    },
    {
      businessSlug: 'sushi-master',
      serverEmail: 'aiko@sushimaster.com',
      customerEmail: 'david.kim@email.com',
      tableKey: 'sushi-master-S2',
      orderNumber: 'SU-2024-001',
      status: OrderStatus.IN_PROGRESS,
      orderType: OrderType.DINE_IN,
      subtotal: 24.97,
      taxAmount: 2.31,
      discountAmount: 0.00,
      totalAmount: 27.28,
      notes: 'Bar seating',
      specialInstructions: 'Extra wasabi',
      estimatedReadyTime: new Date(Date.now() + 20 * 60 * 1000)
    },
    {
      businessSlug: 'sushi-master',
      serverEmail: 'aiko@sushimaster.com',
      customerEmail: null,
      tableKey: 'sushi-master-S1',
      orderNumber: 'SU-2024-002',
      status: OrderStatus.READY,
      orderType: OrderType.DINE_IN,
      subtotal: 12.99,
      taxAmount: 1.20,
      discountAmount: 0.00,
      totalAmount: 14.19,
      notes: 'Table S1 - Walk-in customer',
      specialInstructions: 'No wasabi',
      estimatedReadyTime: new Date(Date.now() + 15 * 60 * 1000),
      actualReadyTime: new Date()
    },
    {
      businessSlug: 'coffee-corner',
      serverEmail: 'emma@coffeecorner.com',
      customerEmail: 'jennifer.lee@email.com',
      tableKey: null,
      orderNumber: 'CO-2024-001',
      status: OrderStatus.READY,
      orderType: OrderType.TAKEAWAY,
      subtotal: 8.49,
      taxAmount: 0.86,
      discountAmount: 0.00,
      totalAmount: 9.35,
      notes: 'Takeaway order',
      specialInstructions: 'Extra hot cappuccino',
      actualReadyTime: new Date()
    },
    {
      businessSlug: 'coffee-corner',
      serverEmail: 'sarah@coffeecorner.com',
      customerEmail: null,
      tableKey: 'coffee-corner-C1',
      orderNumber: 'CO-2024-002',
      status: OrderStatus.SERVED,
      orderType: OrderType.DINE_IN,
      subtotal: 11.99,
      taxAmount: 1.11,
      discountAmount: 0.00,
      totalAmount: 13.10,
      notes: 'Table C1 - Regular customer',
      specialInstructions: 'Extra shot in latte',
      estimatedReadyTime: new Date(Date.now() + 10 * 60 * 1000),
      actualReadyTime: new Date()
    }
  ];
  await queryInterface.bulkInsert('orders', orderData.map(o => {
    const serverId = users[o.serverEmail];
    const customerId = o.customerEmail ? customers[o.customerEmail] : null;
    const tableId = o.tableKey ? tables[o.tableKey] : null;
    console.log(`Creating order ${o.orderNumber}: serverId=${serverId} (${o.serverEmail}), customerId=${customerId} (${o.customerEmail}), tableId=${tableId} (${o.tableKey})`);
    
    return {
      businessId: businesses[o.businessSlug],
      tableId: tableId,
      serverId: serverId,
      customerId: customerId,
      orderNumber: o.orderNumber,
      status: o.status,
      orderType: o.orderType,
      subtotal: o.subtotal,
      taxAmount: o.taxAmount,
      discountAmount: o.discountAmount,
      totalAmount: o.totalAmount,
      notes: o.notes,
      specialInstructions: o.specialInstructions,
      estimatedReadyTime: o.estimatedReadyTime,
      actualReadyTime: o.actualReadyTime,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }));

  // Query orders by order number for IDs
  const orders: { [key: string]: number } = {};
  for (const o of orderData) {
    const [order] = await queryInterface.sequelize.query(
      'SELECT id FROM orders WHERE orderNumber = ?',
      { type: QueryTypes.SELECT, replacements: [o.orderNumber] }
    ) as any[];
    orders[o.orderNumber] = order.id;
  }

  // 7. Create Menu Categories (moved up)
  console.log('🔍 DEBUG: Creating menu categories...');
  console.log('🔍 DEBUG: Available businesses:', businesses);
  
  const categoryData = [
    { businessSlug: 'italian-delight', name: 'Pizza', description: 'Authentic Italian pizzas', displayOrder: 1 },
    { businessSlug: 'italian-delight', name: 'Pasta', description: 'Fresh pasta dishes', displayOrder: 2 },
    { businessSlug: 'italian-delight', name: 'Desserts', description: 'Traditional Italian desserts', displayOrder: 3 },
    { businessSlug: 'italian-delight', name: 'Beverages', description: 'Wine, beer, and soft drinks', displayOrder: 4 },
    { businessSlug: 'sushi-master', name: 'Rolls', description: 'Fresh sushi rolls', displayOrder: 1 },
    { businessSlug: 'sushi-master', name: 'Nigiri', description: 'Fresh nigiri sushi', displayOrder: 2 },
    { businessSlug: 'sushi-master', name: 'Soups', description: 'Traditional Japanese soups', displayOrder: 3 },
    { businessSlug: 'sushi-master', name: 'Beverages', description: 'Sake, tea, and soft drinks', displayOrder: 4 },
    { businessSlug: 'coffee-corner', name: 'Coffee', description: 'Artisanal coffee drinks', displayOrder: 1 },
    { businessSlug: 'coffee-corner', name: 'Pastries', description: 'Fresh baked pastries', displayOrder: 2 },
    { businessSlug: 'coffee-corner', name: 'Tea', description: 'Premium tea selection', displayOrder: 3 },
    { businessSlug: 'coffee-corner', name: 'Smoothies', description: 'Fresh fruit smoothies', displayOrder: 4 }
  ];
  
  console.log('🔍 DEBUG: Category data to insert:', categoryData);
  
  const categoriesToInsert = categoryData.map(c => {
    const businessId = businesses[c.businessSlug];
    console.log(`🔍 DEBUG: Category ${c.name}: businessId=${businessId}, businessSlug=${c.businessSlug}`);
    
    if (!businessId) {
      throw new Error(`Business not found for slug: ${c.businessSlug}. Available businesses: ${JSON.stringify(businesses)}`);
    }
    
    return {
      businessId: businessId,
      name: c.name,
      description: c.description,
      displayOrder: c.displayOrder,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  });
  
  console.log('🔍 DEBUG: Final categories to insert:', JSON.stringify(categoriesToInsert, null, 2));
  
  await queryInterface.bulkInsert('menu_categories', categoriesToInsert);

  // Query categories by business and name for IDs
  console.log('🔍 DEBUG: Querying categories for IDs...');
  const categories: { [key: string]: number } = {};
  for (const c of categoryData) {
    console.log(`🔍 DEBUG: Querying category: businessId=${businesses[c.businessSlug]}, name=${c.name}`);
    const [category] = await queryInterface.sequelize.query(
      'SELECT id FROM menu_categories WHERE businessId = ? AND name = ?',
      { type: QueryTypes.SELECT, replacements: [businesses[c.businessSlug], c.name] }
    ) as any[];
    console.log(`🔍 DEBUG: Found category:`, category);
    categories[`${c.businessSlug}-${c.name}`] = category.id;
  }
  
  console.log('🔍 DEBUG: Final categories object:', categories);

  // 8. Create Menu Items (moved up)
  console.log('🔍 DEBUG: Creating menu items...');
  console.log('🔍 DEBUG: Available categories:', categories);
  
  const menuItemData = [
    // Italian Delight Menu Items
    { businessSlug: 'italian-delight', categoryKey: 'italian-delight-Pizza', name: 'Margherita Pizza', description: 'Fresh mozzarella, tomato sauce, basil', price: 18.99, cost: 8.50, sku: 'IT-MI-PIZ-001', barcode: '123456789010', itemSku: 'IT-PIZ-001', imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop' },
    { businessSlug: 'italian-delight', categoryKey: 'italian-delight-Pizza', name: 'Pepperoni Pizza', description: 'Classic pepperoni with mozzarella', price: 20.99, cost: 9.50, sku: 'IT-MI-PIZ-002', barcode: '123456789011', itemSku: 'IT-PIZ-002', imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop' },
    { businessSlug: 'italian-delight', categoryKey: 'italian-delight-Pasta', name: 'Spaghetti Carbonara', description: 'Pasta with eggs, cheese, pancetta, black pepper', price: 16.99, cost: 7.20, sku: 'IT-MI-PAS-001', barcode: '123456789012', itemSku: 'IT-PAS-001', imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop' },
    { businessSlug: 'italian-delight', categoryKey: 'italian-delight-Pasta', name: 'Fettuccine Alfredo', description: 'Creamy alfredo sauce with parmesan', price: 17.99, cost: 7.80, sku: 'IT-MI-PAS-002', barcode: '123456789013', itemSku: 'IT-PAS-002', imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop' },
    { businessSlug: 'italian-delight', categoryKey: 'italian-delight-Desserts', name: 'Tiramisu', description: 'Classic Italian dessert with coffee and mascarpone', price: 8.99, cost: 3.50, sku: 'IT-MI-DES-001', barcode: '123456789014', itemSku: 'IT-DES-001', imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop' },
    { businessSlug: 'italian-delight', categoryKey: 'italian-delight-Desserts', name: 'Cannoli', description: 'Crispy shells filled with sweet ricotta', price: 6.99, cost: 2.50, sku: 'IT-MI-DES-002', barcode: '123456789015', itemSku: 'IT-DES-002', imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop' },
    { businessSlug: 'italian-delight', categoryKey: 'italian-delight-Beverages', name: 'House Red Wine', description: 'Glass of our signature red wine', price: 8.99, cost: 3.20, sku: 'IT-MI-BEV-001', barcode: '123456789016', itemSku: null, imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop' },
    { businessSlug: 'italian-delight', categoryKey: 'italian-delight-Beverages', name: 'Italian Soda', description: 'Refreshing Italian soda', price: 3.99, cost: 1.20, sku: 'IT-MI-BEV-002', barcode: '123456789017', itemSku: null, imageUrl: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop' },
    
    // Sushi Master Menu Items
    { businessSlug: 'sushi-master', categoryKey: 'sushi-master-Rolls', name: 'California Roll', description: 'Crab, avocado, cucumber', price: 12.99, cost: 5.80, sku: 'SU-MI-ROL-001', barcode: '123456789020', itemSku: 'SU-ROL-001', imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop' },
    { businessSlug: 'sushi-master', categoryKey: 'sushi-master-Rolls', name: 'Spicy Tuna Roll', description: 'Spicy tuna with cucumber', price: 14.99, cost: 6.50, sku: 'SU-MI-ROL-002', barcode: '123456789021', itemSku: 'SU-ROL-002', imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop' },
    { businessSlug: 'sushi-master', categoryKey: 'sushi-master-Nigiri', name: 'Salmon Nigiri', description: 'Fresh salmon over rice', price: 6.99, cost: 3.20, sku: 'SU-MI-NIG-001', barcode: '123456789022', itemSku: 'SU-NIG-001', imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop' },
    { businessSlug: 'sushi-master', categoryKey: 'sushi-master-Nigiri', name: 'Tuna Nigiri', description: 'Fresh tuna over rice', price: 7.99, cost: 3.80, sku: 'SU-MI-NIG-002', barcode: '123456789023', itemSku: 'SU-NIG-002', imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop' },
    { businessSlug: 'sushi-master', categoryKey: 'sushi-master-Soups', name: 'Miso Soup', description: 'Traditional Japanese soup', price: 4.99, cost: 1.80, sku: 'SU-MI-SOU-001', barcode: '123456789024', itemSku: 'SU-SOU-001', imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop' },
    { businessSlug: 'sushi-master', categoryKey: 'sushi-master-Beverages', name: 'Green Tea', description: 'Premium Japanese green tea', price: 2.99, cost: 0.80, sku: 'SU-MI-BEV-001', barcode: '123456789025', itemSku: null, imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop' },
    { businessSlug: 'sushi-master', categoryKey: 'sushi-master-Beverages', name: 'Sake', description: 'Premium sake', price: 12.99, cost: 5.20, sku: 'SU-MI-BEV-002', barcode: '123456789026', itemSku: null, imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop' },
    
    // Coffee Corner Menu Items
    { businessSlug: 'coffee-corner', categoryKey: 'coffee-corner-Coffee', name: 'Espresso', description: 'Single shot of espresso', price: 3.50, cost: 1.20, sku: 'CO-MI-COF-001', barcode: '123456789030', itemSku: 'CO-ESP-001', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop' },
    { businessSlug: 'coffee-corner', categoryKey: 'coffee-corner-Coffee', name: 'Cappuccino', description: 'Espresso with steamed milk and foam', price: 4.99, cost: 1.80, sku: 'CO-MI-COF-002', barcode: '123456789031', itemSku: 'CO-CAP-001', imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c06b?w=400&h=300&fit=crop' },
    { businessSlug: 'coffee-corner', categoryKey: 'coffee-corner-Coffee', name: 'Latte', description: 'Espresso with steamed milk', price: 4.49, cost: 1.60, sku: 'CO-MI-COF-003', barcode: '123456789032', itemSku: 'CO-LAT-001', imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&h=300&fit=crop' },
    { businessSlug: 'coffee-corner', categoryKey: 'coffee-corner-Pastries', name: 'Blueberry Muffin', description: 'Fresh baked blueberry muffin', price: 3.99, cost: 1.50, sku: 'CO-MI-PAS-001', barcode: '123456789033', itemSku: 'CO-PAS-001', imageUrl: 'https://images.unsplash.com/photo-1607958996338-0106d5c0c1e1?w=400&h=300&fit=crop' },
    { businessSlug: 'coffee-corner', categoryKey: 'coffee-corner-Pastries', name: 'Chocolate Croissant', description: 'Buttery croissant with chocolate', price: 4.49, cost: 1.80, sku: 'CO-MI-PAS-002', barcode: '123456789034', itemSku: 'CO-PAS-002', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop' },
    { businessSlug: 'coffee-corner', categoryKey: 'coffee-corner-Tea', name: 'Earl Grey Tea', description: 'Classic Earl Grey tea', price: 3.99, cost: 1.20, sku: 'CO-MI-TEA-001', barcode: '123456789035', itemSku: null, imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop' },
    { businessSlug: 'coffee-corner', categoryKey: 'coffee-corner-Smoothies', name: 'Berry Blast Smoothie', description: 'Mixed berry smoothie', price: 5.99, cost: 2.20, sku: 'CO-MI-SMO-001', barcode: '123456789036', itemSku: null, imageUrl: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop' }
  ];
  
  console.log('🔍 DEBUG: Menu item data to insert:', menuItemData);
  
  const menuItemsToInsert = menuItemData.map(mi => {
    const categoryId = categories[mi.categoryKey];
    const itemId = mi.itemSku ? items[mi.itemSku] : null;
    console.log(`🔍 DEBUG: Menu item ${mi.name}: businessId=${businesses[mi.businessSlug]}, categoryId=${categoryId}, categoryKey=${mi.categoryKey}, itemId=${itemId}`);
    
    if (!categoryId) {
      throw new Error(`Category not found for key: ${mi.categoryKey}. Available categories: ${JSON.stringify(categories)}`);
    }
    
    return {
      businessId: businesses[mi.businessSlug],
      categoryId: categoryId,
      itemId: itemId,
      name: mi.name,
      description: mi.description,
      price: mi.price,
      cost: mi.cost,
      sku: mi.sku,
      barcode: mi.barcode,
      imageUrl: mi.imageUrl,
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
  
  console.log('🔍 DEBUG: Final menu items to insert:', JSON.stringify(menuItemsToInsert, null, 2));
  
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

  // 9. Create Order Items
  const orderItemData = [
    // Italian Delight Orders
    { orderNumber: 'IT-2024-001', itemSku: 'IT-MI-PIZ-001', itemName: 'Margherita Pizza', quantity: 1, unitPrice: 18.99, totalPrice: 18.99, specialInstructions: 'Extra cheese', status: OrderItemStatus.IN_PROGRESS },
    { orderNumber: 'IT-2024-001', itemSku: 'IT-MI-PAS-001', itemName: 'Spaghetti Carbonara', quantity: 1, unitPrice: 16.99, totalPrice: 16.99, specialInstructions: null, status: OrderItemStatus.IN_PROGRESS },
    { orderNumber: 'IT-2024-002', itemSku: 'IT-MI-PIZ-002', itemName: 'Pepperoni Pizza', quantity: 1, unitPrice: 20.99, totalPrice: 20.99, specialInstructions: 'Well done', status: OrderItemStatus.PENDING },
    
    // Sushi Master Orders
    { orderNumber: 'SU-2024-001', itemSku: 'SU-MI-ROL-001', itemName: 'California Roll', quantity: 1, unitPrice: 12.99, totalPrice: 12.99, specialInstructions: 'Extra wasabi', status: OrderItemStatus.READY },
    { orderNumber: 'SU-2024-001', itemSku: 'SU-MI-NIG-001', itemName: 'Salmon Nigiri', quantity: 2, unitPrice: 6.99, totalPrice: 13.98, specialInstructions: null, status: OrderItemStatus.READY },
    { orderNumber: 'SU-2024-002', itemSku: 'SU-MI-ROL-001', itemName: 'California Roll', quantity: 1, unitPrice: 12.99, totalPrice: 12.99, specialInstructions: 'No wasabi', status: OrderItemStatus.READY },
    
    // Coffee Corner Orders
    { orderNumber: 'CO-2024-001', itemSku: 'CO-MI-COF-002', itemName: 'Cappuccino', quantity: 1, unitPrice: 4.99, totalPrice: 4.99, specialInstructions: 'Extra hot', status: OrderItemStatus.SERVED },
    { orderNumber: 'CO-2024-001', itemSku: 'CO-MI-PAS-001', itemName: 'Blueberry Muffin', quantity: 1, unitPrice: 3.99, totalPrice: 3.99, specialInstructions: null, status: OrderItemStatus.SERVED },
    { orderNumber: 'CO-2024-002', itemSku: 'CO-MI-COF-003', itemName: 'Latte', quantity: 1, unitPrice: 4.49, totalPrice: 4.49, specialInstructions: 'Extra shot', status: OrderItemStatus.SERVED },
    { orderNumber: 'CO-2024-002', itemSku: 'CO-MI-PAS-002', itemName: 'Chocolate Croissant', quantity: 1, unitPrice: 4.49, totalPrice: 4.49, specialInstructions: null, status: OrderItemStatus.SERVED },
    { orderNumber: 'CO-2024-002', itemSku: 'CO-MI-COF-001', itemName: 'Espresso', quantity: 1, unitPrice: 3.50, totalPrice: 3.50, specialInstructions: null, status: OrderItemStatus.SERVED }
  ];
  
  console.log('DEBUG: OrderItemStatus enum values:', Object.values(OrderItemStatus));
  console.log('DEBUG: Order item data statuses:', orderItemData.map(oi => oi.status));
  await queryInterface.bulkInsert('order_items', orderItemData.map(oi => ({
    orderId: orders[oi.orderNumber],
    itemId: menuItems[oi.itemSku],
    itemName: oi.itemName,
    quantity: oi.quantity,
    unitPrice: oi.unitPrice,
    totalPrice: oi.totalPrice,
    specialInstructions: oi.specialInstructions,
    status: oi.status,
    createdAt: new Date(),
    updatedAt: new Date()
  })));

  // Update table statuses to reflect current orders
  console.log('🔍 DEBUG: Updating table statuses to reflect current orders...');
  const tableUpdates = [
    { tableKey: 'italian-delight-A2', orderNumber: 'IT-2024-001', serverEmail: 'giuseppe@italiandelight.com' },
    { tableKey: 'italian-delight-A1', orderNumber: 'IT-2024-002', serverEmail: 'giuseppe@italiandelight.com' },
    { tableKey: 'sushi-master-S2', orderNumber: 'SU-2024-001', serverEmail: 'aiko@sushimaster.com' },
    { tableKey: 'sushi-master-S1', orderNumber: 'SU-2024-002', serverEmail: 'aiko@sushimaster.com' },
    { tableKey: 'coffee-corner-C1', orderNumber: 'CO-2024-002', serverEmail: 'sarah@coffeecorner.com' }
  ];

  for (const update of tableUpdates) {
    const tableId = tables[update.tableKey];
    const orderId = orders[update.orderNumber];
    const serverId = users[update.serverEmail];
    
    if (tableId && orderId && serverId) {
      await queryInterface.sequelize.query(
        'UPDATE restaurant_tables SET status = ?, currentOrderId = ?, serverId = ? WHERE id = ?',
        { 
          replacements: [TableStatus.OCCUPIED, orderId, serverId, tableId],
          type: QueryTypes.UPDATE 
        }
      );
      console.log(`🔍 DEBUG: Updated table ${update.tableKey} with order ${update.orderNumber}`);
    }
  }

  // 10. Create Sales
  const saleData = [
    {
      businessSlug: 'italian-delight',
      cashierEmail: 'antonio@italiandelight.com',
      customerEmail: 'john.smith@email.com',
      saleNumber: 'SALE-IT-2024-001',
      status: SaleStatus.COMPLETED,
      subtotal: 35.98,
      taxAmount: 3.19,
      discountAmount: 0.00,
      totalAmount: 39.17,
      paymentMethod: 'credit_card'
    },
    {
      businessSlug: 'sushi-master',
      cashierEmail: 'hiroshi@sushimaster.com',
      customerEmail: 'david.kim@email.com',
      saleNumber: 'SALE-SU-2024-001',
      status: SaleStatus.COMPLETED,
      subtotal: 24.97,
      taxAmount: 2.31,
      discountAmount: 0.00,
      totalAmount: 27.28,
      paymentMethod: 'cash'
    },
    {
      businessSlug: 'coffee-corner',
      cashierEmail: 'alex@coffeecorner.com',
      customerEmail: 'jennifer.lee@email.com',
      saleNumber: 'SALE-CO-2024-001',
      status: SaleStatus.COMPLETED,
      subtotal: 8.49,
      taxAmount: 0.86,
      discountAmount: 0.00,
      totalAmount: 9.35,
      paymentMethod: 'debit_card'
    }
  ];
  await queryInterface.bulkInsert('sales', saleData.map(s => ({
    businessId: businesses[s.businessSlug],
    userId: users[s.cashierEmail],
    saleNumber: s.saleNumber,
    status: s.status,
    totalAmount: s.totalAmount,
    paymentMethod: s.paymentMethod,
    customerName: s.customerEmail ? s.customerEmail.split('@')[0] : null,
    customerEmail: s.customerEmail,
    idempotencyKey: uuidv4(),
    payments: JSON.stringify([{
      amount: s.totalAmount,
      method: s.paymentMethod,
      customerName: s.customerEmail ? s.customerEmail.split('@')[0] : null,
      customerEmail: s.customerEmail,
      paidAt: new Date()
    }]),
    createdAt: new Date(),
    updatedAt: new Date()
  })));

  // Query sales by sale number for IDs
  const sales: { [key: string]: number } = {};
  for (const s of saleData) {
    const [sale] = await queryInterface.sequelize.query(
      'SELECT id FROM sales WHERE saleNumber = ?',
      { type: QueryTypes.SELECT, replacements: [s.saleNumber] }
    ) as any[];
    sales[s.saleNumber] = sale.id;
  }

  // 11. Create Sale Items
  const saleItemData = [
    { saleNumber: 'SALE-IT-2024-001', itemSku: 'IT-PIZ-001', quantity: 1, unitPrice: 18.99, totalPrice: 18.99 },
    { saleNumber: 'SALE-IT-2024-001', itemSku: 'IT-PAS-001', quantity: 1, unitPrice: 16.99, totalPrice: 16.99 },
    { saleNumber: 'SALE-SU-2024-001', itemSku: 'SU-ROL-001', quantity: 1, unitPrice: 12.99, totalPrice: 12.99 },
    { saleNumber: 'SALE-SU-2024-001', itemSku: 'SU-NIG-001', quantity: 2, unitPrice: 6.99, totalPrice: 13.98 },
    { saleNumber: 'SALE-CO-2024-001', itemSku: 'CO-CAP-001', quantity: 1, unitPrice: 4.99, totalPrice: 4.99 },
    { saleNumber: 'SALE-CO-2024-001', itemSku: 'CO-PAS-001', quantity: 1, unitPrice: 3.99, totalPrice: 3.99 }
  ];
  await queryInterface.bulkInsert('sale_items', saleItemData.map(si => {
    // Determine business ID based on sale number prefix
    let businessId = 1; // Default
    if (si.saleNumber.startsWith('SALE-IT-')) {
      businessId = businesses['italian-delight'] || 1;
    } else if (si.saleNumber.startsWith('SALE-SU-')) {
      businessId = businesses['sushi-master'] || 1;
    } else if (si.saleNumber.startsWith('SALE-CO-')) {
      businessId = businesses['coffee-corner'] || 1;
    }
    
    return {
      businessId: businessId,
      saleId: sales[si.saleNumber],
      itemId: items[si.itemSku],
      quantity: si.quantity,
      unitPrice: si.unitPrice,
      totalPrice: si.totalPrice,
      discountAmount: 0.00,
      finalPrice: si.totalPrice,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }));

  // 12. Create Reservations
  const reservationData = [
    {
      businessSlug: 'italian-delight',
      tableKey: 'italian-delight-B1',
      customerEmail: 'maria.garcia@email.com',
      customerName: 'Maria Garcia',
      customerPhone: '+1-555-0102',
      partySize: 4,
      reservationDate: '2024-01-15',
      reservationTime: '19:00:00',
      status: 'confirmed',
      specialRequests: 'Anniversary celebration'
    },
    {
      businessSlug: 'sushi-master',
      customerName: 'New Customer',
      customerPhone: '+1-555-0202',
      customerEmail: 'newcustomer@email.com',
      partySize: 6,
      reservationDate: '2024-01-16',
      reservationTime: '20:00:00',
      status: 'pending',
      specialRequests: 'Window seat preferred'
    }
  ];
  await queryInterface.bulkInsert('reservations', reservationData.map(r => ({
    businessId: businesses[r.businessSlug],
    tableId: r.tableKey ? tables[r.tableKey] : null,
    customerId: r.customerEmail ? customers[r.customerEmail] : null,
    customerName: r.customerName,
    customerPhone: r.customerPhone,
    customerEmail: r.customerEmail,
    partySize: r.partySize,
    reservationDate: r.reservationDate,
    reservationTime: r.reservationTime,
    status: r.status,
    specialRequests: r.specialRequests,
    createdAt: new Date(),
    updatedAt: new Date()
  })));

  // 13. Create Kitchen Orders
  const kitchenOrderData = [
    {
      businessSlug: 'italian-delight',
      orderNumber: 'IT-2024-001',
      chefEmail: 'marco@italiandelight.com',
      status: 'preparing',
      priority: 'normal',
      estimatedPrepTime: 25,
      specialInstructions: 'Extra cheese on pizza',
      notes: 'Table A2 - Window seat'
    },
    {
      businessSlug: 'sushi-master',
      orderNumber: 'SU-2024-001',
      chefEmail: 'yuki@sushimaster.com',
      status: 'ready',
      priority: 'high',
      estimatedPrepTime: 15,
      actualPrepTime: 12,
      specialInstructions: 'Extra wasabi',
      notes: 'Bar seating'
    }
  ];
  await queryInterface.bulkInsert('kitchen_orders', kitchenOrderData.map(ko => ({
    businessId: businesses[ko.businessSlug],
    orderId: orders[ko.orderNumber] || 1, // Fallback to 1 if order not found
    orderNumber: ko.orderNumber,
    orderType: 'dine_in',
    assignedTo: users[ko.chefEmail] || null,
    assignedToName: ko.chefEmail ? ko.chefEmail.split('@')[0] : 'Unknown',
    chefId: users[ko.chefEmail] || null,
    status: ko.status,
    priority: ko.priority,
    estimatedPrepTime: ko.estimatedPrepTime,
    actualPrepTime: ko.actualPrepTime || null,
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
    createdAt: new Date(),
    updatedAt: new Date()
  })));

  // 14. Create Deliveries
  const deliveryData = [
    {
      businessSlug: 'italian-delight',
      orderNumber: 'IT-2024-001',
      customerEmail: 'john.smith@email.com',
      driverEmail: 'giuseppe@italiandelight.com',
      deliveryAddress: '123 Oak Street, Downtown, NY 10001',
      deliveryInstructions: 'Ring doorbell twice',
      estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000),
      status: 'pending',
      deliveryFee: 5.00,
      tipAmount: 3.00,
      trackingNumber: 'TRACK-0001'
    }
  ];
  await queryInterface.bulkInsert('deliveries', deliveryData.map(d => ({
    businessId: businesses[d.businessSlug],
    orderId: orders[d.orderNumber],
    customerId: customers[d.customerEmail],
    driverId: users[d.driverEmail],
    deliveryAddress: d.deliveryAddress,
    deliveryInstructions: d.deliveryInstructions,
    estimatedDeliveryTime: d.estimatedDeliveryTime,
    status: d.status,
    deliveryFee: d.deliveryFee,
    tipAmount: d.tipAmount,
    trackingNumber: d.trackingNumber,
    createdAt: new Date(),
    updatedAt: new Date()
  })));

  // 15. Create Staff Messages
  const messageData = [
    {
      businessSlug: 'italian-delight',
      senderEmail: 'sofia@italiandelight.com',
      senderName: 'Sofia Bianchi',
      messageType: MessageType.ANNOUNCEMENT,
      title: 'Staff Meeting Tomorrow',
      content: 'Reminder: Staff meeting tomorrow at 2 PM in the back room. All staff must attend.',
      recipientType: RecipientType.ALL,
      status: MessageStatus.SENT,
      priority: 'normal'
    },
    {
      businessSlug: 'sushi-master',
      senderEmail: 'kenji@sushimaster.com',
      senderName: 'Kenji Yamamoto',
      messageType: MessageType.INVENTORY_ALERT,
      title: 'Low Salmon Stock',
      content: 'We are running low on fresh salmon. Please order more by end of day.',
      recipientType: RecipientType.KITCHEN,
      status: MessageStatus.SENT,
      priority: 'high'
    },
    {
      businessSlug: 'coffee-corner',
      senderEmail: 'sarah@coffeecorner.com',
      senderName: 'Sarah Johnson',
      messageType: MessageType.PROMOTION,
      title: 'New Seasonal Drink',
      content: 'Introducing our new Pumpkin Spice Latte! Available starting tomorrow.',
      recipientType: RecipientType.ALL,
      status: MessageStatus.SENT,
      priority: 'normal'
    }
  ];
  await queryInterface.bulkInsert('staff_messages', messageData.map(m => ({
    businessId: businesses[m.businessSlug],
    senderId: users[m.senderEmail],
    senderName: m.senderName,
    messageType: m.messageType,
    title: m.title,
    content: m.content,
    recipientType: m.recipientType,
    status: m.status,
    priority: m.priority,
    createdAt: new Date(),
    updatedAt: new Date()
  })));


}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Delete in reverse order to handle foreign key constraints
  await queryInterface.bulkDelete('menu_items', {});
  await queryInterface.bulkDelete('menu_categories', {});
  await queryInterface.bulkDelete('staff_messages', {});
  await queryInterface.bulkDelete('deliveries', {});
  await queryInterface.bulkDelete('kitchen_orders', {});
  await queryInterface.bulkDelete('reservations', {});
  await queryInterface.bulkDelete('sale_items', {});
  await queryInterface.bulkDelete('sales', {});
  await queryInterface.bulkDelete('order_items', {});
  await queryInterface.bulkDelete('orders', {});
  await queryInterface.bulkDelete('customers', {});
  await queryInterface.bulkDelete('restaurant_tables', {});
  await queryInterface.bulkDelete('items', {});
  await queryInterface.bulkDelete('users', {});
  await queryInterface.bulkDelete('businesses', {});
}

// Main execution
if (require.main === module) {
  const { Sequelize } = require('sequelize');
  const { getDatabaseConfig } = require('../../config/database');
  
  const config = getDatabaseConfig();
  const sequelize = new Sequelize(config);
  
  async function runSeeder() {
    try {
      console.log('🌱 Starting comprehensive data seeder...');
      await sequelize.authenticate();
      console.log('✅ Database connection established.');
      
      await up(sequelize.getQueryInterface());
      console.log('✅ Comprehensive data seeded successfully!');
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Seeder failed:', error);
      process.exit(1);
    }
  }
  
  runSeeder();
} 