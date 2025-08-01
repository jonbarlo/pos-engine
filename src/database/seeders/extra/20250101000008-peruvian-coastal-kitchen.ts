import { QueryInterface, QueryTypes } from 'sequelize';
import { UserRole, KitchenAssignment } from '../../../models/UserModel';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

export async function up(queryInterface: QueryInterface): Promise<void> {
  console.log('🐟🍋 Starting Peruvian Coastal Kitchen seeder...');

  // 1. Create Business
  const businessData = {
    name: 'Peruvian Coastal Kitchen',
    slug: 'peruvian-coastal-kitchen',
    description: 'Fresh coastal Peruvian cuisine with ceviche and traditional flavors',
    logo: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center',
    primaryColor: '#0066CC',
    secondaryColor: '#FFD700',
    address: '890 Coastal Drive, Marina District, CA 90014',
    phone: '+1-555-0890',
    email: 'info@peruviancoastal.com',
    website: 'https://peruviancoastal.com',
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
    { type: QueryTypes.SELECT, replacements: ['peruvian-coastal-kitchen'] }
  ) as any[];
  const businessId = business.id;

  // 2. Create Users
  const userData = [
    { name: 'Carlos Mendoza', email: 'carlos@peruviancoastal.com', role: UserRole.OWNER, assignment: KitchenAssignment.KITCHEN_MANAGER },
    { name: 'Maria Rodriguez', email: 'maria@peruviancoastal.com', role: UserRole.MANAGER, assignment: KitchenAssignment.NONE },
    { name: 'Jose Torres', email: 'jose@peruviancoastal.com', role: UserRole.WAIT_STAFF, assignment: KitchenAssignment.NONE },
    { name: 'Ana Vargas', email: 'ana@peruviancoastal.com', role: UserRole.WAIT_STAFF, assignment: KitchenAssignment.NONE },
    { name: 'Luis Morales', email: 'luis@peruviancoastal.com', role: UserRole.CASHIER, assignment: KitchenAssignment.NONE },
    { name: 'Carmen Silva', email: 'carmen@peruviancoastal.com', role: UserRole.VIEWER, assignment: KitchenAssignment.KITCHEN_READ }
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
    { name: 'Ceviche', description: 'Fresh seafood ceviche', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Anticuchos', description: 'Grilled skewers', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Main Dishes', description: 'Traditional Peruvian mains', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Rice Dishes', description: 'Peruvian rice specialties', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Appetizers', description: 'Peruvian starters', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Desserts', description: 'Traditional Peruvian sweets', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Beverages', description: 'Peruvian drinks and cocktails', isActive: true, createdAt: new Date(), updatedAt: new Date() }
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
    { categoryId: categoryIds['Ceviche'], name: 'Classic Ceviche', description: 'Fresh fish marinated in lime juice with onions and cilantro', price: 22.99, cost: 10.50, sku: 'PCK-MI-CEV-001', barcode: '123456789800', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center', isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
    { categoryId: categoryIds['Ceviche'], name: 'Shrimp Ceviche', description: 'Fresh shrimp ceviche with avocado', price: 24.99, cost: 11.20, sku: 'PCK-MI-CEV-002', barcode: '123456789801', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center', isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
    { categoryId: categoryIds['Anticuchos'], name: 'Beef Heart Anticuchos', description: 'Grilled beef heart skewers with aji sauce', price: 16.99, cost: 7.50, sku: 'PCK-MI-ANT-001', barcode: '123456789802', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center', isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
    { categoryId: categoryIds['Main Dishes'], name: 'Lomo Saltado', description: 'Stir-fried beef with onions, tomatoes, and fries', price: 19.99, cost: 8.80, sku: 'PCK-MI-MAI-001', barcode: '123456789803', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center', isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
    { categoryId: categoryIds['Rice Dishes'], name: 'Arroz Chaufa', description: 'Peruvian fried rice with chicken and vegetables', price: 15.99, cost: 6.50, sku: 'PCK-MI-RIC-001', barcode: '123456789804', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center', isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
    { categoryId: categoryIds['Beverages'], name: 'Pisco Sour', description: 'Traditional Peruvian cocktail with pisco and lime', price: 12.99, cost: 4.50, sku: 'PCK-MI-BEV-001', barcode: '123456789805', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center', isAvailable: true, createdAt: new Date(), updatedAt: new Date() }
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

  console.log('✅ Peruvian Coastal Kitchen seeder completed successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - Peruvian Coastal Kitchen created`);
  console.log(`   - 6 users created`);
  console.log(`   - 7 menu categories created`);
  console.log(`   - 6 menu items created`);
  console.log(`   - 4 tables created`);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  console.log('🗑️ Rolling back Peruvian Coastal Kitchen seeder...');
  
  await queryInterface.sequelize.query('DELETE FROM restaurant_tables WHERE businessId IN (SELECT id FROM businesses WHERE slug = ?)', {
    replacements: ['peruvian-coastal-kitchen']
  });
  
  await queryInterface.sequelize.query('DELETE FROM menu_items WHERE businessId IN (SELECT id FROM businesses WHERE slug = ?)', {
    replacements: ['peruvian-coastal-kitchen']
  });
  
  await queryInterface.sequelize.query('DELETE FROM menu_categories WHERE businessId IN (SELECT id FROM businesses WHERE slug = ?)', {
    replacements: ['peruvian-coastal-kitchen']
  });
  
  await queryInterface.sequelize.query('DELETE FROM users WHERE businessId IN (SELECT id FROM businesses WHERE slug = ?)', {
    replacements: ['peruvian-coastal-kitchen']
  });
  
  await queryInterface.sequelize.query('DELETE FROM businesses WHERE slug = ?', {
    replacements: ['peruvian-coastal-kitchen']
  });

  console.log('✅ Peruvian Coastal Kitchen seeder rolled back successfully!');
} 