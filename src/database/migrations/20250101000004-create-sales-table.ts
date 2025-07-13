import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('sales', {
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
    },
    saleNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: true,
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
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'customers',
        key: 'id'
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    idempotencyKey: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    payments: {
      type: DataTypes.TEXT,
      allowNull: true,
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
  await queryInterface.addIndex('sales', ['businessId']);
  await queryInterface.addIndex('sales', ['userId']);
  await queryInterface.addIndex('sales', ['status']);
  await queryInterface.addIndex('sales', ['createdAt']);
  await queryInterface.addIndex('sales', ['idempotencyKey'], { unique: true });

  // Add foreign key constraints
  // The foreign key constraints are now defined directly in the column definition
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('sales');
} 