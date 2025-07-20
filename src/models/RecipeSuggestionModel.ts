import { Model, DataTypes, Sequelize } from 'sequelize';

export interface RecipeSuggestionAttributes {
  id?: number;
  businessId: number;
  recipeId: number;
  suggestionType: string;
  reason: string;
  priority: 'low' | 'medium' | 'high';
  targetAudience: string;
  isActive: boolean;
  aiGenerated: boolean;
  confidence?: number;
  suggestedPrice?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RecipeSuggestionCreationAttributes extends Omit<RecipeSuggestionAttributes, 'id' | 'isActive' | 'aiGenerated' | 'createdAt' | 'updatedAt'> {
  isActive?: boolean;
  aiGenerated?: boolean;
}

export class RecipeSuggestionModel extends Model<RecipeSuggestionAttributes, RecipeSuggestionCreationAttributes> implements RecipeSuggestionAttributes {
  public id!: number;
  public businessId!: number;
  public recipeId!: number;
  public suggestionType!: string;
  public reason!: string;
  public priority!: 'low' | 'medium' | 'high';
  public targetAudience!: string;
  public isActive!: boolean;
  public aiGenerated!: boolean;
  public confidence?: number;
  public suggestedPrice?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public getConfidencePercentage(): number {
    return this.confidence ? Math.round(this.confidence * 100) : 0;
  }

  public getConfidenceLabel(): string {
    const percentage = this.getConfidencePercentage();
    if (percentage >= 80) return 'High';
    if (percentage >= 60) return 'Medium';
    if (percentage >= 40) return 'Low';
    return 'Very Low';
  }

  public isHighConfidence(): boolean {
    return this.confidence ? this.confidence >= 0.8 : false;
  }

  public getPriorityLabel(): string {
    switch (this.priority) {
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return 'Medium';
    }
  }

  // Associations
  public static associations: {
    business: any;
    recipe: any;
  };
}

export function initializeRecipeSuggestionModel(sequelize: Sequelize): void {
  RecipeSuggestionModel.init(
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
      recipeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'recipes',
          key: 'id',
        },
      },
      suggestionType: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
        allowNull: false,
        defaultValue: 'medium',
        validate: {
          isIn: [['low', 'medium', 'high']],
        },
      },
      targetAudience: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      aiGenerated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      confidence: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
        validate: {
          min: 0.0,
          max: 1.0,
        },
      },
      suggestedPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
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
    },
    {
      sequelize,
      tableName: 'recipe_suggestions',
      timestamps: true,
      indexes: [
        {
          fields: ['businessId', 'recipeId'],
        },
        {
          fields: ['businessId', 'isActive'],
        },
        {
          fields: ['businessId', 'priority'],
        },
        {
          fields: ['businessId', 'suggestionType'],
        },
        {
          fields: ['aiGenerated'],
        },
        {
          fields: ['confidence'],
        },
        {
          fields: ['createdAt'],
        },
      ],
    }
  );
}

export const getRecipeSuggestionModel = () => RecipeSuggestionModel;

export default RecipeSuggestionModel; 