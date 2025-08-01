import { QueryInterface, QueryTypes } from 'sequelize';
import { UserRole, KitchenAssignment } from '../../../models/UserModel';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

export async function up(queryInterface: QueryInterface): Promise<void> {
  console.log('🌶️🍛 Starting Indian Spice Palace seeder...');

  // 1. Create Business
  const businessData = {
    name: 'Indian Spice Palace',
    slug: 'indian-spice-palace',
    description: 'Authentic Indian cuisine with aromatic spices and traditional flavors',
    logo: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&crop=center',
    primaryColor: '#FF6B35',
    secondaryColor: '#FFD700',
    address: '567 Curry Lane, Spice District, CA 90013',
    phone: '+1-555-0567',
    email: 'info@indianspicepalace.com',
    website: 'https://indianspicepalace.com',
    taxRate: 9.5,
    currency: 'USD',
    timezone: 'America/Los_Angeles',
    isActive: true,
    type: 'restaurant',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  await queryInterface.bulkInsert('businesses', [businessData]);

  // Get business ID
  const [business] = await queryInterface.sequelize.query(
    'SELECT id FROM businesses WHERE slug = ?',
    { type: QueryTypes.SELECT, replacements: ['indian-spice-palace'] }
  ) as any[];
  const businessId = business.id;

  // 2. Create Users
  const userData = [
    { name: 'Raj Patel', email: 'raj@indianspicepalace.com', role: UserRole.OWNER, assignment: KitchenAssignment.KITCHEN_MANAGER },
    { name: 'Priya Sharma', email: 'priya@indianspicepalace.com', role: UserRole.MANAGER, assignment: KitchenAssignment.NONE },
    { name: 'Amit Singh', email: 'amit@indianspicepalace.com', role: UserRole.WAIT_STAFF, assignment: KitchenAssignment.NONE },
    { name: 'Meera Patel', email: 'meera@indianspicepalace.com', role: UserRole.WAIT_STAFF, assignment: KitchenAssignment.NONE },
    { name: 'Vikram Kumar', email: 'vikram@indianspicepalace.com', role: UserRole.CASHIER, assignment: KitchenAssignment.NONE },
    { name: 'Anjali Gupta', email: 'anjali@indianspicepalace.com', role: UserRole.VIEWER, assignment: KitchenAssignment.KITCHEN_READ }
  ];

  const hashedPassword = await bcrypt.hash('Password123', 10);
  const usersToInsert = userData.map(user => ({
    name: user.name,
    email: user.email,
    password: hashedPassword,
    businessId: businessId,
    role: user.role,
    assignment: user.assignment,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  await queryInterface.bulkInsert('users', usersToInsert);

  // 3. Create Menu Categories
  const categoryData = [
    { name: 'Curries', description: 'Traditional Indian curries', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Biryani', description: 'Aromatic rice dishes', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Tandoori', description: 'Clay oven specialties', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Bread', description: 'Fresh Indian breads', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Appetizers', description: 'Indian starters and snacks', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Desserts', description: 'Traditional Indian sweets', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Beverages', description: 'Indian drinks and lassis', isActive: true, createdAt: new Date(), updatedAt: new Date() }
  ].map(cat => ({ ...cat, businessId }));

  await queryInterface.bulkInsert('menu_categories', categoryData);

  // Get category IDs
  const categoryIds: { [key: string]: number } = {};
  for (const category of categoryData) {
    const [cat] = await queryInterface.sequelize.query(
      'SELECT id FROM menu_categories WHERE name = ? AND businessId = ?',
      { type: QueryTypes.SELECT, replacements: [category.name, businessId] }
    ) as any[];
    categoryIds[category.name] = cat.id;
  }

  // 4. Create Menu Items
  const menuItemData = [
    { categoryId: categoryIds['Curries'], name: 'Butter Chicken', description: 'Creamy tomato-based curry with tender chicken', price: 18.99, cost: 8.50, sku: 'ISP-MI-CUR-001', barcode: '123456789700', imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&crop=center', isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
    { categoryId: categoryIds['Curries'], name: 'Chicken Tikka Masala', description: 'Grilled chicken in spiced tomato sauce', price: 17.99, cost: 7.80, sku: 'ISP-MI-CUR-002', barcode: '123456789701', imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&crop=center', isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
    { categoryId: categoryIds['Biryani'], name: 'Chicken Biryani', description: 'Aromatic rice with tender chicken and spices', price: 16.99, cost: 7.20, sku: 'ISP-MI-BIR-001', barcode: '123456789702', imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&crop=center', isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
    { categoryId: categoryIds['Tandoori'], name: 'Tandoori Chicken', description: 'Marinated chicken cooked in clay oven', price: 19.99, cost: 9.00, sku: 'ISP-MI-TAN-001', barcode: '123456789703', imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&crop=center', isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
    { categoryId: categoryIds['Bread'], name: 'Garlic Naan', description: 'Fresh garlic naan bread', price: 3.99, cost: 1.20, sku: 'ISP-MI-BRE-001', barcode: '123456789704', imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&crop=center', isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
    { categoryId: categoryIds['Beverages'], name: 'Mango Lassi', description: 'Sweet mango yogurt drink', price: 4.99, cost: 1.50, sku: 'ISP-MI-BEV-001', barcode: '123456789705', imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&crop=center', isAvailable: true, createdAt: new Date(), updatedAt: new Date() }
  ].map(item => ({ ...item, businessId }));

  await queryInterface.bulkInsert('menu_items', menuItemData);

  // 5. Create Tables
  const tableData = [
    { tableNumber: 1, capacity: 4, status: 'available', section: 'Main Dining', createdAt: new Date(), updatedAt: new Date() },
    { tableNumber: 2, capacity: 6, status: 'available', section: 'Main Dining', createdAt: new Date(), updatedAt: new Date() },
    { tableNumber: 3, capacity: 2, status: 'available', section: 'Window Seating', createdAt: new Date(), updatedAt: new Date() },
    { tableNumber: 4, capacity: 8, status: 'available', section: 'Private Room', createdAt: new Date(), updatedAt: new Date() }
  ].map(table => ({ ...table, businessId }));

  await queryInterface.bulkInsert('restaurant_tables', tableData);

  console.log('✅ Indian Spice Palace seeder completed successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - Indian Spice Palace created`);
  console.log(`   - 6 users created`);
  console.log(`   - 7 menu categories created`);
  console.log(`   - 6 menu items created`);
  console.log(`   - 4 tables created`);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  console.log('🗑️ Rolling back Indian Spice Palace seeder...');
  
  await queryInterface.sequelize.query('DELETE FROM restaurant_tables WHERE businessId IN (SELECT id FROM businesses WHERE slug = ?)', {
    replacements: ['indian-spice-palace']
  });
  
  await queryInterface.sequelize.query('DELETE FROM menu_items WHERE businessId IN (SELECT id FROM businesses WHERE slug = ?)', {
    replacements: ['indian-spice-palace']
  });
  
  await queryInterface.sequelize.query('DELETE FROM menu_categories WHERE businessId IN (SELECT id FROM businesses WHERE slug = ?)', {
    replacements: ['indian-spice-palace']
  });
  
  await queryInterface.sequelize.query('DELETE FROM users WHERE businessId IN (SELECT id FROM businesses WHERE slug = ?)', {
    replacements: ['indian-spice-palace']
  });
  
  await queryInterface.sequelize.query('DELETE FROM businesses WHERE slug = ?', {
    replacements: ['indian-spice-palace']
  });

  console.log('✅ Indian Spice Palace seeder rolled back successfully!');
} 