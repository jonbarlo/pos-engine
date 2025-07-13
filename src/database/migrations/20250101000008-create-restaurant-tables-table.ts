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
    section: {
      type: DataTypes.STRING(50),
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
}


export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('restaurant_tables');
} 