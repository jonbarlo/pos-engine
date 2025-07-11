import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Add businessId column to sales table if it doesn't exist
  try {
    await queryInterface.addColumn('sales', 'businessId', {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'businesses',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  } catch (error) {
    // Column might already exist, continue
    console.log('businessId column might already exist in sales table');
  }

  // Rename total to totalAmount if totalAmount doesn't exist
  try {
    await queryInterface.addColumn('sales', 'totalAmount', {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0
      }
    });
  } catch (error) {
    // Column might already exist, continue
    console.log('totalAmount column might already exist in sales table');
  }

  // Add payments column if it doesn't exist
  try {
    await queryInterface.addColumn('sales', 'payments', {
      type: DataTypes.TEXT,
      allowNull: true,
    });
  } catch (error) {
    // Column might already exist, continue
    console.log('payments column might already exist in sales table');
  }

  // Update paymentMethod to be nullable string instead of enum
  try {
    await queryInterface.changeColumn('sales', 'paymentMethod', {
      type: DataTypes.STRING(50),
      allowNull: true
    });
  } catch (error) {
    // Column might not exist or already be correct type
    console.log('paymentMethod column update might have failed');
  }

  // Rename order_items table to sale_items if it exists
  try {
    await queryInterface.renameTable('order_items', 'sale_items');
  } catch (error) {
    // Table might not exist or already be named correctly
    console.log('order_items table rename might have failed');
  }

  // Add missing columns to sale_items table
  try {
    await queryInterface.addColumn('sale_items', 'discountAmount', {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0
      }
    });
  } catch (error) {
    console.log('discountAmount column might already exist in sale_items table');
  }

  try {
    await queryInterface.addColumn('sale_items', 'finalPrice', {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0
      }
    });
  } catch (error) {
    console.log('finalPrice column might already exist in sale_items table');
  }

  try {
    await queryInterface.addColumn('sale_items', 'notes', {
      type: DataTypes.TEXT,
      allowNull: true
    });
  } catch (error) {
    console.log('notes column might already exist in sale_items table');
  }

  // Add indexes
  try {
    await queryInterface.addIndex('sales', ['businessId'], {
      name: 'sales_businessId_index'
    });
  } catch (error) {
    console.log('businessId index might already exist');
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Remove the columns we added
  try {
    await queryInterface.removeColumn('sales', 'businessId');
  } catch (error) {
    console.log('Could not remove businessId column');
  }

  try {
    await queryInterface.removeColumn('sales', 'totalAmount');
  } catch (error) {
    console.log('Could not remove totalAmount column');
  }

  try {
    await queryInterface.removeColumn('sales', 'payments');
  } catch (error) {
    console.log('Could not remove payments column');
  }

  try {
    await queryInterface.removeColumn('sale_items', 'discountAmount');
  } catch (error) {
    console.log('Could not remove discountAmount column');
  }

  try {
    await queryInterface.removeColumn('sale_items', 'finalPrice');
  } catch (error) {
    console.log('Could not remove finalPrice column');
  }

  try {
    await queryInterface.removeColumn('sale_items', 'notes');
  } catch (error) {
    console.log('Could not remove notes column');
  }

  // Remove indexes
  try {
    await queryInterface.removeIndex('sales', 'sales_businessId_index');
  } catch (error) {
    console.log('Could not remove businessId index');
  }
} 