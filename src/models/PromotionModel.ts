import { Model, DataTypes, Sequelize } from 'sequelize';

export interface PromotionAttributes {
  id?: number;
  businessId: number;
  name: string;
  description?: string;
  type: string;
  discountType: 'percentage' | 'fixed' | 'free_item' | 'bogo';
  discountValue: number;
  startDate: Date;
  endDate: Date;
  conditions?: string;
  isActive: boolean;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PromotionCreationAttributes extends Omit<PromotionAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> {
  isActive?: boolean;
}

export class PromotionModel extends Model<PromotionAttributes, PromotionCreationAttributes> implements PromotionAttributes {
  public id!: number;
  public businessId!: number;
  public name!: string;
  public description?: string;
  public type!: string;
  public discountType!: 'percentage' | 'fixed' | 'free_item' | 'bogo';
  public discountValue!: number;
  public startDate!: Date;
  public endDate!: Date;
  public conditions?: string;
  public isActive!: boolean;
  public imageUrl?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public isCurrentlyActive(): boolean {
    const now = new Date();
    return this.isActive && now >= this.startDate && now <= this.endDate;
  }

  public getDaysRemaining(): number {
    const now = new Date();
    const end = new Date(this.endDate);
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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

  public calculateDiscount(orderTotal: number): number {
    switch (this.discountType) {
      case 'percentage':
        return (orderTotal * this.discountValue) / 100;
      case 'fixed':
        return Math.min(this.discountValue, orderTotal);
      case 'free_item':
      case 'bogo':
        // For free item and BOGO, we'll need to know the item price
        return 0; // This will be calculated per item
      default:
        return 0;
    }
  }

  public getStatus(): string {
    if (!this.isActive) return 'Inactive';
    if (new Date() < this.startDate) return 'Scheduled';
    if (new Date() > this.endDate) return 'Expired';
    return 'Active';
  }

  public getConditions(): any {
    try {
      return this.conditions ? JSON.parse(this.conditions) : {};
    } catch {
      return {};
    }
  }

  // Associations
  public static associations: {
    business: any;
    promotionItems: any;
  };
}

export function initializePromotionModel(sequelize: Sequelize): void {
  PromotionModel.init(
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
      type: {
        type: DataTypes.STRING(50),
        allowNull: false,
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
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: true,
        },
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: true,
          isAfterStartDate(value: any) {
            if (value && this.startDate && new Date(value) <= new Date(this.startDate as Date)) {
              throw new Error('End date must be after start date');
            }
          },
        },
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
        validate: {
          isUrl: true,
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
      tableName: 'promotions',
      timestamps: true,
      indexes: [
        {
          fields: ['businessId', 'isActive'],
        },
        {
          fields: ['businessId', 'startDate', 'endDate'],
        },
        {
          fields: ['businessId', 'type'],
        },
        {
          fields: ['discountType'],
        },
        {
          fields: ['createdAt'],
        },
      ],
    }
  );
}

export const getPromotionModel = () => PromotionModel;

export default PromotionModel; 