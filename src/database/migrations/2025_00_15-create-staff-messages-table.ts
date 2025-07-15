import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('staff_messages', {
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
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
    },
    senderName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    messageType: {
      type: DataTypes.ENUM('announcement', 'inventory_alert', 'promotion', 'discount', 'urgent', 'general', 'order_update', 'kitchen_alert', 'staff_notice', 'emergency', 'maintenance', 'training'),
      allowNull: false,
      defaultValue: 'general'
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    recipientType: {
      type: DataTypes.ENUM('all', 'waitstaff', 'kitchen', 'managers', 'specific_users', 'cashiers', 'drivers', 'hosts', 'bartenders'),
      allowNull: false,
      defaultValue: 'all'
    },
    recipientIds: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('sent', 'read', 'acknowledged', 'expired'),
      allowNull: false,
      defaultValue: 'sent'
    },
    priority: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'normal'
    },
    readBy: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    acknowledgedBy: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    expiresAt: {
      type: DataTypes.DATE,
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
  await queryInterface.addIndex('staff_messages', ['businessId']);
  await queryInterface.addIndex('staff_messages', ['senderId']);

  await queryInterface.addIndex('staff_messages', ['messageType']);
  await queryInterface.addIndex('staff_messages', ['priority']);
  await queryInterface.addIndex('staff_messages', ['status']);
  await queryInterface.addIndex('staff_messages', ['isRead']);
  await queryInterface.addIndex('staff_messages', ['createdAt']);
  await queryInterface.addIndex('staff_messages', ['expiresAt']);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('staff_messages');
} 