import { Model, DataTypes, Sequelize } from 'sequelize';
import { getSequelize } from './sequelize';

export interface FloorPlanAttributes {
  id: number;
  businessId: number;
  name: string;
  width: number;
  height: number;
  backgroundImage?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FloorPlanCreationAttributes extends Omit<FloorPlanAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class FloorPlanModel extends Model<FloorPlanAttributes, FloorPlanCreationAttributes> implements FloorPlanAttributes {
  public id!: number;
  public businessId!: number;
  public name!: string;
  public width!: number;
  public height!: number;
  public backgroundImage?: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

FloorPlanModel.init(
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
      onDelete: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    width: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 800,
      validate: {
        min: 100,
        max: 2000,
      },
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 600,
      validate: {
        min: 100,
        max: 2000,
      },
    },
    backgroundImage: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true,
      },
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
    sequelize: getSequelize(),
    tableName: 'floor_plans',
    timestamps: true,
    indexes: [
      {
        fields: ['businessId'],
      },
      {
        fields: ['businessId', 'isActive'],
      },
    ],
  }
); 