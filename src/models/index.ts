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

// Sale Model Interfaces
export interface SaleAttributes {
  id: number;
  userId: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'mobile' | 'other';
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SaleCreationAttributes extends Omit<SaleAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// OrderItem Model Interfaces
export interface OrderItemAttributes {
  id: number;
  saleId: number;
  itemId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderItemCreationAttributes extends Omit<OrderItemAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

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

// Sale Model
export class SaleModel extends Model<SaleAttributes, SaleCreationAttributes> implements SaleAttributes {
  public id!: number;
  public userId!: number;
  public customerName?: string;
  public customerEmail?: string;
  public customerPhone?: string;
  public subtotal!: number;
  public tax!: number;
  public discount!: number;
  public total!: number;
  public paymentMethod!: 'cash' | 'card' | 'mobile' | 'other';
  public status!: 'pending' | 'completed' | 'cancelled' | 'refunded';
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// OrderItem Model
export class OrderItemModel extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
  public id!: number;
  public saleId!: number;
  public itemId!: number;
  public quantity!: number;
  public unitPrice!: number;
  public totalPrice!: number;
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

  // Initialize Sale Model
  SaleModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      customerName: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      customerEmail: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      customerPhone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      },
      tax: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      discount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      },
      paymentMethod: {
        type: DataTypes.ENUM('cash', 'card', 'mobile', 'other'),
        allowNull: false,
        defaultValue: 'cash',
      },
      status: {
        type: DataTypes.ENUM('pending', 'completed', 'cancelled', 'refunded'),
        allowNull: false,
        defaultValue: 'pending',
      },
      notes: {
        type: DataTypes.TEXT,
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
      },
    },
    {
      sequelize,
      tableName: 'sales',
      timestamps: true,
    }
  );

  // Initialize OrderItem Model
  OrderItemModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      saleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'sales',
          key: 'id',
        },
      },
      itemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'items',
          key: 'id',
        },
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1
        }
      },
      unitPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      },
      totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0
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
      },
    },
    {
      sequelize,
      tableName: 'order_items',
      timestamps: true,
    }
  );

  // Define associations
  UserModel.hasMany(SaleModel, { foreignKey: 'userId', as: 'sales' });
  SaleModel.belongsTo(UserModel, { foreignKey: 'userId', as: 'user' });

  SaleModel.hasMany(OrderItemModel, { foreignKey: 'saleId', as: 'orderItems' });
  OrderItemModel.belongsTo(SaleModel, { foreignKey: 'saleId', as: 'sale' });

  ItemModel.hasMany(OrderItemModel, { foreignKey: 'itemId', as: 'orderItems' });
  OrderItemModel.belongsTo(ItemModel, { foreignKey: 'itemId', as: 'item' });
}

export default {
  UserModel,
  ItemModel,
  SaleModel,
  OrderItemModel,
  initializeModels
}; 