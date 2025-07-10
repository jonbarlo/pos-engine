import dotenv from 'dotenv';
import { getSequelize } from '../models/sequelize';
import { initializeAllModels, setupAssociations } from '../models/index';
import {
  BusinessModel,
  UserModel,
  ItemModel,
  SaleModel,
  SaleItemModel,
  ReservationModel,
  TableModel,
  OrderModel,
  OrderItemModel,
  CustomerModel,
  MenuItemModel,
  MenuCategoryModel,
  DeliveryModel,
  KitchenOrderModel
} from '../models/index';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger';
import { generateSku, generateBarcode } from '../utils/skuGenerator';
import { faker } from '@faker-js/faker';

// Load environment variables from .env file
dotenv.config();

// Declare all business* objects as Record<number, any[]>
const businessUsers: Record<number, any[]> = {};
const businessCategories: Record<number, any[]> = {};
const businessMenuItems: Record<number, any[]> = {};
const businessInventoryItems: Record<number, any[]> = {};
const businessCustomers: Record<number, any[]> = {};
const businessTables: Record<number, any[]> = {};

// Real-life business scenarios
const BUSINESSES = [
  {
    name: 'Bella Vista Italian Restaurant',
    slug: 'bella-vista-italian',
    type: 'restaurant' as 'restaurant',
    address: '123 Main Street, Downtown',
    phone: '+1-555-0123',
    email: 'info@bellavista.com',
    website: 'https://bellavista.com',
    timezone: 'America/New_York',
    currency: 'USD',
    taxRate: 0.08,
    isActive: true
  },
  {
    name: 'Sakura Sushi Bar',
    slug: 'sakura-sushi',
    type: 'restaurant' as 'restaurant',
    address: '456 Oak Avenue, Midtown',
    phone: '+1-555-0456',
    email: 'hello@sakurasushi.com',
    website: 'https://sakurasushi.com',
    timezone: 'America/New_York',
    currency: 'USD',
    taxRate: 0.08,
    isActive: true
  },
  {
    name: 'The Coffee Corner',
    slug: 'coffee-corner',
    type: 'restaurant' as 'restaurant',
    address: '789 Pine Street, Westside',
    phone: '+1-555-0789',
    email: 'brew@coffeecorner.com',
    website: 'https://coffeecorner.com',
    timezone: 'America/New_York',
    currency: 'USD',
    taxRate: 0.06,
    isActive: true
  }
];

// Realistic users for each business
const USERS = {
  'bella-vista-italian': [
    { name: 'Marco Rossi', email: 'marco@bellavista.com', role: 'admin', password: 'admin123' },
    { name: 'Sofia Bianchi', email: 'sofia@bellavista.com', role: 'manager', password: 'manager123' },
    { name: 'Giuseppe Romano', email: 'giuseppe@bellavista.com', role: 'cashier', password: 'cashier123' },
    { name: 'Maria Esposito', email: 'maria@bellavista.com', role: 'cashier', password: 'cashier123' },
    { name: 'Antonio Marino', email: 'antonio@bellavista.com', role: 'viewer', password: 'viewer123' }
  ],
  'sakura-sushi': [
    { name: 'Yuki Tanaka', email: 'yuki@sakurasushi.com', role: 'admin', password: 'admin123' },
    { name: 'Kenji Yamamoto', email: 'kenji@sakurasushi.com', role: 'manager', password: 'manager123' },
    { name: 'Aiko Sato', email: 'aiko@sakurasushi.com', role: 'cashier', password: 'cashier123' },
    { name: 'Hiroshi Nakamura', email: 'hiroshi@sakurasushi.com', role: 'viewer', password: 'viewer123' },
    { name: 'Mika Suzuki', email: 'mika@sakurasushi.com', role: 'cashier', password: 'cashier123' }
  ],
  'coffee-corner': [
    { name: 'Sarah Johnson', email: 'sarah@coffeecorner.com', role: 'admin', password: 'admin123' },
    { name: 'Mike Chen', email: 'mike@coffeecorner.com', role: 'manager', password: 'manager123' },
    { name: 'Emma Davis', email: 'emma@coffeecorner.com', role: 'cashier', password: 'cashier123' },
    { name: 'Alex Thompson', email: 'alex@coffeecorner.com', role: 'cashier', password: 'cashier123' }
  ]
};

// Menu categories for each business
const MENU_CATEGORIES = {
  'bella-vista-italian': [
    { name: 'Antipasti', description: 'Appetizers and starters' },
    { name: 'Primi Piatti', description: 'First courses - Pasta and Risotto' },
    { name: 'Secondi Piatti', description: 'Main courses - Meat and Fish' },
    { name: 'Contorni', description: 'Side dishes' },
    { name: 'Dolci', description: 'Desserts' },
    { name: 'Bevande', description: 'Beverages' }
  ],
  'sakura-sushi': [
    { name: 'Appetizers', description: 'Traditional Japanese starters' },
    { name: 'Sushi Rolls', description: 'Maki and specialty rolls' },
    { name: 'Nigiri', description: 'Fresh fish over rice' },
    { name: 'Sashimi', description: 'Fresh sliced fish' },
    { name: 'Hot Dishes', description: 'Cooked entrees' },
    { name: 'Beverages', description: 'Drinks and sake' }
  ],
  'coffee-corner': [
    { name: 'Hot Coffee', description: 'Freshly brewed coffee' },
    { name: 'Cold Coffee', description: 'Iced and blended drinks' },
    { name: 'Tea', description: 'Hot and iced tea' },
    { name: 'Pastries', description: 'Fresh baked goods' },
    { name: 'Sandwiches', description: 'Light meals' },
    { name: 'Snacks', description: 'Quick bites' }
  ]
};

