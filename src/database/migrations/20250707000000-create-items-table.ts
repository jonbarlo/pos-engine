import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('items', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
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
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  // Add indexes for better performance
  await queryInterface.addIndex('items', ['category'], {
    name: 'items_category_index'
  });
  
  await queryInterface.addIndex('items', ['isActive'], {
    name: 'items_isActive_index'
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

  // Create indexes for better performance
  await queryInterface.addIndex('items', ['businessId', 'sku'], {
    unique: true,
    name: 'items_business_sku_unique'
  });
  await queryInterface.addIndex('items', ['businessId', 'barcode'], {
    unique: true,
    name: 'items_business_barcode_unique'
  });

  // Update existing records to use the default business
  await queryInterface.sequelize.query(`
    UPDATE items SET businessId = 1 WHERE businessId IS NULL;
  `);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('items');
  await queryInterface.removeIndex('items', 'items_business_sku_unique');
  await queryInterface.removeIndex('items', 'items_business_barcode_unique');
  await queryInterface.removeColumn('items', 'businessId');
} 