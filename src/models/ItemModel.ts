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
  // Preparation and dietary fields
  preparationTime?: number;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isSpicy: boolean;
  allergens?: string;
  nutritionInfo?: string;
  // New inventory management fields
  expirationDate?: Date;
  manufacturingDate?: Date;
  shelfLifeDays?: number;
  lastSoldDate?: Date;
  salesVelocity?: number;
  daysSinceLastSale?: number;
  isPerishable: boolean;
  isUnderperforming: boolean;
  isExpiringSoon: boolean;
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
  // Preparation and dietary fields
  public preparationTime?: number;
  public isVegetarian!: boolean;
  public isVegan!: boolean;
  public isGlutenFree!: boolean;
  public isSpicy!: boolean;
  public allergens?: string;
  public nutritionInfo?: string;
  // New inventory management fields
  public expirationDate?: Date;
  public manufacturingDate?: Date;
  public shelfLifeDays?: number;
  public lastSoldDate?: Date;
  public salesVelocity?: number;
  public daysSinceLastSale?: number;
  public isPerishable!: boolean;
  public isUnderperforming!: boolean;
  public isExpiringSoon!: boolean;
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
      // Preparation and dietary fields
      preparationTime: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 15,
        comment: 'Preparation time in minutes'
      },
      isVegetarian: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether the item is vegetarian'
      },
      isVegan: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether the item is vegan'
      },
      isGlutenFree: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether the item is gluten-free'
      },
      isSpicy: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether the item is spicy'
      },
      allergens: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'JSON string of allergens'
      },
      nutritionInfo: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'JSON string of nutrition information'
      },
      // New inventory management fields
      expirationDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Expiration date for perishable items'
      },
      manufacturingDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Manufacturing date for tracking shelf life'
      },
      shelfLifeDays: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Shelf life in days from manufacturing date'
      },
      lastSoldDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date when item was last sold'
      },
      salesVelocity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00,
        comment: 'Average daily sales rate (units per day)'
      },
      daysSinceLastSale: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Number of days since last sale'
      },
      isPerishable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether item has expiration date'
      },
      isUnderperforming: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether item is considered underperforming'
      },
      isExpiringSoon: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether item is expiring within 7 days'
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