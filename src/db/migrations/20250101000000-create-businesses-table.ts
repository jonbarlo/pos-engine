import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  // Create businesses table
  await queryInterface.createTable('businesses', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    logo: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    primaryColor: {
      type: DataTypes.STRING(7),
      allowNull: true,
    },
    secondaryColor: {
      type: DataTypes.STRING(7),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    taxRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'USD',
    },
    timezone: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'UTC',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    },
  });

  // Add businessId column to users table
  await queryInterface.addColumn('users', 'businessId', {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id',
    },
  });

  // Add role column to users table
  await queryInterface.addColumn('users', 'role', {
    type: DataTypes.ENUM('owner', 'manager', 'cashier', 'viewer'),
    allowNull: false,
    defaultValue: 'cashier',
  });

  // Add isActive column to users table
  await queryInterface.addColumn('users', 'isActive', {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  });

  // Add businessId column to items table
  await queryInterface.addColumn('items', 'businessId', {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id',
    },
  });

  // Add businessId column to sales table
  await queryInterface.addColumn('sales', 'businessId', {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id',
    },
  });

  // Add businessId column to order_items table
  await queryInterface.addColumn('order_items', 'businessId', {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id',
    },
  });

  // Create indexes for better performance
  await queryInterface.addIndex('users', ['businessId', 'email'], {
    unique: true,
    name: 'users_business_email_unique'
  });

  await queryInterface.addIndex('items', ['businessId', 'sku'], {
    unique: true,
    name: 'items_business_sku_unique'
  });

  await queryInterface.addIndex('items', ['businessId', 'barcode'], {
    unique: true,
    name: 'items_business_barcode_unique'
  });

  // Insert a default business for existing data
  await queryInterface.bulkInsert('businesses', [{
    id: 1,
    name: 'Default Business',
    slug: 'default-business',
    description: 'Default business for existing data',
    taxRate: 0,
    currency: 'USD',
    timezone: 'UTC',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }]);

  // Update existing records to use the default business
  await queryInterface.sequelize.query(`
    UPDATE users SET businessId = 1 WHERE businessId IS NULL;
    UPDATE items SET businessId = 1 WHERE businessId IS NULL;
    UPDATE sales SET businessId = 1 WHERE businessId IS NULL;
    UPDATE order_items SET businessId = 1 WHERE businessId IS NULL;
  `);
}

export async function down(queryInterface: QueryInterface) {
  // Remove indexes
  await queryInterface.removeIndex('users', 'users_business_email_unique');
  await queryInterface.removeIndex('items', 'items_business_sku_unique');
  await queryInterface.removeIndex('items', 'items_business_barcode_unique');

  // Remove businessId columns
  await queryInterface.removeColumn('order_items', 'businessId');
  await queryInterface.removeColumn('sales', 'businessId');
  await queryInterface.removeColumn('items', 'businessId');
  await queryInterface.removeColumn('users', 'isActive');
  await queryInterface.removeColumn('users', 'role');
  await queryInterface.removeColumn('users', 'businessId');

  // Drop businesses table
  await queryInterface.dropTable('businesses');
} 