import { Model, DataTypes, Sequelize } from 'sequelize';

export interface KitchenOrderAttributes {
  id?: number;
  businessId: number;
  orderId: number;
  orderNumber: string;
  tableNumber?: string;
  customerName?: string;
  orderType: 'dine_in' | 'takeaway' | 'delivery';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled';
  estimatedPrepTime: number; // in minutes
  actualPrepTime?: number; // in minutes
  startTime?: Date;
  readyTime?: Date;
  servedTime?: Date;
  specialInstructions?: string;
  allergies?: string[];
  dietaryRestrictions?: string[];
  items: KitchenOrderItem[];
  totalItems: number;
  completedItems: number;
  assignedTo?: number; // userId
  assignedToName?: string;
  station?: string; // e.g., 'grill', 'salad', 'dessert'
  notes?: string;
  chefId?: number; // userId of the chef assigned
  createdAt?: Date;
  updatedAt?: Date;
}

export interface KitchenOrderItem {
  id: number;
  itemName: string;
  quantity: number;
  status: 'pending' | 'preparing' | 'ready' | 'served';
  specialInstructions?: string;
  modifications?: string[];
  allergens?: string[];
  preparationTime: number; // in minutes
  startTime?: Date;
  readyTime?: Date;
  servedTime?: Date;
  assignedTo?: number;
  assignedToName?: string;
  station?: string;
}

export interface KitchenOrderCreationAttributes extends Omit<KitchenOrderAttributes, 'id' | 'status' | 'completedItems' | 'createdAt' | 'updatedAt'> {
  status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled';
  completedItems?: number;
}

export class KitchenOrderModel extends Model<KitchenOrderAttributes, KitchenOrderCreationAttributes> implements KitchenOrderAttributes {
  public id!: number;
  public businessId!: number;
  public orderId!: number;
  public orderNumber!: string;
  public tableNumber?: string;
  public customerName?: string;
  public orderType!: 'dine_in' | 'takeaway' | 'delivery';
  public priority!: 'low' | 'normal' | 'high' | 'urgent';
  public status!: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled';
  public estimatedPrepTime!: number;
  public actualPrepTime?: number;
  public startTime?: Date;
  public readyTime?: Date;
  public servedTime?: Date;
  public specialInstructions?: string;
  public allergies?: string[];
  public dietaryRestrictions?: string[];
  public items!: KitchenOrderItem[];
  public totalItems!: number;
  public completedItems!: number;
  public assignedTo?: number;
  public assignedToName?: string;
  public station?: string;
  public notes?: string;
  public chefId?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public confirm(): void {
    this.status = 'confirmed';
  }

  public startPreparation(assignedTo?: number, assignedToName?: string, station?: string): void {
    this.status = 'preparing';
    this.startTime = new Date();
    if (assignedTo) this.assignedTo = assignedTo;
    if (assignedToName) this.assignedToName = assignedToName;
    if (station) this.station = station;
  }

  public markReady(): void {
    this.status = 'ready';
    this.readyTime = new Date();
    if (this.startTime) {
      this.actualPrepTime = Math.round((this.readyTime.getTime() - this.startTime.getTime()) / (1000 * 60));
    }
  }

  public markServed(): void {
    this.status = 'served';
    this.servedTime = new Date();
  }

  public cancel(): void {
    this.status = 'cancelled';
  }

  public updatePriority(priority: 'low' | 'normal' | 'high' | 'urgent'): void {
    this.priority = priority;
  }

  public assignTo(userId: number, userName: string, station?: string): void {
    this.assignedTo = userId;
    this.assignedToName = userName;
    if (station) this.station = station;
  }

  public updateItemStatus(itemId: number, status: 'pending' | 'preparing' | 'ready' | 'served'): void {
    const item = this.items.find(i => i.id === itemId);
    if (item) {
      item.status = status;
      if (status === 'preparing' && !item.startTime) {
        item.startTime = new Date();
      } else if (status === 'ready' && !item.readyTime) {
        item.readyTime = new Date();
      } else if (status === 'served' && !item.servedTime) {
        item.servedTime = new Date();
      }
      this.updateCompletionStatus();
    }
  }

  public assignItemTo(itemId: number, userId: number, userName: string, station?: string): void {
    const item = this.items.find(i => i.id === itemId);
    if (item) {
      item.assignedTo = userId;
      item.assignedToName = userName;
      if (station) item.station = station;
    }
  }

