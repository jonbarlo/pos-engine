import { Model, DataTypes, Sequelize } from 'sequelize';

export interface MenuCategoryAttributes {
  id: number;
  businessId: number;
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  imageUrl?: string;
  colorCode?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MenuCategoryCreationAttributes extends Omit<MenuCategoryAttributes, 'id' | 'displayOrder' | 'isActive' | 'createdAt' | 'updatedAt'> {
  displayOrder?: number;
  isActive?: boolean;
}

export class MenuCategoryModel extends Model<MenuCategoryAttributes, MenuCategoryCreationAttributes> implements MenuCategoryAttributes {
  public id!: number;
  public businessId!: number;
  public name!: string;
  public description?: string;
  public displayOrder!: number;
  public isActive!: boolean;
  public imageUrl?: string;
  public colorCode?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Model definition for initialization
  static definition = {
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
      validate: {
        notEmpty: true,
        len: [1, 100] as [number, number],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 500] as [number, number],
      },
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    imageUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isUrl: true,
        len: [0, 255] as [number, number],
      },
    },
    colorCode: {
      type: DataTypes.STRING(7), // Hex color code
      allowNull: true,
      validate: {
        is: /^#[0-9A-F]{6}$/i, // Hex color validation
        len: [0, 7] as [number, number],
      },
    },
  };

  // Business logic methods
  public isVisible(): boolean {
    return this.isActive;
  }

  public getDisplayName(): string {
    return this.name;
  }

  public getFullDescription(): string {
    return this.description || `Menu category: ${this.name}`;
  }

  public getColorStyle(): string {
    return this.colorCode || '#000000';
  }

  public isDefaultCategory(): boolean {
    return this.displayOrder === 0;
  }

  public isPremiumCategory(): boolean {
    // Premium categories typically have higher display order
    return this.displayOrder > 100;
  }

  public canBeDeleted(): boolean {
    // Categories with display order 0 (default) cannot be deleted
    return this.displayOrder !== 0;
  }

  public moveToPosition(newPosition: number): void {
    if (newPosition < 0) {
      throw new Error('Display order cannot be negative');
    }
    this.displayOrder = newPosition;
  }

  public activate(): void {
    this.isActive = true;
  }

  public deactivate(): void {
    if (this.displayOrder === 0) {
      throw new Error('Default category cannot be deactivated');
    }
    this.isActive = false;
  }

  public updateImage(newImageUrl: string): void {
    if (newImageUrl && !newImageUrl.match(/^https?:\/\/.+/)) {
      throw new Error('Image URL must be a valid HTTP/HTTPS URL');
    }
    this.imageUrl = newImageUrl;
  }

  public setColor(colorCode: string): void {
    if (colorCode && !colorCode.match(/^#[0-9A-F]{6}$/i)) {
      throw new Error('Color code must be a valid hex color (e.g., #FF0000)');
    }
    this.colorCode = colorCode;
  }

  public getCategoryType(): string {
    if (this.displayOrder === 0) return 'default';
    if (this.displayOrder <= 10) return 'primary';
    if (this.displayOrder <= 50) return 'secondary';
    return 'special';
  }

  public shouldShowInMenu(): boolean {
    return this.isActive && this.name.length > 0;
  }

  public getSortKey(): number {
    return this.displayOrder * 1000 + this.id;
  }
}

export function initializeMenuCategoryModel(sequelize: Sequelize): void {
  MenuCategoryModel.init(MenuCategoryModel.definition, {
    sequelize,
    tableName: 'menu_categories',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['businessId', 'name'],
      },
      {
        fields: ['businessId', 'displayOrder'],
      },
      {
        fields: ['businessId', 'isActive'],
      },
    ],
  });
} 