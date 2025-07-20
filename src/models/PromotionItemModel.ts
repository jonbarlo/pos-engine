import { Model, DataTypes, Sequelize } from 'sequelize';

export interface PromotionItemAttributes {
  id?: number;
  businessId: number;
  promotionId: number;
  itemId?: number;
  recipeId?: number;
  discountType: 'percentage' | 'fixed' | 'free_item' | 'bogo';
  discountValue: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PromotionItemCreationAttributes extends Omit<PromotionItemAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class PromotionItemModel extends Model<PromotionItemAttributes, PromotionItemCreationAttributes> implements PromotionItemAttributes {
  public id!: number;
  public businessId!: number;
  public promotionId!: number;
  public itemId?: number;
  public recipeId?: number;
  public discountType!: 'percentage' | 'fixed' | 'free_item' | 'bogo';
  public discountValue!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public getItemType(): string {
    if (this.itemId) return 'item';
    if (this.recipeId) return 'recipe';
    return 'unknown';
  }

  public getDiscountLabel(): string {
    switch (this.discountType) {
      case 'percentage':
        return `${this.discountValue}% off`;
      case 'fixed':
        return `$${this.discountValue.toFixed(2)} off`;
      case 'free_item':
        return 'Free Item';
      case 'bogo':
        return 'Buy One Get One';
      default:
        return 'Discount';
    }
  }

  public calculateDiscount(itemPrice: number): number {
    switch (this.discountType) {
      case 'percentage':
        return (itemPrice * this.discountValue) / 100;
      case 'fixed':
        return Math.min(this.discountValue, itemPrice);
      case 'free_item':
        return itemPrice; // Full price off for free item
      case 'bogo':
        return itemPrice; // Full price off for BOGO
      default:
        return 0;
    }
  }

  // Associations
  public static associations: {
    business: any;
    promotion: any;
    item: any;
    recipe: any;
  };
}

export function initializePromotionItemModel(sequelize: Sequelize): void {
  PromotionItemModel.init(
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
        validate: {
          isIn: [['percentage', 'fixed', 'free_item', 'bogo']],
        },
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
    },
    {
      sequelize,
      tableName: 'promotion_items',
      timestamps: true,
      indexes: [
        {
          fields: ['businessId'],
        },
        {
          fields: ['promotionId'],
        },
        {
          fields: ['itemId'],
        },
        {
          fields: ['recipeId'],
        },
        {
          fields: ['businessId', 'promotionId'],
        },
        {
          fields: ['businessId', 'itemId'],
        },
        {
          fields: ['businessId', 'recipeId'],
        },
      ],
    }
  );
}

export const getPromotionItemModel = () => PromotionItemModel;

export default PromotionItemModel; 