import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('orders', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    businessId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'businesses',
        key: 'id'
      },
    },
    serverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'customers',
        key: 'id'
      },
    },
    orderNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    tableId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'restaurant_tables',
        key: 'id'
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    },
    orderType: {
      type: DataTypes.ENUM('dine_in', 'takeaway', 'delivery'),
      allowNull: false,
      defaultValue: 'dine_in'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    tipAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    specialInstructions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });

  // Add indexes
  await queryInterface.addIndex('orders', ['businessId']);
  await queryInterface.addIndex('orders', ['serverId']);
  await queryInterface.addIndex('orders', ['customerId']);
  await queryInterface.addIndex('orders', ['orderNumber'], { unique: true });
  await queryInterface.addIndex('orders', ['tableId']);
  await queryInterface.addIndex('orders', ['status']);
  await queryInterface.addIndex('orders', ['createdAt']);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('orders');
} 