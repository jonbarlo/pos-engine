import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('exchange_rates', {
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
    },
    effectiveDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
  });

  // Create indexes
  await queryInterface.addIndex('exchange_rates', ['fromCurrencyId', 'toCurrencyId', 'effectiveDate'], {
    unique: true,
    name: 'exchange_rates_unique_rate'
  });

  await queryInterface.addIndex('exchange_rates', ['fromCurrencyId'], {
    name: 'exchange_rates_fromCurrencyId_index'
  });

  await queryInterface.addIndex('exchange_rates', ['toCurrencyId'], {
    name: 'exchange_rates_toCurrencyId_index'
  });

  await queryInterface.addIndex('exchange_rates', ['isActive'], {
    name: 'exchange_rates_isActive_index'
  });

  await queryInterface.addIndex('exchange_rates', ['effectiveDate'], {
    name: 'exchange_rates_effectiveDate_index'
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('exchange_rates');
} 