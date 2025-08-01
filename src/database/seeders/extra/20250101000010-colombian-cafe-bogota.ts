import { QueryInterface, QueryTypes } from 'sequelize';
import { UserRole, KitchenAssignment } from '../../../models/UserModel';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

export async function up(queryInterface: QueryInterface): Promise<void> {
  console.log('☕🍃 Starting Colombian Cafe Bogota seeder...');

  // 1. Create Business
  const businessData = {
    name: 'Colombian Cafe Bogota',
    slug: 'colombian-cafe-bogota',
    description: 'Authentic Colombian coffee and traditional cuisine',
    logo: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop&crop=center',
    primaryColor: '#FFD700',
    secondaryColor: '#0066CC',
    address: '456 Coffee Avenue, Latin Quarter, FL 33101',
    phone: '+1-555-0456',
    email: 'info@colombiancafebogota.com',
    website: 'https://colombiancafebogota.com',
    taxRate: 7.0,
    currency: 'USD',
    timezone: 'America/New_York',
    isActive: true,
    type: 'restaurant',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  await queryInterface.bulkInsert('businesses', [businessData]);

  // Get business ID
  const [business] = await queryInterface.sequelize.query(
    'SELECT id FROM businesses WHERE slug = ?',
    { type: QueryTypes.SELECT, replacements: ['colombian-cafe-bogota'] }
  ) as any[];
  const businessId = business.id;

  // 2. Create Users
  const userData = [
    { name: 'Juan Carlos Gomez', email: 'juancarlos@colombiancafebogota.com', role: UserRole.OWNER, assignment: KitchenAssignment.KITCHEN_MANAGER },
    { name: 'Maria Elena Ruiz', email: 'mariaelena@colombiancafebogota.com', role: UserRole.MANAGER, assignment: KitchenAssignment.NONE },
    { name: 'Carlos Andres Vargas', email: 'carlosandres@colombiancafebogota.com', role: UserRole.WAIT_STAFF, assignment: KitchenAssignment.NONE },
    { name: 'Ana Sofia Herrera', email: 'anasofia@colombiancafebogota.com', role: UserRole.WAIT_STAFF, assignment: KitchenAssignment.NONE },
    { name: 'Luis Fernando Silva', email: 'luisfernando@colombiancafebogota.com', role: UserRole.CASHIER, assignment: KitchenAssignment.NONE },
    { name: 'Camila Rodriguez', email: 'camila@colombiancafebogota.com', role: UserRole.VIEWER, assignment: KitchenAssignment.KITCHEN_READ }
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
    { name: 'Coffee', description: 'Premium Colombian coffee', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Arepas', description: 'Traditional Colombian corn cakes', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Bandeja Paisa', description: 'Traditional Colombian platters', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Soups', description: 'Colombian soups and stews', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Appetizers', description: 'Colombian starters', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Desserts', description: 'Traditional Colombian sweets', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Beverages', description: 'Colombian drinks and juices', isActive: true, createdAt: new Date(), updatedAt: new Date() }
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
    { categoryId: categoryIds['Coffee'], name: 'Cafe Colombiano', description: 'Traditional Colombian coffee', price: 4.99, cost: 1.50, sku: 'CCB-MI-COF-001', barcode: '123456790000', imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop&crop=center', isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
    { categoryId: categoryIds['Coffee'], name: 'Cafe con Leche', description: 'Colombian coffee with milk', price: 5.99, cost: 1.80, sku: 'CCB-MI-COF-002', barcode: '123456790001', imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop&crop=center', isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
    { categoryId: categoryIds['Arepas'], name: 'Arepa con Queso', description: 'Corn cake with cheese', price: 8.99, cost: 3.20, sku: 'CCB-MI-ARE-001', barcode: '123456790002', imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop&crop=center', isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
    { categoryId: categoryIds['Bandeja Paisa'], name: 'Bandeja Paisa', description: 'Traditional Colombian platter with rice, beans, meat, and plantains', price: 22.99, cost: 10.50, sku: 'CCB-MI-BAN-001', barcode: '123456790003', imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop&crop=center', isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
    { categoryId: categoryIds['Soups'], name: 'Ajiaco', description: 'Traditional Colombian chicken and potato soup', price: 16.99, cost: 7.50, sku: 'CCB-MI-SOU-001', barcode: '123456790004', imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop&crop=center', isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
    { categoryId: categoryIds['Beverages'], name: 'Limonada de Coco', description: 'Coconut limeade', price: 6.99, cost: 2.00, sku: 'CCB-MI-BEV-001', barcode: '123456790005', imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop&crop=center', isAvailable: true, createdAt: new Date(), updatedAt: new Date() }
  ].map(item => ({ ...item, businessId }));

  await queryInterface.bulkInsert('menu_items', menuItemData);

  // 5. Create Tables
  const tableData = [
    { tableNumber: 1, capacity: 4, status: 'available', section: 'Main Dining', createdAt: new Date(), updatedAt: new Date() },
    { tableNumber: 2, capacity: 6, status: 'available', section: 'Main Dining', createdAt: new Date(), updatedAt: new Date() },
    { tableNumber: 3, capacity: 2, status: 'available', section: 'Coffee Bar', createdAt: new Date(), updatedAt: new Date() },
    { tableNumber: 4, capacity: 8, status: 'available', section: 'Garden Patio', createdAt: new Date(), updatedAt: new Date() }
  ].map(table => ({ ...table, businessId }));

  await queryInterface.bulkInsert('restaurant_tables', tableData);

  console.log('✅ Colombian Cafe Bogota seeder completed successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - Colombian Cafe Bogota created`);
  console.log(`   - 6 users created`);
  console.log(`   - 7 menu categories created`);
  console.log(`   - 6 menu items created`);
  console.log(`   - 4 tables created`);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  console.log('🗑️ Rolling back Colombian Cafe Bogota seeder...');
  
  await queryInterface.sequelize.query('DELETE FROM restaurant_tables WHERE businessId IN (SELECT id FROM businesses WHERE slug = ?)', {
    replacements: ['colombian-cafe-bogota']
  });
  
  await queryInterface.sequelize.query('DELETE FROM menu_items WHERE businessId IN (SELECT id FROM businesses WHERE slug = ?)', {
    replacements: ['colombian-cafe-bogota']
  });
  
  await queryInterface.sequelize.query('DELETE FROM menu_categories WHERE businessId IN (SELECT id FROM businesses WHERE slug = ?)', {
    replacements: ['colombian-cafe-bogota']
  });
  
  await queryInterface.sequelize.query('DELETE FROM users WHERE businessId IN (SELECT id FROM businesses WHERE slug = ?)', {
    replacements: ['colombian-cafe-bogota']
  });
  
  await queryInterface.sequelize.query('DELETE FROM businesses WHERE slug = ?', {
    replacements: ['colombian-cafe-bogota']
  });

  console.log('✅ Colombian Cafe Bogota seeder rolled back successfully!');
} 