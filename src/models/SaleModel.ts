import { Model, DataTypes, Sequelize } from 'sequelize';

export enum SaleStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export interface SaleAttributes {
  id: number;
  businessId: number;
  userId: number;
  saleNumber: string;
  totalAmount: number;
  currencyId: number; // Required currency relationship
  paymentMethod?: string;
  status: SaleStatus;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  notes?: string;
  idempotencyKey?: string;
  payments?: Array<{
    amount: number;
    method: string;
    customerName?: string;
    customerPhone?: string;
    reference?: string;
    paidAt?: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleCreationAttributes {
  id?: number;
  businessId: number;
  userId: number;
  saleNumber?: string;
  totalAmount: number;
  currencyId: number; // Required currency relationship
  paymentMethod?: string;
  status?: SaleStatus;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  notes?: string;
  idempotencyKey?: string;
  payments?: Array<{
    amount: number;
    method: string;
    customerName?: string;
    customerPhone?: string;
    reference?: string;
    paidAt?: Date;
  }>;
}

export class SaleModel extends Model<SaleAttributes, SaleCreationAttributes> implements SaleAttributes {
  public id!: number;
  public businessId!: number;
  public userId!: number;
  public saleNumber!: string;
  public totalAmount!: number;
  public currencyId!: number; // Required currency relationship
  public paymentMethod?: string;
  public status!: SaleStatus;
  public customerName?: string;
  public customerPhone?: string;
  public customerEmail?: string;
  public notes?: string;
  public idempotencyKey?: string;
  public payments?: Array<{
    amount: number;
    method: string;
    customerName?: string;
    customerPhone?: string;
    reference?: string;
    paidAt?: Date;
  }>;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associations: {
    business: any;
    user: any;
    customer: any;
    saleItems: any;
  };
}

export const initializeSaleModel = (sequelize: Sequelize): void => {
  SaleModel.init(
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
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      saleNumber: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true
        }
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
          min: 0
        }
      },
      currencyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'currencies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      paymentMethod: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('pending', 'completed', 'cancelled', 'refunded'),
        allowNull: false,
        defaultValue: 'pending'
      },
      customerName: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      customerPhone: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      customerEmail: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      idempotencyKey: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true
      },
      payments: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
          const rawValue = this.getDataValue('payments') as string | null;
          return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value: any) {
          this.setDataValue('payments', JSON.stringify(value));
        }
      } as any,
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
    },
    {
      sequelize,
      tableName: 'sales',
      timestamps: true,
      indexes: [
        {
          fields: ['businessId']
        },
        {
          fields: ['userId']
        },
        {
          fields: ['status']
        },
        {
          fields: ['createdAt']
        },
        {
          fields: ['saleNumber'],
          unique: true
        }
      ]
    }
  );
};

export const getSaleModel = () => SaleModel;

export default SaleModel; 