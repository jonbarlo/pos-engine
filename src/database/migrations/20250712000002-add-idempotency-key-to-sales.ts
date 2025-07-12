import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.addColumn('sales', 'idempotencyKey', {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true
  });

  // Add index for better performance on idempotencyKey lookups
  await queryInterface.addIndex('sales', ['idempotencyKey'], {
    name: 'idx_sales_idempotency_key'
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex('sales', 'idx_sales_idempotency_key');
  await queryInterface.removeColumn('sales', 'idempotencyKey');
} 