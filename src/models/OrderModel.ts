import { Model, DataTypes, Sequelize } from 'sequelize';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  READY = 'ready',
  SERVED = 'served',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum OrderType {
  DINE_IN = 'dine_in',
  TAKEAWAY = 'takeaway',
  DELIVERY = 'delivery'
}

export interface OrderAttributes {
  id: number;
  businessId: number;
  tableId?: number;
  serverId: number;
  customerId?: number;
  orderNumber: string;
  status: OrderStatus;
  orderType: OrderType;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currencyId: number; // Required currency relationship
  notes?: string;
  specialInstructions?: string;
  estimatedReadyTime?: Date;
  actualReadyTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderCreationAttributes {
  id?: number;
  businessId: number;
  tableId?: number;
  serverId: number;
  customerId?: number;
  orderNumber?: string;
  status?: OrderStatus;
  orderType: OrderType;
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
  notes?: string;
  specialInstructions?: string;
  estimatedReadyTime?: Date;
  actualReadyTime?: Date;
}

export class OrderModel extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public businessId!: number;
  public tableId?: number;
  public serverId!: number;
  public customerId?: number;
  public orderNumber!: string;
  public status!: OrderStatus;
  public orderType!: OrderType;
  public subtotal!: number;
  public taxAmount!: number;
  public discountAmount!: number;
  public totalAmount!: number;
  public currencyId!: number; // Required currency relationship
  public notes?: string;
  public specialInstructions?: string;
  public estimatedReadyTime?: Date;
  public actualReadyTime?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associations: {
    business: any;
    table: any;
    server: any;
    customer: any;
    orderItems: any;
  };
}

export const initializeOrderModel = (sequelize: Sequelize): void => {
  OrderModel.init(
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
      tableId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'restaurant_tables',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      serverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      customerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      orderNumber: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      status: {
        type: DataTypes.ENUM(...Object.values(OrderStatus)),
        allowNull: false,
        defaultValue: OrderStatus.PENDING,
        validate: {
          isIn: [Object.values(OrderStatus)],
        },
      },
      orderType: {
        type: DataTypes.ENUM(...Object.values(OrderType)),
        allowNull: false,
        defaultValue: OrderType.DINE_IN,
        validate: {
          isIn: [Object.values(OrderType)],
        },
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
          min: 0,
        },
      },
      taxAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
          min: 0,
        },
      },
      discountAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
          min: 0,
        },
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
          min: 0,
        },
      },
      currencyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'currencies',
          key: 'id',
        },
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      specialInstructions: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      estimatedReadyTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      actualReadyTime: {
        type: DataTypes.DATE,
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
      tableName: 'orders',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['orderNumber'],
        },
        {
          fields: ['businessId', 'status'],
        },
        {
          fields: ['businessId', 'serverId'],
        },
        {
          fields: ['businessId', 'tableId'],
        },
        {
          fields: ['businessId', 'customerId'],
        },
        {
          fields: ['businessId', 'orderType'],
        },
        {
          fields: ['businessId', 'currencyId'],
        },
        {
          fields: ['createdAt'],
        },
      ],
    }
  );
};

export const getOrderModel = () => OrderModel;

export default OrderModel; 