import { Router } from 'express';
import { KitchenOrderController } from '../controllers/kitchenOrderController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication to all kitchen routes
router.use(authenticateToken);

/**
 * @route GET /kitchen/orders
 * @desc Get all kitchen orders with optional filtering
 * @access Private
 * @query {string} status - Filter by order status (pending, preparing, ready, served, cancelled)
 * @query {string} priority - Filter by priority (low, normal, high, urgent)
 * @query {string} station - Filter by kitchen station
 * @query {number} assignedTo - Filter by assigned user ID
 * @query {string} orderType - Filter by order type (dine_in, takeaway, delivery)
 */
router.get('/orders', KitchenOrderController.getKitchenOrders);

/**
 * @route GET /kitchen/orders/:id
 * @desc Get a specific kitchen order by ID
 * @access Private
 * @param {number} id - Kitchen order ID
 */
router.get('/orders/:id', KitchenOrderController.getKitchenOrderById);

/**
 * @route PUT /kitchen/orders/:id
 * @desc Update kitchen order status and details
 * @access Private
 * @param {number} id - Kitchen order ID
 * @body {object} updateData - Fields to update
 */
router.put('/orders/:id', KitchenOrderController.updateKitchenOrder);

/**
 * @route PUT /kitchen/orders/:id/start-preparing
 * @desc Start preparing a kitchen order
 * @access Private
 * @param {number} id - Kitchen order ID
 * @body {number} assignedTo - User ID to assign the order to (optional)
 */
router.put('/orders/:id/start-preparing', KitchenOrderController.startPreparing);

/**
 * @route PUT /kitchen/orders/:id/ready
 * @desc Mark kitchen order as ready
 * @access Private
 * @param {number} id - Kitchen order ID
 */
router.put('/orders/:id/ready', KitchenOrderController.markReady);

/**
 * @route PUT /kitchen/orders/:id/served
 * @desc Mark kitchen order as served
 * @access Private
 * @param {number} id - Kitchen order ID
 */
router.put('/orders/:id/served', KitchenOrderController.markServed);

/**
 * @route PUT /kitchen/orders/:orderId/items/:itemId/status
 * @desc Update individual item status within a kitchen order
 * @access Private
 * @param {number} orderId - Kitchen order ID
 * @param {number} itemId - Item ID within the order
 * @body {string} status - New status (pending, preparing, ready, served)
 * @body {number} assignedTo - User ID to assign the item to (optional)
 */
router.put('/orders/:orderId/items/:itemId/status', KitchenOrderController.updateItemStatus);

/**
 * @route PUT /kitchen/orders/:id/assign
 * @desc Assign kitchen order to a chef/staff member
 * @access Private
 * @param {number} id - Kitchen order ID
 * @body {number} assignedTo - User ID to assign the order to
 */
router.put('/orders/:id/assign', KitchenOrderController.assignOrder);

/**
 * @route GET /kitchen/stats
 * @desc Get kitchen order statistics
 * @access Private
 */
router.get('/stats', KitchenOrderController.getKitchenStats);

export default router; 