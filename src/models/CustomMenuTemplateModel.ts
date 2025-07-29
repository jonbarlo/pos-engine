import { Model, DataTypes, Sequelize } from 'sequelize';

export interface CustomMenuTemplateAttributes {
  id: number;
  businessId: number;
  name: string;
  description?: string;
  css: string;
  html?: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomMenuTemplateCreationAttributes extends Omit<CustomMenuTemplateAttributes, 'id' | 'createdAt' | 'updatedAt' | 'isActive' | 'isDefault'> {
  isActive?: boolean;
  isDefault?: boolean;
}

export class CustomMenuTemplateModel extends Model<CustomMenuTemplateAttributes, CustomMenuTemplateCreationAttributes> implements CustomMenuTemplateAttributes {
  public id!: number;
  public businessId!: number;
  public name!: string;
  public description?: string;
  public css!: string;
  public html?: string;
  public isActive!: boolean;
  public isDefault!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associations: {
    business: any;
  };
}

export const initializeCustomMenuTemplateModel = (sequelize: Sequelize): void => {
  CustomMenuTemplateModel.init(
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
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 100]
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      css: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      html: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      tableName: 'custom_menu_templates',
      timestamps: true,
      indexes: [
        {
          fields: ['businessId']
        },
        {
          fields: ['businessId', 'isActive']
        }
      ]
    }
  );
};

export const getCustomMenuTemplateModel = () => CustomMenuTemplateModel;