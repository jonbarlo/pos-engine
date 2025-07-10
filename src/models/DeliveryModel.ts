import { Model, DataTypes, Sequelize } from 'sequelize';

export interface DeliveryAttributes {
  id?: number;
  businessId: number;
  orderId: number;
  customerId?: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryZipCode: string;
  deliveryInstructions?: string;
  driverId?: number;
  driverName?: string;
  driverPhone?: string;
  estimatedPickupTime?: Date;
  actualPickupTime?: Date;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed' | 'cancelled';
  distance?: number; // in kilometers
  deliveryFee: number;
  tip?: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'online' | 'prepaid';
  paymentStatus: 'pending' | 'paid' | 'failed';
  trackingNumber?: string;
  notes?: string;
  failureReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DeliveryCreationAttributes extends Omit<DeliveryAttributes, 'id' | 'status' | 'paymentStatus' | 'createdAt' | 'updatedAt'> {
  status?: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'failed';
}

export class DeliveryModel extends Model<DeliveryAttributes, DeliveryCreationAttributes> implements DeliveryAttributes {
  public id!: number;
  public businessId!: number;
  public orderId!: number;
  public customerId?: number;
  public customerName!: string;
  public customerPhone!: string;
  public customerEmail?: string;
  public deliveryAddress!: string;
  public deliveryCity!: string;
  public deliveryState!: string;
  public deliveryZipCode!: string;
  public deliveryInstructions?: string;
  public driverId?: number;
  public driverName?: string;
  public driverPhone?: string;
  public estimatedPickupTime?: Date;
  public actualPickupTime?: Date;
  public estimatedDeliveryTime?: Date;
  public actualDeliveryTime?: Date;
  public status!: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed' | 'cancelled';
  public distance?: number;
  public deliveryFee!: number;
  public tip?: number;
  public totalAmount!: number;
  public paymentMethod!: 'cash' | 'card' | 'online' | 'prepaid';
  public paymentStatus!: 'pending' | 'paid' | 'failed';
  public trackingNumber?: string;
  public notes?: string;
  public failureReason?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public assignDriver(driverId: number, driverName: string, driverPhone: string): void {
    this.driverId = driverId;
    this.driverName = driverName;
    this.driverPhone = driverPhone;
    this.status = 'assigned';
  }

  public markPickedUp(): void {
    this.status = 'picked_up';
    this.actualPickupTime = new Date();
  }

  public markInTransit(): void {
    this.status = 'in_transit';
  }

  public markDelivered(): void {
    this.status = 'delivered';
    this.actualDeliveryTime = new Date();
  }

  public markFailed(reason: string): void {
    this.status = 'failed';
    this.failureReason = reason;
  }

  public cancel(): void {
    this.status = 'cancelled';
  }

  public updatePaymentStatus(status: 'pending' | 'paid' | 'failed'): void {
    this.paymentStatus = status;
  }

  public calculateDeliveryTime(): number {
    if (this.actualPickupTime && this.actualDeliveryTime) {
      return (this.actualDeliveryTime.getTime() - this.actualPickupTime.getTime()) / (1000 * 60); // minutes
    }
    return 0;
  }

  public isOnTime(): boolean {
    if (!this.estimatedDeliveryTime || !this.actualDeliveryTime) {
      return false;
    }
    return this.actualDeliveryTime <= this.estimatedDeliveryTime;
  }

  public getStatusDisplay(): string {
    const statusMap = {
      pending: 'Pending',
      assigned: 'Assigned to Driver',
      picked_up: 'Picked Up',
      in_transit: 'In Transit',
      delivered: 'Delivered',
      failed: 'Delivery Failed',
      cancelled: 'Cancelled'
    };
    return statusMap[this.status];
  }

  public getPaymentStatusDisplay(): string {
    const paymentStatusMap = {
      pending: 'Pending',
      paid: 'Paid',
      failed: 'Payment Failed'
    };
    return paymentStatusMap[this.paymentStatus];
  }

  public getPaymentMethodDisplay(): string {
    const paymentMethodMap = {
      cash: 'Cash',
      card: 'Card',
      online: 'Online',
      prepaid: 'Prepaid'
    };
    return paymentMethodMap[this.paymentMethod];
  }

  public getFullAddress(): string {
    return `${this.deliveryAddress}, ${this.deliveryCity}, ${this.deliveryState} ${this.deliveryZipCode}`;
  }

  public getEstimatedDeliveryTime(): Date | null {
    if (!this.estimatedPickupTime) {
      return null;
    }
    const deliveryTime = new Date(this.estimatedPickupTime);
    deliveryTime.setMinutes(deliveryTime.getMinutes() + 30); // Default 30 minutes delivery time
    return deliveryTime;
  }
}

export function initializeDeliveryModel(sequelize: Sequelize): void {
  DeliveryModel.init(
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
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id',
        },
      },
      customerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'customers',
          key: 'id',
        },
      },
      customerName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          len: [1, 100],
          notEmpty: true,
        },
      },
      customerPhone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          len: [1, 20],
          notEmpty: true,
        },
      },
      customerEmail: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          isEmail: true,
          len: [0, 255],
        },
      },
      deliveryAddress: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      deliveryCity: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          len: [1, 100],
          notEmpty: true,
        },
      },
      deliveryState: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          len: [1, 100],
          notEmpty: true,
        },
      },
      deliveryZipCode: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          len: [1, 20],
          notEmpty: true,
        },
      },
      deliveryInstructions: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      driverId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      driverName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
          len: [0, 100],
        },
      },
      driverPhone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
          len: [0, 20],
        },
      },
      estimatedPickupTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      actualPickupTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      estimatedDeliveryTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      actualDeliveryTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
      },
      distance: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      deliveryFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      tip: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      paymentMethod: {
        type: DataTypes.ENUM('cash', 'card', 'online', 'prepaid'),
        allowNull: false,
        defaultValue: 'cash',
      },
      paymentStatus: {
        type: DataTypes.ENUM('pending', 'paid', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      trackingNumber: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      failureReason: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'deliveries',
      timestamps: true,
      indexes: [
        {
          fields: ['businessId', 'status'],
        },
        {
          fields: ['businessId', 'driverId'],
        },
        {
          fields: ['orderId'],
        },
        {
          fields: ['customerId'],
        },
        {
          fields: ['trackingNumber'],
        },
        {
          fields: ['status', 'estimatedDeliveryTime'],
        },
        {
          fields: ['driverId', 'status'],
        },
      ],
    }
  );
}

export default DeliveryModel; 