// Menu items for each business
const MENU_ITEMS = {
  'bella-vista-italian': [
    // Antipasti
    { name: 'Bruschetta', description: 'Toasted bread with tomatoes, garlic, and basil', price: 8.99, categoryName: 'Antipasti', stock: 50 },
    { name: 'Caprese Salad', description: 'Fresh mozzarella, tomatoes, and basil', price: 12.99, categoryName: 'Antipasti', stock: 30 },
    { name: 'Calamari Fritti', description: 'Crispy fried calamari with marinara', price: 14.99, categoryName: 'Antipasti', stock: 25 },
    
    // Primi Piatti
    { name: 'Spaghetti Carbonara', description: 'Pasta with eggs, cheese, pancetta, and black pepper', price: 18.99, categoryName: 'Primi Piatti', stock: 40 },
    { name: 'Fettuccine Alfredo', description: 'Pasta with creamy parmesan sauce', price: 16.99, categoryName: 'Primi Piatti', stock: 35 },
    { name: 'Penne Arrabbiata', description: 'Pasta with spicy tomato sauce', price: 15.99, categoryName: 'Primi Piatti', stock: 30 },
    { name: 'Risotto ai Funghi', description: 'Creamy mushroom risotto', price: 19.99, categoryName: 'Primi Piatti', stock: 20 },
    
    // Secondi Piatti
    { name: 'Chicken Marsala', description: 'Chicken in marsala wine sauce with mushrooms', price: 24.99, categoryName: 'Secondi Piatti', stock: 25 },
    { name: 'Veal Piccata', description: 'Veal in lemon and caper sauce', price: 28.99, categoryName: 'Secondi Piatti', stock: 20 },
    { name: 'Salmon alla Griglia', description: 'Grilled salmon with herbs', price: 26.99, categoryName: 'Secondi Piatti', stock: 15 },
    
    // Contorni
    { name: 'Roasted Vegetables', description: 'Seasonal vegetables roasted with herbs', price: 8.99, categoryName: 'Contorni', stock: 30 },
    { name: 'Mashed Potatoes', description: 'Creamy mashed potatoes', price: 6.99, categoryName: 'Contorni', stock: 40 },
    
    // Dolci
    { name: 'Tiramisu', description: 'Classic Italian dessert with coffee and mascarpone', price: 9.99, categoryName: 'Dolci', stock: 20 },
    { name: 'Cannoli', description: 'Crispy shells filled with sweet ricotta', price: 7.99, categoryName: 'Dolci', stock: 25 },
    
    // Bevande
    { name: 'Italian Soda', description: 'Choice of flavored syrups with sparkling water', price: 4.99, categoryName: 'Bevande', stock: 50 },
    { name: 'Espresso', description: 'Single shot of espresso', price: 3.99, categoryName: 'Bevande', stock: 100 }
  ],
  'sakura-sushi': [
    // Appetizers
    { name: 'Edamame', description: 'Steamed soybeans with sea salt', price: 5.99, categoryName: 'Appetizers', stock: 40 },
    { name: 'Miso Soup', description: 'Traditional Japanese soup', price: 4.99, categoryName: 'Appetizers', stock: 50 },
    { name: 'Gyoza', description: 'Pan-fried dumplings', price: 8.99, categoryName: 'Appetizers', stock: 30 },
    
    // Sushi Rolls
    { name: 'California Roll', description: 'Crab, avocado, and cucumber', price: 12.99, categoryName: 'Sushi Rolls', stock: 25 },
    { name: 'Spicy Tuna Roll', description: 'Spicy tuna and cucumber', price: 14.99, categoryName: 'Sushi Rolls', stock: 20 },
    { name: 'Dragon Roll', description: 'Eel, avocado, and cucumber topped with avocado', price: 16.99, categoryName: 'Sushi Rolls', stock: 15 },
    { name: 'Rainbow Roll', description: 'California roll topped with assorted fish', price: 18.99, categoryName: 'Sushi Rolls', stock: 12 },
    
    // Nigiri
    { name: 'Salmon Nigiri', description: 'Fresh salmon over rice', price: 6.99, categoryName: 'Nigiri', stock: 30 },
    { name: 'Tuna Nigiri', description: 'Fresh tuna over rice', price: 7.99, categoryName: 'Nigiri', stock: 25 },
    { name: 'Eel Nigiri', description: 'Grilled eel over rice', price: 8.99, categoryName: 'Nigiri', stock: 20 },
    
    // Sashimi
    { name: 'Salmon Sashimi', description: 'Fresh salmon slices', price: 12.99, categoryName: 'Sashimi', stock: 20 },
    { name: 'Tuna Sashimi', description: 'Fresh tuna slices', price: 14.99, categoryName: 'Sashimi', stock: 18 },
    
    // Hot Dishes
    { name: 'Teriyaki Chicken', description: 'Grilled chicken with teriyaki sauce', price: 16.99, categoryName: 'Hot Dishes', stock: 25 },
    { name: 'Beef Teriyaki', description: 'Grilled beef with teriyaki sauce', price: 19.99, categoryName: 'Hot Dishes', stock: 20 },
    
    // Beverages
    { name: 'Green Tea', description: 'Hot green tea', price: 3.99, categoryName: 'Beverages', stock: 60 },
    { name: 'Sake', description: 'Japanese rice wine', price: 8.99, categoryName: 'Beverages', stock: 30 }
  ],
  'coffee-corner': [
    // Hot Coffee
    { name: 'Espresso', description: 'Single shot of espresso', price: 2.99, categoryName: 'Hot Coffee', stock: 100 },
    { name: 'Cappuccino', description: 'Espresso with steamed milk and foam', price: 4.49, categoryName: 'Hot Coffee', stock: 80 },
    { name: 'Latte', description: 'Espresso with steamed milk', price: 4.99, categoryName: 'Hot Coffee', stock: 75 },
    { name: 'Americano', description: 'Espresso with hot water', price: 3.49, categoryName: 'Hot Coffee', stock: 90 },
    { name: 'Mocha', description: 'Espresso with chocolate and steamed milk', price: 5.49, categoryName: 'Hot Coffee', stock: 60 },
    
    // Cold Coffee
    { name: 'Iced Latte', description: 'Espresso with cold milk over ice', price: 5.49, categoryName: 'Cold Coffee', stock: 50 },
    { name: 'Cold Brew', description: 'Slow-brewed cold coffee', price: 4.99, categoryName: 'Cold Coffee', stock: 40 },
    { name: 'Frappuccino', description: 'Blended coffee drink', price: 6.99, categoryName: 'Cold Coffee', stock: 30 },
    
    // Tea
    { name: 'Earl Grey Tea', description: 'Classic black tea with bergamot', price: 3.49, categoryName: 'Tea', stock: 70 },
    { name: 'Green Tea', description: 'Traditional green tea', price: 3.49, categoryName: 'Tea', stock: 65 },
    { name: 'Chai Latte', description: 'Spiced tea with steamed milk', price: 4.99, categoryName: 'Tea', stock: 45 },
    
    // Pastries
    { name: 'Croissant', description: 'Buttery French pastry', price: 3.99, categoryName: 'Pastries', stock: 40 },
    { name: 'Blueberry Muffin', description: 'Fresh baked muffin with blueberries', price: 3.49, categoryName: 'Pastries', stock: 35 },
    { name: 'Chocolate Chip Cookie', description: 'Warm chocolate chip cookie', price: 2.99, categoryName: 'Pastries', stock: 50 },
    
    // Sandwiches
    { name: 'Turkey & Swiss', description: 'Turkey, Swiss cheese, lettuce, and tomato', price: 8.99, categoryName: 'Sandwiches', stock: 25 },
    { name: 'Ham & Cheddar', description: 'Ham, cheddar cheese, and mustard', price: 7.99, categoryName: 'Sandwiches', stock: 20 },
    
    // Snacks
    { name: 'Mixed Nuts', description: 'Assorted nuts and dried fruits', price: 4.99, categoryName: 'Snacks', stock: 30 },
    { name: 'Granola Bar', description: 'Homemade granola bar', price: 3.49, categoryName: 'Snacks', stock: 40 }
  ]
};

