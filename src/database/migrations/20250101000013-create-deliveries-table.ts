import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('deliveries', {
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
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'orders',
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
    driverId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
    },
    trackingNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true
    },
    deliveryAddress: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    deliveryInstructions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    estimatedDeliveryTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    actualDeliveryTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    },
    deliveryFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    tipAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
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
  await queryInterface.addIndex('deliveries', ['businessId']);
  await queryInterface.addIndex('deliveries', ['orderId']);
  await queryInterface.addIndex('deliveries', ['customerId']);
  await queryInterface.addIndex('deliveries', ['driverId']);
  await queryInterface.addIndex('deliveries', ['status']);
  await queryInterface.addIndex('deliveries', ['estimatedDeliveryTime']);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('deliveries');
} 