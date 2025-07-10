// Load environment variables FIRST, before any other imports
import dotenv from 'dotenv';
import path from 'path';
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

import bcrypt from 'bcryptjs';
import { initializeAllModels, getSequelize } from '../models';

// Import models
import { BusinessModel } from '../models/BusinessModel';
import { UserModel, UserRole } from '../models/UserModel';
import { TableModel, TableStatus } from '../models/TableModel';
import { OrderModel, OrderStatus, OrderType } from '../models/OrderModel';
import { OrderItemModel, OrderItemStatus } from '../models/OrderItemModel';
import { MenuCategoryModel } from '../models/MenuCategoryModel';
import { MenuItemModel } from '../models/MenuItemModel';

initializeAllModels();

const seedDevDatabase = async () => {
  try {
    console.log('🌱 Starting development database seeding...');
    
    // Debug: Show environment variables
    console.log('🔍 Environment check:');
    console.log('  DB_HOST:', process.env.DB_HOST);
    console.log('  DB_USERNAME:', process.env.DB_USERNAME);
    console.log('  DB_NAME:', process.env.DB_NAME);
    console.log('  NODE_ENV:', process.env.NODE_ENV);
    
    // Debug: Show sequelize config
    console.log('🔍 Sequelize config:');
    console.log('  Host:', getSequelize().config.host);
    console.log('  Username:', getSequelize().config.username);
    console.log('  Database:', getSequelize().config.database);
    
    // Test connection
    await getSequelize().authenticate();
    console.log('✅ Development database connection established.');

    // Sync database
    await getSequelize().sync({ force: true });
    console.log('✅ Development database synchronized.');

    // Create initial business
    const business = await BusinessModel.create({
      name: 'Demo Restaurant',
      slug: 'demo-restaurant',
      description: 'A demo restaurant for testing',
      taxRate: 8.5,
      currency: 'USD',
      timezone: 'America/New_York',
      isActive: true,
      type: 'restaurant',
    });
    console.log('✅ Initial business created:', business.name);

    // Create admin user
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);
    
    const adminUser = await UserModel.create({
      name: 'Admin User',
      email: 'admin@demo.com',
      password: hashedPassword,
      businessId: business.id,
      role: UserRole.ADMIN,
      isActive: true
    });
    console.log('✅ Admin user created:', adminUser.email);

    // Create a regular user
    const regularPassword = await bcrypt.hash('user123', saltRounds);
    
    const regularUser = await UserModel.create({
      name: 'Regular User',
      email: 'user@demo.com',
      password: regularPassword,
      businessId: business.id,
      role: UserRole.CASHIER,
      isActive: true
    });
    console.log('✅ Regular user created:', regularUser.email);

    // Create tables
    const restaurantTables = await Promise.all([
      TableModel.create({ businessId: business.id, tableNumber: 'T1', capacity: 4, section: 'Main', status: TableStatus.AVAILABLE }),
      TableModel.create({ businessId: business.id, tableNumber: 'T2', capacity: 2, section: 'Patio', status: TableStatus.AVAILABLE }),
      TableModel.create({ businessId: business.id, tableNumber: 'T3', capacity: 6, section: 'Main', status: TableStatus.AVAILABLE }),
    ]);
    console.log('✅ Tables created:', restaurantTables.map(t => `${t.tableNumber} (ID: ${t.id})`).join(', '));

    // Create menu categories
    const menuCategories = await Promise.all([
      MenuCategoryModel.create({
        businessId: business.id,
        name: 'Appetizers',
        description: 'Start your meal with our delicious appetizers',
        displayOrder: 1,
        colorCode: '#FF6B6B'
      }),
      MenuCategoryModel.create({
        businessId: business.id,
        name: 'Main Courses',
        description: 'Our signature main dishes',
        displayOrder: 2,
        colorCode: '#4ECDC4'
      }),
      MenuCategoryModel.create({
        businessId: business.id,
        name: 'Desserts',
        description: 'Sweet endings to your meal',
        displayOrder: 3,
        colorCode: '#45B7D1'
      }),
      MenuCategoryModel.create({
        businessId: business.id,
        name: 'Beverages',
        description: 'Refreshing drinks and cocktails',
        displayOrder: 4,
        colorCode: '#96CEB4'
      })
    ]);
    console.log('✅ Menu categories created:', menuCategories.map(c => `${c.name} (ID: ${c.id})`).join(', '));

    // Create menu items
    const menuItems = await Promise.all([
      MenuItemModel.create({
        businessId: business.id,
        categoryId: menuCategories[0].id,
        name: 'Bruschetta',
        description: 'Toasted bread topped with tomatoes, garlic, and herbs',
        price: 8.99,
        cost: 3.50,
        preparationTime: 10,
        isVegetarian: true,
        isVegan: false,
        isGlutenFree: false,
        ingredients: ['Bread', 'Tomatoes', 'Garlic', 'Basil', 'Olive Oil'],
        allergens: ['Gluten'],
        calories: 180,
        tags: ['Italian', 'Fresh'],
        sku: 'SKU-BRUSCHETTA-001',
        barcode: 'BRUSCHETTA-BC-001'
      }),
      MenuItemModel.create({
        businessId: business.id,
        categoryId: menuCategories[1].id,
        name: 'Grilled Salmon',
        description: 'Fresh Atlantic salmon with seasonal vegetables',
        price: 24.99,
        cost: 12.00,
        preparationTime: 20,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: true,
        ingredients: ['Salmon', 'Lemon', 'Herbs', 'Vegetables', 'Olive Oil'],
        allergens: ['Fish'],
        calories: 450,
        tags: ['Healthy', 'Fresh', 'Gluten-Free'],
        sku: 'SKU-GRILLSALMON-003',
        barcode: 'GRILLSALMON-BC-003'
      }),
      MenuItemModel.create({
        businessId: business.id,
        categoryId: menuCategories[2].id,
        name: 'Tiramisu',
        description: 'Classic Italian dessert with coffee and mascarpone',
        price: 12.99,
        cost: 5.00,
        preparationTime: 5,
        isVegetarian: true,
        isVegan: false,
        isGlutenFree: false,
        ingredients: ['Mascarpone', 'Coffee', 'Ladyfingers', 'Cocoa', 'Eggs'],
        allergens: ['Gluten', 'Dairy', 'Eggs'],
        calories: 380,
        tags: ['Italian', 'Classic'],
        sku: 'SKU-TIRAMISU-006',
        barcode: 'TIRAMISU-BC-006'
      })
    ]);
    console.log('✅ Menu items created:', menuItems.map(m => `${m.name} (ID: ${m.id})`).join(', '));

    // Create a sample order
    const order = await OrderModel.create({
      businessId: business.id,
      tableId: restaurantTables[0].id,
      serverId: adminUser.id,
      orderNumber: 'ORD-1001',
      orderType: OrderType.DINE_IN,
      status: OrderStatus.PENDING,
      subtotal: 46.97,
      taxAmount: 3.99,
      discountAmount: 0.00,
      totalAmount: 50.96,
      notes: 'Test order with real menu items',
    });
    console.log('✅ Sample order created: ID', order.id);

    // Create order items with real menu items
    const orderItems = await Promise.all([
      OrderItemModel.create({
        orderId: order.id,
        itemId: menuItems[0].id, // Bruschetta
        itemName: menuItems[0].name,
        quantity: 2,
        unitPrice: menuItems[0].price,
        totalPrice: menuItems[0].price * 2,
        status: OrderItemStatus.PENDING,
      }),
      OrderItemModel.create({
        orderId: order.id,
        itemId: menuItems[1].id, // Grilled Salmon
        itemName: menuItems[1].name,
        quantity: 1,
        unitPrice: menuItems[1].price,
        totalPrice: menuItems[1].price,
        status: OrderItemStatus.PENDING,
      }),
    ]);
    console.log('✅ Order items created:', orderItems.map(oi => `${oi.itemName} (ID: ${oi.id})`).join(', '));

    // Create a sample customer
    const customer = await (await import('../models/CustomerModel')).CustomerModel.create({
      businessId: business.id,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      address: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62704',
      country: 'USA',
      isActive: true
    });
    console.log('✅ Sample customer created:', customer.name);

    // Create a sample delivery
    const delivery = await (await import('../models/DeliveryModel')).DeliveryModel.create({
      businessId: business.id,
      orderId: order.id,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone || '',
      customerEmail: customer.email || '',
      deliveryAddress: customer.address || '',
      deliveryCity: customer.city || '',
      deliveryState: customer.state || '',
      deliveryZipCode: customer.zipCode || '',
      deliveryFee: 5.99,
      tip: 2.00,
      totalAmount: 58.95,
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      status: 'pending',
      driverId: adminUser.id,
      driverName: adminUser.name,
      driverPhone: '+1234567890',
    });
    console.log('✅ Sample delivery created: ID', delivery.id);

    // Create a sample kitchen order
    const kitchenOrder = await (await import('../models/KitchenOrderModel')).KitchenOrderModel.create({
      businessId: business.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      tableNumber: restaurantTables[0].tableNumber,
      customerName: customer.name,
      orderType: 'dine_in',
      priority: 'normal',
      status: 'pending',
      estimatedPrepTime: 20,
      items: orderItems.map(oi => ({
        id: oi.id,
        itemName: oi.itemName,
        quantity: oi.quantity,
        status: 'pending' as 'pending',
        preparationTime: 10
      })),
      totalItems: orderItems.length,
      completedItems: 0
    });
    console.log('✅ Sample kitchen order created: ID', kitchenOrder.id);

    // Create a sample reservation
    const reservation = await (await import('../models/ReservationModel')).ReservationModel.create({
      businessId: business.id,
      tableId: restaurantTables[0].id,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone || '',
      partySize: 2,
      reservationDate: (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); })(),
      reservationTime: '18:30',
      status: 'pending',
      source: 'online',
      duration: 90,
    });
    console.log('✅ Sample reservation created: ID', reservation.id);

    console.log('🎉 Development database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- 1 Business: ${business.name}`);
    console.log(`- 2 Users: ${adminUser.name}, ${regularUser.name}`);
    console.log(`- 3 Tables: ${restaurantTables.map(t => t.tableNumber).join(', ')}`);
    console.log(`- 4 Menu categories with ${menuItems.length} items`);
    console.log(`- 1 Order with ${orderItems.length} items`);

    await getSequelize().close();
    console.log('✅ Development database connection closed.');

  } catch (error) {
    console.error('❌ Error seeding development database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDevDatabase(); 