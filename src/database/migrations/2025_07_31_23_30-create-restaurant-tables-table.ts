import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('restaurant_tables', {
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
    tableNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 4,
    },
    partySize: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    currentOrderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    serverId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
    },
    section: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    customerName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('available', 'occupied', 'reserved', 'cleaning', 'out_of_service'),
      allowNull: false,
      defaultValue: 'available',
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
    }
  });

  // Add indexes
  await queryInterface.addIndex('restaurant_tables', ['businessId', 'tableNumber'], { unique: true });
  await queryInterface.addIndex('restaurant_tables', ['businessId', 'status']);
  await queryInterface.addIndex('restaurant_tables', ['businessId', 'isActive']);
  await queryInterface.addIndex('restaurant_tables', ['businessId', 'serverId']);
  await queryInterface.addIndex('restaurant_tables', ['currentOrderId']);

  // Add foreign key constraint for currentOrderId (after table creation to avoid circular dependency)
  try {
    await queryInterface.addConstraint('restaurant_tables', {
      fields: ['currentOrderId'],
      type: 'foreign key',
      name: 'restaurant_tables_currentOrderId_fkey',
      references: {
        table: 'orders',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  } catch (error) {
    // If orders table doesn't exist yet, skip the constraint (it will be added later)
    console.log('Orders table not found, skipping currentOrderId foreign key constraint');
  }
}


export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('restaurant_tables');
} 