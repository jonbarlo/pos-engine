import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';

// Load test environment
process.env.NODE_ENV = 'test';
dotenv.config({ path: '.env.test' });

// Import the existing working sequelize setup
import { getSequelize } from '../../models/sequelize';

// Import models using the existing working structure
import { BusinessModel } from '../../models/BusinessModel';
import { UserModel, UserRole } from '../../models/UserModel';
import { TableModel, TableStatus } from '../../models/TableModel';
import { OrderModel, OrderStatus, OrderType } from '../../models/OrderModel';
import { OrderItemModel, OrderItemStatus } from '../../models/OrderItemModel';
import { MenuCategoryModel } from '../../models/MenuCategoryModel';
import { MenuItemModel } from '../../models/MenuItemModel';

const seedTestDatabase = async () => {
    try {
        console.log('🌱 Starting test database seeding...');
        
        // Test connection
        await getSequelize().authenticate();
        console.log('✅ Test database connection established.');

        // Initialize models using existing function
        // initializeModels(sequelize); // This line is removed as per the edit hint
        console.log('✅ Models initialized.');

        // For test environment, we can safely use force: true with SQLite
        await getSequelize().sync({ force: true });
        console.log('✅ Test database synchronized.');

        // Create test business
        const business = await BusinessModel.create({
            name: 'Test Restaurant',
            slug: 'test-restaurant',
            description: 'A test restaurant for integration tests',
            taxRate: 8.5,
            currency: 'USD',
            timezone: 'UTC',
            isActive: true,
            type: 'restaurant',
        });
        console.log('✅ Test business created:', business.name);

        // Create test user
        const hashedPassword = await bcrypt.hash('test123', 10);
        const user = await UserModel.create({
            name: 'Test User',
            email: 'test@example.com',
            password: hashedPassword,
            businessId: business.id,
            role: UserRole.MANAGER,
            isActive: true
        });
        console.log('✅ Test user created:', user.email);

        // Create test table
        const table = await TableModel.create({
            businessId: business.id,
            tableNumber: 'T1',
            capacity: 4,
            section: 'Main',
            status: TableStatus.AVAILABLE,
        });
        console.log('✅ Test table created:', table.tableNumber);

        // Create test menu category
        const category = await MenuCategoryModel.create({
            businessId: business.id,
            name: 'Test Category',
            description: 'Test category for integration tests',
            displayOrder: 1,
            colorCode: '#FF6B6B'
        });
        console.log('✅ Test menu category created:', category.name);

        // Create test menu item
        const menuItem = await MenuItemModel.create({
            businessId: business.id,
            categoryId: category.id,
            name: 'Test Burger',
            description: 'A test burger for integration tests',
            price: 12.99,
            cost: 8.00,
            preparationTime: 15,
            isAvailable: true,
            ingredients: ['Beef', 'Bun', 'Lettuce', 'Tomato'],
            allergens: ['Gluten'],
            calories: 450,
            tags: ['Test', 'Burger'],
        });
        console.log('✅ Test menu item created:', menuItem.name);

        // Create test order
        const order = await OrderModel.create({
            businessId: business.id,
            serverId: user.id,
            tableId: table.id,
            orderNumber: 'TEST-001',
            orderType: OrderType.DINE_IN,
            status: OrderStatus.PENDING,
            subtotal: 12.99,
            taxAmount: 1.10,
            discountAmount: 0.00,
            totalAmount: 14.09,
            notes: 'Test order for integration tests',
        });
        console.log('✅ Test order created:', order.orderNumber);

        // Create test order item
        const orderItem = await OrderItemModel.create({
            orderId: order.id,
            itemId: menuItem.id,
            itemName: menuItem.name,
            quantity: 1,
            unitPrice: menuItem.price,
            totalPrice: menuItem.price,
            status: OrderItemStatus.PENDING,
            notes: 'Test order item',
        });
        console.log('✅ Test order item created:', orderItem.itemName);

        console.log('\n🎉 Test database seeding completed successfully!');
        console.log('\n📋 Test Data Summary:');
        console.log(`Business ID: ${business.id}`);
        console.log(`User ID: ${user.id}`);
        console.log(`Table ID: ${table.id}`);
        console.log(`Menu Item ID: ${menuItem.id}`);
        console.log(`Order ID: ${order.id}`);
        console.log(`Order Item ID: ${orderItem.id}`);

        await getSequelize().close();
        console.log('✅ Test database connection closed.');

    } catch (error) {
        console.error('❌ Error seeding test database:', error);
        process.exit(1);
    }
};

// Run the seed function
seedTestDatabase(); 