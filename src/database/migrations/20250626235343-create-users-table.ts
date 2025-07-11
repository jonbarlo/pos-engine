import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('users', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [6, 255]
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'owner', 'manager', 'cashier', 'viewer'),
      allowNull: false,
      defaultValue: 'cashier',
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  // Add businessId column to users table
  await queryInterface.addColumn('users', 'businessId', {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id',
    },
  });

  // Add isActive column to users table
  await queryInterface.addColumn('users', 'isActive', {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  });

  // Create index for better performance
  await queryInterface.addIndex('users', ['businessId', 'email'], {
    unique: true,
    name: 'users_business_email_unique'
  });

  // Update existing records to use the default business
  await queryInterface.sequelize.query(`
    UPDATE users SET businessId = 1 WHERE businessId IS NULL;
  `);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('users');
  await queryInterface.removeIndex('users', 'users_business_email_unique');
  await queryInterface.removeColumn('users', 'isActive');
  await queryInterface.removeColumn('users', 'businessId');
} 