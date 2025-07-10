import { Model, DataTypes, Sequelize } from 'sequelize';

export enum SplitType {
  EQUAL = 'equal',
  ITEM_BASED = 'item_based',
  CUSTOM = 'custom',
  PERCENTAGE = 'percentage'
}

export enum SplitStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface SplitBillingAttributes {
  id: number;
  orderId: number;
  businessId: number;
  splitType: SplitType;
  status: SplitStatus;
  totalAmount: number;
  numberOfSplits: number;
  description?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SplitBillingCreationAttributes {
  id?: number;
  orderId: number;
  businessId: number;
  splitType: SplitType;
  status?: SplitStatus;
  totalAmount: number;
  numberOfSplits: number;
  description?: string;
  notes?: string;
}

export class SplitBillingModel extends Model<SplitBillingAttributes, SplitBillingCreationAttributes> implements SplitBillingAttributes {
  public id!: number;
  public orderId!: number;
  public businessId!: number;
  public splitType!: SplitType;
  public status!: SplitStatus;
  public totalAmount!: number;
  public numberOfSplits!: number;
  public description?: string;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associations: {
    order: any;
    business: any;
    splitDetails: any;
  };
}

export const initializeSplitBillingModel = (sequelize: Sequelize): void => {
  SplitBillingModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id',
        },
      },
      businessId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'businesses',
          key: 'id',
        },
      },
      splitType: {
        type: DataTypes.ENUM(...Object.values(SplitType)),
        allowNull: false,
        validate: {
          isIn: [Object.values(SplitType)],
        },
      },
      status: {
        type: DataTypes.ENUM(...Object.values(SplitStatus)),
        allowNull: false,
        defaultValue: SplitStatus.PENDING,
        validate: {
          isIn: [Object.values(SplitStatus)],
        },
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      numberOfSplits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 2,
          max: 20,
        },
      },
      description: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
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
      sequelize,
      tableName: 'split_billings',
      timestamps: true,
      indexes: [
        {
          fields: ['orderId'],
        },
        {
          fields: ['businessId'],
        },
        {
          fields: ['orderId', 'status'],
        },
        {
          fields: ['splitType'],
        },
        {
          fields: ['createdAt'],
        },
      ],
    }
  );
};

export const getSplitBillingModel = () => SplitBillingModel;

export default SplitBillingModel; 