import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('users', {
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
      onDelete: 'CASCADE'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'owner', 'manager', 'wait_staff', 'cashier', 'kitchen_staff', 'viewer'),
      allowNull: false,
      defaultValue: 'viewer',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    assignment: {
      type: DataTypes.ENUM('kitchen_read', 'kitchen_write', 'kitchen_manager', 'none'),
      allowNull: true,
      defaultValue: 'none',
    },
    language: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'es-CR',
      validate: {
        isIn: [['en-US', 'es-CR']]
      }
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

  // Add indexes
  await queryInterface.addIndex('users', ['email'], { unique: true });
  await queryInterface.addIndex('users', ['businessId']);
  await queryInterface.addIndex('users', ['role']);
  await queryInterface.addIndex('users', ['assignment']);
  await queryInterface.addIndex('users', ['isActive']);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('users');
} 