  private updateCompletionStatus(): void {
    this.completedItems = this.items.filter(item => item.status === 'served').length;
    if (this.completedItems === this.totalItems) {
      this.markReady();
    }
  }

  public getPreparationProgress(): number {
    if (this.totalItems === 0) return 0;
    return Math.round((this.completedItems / this.totalItems) * 100);
  }

  public isOverdue(): boolean {
    if (!this.startTime || this.status === 'served' || this.status === 'cancelled') {
      return false;
    }
    const now = new Date();
    const elapsedMinutes = (now.getTime() - this.startTime.getTime()) / (1000 * 60);
    return elapsedMinutes > this.estimatedPrepTime;
  }

  public getTimeRemaining(): number {
    if (!this.startTime || this.status === 'served' || this.status === 'cancelled') {
      return this.estimatedPrepTime;
    }
    const now = new Date();
    const elapsedMinutes = (now.getTime() - this.startTime.getTime()) / (1000 * 60);
    return Math.max(0, this.estimatedPrepTime - elapsedMinutes);
  }

  public getStatusDisplay(): string {
    const statusMap = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      ready: 'Ready',
      served: 'Served',
      cancelled: 'Cancelled'
    };
    return statusMap[this.status];
  }

  public getPriorityDisplay(): string {
    const priorityMap = {
      low: 'Low',
      normal: 'Normal',
      high: 'High',
      urgent: 'Urgent'
    };
    return priorityMap[this.priority];
  }

  public getOrderTypeDisplay(): string {
    const orderTypeMap = {
      dine_in: 'Dine In',
      takeaway: 'Takeaway',
      delivery: 'Delivery'
    };
    return orderTypeMap[this.orderType];
  }

  public getDisplayTitle(): string {
    let title = `#${this.orderNumber}`;
    if (this.tableNumber) {
      title += ` - Table ${this.tableNumber}`;
    }
    if (this.customerName) {
      title += ` - ${this.customerName}`;
    }
    return title;
  }

  public getUrgencyColor(): string {
    if (this.isOverdue()) return '#ff4444'; // Red
    if (this.priority === 'urgent') return '#ff8800'; // Orange
    if (this.priority === 'high') return '#ffaa00'; // Yellow
    return '#00aa00'; // Green
  }
}

export function initializeKitchenOrderModel(sequelize: Sequelize): void {
  KitchenOrderModel.init(
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
      orderNumber: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      tableNumber: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      customerName: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      orderType: {
        type: DataTypes.ENUM('dine_in', 'takeaway', 'delivery'),
        allowNull: false,
        defaultValue: 'dine_in',
      },
      priority: {
        type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'normal',
      },
      status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
      },
      estimatedPrepTime: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 15,
        validate: {
          min: 1,
          max: 480, // 8 hours max
        },
      },
      actualPrepTime: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      startTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      readyTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      servedTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      specialInstructions: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      allergies: {
        type: DataTypes.TEXT,
        allowNull: true,
        get: function (this: any): string[] {
          const value = this.getDataValue('allergies');
          return value ? JSON.parse(value) : [];
        },
        set: function (this: any, value: string[] | null): void {
          this.setDataValue('allergies', value ? JSON.stringify(value) : null);
        }
      },
      dietaryRestrictions: {
        type: DataTypes.TEXT,
        allowNull: true,
        get: function (this: any): string[] {
          const value = this.getDataValue('dietaryRestrictions');
          return value ? JSON.parse(value) : [];
        },
        set: function (this: any, value: string[] | null): void {
          this.setDataValue('dietaryRestrictions', value ? JSON.stringify(value) : null);
        }
      },
      items: {
        type: DataTypes.TEXT,
        allowNull: false,
        get: function (this: any): KitchenOrderItem[] {
          const value = this.getDataValue('items');
          return value ? JSON.parse(value) : [];
        },
        set: function (this: any, value: KitchenOrderItem[]): void {
          this.setDataValue('items', JSON.stringify(value));
        }
      },
      totalItems: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      completedItems: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      assignedTo: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      assignedToName: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      station: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      chefId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      tableName: 'kitchen_orders',
      timestamps: true,
      indexes: [
        {
          fields: ['businessId', 'status'],
        },
        {
          fields: ['businessId', 'assignedTo'],
        },
        {
          fields: ['orderId'],
        },
        {
          fields: ['status', 'priority'],
        },
        {
          fields: ['businessId', 'station'],
        },
        {
          fields: ['startTime'],
        },
      ],
    }
  );
} 