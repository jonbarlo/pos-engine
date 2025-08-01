import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('recipe_ingredients', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    recipeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'recipes',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'items',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    unit: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    isOptional: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    notes: {
      type: DataTypes.STRING(255),
      allowNull: true,
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

  // Add unique constraint to prevent duplicate recipe-ingredient combinations
  await queryInterface.addConstraint('recipe_ingredients', {
    fields: ['recipeId', 'itemId'],
    type: 'unique',
    name: 'UQ_recipe_ingredient',
  });

  // Add indexes for performance
  await queryInterface.addIndex('recipe_ingredients', ['recipeId'], {
    name: 'IX_recipe_ingredients_recipeId',
  });
  await queryInterface.addIndex('recipe_ingredients', ['itemId'], {
    name: 'IX_recipe_ingredients_itemId',
  });
  await queryInterface.addIndex('recipe_ingredients', ['recipeId', 'itemId'], {
    name: 'IX_recipe_ingredients_composite',
  });
  await queryInterface.addIndex('recipe_ingredients', ['isOptional'], {
    name: 'IX_recipe_ingredients_optional',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('recipe_ingredients');
} 