import { QueryInterface, QueryTypes } from 'sequelize';
import { UserRole } from '../../models/UserModel';
import { OrderStatus, OrderType } from '../../models/OrderModel';
import { TableStatus } from '../../models/TableModel';
import { SaleStatus } from '../../models/SaleModel';
import { OrderItemStatus } from '../../models/OrderItemModel';
import { MessageType, MessageStatus, RecipientType } from '../../models/StaffMessageModel';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // 1. Create Businesses
  await queryInterface.bulkInsert('businesses', [
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
  ]);

  // Get the created businesses
  const businesses = await queryInterface.sequelize.query(
    'SELECT id FROM businesses ORDER BY id',
    { type: QueryTypes.SELECT }
  ) as any[];

  const italianBusiness = businesses[0];
  const sushiBusiness = businesses[1];
  const coffeeBusiness = businesses[2];

  // 2. Create Users (all types including waitstaff and viewers)
  await queryInterface.bulkInsert('users', [
    // Italian Delight Users
    {
      businessId: italianBusiness.id,
      name: 'Marco Rossi',
      email: 'marco@italiandelight.com',
      password: '$2b$10$hashedpassword123',
      role: UserRole.OWNER,
      isActive: true,
      assignment: 'Kitchen Manager',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: italianBusiness.id,
      name: 'Sofia Bianchi',
      email: 'sofia@italiandelight.com',
      password: '$2b$10$hashedpassword123',
      role: UserRole.MANAGER,
      isActive: true,
      assignment: 'Floor Manager',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: italianBusiness.id,
      name: 'Giuseppe Verdi',
      email: 'giuseppe@italiandelight.com',
      password: '$2b$10$hashedpassword123',
      role: UserRole.WAITSTAFF,
      isActive: true,
      assignment: 'Section A',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: italianBusiness.id,
      name: 'Maria Esposito',
      email: 'maria@italiandelight.com',
      password: '$2b$10$hashedpassword123',
      role: UserRole.WAITSTAFF,
      isActive: true,
      assignment: 'Section B',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: italianBusiness.id,
      name: 'Antonio Romano',
      email: 'antonio@italiandelight.com',
      password: '$2b$10$hashedpassword123',
      role: UserRole.CASHIER,
      isActive: true,
      assignment: 'Front Counter',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: italianBusiness.id,
      name: 'Elena Conti',
      email: 'elena@italiandelight.com',
      password: '$2b$10$hashedpassword123',
      role: UserRole.VIEWER,
      isActive: true,
      assignment: 'Reports Only',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: italianBusiness.id,
      name: 'Carlo Moretti',
      email: 'carlo@italiandelight.com',
      password: '$2b$10$hashedpassword123',
      role: UserRole.ADMIN,
      isActive: true,
      assignment: 'System Admin',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // Sushi Master Users
    {
      businessId: sushiBusiness.id,
      name: 'Yuki Tanaka',
      email: 'yuki@sushimaster.com',
      password: '$2b$10$hashedpassword123',
      role: UserRole.OWNER,
      isActive: true,
      assignment: 'Head Chef',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: sushiBusiness.id,
      name: 'Kenji Yamamoto',
      email: 'kenji@sushimaster.com',
      password: '$2b$10$hashedpassword123',
      role: UserRole.MANAGER,
      isActive: true,
      assignment: 'Operations Manager',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: sushiBusiness.id,
      name: 'Aiko Sato',
      email: 'aiko@sushimaster.com',
      password: '$2b$10$hashedpassword123',
      role: UserRole.WAITSTAFF,
      isActive: true,
      assignment: 'Main Floor',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: sushiBusiness.id,
      name: 'Hiroshi Nakamura',
      email: 'hiroshi@sushimaster.com',
      password: '$2b$10$hashedpassword123',
      role: UserRole.CASHIER,
      isActive: true,
      assignment: 'Cash Register',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: sushiBusiness.id,
      name: 'Mika Suzuki',
      email: 'mika@sushimaster.com',
      password: '$2b$10$hashedpassword123',
      role: UserRole.VIEWER,
      isActive: true,
      assignment: 'Analytics',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // Coffee Corner Users
    {
      businessId: coffeeBusiness.id,
      name: 'Sarah Johnson',
      email: 'sarah@coffeecorner.com',
      password: '$2b$10$hashedpassword123',
      role: UserRole.OWNER,
      isActive: true,
      assignment: 'Owner',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: coffeeBusiness.id,
      name: 'Mike Chen',
      email: 'mike@coffeecorner.com',
      password: '$2b$10$hashedpassword123',
      role: UserRole.MANAGER,
      isActive: true,
      assignment: 'Store Manager',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: coffeeBusiness.id,
      name: 'Emma Davis',
      email: 'emma@coffeecorner.com',
      password: '$2b$10$hashedpassword123',
      role: UserRole.WAITSTAFF,
      isActive: true,
      assignment: 'Barista',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: coffeeBusiness.id,
      name: 'Alex Thompson',
      email: 'alex@coffeecorner.com',
      password: '$2b$10$hashedpassword123',
      role: UserRole.CASHIER,
      isActive: true,
      assignment: 'Cashier',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: coffeeBusiness.id,
      name: 'Lisa Wang',
      email: 'lisa@coffeecorner.com',
      password: '$2b$10$hashedpassword123',
      role: UserRole.VIEWER,
      isActive: true,
      assignment: 'Reports',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  // Get the created users
  const users = await queryInterface.sequelize.query(
    'SELECT id FROM users ORDER BY id',
    { type: QueryTypes.SELECT }
  ) as any[];

  // 3. Create Items
  await queryInterface.bulkInsert('items', [
    // Italian Delight Items
    {
      businessId: italianBusiness.id,
      name: 'Margherita Pizza',
      description: 'Fresh mozzarella, tomato sauce, basil',
      price: 18.99,
      cost: 8.50,
      sku: 'IT-PIZ-001',
      category: 'Pizza',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: italianBusiness.id,
      name: 'Spaghetti Carbonara',
      description: 'Pasta with eggs, cheese, pancetta, black pepper',
      price: 16.99,
      cost: 7.20,
      sku: 'IT-PAS-001',
      category: 'Pasta',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: italianBusiness.id,
      name: 'Tiramisu',
      description: 'Classic Italian dessert with coffee and mascarpone',
      price: 8.99,
      cost: 3.50,
      sku: 'IT-DES-001',
      category: 'Dessert',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // Sushi Master Items
    {
      businessId: sushiBusiness.id,
      name: 'California Roll',
      description: 'Crab, avocado, cucumber',
      price: 12.99,
      cost: 5.80,
      sku: 'SU-ROL-001',
      category: 'Rolls',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: sushiBusiness.id,
      name: 'Salmon Nigiri',
      description: 'Fresh salmon over rice',
      price: 6.99,
      cost: 3.20,
      sku: 'SU-NIG-001',
      category: 'Nigiri',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: sushiBusiness.id,
      name: 'Miso Soup',
      description: 'Traditional Japanese soup',
      price: 4.99,
      cost: 1.80,
      sku: 'SU-SOU-001',
      category: 'Soup',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // Coffee Corner Items
    {
      businessId: coffeeBusiness.id,
      name: 'Espresso',
      description: 'Single shot of espresso',
      price: 3.50,
      cost: 1.20,
      sku: 'CO-ESP-001',
      category: 'Coffee',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: coffeeBusiness.id,
      name: 'Cappuccino',
      description: 'Espresso with steamed milk and foam',
      price: 4.99,
      cost: 1.80,
      sku: 'CO-CAP-001',
      category: 'Coffee',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: coffeeBusiness.id,
      name: 'Blueberry Muffin',
      description: 'Fresh baked blueberry muffin',
      price: 3.99,
      cost: 1.50,
      sku: 'CO-PAS-001',
      category: 'Pastry',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  // Get the created items
  const items = await queryInterface.sequelize.query(
    'SELECT id FROM items ORDER BY id',
    { type: QueryTypes.SELECT }
  ) as any[];

  // 4. Create Tables
  await queryInterface.bulkInsert('restaurant_tables', [
    // Italian Delight Tables
    {
      businessId: italianBusiness.id,
      tableNumber: 'A1',
      capacity: 4,
      status: TableStatus.AVAILABLE,
      section: 'Main Floor',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: italianBusiness.id,
      tableNumber: 'A2',
      capacity: 6,
      status: TableStatus.OCCUPIED,
      section: 'Main Floor',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: italianBusiness.id,
      tableNumber: 'B1',
      capacity: 2,
      status: TableStatus.RESERVED,
      section: 'Patio',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // Sushi Master Tables
    {
      businessId: sushiBusiness.id,
      tableNumber: 'S1',
      capacity: 4,
      status: TableStatus.AVAILABLE,
      section: 'Main Floor',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: sushiBusiness.id,
      tableNumber: 'S2',
      capacity: 8,
      status: TableStatus.OCCUPIED,
      section: 'Bar',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // Coffee Corner Tables
    {
      businessId: coffeeBusiness.id,
      tableNumber: 'C1',
      capacity: 2,
      status: TableStatus.AVAILABLE,
      section: 'Indoor',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: coffeeBusiness.id,
      tableNumber: 'C2',
      capacity: 4,
      status: TableStatus.CLEANING,
      section: 'Outdoor',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  // Get the created tables
  const tables = await queryInterface.sequelize.query(
    'SELECT id FROM restaurant_tables ORDER BY id',
    { type: QueryTypes.SELECT }
  ) as any[];

  // 5. Create Customers
  await queryInterface.bulkInsert('customers', [
    {
      businessId: italianBusiness.id,
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1-555-0101',
      address: '123 Oak Street, Downtown, NY 10001',
      loyaltyPoints: 150,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: italianBusiness.id,
      name: 'Maria Garcia',
      email: 'maria.garcia@email.com',
      phone: '+1-555-0102',
      address: '456 Pine Avenue, Midtown, NY 10002',
      loyaltyPoints: 75,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: sushiBusiness.id,
      name: 'David Kim',
      email: 'david.kim@email.com',
      phone: '+1-555-0201',
      address: '789 Beach Road, Ocean City, CA 90211',
      loyaltyPoints: 200,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: coffeeBusiness.id,
      name: 'Jennifer Lee',
      email: 'jennifer.lee@email.com',
      phone: '+1-555-0301',
      address: '321 Coffee Lane, Brew Town, WA 98102',
      loyaltyPoints: 300,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  // Get the created customers
  const customers = await queryInterface.sequelize.query(
    'SELECT id FROM customers ORDER BY id',
    { type: QueryTypes.SELECT }
  ) as any[];

  // 6. Create Orders
  await queryInterface.bulkInsert('orders', [
    {
      businessId: italianBusiness.id,
      tableId: tables[1].id, // A2 table
      serverId: users[2].id, // Giuseppe (waitstaff)
      customerId: customers[0].id, // John Smith
      orderNumber: 'IT-2024-001',
      status: OrderStatus.CONFIRMED,
      orderType: OrderType.DINE_IN,
      subtotal: 35.98,
      taxAmount: 3.19,
      discountAmount: 0.00,
      totalAmount: 39.17,
      notes: 'Table A2 - Window seat',
      specialInstructions: 'Extra cheese on pizza',
      estimatedReadyTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: sushiBusiness.id,
      tableId: tables[4].id, // S2 table
      serverId: users[8].id, // Aiko (waitstaff)
      customerId: customers[2].id, // David Kim
      orderNumber: 'SU-2024-001',
      status: OrderStatus.IN_PROGRESS,
      orderType: OrderType.DINE_IN,
      subtotal: 24.97,
      taxAmount: 2.31,
      discountAmount: 0.00,
      totalAmount: 27.28,
      notes: 'Bar seating',
      specialInstructions: 'Extra wasabi',
      estimatedReadyTime: new Date(Date.now() + 20 * 60 * 1000), // 20 minutes from now
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: coffeeBusiness.id,
      serverId: users[12].id, // Emma (waitstaff)
      customerId: customers[3].id, // Jennifer Lee
      orderNumber: 'CO-2024-001',
      status: OrderStatus.READY,
      orderType: OrderType.TAKEAWAY,
      subtotal: 8.49,
      taxAmount: 0.86,
      discountAmount: 0.00,
      totalAmount: 9.35,
      notes: 'Takeaway order',
      specialInstructions: 'Extra hot cappuccino',
      actualReadyTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  // Get the created orders
  const orders = await queryInterface.sequelize.query(
    'SELECT id FROM orders ORDER BY id',
    { type: QueryTypes.SELECT }
  ) as any[];

  // 7. Create Order Items
  await queryInterface.bulkInsert('order_items', [
    {
      orderId: orders[0].id,
      itemId: items[0].id, // Margherita Pizza
      itemName: 'Margherita Pizza',
      quantity: 1,
      unitPrice: 18.99,
      totalPrice: 18.99,
      specialInstructions: 'Extra cheese',
      status: OrderItemStatus.IN_PROGRESS,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      orderId: orders[0].id,
      itemId: items[1].id, // Spaghetti Carbonara
      itemName: 'Spaghetti Carbonara',
      quantity: 1,
      unitPrice: 16.99,
      totalPrice: 16.99,
      specialInstructions: null,
      status: OrderItemStatus.IN_PROGRESS,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      orderId: orders[1].id,
      itemId: items[3].id, // California Roll
      itemName: 'California Roll',
      quantity: 1,
      unitPrice: 12.99,
      totalPrice: 12.99,
      specialInstructions: 'Extra wasabi',
      status: OrderItemStatus.READY,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      orderId: orders[1].id,
      itemId: items[4].id, // Salmon Nigiri
      itemName: 'Salmon Nigiri',
      quantity: 2,
      unitPrice: 6.99,
      totalPrice: 13.98,
      specialInstructions: null,
      status: OrderItemStatus.READY,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      orderId: orders[2].id,
      itemId: items[7].id, // Cappuccino
      itemName: 'Cappuccino',
      quantity: 1,
      unitPrice: 4.99,
      totalPrice: 4.99,
      specialInstructions: 'Extra hot',
      status: OrderItemStatus.SERVED,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      orderId: orders[2].id,
      itemId: items[8].id, // Blueberry Muffin
      itemName: 'Blueberry Muffin',
      quantity: 1,
      unitPrice: 3.99,
      totalPrice: 3.99,
      specialInstructions: null,
      status: OrderItemStatus.SERVED,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  // 8. Create Sales
  await queryInterface.bulkInsert('sales', [
    {
      businessId: italianBusiness.id,
      userId: users[4].id, // Antonio (cashier)
      saleNumber: 'SALE-IT-2024-001',
      status: SaleStatus.COMPLETED,
      subtotal: 35.98,
      taxAmount: 3.19,
      discountAmount: 0.00,
      totalAmount: 39.17,
      paymentMethod: 'credit_card',
      customerId: customers[0].id,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: sushiBusiness.id,
      userId: users[9].id, // Hiroshi (cashier)
      saleNumber: 'SALE-SU-2024-001',
      status: SaleStatus.COMPLETED,
      subtotal: 24.97,
      taxAmount: 2.31,
      discountAmount: 0.00,
      totalAmount: 27.28,
      paymentMethod: 'cash',
      customerId: customers[2].id,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: coffeeBusiness.id,
      userId: users[13].id, // Alex (cashier)
      saleNumber: 'SALE-CO-2024-001',
      status: SaleStatus.COMPLETED,
      subtotal: 8.49,
      taxAmount: 0.86,
      discountAmount: 0.00,
      totalAmount: 9.35,
      paymentMethod: 'debit_card',
      customerId: customers[3].id,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  // Get the created sales
  const sales = await queryInterface.sequelize.query(
    'SELECT id FROM sales ORDER BY id',
    { type: QueryTypes.SELECT }
  ) as any[];

  // 9. Create Sale Items
  await queryInterface.bulkInsert('sale_items', [
    {
      saleId: sales[0].id,
      itemId: items[0].id, // Margherita Pizza
      quantity: 1,
      unitPrice: 18.99,
      totalPrice: 18.99,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      saleId: sales[0].id,
      itemId: items[1].id, // Spaghetti Carbonara
      quantity: 1,
      unitPrice: 16.99,
      totalPrice: 16.99,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      saleId: sales[1].id,
      itemId: items[3].id, // California Roll
      quantity: 1,
      unitPrice: 12.99,
      totalPrice: 12.99,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      saleId: sales[1].id,
      itemId: items[4].id, // Salmon Nigiri
      quantity: 2,
      unitPrice: 6.99,
      totalPrice: 13.98,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      saleId: sales[2].id,
      itemId: items[7].id, // Cappuccino
      quantity: 1,
      unitPrice: 4.99,
      totalPrice: 4.99,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      saleId: sales[2].id,
      itemId: items[8].id, // Blueberry Muffin
      quantity: 1,
      unitPrice: 3.99,
      totalPrice: 3.99,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  // 10. Create Reservations
  await queryInterface.bulkInsert('reservations', [
    {
      businessId: italianBusiness.id,
      tableId: tables[2].id, // B1 table
      customerId: customers[1].id, // Maria Garcia
      customerName: 'Maria Garcia',
      customerPhone: '+1-555-0102',
      customerEmail: 'maria.garcia@email.com',
      partySize: 4,
      reservationDate: '2024-01-15',
      reservationTime: '19:00:00',
      status: 'confirmed',
      specialRequests: 'Anniversary celebration',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: sushiBusiness.id,
      customerName: 'New Customer',
      customerPhone: '+1-555-0202',
      customerEmail: 'newcustomer@email.com',
      partySize: 6,
      reservationDate: '2024-01-16',
      reservationTime: '20:00:00',
      status: 'pending',
      specialRequests: 'Window seat preferred',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  // 11. Create Kitchen Orders
  await queryInterface.bulkInsert('kitchen_orders', [
    {
      businessId: italianBusiness.id,
      orderId: orders[0].id,
      assignedTo: users[0].id, // Marco (owner/kitchen)
      chefId: users[0].id, // Marco
      status: 'preparing',
      priority: 'normal',
      estimatedPrepTime: 25,
      specialInstructions: 'Extra cheese on pizza',
      notes: 'Table A2 - Window seat',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: sushiBusiness.id,
      orderId: orders[1].id,
      assignedTo: users[7].id, // Yuki (owner/chef)
      chefId: users[7].id, // Yuki
      status: 'ready',
      priority: 'high',
      estimatedPrepTime: 15,
      actualPrepTime: 12,
      specialInstructions: 'Extra wasabi',
      notes: 'Bar seating',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  // 12. Create Deliveries
  await queryInterface.bulkInsert('deliveries', [
    {
      businessId: italianBusiness.id,
      orderId: orders[0].id,
      customerId: customers[0].id,
      driverId: users[2].id, // Giuseppe (also driver)
      deliveryAddress: '123 Oak Street, Downtown, NY 10001',
      deliveryInstructions: 'Ring doorbell twice',
      estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000), // 45 minutes from now
      status: 'pending',
      deliveryFee: 5.00,
      tipAmount: 3.00,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  // 13. Create Staff Messages
  await queryInterface.bulkInsert('staff_messages', [
    {
      businessId: italianBusiness.id,
      senderId: users[1].id, // Sofia (manager)
      senderName: 'Sofia Bianchi',
      messageType: MessageType.ANNOUNCEMENT,
      title: 'Staff Meeting Tomorrow',
      content: 'Reminder: Staff meeting tomorrow at 2 PM in the back room. All staff must attend.',
      recipientType: RecipientType.ALL,
      status: MessageStatus.SENT,
      priority: 'normal',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: sushiBusiness.id,
      senderId: users[8].id, // Kenji (manager)
      senderName: 'Kenji Yamamoto',
      messageType: MessageType.INVENTORY_ALERT,
      title: 'Low Salmon Stock',
      content: 'We are running low on fresh salmon. Please order more by end of day.',
      recipientType: RecipientType.KITCHEN,
      status: MessageStatus.SENT,
      priority: 'high',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: coffeeBusiness.id,
      senderId: users[11].id, // Sarah (owner)
      senderName: 'Sarah Johnson',
      messageType: MessageType.PROMOTION,
      title: 'New Seasonal Drink',
      content: 'Introducing our new Pumpkin Spice Latte! Available starting tomorrow.',
      recipientType: RecipientType.ALL,
      status: MessageStatus.SENT,
      priority: 'normal',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  // 14. Create Menu Categories
  await queryInterface.bulkInsert('menu_categories', [
    {
      businessId: italianBusiness.id,
      name: 'Pizza',
      description: 'Authentic Italian pizzas',
      sortOrder: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: italianBusiness.id,
      name: 'Pasta',
      description: 'Fresh pasta dishes',
      sortOrder: 2,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: sushiBusiness.id,
      name: 'Rolls',
      description: 'Fresh sushi rolls',
      sortOrder: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: coffeeBusiness.id,
      name: 'Coffee',
      description: 'Artisanal coffee drinks',
      sortOrder: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  // 15. Create Menu Items
  await queryInterface.bulkInsert('menu_items', [
    {
      businessId: italianBusiness.id,
      categoryId: 1, // Pizza category
      name: 'Margherita Pizza',
      description: 'Fresh mozzarella, tomato sauce, basil',
      price: 18.99,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: sushiBusiness.id,
      categoryId: 3, // Rolls category
      name: 'California Roll',
      description: 'Crab, avocado, cucumber',
      price: 12.99,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      businessId: coffeeBusiness.id,
      categoryId: 4, // Coffee category
      name: 'Cappuccino',
      description: 'Espresso with steamed milk and foam',
      price: 4.99,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
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