import { Model, DataTypes } from 'sequelize';
import { getSequelize } from './sequelize';

export interface RecipeIngredientAttributes {
  id?: number;
  recipeId: number;
  itemId: number;
  quantity: number;
  unit: string;
  isOptional?: boolean;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type RecipeIngredientCreationAttributes = RecipeIngredientAttributes;

export class RecipeIngredientModel extends Model<RecipeIngredientAttributes, RecipeIngredientCreationAttributes> implements RecipeIngredientAttributes {
  public id!: number;
  public recipeId!: number;
  public itemId!: number;
  public quantity!: number;
  public unit!: string;
  public isOptional!: boolean;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RecipeIngredientModel.init(
  {
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
  },
  {
    sequelize: getSequelize(),
    tableName: 'recipe_ingredients',
    timestamps: true,
    indexes: [
      {
        fields: ['recipeId'],
        name: 'IX_recipe_ingredients_recipeId',
      },
      {
        fields: ['itemId'],
        name: 'IX_recipe_ingredients_itemId',
      },
      {
        fields: ['recipeId', 'itemId'],
        name: 'IX_recipe_ingredients_composite',
      },
      {
        fields: ['isOptional'],
        name: 'IX_recipe_ingredients_optional',
      },
    ],
  }
);

export default RecipeIngredientModel; 