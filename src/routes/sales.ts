import { Router } from 'express';
import { SaleController } from '../controllers/saleController';
import { authenticateToken } from '../middleware/auth';

const salesRouter = Router();

// All sales routes require authentication
salesRouter.use(authenticateToken);

/**
 * @swagger
 * /api/sales/stats:
 *   get:
 *     summary: Get sales statistics
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sales statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalSales:
 *                   type: number
 *                   example: 15000.50
 *                 totalTransactions:
 *                   type: integer
 *                   example: 45
 *                 averageOrderValue:
 *                   type: number
 *                   example: 333.34
 *                 topSellingItems:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       itemId:
 *                         type: integer
 *                       totalQuantity:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
salesRouter.get('/stats', SaleController.getSalesStats);

/**
 * @swagger
 * /api/sales:
 *   get:
 *     summary: Get all sales
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of sales per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, cancelled]
 *         description: Filter by sale status
 *     responses:
 *       200:
 *         description: List of sales
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sale'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
salesRouter.get('/', SaleController.getAllSales);

/**
 * @swagger
 * /api/sales:
 *   post:
 *     summary: Create a new sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customerName, total]
 *             properties:
 *               customerName:
 *                 type: string
 *                 example: "John Doe"
 *               customerEmail:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               subtotal:
 *                 type: number
 *                 example: 1099.99
 *               tax:
 *                 type: number
 *                 example: 93.50
 *               discount:
 *                 type: number
 *                 example: 0
 *               total:
 *                 type: number
 *                 example: 1193.49
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, card, check]
 *                 example: "card"
 *               status:
 *                 type: string
 *                 enum: [pending, completed, cancelled]
 *                 example: "completed"
 *     responses:
 *       201:
 *         description: Sale created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sale'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
salesRouter.post('/', SaleController.createSale);

/**
 * @swagger
 * /api/sales/with-items:
 *   post:
 *     summary: Create a new sale with order items
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customerName, total, orderItems]
 *             properties:
 *               customerName:
 *                 type: string
 *                 example: "John Doe"
 *               customerEmail:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               subtotal:
 *                 type: number
 *                 example: 1099.99
 *               tax:
 *                 type: number
 *                 example: 93.50
 *               discount:
 *                 type: number
 *                 example: 0
 *               total:
 *                 type: number
 *                 example: 1193.49
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, card, check]
 *                 example: "card"
 *               status:
 *                 type: string
 *                 enum: [pending, completed, cancelled]
 *                 example: "completed"
 *               orderItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [itemId, quantity, unitPrice]
 *                   properties:
 *                     itemId:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *                     unitPrice:
 *                       type: number
 *                       example: 599.99
 *     responses:
 *       201:
 *         description: Sale with items created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sale'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
salesRouter.post('/with-items', SaleController.createSaleWithItems);

/**
 * @swagger
 * /api/sales/user/{userId}:
 *   get:
 *     summary: Get sales by user ID
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Sales by user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sale'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
salesRouter.get('/user/:userId', SaleController.getSalesByUser);

/**
 * @swagger
 * /api/sales/{id}:
 *   get:
 *     summary: Get sale by ID
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sale ID
 *     responses:
 *       200:
 *         description: Sale details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sale'
 *       404:
 *         description: Sale not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
salesRouter.get('/:id', SaleController.getSaleById);

/**
 * @swagger
 * /api/sales/{id}:
 *   put:
 *     summary: Update a sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sale ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerName:
 *                 type: string
 *               customerEmail:
 *                 type: string
 *               subtotal:
 *                 type: number
 *               tax:
 *                 type: number
 *               discount:
 *                 type: number
 *               total:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sale updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sale'
 *       404:
 *         description: Sale not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
salesRouter.put('/:id', SaleController.updateSale);

/**
 * @swagger
 * /api/sales/{id}:
 *   delete:
 *     summary: Delete a sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sale ID
 *     responses:
 *       200:
 *         description: Sale deleted successfully
 *       404:
 *         description: Sale not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
salesRouter.delete('/:id', SaleController.deleteSale);

export default salesRouter; 