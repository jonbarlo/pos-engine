import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('businesses', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    logo: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    primaryColor: {
      type: DataTypes.STRING(7),
      allowNull: true,
    },
    secondaryColor: {
      type: DataTypes.STRING(7),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    taxRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    currencyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2, // CRC (Costa Rican Colón) - default currency
      references: {
        model: 'currencies',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION'
    },
    timezone: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'UTC',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    type: {
      type: DataTypes.ENUM('generic', 'restaurant'),
      allowNull: false,
      defaultValue: 'generic',
    },
    imageUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
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
  await queryInterface.addIndex('businesses', ['slug'], { unique: true });
  await queryInterface.addIndex('businesses', ['type']);
  await queryInterface.addIndex('businesses', ['isActive']);
  await queryInterface.addIndex('businesses', ['currencyId']);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('businesses');
} 