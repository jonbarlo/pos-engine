import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('tables', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    businessId: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
  await queryInterface.addIndex('tables', ['businessId', 'tableNumber'], { unique: true });
  await queryInterface.addIndex('tables', ['businessId', 'status']);
  await queryInterface.addIndex('tables', ['businessId', 'isActive']);

  // Add foreign key constraint
  await queryInterface.addConstraint('tables', {
    fields: ['businessId'],
    type: 'foreign key',
    name: 'tables_businessId_fkey',
    references: {
      table: 'businesses',
      field: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeConstraint('tables', 'tables_businessId_fkey');
  await queryInterface.dropTable('tables');
} 