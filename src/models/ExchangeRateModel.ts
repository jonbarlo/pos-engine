import { Model, DataTypes, Sequelize } from 'sequelize';

export interface ExchangeRateAttributes {
  id: number;
  fromCurrencyId: number;  // Source currency
  toCurrencyId: number;    // Target currency
  rate: number;           // Conversion rate
  effectiveDate: Date;    // Rate validity date
  isActive: boolean;      // Active status
  createdAt: Date;
  updatedAt: Date;
}

export interface ExchangeRateCreationAttributes extends Omit<ExchangeRateAttributes, 'id' | 'createdAt' | 'updatedAt'> {
  id?: number;
}

export class ExchangeRateModel extends Model<ExchangeRateAttributes, ExchangeRateCreationAttributes> implements ExchangeRateAttributes {
  public id!: number;
  public fromCurrencyId!: number;
  public toCurrencyId!: number;
  public rate!: number;
  public effectiveDate!: Date;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associations: {
    fromCurrency: any;
    toCurrency: any;
  };
}

export const initializeExchangeRateModel = (sequelize: Sequelize): void => {
  ExchangeRateModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      fromCurrencyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'currencies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      toCurrencyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'currencies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      rate: {
        type: DataTypes.DECIMAL(15, 6),
        allowNull: false,
        validate: {
          min: 0.000001 // Minimum positive rate
        }
      },
      effectiveDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
      tableName: 'exchange_rates',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['fromCurrencyId', 'toCurrencyId', 'effectiveDate']
        },
        {
          fields: ['fromCurrencyId']
        },
        {
          fields: ['toCurrencyId']
        },
        {
          fields: ['isActive']
        },
        {
          fields: ['effectiveDate']
        }
      ]
    }
  );
};

export const getExchangeRateModel = () => ExchangeRateModel;

export default ExchangeRateModel; 