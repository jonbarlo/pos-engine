import { DataTypes, Model, Optional } from 'sequelize';

// User Model Interfaces
export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserCreationAttributes = Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'>;

// Item Model Interfaces
export interface ItemAttributes {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  sku?: string;
  barcode?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ItemCreationAttributes extends Optional<ItemAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> {}

// User Model
export class UserModel extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Item Model
export class ItemModel extends Model<ItemAttributes, ItemCreationAttributes> implements ItemAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public price!: number;
  public stock!: number;
  public category?: string;
  public sku?: string;
  public barcode?: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Function to initialize models
export function initializeModels(sequelize: any) {
  // Initialize User Model
  UserModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
    },
    {
      sequelize,
      tableName: 'users',
      timestamps: true,
    }
  );

  // Initialize Item Model
  ItemModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 100]
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      sku: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true,
      },
      barcode: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true,
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
      },
    },
    {
      sequelize,
      tableName: 'items',
      timestamps: true,
    }
  );
}

export default {
  UserModel,
  ItemModel,
  initializeModels
}; 