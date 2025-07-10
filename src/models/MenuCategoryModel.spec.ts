import { Sequelize, DataTypes, Model, Op } from 'sequelize';
import { MenuCategoryModel, initializeMenuCategoryModel } from './MenuCategoryModel';

// Minimal Business model for FK constraint
class Business extends Model {}

describe('MenuCategory Model', () => {
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
    initializeMenuCategoryModel(sequelize);
    await sequelize.sync({ force: true });
    // Insert dummy businesses for FK
    await Business.create({ id: 1 });
    await Business.create({ id: 2 });
  });

  afterEach(async () => {
    await sequelize.close();
  });

  describe('Creation', () => {
    it('should create a menu category with valid data', async () => {
      const categoryData = {
        businessId: 1,
        name: 'Appetizers',
        description: 'Start your meal with our delicious appetizers',
        displayOrder: 1,
        imageUrl: 'https://example.com/appetizers.jpg',
        colorCode: '#FF6B6B'
      };

      const category = await MenuCategoryModel.create(categoryData);

      expect(category).toBeDefined();
      expect(category.id).toBeDefined();
      expect(category.name).toBe(categoryData.name);
      expect(category.description).toBe(categoryData.description);
      expect(category.displayOrder).toBe(categoryData.displayOrder);
      expect(category.isActive).toBe(true);
      expect(category.imageUrl).toBe(categoryData.imageUrl);
      expect(category.colorCode).toBe(categoryData.colorCode);
      expect(category.createdAt).toBeDefined();
      expect(category.updatedAt).toBeDefined();
    });

    it('should create a menu category with minimal required data', async () => {
      const categoryData = {
        businessId: 1,
        name: 'Main Course'
      };

      const category = await MenuCategoryModel.create(categoryData);

      expect(category).toBeDefined();
      expect(category.id).toBeDefined();
      expect(category.name).toBe(categoryData.name);
      expect(category.businessId).toBe(categoryData.businessId);
      expect(category.description).toBeUndefined();
      expect(category.displayOrder).toBe(0);
      expect(category.isActive).toBe(true);
      expect(category.imageUrl).toBeUndefined();
      expect(category.colorCode).toBeUndefined();
    });
  });

  describe('Validation', () => {
    it('should require businessId', async () => {
      const categoryData = {
        name: 'Appetizers'
      };
      await expect(MenuCategoryModel.create(categoryData as any)).rejects.toThrow();
    });

    it('should require name', async () => {
      const categoryData = {
        businessId: 1
      };
      await expect(MenuCategoryModel.create(categoryData as any)).rejects.toThrow();
    });

    it('should validate name length', async () => {
      const categoryData = {
        businessId: 1,
        name: 'A'.repeat(256) // Too long
      };
      await expect(MenuCategoryModel.create(categoryData)).rejects.toThrow();
    });

    it('should validate description length', async () => {
      const categoryData = {
        businessId: 1,
        name: 'Appetizers',
        description: 'A'.repeat(501) // Too long
      };
      await expect(MenuCategoryModel.create(categoryData)).rejects.toThrow();
    });

    it('should validate display order minimum', async () => {
      const categoryData = {
        businessId: 1,
        name: 'Appetizers',
        displayOrder: -1
      };
      await expect(MenuCategoryModel.create(categoryData)).rejects.toThrow();
    });

    it('should validate image URL format', async () => {
      const categoryData = {
        businessId: 1,
        name: 'Appetizers',
        imageUrl: 'invalid-url'
      };
      await expect(MenuCategoryModel.create(categoryData)).rejects.toThrow();
    });

    it('should validate color code format', async () => {
      const categoryData = {
        businessId: 1,
        name: 'Appetizers',
        colorCode: 'invalid-color'
      };
      await expect(MenuCategoryModel.create(categoryData)).rejects.toThrow();
    });

    it('should accept valid hex color codes', async () => {
      const categoryData = {
        businessId: 1,
        name: 'Appetizers',
        colorCode: '#FF6B6B'
      };
      const category = await MenuCategoryModel.create(categoryData);
      expect(category.colorCode).toBe('#FF6B6B');
    });
  });

  describe('Queries', () => {
    beforeEach(async () => {
      await MenuCategoryModel.bulkCreate([
        {
          businessId: 1,
          name: 'Appetizers',
          displayOrder: 1,
          isActive: true
        },
        {
          businessId: 1,
          name: 'Main Course',
          displayOrder: 2,
          isActive: true
        },
        {
          businessId: 1,
          name: 'Desserts',
          displayOrder: 3,
          isActive: false
        },
        {
          businessId: 2,
          name: 'Beverages',
          displayOrder: 1,
          isActive: true
        }
      ]);
    });

    it('should find categories by businessId', async () => {
      const categories = await MenuCategoryModel.findAll({
        where: { businessId: 1 }
      });
      expect(categories).toHaveLength(3);
      expect(categories.every(c => c.businessId === 1)).toBe(true);
    });

    it('should find active categories only', async () => {
      const categories = await MenuCategoryModel.findAll({
        where: { isActive: true }
      });
      expect(categories).toHaveLength(3);
      expect(categories.every(c => c.isActive)).toBe(true);
    });

    it('should find category by name', async () => {
      const category = await MenuCategoryModel.findOne({
        where: { name: 'Appetizers' }
      });
      expect(category).toBeDefined();
      expect(category?.name).toBe('Appetizers');
    });

    it('should order categories by display order', async () => {
      const categories = await MenuCategoryModel.findAll({
        where: { businessId: 1 },
        order: [['displayOrder', 'ASC']]
      });
      expect(categories[0]?.name).toBe('Appetizers');
      expect(categories[1]?.name).toBe('Main Course');
      expect(categories[2]?.name).toBe('Desserts');
    });

    it('should search categories by name', async () => {
      const categories = await MenuCategoryModel.findAll({
        where: {
          name: {
            [Op.like]: '%Course%'
          }
        }
      });
      expect(categories).toHaveLength(1);
      expect(categories[0]?.name).toBe('Main Course');
    });
  });

  describe('Operations', () => {
    let category: MenuCategoryModel;

    beforeEach(async () => {
      category = await MenuCategoryModel.create({
        businessId: 1,
        name: 'Appetizers',
        description: 'Start your meal',
        displayOrder: 1
      });
    });

    it('should update category information', async () => {
      const updatedData = {
        name: 'Starters',
        description: 'Begin your dining experience',
        displayOrder: 2
      };
      await category.update(updatedData);
      expect(category.name).toBe(updatedData.name);
      expect(category.description).toBe(updatedData.description);
      expect(category.displayOrder).toBe(updatedData.displayOrder);
    });

    it('should delete category', async () => {
      const categoryId = category.id;
      await category.destroy();
      const deletedCategory = await MenuCategoryModel.findByPk(categoryId);
      expect(deletedCategory).toBeNull();
    });

    it('should activate category', async () => {
      await category.update({ isActive: false });
      category.activate();
      expect(category.isActive).toBe(true);
    });

    it('should deactivate category', async () => {
      category.deactivate();
      expect(category.isActive).toBe(false);
    });

    it('should move category to new position', async () => {
      category.moveToPosition(5);
      expect(category.displayOrder).toBe(5);
    });

    it('should update image URL', async () => {
      category.updateImage('https://example.com/new-image.jpg');
      expect(category.imageUrl).toBe('https://example.com/new-image.jpg');
    });

    it('should set color code', async () => {
      category.setColor('#00FF00');
      expect(category.colorCode).toBe('#00FF00');
    });
  });

  describe('Business Logic', () => {
    let category: MenuCategoryModel;

    beforeEach(async () => {
      category = await MenuCategoryModel.create({
        businessId: 1,
        name: 'Appetizers',
        description: 'Start your meal',
        displayOrder: 1,
        colorCode: '#FF6B6B'
      });
    });

    it('should check if category is visible', () => {
      expect(category.isVisible()).toBe(true);
      category.isActive = false;
      expect(category.isVisible()).toBe(false);
    });

    it('should get display name', () => {
      expect(category.getDisplayName()).toBe('Appetizers');
    });

    it('should get full description', () => {
      expect(category.getFullDescription()).toBe('Start your meal');
      (category as any).description = null;
      expect(category.getFullDescription()).toBe('Menu category: Appetizers');
    });

    it('should get color style', () => {
      expect(category.getColorStyle()).toBe('#FF6B6B');
      (category as any).colorCode = null;
      expect(category.getColorStyle()).toBe('#000000');
    });

    it('should check if category is default', () => {
      expect(category.isDefaultCategory()).toBe(false);
      category.displayOrder = 0;
      expect(category.isDefaultCategory()).toBe(true);
    });

    it('should check if category is premium', () => {
      expect(category.isPremiumCategory()).toBe(false);
      category.displayOrder = 150;
      expect(category.isPremiumCategory()).toBe(true);
    });

    it('should check if category can be deleted', () => {
      expect(category.canBeDeleted()).toBe(true);
      category.displayOrder = 0;
      expect(category.canBeDeleted()).toBe(false);
    });

    it('should get category type', () => {
      expect(category.getCategoryType()).toBe('primary');
      category.displayOrder = 0;
      expect(category.getCategoryType()).toBe('default');
      category.displayOrder = 25;
      expect(category.getCategoryType()).toBe('secondary');
      category.displayOrder = 75;
      expect(category.getCategoryType()).toBe('special');
    });

    it('should check if category should show in menu', () => {
      expect(category.shouldShowInMenu()).toBe(true);
      category.isActive = false;
      expect(category.shouldShowInMenu()).toBe(false);
    });

    it('should get sort key', () => {
      const sortKey = category.getSortKey();
      expect(sortKey).toBe(1000 + category.id);
    });
  });

  describe('Validation Methods', () => {
    let category: MenuCategoryModel;

    beforeEach(async () => {
      category = await MenuCategoryModel.create({
        businessId: 1,
        name: 'Appetizers',
        displayOrder: 1
      });
    });

    it('should validate move to negative position', () => {
      expect(() => category.moveToPosition(-1)).toThrow('Display order cannot be negative');
    });

    it('should validate deactivate default category', () => {
      category.displayOrder = 0;
      expect(() => category.deactivate()).toThrow('Default category cannot be deactivated');
    });

    it('should validate invalid image URL', () => {
      expect(() => category.updateImage('invalid-url')).toThrow('Image URL must be a valid HTTP/HTTPS URL');
    });

    it('should validate invalid color code', () => {
      expect(() => category.setColor('invalid-color')).toThrow('Color code must be a valid hex color');
    });

    it('should accept valid image URL', () => {
      expect(() => category.updateImage('https://example.com/image.jpg')).not.toThrow();
    });

    it('should accept valid color code', () => {
      expect(() => category.setColor('#FF0000')).not.toThrow();
    });
  });

  describe('Relationships', () => {
    it('should belong to a business', async () => {
      const category = await MenuCategoryModel.create({
        businessId: 1,
        name: 'Appetizers'
      });
      expect(category.businessId).toBe(1);
    });

    it('should have unique name per business', async () => {
      await MenuCategoryModel.create({
        businessId: 1,
        name: 'Appetizers'
      });
      await expect(MenuCategoryModel.create({
        businessId: 1,
        name: 'Appetizers'
      })).rejects.toThrow();
    });

    it('should allow same name across different businesses', async () => {
      await MenuCategoryModel.create({
        businessId: 1,
        name: 'Appetizers'
      });
      const category2 = await MenuCategoryModel.create({
        businessId: 2,
        name: 'Appetizers'
      });
      expect(category2).toBeDefined();
      expect(category2.businessId).toBe(2);
    });
  });
}); 