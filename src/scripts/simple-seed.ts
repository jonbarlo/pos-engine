import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import { UserRole } from '../models/UserModel';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

// Import the existing app which has all models initialized
import app from '../index';

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...');
        
        // Wait for the app to be ready
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('✅ Database connection established.');

        // Import models after app initialization
        const { BusinessModel } = await import('../models/BusinessModel');
        const { UserModel } = await import('../models/UserModel');
        const { ItemModel } = await import('../models/ItemModel');
        const { TableModel, TableStatus } = await import('../models/TableModel');
        const { OrderModel, OrderStatus, OrderType } = await import('../models/OrderModel');
        const { OrderItemModel, OrderItemStatus } = await import('../models/OrderItemModel');
        const { MenuCategoryModel } = await import('../models/MenuCategoryModel');
        const { MenuItemModel } = await import('../models/MenuItemModel');
        const { CustomerModel } = await import('../models/CustomerModel');
        const { ReservationModel } = await import('../models/ReservationModel');
        const { DeliveryModel } = await import('../models/DeliveryModel');
        const { KitchenOrderModel } = await import('../models/KitchenOrderModel');

        console.log('✅ Models imported successfully.');

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

        // Create customers
        const customers = await Promise.all([
            CustomerModel.create({
                businessId: business.id,
                name: 'John Smith',
                email: 'john.smith@email.com',
                phone: '+1-555-0123',
                address: '123 Main St, City, State 12345',
                dateOfBirth: new Date('1990-05-15'),
                loyaltyPoints: 150,
                totalSpent: 450.75,
                lastVisit: new Date(),
                preferences: ['No nuts', 'Window seating'],
                notes: 'Prefers table by window, allergic to nuts'
            }),
            CustomerModel.create({
                businessId: business.id,
                name: 'Sarah Johnson',
                email: 'sarah.j@email.com',
                phone: '+1-555-0456',
                address: '456 Oak Ave, City, State 12345',
                dateOfBirth: new Date('1985-12-03'),
                loyaltyPoints: 320,
                totalSpent: 890.25,
                lastVisit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                preferences: ['Vegetarian', 'Quiet seating'],
                notes: 'Vegetarian customer, prefers quiet seating'
            })
        ]);
        console.log('✅ Customers created:', customers.map(c => `${c.name} (ID: ${c.id})`).join(', '));

        // Create a sample order
        const order = await OrderModel.create({
            businessId: business.id,
            tableId: restaurantTables[0].id,
            serverId: adminUser.id,
            customerId: customers[0].id,
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

        // Create reservations
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(19, 0, 0, 0);

        const reservations = await Promise.all([
            ReservationModel.create({
                businessId: business.id,
                customerId: customers[0].id,
                customerName: customers[0].name,
                customerPhone: customers[0].phone || '+1-555-0000',
                tableId: restaurantTables[0].id,
                reservationDate: tomorrow,
                reservationTime: '19:00',
                duration: 120,
                partySize: 4,
                status: 'confirmed',
                source: 'phone',
                specialRequests: 'Window seat preferred',
                notes: 'Anniversary celebration'
            })
        ]);
        console.log('✅ Reservations created:', reservations.map(r => `Table ${r.tableId} for ${r.partySize} on ${new Date(r.reservationDate).toDateString()}`).join(', '));

        // Create delivery
        const deliveries = await Promise.all([
            DeliveryModel.create({
                businessId: business.id,
                orderId: order.id,
                customerId: customers[1].id,
                customerName: customers[1].name,
                customerPhone: customers[1].phone || '+1-555-0000',
                customerEmail: customers[1].email || 'customer@example.com',
                deliveryAddress: customers[1].address || 'Default Address',
                deliveryCity: 'Default City',
                deliveryState: 'Default State',
                deliveryZipCode: '12345',
                driverId: regularUser.id,
                driverName: regularUser.name,
                driverPhone: '+1-555-0000',
                deliveryInstructions: 'Ring doorbell twice',
                estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000),
                status: 'assigned',
                trackingNumber: 'DEL-2024-001',
                deliveryFee: 5.99,
                tip: 3.00,
                totalAmount: 50.96 + 5.99 + 3.00,
                paymentMethod: 'card',
                paymentStatus: 'paid',
                distance: 2.5,
                notes: 'Customer requested extra napkins'
            })
        ]);
        console.log('✅ Deliveries created:', deliveries.map(d => `Order ${d.orderId} - ${d.status}`).join(', '));

        // Create kitchen order
        const kitchenOrders = await Promise.all([
            KitchenOrderModel.create({
                businessId: business.id,
                orderId: order.id,
                orderNumber: order.orderNumber,
                orderType: 'dine_in',
                priority: 'normal',
                status: 'pending',
                estimatedPrepTime: 20,
                totalItems: 2,
                specialInstructions: 'Allergy alert: customer allergic to nuts',
                items: [
                    {
                        id: 1,
                        itemName: menuItems[0].name,
                        quantity: 2,
                        modifications: ['Extra crispy'],
                        status: 'pending',
                        preparationTime: 10
                    },
                    {
                        id: 2,
                        itemName: menuItems[1].name,
                        quantity: 1,
                        modifications: ['Medium rare'],
                        status: 'pending',
                        preparationTime: 20
                    }
                ]
            })
        ]);
        console.log('✅ Kitchen orders created:', kitchenOrders.map(ko => `Order ${ko.orderId} - ${ko.status}`).join(', '));

        console.log('🎉 Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`- 1 Business: ${business.name}`);
        console.log(`- 2 Users: ${adminUser.name}, ${regularUser.name}`);
        console.log(`- 3 Tables: ${restaurantTables.map(t => t.tableNumber).join(', ')}`);
        console.log(`- 4 Menu categories with ${menuItems.length} items`);
        console.log(`- 2 Customers with loyalty programs`);
        console.log(`- 1 Order with ${orderItems.length} items`);
        console.log(`- 1 Reservation for tomorrow`);
        console.log(`- 1 Delivery order assigned`);
        console.log(`- 1 Kitchen order pending preparation`);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

export { seedDatabase }; 