import { Router } from 'express';
import { 
  KitchenOrderModel, 
  OrderModel, 
  UserModel, 
  OrderItemModel 
} from '../models';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';

const router = Router();

/**
 * @swagger
 * /api/kitchen:
 *   get:
 *     summary: Get all kitchen orders for the current business
 *     tags: [Kitchen]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, preparing, ready, served]
 *         description: Filter by kitchen order status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, normal, high, urgent]
 *         description: Filter by priority
 *       - in: query
 *         name: station
 *         schema:
 *           type: string
 *         description: Filter by kitchen station
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: integer
 *         description: Filter by assigned user ID
 *       - in: query
 *         name: orderType
 *         schema:
 *           type: string
 *           enum: [dine_in, takeaway, delivery]
 *         description: Filter by order type
 *     responses:
 *       200:
 *         description: List of kitchen orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/KitchenOrder'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * /api/kitchen/active:
 *   get:
 *     summary: Get all active kitchen orders (pending, confirmed, preparing)
 *     tags: [Kitchen]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active kitchen orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/KitchenOrder'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * /api/kitchen/{id}:
 *   get:
 *     summary: Get a specific kitchen order by ID
 *     tags: [Kitchen]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kitchen order ID
 *     responses:
 *       200:
 *         description: Kitchen order retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/KitchenOrder'
 *       404:
 *         description: Kitchen order not found
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
 *
 * /api/kitchen/from-order/{orderId}:
 *   post:
 *     summary: Create a kitchen order from a regular order
 *     tags: [Kitchen]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               priority:
 *                 type: string
 *                 enum: [low, normal, high, urgent]
 *                 example: normal
 *               estimatedPrepTime:
 *                 type: integer
 *                 example: 20
 *               specialInstructions:
 *                 type: string
 *                 example: No onions
 *               notes:
 *                 type: string
 *                 example: Rush order
 *     responses:
 *       201:
 *         description: Kitchen order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/KitchenOrder'
 *                 message:
 *                   type: string
 *                   example: Kitchen order created successfully
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
// Get all kitchen orders for a business
router.get('/', authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { 
      status, 
      priority, 
      station, 
      assignedTo,
      orderType 
    } = req.query;

    const whereClause: any = { businessId };

    // Filter by status
    if (status) {
      whereClause.status = status;
    }

    // Filter by priority
    if (priority) {
      whereClause.priority = priority;
    }

    // Filter by station
    if (station) {
      whereClause.station = station;
    }

    // Filter by assigned user
    if (assignedTo) {
      whereClause.assignedTo = assignedTo;
    }

    // Filter by order type
    if (orderType) {
      whereClause.orderType = orderType;
    }

    const kitchenOrders = await KitchenOrderModel.findAll({
      where: whereClause,
      order: [
        ['priority', 'DESC'],
        ['createdAt', 'ASC']
      ]
    });

    logger(`Found ${kitchenOrders.length} kitchen orders for business ${businessId}`);

    res.json({
      success: true,
      data: kitchenOrders
    });
  } catch (error) {
    logger(`Error getting kitchen orders: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get kitchen orders'
    });
  }
});

// Get active kitchen orders (pending, confirmed, preparing)
router.get('/active', authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const kitchenOrders = await KitchenOrderModel.findAll({
      where: {
        businessId,
        status: ['pending', 'confirmed', 'preparing']
      },
      order: [
        ['priority', 'DESC'],
        ['createdAt', 'ASC']
      ]
    });

    logger(`Found ${kitchenOrders.length} active kitchen orders for business ${businessId}`);

    res.json({
      success: true,
      data: kitchenOrders
    });
  } catch (error) {
    logger(`Error getting active kitchen orders: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get active kitchen orders'
    });
  }
});

// Get a specific kitchen order
router.get('/:id', authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { id } = req.params;

    const kitchenOrder = await KitchenOrderModel.findOne({
      where: { id, businessId }
    });

    if (!kitchenOrder) {
      res.status(404).json({
        success: false,
        message: 'Kitchen order not found'
      });
      return;
    }

    res.json({
      success: true,
      data: kitchenOrder
    });
  } catch (error) {
    logger(`Error getting kitchen order: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get kitchen order'
    });
  }
});

// Create kitchen order from regular order
router.post('/from-order/:orderId', authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { orderId: orderIdParam } = req.params;
    if (!orderIdParam) {
      res.status(400).json({ success: false, message: 'Missing orderId parameter' });
      return;
    }
    const orderId = parseInt(orderIdParam, 10);
    const { priority = 'normal', estimatedPrepTime, specialInstructions, notes } = req.body;

    // Get the order with items
    const order = await OrderModel.findOne({
      where: { id: orderId, businessId },
      include: [
        {
          model: OrderItemModel,
          as: 'orderItems',
          attributes: ['id', 'itemName', 'quantity', 'specialInstructions', 'modifications']
        }
      ]
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    // Check if kitchen order already exists
    const existingKitchenOrder = await KitchenOrderModel.findOne({
      where: { orderId, businessId }
    });

    if (existingKitchenOrder) {
      res.status(409).json({
        success: false,
        message: 'Kitchen order already exists for this order'
      });
      return;
    }

    // Convert order items to kitchen order items
    const kitchenItems = (order as any).orderItems.map((item: any) => ({
      id: item.id,
      itemName: item.itemName,
      quantity: item.quantity,
      status: 'pending',
      specialInstructions: item.specialInstructions,
      modifications: item.modifications ? JSON.parse(item.modifications) : [],
      preparationTime: 15 // Default preparation time
    }));

    const kitchenOrder = await KitchenOrderModel.create({
      businessId,
      orderId,
      orderNumber: order.orderNumber,
      tableNumber: (order as any).tableNumber,
      customerName: (order as any).customerName,
      orderType: order.orderType,
      priority,
      estimatedPrepTime: estimatedPrepTime || 15,
      specialInstructions,
      items: kitchenItems,
      totalItems: kitchenItems.length,
      completedItems: 0,
      notes
    });

    logger(`Created kitchen order ${kitchenOrder.id} from order ${orderId}`);

    res.status(201).json({
      success: true,
      data: kitchenOrder
    });
  } catch (error) {
    logger(`Error creating kitchen order: ${error}`);
    res.status(400).json({
      success: false,
      message: 'Failed to create kitchen order'
    });
  }
});

// Update kitchen order status
router.patch('/:id/status', authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { id } = req.params;
    const { status, assignedTo, assignedToName, station } = req.body;

    const kitchenOrder = await KitchenOrderModel.findOne({
      where: { id, businessId }
    });

    if (!kitchenOrder) {
      res.status(404).json({
        success: false,
        message: 'Kitchen order not found'
      });
      return;
    }

    // Update status using model methods
    switch (status) {
      case 'confirmed':
        kitchenOrder.confirm();
        break;
      case 'preparing':
        kitchenOrder.startPreparation(assignedTo, assignedToName, station);
        break;
      case 'ready':
        kitchenOrder.markReady();
        break;
      case 'served':
        kitchenOrder.markServed();
        break;
      case 'cancelled':
        kitchenOrder.cancel();
        break;
      default:
        kitchenOrder.status = status;
    }

    await kitchenOrder.save();

    logger(`Updated kitchen order ${id} status to ${status}`);

    res.json({
      success: true,
      data: kitchenOrder,
      message: `Kitchen order ${status} successfully`
    });
  } catch (error) {
    logger(`Error updating kitchen order status: ${error}`);
    res.status(400).json({
      success: false,
      message: 'Failed to update kitchen order status'
    });
  }
});

// Update kitchen order priority
router.patch('/:id/priority', authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { id } = req.params;
    const { priority } = req.body;

    const kitchenOrder = await KitchenOrderModel.findOne({
      where: { id, businessId }
    });

    if (!kitchenOrder) {
      res.status(404).json({
        success: false,
        message: 'Kitchen order not found'
      });
      return;
    }

    kitchenOrder.updatePriority(priority);
    await kitchenOrder.save();

    logger(`Updated kitchen order ${id} priority to ${priority}`);

    res.json({
      success: true,
      data: kitchenOrder,
      message: 'Priority updated successfully'
    });
  } catch (error) {
    logger(`Error updating kitchen order priority: ${error}`);
    res.status(400).json({
      success: false,
      message: 'Failed to update priority'
    });
  }
});

// Assign kitchen order to user
router.patch('/:id/assign', authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { id } = req.params;
    const { assignedTo, assignedToName, station } = req.body;

    const kitchenOrder = await KitchenOrderModel.findOne({
      where: { id, businessId }
    });

    if (!kitchenOrder) {
      res.status(404).json({
        success: false,
        message: 'Kitchen order not found'
      });
      return;
    }

    kitchenOrder.assignTo(assignedTo, assignedToName, station);
    await kitchenOrder.save();

    logger(`Assigned kitchen order ${id} to user ${assignedTo}`);

    res.json({
      success: true,
      data: kitchenOrder,
      message: 'Kitchen order assigned successfully'
    });
  } catch (error) {
    logger(`Error assigning kitchen order: ${error}`);
    res.status(400).json({
      success: false,
      message: 'Failed to assign kitchen order'
    });
  }
});

// Update item status in kitchen order
router.patch('/:id/items/:itemId/status', authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { id, itemId } = req.params;
    const { status, assignedTo, assignedToName, station } = req.body;

    const kitchenOrder = await KitchenOrderModel.findOne({
      where: { id, businessId }
    });

    if (!kitchenOrder) {
      res.status(404).json({
        success: false,
        message: 'Kitchen order not found'
      });
      return;
    }

    kitchenOrder.updateItemStatus(Number(itemId), status);
    
    if (assignedTo && assignedToName) {
      kitchenOrder.assignItemTo(Number(itemId), assignedTo, assignedToName, station);
    }

    await kitchenOrder.save();

    logger(`Updated item ${itemId} status to ${status} in kitchen order ${id}`);

    res.json({
      success: true,
      data: kitchenOrder,
      message: 'Item status updated successfully'
    });
  } catch (error) {
    logger(`Error updating item status: ${error}`);
    res.status(400).json({
      success: false,
      message: 'Failed to update item status'
    });
  }
});

// Get kitchen orders by station
router.get('/station/:station', authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { station } = req.params;

    const kitchenOrders = await KitchenOrderModel.findAll({
      where: {
        businessId,
        station,
        status: ['pending', 'confirmed', 'preparing']
      },
      order: [
        ['priority', 'DESC'],
        ['createdAt', 'ASC']
      ]
    });

    logger(`Found ${kitchenOrders.length} kitchen orders for station ${station}`);

    res.json({
      success: true,
      data: kitchenOrders
    });
  } catch (error) {
    logger(`Error getting kitchen orders by station: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get kitchen orders by station'
    });
  }
});

// Get kitchen orders assigned to user
router.get('/assigned/:userId', authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { userId } = req.params;

    const kitchenOrders = await KitchenOrderModel.findAll({
      where: {
        businessId,
        assignedTo: userId,
        status: ['pending', 'confirmed', 'preparing']
      },
      order: [
        ['priority', 'DESC'],
        ['createdAt', 'ASC']
      ]
    });

    logger(`Found ${kitchenOrders.length} kitchen orders assigned to user ${userId}`);

    res.json({
      success: true,
      data: kitchenOrders
    });
  } catch (error) {
    logger(`Error getting assigned kitchen orders: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get assigned kitchen orders'
    });
  }
});

// Get kitchen statistics
router.get('/stats/overview', authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { startDate, endDate } = req.query;

    const whereClause: any = { businessId };

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [startDate, endDate]
      };
    }

    const totalOrders = await KitchenOrderModel.count({ where: whereClause });
    const pendingOrders = await KitchenOrderModel.count({ 
      where: { ...whereClause, status: 'pending' } 
    });
    const preparingOrders = await KitchenOrderModel.count({ 
      where: { ...whereClause, status: 'preparing' } 
    });
    const readyOrders = await KitchenOrderModel.count({ 
      where: { ...whereClause, status: 'ready' } 
    });
    const servedOrders = await KitchenOrderModel.count({ 
      where: { ...whereClause, status: 'served' } 
    });

    const stats = {
      total: totalOrders,
      pending: pendingOrders,
      preparing: preparingOrders,
      ready: readyOrders,
      served: servedOrders,
      completionRate: totalOrders > 0 ? (servedOrders / totalOrders * 100).toFixed(1) : 0
    };

    logger(`Generated kitchen stats for business ${businessId}`);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger(`Error getting kitchen stats: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get kitchen statistics'
    });
  }
});

export default router; 