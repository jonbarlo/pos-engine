import { Model, DataTypes, Sequelize } from 'sequelize';

export interface MobileNotificationAttributes {
  id?: number;
  businessId: number;
  type: 'promotion' | 'announcement' | 'new_item' | 'general';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  targetAudience: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MobileNotificationCreationAttributes extends Omit<MobileNotificationAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> {
  isActive?: boolean;
}

export class MobileNotificationModel extends Model<MobileNotificationAttributes, MobileNotificationCreationAttributes> implements MobileNotificationAttributes {
  public id!: number;
  public businessId!: number;
  public type!: 'promotion' | 'announcement' | 'new_item' | 'general';
  public title!: string;
  public message!: string;
  public priority!: 'low' | 'medium' | 'high';
  public targetAudience!: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public getTypeLabel(): string {
    switch (this.type) {
      case 'promotion': return 'Promotion';
      case 'announcement': return 'Announcement';
      case 'new_item': return 'New Item';
      case 'general': return 'General';
      default: return 'Notification';
    }
  }

  public getPriorityLabel(): string {
    switch (this.priority) {
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return 'Medium';
    }
  }

  public getStatus(): string {
    return this.isActive ? 'Active' : 'Inactive';
  }

  public getShortMessage(): string {
    return this.message.length > 100 ? this.message.substring(0, 100) + '...' : this.message;
  }

  // Associations
  public static associations: {
    business: any;
  };
}

export function initializeMobileNotificationModel(sequelize: Sequelize): void {
  MobileNotificationModel.init(
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
      type: {
        type: DataTypes.ENUM('promotion', 'announcement', 'new_item', 'general'),
        allowNull: false,
        defaultValue: 'general',
        validate: {
          isIn: [['promotion', 'announcement', 'new_item', 'general']],
        },
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          len: [1, 255],
          notEmpty: true,
        },
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
        allowNull: false,
        defaultValue: 'medium',
        validate: {
          isIn: [['low', 'medium', 'high']],
        },
      },
      targetAudience: {
        type: DataTypes.STRING(100),
        allowNull: false,
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
      tableName: 'mobile_notifications',
      timestamps: true,
      indexes: [
        {
          fields: ['businessId', 'isActive'],
        },
        {
          fields: ['businessId', 'targetAudience'],
        },
        {
          fields: ['businessId', 'priority'],
        },
        {
          fields: ['type'],
        },
        {
          fields: ['createdAt'],
        },
      ],
    }
  );
}

export const getMobileNotificationModel = () => MobileNotificationModel;

export default MobileNotificationModel; 