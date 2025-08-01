import { Model, DataTypes, Sequelize } from 'sequelize';

export interface SaleItemAttributes {
  id: number;
  businessId: number;
  saleId: number;
  itemId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
  currencyId: number; // Required currency relationship
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleItemCreationAttributes extends Omit<SaleItemAttributes, 'id' | 'createdAt' | 'updatedAt'> {
  // Optional fields for creation
}

export class SaleItemModel extends Model<SaleItemAttributes, SaleItemCreationAttributes> implements SaleItemAttributes {
  public id!: number;
  public businessId!: number;
  public saleId!: number;
  public itemId!: number;
  public quantity!: number;
  public unitPrice!: number;
  public totalPrice!: number;
  public discountAmount!: number;
  public finalPrice!: number;
  public currencyId!: number;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associations: {
    sale: any;
    item: any;
  };
}

export const initializeSaleItemModel = (sequelize: Sequelize): void => {
  SaleItemModel.init(
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
      saleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'sales',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      itemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'items',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 1
        }
      },
      unitPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
          min: 0
        }
      },
      totalPrice: {
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
      finalPrice: {
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
      tableName: 'sale_items',
      timestamps: true,
      indexes: [
        {
          fields: ['saleId']
        },
        {
          fields: ['itemId']
        }
      ]
    }
  );
};

export const getSaleItemModel = () => SaleItemModel;

export default SaleItemModel; 