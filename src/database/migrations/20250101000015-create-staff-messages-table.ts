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
    recipientId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
    },
    messageType: {
      type: DataTypes.ENUM('general', 'order_update', 'kitchen_alert', 'staff_notice', 'emergency'),
      allowNull: false,
      defaultValue: 'general'
    },
    subject: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    priority: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'normal'
    },
    status: {
      type: DataTypes.ENUM('sent', 'read', 'acknowledged', 'expired'),
      allowNull: false,
      defaultValue: 'sent'
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    readAt: {
      type: DataTypes.DATE,
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
  await queryInterface.addIndex('staff_messages', ['recipientId']);
  await queryInterface.addIndex('staff_messages', ['messageType']);
  await queryInterface.addIndex('staff_messages', ['priority']);
  await queryInterface.addIndex('staff_messages', ['status']);
  await queryInterface.addIndex('staff_messages', ['isRead']);
  await queryInterface.addIndex('staff_messages', ['createdAt']);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('staff_messages');
} 