// Realistic inventory items for each business
const INVENTORY_ITEMS = {
  'bella-vista-italian': [
    // Pasta & Grains
    { name: 'Spaghetti', description: 'Premium Italian spaghetti', price: 2.50, cost: 1.20, stock: 50, category: 'Pasta & Grains', unit: 'kg', minStock: 10, maxStock: 100 },
    { name: 'Penne Rigate', description: 'Rigid penne pasta', price: 2.30, cost: 1.10, stock: 45, category: 'Pasta & Grains', unit: 'kg', minStock: 10, maxStock: 100 },
    { name: 'Arborio Rice', description: 'Premium risotto rice', price: 4.50, cost: 2.80, stock: 25, category: 'Pasta & Grains', unit: 'kg', minStock: 5, maxStock: 50 },
    
    // Meat & Seafood
    { name: 'Chicken Breast', description: 'Fresh boneless chicken breast', price: 8.50, cost: 5.20, stock: 30, category: 'Meat & Seafood', unit: 'kg', minStock: 5, maxStock: 60 },
    { name: 'Ground Beef', description: 'Premium ground beef 80/20', price: 7.80, cost: 4.90, stock: 25, category: 'Meat & Seafood', unit: 'kg', minStock: 5, maxStock: 50 },
    { name: 'Salmon Fillet', description: 'Fresh Atlantic salmon', price: 12.50, cost: 8.30, stock: 15, category: 'Meat & Seafood', unit: 'kg', minStock: 3, maxStock: 30 },
    { name: 'Shrimp', description: 'Large peeled shrimp', price: 15.00, cost: 10.50, stock: 20, category: 'Meat & Seafood', unit: 'kg', minStock: 5, maxStock: 40 },
    
    // Dairy & Cheese
    { name: 'Parmesan Cheese', description: 'Aged Parmigiano-Reggiano', price: 18.00, cost: 12.00, stock: 12, category: 'Dairy & Cheese', unit: 'kg', minStock: 2, maxStock: 25 },
    { name: 'Mozzarella', description: 'Fresh mozzarella cheese', price: 6.50, cost: 4.20, stock: 18, category: 'Dairy & Cheese', unit: 'kg', minStock: 3, maxStock: 35 },
    { name: 'Ricotta Cheese', description: 'Fresh ricotta cheese', price: 5.80, cost: 3.80, stock: 15, category: 'Dairy & Cheese', unit: 'kg', minStock: 3, maxStock: 30 },
    { name: 'Heavy Cream', description: 'Heavy whipping cream', price: 4.20, cost: 2.80, stock: 20, category: 'Dairy & Cheese', unit: 'L', minStock: 5, maxStock: 40 },
    
    // Vegetables
    { name: 'Tomatoes', description: 'Fresh Roma tomatoes', price: 3.20, cost: 1.80, stock: 40, category: 'Vegetables', unit: 'kg', minStock: 10, maxStock: 80 },
    { name: 'Basil', description: 'Fresh basil leaves', price: 8.50, cost: 5.50, stock: 8, category: 'Vegetables', unit: 'bunch', minStock: 2, maxStock: 20 },
    { name: 'Spinach', description: 'Fresh baby spinach', price: 4.80, cost: 2.90, stock: 25, category: 'Vegetables', unit: 'kg', minStock: 5, maxStock: 50 },
    { name: 'Mushrooms', description: 'Fresh button mushrooms', price: 5.20, cost: 3.10, stock: 20, category: 'Vegetables', unit: 'kg', minStock: 5, maxStock: 40 },
    { name: 'Onions', description: 'Yellow onions', price: 2.10, cost: 1.20, stock: 35, category: 'Vegetables', unit: 'kg', minStock: 10, maxStock: 70 },
    { name: 'Garlic', description: 'Fresh garlic bulbs', price: 6.50, cost: 4.20, stock: 15, category: 'Vegetables', unit: 'kg', minStock: 3, maxStock: 30 },
    
    // Oils & Condiments
    { name: 'Olive Oil', description: 'Extra virgin olive oil', price: 12.00, cost: 7.50, stock: 25, category: 'Oils & Condiments', unit: 'L', minStock: 5, maxStock: 50 },
    { name: 'Balsamic Vinegar', description: 'Aged balsamic vinegar', price: 15.00, cost: 9.80, stock: 12, category: 'Oils & Condiments', unit: 'L', minStock: 2, maxStock: 25 },
    { name: 'Tomato Sauce', description: 'Marinara sauce base', price: 3.50, cost: 2.10, stock: 30, category: 'Oils & Condiments', unit: 'L', minStock: 5, maxStock: 60 },
    
    // Herbs & Spices
    { name: 'Oregano', description: 'Dried oregano', price: 12.00, cost: 7.80, stock: 8, category: 'Herbs & Spices', unit: 'kg', minStock: 1, maxStock: 15 },
    { name: 'Thyme', description: 'Dried thyme', price: 14.00, cost: 9.20, stock: 6, category: 'Herbs & Spices', unit: 'kg', minStock: 1, maxStock: 12 },
    { name: 'Black Pepper', description: 'Whole black peppercorns', price: 18.00, cost: 12.00, stock: 10, category: 'Herbs & Spices', unit: 'kg', minStock: 2, maxStock: 20 },
    { name: 'Sea Salt', description: 'Fine sea salt', price: 2.50, cost: 1.50, stock: 20, category: 'Herbs & Spices', unit: 'kg', minStock: 5, maxStock: 40 }
  ],
  
  'sakura-sushi': [
    // Fish & Seafood
    { name: 'Tuna', description: 'Fresh yellowfin tuna', price: 25.00, cost: 18.00, stock: 15, category: 'Fish & Seafood', unit: 'kg', minStock: 3, maxStock: 30 },
    { name: 'Salmon', description: 'Fresh Atlantic salmon', price: 22.00, cost: 15.50, stock: 18, category: 'Fish & Seafood', unit: 'kg', minStock: 5, maxStock: 35 },
    { name: 'Yellowtail', description: 'Fresh hamachi', price: 28.00, cost: 20.00, stock: 12, category: 'Fish & Seafood', unit: 'kg', minStock: 2, maxStock: 25 },
    { name: 'Eel', description: 'Unagi eel', price: 32.00, cost: 24.00, stock: 8, category: 'Fish & Seafood', unit: 'kg', minStock: 2, maxStock: 20 },
    { name: 'Shrimp', description: 'Fresh tiger shrimp', price: 18.00, cost: 12.50, stock: 20, category: 'Fish & Seafood', unit: 'kg', minStock: 5, maxStock: 40 },
    { name: 'Scallops', description: 'Fresh sea scallops', price: 35.00, cost: 26.00, stock: 10, category: 'Fish & Seafood', unit: 'kg', minStock: 2, maxStock: 20 },
    
    // Rice & Grains
    { name: 'Sushi Rice', description: 'Premium short-grain rice', price: 4.50, cost: 2.80, stock: 40, category: 'Rice & Grains', unit: 'kg', minStock: 10, maxStock: 80 },
    { name: 'Nori Sheets', description: 'Premium nori for sushi', price: 45.00, cost: 30.00, stock: 50, category: 'Rice & Grains', unit: 'pack', minStock: 10, maxStock: 100 },
    
    // Vegetables
    { name: 'Cucumber', description: 'Fresh cucumbers', price: 2.80, cost: 1.60, stock: 30, category: 'Vegetables', unit: 'kg', minStock: 10, maxStock: 60 },
    { name: 'Avocado', description: 'Fresh Hass avocados', price: 4.50, cost: 2.80, stock: 25, category: 'Vegetables', unit: 'kg', minStock: 5, maxStock: 50 },
    { name: 'Carrots', description: 'Fresh carrots', price: 2.20, cost: 1.30, stock: 35, category: 'Vegetables', unit: 'kg', minStock: 10, maxStock: 70 },
    { name: 'Daikon', description: 'Fresh daikon radish', price: 3.50, cost: 2.20, stock: 20, category: 'Vegetables', unit: 'kg', minStock: 5, maxStock: 40 },
    { name: 'Ginger', description: 'Fresh ginger root', price: 8.00, cost: 5.20, stock: 15, category: 'Vegetables', unit: 'kg', minStock: 3, maxStock: 30 },
    
    // Sauces & Condiments
    { name: 'Soy Sauce', description: 'Premium soy sauce', price: 8.50, cost: 5.50, stock: 25, category: 'Sauces & Condiments', unit: 'L', minStock: 5, maxStock: 50 },
    { name: 'Wasabi', description: 'Fresh wasabi paste', price: 25.00, cost: 18.00, stock: 12, category: 'Sauces & Condiments', unit: 'kg', minStock: 2, maxStock: 25 },
    { name: 'Mirin', description: 'Sweet rice wine', price: 12.00, cost: 7.80, stock: 15, category: 'Sauces & Condiments', unit: 'L', minStock: 3, maxStock: 30 },
    { name: 'Rice Vinegar', description: 'Seasoned rice vinegar', price: 6.50, cost: 4.20, stock: 20, category: 'Sauces & Condiments', unit: 'L', minStock: 5, maxStock: 40 },
    { name: 'Sesame Oil', description: 'Toasted sesame oil', price: 15.00, cost: 10.00, stock: 18, category: 'Sauces & Condiments', unit: 'L', minStock: 3, maxStock: 35 },
    
    // Specialty Items
    { name: 'Tobiko', description: 'Flying fish roe', price: 45.00, cost: 32.00, stock: 8, category: 'Specialty Items', unit: 'kg', minStock: 1, maxStock: 15 },
    { name: 'Masago', description: 'Capelin roe', price: 35.00, cost: 25.00, stock: 10, category: 'Specialty Items', unit: 'kg', minStock: 2, maxStock: 20 },
    { name: 'Tempura Flour', description: 'Tempura batter mix', price: 8.00, cost: 5.20, stock: 15, category: 'Specialty Items', unit: 'kg', minStock: 3, maxStock: 30 }
  ],
  
  'coffee-corner': [
    // Coffee Beans
    { name: 'Arabica Beans', description: 'Premium Arabica coffee beans', price: 12.00, cost: 7.50, stock: 50, category: 'Coffee Beans', unit: 'kg', minStock: 10, maxStock: 100 },
    { name: 'Robusta Beans', description: 'Strong Robusta coffee beans', price: 10.00, cost: 6.20, stock: 40, category: 'Coffee Beans', unit: 'kg', minStock: 10, maxStock: 80 },
    { name: 'Espresso Blend', description: 'Dark roast espresso blend', price: 14.00, cost: 8.80, stock: 35, category: 'Coffee Beans', unit: 'kg', minStock: 8, maxStock: 70 },
    { name: 'Decaf Beans', description: 'Decaffeinated coffee beans', price: 16.00, cost: 10.50, stock: 25, category: 'Coffee Beans', unit: 'kg', minStock: 5, maxStock: 50 },
    
    // Dairy & Milk
    { name: 'Whole Milk', description: 'Fresh whole milk', price: 3.50, cost: 2.20, stock: 40, category: 'Dairy & Milk', unit: 'L', minStock: 10, maxStock: 80 },
    { name: '2% Milk', description: 'Reduced fat milk', price: 3.30, cost: 2.10, stock: 35, category: 'Dairy & Milk', unit: 'L', minStock: 10, maxStock: 70 },
    { name: 'Almond Milk', description: 'Unsweetened almond milk', price: 4.50, cost: 3.20, stock: 30, category: 'Dairy & Milk', unit: 'L', minStock: 8, maxStock: 60 },
    { name: 'Oat Milk', description: 'Barista oat milk', price: 5.00, cost: 3.50, stock: 25, category: 'Dairy & Milk', unit: 'L', minStock: 5, maxStock: 50 },
    { name: 'Heavy Cream', description: 'Heavy whipping cream', price: 4.80, cost: 3.20, stock: 20, category: 'Dairy & Milk', unit: 'L', minStock: 5, maxStock: 40 },
    
    // Syrups & Flavorings
    { name: 'Vanilla Syrup', description: 'Vanilla flavored syrup', price: 8.00, cost: 5.20, stock: 25, category: 'Syrups & Flavorings', unit: 'L', minStock: 5, maxStock: 50 },
    { name: 'Caramel Syrup', description: 'Caramel flavored syrup', price: 8.50, cost: 5.50, stock: 22, category: 'Syrups & Flavorings', unit: 'L', minStock: 5, maxStock: 45 },
    { name: 'Hazelnut Syrup', description: 'Hazelnut flavored syrup', price: 9.00, cost: 5.80, stock: 20, category: 'Syrups & Flavorings', unit: 'L', minStock: 5, maxStock: 40 },
    { name: 'Mocha Syrup', description: 'Chocolate flavored syrup', price: 8.20, cost: 5.30, stock: 18, category: 'Syrups & Flavorings', unit: 'L', minStock: 5, maxStock: 35 },
    { name: 'Pumpkin Spice Syrup', description: 'Seasonal pumpkin spice syrup', price: 10.00, cost: 6.50, stock: 15, category: 'Syrups & Flavorings', unit: 'L', minStock: 3, maxStock: 30 },
    
    // Tea
    { name: 'Black Tea', description: 'Premium black tea leaves', price: 15.00, cost: 9.80, stock: 20, category: 'Tea', unit: 'kg', minStock: 5, maxStock: 40 },
    { name: 'Green Tea', description: 'Japanese green tea', price: 18.00, cost: 12.00, stock: 18, category: 'Tea', unit: 'kg', minStock: 5, maxStock: 35 },
    { name: 'Earl Grey', description: 'Earl Grey tea blend', price: 16.00, cost: 10.50, stock: 15, category: 'Tea', unit: 'kg', minStock: 3, maxStock: 30 },
    { name: 'Chai Spice', description: 'Chai tea spice blend', price: 20.00, cost: 13.50, stock: 12, category: 'Tea', unit: 'kg', minStock: 2, maxStock: 25 },
    
    // Pastry Ingredients
    { name: 'All-Purpose Flour', description: 'Premium all-purpose flour', price: 3.50, cost: 2.20, stock: 30, category: 'Pastry Ingredients', unit: 'kg', minStock: 10, maxStock: 60 },
    { name: 'Butter', description: 'Unsalted butter', price: 6.50, cost: 4.20, stock: 25, category: 'Pastry Ingredients', unit: 'kg', minStock: 5, maxStock: 50 },
    { name: 'Sugar', description: 'Granulated white sugar', price: 2.80, cost: 1.80, stock: 35, category: 'Pastry Ingredients', unit: 'kg', minStock: 10, maxStock: 70 },
    { name: 'Eggs', description: 'Fresh large eggs', price: 4.50, cost: 2.90, stock: 40, category: 'Pastry Ingredients', unit: 'dozen', minStock: 10, maxStock: 80 },
    { name: 'Vanilla Extract', description: 'Pure vanilla extract', price: 25.00, cost: 16.00, stock: 8, category: 'Pastry Ingredients', unit: 'L', minStock: 2, maxStock: 15 },
    
    // Disposables
    { name: 'Coffee Cups', description: '12oz disposable coffee cups', price: 0.15, cost: 0.08, stock: 1000, category: 'Disposables', unit: 'piece', minStock: 200, maxStock: 2000 },
    { name: 'Cup Lids', description: 'Coffee cup lids', price: 0.08, cost: 0.04, stock: 1200, category: 'Disposables', unit: 'piece', minStock: 200, maxStock: 2500 },
    { name: 'Stirrers', description: 'Wooden coffee stirrers', price: 0.02, cost: 0.01, stock: 2000, category: 'Disposables', unit: 'piece', minStock: 500, maxStock: 5000 },
    { name: 'Napkins', description: 'Paper napkins', price: 0.05, cost: 0.03, stock: 800, category: 'Disposables', unit: 'piece', minStock: 200, maxStock: 1500 }
  ]
};

