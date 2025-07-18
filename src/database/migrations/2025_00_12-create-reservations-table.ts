import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('reservations', {
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
    tableId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'restaurant_tables',
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
    customerName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    customerPhone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    customerEmail: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    partySize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    reservationDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    reservationTime: {
      type: DataTypes.STRING(5),
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 90
    },
    source: {
      type: DataTypes.ENUM('phone', 'online', 'walk_in', 'third_party'),
      allowNull: false,
      defaultValue: 'phone'
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'),
      allowNull: false,
      defaultValue: 'pending'
    },
    specialRequests: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    confirmedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    seatedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancelledBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    cancellationReason: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
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
  await queryInterface.addIndex('reservations', ['businessId']);
  await queryInterface.addIndex('reservations', ['tableId']);
  await queryInterface.addIndex('reservations', ['customerId']);
  await queryInterface.addIndex('reservations', ['reservationDate']);
  await queryInterface.addIndex('reservations', ['status']);
  await queryInterface.addIndex('reservations', ['source']);
  await queryInterface.addIndex('reservations', ['isActive']);
  await queryInterface.addIndex('reservations', ['customerPhone']);
  await queryInterface.addIndex('reservations', ['customerEmail']);
  await queryInterface.addIndex('reservations', ['reservationDate', 'reservationTime']);
  
  // Composite indexes for common queries
  await queryInterface.addIndex('reservations', ['businessId', 'reservationDate']);
  await queryInterface.addIndex('reservations', ['businessId', 'status']);
  await queryInterface.addIndex('reservations', ['tableId', 'reservationDate']);
  await queryInterface.addIndex('reservations', ['businessId', 'customerId']);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('reservations');
} 