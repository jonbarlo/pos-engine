import { Model, DataTypes, Sequelize } from 'sequelize';

export interface ReservationAttributes {
  id?: number;
  businessId: number;
  tableId?: number;
  customerId?: number;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  partySize: number;
  reservationDate: string | Date;
  reservationTime: string; // HH:MM format
  duration: number; // in minutes, default 90
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';
  specialRequests?: string;
  notes?: string;
  source: 'phone' | 'online' | 'walk_in' | 'third_party';
  confirmedAt?: Date;
  seatedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancelledBy?: number; // userId
  cancellationReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReservationCreationAttributes extends Omit<ReservationAttributes, 'id' | 'status' | 'createdAt' | 'updatedAt'> {
  status?: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';
}

export class ReservationModel extends Model<ReservationAttributes, ReservationCreationAttributes> implements ReservationAttributes {
  public id!: number;
  public businessId!: number;
  public tableId?: number;
  public customerId?: number;
  public customerName!: string;
  public customerEmail?: string;
  public customerPhone!: string;
  public partySize!: number;
  public reservationDate!: string | Date;
  public reservationTime!: string;
  public duration!: number;
  public status!: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';
  public specialRequests?: string;
  public notes?: string;
  public source!: 'phone' | 'online' | 'walk_in' | 'third_party';
  public confirmedAt?: Date;
  public seatedAt?: Date;
  public completedAt?: Date;
  public cancelledAt?: Date;
  public cancelledBy?: number;
  public cancellationReason?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public confirm(): void {
    this.status = 'confirmed';
    this.confirmedAt = new Date();
  }

  public seat(): void {
    this.status = 'seated';
    this.seatedAt = new Date();
  }

  public complete(): void {
    this.status = 'completed';
    this.completedAt = new Date();
  }

  public cancel(reason?: string, cancelledBy?: number): void {
    this.status = 'cancelled';
    this.cancelledAt = new Date();
    if (reason) this.cancellationReason = reason;
    if (cancelledBy) this.cancelledBy = cancelledBy;
  }

  public markNoShow(): void {
    this.status = 'no_show';
  }

  public getReservationDateTime(): Date {
    const [hours, minutes] = this.reservationTime.split(':').map(Number);
    const dateTime = new Date(this.reservationDate);
    dateTime.setHours(hours || 0, minutes || 0, 0, 0);
    return dateTime;
  }

  public getEndTime(): Date {
    const startTime = this.getReservationDateTime();
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + this.duration);
    return endTime;
  }

  public isOverlapping(otherReservation: ReservationModel): boolean {
    const thisStart = this.getReservationDateTime();
    const thisEnd = this.getEndTime();
    const otherStart = otherReservation.getReservationDateTime();
    const otherEnd = otherReservation.getEndTime();

    return thisStart < otherEnd && thisEnd > otherStart;
  }

  public isToday(): boolean {
    const today = new Date();
    const reservationDate = new Date(this.reservationDate);
    return today.toDateString() === reservationDate.toDateString();
  }

  public isUpcoming(): boolean {
    const now = new Date();
    const reservationTime = this.getReservationDateTime();
    return reservationTime > now;
  }

  public isPast(): boolean {
    const now = new Date();
    const endTime = this.getEndTime();
    return endTime < now;
  }

  public getStatusDisplay(): string {
    const statusMap = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      seated: 'Seated',
      completed: 'Completed',
      cancelled: 'Cancelled',
      no_show: 'No Show'
    };
    return statusMap[this.status];
  }

  public getSourceDisplay(): string {
    const sourceMap = {
      phone: 'Phone',
      online: 'Online',
      walk_in: 'Walk-in',
      third_party: 'Third Party'
    };
    return sourceMap[this.source];
  }
}

export function initializeReservationModel(sequelize: Sequelize): void {
  ReservationModel.init(
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
          model: 'tables',
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
      customerEmail: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          isEmail: true,
          len: [0, 255],
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
      partySize: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 50,
        },
      },
      reservationDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          isDate: true,
          isFutureOrToday(value: any) {
            if (value) {
              const reservationDate = new Date(value);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              if (reservationDate < today) {
                throw new Error('Reservation date cannot be in the past');
              }
            }
          },
        },
      },
      reservationTime: {
        type: DataTypes.STRING(5),
        allowNull: false,
        validate: {
          is: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format
        },
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 90,
        validate: {
          min: 30,
          max: 480, // 8 hours max
        },
      },
      status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'),
        allowNull: false,
        defaultValue: 'pending',
      },
      specialRequests: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      source: {
        type: DataTypes.ENUM('phone', 'online', 'walk_in', 'third_party'),
        allowNull: false,
        defaultValue: 'phone',
      },
      confirmedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      seatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      cancelledAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      cancelledBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      cancellationReason: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'reservations',
      timestamps: true,
      indexes: [
        {
          fields: ['businessId', 'reservationDate'],
        },
        {
          fields: ['businessId', 'status'],
        },
        {
          fields: ['businessId', 'customerId'],
        },
        {
          fields: ['businessId', 'tableId'],
        },
        {
          fields: ['customerPhone'],
        },
        {
          fields: ['customerEmail'],
        },
        {
          fields: ['reservationDate', 'reservationTime'],
        },
      ],
    }
  );
} 