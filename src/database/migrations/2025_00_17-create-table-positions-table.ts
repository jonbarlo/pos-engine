import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('table_positions', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tableId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'restaurant_tables',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    floorPlanId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'floor_plans',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    x: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    y: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    rotation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    width: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 80,
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 60,
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
    },
  });

  // Add indexes
  await queryInterface.addIndex('table_positions', ['floorPlanId']);
  await queryInterface.addIndex('table_positions', ['tableId']);
  await queryInterface.addIndex('table_positions', ['tableId', 'floorPlanId'], {
    unique: true,
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('table_positions');
} 