// Realistic customers for each business
const CUSTOMERS = {
  'bella-vista-italian': [
    { name: 'John Smith', email: 'john.smith@email.com', phone: '+1-555-0101', loyaltyPoints: 150, totalSpent: 450.00, visitCount: 8 },
    { name: 'Maria Garcia', email: 'maria.garcia@email.com', phone: '+1-555-0102', loyaltyPoints: 320, totalSpent: 890.00, visitCount: 15 },
    { name: 'Robert Johnson', email: 'robert.johnson@email.com', phone: '+1-555-0103', loyaltyPoints: 75, totalSpent: 220.00, visitCount: 4 },
    { name: 'Lisa Davis', email: 'lisa.davis@email.com', phone: '+1-555-0104', loyaltyPoints: 200, totalSpent: 580.00, visitCount: 10 },
    { name: 'Michael Wilson', email: 'michael.wilson@email.com', phone: '+1-555-0105', loyaltyPoints: 45, totalSpent: 135.00, visitCount: 3 }
  ],
  'sakura-sushi': [
    { name: 'David Brown', email: 'david.brown@email.com', phone: '+1-555-0201', loyaltyPoints: 280, totalSpent: 720.00, visitCount: 12 },
    { name: 'Sarah Miller', email: 'sarah.miller@email.com', phone: '+1-555-0202', loyaltyPoints: 180, totalSpent: 480.00, visitCount: 9 },
    { name: 'James Taylor', email: 'james.taylor@email.com', phone: '+1-555-0203', loyaltyPoints: 95, totalSpent: 260.00, visitCount: 5 },
    { name: 'Jennifer Anderson', email: 'jennifer.anderson@email.com', phone: '+1-555-0204', loyaltyPoints: 150, totalSpent: 380.00, visitCount: 7 },
    { name: 'Christopher Martinez', email: 'christopher.martinez@email.com', phone: '+1-555-0205', loyaltyPoints: 60, totalSpent: 180.00, visitCount: 4 }
  ],
  'coffee-corner': [
    { name: 'Amanda Thompson', email: 'amanda.thompson@email.com', phone: '+1-555-0301', loyaltyPoints: 420, totalSpent: 680.00, visitCount: 25 },
    { name: 'Daniel White', email: 'daniel.white@email.com', phone: '+1-555-0302', loyaltyPoints: 380, totalSpent: 590.00, visitCount: 22 },
    { name: 'Jessica Lee', email: 'jessica.lee@email.com', phone: '+1-555-0303', loyaltyPoints: 250, totalSpent: 420.00, visitCount: 18 },
    { name: 'Matthew Harris', email: 'matthew.harris@email.com', phone: '+1-555-0304', loyaltyPoints: 180, totalSpent: 310.00, visitCount: 12 },
    { name: 'Nicole Clark', email: 'nicole.clark@email.com', phone: '+1-555-0305', loyaltyPoints: 120, totalSpent: 240.00, visitCount: 8 }
  ]
};

