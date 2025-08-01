import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('promotions', {
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
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
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    conditions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    totalQuantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    usedQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    maxUsesPerCustomer: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    recipeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
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
  await queryInterface.addIndex('promotions', ['businessId', 'isActive']);
  await queryInterface.addIndex('promotions', ['businessId', 'startDate', 'endDate']);
  await queryInterface.addIndex('promotions', ['businessId', 'type']);
  await queryInterface.addIndex('promotions', ['discountType']);
  await queryInterface.addIndex('promotions', ['createdAt']);
  await queryInterface.addIndex('promotions', ['businessId', 'isActive', 'totalQuantity', 'usedQuantity'], {
    name: 'idx_promotions_availability'
  });
  await queryInterface.addIndex('promotions', ['recipeId'], {
    name: 'idx_promotions_recipe'
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('promotions');
} 