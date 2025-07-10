import { Sequelize, DataTypes, Model, Op } from 'sequelize';
import { MenuItemModel, initializeMenuItemModel } from './MenuItemModel';
import { MenuCategoryModel, initializeMenuCategoryModel } from './MenuCategoryModel';

// Minimal Business model for FK constraint
class Business extends Model {}

describe('MenuItem Model', () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });
    // Define minimal businesses table
    Business.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
    }, { sequelize, tableName: 'businesses', timestamps: false });
    
    // Initialize both models
    initializeMenuCategoryModel(sequelize);
    initializeMenuItemModel(sequelize);
    
    await sequelize.sync({ force: true });
    
    // Insert dummy businesses and categories for FK
    await Business.create({ id: 1 });
    await Business.create({ id: 2 });
    await MenuCategoryModel.create({ businessId: 1, name: 'Appetizers' });
    await MenuCategoryModel.create({ businessId: 1, name: 'Main Course' });
    await MenuCategoryModel.create({ businessId: 2, name: 'Beverages' });
  });

  afterEach(async () => {
    await sequelize.close();
  });

  describe('Creation', () => {
    it('should create a menu item with valid data', async () => {
      const itemData = {
        businessId: 1,
        categoryId: 1,
        name: 'Chicken Wings',
        description: 'Crispy fried chicken wings with your choice of sauce',
        price: 12.99,
        cost: 6.50,
        sku: 'WINGS-001',
        barcode: '1234567890123',
        imageUrl: 'https://example.com/wings.jpg',
        ingredients: ['chicken', 'flour', 'oil', 'sauce'],
        allergens: ['gluten'],
        preparationTime: 20,
        isSpicy: true,
        spiceLevel: 3,
        calories: 450,
        tags: ['popular', 'appetizer']
      };

      const item = await MenuItemModel.create(itemData);

      expect(item).toBeDefined();
      expect(item.id).toBeDefined();
      expect(item.name).toBe(itemData.name);
      expect(item.description).toBe(itemData.description);
      expect(item.price).toBe(itemData.price);
      expect(item.cost).toBe(itemData.cost);
      expect(item.sku).toBe(itemData.sku);
      expect(item.barcode).toBe(itemData.barcode);
      expect(item.imageUrl).toBe(itemData.imageUrl);
      expect(item.ingredients).toEqual(itemData.ingredients);
      expect(item.allergens).toEqual(itemData.allergens);
      expect(item.preparationTime).toBe(itemData.preparationTime);
      expect(item.isAvailable).toBe(true);
      expect(item.isVegetarian).toBe(false);
      expect(item.isVegan).toBe(false);
      expect(item.isGlutenFree).toBe(false);
      expect(item.isSpicy).toBe(itemData.isSpicy);
      expect(item.spiceLevel).toBe(itemData.spiceLevel);
      expect(item.calories).toBe(itemData.calories);
      expect(item.tags).toEqual(itemData.tags);
      expect(item.createdAt).toBeDefined();
      expect(item.updatedAt).toBeDefined();
    });

    it('should create a menu item with minimal required data', async () => {
      const itemData = {
        businessId: 1,
        categoryId: 1,
        name: 'Simple Item'
      };

      const item = await MenuItemModel.create(itemData);

      expect(item).toBeDefined();
      expect(item.id).toBeDefined();
      expect(item.name).toBe(itemData.name);
      expect(item.businessId).toBe(itemData.businessId);
      expect(item.categoryId).toBe(itemData.categoryId);
      expect(item.price).toBe(0);
      expect(item.cost).toBe(0);
      expect(item.preparationTime).toBe(15);
      expect(item.isAvailable).toBe(true);
      expect(item.isVegetarian).toBe(false);
      expect(item.isVegan).toBe(false);
      expect(item.isGlutenFree).toBe(false);
      expect(item.isSpicy).toBe(false);
    });
  });

  describe('Validation', () => {
    it('should require businessId', async () => {
      const itemData = {
        categoryId: 1,
        name: 'Test Item'
      };
      await expect(MenuItemModel.create(itemData as any)).rejects.toThrow();
    });

    it('should require categoryId', async () => {
      const itemData = {
        businessId: 1,
        name: 'Test Item'
      };
      await expect(MenuItemModel.create(itemData as any)).rejects.toThrow();
    });

    it('should require name', async () => {
      const itemData = {
        businessId: 1,
        categoryId: 1
      };
      await expect(MenuItemModel.create(itemData as any)).rejects.toThrow();
    });

    it('should validate name length', async () => {
      const itemData = {
        businessId: 1,
        categoryId: 1,
        name: 'A'.repeat(256) // Too long
      };
      await expect(MenuItemModel.create(itemData)).rejects.toThrow();
    });

    it('should validate description length', async () => {
      const itemData = {
        businessId: 1,
        categoryId: 1,
        name: 'Test Item',
        description: 'A'.repeat(501) // Too long
      };
      await expect(MenuItemModel.create(itemData)).rejects.toThrow();
    });

    it('should validate price minimum', async () => {
      const itemData = {
        businessId: 1,
        categoryId: 1,
        name: 'Test Item',
        price: -1
      };
      await expect(MenuItemModel.create(itemData)).rejects.toThrow();
    });

    it('should validate cost minimum', async () => {
      const itemData = {
        businessId: 1,
        categoryId: 1,
        name: 'Test Item',
        cost: -1
      };
      await expect(MenuItemModel.create(itemData)).rejects.toThrow();
    });

    it('should validate preparation time range', async () => {
      const itemData = {
        businessId: 1,
        categoryId: 1,
        name: 'Test Item',
        preparationTime: 500 // Too long
      };
      await expect(MenuItemModel.create(itemData)).rejects.toThrow();
    });

    it('should validate spice level range', async () => {
      const itemData = {
        businessId: 1,
        categoryId: 1,
        name: 'Test Item',
        spiceLevel: 6 // Too high
      };
      await expect(MenuItemModel.create(itemData)).rejects.toThrow();
    });

    it('should validate calories minimum', async () => {
      const itemData = {
        businessId: 1,
        categoryId: 1,
        name: 'Test Item',
        calories: -1
      };
      await expect(MenuItemModel.create(itemData)).rejects.toThrow();
    });

    it('should validate image URL format', async () => {
      const itemData = {
        businessId: 1,
        categoryId: 1,
        name: 'Test Item',
        imageUrl: 'invalid-url'
      };
      await expect(MenuItemModel.create(itemData)).rejects.toThrow();
    });
  });

  describe('Queries', () => {
    beforeEach(async () => {
      await MenuItemModel.bulkCreate([
        {
          businessId: 1,
          categoryId: 1,
          name: 'Chicken Wings',
          price: 12.99,
          cost: 6.50,
          isAvailable: true,
          isVegetarian: false
        },
        {
          businessId: 1,
          categoryId: 1,
          name: 'Veggie Spring Rolls',
          price: 8.99,
          cost: 4.00,
          isAvailable: true,
          isVegetarian: true
        },
        {
          businessId: 1,
          categoryId: 2,
          name: 'Grilled Salmon',
          price: 24.99,
          cost: 12.00,
          isAvailable: false,
          isVegetarian: false
        },
        {
          businessId: 2,
          categoryId: 3,
          name: 'Fresh Juice',
          price: 5.99,
          cost: 2.00,
          isAvailable: true,
          isVegetarian: true
        }
      ]);
    });

    it('should find items by businessId', async () => {
      const items = await MenuItemModel.findAll({
        where: { businessId: 1 }
      });
      expect(items).toHaveLength(3);
      expect(items.every(item => item.businessId === 1)).toBe(true);
    });

    it('should find items by categoryId', async () => {
      const items = await MenuItemModel.findAll({
        where: { categoryId: 1 }
      });
      expect(items).toHaveLength(2);
      expect(items.every(item => item.categoryId === 1)).toBe(true);
    });

    it('should find available items only', async () => {
      const items = await MenuItemModel.findAll({
        where: { isAvailable: true }
      });
      expect(items).toHaveLength(3);
      expect(items.every(item => item.isAvailable)).toBe(true);
    });

    it('should find vegetarian items', async () => {
      const items = await MenuItemModel.findAll({
        where: { isVegetarian: true }
      });
      expect(items).toHaveLength(2);
      expect(items.every(item => item.isVegetarian)).toBe(true);
    });

    it('should find items by price range', async () => {
      const items = await MenuItemModel.findAll({
        where: {
          price: {
            [Op.between]: [10, 20]
          }
        }
      });
      expect(items).toHaveLength(1);
      expect(items[0]?.name).toBe('Chicken Wings');
    });

    it('should search items by name', async () => {
      const items = await MenuItemModel.findAll({
        where: {
          name: {
            [Op.like]: '%Chicken%'
          }
        }
      });
      expect(items).toHaveLength(1);
      expect(items[0]?.name).toBe('Chicken Wings');
    });
  });

  describe('Operations', () => {
    let item: MenuItemModel;

    beforeEach(async () => {
      item = await MenuItemModel.create({
        businessId: 1,
        categoryId: 1,
        name: 'Test Item',
        price: 15.99,
        cost: 8.00,
        preparationTime: 25
      });
    });

    it('should update item information', async () => {
      const updatedData = {
        name: 'Updated Item',
        description: 'Updated description',
        price: 18.99,
        preparationTime: 30
      };
      await item.update(updatedData);
      expect(item.name).toBe(updatedData.name);
      expect(item.description).toBe(updatedData.description);
      expect(item.price).toBe(updatedData.price);
      expect(item.preparationTime).toBe(updatedData.preparationTime);
    });

    it('should delete item', async () => {
      const itemId = item.id;
      await item.destroy();
      const deletedItem = await MenuItemModel.findByPk(itemId);
      expect(deletedItem).toBeNull();
    });

    it('should make item available/unavailable', async () => {
      item.makeUnavailable();
      expect(item.isAvailable).toBe(false);
      item.makeAvailable();
      expect(item.isAvailable).toBe(true);
    });

    it('should update price and cost', async () => {
      item.updatePrice(20.99);
      expect(item.price).toBe(20.99);
      item.updateCost(10.50);
      expect(item.cost).toBe(10.50);
    });

    it('should set spice level', async () => {
      item.setSpiceLevel(4);
      expect(item.spiceLevel).toBe(4);
      expect(item.isSpicy).toBe(true);
    });

    it('should add and remove ingredients', async () => {
      item.addIngredient('salt');
      await item.save();
      await item.reload();
      expect(item.ingredients).toContain('salt');
      item.removeIngredient('salt');
      await item.save();
      await item.reload();
      expect(item.ingredients).not.toContain('salt');
    });

    it('should add and remove allergens', async () => {
      item.addAllergen('nuts');
      await item.save();
      await item.reload();
      expect(item.allergens).toContain('nuts');
      item.removeAllergen('nuts');
      await item.save();
      await item.reload();
      expect(item.allergens).not.toContain('nuts');
    });

    it('should add and remove tags', async () => {
      item.addTag('chef-special');
      await item.save();
      await item.reload();
      expect(item.tags).toContain('chef-special');
      item.removeTag('chef-special');
      await item.save();
      await item.reload();
      expect(item.tags).not.toContain('chef-special');
    });
  });

  describe('Business Logic', () => {
    let item: MenuItemModel;

    beforeEach(async () => {
      item = await MenuItemModel.create({
        businessId: 1,
        categoryId: 1,
        name: 'Test Item',
        price: 15.99,
        cost: 8.00,
        preparationTime: 25,
        ingredients: ['chicken', 'rice', 'vegetables'],
        allergens: ['gluten'],
        tags: ['popular', 'healthy']
      });
    });

    it('should calculate profit margin', () => {
      const margin = item.getProfitMargin();
      expect(margin).toBeCloseTo(49.97, 1); // (15.99 - 8.00) / 15.99 * 100
    });

    it('should calculate profit amount', () => {
      const profit = item.getProfitAmount();
      expect(profit).toBe(7.99);
    });

    it('should check if item is profitable', () => {
      expect(item.isProfitable()).toBe(true);
      item.cost = 20.00;
      expect(item.isProfitable()).toBe(false);
    });

    it('should get display price and cost', () => {
      expect(item.getDisplayPrice()).toBe('$15.99');
      expect(item.getDisplayCost()).toBe('$8.00');
    });

    it('should get preparation time display', () => {
      expect(item.getPreparationTimeDisplay()).toBe('25 min');
      item.preparationTime = 90;
      expect(item.getPreparationTimeDisplay()).toBe('1h 30m');
      item.preparationTime = 120;
      expect(item.getPreparationTimeDisplay()).toBe('2h');
    });

    it('should check preparation time categories', () => {
      expect(item.isQuickPrep()).toBe(false);
      expect(item.isSlowPrep()).toBe(false);
      item.preparationTime = 10;
      expect(item.isQuickPrep()).toBe(true);
      item.preparationTime = 45;
      expect(item.isSlowPrep()).toBe(true);
    });

    it('should check for allergens and ingredients', () => {
      expect(item.hasAllergen('gluten')).toBe(true);
      expect(item.hasAllergen('nuts')).toBe(false);
      expect(item.hasIngredient('chicken')).toBe(true);
      expect(item.hasIngredient('beef')).toBe(false);
    });

    it('should check for tags', () => {
      expect(item.hasTag('popular')).toBe(true);
      expect(item.hasTag('expensive')).toBe(false);
    });

    it('should get dietary information', () => {
      expect(item.getDietaryInfo()).toEqual([]);
      item.isVegetarian = true;
      expect(item.getDietaryInfo()).toContain('Vegetarian');
      item.isSpicy = true;
      expect(item.getDietaryInfo()).toContain('Spicy');
    });

    it('should get spice level display', () => {
      expect(item.getSpiceLevelDisplay()).toBe('Not Spicy');
      item.isSpicy = true;
      expect(item.getSpiceLevelDisplay()).toBe('Spicy');
      item.spiceLevel = 3;
      expect(item.getSpiceLevelDisplay()).toBe('Hot');
    });

    it('should check calorie categories', () => {
      expect(item.isHealthy()).toBe(false);
      expect(item.isHighCalorie()).toBe(false);
      item.calories = 300;
      expect(item.isHealthy()).toBe(true);
      item.calories = 900;
      expect(item.isHighCalorie()).toBe(true);
    });

    it('should get searchable text', () => {
      const searchText = item.getSearchableText();
      expect(searchText).toContain('test item');
      expect(searchText).toContain('chicken');
      expect(searchText).toContain('popular');
    });

    it('should manage nutritional values', async () => {
      expect(item.getNutritionalValue('protein')).toBeNull();
      item.setNutritionalValue('protein', 25);
      await item.save();
      await item.reload();
      expect(item.getNutritionalValue('protein')).toBe(25);
    });
  });

  describe('Dietary Settings', () => {
    let item: MenuItemModel;

    beforeEach(async () => {
      item = await MenuItemModel.create({
        businessId: 1,
        categoryId: 1,
        name: 'Test Item',
        price: 15.99,
        cost: 8.00
      });
    });

    it('should set vegetarian status', () => {
      item.setVegetarian(true);
      expect(item.isVegetarian).toBe(true);
      item.setVegetarian(false);
      expect(item.isVegetarian).toBe(false);
    });

    it('should set vegan status', () => {
      item.setVegan(true);
      expect(item.isVegan).toBe(true);
      expect(item.isVegetarian).toBe(true); // Vegan implies vegetarian
      item.setVegan(false);
      expect(item.isVegan).toBe(false);
    });

    it('should set gluten free status', () => {
      item.setGlutenFree(true);
      expect(item.isGlutenFree).toBe(true);
      item.setGlutenFree(false);
      expect(item.isGlutenFree).toBe(false);
    });

    it('should set spicy status', () => {
      item.setSpicy(true);
      expect(item.isSpicy).toBe(true);
      item.setSpicy(false);
      expect(item.isSpicy).toBe(false);
      expect(item.spiceLevel).toBeNull();
    });
  });

  describe('Validation Methods', () => {
    let item: MenuItemModel;

    beforeEach(async () => {
      item = await MenuItemModel.create({
        businessId: 1,
        categoryId: 1,
        name: 'Test Item',
        price: 15.99,
        cost: 8.00
      });
    });

    it('should validate negative price', () => {
      expect(() => item.updatePrice(-1)).toThrow('Price cannot be negative');
    });

    it('should validate negative cost', () => {
      expect(() => item.updateCost(-1)).toThrow('Cost cannot be negative');
    });

    it('should validate spice level range', () => {
      expect(() => item.setSpiceLevel(0)).toThrow('Spice level must be between 1 and 5');
      expect(() => item.setSpiceLevel(6)).toThrow('Spice level must be between 1 and 5');
    });
  });

  describe('Relationships', () => {
    it('should belong to a business', async () => {
      const item = await MenuItemModel.create({
        businessId: 1,
        categoryId: 1,
        name: 'Test Item'
      });
      expect(item.businessId).toBe(1);
    });

    it('should belong to a category', async () => {
      const item = await MenuItemModel.create({
        businessId: 1,
        categoryId: 1,
        name: 'Test Item'
      });
      expect(item.categoryId).toBe(1);
    });

    it('should have unique SKU per business', async () => {
      await MenuItemModel.create({
        businessId: 1,
        categoryId: 1,
        name: 'Item 1',
        sku: 'SKU-001'
      });
      await expect(MenuItemModel.create({
        businessId: 1,
        categoryId: 1,
        name: 'Item 2',
        sku: 'SKU-001'
      })).rejects.toThrow();
    });

    it('should have unique barcode per business', async () => {
      await MenuItemModel.create({
        businessId: 1,
        categoryId: 1,
        name: 'Item 1',
        barcode: '123456789'
      });
      await expect(MenuItemModel.create({
        businessId: 1,
        categoryId: 1,
        name: 'Item 2',
        barcode: '123456789'
      })).rejects.toThrow();
    });

    it('should allow same SKU across different businesses', async () => {
      await MenuItemModel.create({
        businessId: 1,
        categoryId: 1,
        name: 'Item 1',
        sku: 'SKU-001'
      });
      const item2 = await MenuItemModel.create({
        businessId: 2,
        categoryId: 3,
        name: 'Item 2',
        sku: 'SKU-001'
      });
      expect(item2).toBeDefined();
      expect(item2.businessId).toBe(2);
    });
  });
}); 