import { Model, DataTypes, Sequelize } from 'sequelize';

export interface CurrencyAttributes {
  id: number;
  code: string;           // ISO 4217 code (USD, CRC)
  name: string;           // Full name (US Dollar, Costa Rican Colón)
  symbol: string;         // Symbol ($, ₡)
  decimalPlaces: number;  // Decimal precision (2 for USD, 2 for CRC)
  isActive: boolean;      // Active status
  isDefault: boolean;     // Default currency flag
  createdAt: Date;
  updatedAt: Date;
}

export interface CurrencyCreationAttributes extends Omit<CurrencyAttributes, 'id' | 'createdAt' | 'updatedAt'> {
  id?: number;
}

export class CurrencyModel extends Model<CurrencyAttributes, CurrencyCreationAttributes> implements CurrencyAttributes {
  public id!: number;
  public code!: string;
  public name!: string;
  public symbol!: string;
  public decimalPlaces!: number;
  public isActive!: boolean;
  public isDefault!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associations: {
    businesses: any;
    items: any;
    sales: any;
    orders: any;
    saleItems: any;
    orderItems: any;
    exchangeRatesFrom: any;
    exchangeRatesTo: any;
  };
}

export const initializeCurrencyModel = (sequelize: Sequelize): void => {
  CurrencyModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      code: {
        type: DataTypes.STRING(3),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [3, 3],
          is: /^[A-Z]{3}$/ // ISO 4217 format
        }
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 100]
        }
      },
      symbol: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 10]
        }
      },
      decimalPlaces: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2,
        validate: {
          min: 0,
          max: 4
        }
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
      tableName: 'currencies',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['code']
        },
        {
          fields: ['isActive']
        },
        {
          fields: ['isDefault']
        }
      ]
    }
  );
};

export const getCurrencyModel = () => CurrencyModel;

export default CurrencyModel; 