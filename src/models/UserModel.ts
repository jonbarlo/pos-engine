import { Model, DataTypes, Sequelize } from 'sequelize';

export enum UserRole {
  ADMIN = 'admin',
  OWNER = 'owner',
  MANAGER = 'manager',
  WAIT_STAFF = 'wait_staff',
  CASHIER = 'cashier',
  KITCHEN_STAFF = 'kitchen_staff',
  VIEWER = 'viewer'
}

export enum KitchenAssignment {
  KITCHEN_READ = 'kitchen_read',
  KITCHEN_WRITE = 'kitchen_write',
  KITCHEN_MANAGER = 'kitchen_manager',
  NONE = 'none'
}

export interface UserAttributes {
  id: number;
  businessId: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  assignment?: KitchenAssignment | null;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreationAttributes extends Omit<UserAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> {
  isActive?: boolean;
  assignment?: KitchenAssignment | null;
}

export class UserModel extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public businessId!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: UserRole;
  public isActive!: boolean;
  public assignment!: KitchenAssignment | null;
  public language!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associations: {
    business: any;
    orders: any;
  };
}

export const initializeUserModel = (sequelize: Sequelize): void => {
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
      email: {
        type: DataTypes.STRING(100),
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
        type: DataTypes.ENUM(...Object.values(UserRole)),
        allowNull: false,
        defaultValue: UserRole.VIEWER,
        validate: {
          isIn: [Object.values(UserRole)]
        }
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      assignment: {
        type: DataTypes.ENUM(...Object.values(KitchenAssignment)),
        allowNull: true,
        defaultValue: KitchenAssignment.NONE,
        validate: {
          isIn: [Object.values(KitchenAssignment)]
        }
      },
      language: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'en-US',
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
    },
    {
      sequelize,
      tableName: 'users',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['email']
        },
        {
          fields: ['businessId']
        },
        {
          fields: ['role']
        },
        {
          fields: ['assignment']
        },
        {
          fields: ['isActive']
        }
      ]
    }
  );
};

export const getUserModel = () => UserModel;

export default UserModel; 