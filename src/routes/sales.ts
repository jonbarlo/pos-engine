import { Router } from 'express';
import { SaleController } from '../controllers/saleController';
import { authenticateToken } from '../middleware/auth';
import { analyticsLimiter } from '../middleware/security';

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
 *             required: [userId, businessId, totalAmount]
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: User ID creating the sale
 *                 example: 1
 *               businessId:
 *                 type: integer
 *                 description: Business ID
 *                 example: 4
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
 *               totalAmount:
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
 *               existingOrderId:
 *                 type: integer
 *                 description: Optional order ID to link this sale to an existing order. If provided, the order status will be updated to 'completed' and table will be freed up.
 *                 example: 13
 *     responses:
 *       201:
 *         description: Sale created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sale created successfully"
 *                 sale:
 *                   $ref: '#/components/schemas/Sale'
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
 *             required: [userId, businessId, orderItems]
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: User ID creating the sale
 *                 example: 1
 *               businessId:
 *                 type: integer
 *                 description: Business ID
 *                 example: 4
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
 *               totalAmount:
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
 *               existingOrderId:
 *                 type: integer
 *                 description: Optional order ID to link this sale to an existing order. If provided, the order status will be updated to 'completed' and table will be freed up.
 *                 example: 13
 *               orderItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [itemId, quantity, unitPrice]
 *                   properties:
 *                     itemId:
 *                       type: integer
 *                       description: Menu item ID (will be converted to inventory item ID)
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
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sale with items created successfully"
 *                 sale:
 *                   $ref: '#/components/schemas/Sale'
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
 * /api/sales/{id}/with-items:
 *   get:
 *     summary: Get sale by ID with order items
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
 *         description: Sale details with order items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 businessId:
 *                   type: integer
 *                 userId:
 *                   type: integer
 *                 saleNumber:
 *                   type: string
 *                 totalAmount:
 *                   type: number
 *                 paymentMethod:
 *                   type: string
 *                 status:
 *                   type: string
 *                 customerName:
 *                   type: string
 *                 customerEmail:
 *                   type: string
 *                 customerPhone:
 *                   type: string
 *                 notes:
 *                   type: string
 *                 payments:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 saleItems:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       itemId:
 *                         type: integer
 *                       quantity:
 *                         type: integer
 *                       unitPrice:
 *                         type: number
 *                       totalPrice:
 *                         type: number
 *                       discountAmount:
 *                         type: number
 *                       finalPrice:
 *                         type: number
 *                       notes:
 *                         type: string
 *                       item:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                           price:
 *                             type: number
 *                           category:
 *                             type: string
 *                           imageUrl:
 *                             type: string
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
salesRouter.get('/:id/with-items', SaleController.getSaleWithItems);

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
 *               totalAmount:
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

/**
 * @swagger
 * /api/sales/create-missing-orders:
 *   post:
 *     summary: Create missing orders for existing sales (data recovery)
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       This endpoint creates missing orders and kitchen orders for existing sales.
 *       Use this when sales exist but orders are missing due to previous errors.
 *       This is a recovery operation and should be used carefully.
 *     responses:
 *       200:
 *         description: Missing orders creation completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing orders creation completed"
 *                 result:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: integer
 *                       description: Number of orders successfully created
 *                     failed:
 *                       type: integer
 *                       description: Number of orders that failed to create
 *                     totalProcessed:
 *                       type: integer
 *                       description: Total number of sales processed
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: List of error messages for failed operations
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
salesRouter.post('/create-missing-orders', SaleController.createMissingOrders);

/**
 * @swagger
 * /api/sales/analytics/items:
 *   get:
 *     summary: Get item performance analytics
 *     tags: [Sales Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for analysis (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for analysis (YYYY-MM-DD)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of top items to return
 *     responses:
 *       200:
 *         description: Item performance analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 topSellers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       itemId:
 *                         type: integer
 *                       itemName:
 *                         type: string
 *                       totalQuantity:
 *                         type: integer
 *                       totalRevenue:
 *                         type: number
 *                       averagePrice:
 *                         type: number
 *                       profitMargin:
 *                         type: number
 *                 worstSellers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       itemId:
 *                         type: integer
 *                       itemName:
 *                         type: string
 *                       totalQuantity:
 *                         type: integer
 *                       totalRevenue:
 *                         type: number
 *                       lastSoldDate:
 *                         type: string
 *                       daysSinceLastSale:
 *                         type: integer
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalItemsSold:
 *                       type: integer
 *                     totalRevenue:
 *                       type: number
 *                     averageOrderValue:
 *                       type: number
 *                     mostProfitableItem:
 *                       type: string
 *                     leastProfitableItem:
 *                       type: string
 */
