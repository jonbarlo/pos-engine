import { DataTypes, Model, Optional } from 'sequelize';

// Business/Tenant Model Interfaces
export interface BusinessAttributes {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxRate: number;
  currency: string;
  timezone: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type BusinessCreationAttributes = Optional<BusinessAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>;

// User Model Interfaces
export interface UserAttributes {
  id: number;
  businessId: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'owner' | 'manager' | 'cashier' | 'viewer';
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserCreationAttributes = Optional<UserAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>;

// Item Model Interfaces
export interface ItemAttributes {
  id: number;
  businessId: number;
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
  businessId: number;
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
  businessId: number;
  saleId: number;
  itemId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderItemCreationAttributes extends Omit<OrderItemAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// Business Model
export class BusinessModel extends Model<BusinessAttributes, BusinessCreationAttributes> implements BusinessAttributes {
  public id!: number;
  public name!: string;
  public slug!: string;
  public description?: string;
  public logo?: string;
  public primaryColor?: string;
  public secondaryColor?: string;
  public address?: string;
  public phone?: string;
  public email?: string;
  public website?: string;
  public taxRate!: number;
  public currency!: string;
  public timezone!: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// User Model
export class UserModel extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public businessId!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: 'admin' | 'owner' | 'manager' | 'cashier' | 'viewer';
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Item Model
export class ItemModel extends Model<ItemAttributes, ItemCreationAttributes> implements ItemAttributes {
  public id!: number;
  public businessId!: number;
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
  public businessId!: number;
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
  public businessId!: number;
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
  // Initialize Business Model
  BusinessModel.init(
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
      slug: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          is: /^[a-z0-9-]+$/,
          len: [3, 50]
        }
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
        validate: {
          is: /^#[0-9A-F]{6}$/i
        }
      },
      secondaryColor: {
        type: DataTypes.STRING(7),
        allowNull: true,
        validate: {
          is: /^#[0-9A-F]{6}$/i
        }
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
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          isEmail: true
        }
      },
      website: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          isUrl: true
        }
      },
      taxRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100
        }
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'USD',
        validate: {
          len: [3, 3]
        }
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
    },
    {
      sequelize,
      tableName: 'businesses',
      timestamps: true,
    }
  );

  // Initialize User Model
  UserModel.init(
    {
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
          key: 'id',
        },
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('admin', 'owner', 'manager', 'cashier', 'viewer'),
        allowNull: false,
        defaultValue: 'cashier',
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      tableName: 'users',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['businessId', 'email']
        }
      ]
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
      businessId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'businesses',
          key: 'id',
        },
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
      },
      barcode: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      tableName: 'items',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['businessId', 'sku']
        },
        {
          unique: true,
          fields: ['businessId', 'barcode']
        }
      ]
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
      businessId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'businesses',
          key: 'id',
        },
        onDelete: 'NO ACTION',
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'NO ACTION',
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
      businessId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'businesses',
          key: 'id',
        },
        onDelete: 'NO ACTION',
      },
      saleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'sales',
          key: 'id',
        },
        onDelete: 'NO ACTION',
      },
      itemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'items',
          key: 'id',
        },
        onDelete: 'NO ACTION',
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
    },
    {
      sequelize,
      tableName: 'order_items',
      timestamps: true,
    }
  );

  // Define associations (without CASCADE to avoid SQL Server issues)
  BusinessModel.hasMany(UserModel, { foreignKey: 'businessId', as: 'users' });
  UserModel.belongsTo(BusinessModel, { foreignKey: 'businessId', as: 'business' });

  BusinessModel.hasMany(ItemModel, { foreignKey: 'businessId', as: 'items' });
  ItemModel.belongsTo(BusinessModel, { foreignKey: 'businessId', as: 'business' });

  BusinessModel.hasMany(SaleModel, { foreignKey: 'businessId', as: 'sales' });
  SaleModel.belongsTo(BusinessModel, { foreignKey: 'businessId', as: 'business', onDelete: 'NO ACTION' });

  BusinessModel.hasMany(OrderItemModel, { foreignKey: 'businessId', as: 'orderItems' });
  OrderItemModel.belongsTo(BusinessModel, { foreignKey: 'businessId', as: 'business' });

  UserModel.hasMany(SaleModel, { foreignKey: 'userId', as: 'sales' });
  SaleModel.belongsTo(UserModel, { foreignKey: 'userId', as: 'user', onDelete: 'NO ACTION' });

  SaleModel.hasMany(OrderItemModel, { foreignKey: 'saleId', as: 'orderItems' });
  OrderItemModel.belongsTo(SaleModel, { foreignKey: 'saleId', as: 'sale' });

  ItemModel.hasMany(OrderItemModel, { foreignKey: 'itemId', as: 'orderItems' });
  OrderItemModel.belongsTo(ItemModel, { foreignKey: 'itemId', as: 'item' });
}

export default {
  BusinessModel,
  UserModel,
  ItemModel,
  SaleModel,
  OrderItemModel,
  initializeModels
}; 