import { Model, DataTypes, Sequelize } from 'sequelize';

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
  currencyId: number; // Required currency relationship
  timezone: string;
  isActive: boolean;
  type: 'generic' | 'restaurant';
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessCreationAttributes extends Omit<BusinessAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> {
  isActive?: boolean;
}

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
  public currencyId!: number; // Required currency relationship
  public timezone!: string;
  public isActive!: boolean;
  public type!: 'generic' | 'restaurant';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associations: {
    users: any;
    orders: any;
    items: any;
  };
}

export const initializeBusinessModel = (sequelize: Sequelize): void => {
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
        validate: {
          notEmpty: true,
          len: [1, 100]
        }
      },
      slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [1, 100]
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      logo: {
        type: DataTypes.STRING(255),
        allowNull: true
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
        allowNull: true
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      email: {
        type: DataTypes.STRING(100),
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
        defaultValue: 0.00,
        validate: {
          min: 0,
          max: 100
        }
      },
      currencyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'currencies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      timezone: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'UTC'
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      type: {
        type: DataTypes.ENUM('generic', 'restaurant'),
        allowNull: false,
        defaultValue: 'generic'
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
      tableName: 'businesses',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['slug']
        },
        {
          fields: ['type']
        },
        {
          fields: ['isActive']
        },
        {
          fields: ['currencyId']
        }
      ]
    }
  );
};

export const getBusinessModel = () => BusinessModel;

export default BusinessModel; 