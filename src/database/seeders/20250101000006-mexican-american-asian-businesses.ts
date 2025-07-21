import { QueryInterface, QueryTypes } from 'sequelize';
import { UserRole, KitchenAssignment } from '../../models/UserModel';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

export async function up(queryInterface: QueryInterface): Promise<void> {
  console.log('🌮🍔🥢 Starting Mexican, American, and Asian businesses seeder...');

  // 1. Create New Businesses
  const businessData = [
    {
      name: 'Taco Fiesta Mexican Grill',
      slug: 'taco-fiesta',
      description: 'Authentic Mexican cuisine with fresh ingredients and bold flavors',
      logo: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop&crop=center',
      primaryColor: '#FF6B35',
      secondaryColor: '#2E8B57',
      address: '789 Spice Street, Mexican Quarter, TX 75001',
      phone: '+1-555-0789',
      email: 'info@tacofiesta.com',
      website: 'https://tacofiesta.com',
      taxRate: 8.25,
      currency: 'USD',
      timezone: 'America/Chicago',
      isActive: true,
      type: 'restaurant',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'American Diner Classic',
      slug: 'american-diner',
      description: 'Classic American comfort food with a modern twist',
      logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop&crop=center',
      primaryColor: '#DC143C',
      secondaryColor: '#FFD700',
      address: '456 Main Street, Downtown, NY 10002',
      phone: '+1-555-0456',
      email: 'hello@americandiner.com',
      website: 'https://americandiner.com',
      taxRate: 8.875,
      currency: 'USD',
      timezone: 'America/New_York',
      isActive: true,
      type: 'restaurant',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Golden Dragon Asian Cuisine',
      slug: 'golden-dragon',
      description: 'Pan-Asian cuisine featuring Chinese, Thai, and Vietnamese specialties',
      logo: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center',
      primaryColor: '#FFD700',
      secondaryColor: '#DC143C',
      address: '321 Dragon Way, Chinatown, CA 90012',
      phone: '+1-555-0321',
      email: 'contact@goldendragon.com',
      website: 'https://goldendragon.com',
      taxRate: 9.5,
      currency: 'USD',
      timezone: 'America/Los_Angeles',
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

  // 2. Create Users for New Businesses
  const userData = [
    // Taco Fiesta
    { businessSlug: 'taco-fiesta', name: 'Carlos Rodriguez', email: 'carlos@tacofiesta.com', role: UserRole.OWNER, assignment: KitchenAssignment.KITCHEN_MANAGER },
    { businessSlug: 'taco-fiesta', name: 'Maria Garcia', email: 'maria@tacofiesta.com', role: UserRole.MANAGER, assignment: KitchenAssignment.NONE },
    { businessSlug: 'taco-fiesta', name: 'Jose Martinez', email: 'jose@tacofiesta.com', role: UserRole.WAIT_STAFF, assignment: KitchenAssignment.NONE },
    { businessSlug: 'taco-fiesta', name: 'Ana Lopez', email: 'ana@tacofiesta.com', role: UserRole.WAIT_STAFF, assignment: KitchenAssignment.NONE },
    { businessSlug: 'taco-fiesta', name: 'Luis Hernandez', email: 'luis@tacofiesta.com', role: UserRole.CASHIER, assignment: KitchenAssignment.NONE },
    { businessSlug: 'taco-fiesta', name: 'Carmen Torres', email: 'carmen@tacofiesta.com', role: UserRole.VIEWER, assignment: KitchenAssignment.KITCHEN_READ },
    
    // American Diner
    { businessSlug: 'american-diner', name: 'Mike Johnson', email: 'mike@americandiner.com', role: UserRole.OWNER, assignment: KitchenAssignment.KITCHEN_MANAGER },
    { businessSlug: 'american-diner', name: 'Sarah Williams', email: 'sarah@americandiner.com', role: UserRole.MANAGER, assignment: KitchenAssignment.NONE },
    { businessSlug: 'american-diner', name: 'Tom Davis', email: 'tom@americandiner.com', role: UserRole.WAIT_STAFF, assignment: KitchenAssignment.NONE },
    { businessSlug: 'american-diner', name: 'Lisa Brown', email: 'lisa@americandiner.com', role: UserRole.WAIT_STAFF, assignment: KitchenAssignment.NONE },
    { businessSlug: 'american-diner', name: 'David Wilson', email: 'david@americandiner.com', role: UserRole.CASHIER, assignment: KitchenAssignment.NONE },
    { businessSlug: 'american-diner', name: 'Jennifer Taylor', email: 'jennifer@americandiner.com', role: UserRole.VIEWER, assignment: KitchenAssignment.KITCHEN_READ },
    
    // Golden Dragon
    { businessSlug: 'golden-dragon', name: 'Li Wei Chen', email: 'liwei@goldendragon.com', role: UserRole.OWNER, assignment: KitchenAssignment.KITCHEN_MANAGER },
    { businessSlug: 'golden-dragon', name: 'Ming Zhao', email: 'ming@goldendragon.com', role: UserRole.MANAGER, assignment: KitchenAssignment.NONE },
    { businessSlug: 'golden-dragon', name: 'Xiao Wang', email: 'xiao@goldendragon.com', role: UserRole.WAIT_STAFF, assignment: KitchenAssignment.NONE },
    { businessSlug: 'golden-dragon', name: 'Hui Zhang', email: 'hui@goldendragon.com', role: UserRole.WAIT_STAFF, assignment: KitchenAssignment.NONE },
    { businessSlug: 'golden-dragon', name: 'Jian Liu', email: 'jian@goldendragon.com', role: UserRole.CASHIER, assignment: KitchenAssignment.NONE },
    { businessSlug: 'golden-dragon', name: 'Yan Li', email: 'yan@goldendragon.com', role: UserRole.VIEWER, assignment: KitchenAssignment.KITCHEN_READ }
  ];

  // Hash passwords and create users
  const hashedPassword = await bcrypt.hash('Password123', 10);
  const usersToInsert = userData.map(user => ({
    name: user.name,
    email: user.email,
    password: hashedPassword,
    businessId: businesses[user.businessSlug],
    role: user.role,
    kitchenAssignment: user.assignment,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  // Insert users one by one to avoid bulk insert issues and handle potential email conflicts
  console.log('👥 Inserting users one by one...');
  for (const user of usersToInsert) {
    try {
      await queryInterface.sequelize.query(
        'INSERT INTO [users] ([name],[email],[password],[businessId],[role],[assignment],[isActive],[createdAt],[updatedAt]) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        {
          replacements: [
            user.name,
            user.email,
            user.password,
            user.businessId,
            user.role,
            user.kitchenAssignment,
            user.isActive,
            user.createdAt,
            user.updatedAt
          ]
        }
      );
      console.log(`   ✅ User ${user.name} (${user.email}) created`);
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError' && error.fields?.email) {
        console.log(`   ⚠️ User ${user.name} (${user.email}) already exists, skipping`);
      } else {
        throw error;
      }
    }
  }

  // 3. Create Menu Categories
  const categoryData = [
    // Taco Fiesta Categories
    { businessId: businesses['taco-fiesta'], name: 'Tacos', description: 'Authentic Mexican tacos', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['taco-fiesta'], name: 'Burritos', description: 'Fresh burritos with choice of fillings', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['taco-fiesta'], name: 'Quesadillas', description: 'Grilled quesadillas with melted cheese', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['taco-fiesta'], name: 'Enchiladas', description: 'Traditional enchiladas with sauce', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['taco-fiesta'], name: 'Sides', description: 'Mexican sides and appetizers', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['taco-fiesta'], name: 'Beverages', description: 'Mexican drinks and beverages', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['taco-fiesta'], name: 'Desserts', description: 'Traditional Mexican desserts', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    
    // American Diner Categories
    { businessId: businesses['american-diner'], name: 'Burgers', description: 'Classic American burgers', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['american-diner'], name: 'Sandwiches', description: 'Delicious sandwiches and wraps', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['american-diner'], name: 'Steaks', description: 'Premium steaks and grilled meats', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['american-diner'], name: 'Sides', description: 'Classic American sides', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['american-diner'], name: 'Salads', description: 'Fresh salads and greens', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['american-diner'], name: 'Beverages', description: 'American drinks and beverages', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['american-diner'], name: 'Desserts', description: 'Classic American desserts', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    
    // Golden Dragon Categories
    { businessId: businesses['golden-dragon'], name: 'Dim Sum', description: 'Traditional Chinese dim sum', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['golden-dragon'], name: 'Noodles', description: 'Asian noodle dishes', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['golden-dragon'], name: 'Rice Dishes', description: 'Fried rice and rice bowls', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['golden-dragon'], name: 'Stir Fry', description: 'Wok-fried dishes', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['golden-dragon'], name: 'Soups', description: 'Asian soups and broths', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['golden-dragon'], name: 'Beverages', description: 'Asian teas and beverages', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['golden-dragon'], name: 'Desserts', description: 'Asian desserts and sweets', isActive: true, createdAt: new Date(), updatedAt: new Date() }
  ];

  await queryInterface.bulkInsert('menu_categories', categoryData);

  // Get category IDs for menu items
  const categoryIds: { [key: string]: number } = {};
  for (const category of categoryData) {
    const [cat] = await queryInterface.sequelize.query(
      'SELECT id FROM menu_categories WHERE name = ? AND businessId = ?',
      { type: QueryTypes.SELECT, replacements: [category.name, category.businessId] }
    ) as any[];
    categoryIds[`${category.businessId}-${category.name}`] = cat.id;
  }

  // 4. Create Menu Items
  const menuItemData = [
    // Taco Fiesta Menu Items
    { businessId: businesses['taco-fiesta'], categoryId: categoryIds[`${businesses['taco-fiesta']}-Tacos`], name: 'Carne Asada Tacos', description: 'Grilled steak tacos with onions and cilantro', price: 12.99, cost: 6.50, sku: 'TF-MI-TAC-001', barcode: '123456789400', imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop&crop=center', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['taco-fiesta'], categoryId: categoryIds[`${businesses['taco-fiesta']}-Tacos`], name: 'Al Pastor Tacos', description: 'Marinated pork tacos with pineapple', price: 11.99, cost: 5.80, sku: 'TF-MI-TAC-002', barcode: '123456789401', imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop&crop=center', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['taco-fiesta'], categoryId: categoryIds[`${businesses['taco-fiesta']}-Burritos`], name: 'California Burrito', description: 'Carne asada burrito with fries and guacamole', price: 15.99, cost: 7.50, sku: 'TF-MI-BUR-001', barcode: '123456789402', imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop&crop=center', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['taco-fiesta'], categoryId: categoryIds[`${businesses['taco-fiesta']}-Quesadillas`], name: 'Chicken Quesadilla', description: 'Grilled chicken quesadilla with cheese', price: 13.99, cost: 6.20, sku: 'TF-MI-QUE-001', barcode: '123456789403', imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop&crop=center', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['taco-fiesta'], categoryId: categoryIds[`${businesses['taco-fiesta']}-Beverages`], name: 'Horchata', description: 'Traditional Mexican rice drink', price: 3.99, cost: 1.20, sku: 'TF-MI-BEV-001', barcode: '123456789404', imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop&crop=center', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    
    // American Diner Menu Items
    { businessId: businesses['american-diner'], categoryId: categoryIds[`${businesses['american-diner']}-Burgers`], name: 'Classic Cheeseburger', description: 'Beef patty with cheese, lettuce, tomato, and onion', price: 14.99, cost: 6.80, sku: 'AD-MI-BUR-001', barcode: '123456789500', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop&crop=center', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['american-diner'], categoryId: categoryIds[`${businesses['american-diner']}-Burgers`], name: 'Bacon Deluxe Burger', description: 'Beef patty with bacon, cheese, and special sauce', price: 16.99, cost: 7.50, sku: 'AD-MI-BUR-002', barcode: '123456789501', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop&crop=center', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['american-diner'], categoryId: categoryIds[`${businesses['american-diner']}-Steaks`], name: 'Ribeye Steak', description: '12oz ribeye steak with mashed potatoes', price: 28.99, cost: 15.00, sku: 'AD-MI-STE-001', barcode: '123456789502', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop&crop=center', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['american-diner'], categoryId: categoryIds[`${businesses['american-diner']}-Sides`], name: 'French Fries', description: 'Crispy golden french fries', price: 4.99, cost: 1.50, sku: 'AD-MI-SID-001', barcode: '123456789503', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop&crop=center', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['american-diner'], categoryId: categoryIds[`${businesses['american-diner']}-Beverages`], name: 'Root Beer Float', description: 'Classic root beer with vanilla ice cream', price: 5.99, cost: 2.00, sku: 'AD-MI-BEV-001', barcode: '123456789504', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop&crop=center', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    
    // Golden Dragon Menu Items
    { businessId: businesses['golden-dragon'], categoryId: categoryIds[`${businesses['golden-dragon']}-Dim Sum`], name: 'Shrimp Dumplings', description: 'Steamed shrimp dumplings (Har Gow)', price: 8.99, cost: 3.50, sku: 'GD-MI-DIM-001', barcode: '123456789600', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['golden-dragon'], categoryId: categoryIds[`${businesses['golden-dragon']}-Dim Sum`], name: 'Pork Buns', description: 'Steamed pork buns (Char Siu Bao)', price: 7.99, cost: 3.00, sku: 'GD-MI-DIM-002', barcode: '123456789601', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['golden-dragon'], categoryId: categoryIds[`${businesses['golden-dragon']}-Noodles`], name: 'Beef Chow Mein', description: 'Stir-fried noodles with beef and vegetables', price: 13.99, cost: 6.20, sku: 'GD-MI-NOO-001', barcode: '123456789602', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['golden-dragon'], categoryId: categoryIds[`${businesses['golden-dragon']}-Rice Dishes`], name: 'Yangzhou Fried Rice', description: 'Special fried rice with shrimp, pork, and vegetables', price: 12.99, cost: 5.80, sku: 'GD-MI-RIC-001', barcode: '123456789603', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['golden-dragon'], categoryId: categoryIds[`${businesses['golden-dragon']}-Beverages`], name: 'Jasmine Tea', description: 'Traditional jasmine green tea', price: 2.99, cost: 0.80, sku: 'GD-MI-BEV-001', barcode: '123456789604', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center', isActive: true, createdAt: new Date(), updatedAt: new Date() }
  ];

  // Insert menu items one by one to avoid bulk insert issues and handle potential barcode conflicts
  console.log('🍽️ Inserting menu items one by one...');
  for (const item of menuItemData) {
    try {
      await queryInterface.sequelize.query(
        'INSERT INTO [menu_items] ([businessId],[categoryId],[name],[description],[price],[cost],[sku],[barcode],[imageUrl],[isAvailable],[createdAt],[updatedAt]) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        {
          replacements: [
            item.businessId,
            item.categoryId,
            item.name,
            item.description,
            item.price,
            item.cost,
            item.sku,
            item.barcode,
            item.imageUrl,
            item.isActive, // This will be converted to isAvailable
            item.createdAt,
            item.updatedAt
          ]
        }
      );
      console.log(`   ✅ Menu item ${item.name} created`);
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError' && error.fields?.barcode) {
        console.log(`   ⚠️ Menu item ${item.name} with barcode ${item.barcode} already exists, skipping`);
      } else {
        throw error;
      }
    }
  }

  // 5. Create Tables
  const tableData = [
    // Taco Fiesta Tables
    { businessId: businesses['taco-fiesta'], tableNumber: 1, capacity: 4, status: 'available', section: 'Main Dining', createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['taco-fiesta'], tableNumber: 2, capacity: 6, status: 'available', section: 'Main Dining', createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['taco-fiesta'], tableNumber: 3, capacity: 2, status: 'available', section: 'Bar Area', createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['taco-fiesta'], tableNumber: 4, capacity: 8, status: 'available', section: 'Patio', createdAt: new Date(), updatedAt: new Date() },
    
    // American Diner Tables
    { businessId: businesses['american-diner'], tableNumber: 1, capacity: 4, status: 'available', section: 'Main Floor', createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['american-diner'], tableNumber: 2, capacity: 6, status: 'available', section: 'Main Floor', createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['american-diner'], tableNumber: 3, capacity: 2, status: 'available', section: 'Counter', createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['american-diner'], tableNumber: 4, capacity: 8, status: 'available', section: 'Booth Area', createdAt: new Date(), updatedAt: new Date() },
    
    // Golden Dragon Tables
    { businessId: businesses['golden-dragon'], tableNumber: 1, capacity: 4, status: 'available', section: 'Main Dining', createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['golden-dragon'], tableNumber: 2, capacity: 6, status: 'available', section: 'Main Dining', createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['golden-dragon'], tableNumber: 3, capacity: 2, status: 'available', section: 'Window Seating', createdAt: new Date(), updatedAt: new Date() },
    { businessId: businesses['golden-dragon'], tableNumber: 4, capacity: 10, status: 'available', section: 'Private Room', createdAt: new Date(), updatedAt: new Date() }
  ];

  await queryInterface.bulkInsert('restaurant_tables', tableData);

  console.log('✅ Mexican, American, and Asian businesses seeder completed successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - Taco Fiesta Mexican Grill created`);
  console.log(`   - American Diner Classic created`);
  console.log(`   - Golden Dragon Asian Cuisine created`);
  console.log(`   - 18 users created across all businesses`);
  console.log(`   - 21 menu categories created`);
  console.log(`   - 15 menu items created`);
  console.log(`   - 12 tables created`);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  console.log('🗑️ Rolling back Mexican, American, and Asian businesses seeder...');
  
  // Delete in reverse order due to foreign key constraints
  await queryInterface.sequelize.query('DELETE FROM restaurant_tables WHERE businessId IN (SELECT id FROM businesses WHERE slug IN (?, ?, ?))', {
    replacements: ['taco-fiesta', 'american-diner', 'golden-dragon']
  });
  
  await queryInterface.sequelize.query('DELETE FROM menu_items WHERE businessId IN (SELECT id FROM businesses WHERE slug IN (?, ?, ?))', {
    replacements: ['taco-fiesta', 'american-diner', 'golden-dragon']
  });
  
  await queryInterface.sequelize.query('DELETE FROM menu_categories WHERE businessId IN (SELECT id FROM businesses WHERE slug IN (?, ?, ?))', {
    replacements: ['taco-fiesta', 'american-diner', 'golden-dragon']
  });
  
  await queryInterface.sequelize.query('DELETE FROM users WHERE businessId IN (SELECT id FROM businesses WHERE slug IN (?, ?, ?))', {
    replacements: ['taco-fiesta', 'american-diner', 'golden-dragon']
  });
  
  await queryInterface.sequelize.query('DELETE FROM businesses WHERE slug IN (?, ?, ?)', {
    replacements: ['taco-fiesta', 'american-diner', 'golden-dragon']
  });

  console.log('✅ Mexican, American, and Asian businesses seeder rolled back successfully!');
} 