// Tables for each business
const TABLES = {
  'bella-vista-italian': [
    { tableNumber: '1', capacity: 2, status: 'available' },
    { tableNumber: '2', capacity: 4, status: 'occupied' },
    { tableNumber: '3', capacity: 6, status: 'available' },
    { tableNumber: '4', capacity: 4, status: 'reserved' },
    { tableNumber: '5', capacity: 8, status: 'available' },
    { tableNumber: '6', capacity: 2, status: 'occupied' },
    { tableNumber: '7', capacity: 4, status: 'available' },
    { tableNumber: '8', capacity: 6, status: 'available' }
  ],
  'sakura-sushi': [
    { tableNumber: '1', capacity: 2, status: 'available' },
    { tableNumber: '2', capacity: 4, status: 'occupied' },
    { tableNumber: '3', capacity: 6, status: 'available' },
    { tableNumber: '4', capacity: 4, status: 'reserved' },
    { tableNumber: '5', capacity: 8, status: 'available' },
    { tableNumber: '6', capacity: 2, status: 'occupied' }
  ],
  'coffee-corner': [
    { tableNumber: '1', capacity: 2, status: 'available' },
    { tableNumber: '2', capacity: 4, status: 'occupied' },
    { tableNumber: '3', capacity: 6, status: 'available' },
    { tableNumber: '4', capacity: 4, status: 'available' },
    { tableNumber: '5', capacity: 2, status: 'occupied' }
  ]
};

