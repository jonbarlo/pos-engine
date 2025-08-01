import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('items', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    businessId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'businesses',
        key: 'id'
      },
    },
    currencyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2, // CRC (Costa Rican Colón) - default currency
      references: {
        model: 'currencies',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'General',
    },
    imageUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    sku: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },
    barcode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'piece',
    },
    minStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    maxStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1000,
    },
    // Preparation and dietary fields
    preparationTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 15,
    },
    isVegetarian: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isVegan: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isGlutenFree: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isSpicy: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    allergens: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    nutritionInfo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Inventory management fields
    expirationDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    manufacturingDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    shelfLifeDays: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    lastSoldDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    salesVelocity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00
    },
    daysSinceLastSale: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    isPerishable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    isUnderperforming: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    isExpiringSoon: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  });

  // Add indexes
  await queryInterface.addIndex('items', ['businessId', 'name'], { unique: true });
  await queryInterface.addIndex('items', ['businessId', 'category']);
  await queryInterface.addIndex('items', ['businessId', 'isActive']);
  await queryInterface.addIndex('items', ['sku'], { unique: true });
  await queryInterface.addIndex('items', ['barcode'], { unique: true });
  await queryInterface.addIndex('items', ['currencyId']);
  
  // Add dietary and preparation indexes
  await queryInterface.addIndex('items', ['businessId', 'isVegetarian']);
  await queryInterface.addIndex('items', ['businessId', 'isVegan']);
  await queryInterface.addIndex('items', ['businessId', 'isGlutenFree']);
  await queryInterface.addIndex('items', ['businessId', 'isSpicy']);
  await queryInterface.addIndex('items', ['preparationTime']);
  
  // Add inventory management indexes
  await queryInterface.addIndex('items', ['businessId', 'isPerishable']);
  await queryInterface.addIndex('items', ['businessId', 'isUnderperforming']);
  await queryInterface.addIndex('items', ['businessId', 'isExpiringSoon']);
  await queryInterface.addIndex('items', ['expirationDate']);
  await queryInterface.addIndex('items', ['lastSoldDate']);
  await queryInterface.addIndex('items', ['salesVelocity']);
  
  // Add composite indexes for analytics performance
  await queryInterface.addIndex('items', ['businessId', 'category', 'isActive'], {
    name: 'items_businessId_category_isActive_idx',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('items');
} 