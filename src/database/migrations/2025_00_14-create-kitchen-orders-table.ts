import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('kitchen_orders', {
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
    orderNumber: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    tableNumber: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    customerName: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    orderType: {
      type: DataTypes.ENUM('dine_in', 'takeaway', 'delivery'),
      allowNull: false,
      defaultValue: 'dine_in'
    },
    assignedTo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
    },
    chefId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
    },
    assignedToName: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    readyTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    servedTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    allergies: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dietaryRestrictions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    items: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    totalItems: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    completedItems: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('pending', 'preparing', 'ready', 'served', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    },
    priority: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'normal'
    },
    estimatedPrepTime: {
      type: DataTypes.INTEGER, // minutes
      allowNull: true
    },
    actualPrepTime: {
      type: DataTypes.INTEGER, // minutes
      allowNull: true
    },
    specialInstructions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    station: {
      type: DataTypes.STRING(50),
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
  await queryInterface.addIndex('kitchen_orders', ['businessId']);
  await queryInterface.addIndex('kitchen_orders', ['orderId']);
  await queryInterface.addIndex('kitchen_orders', ['assignedTo']);
  await queryInterface.addIndex('kitchen_orders', ['chefId']);
  await queryInterface.addIndex('kitchen_orders', ['status']);
  await queryInterface.addIndex('kitchen_orders', ['priority']);
  await queryInterface.addIndex('kitchen_orders', ['createdAt']);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('kitchen_orders');
} 