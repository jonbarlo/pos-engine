import { Model, DataTypes, Sequelize } from 'sequelize';

export interface MenuItemAttributes {
  id: number;
  businessId: number;
  categoryId: number;
  itemId?: number;
  name: string;
  description?: string;
  price: number;
  cost: number;
  sku?: string;
  barcode?: string;
  imageUrl?: string;
  ingredients?: string[];
  allergens?: string[];
  nutritionalInfo?: any; // JSON field for nutritional data
  preparationTime: number; // in minutes
  isAvailable: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isSpicy: boolean;
  spiceLevel?: number; // 1-5 scale
  calories?: number;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MenuItemCreationAttributes extends Omit<MenuItemAttributes, 'id' | 'price' | 'cost' | 'preparationTime' | 'isAvailable' | 'isVegetarian' | 'isVegan' | 'isGlutenFree' | 'isSpicy' | 'createdAt' | 'updatedAt'> {
  price?: number;
  cost?: number;
  preparationTime?: number;
  isAvailable?: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isSpicy?: boolean;
}

export class MenuItemModel extends Model<MenuItemAttributes, MenuItemCreationAttributes> implements MenuItemAttributes {
  public id!: number;
  public businessId!: number;
  public categoryId!: number;
  public itemId?: number;
  public name!: string;
  public description?: string;
  public price!: number;
  public cost!: number;
  public sku?: string;
  public barcode?: string;
  public imageUrl?: string;
  public ingredients?: string[];
  public allergens?: string[];
  public nutritionalInfo?: any;
  public preparationTime!: number;
  public isAvailable!: boolean;
  public isVegetarian!: boolean;
  public isVegan!: boolean;
  public isGlutenFree!: boolean;
  public isSpicy!: boolean;
  public spiceLevel?: number;
  public calories?: number;
  public tags?: string[];
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
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'menu_categories',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'items',
        key: 'id',
      },
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
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    sku: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: [0, 50] as [number, number],
      },
    },
    barcode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: [0, 50] as [number, number],
      },
    },
    imageUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isUrl: true,
        len: [0, 255] as [number, number],
      },
    },
    ingredients: {
      type: DataTypes.TEXT, // Use TEXT instead of JSON for MS SQL Server
      allowNull: true,
      get: function (this: any): string[] {
        const value = this.getDataValue('ingredients');
        return value ? JSON.parse(value) : [];
      },
      set: function (this: any, value: string[] | null): void {
        this.setDataValue('ingredients', value ? JSON.stringify(value) : null);
      }
    },
    allergens: {
      type: DataTypes.TEXT, // Use TEXT instead of JSON for MS SQL Server
      allowNull: true,
      get: function (this: any): string[] {
        const value = this.getDataValue('allergens');
        return value ? JSON.parse(value) : [];
      },
      set: function (this: any, value: string[] | null): void {
        this.setDataValue('allergens', value ? JSON.stringify(value) : null);
      }
    },
    nutritionalInfo: {
      type: DataTypes.TEXT, // Use TEXT instead of JSON for MS SQL Server
      allowNull: true,
      get: function (this: any): any {
        const value = this.getDataValue('nutritionalInfo');
        return value ? JSON.parse(value) : {};
      },
      set: function (this: any, value: any): void {
        this.setDataValue('nutritionalInfo', value ? JSON.stringify(value) : null);
      }
    },
    preparationTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 15,
      validate: {
        min: 0,
        max: 480, // 8 hours max
      },
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    isVegetarian: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isVegan: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isGlutenFree: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isSpicy: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    spiceLevel: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
    },
    calories: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    tags: {
      type: DataTypes.TEXT, // Use TEXT instead of JSON for MS SQL Server
      allowNull: true,
      get: function (this: any): string[] {
        const value = this.getDataValue('tags');
        return value ? JSON.parse(value) : [];
      },
      set: function (this: any, value: string[] | null): void {
        this.setDataValue('tags', value ? JSON.stringify(value) : null);
      }
    },
  };

  // Business logic methods
  public getProfitMargin(): number {
    if (this.price === 0) return 0;
    return ((this.price - this.cost) / this.price) * 100;
  }

  public getProfitAmount(): number {
    return this.price - this.cost;
  }

  public isProfitable(): boolean {
    return this.price > this.cost;
  }

  public getDisplayPrice(): string {
    return `$${this.price.toFixed(2)}`;
  }

  public getDisplayCost(): string {
    return `$${this.cost.toFixed(2)}`;
  }

  public getPreparationTimeDisplay(): string {
    if (this.preparationTime < 60) {
      return `${this.preparationTime} min`;
    }
    const hours = Math.floor(this.preparationTime / 60);
    const minutes = this.preparationTime % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  public isQuickPrep(): boolean {
    return this.preparationTime <= 15;
  }

  public isSlowPrep(): boolean {
    return this.preparationTime > 30;
  }

  public hasAllergen(allergen: string): boolean {
    return this.allergens?.includes(allergen) || false;
  }

  public hasIngredient(ingredient: string): boolean {
    return this.ingredients?.some(ing => 
      ing.toLowerCase().includes(ingredient.toLowerCase())
    ) || false;
  }

  public hasTag(tag: string): boolean {
    return this.tags?.includes(tag) || false;
  }

  public getDietaryInfo(): string[] {
    const info: string[] = [];
    if (this.isVegetarian) info.push('Vegetarian');
    if (this.isVegan) info.push('Vegan');
    if (this.isGlutenFree) info.push('Gluten-Free');
    if (this.isSpicy) info.push('Spicy');
    return info;
  }

  public getSpiceLevelDisplay(): string {
    if (!this.isSpicy) return 'Not Spicy';
    if (!this.spiceLevel) return 'Spicy';
    const levels = ['', 'Mild', 'Medium', 'Hot', 'Very Hot', 'Extreme'];
    return levels[this.spiceLevel] || 'Spicy';
  }

  public isHealthy(): boolean {
    return this.calories ? this.calories < 500 : false;
  }

  public isHighCalorie(): boolean {
    return this.calories ? this.calories > 800 : false;
  }

  public updatePrice(newPrice: number): void {
    if (newPrice < 0) {
      throw new Error('Price cannot be negative');
    }
    this.price = newPrice;
  }

  public updateCost(newCost: number): void {
    if (newCost < 0) {
      throw new Error('Cost cannot be negative');
    }
    this.cost = newCost;
  }

  public setSpiceLevel(level: number): void {
    if (level < 1 || level > 5) {
      throw new Error('Spice level must be between 1 and 5');
    }
    this.spiceLevel = level;
    this.isSpicy = true;
  }

  public addIngredient(ingredient: string): void {
    const currentIngredients = this.ingredients || [];
    if (!currentIngredients.includes(ingredient)) {
      this.ingredients = [...currentIngredients, ingredient];
    }
  }

  public removeIngredient(ingredient: string): void {
    const currentIngredients = this.ingredients || [];
    this.ingredients = currentIngredients.filter(ing => ing !== ingredient);
  }

  public addAllergen(allergen: string): void {
    const currentAllergens = this.allergens || [];
    if (!currentAllergens.includes(allergen)) {
      this.allergens = [...currentAllergens, allergen];
    }
  }

  public removeAllergen(allergen: string): void {
    const currentAllergens = this.allergens || [];
    this.allergens = currentAllergens.filter(all => all !== allergen);
  }

  public addTag(tag: string): void {
    const currentTags = this.tags || [];
    if (!currentTags.includes(tag)) {
      this.tags = [...currentTags, tag];
    }
  }

  public removeTag(tag: string): void {
    const currentTags = this.tags || [];
    this.tags = currentTags.filter(t => t !== tag);
  }

  public makeAvailable(): void {
    this.isAvailable = true;
  }

  public makeUnavailable(): void {
    this.isAvailable = false;
  }

  public setVegetarian(isVegetarian: boolean): void {
    this.isVegetarian = isVegetarian;
    if (isVegetarian && this.isVegan) {
      this.isVegan = false; // Vegan is more restrictive than vegetarian
    }
  }

  public setVegan(isVegan: boolean): void {
    this.isVegan = isVegan;
    if (isVegan) {
      this.isVegetarian = true; // Vegan implies vegetarian
    }
  }

  public setGlutenFree(isGlutenFree: boolean): void {
    this.isGlutenFree = isGlutenFree;
  }

  public setSpicy(isSpicy: boolean): void {
    this.isSpicy = isSpicy;
    if (!isSpicy) {
      (this as any).spiceLevel = null;
    }
  }

  public getSearchableText(): string {
    const parts = [
      this.name,
      this.description,
      ...(this.ingredients || []),
      ...(this.tags || [])
    ].filter(Boolean);
    return parts.join(' ').toLowerCase();
  }

  public isPopular(): boolean {
    // This would typically be calculated from order history
    // For now, return false as placeholder
    return false;
  }

  public getNutritionalValue(nutrient: string): number | null {
    return this.nutritionalInfo?.[nutrient] || null;
  }

  public setNutritionalValue(nutrient: string, value: number): void {
    const currentNutritionalInfo = this.nutritionalInfo || {};
    this.nutritionalInfo = { ...currentNutritionalInfo, [nutrient]: value };
  }
}

export function initializeMenuItemModel(sequelize: Sequelize): void {
  MenuItemModel.init(MenuItemModel.definition, {
    sequelize,
    tableName: 'menu_items',
    timestamps: true,
    freezeTableName: true, // Prevent auto-table creation
    indexes: [
      {
        unique: true,
        fields: ['businessId', 'sku'],
      },
      {
        unique: true,
        fields: ['businessId', 'barcode'],
      },
      {
        fields: ['businessId', 'categoryId'],
      },
      {
        fields: ['businessId', 'isAvailable'],
      },
      {
        fields: ['businessId', 'isVegetarian'],
      },
      {
        fields: ['businessId', 'isVegan'],
      },
      {
        fields: ['businessId', 'isGlutenFree'],
      },
      {
        fields: ['businessId', 'isSpicy'],
      },
      {
        fields: ['businessId', 'price'],
      },
    ],
  });
} 