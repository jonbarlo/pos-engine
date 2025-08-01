import { QueryInterface, QueryTypes } from 'sequelize';
import { UserRole, KitchenAssignment } from '../../../models/UserModel';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

export async function up(queryInterface: QueryInterface): Promise<void> {
  console.log('🌴🍍 Starting Costa Rican Tropical Grill seeder...');

  // 1. Create Business
  const businessData = {
    name: 'Costa Rican Tropical Grill',
    slug: 'costa-rican-tropical-grill',
    description: 'Fresh tropical Costa Rican cuisine with authentic flavors',
    logo: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop&crop=center',
    primaryColor: '#228B22',
    secondaryColor: '#FFD700',
    address: '789 Tropical Way, Beach District, FL 33102',
    phone: '+1-555-0789',
    email: 'info@costaricantropical.com',
    website: 'https://costaricantropical.com',
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
    { type: QueryTypes.SELECT, replacements: ['costa-rican-tropical-grill'] }
  ) as any[];
  const businessId = business.id;

  // 2. Create Users
  const userData = [
    { name: 'Roberto Jimenez', email: 'roberto@costaricantropical.com', role: UserRole.OWNER, assignment: KitchenAssignment.KITCHEN_MANAGER },
    { name: 'Carmen Vega', email: 'carmen@costaricantropical.com', role: UserRole.MANAGER, assignment: KitchenAssignment.NONE },
    { name: 'Alejandro Mora', email: 'alejandro@costaricantropical.com', role: UserRole.WAIT_STAFF, assignment: KitchenAssignment.NONE },
    { name: 'Isabella Rojas', email: 'isabella@costaricantropical.com', role: UserRole.WAIT_STAFF, assignment: KitchenAssignment.NONE },
    { name: 'Fernando Castro', email: 'fernando@costaricantropical.com', role: UserRole.CASHIER, assignment: KitchenAssignment.NONE },
    { name: 'Valeria Solis', email: 'valeria@costaricantropical.com', role: UserRole.VIEWER, assignment: KitchenAssignment.KITCHEN_READ }
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
    { name: 'Casados', description: 'Traditional Costa Rican plates', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Gallo Pinto', description: 'Traditional rice and beans', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Seafood', description: 'Fresh tropical seafood', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Tropical Fruits', description: 'Fresh tropical fruits', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Appetizers', description: 'Costa Rican starters', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Desserts', description: 'Tropical desserts', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Beverages', description: 'Tropical drinks and juices', isActive: true, createdAt: new Date(), updatedAt: new Date() }
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
    { categoryId: categoryIds['Casados'], name: 'Casado con Carne', description: 'Traditional plate with beef, rice, beans, and plantains', price: 18.99, cost: 8.50, sku: 'CRTG-MI-CAS-001', barcode: '123456791000', imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop&crop=center', isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
    { categoryId: categoryIds['Casados'], name: 'Casado con Pescado', description: 'Traditional plate with fish, rice, beans, and plantains', price: 20.99, cost: 9.20, sku: 'CRTG-MI-CAS-002', barcode: '123456791001', imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop&crop=center', isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
    { categoryId: categoryIds['Gallo Pinto'], name: 'Gallo Pinto', description: 'Traditional rice and beans with eggs', price: 12.99, cost: 5.50, sku: 'CRTG-MI-GAL-001', barcode: '123456791002', imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop&crop=center', isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
    { categoryId: categoryIds['Seafood'], name: 'Ceviche Tico', description: 'Costa Rican-style ceviche with fresh fish', price: 24.99, cost: 11.00, sku: 'CRTG-MI-SEA-001', barcode: '123456791003', imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop&crop=center', isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
    { categoryId: categoryIds['Tropical Fruits'], name: 'Fruit Plate', description: 'Fresh tropical fruit plate with mango, pineapple, and papaya', price: 8.99, cost: 3.50, sku: 'CRTG-MI-FRU-001', barcode: '123456791004', imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop&crop=center', isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
    { categoryId: categoryIds['Beverages'], name: 'Agua de Pipa', description: 'Fresh coconut water', price: 5.99, cost: 1.50, sku: 'CRTG-MI-BEV-001', barcode: '123456791005', imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop&crop=center', isAvailable: true, createdAt: new Date(), updatedAt: new Date() }
  ].map(item => ({ ...item, businessId }));

  await queryInterface.bulkInsert('menu_items', menuItemData);

  // 5. Create Tables
  const tableData = [
    { tableNumber: 1, capacity: 4, status: 'available', section: 'Main Dining', createdAt: new Date(), updatedAt: new Date() },
    { tableNumber: 2, capacity: 6, status: 'available', section: 'Main Dining', createdAt: new Date(), updatedAt: new Date() },
    { tableNumber: 3, capacity: 2, status: 'available', section: 'Tiki Bar', createdAt: new Date(), updatedAt: new Date() },
    { tableNumber: 4, capacity: 8, status: 'available', section: 'Beach Patio', createdAt: new Date(), updatedAt: new Date() }
  ].map(table => ({ ...table, businessId }));

  await queryInterface.bulkInsert('restaurant_tables', tableData);

  console.log('✅ Costa Rican Tropical Grill seeder completed successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - Costa Rican Tropical Grill created`);
  console.log(`   - 6 users created`);
  console.log(`   - 7 menu categories created`);
  console.log(`   - 6 menu items created`);
  console.log(`   - 4 tables created`);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  console.log('🗑️ Rolling back Costa Rican Tropical Grill seeder...');
  
  await queryInterface.sequelize.query('DELETE FROM restaurant_tables WHERE businessId IN (SELECT id FROM businesses WHERE slug = ?)', {
    replacements: ['costa-rican-tropical-grill']
  });
  
  await queryInterface.sequelize.query('DELETE FROM menu_items WHERE businessId IN (SELECT id FROM businesses WHERE slug = ?)', {
    replacements: ['costa-rican-tropical-grill']
  });
  
  await queryInterface.sequelize.query('DELETE FROM menu_categories WHERE businessId IN (SELECT id FROM businesses WHERE slug = ?)', {
    replacements: ['costa-rican-tropical-grill']
  });
  
  await queryInterface.sequelize.query('DELETE FROM users WHERE businessId IN (SELECT id FROM businesses WHERE slug = ?)', {
    replacements: ['costa-rican-tropical-grill']
  });
  
  await queryInterface.sequelize.query('DELETE FROM businesses WHERE slug = ?', {
    replacements: ['costa-rican-tropical-grill']
  });

  console.log('✅ Costa Rican Tropical Grill seeder rolled back successfully!');
} 