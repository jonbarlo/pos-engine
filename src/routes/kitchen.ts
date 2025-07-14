import { Router } from 'express';
import { KitchenOrderController } from '../controllers/kitchenOrderController';
import { authenticateToken, requireKitchenRead, requireKitchenWrite, requireKitchenManager } from '../middleware/auth';

const router = Router();

// Apply authentication to all kitchen routes
router.use(authenticateToken);

/**
 * @route GET /kitchen/orders
 * @desc Get all kitchen orders with optional filtering (Read access required)
 * @access Private - Kitchen Read
 * @query {string} status - Filter by order status (pending, preparing, ready, served, cancelled)
 * @query {string} priority - Filter by priority (low, normal, high, urgent)
 * @query {string} station - Filter by kitchen station
 * @query {number} assignedTo - Filter by assigned user ID
 * @query {string} orderType - Filter by order type (dine_in, takeaway, delivery)
 */
router.get('/orders', requireKitchenRead, KitchenOrderController.getKitchenOrders);

/**
 * @route GET /kitchen/orders/:id
 * @desc Get a specific kitchen order by ID (Read access required)
 * @access Private - Kitchen Read
 * @param {number} id - Kitchen order ID
 */
router.get('/orders/:id', requireKitchenRead, KitchenOrderController.getKitchenOrderById);

/**
 * @route PUT /kitchen/orders/:id
 * @desc Update kitchen order status and details (Write access required)
 * @access Private - Kitchen Write
 * @param {number} id - Kitchen order ID
 * @body {object} updateData - Fields to update
 */
router.put('/orders/:id', requireKitchenWrite, KitchenOrderController.updateKitchenOrder);

/**
 * @route PUT /kitchen/orders/:id/start-preparing
 * @desc Start preparing a kitchen order (Write access required)
 * @access Private - Kitchen Write
 * @param {number} id - Kitchen order ID
 * @body {number} assignedTo - User ID to assign the order to (optional)
 */
router.put('/orders/:id/start-preparing', requireKitchenWrite, KitchenOrderController.startPreparing);

/**
 * @route PUT /kitchen/orders/:id/ready
 * @desc Mark kitchen order as ready (Write access required)
 * @access Private - Kitchen Write
 * @param {number} id - Kitchen order ID
 */
router.put('/orders/:id/ready', requireKitchenWrite, KitchenOrderController.markReady);

/**
 * @route PUT /kitchen/orders/:id/served
 * @desc Mark kitchen order as served (Write access required)
 * @access Private - Kitchen Write
 * @param {number} id - Kitchen order ID
 */
router.put('/orders/:id/served', requireKitchenWrite, KitchenOrderController.markServed);

/**
 * @route PUT /kitchen/orders/:orderId/items/:itemId/status
 * @desc Update individual item status within a kitchen order (Write access required)
 * @access Private - Kitchen Write
 * @param {number} orderId - Kitchen order ID
 * @param {number} itemId - Item ID within the order
 * @body {string} status - New status (pending, preparing, ready, served)
 * @body {number} assignedTo - User ID to assign the item to (optional)
 */
router.put('/orders/:orderId/items/:itemId/status', requireKitchenWrite, KitchenOrderController.updateItemStatus);

/**
 * @route PUT /kitchen/orders/:id/assign
 * @desc Assign kitchen order to a chef/staff member (Manager access required)
 * @access Private - Kitchen Manager
 * @param {number} id - Kitchen order ID
 * @body {number} assignedTo - User ID to assign the order to
 */
router.put('/orders/:id/assign', requireKitchenManager, KitchenOrderController.assignOrder);

/**
 * @route GET /kitchen/stats
 * @desc Get kitchen order statistics (Read access required)
 * @access Private - Kitchen Read
 */
router.get('/stats', requireKitchenRead, KitchenOrderController.getKitchenStats);

export default router; 