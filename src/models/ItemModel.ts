import { Model, DataTypes, Sequelize } from 'sequelize';

export interface ItemAttributes {
  id: number;
  businessId: number;
  name: string;
  description?: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
  imageUrl?: string;
  isActive: boolean;
  sku?: string;
  barcode?: string;
  unit: string;
  minStock: number;
  maxStock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ItemCreationAttributes extends Omit<ItemAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> {
  isActive?: boolean;
}

export class ItemModel extends Model<ItemAttributes, ItemCreationAttributes> implements ItemAttributes {
  public id!: number;
  public businessId!: number;
  public name!: string;
  public description?: string;
  public price!: number;
  public cost!: number;
  public stock!: number;
  public category!: string;
  public imageUrl?: string;
  public isActive!: boolean;
  public sku?: string;
  public barcode?: string;
  public unit!: string;
  public minStock!: number;
  public maxStock!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associations: {
    business: any;
    orderItems: any;
  };
}

export const initializeItemModel = (sequelize: Sequelize): void => {
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
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
        allowNull: true
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      },
      cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
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
        allowNull: false,
        defaultValue: 'General'
      },
      imageUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          isUrl: true
        }
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      sku: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true
      },
      barcode: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true
      },
      unit: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'piece'
      },
      minStock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      maxStock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1000,
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
      }
    },
    {
      sequelize,
      tableName: 'items',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['businessId', 'name']
        },
        {
          fields: ['businessId', 'category']
        },
        {
          fields: ['businessId', 'isActive']
        },
        {
          unique: true,
          fields: ['sku']
        },
        {
          unique: true,
          fields: ['barcode']
        }
      ]
    }
  );
};

export const getItemModel = () => ItemModel;

export default ItemModel; 