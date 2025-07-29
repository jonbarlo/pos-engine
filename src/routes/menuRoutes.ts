import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { MenuCategoryModel } from '../models/MenuCategoryModel';
import { MenuItemModel } from '../models/MenuItemModel';
import { BusinessModel } from '../models/BusinessModel';
import { generateSku, generateBarcode } from '../utils/skuGenerator';
import { isRestaurantBusiness } from '../utils/businessTypeCheck';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     MenuCategory:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated category ID
 *         businessId:
 *           type: integer
 *           description: Business ID this category belongs to
 *         name:
 *           type: string
 *           maxLength: 100
 *           description: Category name
 *         description:
 *           type: string
 *           maxLength: 500
 *           description: Category description
 *         displayOrder:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *           description: Display order for menu presentation
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether category is active
 *         imageUrl:
 *           type: string
 *           format: uri
 *           maxLength: 255
 *           description: Category image URL
 *         colorCode:
 *           type: string
 *           pattern: '^#[0-9A-F]{6}$'
 *           description: Hex color code for category
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     MenuItem:
 *       type: object
 *       required:
 *         - name
 *         - categoryId
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated item ID
 *         businessId:
 *           type: integer
 *           description: Business ID this item belongs to
 *         categoryId:
 *           type: integer
 *           description: Category ID this item belongs to
 *         name:
 *           type: string
 *           maxLength: 100
 *           description: Item name
 *         description:
 *           type: string
 *           maxLength: 500
 *           description: Item description
 *         price:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           description: Item price
 *         cost:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           description: Item cost
 *         imageUrl:
 *           type: string
 *           format: uri
 *           maxLength: 255
 *           description: Item image URL
 *         ingredients:
 *           type: array
 *           items:
 *             type: string
 *           description: List of ingredients
 *         allergens:
 *           type: array
 *           items:
 *             type: string
 *           description: List of allergens
 *         preparationTime:
 *           type: integer
 *           minimum: 0
 *           maximum: 480
 *           default: 15
 *           description: Preparation time in minutes
 *         isAvailable:
 *           type: boolean
 *           default: true
 *           description: Whether item is available
 *         isVegetarian:
 *           type: boolean
 *           default: false
 *           description: Whether item is vegetarian
 *         isVegan:
 *           type: boolean
 *           default: false
 *           description: Whether item is vegan
 *         isGlutenFree:
 *           type: boolean
 *           default: false
 *           description: Whether item is gluten-free
 *         isSpicy:
 *           type: boolean
 *           default: false
 *           description: Whether item is spicy
 *         spiceLevel:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: Spice level (1-5)
 *         calories:
 *           type: integer
 *           minimum: 0
 *           description: Calorie count
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Item tags
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/menu/categories:
 *   get:
 *     summary: Get all menu categories for a business
 *     tags: [Menu Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: businessId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Business ID
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of menu categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MenuCategory'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a restaurant business
 */
router.get('/categories', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const businessId = parseInt(req.query.businessId as string);
    if (!businessId) {
      res.status(400).json({ success: false, message: 'Business ID is required' });
      return;
    }

    // Check if business is restaurant type
    if (!(await isRestaurantBusiness(businessId))) {
      res.status(403).json({ success: false, message: 'Menu management is only available for restaurant businesses' });
      return;
    }

    const whereClause: any = { businessId };
    if (req.query.active !== undefined) {
      whereClause.isActive = req.query.active === 'true';
    }

    const categories = await MenuCategoryModel.findAll({
      where: whereClause,
      order: [['displayOrder', 'ASC'], ['name', 'ASC']]
    });

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching menu categories:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/menu/categories:
 *   post:
 *     summary: Create a new menu category
 *     tags: [Menu Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessId
 *               - name
 *             properties:
 *               businessId:
 *                 type: integer
 *               name:
 *                 type: string
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               displayOrder:
 *                 type: integer
 *                 minimum: 0
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *               colorCode:
 *                 type: string
 *                 pattern: '^#[0-9A-F]{6}$'
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/MenuCategory'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a restaurant business
 */
router.post('/categories', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { businessId, name, description, displayOrder, imageUrl, colorCode } = req.body;

    if (!businessId || !name) {
      res.status(400).json({ success: false, message: 'Business ID and name are required' });
      return;
    }

    // Check if business is restaurant type
    if (!(await isRestaurantBusiness(businessId))) {
      res.status(403).json({ success: false, message: 'Menu management is only available for restaurant businesses' });
      return;
    }

    const category = await MenuCategoryModel.create({
      businessId,
      name,
      description,
      displayOrder: displayOrder || 0,
      imageUrl,
      colorCode
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    console.error('Error creating menu category:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/menu/categories/{id}:
 *   put:
 *     summary: Update a menu category
 *     tags: [Menu Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               displayOrder:
 *                 type: integer
 *                 minimum: 0
 *               isActive:
 *                 type: boolean
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *               colorCode:
 *                 type: string
 *                 pattern: '^#[0-9A-F]{6}$'
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/MenuCategory'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 */
router.put('/categories/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const categoryId = parseInt(req.params.id || '0');
    const { name, description, displayOrder, isActive, imageUrl, colorCode } = req.body;

    const category = await MenuCategoryModel.findByPk(categoryId);
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }

    await category.update({
      name,
      description,
      displayOrder,
      isActive,
      imageUrl,
      colorCode
    });

    res.json({ success: true, data: category });
  } catch (error) {
    console.error('Error updating menu category:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/menu/categories/{id}:
 *   delete:
 *     summary: Delete a menu category
 *     tags: [Menu Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 */
router.delete('/categories/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const categoryId = parseInt(req.params.id || '0');

    const category = await MenuCategoryModel.findByPk(categoryId);
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }

    // Check if category can be deleted (not default category)
    if (!category.canBeDeleted()) {
      res.status(400).json({ success: false, message: 'Default category cannot be deleted' });
      return;
    }

    await category.destroy();
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu category:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/menu/items:
 *   get:
 *     summary: Get all menu items for a business
 *     tags: [Menu Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: businessId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Business ID
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Filter by category ID
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *         description: Filter by availability
 *       - in: query
 *         name: vegetarian
 *         schema:
 *           type: boolean
 *         description: Filter by vegetarian status
 *       - in: query
 *         name: vegan
 *         schema:
 *           type: boolean
 *         description: Filter by vegan status
 *       - in: query
 *         name: glutenFree
 *         schema:
 *           type: boolean
 *         description: Filter by gluten-free status
 *       - in: query
 *         name: spicy
 *         schema:
 *           type: boolean
 *         description: Filter by spicy status
 *     responses:
 *       200:
 *         description: List of menu items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MenuItem'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a restaurant business
 */
router.get('/items', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const businessId = parseInt(req.query.businessId as string);
    if (!businessId) {
      res.status(400).json({ success: false, message: 'Business ID is required' });
      return;
    }

    // Check if business is restaurant type
    if (!(await isRestaurantBusiness(businessId))) {
      res.status(403).json({ success: false, message: 'Menu management is only available for restaurant businesses' });
      return;
    }

    const whereClause: any = { businessId };
    
    // Apply filters
    if (req.query.categoryId) {
      whereClause.categoryId = parseInt(req.query.categoryId as string);
    }
    if (req.query.available !== undefined) {
      whereClause.isAvailable = req.query.available === 'true';
    }
    if (req.query.vegetarian !== undefined) {
      whereClause.isVegetarian = req.query.vegetarian === 'true';
    }
    if (req.query.vegan !== undefined) {
      whereClause.isVegan = req.query.vegan === 'true';
    }
    if (req.query.glutenFree !== undefined) {
      whereClause.isGlutenFree = req.query.glutenFree === 'true';
    }
    if (req.query.spicy !== undefined) {
      whereClause.isSpicy = req.query.spicy === 'true';
    }

    const items = await MenuItemModel.findAll({
      where: whereClause,
      order: [['categoryId', 'ASC'], ['name', 'ASC']]
    });

    res.json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/menu/items:
 *   post:
 *     summary: Create a new menu item
 *     tags: [Menu Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessId
 *               - categoryId
 *               - name
 *             properties:
 *               businessId:
 *                 type: integer
 *               categoryId:
 *                 type: integer
 *               name:
 *                 type: string
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               price:
 *                 type: number
 *                 minimum: 0
 *               cost:
 *                 type: number
 *                 minimum: 0
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *               allergens:
 *                 type: array
 *                 items:
 *                   type: string
 *               preparationTime:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 480
 *               isVegetarian:
 *                 type: boolean
 *               isVegan:
 *                 type: boolean
 *               isGlutenFree:
 *                 type: boolean
 *               isSpicy:
 *                 type: boolean
 *               spiceLevel:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               calories:
 *                 type: integer
 *                 minimum: 0
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/MenuItem'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a restaurant business
 */
router.post('/items', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      businessId, categoryId, name, description, price, cost,
      imageUrl, ingredients, allergens, preparationTime, isVegetarian,
      isVegan, isGlutenFree, isSpicy, spiceLevel, calories, tags
    } = req.body;

    if (!businessId || !categoryId || !name) {
      res.status(400).json({ success: false, message: 'Business ID, category ID, and name are required' });
      return;
    }

    // Check if business is restaurant type
    if (!(await isRestaurantBusiness(businessId))) {
      res.status(403).json({ success: false, message: 'Menu management is only available for restaurant businesses' });
      return;
    }

    // Verify category exists and belongs to the business
    const category = await MenuCategoryModel.findOne({
      where: { id: categoryId, businessId }
    });
    if (!category) {
      res.status(400).json({ success: false, message: 'Invalid category ID' });
      return;
    }

    // Get business to determine prefix for SKU generation
    const business = await BusinessModel.findByPk(businessId);
    if (!business) {
      res.status(400).json({ success: false, message: 'Business not found' });
      return;
    }

    // Generate business prefix from slug (e.g., 'italian-delight' -> 'IT')
    const businessPrefix = business.slug?.split('-').map(word => word.charAt(0).toUpperCase()).join('') || 'IT';
    
    // Generate a unique counter for this business
    const existingItems = await MenuItemModel.count({ where: { businessId } });
    const counter = existingItems + 1;

    const item = await MenuItemModel.create({
      businessId,
      categoryId,
      name,
      description,
      price: price || 0,
      cost: cost || 0,
      sku: generateSku(businessPrefix, counter),
      barcode: generateBarcode(businessPrefix, counter),
      imageUrl,
      ingredients,
      allergens,
      preparationTime: preparationTime || 15,
      isVegetarian: isVegetarian || false,
      isVegan: isVegan || false,
      isGlutenFree: isGlutenFree || false,
      isSpicy: isSpicy || false,
      spiceLevel,
      calories,
      tags
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/menu/items/{id}:
 *   put:
 *     summary: Update a menu item
 *     tags: [Menu Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               price:
 *                 type: number
 *                 minimum: 0
 *               cost:
 *                 type: number
 *                 minimum: 0
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *               allergens:
 *                 type: array
 *                 items:
 *                   type: string
 *               preparationTime:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 480
 *               isAvailable:
 *                 type: boolean
 *               isVegetarian:
 *                 type: boolean
 *               isVegan:
 *                 type: boolean
 *               isGlutenFree:
 *                 type: boolean
 *               isSpicy:
 *                 type: boolean
 *               spiceLevel:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               calories:
 *                 type: integer
 *                 minimum: 0
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/MenuItem'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Item not found
 */
router.put('/items/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const itemId = parseInt(req.params.id || '0');
    const updateData = req.body;

    const item = await MenuItemModel.findByPk(itemId);
    if (!item) {
      res.status(404).json({ success: false, message: 'Item not found' });
      return;
    }

    await item.update(updateData);
    res.json({ success: true, data: item });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/menu/items/{id}:
 *   delete:
 *     summary: Delete a menu item
 *     tags: [Menu Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Item not found
 */
router.delete('/items/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const itemId = parseInt(req.params.id || '0');

    const item = await MenuItemModel.findByPk(itemId);
    if (!item) {
      res.status(404).json({ success: false, message: 'Item not found' });
      return;
    }

    await item.destroy();
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router; 