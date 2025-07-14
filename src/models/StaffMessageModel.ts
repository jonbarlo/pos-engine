import { Model, DataTypes, Sequelize } from 'sequelize';
import { getSequelize } from './sequelize';

export enum MessageType {
  ANNOUNCEMENT = 'announcement',
  INVENTORY_ALERT = 'inventory_alert',
  PROMOTION = 'promotion',
  DISCOUNT = 'discount',
  URGENT = 'urgent',
  GENERAL = 'general',
  ORDER_UPDATE = 'order_update',
  KITCHEN_ALERT = 'kitchen_alert',
  STAFF_NOTICE = 'staff_notice',
  EMERGENCY = 'emergency',
  MAINTENANCE = 'maintenance',
  TRAINING = 'training'
}

export enum MessageStatus {
  SENT = 'sent',
  READ = 'read',
  ACKNOWLEDGED = 'acknowledged',
  EXPIRED = 'expired'
}

export enum RecipientType {
  ALL = 'all',
  WAITSTAFF = 'waitstaff',
  KITCHEN = 'kitchen',
  MANAGERS = 'managers',
  SPECIFIC_USERS = 'specific_users',
  CASHIERS = 'cashiers',
  DRIVERS = 'drivers',
  HOSTS = 'hosts',
  BARTENDERS = 'bartenders'
}

export interface StaffMessageAttributes {
  id: number;
  businessId: number;
  senderId: number;
  senderName: string;
  messageType: MessageType;
  title: string;
  content: string;
  recipientType: RecipientType;
  recipientIds?: number[]; // For specific users
  status: MessageStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expiresAt?: Date;
  readBy?: number[]; // Array of user IDs who have read the message
  readAt?: Date; // When the message was first read
  isRead: boolean; // Whether the message has been read
  acknowledgedBy?: number[]; // Array of user IDs who have acknowledged
  metadata?: any; // For additional data like discount codes, promotion details, etc.
  createdAt: Date;
  updatedAt: Date;
}

export interface StaffMessageCreationAttributes extends Omit<StaffMessageAttributes, 'id' | 'createdAt' | 'updatedAt'> {
  id?: number;
}

export class StaffMessageModel extends Model<StaffMessageAttributes, StaffMessageCreationAttributes> implements StaffMessageAttributes {
  public id!: number;
  public businessId!: number;
  public senderId!: number;
  public senderName!: string;
  public messageType!: MessageType;
  public title!: string;
  public content!: string;
  public recipientType!: RecipientType;
  public recipientIds?: number[];
  public status!: MessageStatus;
  public priority!: 'low' | 'normal' | 'high' | 'urgent';
  public expiresAt?: Date;
  public readBy?: number[];
  public readAt?: Date;
  public isRead!: boolean;
  public acknowledgedBy?: number[];
  public metadata?: any;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StaffMessageModel.init(
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
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    senderName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    messageType: {
      type: DataTypes.ENUM(...Object.values(MessageType)),
      allowNull: false,
      defaultValue: MessageType.GENERAL,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    recipientType: {
      type: DataTypes.ENUM(...Object.values(RecipientType)),
      allowNull: false,
      defaultValue: RecipientType.ALL,
    },
    recipientIds: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const value = this.getDataValue('recipientIds');
        return value ? JSON.parse(value) : null;
      },
      set(value: number[] | null) {
        this.setDataValue('recipientIds', value ? JSON.stringify(value) : null);
      },
    } as any,
    status: {
      type: DataTypes.ENUM(...Object.values(MessageStatus)),
      allowNull: false,
      defaultValue: MessageStatus.SENT,
    },
    priority: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'normal',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    readBy: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const value = this.getDataValue('readBy');
        return value ? JSON.parse(value) : [];
      },
      set(value: number[]) {
        this.setDataValue('readBy', JSON.stringify(value));
      },
    } as any,
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    acknowledgedBy: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const value = this.getDataValue('acknowledgedBy');
        return value ? JSON.parse(value) : [];
      },
      set(value: number[]) {
        this.setDataValue('acknowledgedBy', JSON.stringify(value));
      },
    } as any,
    metadata: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const value = this.getDataValue('metadata');
        return value ? JSON.parse(value) : null;
      },
      set(value: any) {
        this.setDataValue('metadata', value ? JSON.stringify(value) : null);
      },
    } as any,
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  },
  {
    sequelize: getSequelize(),
    tableName: 'staff_messages',
    timestamps: true,
    indexes: [
      {
        fields: ['businessId'],
      },
      {
        fields: ['senderId'],
      },
      {
        fields: ['messageType'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['priority'],
      },
      {
        fields: ['createdAt'],
      },
      {
        fields: ['expiresAt'],
      },
    ],
  }
);

export default StaffMessageModel; 