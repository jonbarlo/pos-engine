import { Model, DataTypes, Sequelize } from 'sequelize';

export enum SplitDetailStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled'
}

export interface SplitBillingDetailAttributes {
  id: number;
  splitBillingId: number;
  customerName?: string;
  customerPhone?: string;
  splitAmount: number;
  splitPercentage?: number;
  items?: string;
  status: SplitDetailStatus;
  notes?: string;
  paymentMethod?: string;
  paymentReference?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SplitBillingDetailCreationAttributes {
  id?: number;
  splitBillingId: number;
  customerName?: string;
  customerPhone?: string;
  splitAmount: number;
  splitPercentage?: number;
  items?: string;
  status?: SplitDetailStatus;
  notes?: string;
  paymentMethod?: string;
  paymentReference?: string;
  paidAt?: Date;
}

export class SplitBillingDetailModel extends Model<SplitBillingDetailAttributes, SplitBillingDetailCreationAttributes> implements SplitBillingDetailAttributes {
  public id!: number;
  public splitBillingId!: number;
  public customerName?: string;
  public customerPhone?: string;
  public splitAmount!: number;
  public splitPercentage?: number;
  public items?: string;
  public status!: SplitDetailStatus;
  public notes?: string;
  public paymentMethod?: string;
  public paymentReference?: string;
  public paidAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associations: {
    splitBilling: any;
  };
}

export const initializeSplitBillingDetailModel = (sequelize: Sequelize): void => {
  SplitBillingDetailModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      splitBillingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'split_billings',
          key: 'id',
        },
      },
      customerName: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      customerPhone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      splitAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      splitPercentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        validate: {
          min: 0,
          max: 100,
        },
      },
      items: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'JSON string of items assigned to this split',
      },
      status: {
        type: DataTypes.ENUM(...Object.values(SplitDetailStatus)),
        allowNull: false,
        defaultValue: SplitDetailStatus.PENDING,
        validate: {
          isIn: [Object.values(SplitDetailStatus)],
        },
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      paymentMethod: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      paymentReference: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      paidAt: {
        type: DataTypes.DATE,
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
      tableName: 'split_billing_details',
      timestamps: true,
      indexes: [
        {
          fields: ['splitBillingId'],
        },
        {
          fields: ['splitBillingId', 'status'],
        },
        {
          fields: ['customerName'],
        },
        {
          fields: ['customerPhone'],
        },
        {
          fields: ['status'],
        },
        {
          fields: ['paidAt'],
        },
      ],
    }
  );
};

export const getSplitBillingDetailModel = () => SplitBillingDetailModel;

export default SplitBillingDetailModel; 