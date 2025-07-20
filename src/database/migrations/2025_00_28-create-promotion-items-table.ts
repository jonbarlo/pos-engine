import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('promotion_items', {
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
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    promotionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'promotions',
        key: 'id',
      },
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'items',
        key: 'id',
      },
    },
    recipeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'recipes',
        key: 'id',
      },
    },
    discountType: {
      type: DataTypes.ENUM('percentage', 'fixed', 'free_item', 'bogo'),
      allowNull: false,
      defaultValue: 'percentage',
    },
    discountValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
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

  // Add indexes for performance
  await queryInterface.addIndex('promotion_items', ['businessId']);
  await queryInterface.addIndex('promotion_items', ['promotionId']);
  await queryInterface.addIndex('promotion_items', ['itemId']);
  await queryInterface.addIndex('promotion_items', ['recipeId']);
  await queryInterface.addIndex('promotion_items', ['businessId', 'promotionId']);
  await queryInterface.addIndex('promotion_items', ['businessId', 'itemId']);
  await queryInterface.addIndex('promotion_items', ['businessId', 'recipeId']);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('promotion_items');
} 