import { Router } from 'express';
import { RecipeController } from '../controllers/recipeController';
import { authenticateToken } from '../middleware/auth';
// import { requireRestaurant } from '../middleware/restaurantCheck';

const router = Router();

// Apply authentication middleware to all recipe routes
router.use(authenticateToken);
// Remove requireRestaurant middleware (following pattern of working endpoints)

/**
 * @swagger
 * components:
 *   schemas:
 *     Recipe:
 *       type: object
 *       required:
 *         - businessId
 *         - name
 *         - ingredients
 *         - instructions
 *         - prepTime
 *         - cookTime
 *         - difficulty
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated recipe ID
 *         businessId:
 *           type: integer
 *           description: Business ID
 *         name:
 *           type: string
 *           description: Recipe name
 *         description:
 *           type: string
 *           description: Recipe description
 *         ingredients:
 *           type: string
 *           description: List of ingredients
 *         instructions:
 *           type: string
 *           description: Cooking instructions
 *         prepTime:
 *           type: integer
 *           description: Preparation time in minutes
 *         cookTime:
 *           type: integer
 *           description: Cooking time in minutes
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard]
 *           description: Recipe difficulty level
 *         imageUrl:
 *           type: string
 *           description: URL to recipe image
 *         isActive:
 *           type: boolean
 *           description: Whether recipe is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/recipes:
 *   get:
 *     summary: Get all recipes with pagination and filtering
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [easy, medium, hard]
 *         description: Filter by difficulty level
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name, description, or ingredients
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of recipes per page
 *     responses:
 *       200:
 *         description: List of recipes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recipe'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Business is not restaurant type
 *       500:
 *         description: Server error
 */
router.get('/', RecipeController.getRecipes);

/**
 * @swagger
 * /api/recipes/search:
 *   get:
 *     summary: Search recipes by name, description, or ingredients
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recipe'
 *                 total:
 *                   type: integer
 *       400:
 *         description: Search query is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Business is not restaurant type
 *       500:
 *         description: Server error
 */
router.get('/search', RecipeController.searchRecipes);

/**
 * @swagger
 * /api/recipes/difficulty/{difficulty}:
 *   get:
 *     summary: Get recipes by difficulty level
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [easy, medium, hard]
 *         required: true
 *         description: Difficulty level
 *     responses:
 *       200:
 *         description: Recipes by difficulty
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recipe'
 *                 total:
 *                   type: integer
 *       400:
 *         description: Valid difficulty level is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Business is not restaurant type
 *       500:
 *         description: Server error
 */
router.get('/difficulty/:difficulty', RecipeController.getRecipesByDifficulty);

/**
 * @swagger
 * /api/recipes/stats:
 *   get:
 *     summary: Get recipe statistics
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recipe statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalRecipes:
 *                       type: integer
 *                     recipesByDifficulty:
 *                       type: object
 *                       properties:
 *                         easy:
 *                           type: integer
 *                         medium:
 *                           type: integer
 *                         hard:
 *                           type: integer
 *                     recentRecipes:
 *                       type: integer
 *                     averagePrepTime:
 *                       type: integer
 *                     averageCookTime:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Business is not restaurant type
 *       500:
 *         description: Server error
 */
router.get('/stats', RecipeController.getRecipeStats);

/**
 * @swagger
 * /api/recipes/suggestions/{itemId}:
 *   get:
 *     summary: Get recipe suggestions for an item
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Recipe suggestions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       itemId:
 *                         type: integer
 *                       recipeId:
 *                         type: integer
 *                       aiGenerated:
 *                         type: boolean
 *                       confidence:
 *                         type: number
 *                       suggestedPrice:
 *                         type: number
 *                       recipe:
 *                         $ref: '#/components/schemas/Recipe'
 *                 total:
 *                   type: integer
 *       400:
 *         description: Item ID is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Business is not restaurant type
 *       500:
 *         description: Server error
 */