salesRouter.get('/analytics/items', analyticsLimiter, SaleController.getItemAnalytics);

/**
 * @swagger
 * /api/sales/analytics/revenue:
 *   get:
 *     summary: Get revenue analytics and trends
 *     tags: [Sales Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, yearly]
 *           default: monthly
 *         description: Time period for analysis
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for analysis (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for analysis (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Revenue analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 periodData:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       period:
 *                         type: string
 *                       revenue:
 *                         type: number
 *                       transactions:
 *                         type: integer
 *                       averageOrderValue:
 *                         type: number
 *                       growthRate:
 *                         type: number
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalRevenue:
 *                       type: number
 *                     totalTransactions:
 *                       type: integer
 *                     averageOrderValue:
 *                       type: number
 *                     revenueGrowth:
 *                       type: number
 *                     bestDay:
 *                       type: string
 *                     bestHour:
 *                       type: integer
 */
salesRouter.get('/analytics/revenue', analyticsLimiter, SaleController.getRevenueAnalytics);

/**
 * @swagger
 * /api/sales/analytics/staff:
 *   get:
 *     summary: Get staff performance analytics
 *     tags: [Sales Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for analysis (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for analysis (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Staff performance analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 staffPerformance:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: integer
 *                       userName:
 *                         type: string
 *                       totalSales:
 *                         type: number
 *                       totalTransactions:
 *                         type: integer
 *                       averageOrderValue:
 *                         type: number
 *                       bestSellingItem:
 *                         type: string
 *                       performanceRank:
 *                         type: integer
 *                 summary:
 *                   type: object
 *                   properties:
 *                     topPerformer:
 *                       type: string
 *                     totalStaff:
 *                       type: integer
 *                     averageSalesPerStaff:
 *                       type: number
 */
salesRouter.get('/analytics/staff', analyticsLimiter, SaleController.getStaffAnalytics);

/**
 * @swagger
 * /api/sales/analytics/customers:
 *   get:
 *     summary: Get customer analytics
 *     tags: [Sales Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for analysis (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for analysis (YYYY-MM-DD)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of top customers to return
 *     responses:
 *       200:
 *         description: Customer analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 topCustomers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       customerId:
 *                         type: integer
 *                       customerName:
 *                         type: string
 *                       totalSpent:
 *                         type: number
 *                       totalOrders:
 *                         type: integer
 *                       averageOrderValue:
 *                       type: number
 *                       lastVisit:
 *                         type: string
 *                       favoriteItems:
 *                         type: array
 *                         items:
 *                           type: string
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalCustomers:
 *                       type: integer
 *                     repeatCustomers:
 *                       type: integer
 *                     averageCustomerValue:
 *                       type: number
 *                     customerRetentionRate:
 *                       type: number
 */
salesRouter.get('/analytics/customers', analyticsLimiter, SaleController.getCustomerAnalytics);

/**
 * @swagger
 * /api/sales/analytics/inventory:
 *   get:
 *     summary: Get inventory performance analytics
 *     tags: [Sales Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory performance analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lowStockItems:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       itemId:
 *                         type: integer
 *                       itemName:
 *                         type: string
 *                       currentStock:
 *                         type: integer
 *                       minStock:
 *                         type: integer
 *                       daysUntilStockout:
 *                         type: integer
 *                 overstockedItems:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       itemId:
 *                         type: integer
 *                       itemName:
 *                         type: string
 *                       currentStock:
 *                         type: integer
 *                       maxStock:
 *                         type: integer
 *                       daysOfInventory:
 *                         type: integer
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                     lowStockCount:
 *                       type: integer
 *                     overstockedCount:
 *                       type: integer
 *                     inventoryValue:
 *                       type: number
 *                     turnoverRate:
 *                       type: number
 */
salesRouter.get('/analytics/inventory', analyticsLimiter, SaleController.getInventoryAnalytics);

export default salesRouter; 