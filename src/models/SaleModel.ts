import { Model, DataTypes, Sequelize } from 'sequelize';

export interface SaleAttributes {
  id: number;
  businessId: number;
  userId: number;
  customerId?: number;
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleCreationAttributes extends Omit<SaleAttributes, 'id' | 'createdAt' | 'updatedAt'> {
  // Optional fields for creation
}

export class SaleModel extends Model<SaleAttributes, SaleCreationAttributes> implements SaleAttributes {
  public id!: number;
  public businessId!: number;
  public userId!: number;
  public customerId?: number;
  public totalAmount!: number;
  public taxAmount!: number;
  public discountAmount!: number;
  public finalAmount!: number;
  public paymentMethod!: string;
  public status!: 'pending' | 'completed' | 'cancelled' | 'refunded';
  public notes?: string;
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
      customerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'customers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
          min: 0
        }
      },
      taxAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
          min: 0
        }
      },
      discountAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
          min: 0
        }
      },
      finalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
          min: 0
        }
      },
      paymentMethod: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'cash'
      },
      status: {
        type: DataTypes.ENUM('pending', 'completed', 'cancelled', 'refunded'),
        allowNull: false,
        defaultValue: 'pending'
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
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
          fields: ['customerId']
        },
        {
          fields: ['status']
        },
        {
          fields: ['createdAt']
        }
      ]
    }
  );
};

export const getSaleModel = () => SaleModel;

export default SaleModel; 