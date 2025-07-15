import { Model, DataTypes } from 'sequelize';
import { getSequelize } from './sequelize';

export interface TablePositionAttributes {
  id: number;
  tableId: number;
  floorPlanId: number;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TablePositionCreationAttributes extends Omit<TablePositionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class TablePositionModel extends Model<TablePositionAttributes, TablePositionCreationAttributes> implements TablePositionAttributes {
  public id!: number;
  public tableId!: number;
  public floorPlanId!: number;
  public x!: number;
  public y!: number;
  public rotation!: number;
  public width!: number;
  public height!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TablePositionModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tableId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'restaurant_tables',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    floorPlanId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'floor_plans',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    x: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    y: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    rotation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 360,
      },
    },
    width: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 80,
      validate: {
        min: 20,
        max: 200,
      },
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 60,
      validate: {
        min: 20,
        max: 200,
      },
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
    sequelize: getSequelize(),
    tableName: 'table_positions',
    timestamps: true,
    indexes: [
      {
        fields: ['floorPlanId'],
      },
      {
        fields: ['tableId'],
      },
      {
        unique: true,
        fields: ['tableId', 'floorPlanId'],
      },
    ],
  }
); 