import { QueryInterface, QueryTypes } from 'sequelize';
import { UserRole, KitchenAssignment } from '../../models/UserModel';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

export async function up(queryInterface: QueryInterface): Promise<void> {
  console.log('🥩🍷 Starting Argentinian Grill House seeder...');

  // 1. Create Business
  const businessData = {
    name: 'Argentinian Grill House',
    slug: 'argentinian-grill-house',
    description: 'Authentic Argentinian asado and grilled specialties',
    logo: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop&crop=center',
    primaryColor: '#87CEEB',
    secondaryColor: '#FFFFFF',
    address: '234 Asado Street, Meat District, TX 75002',
    phone: '+1-555-0234',
    email: 'info@argentiniangrill.com',
    website: 'https://argentiniangrill.com',
    taxRate: 8.25,
    currency: 'USD',
    timezone: 'America/Chicago',
    isActive: true,
    type: 'restaurant',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  await queryInterface.bulkInsert('businesses', [businessData]);

  // Get business ID
  const [business] = await queryInterface.sequelize.query(
    'SELECT id FROM businesses WHERE slug = ?',
    { type: QueryTypes.SELECT, replacements: ['argentinian-grill-house'] }
  ) as any[];
  const businessId = business.id;

  // 2. Create Users
  const userData = [
    { name: 'Diego Rodriguez', email: 'diego@argentiniangrill.com', role: UserRole.OWNER, assignment: KitchenAssignment.KITCHEN_MANAGER },
    { name: 'Sofia Martinez', email: 'sofia@argentiniangrill.com', role: UserRole.MANAGER, assignment: KitchenAssignment.NONE },
    { name: 'Mateo Lopez', email: 'mateo@argentiniangrill.com', role: UserRole.WAIT_STAFF, assignment: KitchenAssignment.NONE },
    { name: 'Valentina Garcia', email: 'valentina@argentiniangrill.com', role: UserRole.WAIT_STAFF, assignment: KitchenAssignment.NONE },
    { name: 'Santiago Fernandez', email: 'santiago@argentiniangrill.com', role: UserRole.CASHIER, assignment: KitchenAssignment.NONE },
    { name: 'Isabella Torres', email: 'isabella@argentiniangrill.com', role: UserRole.VIEWER, assignment: KitchenAssignment.KITCHEN_READ }
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
    { name: 'Asado', description: 'Traditional Argentinian grilled meats', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Empanadas', description: 'Traditional Argentinian pastries', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Pasta', description: 'Italian-influenced pasta dishes', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Sides', description: 'Traditional Argentinian sides', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Appetizers', description: 'Argentinian starters', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Desserts', description: 'Traditional Argentinian sweets', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Beverages', description: 'Argentinian wines and drinks', isActive: true, createdAt: new Date(), updatedAt: new Date() }
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
    { categoryId: categoryIds['Asado'], name: 'Bife de Chorizo', description: 'Premium sirloin steak grilled to perfection', price: 32.99, cost: 18.00, sku: 'AGH-MI-ASA-001', barcode: '123456789900', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop&crop=center', isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
    { categoryId: categoryIds['Asado'], name: 'Parrillada Mixta', description: 'Mixed grill with various cuts of meat', price: 45.99, cost: 25.00, sku: 'AGH-MI-ASA-002', barcode: '123456789901', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop&crop=center', isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
    { categoryId: categoryIds['Empanadas'], name: 'Beef Empanadas', description: 'Traditional beef empanadas with chimichurri', price: 12.99, cost: 5.50, sku: 'AGH-MI-EMP-001', barcode: '123456789902', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop&crop=center', isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
    { categoryId: categoryIds['Pasta'], name: 'Fettuccine Alfredo', description: 'Creamy fettuccine with parmesan cheese', price: 18.99, cost: 8.20, sku: 'AGH-MI-PAS-001', barcode: '123456789903', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop&crop=center', isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
    { categoryId: categoryIds['Sides'], name: 'Papas Fritas', description: 'Crispy Argentinian-style french fries', price: 6.99, cost: 2.00, sku: 'AGH-MI-SID-001', barcode: '123456789904', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop&crop=center', isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
    { categoryId: categoryIds['Beverages'], name: 'Malbec Wine', description: 'Premium Argentinian Malbec wine', price: 15.99, cost: 8.00, sku: 'AGH-MI-BEV-001', barcode: '123456789905', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop&crop=center', isAvailable: true, createdAt: new Date(), updatedAt: new Date() }
  ].map(item => ({ ...item, businessId }));

  await queryInterface.bulkInsert('menu_items', menuItemData);

  // 5. Create Tables
  const tableData = [
    { tableNumber: 1, capacity: 4, status: 'available', section: 'Main Dining', createdAt: new Date(), updatedAt: new Date() },
    { tableNumber: 2, capacity: 6, status: 'available', section: 'Main Dining', createdAt: new Date(), updatedAt: new Date() },
    { tableNumber: 3, capacity: 2, status: 'available', section: 'Bar Area', createdAt: new Date(), updatedAt: new Date() },
    { tableNumber: 4, capacity: 8, status: 'available', section: 'Patio', createdAt: new Date(), updatedAt: new Date() }
  ].map(table => ({ ...table, businessId }));

  await queryInterface.bulkInsert('restaurant_tables', tableData);

  console.log('✅ Argentinian Grill House seeder completed successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - Argentinian Grill House created`);
  console.log(`   - 6 users created`);
  console.log(`   - 7 menu categories created`);
  console.log(`   - 6 menu items created`);
  console.log(`   - 4 tables created`);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  console.log('🗑️ Rolling back Argentinian Grill House seeder...');
  
  await queryInterface.sequelize.query('DELETE FROM restaurant_tables WHERE businessId IN (SELECT id FROM businesses WHERE slug = ?)', {
    replacements: ['argentinian-grill-house']
  });
  
  await queryInterface.sequelize.query('DELETE FROM menu_items WHERE businessId IN (SELECT id FROM businesses WHERE slug = ?)', {
    replacements: ['argentinian-grill-house']
  });
  
  await queryInterface.sequelize.query('DELETE FROM menu_categories WHERE businessId IN (SELECT id FROM businesses WHERE slug = ?)', {
    replacements: ['argentinian-grill-house']
  });
  
  await queryInterface.sequelize.query('DELETE FROM users WHERE businessId IN (SELECT id FROM businesses WHERE slug = ?)', {
    replacements: ['argentinian-grill-house']
  });
  
  await queryInterface.sequelize.query('DELETE FROM businesses WHERE slug = ?', {
    replacements: ['argentinian-grill-house']
  });

  console.log('✅ Argentinian Grill House seeder rolled back successfully!');
} 