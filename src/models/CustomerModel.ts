import { Model, DataTypes, Sequelize, Op } from 'sequelize';

export interface CustomerAttributes {
  id?: number;
  businessId: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  loyaltyPoints: number;
  totalSpent: number;
  visitCount: number;
  lastVisit?: Date;
  preferences?: string[]; // JSON array of dietary preferences, allergies, etc.
  notes?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CustomerCreationAttributes extends Omit<CustomerAttributes, 'id' | 'loyaltyPoints' | 'totalSpent' | 'visitCount' | 'isActive' | 'createdAt' | 'updatedAt'> {
  loyaltyPoints?: number;
  totalSpent?: number;
  visitCount?: number;
  isActive?: boolean;
}

export class CustomerModel extends Model<CustomerAttributes, CustomerCreationAttributes> implements CustomerAttributes {
  public id!: number;
  public businessId!: number;
  public name!: string;
  public email?: string;
  public phone?: string;
  public address?: string;
  public city?: string;
  public state?: string;
  public zipCode?: string;
  public country?: string;
  public dateOfBirth?: Date;
  public gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  public loyaltyPoints!: number;
  public totalSpent!: number;
  public visitCount!: number;
  public lastVisit?: Date;
  public preferences?: string[];
  public notes?: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public addLoyaltyPoints(points: number): void {
    this.loyaltyPoints += points;
  }

  public recordVisit(totalSpent: number): void {
    this.visitCount += 1;
    this.totalSpent += totalSpent;
    this.lastVisit = new Date();
  }

  public updatePreferences(preferences: string[]): void {
    this.preferences = preferences;
  }

  public getLoyaltyTier(): string {
    if (this.totalSpent >= 1000) return 'platinum';
    if (this.totalSpent >= 500) return 'gold';
    if (this.totalSpent >= 100) return 'silver';
    return 'bronze';
  }

  public getDiscountPercentage(): number {
    const tier = this.getLoyaltyTier();
    switch (tier) {
      case 'platinum': return 15;
      case 'gold': return 10;
      case 'silver': return 5;
      default: return 0;
    }
  }

  public canBeDeleted(): boolean {
    return this.visitCount === 0 && this.totalSpent === 0;
  }
}

export function initializeCustomerModel(sequelize: Sequelize): void {
  CustomerModel.init(
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
          len: [1, 100],
          notEmpty: true,
        },
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          isEmail: true,
          len: [0, 255],
        },
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
          len: [0, 20],
        },
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
          len: [0, 100],
        },
      },
      state: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
          len: [0, 100],
        },
      },
      zipCode: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
          len: [0, 20],
        },
      },
      country: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
          len: [0, 100],
        },
      },
      dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        validate: {
          isDate: true,
          isPast(value: any) {
            if (value && new Date(value) >= new Date()) {
              throw new Error('Date of birth must be in the past');
            }
          },
        },
      },
      gender: {
        type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
        allowNull: true,
      },
      loyaltyPoints: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      totalSpent: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      visitCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      lastVisit: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      preferences: {
        type: DataTypes.TEXT, // Use TEXT instead of JSON for MS SQL Server
        allowNull: true,
        get: function (this: any): string[] | null {
          const value = this.getDataValue('preferences');
          return value ? JSON.parse(value) : null;
        },
        set: function (this: any, value: string[] | null): void {
          this.setDataValue('preferences', value ? JSON.stringify(value) : null);
        },
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      tableName: 'customers',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['businessId', 'email'],
          where: {
            email: {
              [Op.ne]: null,
            },
          },
        },
        {
          unique: true,
          fields: ['businessId', 'phone'],
          where: {
            phone: {
              [Op.ne]: null,
            },
          },
        },
        {
          fields: ['businessId', 'isActive'],
        },
        {
          fields: ['businessId', 'loyaltyPoints'],
        },
        {
          fields: ['businessId', 'totalSpent'],
        },
        {
          fields: ['businessId', 'lastVisit'],
        },
        {
          fields: ['businessId', 'name'],
        },
      ],
    }
  );
} 