// Helper function to guarantee a string
function safeString(val: any): string {
  return typeof val === 'string' ? val : '';
}

function forceString(val: any): string {
  return typeof val === 'string' ? val : '';
}

async function seedDatabase() {
  try {
    logger('🌱 Starting database seeding...');
    
    const sequelize = getSequelize();
    initializeAllModels();
    setupAssociations();
    
    // Sync database
    await sequelize.sync({ force: true });
    logger('✅ Database synced successfully');

    // Create businesses
    const createdBusinesses = [];
    for (const businessData of BUSINESSES) {
      const business = await BusinessModel.create(businessData);
      createdBusinesses.push(business);
      logger(`✅ Created business: ${business.name}`);
    }

    // Create users for each business
    for (const business of createdBusinesses) {
      const users = (USERS as any)[business.slug];
      const createdUsers = [];
      
      for (const userData of users) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = await UserModel.create({
          name: userData.name,
          email: userData.email,
          role: userData.role as any,
          businessId: business.id,
          password: hashedPassword
        });
        createdUsers.push(user);
        logger(`✅ Created user: ${user.name} for ${business.name}`);
      }
      
      businessUsers[business.id] = createdUsers;
    }

    // Create menu categories for each business
    for (const business of createdBusinesses) {
      const categories = (MENU_CATEGORIES as any)[business.slug];
      const createdCategories = [];
      
      for (const categoryData of categories) {
        const category = await MenuCategoryModel.create({
          ...categoryData,
          businessId: business.id,
          isActive: true
        });
        createdCategories.push(category);
        logger(`✅ Created category: ${category.name} for ${business.name}`);
      }
      
      businessCategories[business.id] = createdCategories;
    }

    // Create menu items for each business
    for (const business of createdBusinesses) {
      const items = (MENU_ITEMS as any)[business.slug];
      const createdItems = [];
      let itemCounter = 1;
      const existingSkus = new Set<string>(); // Track SKUs for this business
      const existingBarcodes = new Set<string>(); // Track barcodes for this business
      
      for (const itemData of items) {
        const categories = (businessCategories[business.id] as any[]) || [];
        let category = { id: 0 };
        if (categories && categories.length > 0) {
          const found = categories.find((c: any) => c.name === itemData.categoryName);
          if (found && typeof found.id !== 'undefined') {
            category = found;
          }
        }
        let prefix = '';
        if (business && typeof business.slug === 'string') {
          prefix = business.slug
            .split('-')
            .map((s: string) => (typeof s === 'string' && s.length > 0 ? s?.[0]?.toUpperCase() : ''))
            .join('');
        }
        
        const sku = generateSku(prefix, itemCounter, existingSkus);
        existingSkus.add(sku); // Add to set to prevent future collisions
        
        const barcode = generateBarcode(prefix, itemCounter, existingBarcodes);
        existingBarcodes.add(barcode); // Add to set to prevent future collisions
        
        logger(`🔍 Generating SKU: ${sku} for ${itemData.name} (${business.name})`);
        logger(`🔍 Generating Barcode: ${barcode} for ${itemData.name} (${business.name})`);
        
        const menuItemData = {
          name: itemData.name,
          description: itemData.description,
          price: itemData.price,
          categoryId: category.id,
          businessId: business.id,
          sku: sku,
          barcode: barcode,
          cost: itemData.price * 0.6, // 40% profit margin
          preparationTime: 15,
          isAvailable: true,
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          isSpicy: false
        };
        itemCounter++;
        try {
          const menuItem = await MenuItemModel.create(menuItemData as any);
          createdItems.push(menuItem);
          logger(`✅ Created menu item: ${menuItem.name} for ${business.name}`);
        } catch (error: any) {
          logger(`❌ Failed to create menu item: ${itemData.name}`);
          logger(`❌ Error details: ${error.message}`);
          if (error.errors) {
            error.errors.forEach((err: any) => {
              logger(`❌ Field: ${err.path}, Value: ${err.value}, Message: ${err.message}`);
            });
          }
          throw error;
        }
      }
      businessMenuItems[business.id] = createdItems;
    }

    // Create inventory items for each business
    for (const business of createdBusinesses) {
      const inventoryItems = (INVENTORY_ITEMS as any)[business.slug];
      const createdInventoryItems = [];
      let inventoryCounter = 1;
      const existingInventorySkus = new Set<string>(); // Track SKUs for inventory
      const existingInventoryBarcodes = new Set<string>(); // Track barcodes for inventory
      
      for (const itemData of inventoryItems) {
        let prefix = '';
        if (business && typeof business.slug === 'string') {
          prefix = business.slug
            .split('-')
            .map((s: string) => (typeof s === 'string' && s.length > 0 ? s?.[0]?.toUpperCase() : ''))
            .join('');
        }
        
        const sku = generateSku(prefix + 'INV', inventoryCounter, existingInventorySkus);
        existingInventorySkus.add(sku);
        
        const barcode = generateBarcode(prefix + 'INV', inventoryCounter, existingInventoryBarcodes);
        existingInventoryBarcodes.add(barcode);
        
        logger(`🔍 Generating Inventory SKU: ${sku} for ${itemData.name} (${business.name})`);
        logger(`🔍 Generating Inventory Barcode: ${barcode} for ${itemData.name} (${business.name})`);
        
        const inventoryItemData = {
          name: itemData.name,
          description: itemData.description,
          price: itemData.price,
          cost: itemData.cost,
          stock: itemData.stock,
          category: itemData.category,
          businessId: business.id,
          sku: sku,
          barcode: barcode,
          unit: itemData.unit,
          minStock: itemData.minStock,
          maxStock: itemData.maxStock,
          isActive: true
        };
        inventoryCounter++;
        
        try {
          const inventoryItem = await ItemModel.create(inventoryItemData as any);
          createdInventoryItems.push(inventoryItem);
          logger(`✅ Created inventory item: ${inventoryItem.name} (${inventoryItem.stock} ${inventoryItem.unit}) for ${business.name}`);
        } catch (error: any) {
          logger(`❌ Failed to create inventory item: ${itemData.name}`);
          logger(`❌ Error details: ${error.message}`);
          if (error.errors) {
            error.errors.forEach((err: any) => {
              logger(`❌ Field: ${err.path}, Value: ${err.value}, Message: ${err.message}`);
            });
          }
          throw error;
        }
      }
      businessInventoryItems[business.id] = createdInventoryItems;
    }

    // Create customers for each business
    for (const business of createdBusinesses) {
      const customers = (CUSTOMERS as any)[business.slug];
      const createdCustomers = [];
      
      for (const customerData of customers) {
        const customer = await CustomerModel.create({
          ...customerData,
          businessId: business.id,
          isActive: true
        });
        createdCustomers.push(customer);
        logger(`✅ Created customer: ${customer.name} for ${business.name}`);
      }
      
      businessCustomers[business.id] = createdCustomers;
    }

    // Create tables for each business
    for (const business of createdBusinesses) {
      const tables = (TABLES as any)[business.slug];
      const createdTables = [];
      
      for (const tableData of tables) {
        const table = await TableModel.create({
          ...tableData,
          businessId: business.id,
          isActive: true
        });
        createdTables.push(table);
        logger(`✅ Created table: ${table.tableNumber} for ${business.name}`);
      }
      
      businessTables[business.id] = createdTables;
    }

    // Create sample orders, sales, and reservations
    for (const business of createdBusinesses) {
      const users = businessUsers[business.id] as any[];
      const customers = businessCustomers[business.id] as any[];
      const tables = businessTables[business.id] as any[];
      const menuItems = businessMenuItems[business.id] as any[];
      
      // Create sample orders
      for (let i = 0; i < 15; i++) {
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const server = users.find(u => u.role === 'cashier');
        const table = tables[Math.floor(Math.random() * tables.length)];
        
        // For all possibly undefined string fields, use fallback ''
        const orderNotes = Math.random() > 0.7 ? 'Special instructions for this order' : '';
        const order = await OrderModel.create({
          businessId: business.id,
          customerId: customer.id,
          serverId: server.id,
          tableId: table.id,
          orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          orderType: ['dine_in', 'takeaway', 'delivery'][Math.floor(Math.random() * 3)] as any,
          status: ['pending', 'confirmed', 'in_progress', 'ready', 'completed', 'cancelled'][Math.floor(Math.random() * 6)] as any,
          totalAmount: 0,
          notes: orderNotes
        });

        // Create order items
        const numItems = Math.floor(Math.random() * 4) + 1;
        let totalAmount = 0;
        
                  for (let j = 0; j < numItems; j++) {
            const menuItem = menuItems[Math.floor(Math.random() * menuItems.length)];
            const quantity = Math.floor(Math.random() * 3) + 1;
            const unitPrice = menuItem.price;
            const totalPrice = unitPrice * quantity;
            totalAmount += totalPrice;
            
            // For all possibly undefined notes fields, use ''
            const orderItemNotes = Math.random() > 0.8 ? 'Extra spicy please' : '';
            // In order item creation, use the menu item name
            await OrderItemModel.create({
              orderId: order.id,
              itemId: menuItem.id,
              itemName: menuItem.name,
              quantity,
              unitPrice,
              totalPrice,
              notes: orderItemNotes
            });
          }
        
        // Update order total
        await order.update({ totalAmount });
        logger(`✅ Created order: ${order.orderNumber} for ${business.name}`);
      }

      // Create sample sales
      for (let i = 0; i < 20; i++) {
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const user = users[Math.floor(Math.random() * users.length)];
        
        // For all possibly undefined notes fields, use ''
        const saleNotes = Math.random() > 0.7 ? 'Customer requested receipt' : '';
        const statuses = ['pending', 'completed', 'cancelled', 'refunded'] as const;
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)] || 'pending';
        
        const sale = await SaleModel.create({
          businessId: business.id,
          userId: user.id,
          customerId: customer.id,
          totalAmount: 0.00,
          taxAmount: 0.00,
          discountAmount: Math.random() > 0.8 ? Number((Math.floor(Math.random() * 10) + 5).toFixed(2)) : 0.00,
          finalAmount: 0.00,
          paymentMethod: ['cash', 'card', 'check'][Math.floor(Math.random() * 3)] || 'cash',
          status: randomStatus,
          notes: saleNotes
        });

        // Create sale items
        const numItems = Math.floor(Math.random() * 5) + 1;
        let totalAmount = 0;
        
        for (let j = 0; j < numItems; j++) {
          const menuItem = menuItems[Math.floor(Math.random() * menuItems.length)];
          const quantity = Math.floor(Math.random() * 3) + 1;
          const unitPrice = menuItem.price;
          const totalPrice = unitPrice * quantity;
          totalAmount += totalPrice;
          
          await SaleItemModel.create({
            saleId: sale.id,
            itemId: menuItem.id,
            quantity,
            unitPrice,
            totalPrice: totalPrice,
            discountAmount: 0,
            finalPrice: totalPrice,
            notes: ''
          });
        }
        
        const taxAmount = totalAmount * (business.taxRate || 0.08); // Default 8% tax if not set
        const finalAmount = totalAmount + taxAmount - (sale.discountAmount || 0);
        
        await sale.update({ 
          totalAmount: Number(totalAmount.toFixed(2)), 
          taxAmount: Number(taxAmount.toFixed(2)), 
          finalAmount: Math.max(Number(finalAmount.toFixed(2)), 0)
        });
        logger(`✅ Created sale: ${sale.id} for ${business.name}`);
      }

      // Create sample reservations
      for (let i = 0; i < 8; i++) {
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const table = tables[Math.floor(Math.random() * tables.length)];
        
        const reservationDate = new Date();
        reservationDate.setDate(reservationDate.getDate() + Math.floor(Math.random() * 14) + 1);
        reservationDate.setHours(12 + Math.floor(Math.random() * 8), 0, 0, 0);
        
        // For all possibly undefined notes fields, use ''
        const reservationNotes = Math.random() > 0.7 ? 'Window seat preferred' : '';
        await ReservationModel.create({
          businessId: business.id,
          customerId: customer.id,
          tableId: table.id,
          reservationDate,
          partySize: Math.floor(Math.random() * 6) + 2,
          status: ['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'][Math.floor(Math.random() * 6)] as any,
          notes: reservationNotes,
          customerName: customer.name,
          customerPhone: customer.phone,
          source: 'online',
          reservationTime: '19:00',
          duration: 90
        });
        logger(`✅ Created reservation for ${customer.name} at ${business.name}`);
      }

      // Create sample deliveries
      const usedOrderIds = new Set<number>();
      for (let i = 0; i < 5; i++) {
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const driver = users.find(u => u.role === 'cashier') || users[0];
        // Find a delivery order that hasn't been used yet
        const order = await OrderModel.findOne({
          where: { businessId: business.id, orderType: 'delivery' },
        });
        if (order && !usedOrderIds.has(order.id)) {
          usedOrderIds.add(order.id);
          // For all possibly undefined string fields, use fallback ''
          const customerName = customer?.name || '';
          const customerPhone = customer?.phone || '';
          const trackingNumber = faker.string.alphanumeric(12).toUpperCase();
          await DeliveryModel.create({
            businessId: business.id,
            orderId: order.id,
            customerId: customer.id,
            driverId: driver.id,
            customerName,
            customerPhone,
            deliveryAddress: '123 Delivery Street',
            deliveryCity: 'City',
            deliveryState: 'State',
            deliveryZipCode: '12345',
            deliveryFee: 5.0,
            totalAmount: 20.0,
            paymentMethod: 'cash',
            paymentStatus: 'pending',
            status: ['pending', 'picked_up', 'in_transit', 'delivered', 'cancelled'][Math.floor(Math.random() * 5)] as any,
            trackingNumber
          });
          logger(`✅ Created delivery for ${customer.name} at ${business.name}`);
        }
      }

      // Create sample kitchen orders
      for (let i = 0; i < 10; i++) {
        const chef = users.find(u => u.role === 'chef') || users[0];
        const order = await OrderModel.findOne({
          where: { businessId: business.id }
        });
        
        if (order) {
          // For all possibly undefined order fields
          const orderNumber = order?.orderNumber || '';
          const orderType = order?.orderType || 'dine_in';
          // For all possibly undefined notes fields, use ''
          const kitchenOrderNotes = Math.random() > 0.7 ? 'Extra crispy please' : '';
          await KitchenOrderModel.create({
            businessId: business.id,
            orderId: order.id,
            chefId: chef.id,
            assignedTo: chef.id,
            priority: ['low', 'high', 'urgent', 'normal'][Math.floor(Math.random() * 4)] as any,
            status: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'][Math.floor(Math.random() * 6)] as any,
            estimatedPrepTime: Math.floor(Math.random() * 30) + 15,
            notes: kitchenOrderNotes,
            items: [],
            orderNumber,
            orderType,
            totalItems: Math.floor(Math.random() * 5) + 1,
            completedItems: 0
          });
          logger(`✅ Created kitchen order for ${business.name}`);
        }
      }
    }

    logger('🎉 Database seeding completed successfully!');
    logger('📊 Summary:');
    logger(`   - ${BUSINESSES.length} businesses created`);
    logger(`   - ${Object.values(USERS).flat().length} users created`);
    logger(`   - ${Object.values(MENU_CATEGORIES).flat().length} menu categories created`);
    logger(`   - ${Object.values(MENU_ITEMS).flat().length} menu items created`);
    logger(`   - ${Object.values(CUSTOMERS).flat().length} customers created`);
    logger(`   - ${Object.values(TABLES).flat().length} tables created`);
    logger(`   - Sample orders, sales, reservations, deliveries, and kitchen orders created`);

  } catch (error) {
    logger(`❌ Error seeding database: ${error}`);
    throw error;
  }
}

// Run the seeder
if (require.main === module) {
  seedDatabase()
    .then(() => {
      logger('✅ Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger(`❌ Seeding failed: ${error}`);
      process.exit(1);
    });
}

export { seedDatabase }; 