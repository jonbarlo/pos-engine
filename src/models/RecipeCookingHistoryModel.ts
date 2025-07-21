import { Model, DataTypes, Sequelize } from 'sequelize';

export interface RecipeCookingHistoryAttributes {
  id?: number;
  recipeId: number;
  businessId: number;
  cookedAt: Date;
  quantity: number;
  consumedItems?: string; // JSON string
  createdPromotionId?: number;
  wasteReduction: number;
  costSavings: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RecipeCookingHistoryCreationAttributes extends Omit<RecipeCookingHistoryAttributes, 'id' | 'createdAt' | 'updatedAt' | 'wasteReduction' | 'costSavings'> {
  wasteReduction?: number;
  costSavings?: number;
}

export interface ConsumedItem {
  itemId: number;
  itemName: string;
  quantityConsumed: number;
  remainingStock: number;
  originalStock: number;
  unitCost: number;
}

export class RecipeCookingHistoryModel extends Model<RecipeCookingHistoryAttributes, RecipeCookingHistoryCreationAttributes> implements RecipeCookingHistoryAttributes {
  public id!: number;
  public recipeId!: number;
  public businessId!: number;
  public cookedAt!: Date;
  public quantity!: number;
  public consumedItems?: string;
  public createdPromotionId?: number;
  public wasteReduction!: number;
  public costSavings!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public getConsumedItemsArray(): ConsumedItem[] {
    if (!this.consumedItems) return [];
    try {
      return JSON.parse(this.consumedItems);
    } catch (error) {
      console.error('Error parsing consumedItems JSON:', error);
      return [];
    }
  }

  public setConsumedItemsArray(items: ConsumedItem[]): void {
    this.consumedItems = JSON.stringify(items);
  }

  public getTotalWasteReduction(): number {
    return this.wasteReduction * this.quantity;
  }

  public getTotalCostSavings(): number {
    return this.costSavings * this.quantity;
  }

  public getFormattedCookedAt(): string {
    return this.cookedAt.toLocaleString();
  }

  public getEfficiencyScore(): number {
    if (this.costSavings === 0) return 0;
    return Math.round((this.wasteReduction / this.costSavings) * 100);
  }

  // Associations
  public static associations: {
    recipe: any;
    business: any;
    promotion: any;
  };
}

export function initializeRecipeCookingHistoryModel(sequelize: Sequelize): void {
  RecipeCookingHistoryModel.init(
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
          min: 1,
        },
      },
      consumedItems: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'JSON array of consumed items with quantities',
      },
      createdPromotionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'promotions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      wasteReduction: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
          min: 0,
        },
        comment: 'Amount of waste reduced in currency',
      },
      costSavings: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
          min: 0,
        },
        comment: 'Cost savings achieved in currency',
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
      sequelize,
      tableName: 'recipe_cooking_history',
      timestamps: true,
      indexes: [
        {
          fields: ['businessId'],
          name: 'idx_recipe_cooking_business',
        },
        {
          fields: ['recipeId'],
          name: 'idx_recipe_cooking_recipe',
        },
        {
          fields: ['cookedAt'],
          name: 'idx_recipe_cooking_date',
        },
        {
          fields: ['businessId', 'cookedAt'],
          name: 'idx_recipe_cooking_business_date',
        },
        {
          fields: ['createdPromotionId'],
          name: 'idx_recipe_cooking_promotion',
        },
      ],
    }
  );
}

export const getRecipeCookingHistoryModel = () => RecipeCookingHistoryModel;

export default RecipeCookingHistoryModel; 