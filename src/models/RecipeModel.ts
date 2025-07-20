import { Model, DataTypes, Sequelize } from 'sequelize';

export interface RecipeAttributes {
  id?: number;
  businessId: number;
  name: string;
  description?: string;
  ingredients: string;
  instructions: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine: string;
  category: string;
  nutritionInfo?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RecipeCreationAttributes extends Omit<RecipeAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> {
  isActive?: boolean;
}

export class RecipeModel extends Model<RecipeAttributes, RecipeCreationAttributes> implements RecipeAttributes {
  public id!: number;
  public businessId!: number;
  public name!: string;
  public description?: string;
  public ingredients!: string;
  public instructions!: string;
  public prepTime!: number;
  public cookTime!: number;
  public servings!: number;
  public difficulty!: 'easy' | 'medium' | 'hard';
  public cuisine!: string;
  public category!: string;
  public nutritionInfo?: string;
  public imageUrl?: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public getTotalTime(): number {
    return this.prepTime + this.cookTime;
  }

  public getDifficultyLabel(): string {
    switch (this.difficulty) {
      case 'easy': return 'Easy';
      case 'medium': return 'Medium';
      case 'hard': return 'Hard';
      default: return 'Medium';
    }
  }

  public getFormattedPrepTime(): string {
    const hours = Math.floor(this.prepTime / 60);
    const minutes = this.prepTime % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  public getFormattedCookTime(): string {
    const hours = Math.floor(this.cookTime / 60);
    const minutes = this.cookTime % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  // Associations
  public static associations: {
    business: any;
    recipeSuggestions: any;
    promotionItems: any;
  };
}

export function initializeRecipeModel(sequelize: Sequelize): void {
  RecipeModel.init(
    {
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
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          len: [1, 255],
          notEmpty: true,
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      ingredients: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      instructions: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      prepTime: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      cookTime: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      servings: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },
      difficulty: {
        type: DataTypes.ENUM('easy', 'medium', 'hard'),
        allowNull: false,
        defaultValue: 'medium',
        validate: {
          isIn: [['easy', 'medium', 'hard']],
        },
      },
      cuisine: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      nutritionInfo: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      imageUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          isUrl: true,
        },
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
      },
    },
    {
      sequelize,
      tableName: 'recipes',
      timestamps: true,
      indexes: [
        {
          fields: ['businessId', 'isActive'],
        },
        {
          fields: ['businessId', 'difficulty'],
        },
        {
          fields: ['businessId', 'category'],
        },
        {
          fields: ['createdAt'],
        },
      ],
    }
  );
}

export const getRecipeModel = () => RecipeModel;

export default RecipeModel; 