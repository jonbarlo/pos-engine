import { Router } from 'express';
import { 
  DeliveryModel, 
  OrderModel, 
  CustomerModel, 
  UserModel 
} from '../models';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';

const router = Router();

/**
 * @swagger
 * /api/deliveries:
 *   get:
 *     summary: Get all deliveries for the current business
 *     tags: [Deliveries]
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
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, assigned, picked_up, in_transit, delivered, cancelled]
 *         description: Filter by delivery status
 *       - in: query
 *         name: driverId
 *         schema:
 *           type: integer
 *         description: Filter by driver ID
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *         description: Filter by payment status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by customer name, phone, or tracking number
 *     responses:
 *       200:
 *         description: List of deliveries retrieved successfully
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
 *                     $ref: '#/components/schemas/Delivery'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Create a new delivery
 *     tags: [Deliveries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - customerName
 *               - customerPhone
 *               - deliveryAddress
 *               - deliveryCity
 *               - deliveryState
 *               - deliveryZipCode
 *               - totalAmount
 *             properties:
 *               orderId:
 *                 type: integer
 *                 description: Order ID
 *               customerId:
 *                 type: integer
 *                 description: Customer ID (optional)
 *               customerName:
 *                 type: string
 *                 example: Jane Smith
 *               customerPhone:
 *                 type: string
 *                 example: +1234567890
 *               customerEmail:
 *                 type: string
 *                 example: jane@example.com
 *               deliveryAddress:
 *                 type: string
 *                 example: 123 Main St
 *               deliveryCity:
 *                 type: string
 *                 example: Springfield
 *               deliveryState:
 *                 type: string
 *                 example: IL
 *               deliveryZipCode:
 *                 type: string
 *                 example: 62704
 *               deliveryInstructions:
 *                 type: string
 *                 example: Leave at the door
 *               deliveryFee:
 *                 type: number
 *                 example: 5.99
 *               tip:
 *                 type: number
 *                 example: 2.00
 *               totalAmount:
 *                 type: number
 *                 example: 45.99
 *               paymentMethod:
 *                 type: string
 *                 example: cash
 *               distance:
 *                 type: number
 *                 example: 3.2
 *               estimatedPickupTime:
 *                 type: string
 *                 format: date-time
 *               estimatedDeliveryTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Delivery created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Delivery'
 *                 message:
 *                   type: string
 *                   example: Delivery created successfully
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
 *
 * /api/deliveries/{id}:
 *   get:
 *     summary: Get a specific delivery by ID
 *     tags: [Deliveries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Delivery ID
 *     responses:
 *       200:
 *         description: Delivery retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Delivery'
 *       404:
 *         description: Delivery not found
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

// Get all deliveries for a business
router.get('/', authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }
    const { 
      page = 1, 
      limit = 20, 
      status, 
      driverId, 
      paymentStatus,
      search 
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const whereClause: any = { businessId };

    // Filter by status
    if (status) {
      whereClause.status = status;
    }

    // Filter by driver
    if (driverId) {
      whereClause.driverId = driverId;
    }

    // Filter by payment status
    if (paymentStatus) {
      whereClause.paymentStatus = paymentStatus;
    }

    // Search by customer name, phone, or tracking number
    if (search) {
      whereClause[Op.or] = [
        { customerName: { [Op.like]: `%${search}%` } },
        { customerPhone: { [Op.like]: `%${search}%` } },
        { trackingNumber: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: deliveries } = await DeliveryModel.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: OrderModel,
          as: 'order',
          attributes: ['id', 'orderNumber', 'totalAmount']
        },
        {
          model: CustomerModel,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: UserModel,
          as: 'driver',
          attributes: ['id', 'name', 'phone']
        }
      ],
      order: [
        ['createdAt', 'DESC']
      ],
      limit: Number(limit),
      offset
    });

    logger(`Found ${deliveries.length} deliveries for business ${businessId}`);

    res.json({
      success: true,
      data: deliveries,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil(count / Number(limit))
      }
    });
  } catch (error: any) {
    logger(`Error getting deliveries: ${error && error.stack ? error.stack : error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get deliveries'
    });
  }
});

// Get a specific delivery
router.get('/:id', authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }
    const { id } = req.params;

    const delivery = await DeliveryModel.findOne({
      where: { id, businessId },
      include: [
        {
          model: OrderModel,
          as: 'order',
          attributes: ['id', 'orderNumber', 'items']
        },
        {
          model: CustomerModel,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: UserModel,
          as: 'driver',
          attributes: ['id', 'name', 'phone']
        }
      ]
    });

    if (!delivery) {
      res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
      return;
    }

    res.json({
      success: true,
      data: delivery
    });
  } catch (error) {
    logger(`Error getting delivery: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get delivery'
    });
  }
});

// Create a new delivery
router.post('/', authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }
    const {
      orderId,
      customerId,
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      deliveryCity,
      deliveryState,
      deliveryZipCode,
      deliveryInstructions,
      deliveryFee = 0,
      tip = 0,
      totalAmount,
      paymentMethod = 'cash',
      distance,
      estimatedPickupTime,
      estimatedDeliveryTime
    } = req.body;

    // Validate required fields
    if (!orderId || !customerName || !customerPhone || !deliveryAddress || !deliveryCity || !deliveryState || !deliveryZipCode || !totalAmount) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
      return;
    }

    // Check if order exists and belongs to business
    const order = await OrderModel.findOne({
      where: { id: orderId, businessId }
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    // Generate tracking number
    const trackingNumber = `DEL-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const delivery = await DeliveryModel.create({
      businessId,
      orderId,
      customerId,
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      deliveryCity,
      deliveryState,
      deliveryZipCode,
      deliveryInstructions,
      deliveryFee,
      tip,
      totalAmount,
      paymentMethod,
      distance,
      estimatedPickupTime,
      estimatedDeliveryTime,
      trackingNumber
    });

    logger(`Created delivery ${delivery.id} for business ${businessId}`);

    res.status(201).json({
      success: true,
      data: delivery,
      message: 'Delivery created successfully'
    });
  } catch (error) {
    logger(`Error creating delivery: ${error}`);
    res.status(400).json({
      success: false,
      message: 'Failed to create delivery'
    });
  }
});

// Assign driver to delivery
router.patch('/:id/assign', authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }
    const { id } = req.params;
    const { driverId, driverName, driverPhone } = req.body;

    const delivery = await DeliveryModel.findOne({
      where: { id, businessId }
    });

    if (!delivery) {
      res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
      return;
    }

    delivery.assignDriver(driverId, driverName, driverPhone);
    await delivery.save();

    logger(`Assigned driver ${driverId} to delivery ${id}`);

    res.json({
      success: true,
      data: delivery,
      message: 'Driver assigned successfully'
    });
  } catch (error) {
    logger(`Error assigning driver: ${error}`);
    res.status(400).json({
      success: false,
      message: 'Failed to assign driver'
    });
  }
});

// Update delivery status
router.patch('/:id/status', authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }
    const { id } = req.params;
    const { status, notes } = req.body;

    const delivery = await DeliveryModel.findOne({
      where: { id, businessId }
    });

    if (!delivery) {
      res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
      return;
    }

    // Update status using model methods
    switch (status) {
      case 'picked_up':
        delivery.markPickedUp();
        break;
      case 'in_transit':
        delivery.markInTransit();
        break;
      case 'delivered':
        delivery.markDelivered();
        break;
      case 'failed':
        delivery.markFailed(notes);
        break;
      case 'cancelled':
        delivery.cancel();
        break;
      default:
        delivery.status = status;
    }

    if (notes) {
      delivery.notes = notes;
    }

    await delivery.save();

    logger(`Updated delivery ${id} status to ${status}`);

    res.json({
      success: true,
      data: delivery,
      message: `Delivery ${status} successfully`
    });
  } catch (error) {
    logger(`Error updating delivery status: ${error}`);
    res.status(400).json({
      success: false,
      message: 'Failed to update delivery status'
    });
  }
});

// Update payment status
router.patch('/:id/payment', authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }
    const { id } = req.params;
    const { paymentStatus, tip } = req.body;

    const delivery = await DeliveryModel.findOne({
      where: { id, businessId }
    });

    if (!delivery) {
      res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
      return;
    }

    delivery.updatePaymentStatus(paymentStatus);
    if (tip !== undefined) {
      delivery.tip = tip;
    }

    await delivery.save();

    logger(`Updated delivery ${id} payment status to ${paymentStatus}`);

    res.json({
      success: true,
      data: delivery,
      message: 'Payment status updated successfully'
    });
  } catch (error) {
    logger(`Error updating payment status: ${error}`);
    res.status(400).json({
      success: false,
      message: 'Failed to update payment status'
    });
  }
});

// Get deliveries by tracking number
router.get('/track/:trackingNumber', authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }
    const { trackingNumber } = req.params;

    const delivery = await DeliveryModel.findOne({
      where: { trackingNumber, businessId },
    });

    if (!delivery) {
      res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
      return;
    }

    res.json({
      success: true,
      data: delivery
    });
  } catch (error) {
    logger(`Error getting delivery by tracking number: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get delivery by tracking number'
    });
  }
});

// Get active deliveries for a driver
router.get('/driver/:driverId/active', authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }
    const { driverId } = req.params;

    const deliveries = await DeliveryModel.findAll({
      where: {
        businessId,
        driverId,
        status: ['assigned', 'picked_up', 'in_transit']
      },
      include: [
        {
          model: OrderModel,
          as: 'order',
          attributes: ['id', 'orderNumber', 'items']
        }
      ],
      order: [
        ['estimatedDeliveryTime', 'ASC']
      ]
    });

    logger(`Found ${deliveries.length} active deliveries for driver ${driverId}`);

    res.json({
      success: true,
      data: deliveries
    });
  } catch (error) {
    logger(`Error getting driver deliveries: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get driver deliveries'
    });
  }
});

// Get delivery statistics
router.get('/stats/overview', authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }
    const { startDate, endDate } = req.query;

    const whereClause: any = { businessId };

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [startDate, endDate]
      };
    }

    const totalDeliveries = await DeliveryModel.count({ where: whereClause });
    const pendingDeliveries = await DeliveryModel.count({ 
      where: { ...whereClause, status: 'pending' } 
    });
    const inTransitDeliveries = await DeliveryModel.count({ 
      where: { ...whereClause, status: ['assigned', 'picked_up', 'in_transit'] } 
    });
    const deliveredDeliveries = await DeliveryModel.count({ 
      where: { ...whereClause, status: 'delivered' } 
    });
    const failedDeliveries = await DeliveryModel.count({ 
      where: { ...whereClause, status: 'failed' } 
    });

    const stats = {
      total: totalDeliveries,
      pending: pendingDeliveries,
      inTransit: inTransitDeliveries,
      delivered: deliveredDeliveries,
      failed: failedDeliveries,
      successRate: totalDeliveries > 0 ? (deliveredDeliveries / totalDeliveries * 100).toFixed(1) : 0,
      failureRate: totalDeliveries > 0 ? (failedDeliveries / totalDeliveries * 100).toFixed(1) : 0
    };

    logger(`Generated delivery stats for business ${businessId}`);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger(`Error getting delivery stats: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get delivery statistics'
    });
  }
});

export default router; 