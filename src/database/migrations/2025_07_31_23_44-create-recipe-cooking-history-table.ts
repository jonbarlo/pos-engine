import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Check if table already exists
  const tableExists = await queryInterface.showAllTables();
  if (tableExists.includes('recipe_cooking_history')) {
    console.log('Table recipe_cooking_history already exists, skipping creation');
    return;
  }
  
  // Create recipe_cooking_history table only
  await queryInterface.createTable('recipe_cooking_history', {
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
        key: 'id'
      },
    },
    businessId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'businesses',
        key: 'id'
      },
    },
    cookedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    consumedItems: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    createdPromotionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'promotions',
        key: 'id'
      }
    },
    wasteReduction: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    costSavings: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
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

  // Add performance indexes
  await queryInterface.addIndex('recipe_cooking_history', ['businessId'], {
    name: 'idx_recipe_cooking_business'
  });

  await queryInterface.addIndex('recipe_cooking_history', ['recipeId'], {
    name: 'idx_recipe_cooking_recipe'
  });

  await queryInterface.addIndex('recipe_cooking_history', ['cookedAt'], {
    name: 'idx_recipe_cooking_date'
  });

  await queryInterface.addIndex('recipe_cooking_history', ['businessId', 'cookedAt'], {
    name: 'idx_recipe_cooking_business_date'
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Remove indexes
  await queryInterface.removeIndex('recipe_cooking_history', 'idx_recipe_cooking_business');
  await queryInterface.removeIndex('recipe_cooking_history', 'idx_recipe_cooking_recipe');
  await queryInterface.removeIndex('recipe_cooking_history', 'idx_recipe_cooking_date');
  await queryInterface.removeIndex('recipe_cooking_history', 'idx_recipe_cooking_business_date');

  // Drop recipe_cooking_history table
  await queryInterface.dropTable('recipe_cooking_history');
} 