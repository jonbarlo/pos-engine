import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Create sales table
  await queryInterface.createTable('sales', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    businessId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'businesses',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0
      }
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'cancelled', 'refunded'),
      allowNull: false,
      defaultValue: 'pending',
    },
    customerName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    customerPhone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    customerEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    payments: {
      type: DataTypes.TEXT,
      allowNull: true,
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

  // Add index for businessId
  await queryInterface.addIndex('sales', ['businessId'], {
    name: 'sales_businessId_index'
  });

  // Update existing records to use the default business
  await queryInterface.sequelize.query(`
    UPDATE sales SET businessId = 1 WHERE businessId IS NULL;
  `);

  // Create sale_items table (renamed from order_items to match model)
  await queryInterface.createTable('sale_items', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    saleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'sales',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'items',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0
      }
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0
      }
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0
      }
    },
    finalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
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

  // Add businessId column to sale_items table if needed
  await queryInterface.addColumn('sale_items', 'businessId', {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id',
    },
  });

  // Add index for businessId
  await queryInterface.addIndex('sale_items', ['businessId'], {
    name: 'sale_items_businessId_index'
  });

  // Update existing records to use the default business
  await queryInterface.sequelize.query(`
    UPDATE sale_items SET businessId = 1 WHERE businessId IS NULL;
  `);

  // Add indexes for better performance
  await queryInterface.addIndex('sales', ['userId'], {
    name: 'sales_userId_index'
  });
  
  await queryInterface.addIndex('sales', ['status'], {
    name: 'sales_status_index'
  });
  
  await queryInterface.addIndex('sales', ['createdAt'], {
    name: 'sales_createdAt_index'
  });
  
  await queryInterface.addIndex('sale_items', ['saleId'], {
    name: 'sale_items_saleId_index'
  });
  
  await queryInterface.addIndex('sale_items', ['itemId'], {
    name: 'sale_items_itemId_index'
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('sale_items');
  await queryInterface.dropTable('sales');
  await queryInterface.removeIndex('sales', 'sales_businessId_index');
  await queryInterface.removeColumn('sales', 'businessId');
  await queryInterface.removeIndex('sale_items', 'sale_items_businessId_index');
  await queryInterface.removeColumn('sale_items', 'businessId');
} 