router.get('/suggestions/:itemId', RecipeController.getRecipeSuggestions);

/**
 * @swagger
 * /api/recipes:
 *   post:
 *     summary: Create a new recipe
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - ingredients
 *               - instructions
 *               - prepTime
 *               - cookTime
 *               - difficulty
 *             properties:
 *               name:
 *                 type: string
 *                 description: Recipe name
 *               description:
 *                 type: string
 *                 description: Recipe description
 *               ingredients:
 *                 type: string
 *                 description: List of ingredients
 *               instructions:
 *                 type: string
 *                 description: Cooking instructions
 *               prepTime:
 *                 type: integer
 *                 description: Preparation time in minutes
 *               cookTime:
 *                 type: integer
 *                 description: Cooking time in minutes
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard]
 *                 description: Recipe difficulty level
 *               imageUrl:
 *                 type: string
 *                 description: URL to recipe image
 *     responses:
 *       201:
 *         description: Recipe created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Recipe'
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Business is not restaurant type
 *       500:
 *         description: Server error
 */
router.post('/', RecipeController.createRecipe);

/**
 * @swagger
 * /api/recipes/suggestions:
 *   post:
 *     summary: Create a recipe suggestion
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *               - recipeId
 *             properties:
 *               itemId:
 *                 type: integer
 *                 description: Item ID
 *               recipeId:
 *                 type: integer
 *                 description: Recipe ID
 *               aiGenerated:
 *                 type: boolean
 *                 description: Whether suggestion was AI generated
 *               confidence:
 *                 type: number
 *                 description: Confidence score (0-1)
 *               suggestedPrice:
 *                 type: number
 *                 description: Suggested price for the item
 *     responses:
 *       201:
 *         description: Recipe suggestion created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     itemId:
 *                       type: integer
 *                     recipeId:
 *                       type: integer
 *                     aiGenerated:
 *                       type: boolean
 *                     confidence:
 *                       type: number
 *                     suggestedPrice:
 *                       type: number
 *       400:
 *         description: Item ID and Recipe ID are required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Business is not restaurant type
 *       500:
 *         description: Server error
 */
router.post('/suggestions', RecipeController.createRecipeSuggestion);

/**
 * @swagger
 * /api/recipes/{id}:
 *   get:
 *     summary: Get recipe by ID
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Recipe ID
 *     responses:
 *       200:
 *         description: Recipe details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Recipe'
 *       400:
 *         description: Recipe ID is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Business is not restaurant type
 *       404:
 *         description: Recipe not found
 *       500:
 *         description: Server error
 */
router.get('/:id', RecipeController.getRecipeById);

/**
 * @swagger
 * /api/recipes/{id}:
 *   put:
 *     summary: Update recipe
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Recipe ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               ingredients:
 *                 type: string
 *               instructions:
 *                 type: string
 *               prepTime:
 *                 type: integer
 *               cookTime:
 *                 type: integer
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard]
 *               imageUrl:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Recipe updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Recipe'
 *       400:
 *         description: Recipe ID is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Business is not restaurant type
 *       404:
 *         description: Recipe not found
 *       500:
 *         description: Server error
 */
router.put('/:id', RecipeController.updateRecipe);

/**
 * @swagger
 * /api/recipes/{id}:
 *   delete:
 *     summary: Delete recipe (soft delete)
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Recipe ID
 *     responses:
 *       200:
 *         description: Recipe deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Recipe ID is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Business is not restaurant type
 *       404:
 *         description: Recipe not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', RecipeController.deleteRecipe);

/**
 * @swagger
 * /api/recipes/{id}/image:
 *   post:
 *     summary: Upload recipe image
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Recipe ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrl
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: URL to recipe image
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Recipe'
 *       400:
 *         description: Recipe ID or image URL is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Business is not restaurant type
 *       404:
 *         description: Recipe not found
 *       500:
 *         description: Server error
 */
router.post('/:id/image', RecipeController.uploadImage);

export default router; 