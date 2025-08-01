import { Model, DataTypes, Sequelize } from 'sequelize';

export enum OrderItemStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  READY = 'ready',
  SERVED = 'served',
  CANCELLED = 'cancelled'
}

export interface OrderItemAttributes {
  id: number;
  orderId: number;
  itemId: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currencyId: number; // Required currency relationship
  status: OrderItemStatus;
  notes?: string;
  specialInstructions?: string;
  modifications?: string;
  estimatedReadyTime?: Date;
  actualReadyTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItemCreationAttributes {
  id?: number;
  orderId: number;
  itemId: number;
  itemName: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  status?: OrderItemStatus;
  notes?: string;
  specialInstructions?: string;
  modifications?: string;
  estimatedReadyTime?: Date;
  actualReadyTime?: Date;
}

export class OrderItemModel extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
  public id!: number;
  public orderId!: number;
  public itemId!: number;
  public itemName!: string;
  public quantity!: number;
  public unitPrice!: number;
  public totalPrice!: number;
  public currencyId!: number; // Required currency relationship
  public status!: OrderItemStatus;
  public notes?: string;
  public specialInstructions?: string;
  public modifications?: string;
  public estimatedReadyTime?: Date;
  public actualReadyTime?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associations: {
    order: any;
    item: any;
  };
}

export const initializeOrderItemModel = (sequelize: Sequelize): void => {
  OrderItemModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id',
        },
      },
      itemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'menu_items',
          key: 'id',
        },
      },
      itemName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 1,
          max: 100,
        },
      },
      unitPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
          min: 0,
        },
      },
      totalPrice: {
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
      status: {
        type: DataTypes.ENUM(...Object.values(OrderItemStatus)),
        allowNull: false,
        defaultValue: OrderItemStatus.PENDING,
        validate: {
          isIn: [Object.values(OrderItemStatus)],
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
      modifications: {
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
      tableName: 'order_items',
      timestamps: true,
      indexes: [
        {
          fields: ['orderId'],
        },
        {
          fields: ['itemId'],
        },
        {
          fields: ['orderId', 'status'],
        },
        {
          fields: ['status'],
        },
        {
          fields: ['createdAt'],
        },
      ],
    }
  );
};

export const getOrderItemModel = () => OrderItemModel;

export default OrderItemModel; 