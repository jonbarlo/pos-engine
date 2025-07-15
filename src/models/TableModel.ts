import { Model, DataTypes, Sequelize } from 'sequelize';

export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  CLEANING = 'cleaning',
  OUT_OF_SERVICE = 'out_of_service'
}

export interface TableAttributes {
  id: number;
  businessId: number;
  tableNumber: string;
  capacity: number;
  partySize?: number | null;
  status: TableStatus;
  currentOrderId?: number | null;
  serverId?: number | null;
  section: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TableCreationAttributes {
  id?: number;
  businessId: number;
  tableNumber: string;
  capacity: number;
  partySize?: number | null;
  status?: TableStatus;
  currentOrderId?: number | null;
  serverId?: number | null;
  section?: string;
  isActive?: boolean;
}

export class TableModel extends Model<TableAttributes, TableCreationAttributes> implements TableAttributes {
  public id!: number;
  public businessId!: number;
  public tableNumber!: string;
  public capacity!: number;
  public partySize?: number | null;
  public status!: TableStatus;
  public currentOrderId?: number | null;
  public serverId?: number | null;
  public section!: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associations: {
    business: any;
    server: any;
    currentOrder: any;
  };
}

export const initializeTableModel = (sequelize: Sequelize): void => {
  TableModel.init(
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
      tableNumber: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 20,
        },
      },
      partySize: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        validate: {
          min: 1,
          max: 20,
        },
      },
      status: {
        type: DataTypes.ENUM(...Object.values(TableStatus)),
        allowNull: false,
        defaultValue: TableStatus.AVAILABLE,
      },
      currentOrderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'orders',
          key: 'id',
        },
        defaultValue: null,
      },
      serverId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        defaultValue: null,
      },
      section: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: 'Main Floor',
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
      tableName: 'restaurant_tables',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['businessId', 'tableNumber'],
        },
        {
          fields: ['businessId', 'status'],
        },
        {
          fields: ['businessId', 'serverId'],
        },
      ],
    }
  );
};

export const getTableModel = () => TableModel;

export default TableModel; 