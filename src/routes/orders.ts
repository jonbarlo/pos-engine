import { Router } from 'express';
import { 
  OrderModel, 
  MenuItemModel, 
  CustomerModel, 
  TableModel, 
  BusinessModel, 
  OrderItemModel 
} from '../models';
import { OrderStatus, OrderType } from '../models/OrderModel';
import { TableStatus } from '../models/TableModel';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - businessId
 *         - serverId
 *         - orderType
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated order ID
 *         businessId:
 *           type: integer
 *           description: Business ID
 *         tableId:
 *           type: integer
 *           description: Associated table ID (for dine-in orders)
 *         serverId:
 *           type: integer
 *           description: Server/user who created the order
 *         customerId:
 *           type: integer
 *           description: Associated customer ID
 *         orderNumber:
 *           type: string
 *           description: Unique order number
 *         orderType:
 *           type: string
 *           enum: [dine_in, takeaway, delivery]
 *           description: Type of order
 *         status:
 *           type: string
 *           enum: [pending, confirmed, in_progress, ready, served, completed, cancelled]
 *           description: Current order status
 *         subtotal:
 *           type: number
 *           description: Order subtotal
 *         taxAmount:
 *           type: number
 *           description: Tax amount
 *         discountAmount:
 *           type: number
 *           description: Discount amount
 *         totalAmount:
 *           type: number
 *           description: Total order amount
 *         notes:
 *           type: string
 *           description: General order notes
 *         specialInstructions:
 *           type: string
 *           description: Special instructions
 *         estimatedReadyTime:
 *           type: string
 *           format: date-time
 *         actualReadyTime:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     OrderItem:
 *       type: object
 *       required:
 *         - orderId
 *         - itemId
 *         - itemName
 *         - quantity
 *         - unitPrice
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated order item ID
 *         orderId:
 *           type: integer
 *           description: Associated order ID
 *         itemId:
 *           type: integer
 *           description: Menu item ID
 *         itemName:
 *           type: string
 *           description: Item name at time of order
 *         quantity:
 *           type: integer
 *           description: Quantity ordered
 *         unitPrice:
 *           type: number
 *           description: Unit price at time of order
 *         totalPrice:
 *           type: number
 *           description: Total price for this item
 *         status:
 *           type: string
 *           enum: [pending, confirmed, in_progress, ready, served, cancelled]
 *           description: Item status
 *         notes:
 *           type: string
 *           description: Item-specific notes
 *         specialInstructions:
 *           type: string
 *           description: Item-specific instructions
 *         modifications:
 *           type: string
 *           description: Item modifications
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders for the current business
 *     tags: [Orders]
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
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, preparing, ready, served, completed, cancelled]
 *         description: Filter by order status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [dine_in, takeaway, delivery]
 *         description: Filter by order type
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by order date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: List of orders retrieved successfully
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
 *                     $ref: '#/components/schemas/Order'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status as string;
    const type = req.query.type as string;
    const date = req.query.date as string;

    const whereClause: any = { businessId };

    if (status) {
      whereClause.status = status;
    }

    if (type) {
      whereClause.orderType = type;
    }

    if (date) {
      whereClause.createdAt = {
        [Op.between]: [
          new Date(date + ' 00:00:00'),
          new Date(date + ' 23:59:59')
        ]
      };
    }

    const { count, rows: orders } = await OrderModel.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    logger(`Found ${orders.length} orders for business ${businessId}`);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger(`Error getting orders: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get orders'
    });
  }
});

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get a specific order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
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

    const order = await OrderModel.findOne({
      where: { id, businessId },
      include: [
        {
          model: CustomerModel,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: TableModel,
          as: 'table',
          attributes: ['id', 'tableNumber', 'capacity', 'section']
        },
        {
          model: OrderItemModel,
          as: 'orderItems',
          include: [
            {
              model: MenuItemModel,
              as: 'menuItem',
              attributes: ['id', 'name', 'description', 'price']
            }
          ]
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

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    logger(`Error getting order: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get order'
    });
  }
});

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderType
 *               - items
 *             properties:
 *               customerId:
 *                 type: integer
 *                 description: Customer ID (optional)
 *               tableId:
 *                 type: integer
 *                 description: Table ID (optional for dine-in)
 *               orderType:
 *                 type: string
 *                 enum: [dine_in, takeaway, delivery]
 *                 example: dine_in
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - itemId
 *                     - quantity
 *                   properties:
 *                     itemId:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *                     notes:
 *                       type: string
 *                       example: Extra cheese please
 *               notes:
 *                 type: string
 *                 description: General order notes
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *                 message:
 *                   type: string
 *                   example: Order created successfully
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
      customerId,
      tableId,
      orderType,
      items,
      notes
    } = req.body;

    if (!orderType || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        message: 'orderType and items are required'
      });
      return;
    }

    // Validate items
    for (const item of items) {
      if (!item.itemId || !item.quantity) {
        res.status(400).json({
          success: false,
          message: 'Each item must have itemId and quantity'
        });
        return;
      }
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItemModel.findByPk(item.itemId);
      if (!menuItem || menuItem.businessId !== businessId) {
        res.status(400).json({
          success: false,
          message: `Invalid menu item: ${item.itemId}`
        });
        return;
      }

      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        itemId: item.itemId,
        itemName: menuItem.name,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        totalPrice: itemTotal,
        notes: item.notes
      });
    }

    // Get business tax rate
    const business = await BusinessModel.findByPk(businessId);
    const taxRate = business?.taxRate || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    // Generate order number
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const orderNumber = `ORD-${timestamp}-${random}`;

    // Create order
    const order = await OrderModel.create({
      businessId,
      serverId: req.user?.userId || 1, // Use current user as server
      customerId,
      tableId,
      orderNumber,
      orderType,
      status: OrderStatus.PENDING,
      subtotal,
      taxAmount,
      discountAmount: 0,
      totalAmount,
      notes
    });

    // Create order items
    for (const item of orderItems) {
      await OrderItemModel.create({
        orderId: order.id,
        itemId: item.itemId,
        itemName: item.itemName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        notes: item.notes
      } as any);
    }

    // Update table status to occupied if this is a dine-in order with tableId
    if (orderType === OrderType.DINE_IN && tableId) {
      const table = await TableModel.findOne({
        where: { id: tableId, businessId }
      });
      
      if (table) {
        await table.update({
          status: TableStatus.OCCUPIED,
          currentOrderId: order.id,
          serverId: req.user?.userId || 1
        });
        logger(`Updated table ${tableId} status to occupied for order ${order.orderNumber}`);
      }
    }

    logger(`Created order ${order.orderNumber} for business ${businessId}, type: ${orderType}`);

    // Reload order with items
    const createdOrder = await OrderModel.findByPk(order.id, {
      include: [
        {
          model: OrderItemModel,
          as: 'orderItems',
          include: [
            {
              model: MenuItemModel,
              as: 'menuItem',
              attributes: ['id', 'name', 'description', 'price']
            }
          ]
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: createdOrder,
      message: 'Order created successfully'
    });
  } catch (error) {
    logger(`Error creating order: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
});

/**
 * @swagger
 * /api/orders/table:
 *   post:
 *     summary: Create a new order for a specific table
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tableId
 *               - items
 *             properties:
 *               tableId:
 *                 type: integer
 *                 description: Table ID for the order
 *               customerId:
 *                 type: integer
 *                 description: Optional customer ID
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     itemId:
 *                       type: integer
 *                       description: Menu item ID
 *                     quantity:
 *                       type: integer
 *                       description: Quantity ordered
 *                     notes:
 *                       type: string
 *                       description: Item-specific notes
 *               notes:
 *                 type: string
 *                 description: General order notes
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *                 message:
 *                   type: string
 *                   example: Order created successfully
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
router.post('/table', authenticateToken, async (req: AuthRequest, res): Promise<void> => {
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
      tableId,
      customerId,
      items,
      notes
    } = req.body;

    if (!tableId || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        message: 'tableId and items are required'
      });
      return;
    }

    // Validate table exists and belongs to business
    const table = await TableModel.findOne({
      where: { id: tableId, businessId }
    });

    if (!table) {
      res.status(400).json({
        success: false,
        message: 'Invalid table ID'
      });
      return;
    }

    // Validate items
    for (const item of items) {
      if (!item.itemId || !item.quantity) {
        res.status(400).json({
          success: false,
          message: 'Each item must have itemId and quantity'
        });
        return;
      }
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItemModel.findByPk(item.itemId);
      if (!menuItem || menuItem.businessId !== businessId) {
        res.status(400).json({
          success: false,
          message: `Invalid menu item: ${item.itemId}`
        });
        return;
      }

      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        itemId: item.itemId,
        itemName: menuItem.name,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        totalPrice: itemTotal,
        notes: item.notes
      });
    }

    // Get business tax rate
    const business = await BusinessModel.findByPk(businessId);
    const taxRate = business?.taxRate || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    // Generate order number
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const orderNumber = `ORD-${timestamp}-${random}`;

    // Create order
    const order = await OrderModel.create({
      businessId,
      serverId: req.user?.userId || 1, // Use current user as server
      customerId,
      tableId,
      orderNumber,
      orderType: OrderType.DINE_IN,
      status: OrderStatus.PENDING,
      subtotal,
      taxAmount,
      discountAmount: 0,
      totalAmount,
      notes
    });

    // Create order items
    for (const item of orderItems) {
      await OrderItemModel.create({
        orderId: order.id,
        itemId: item.itemId,
        itemName: item.itemName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        notes: item.notes
      } as any);
    }

    // Update table status to occupied and link the order
    await table.update({
      status: TableStatus.OCCUPIED,
      currentOrderId: order.id,
      serverId: req.user?.userId || 1
    });

    logger(`Created table order ${order.orderNumber} for table ${tableId} in business ${businessId} - Table status updated to occupied`);

    // Reload order with items
    const createdOrder = await OrderModel.findByPk(order.id, {
      include: [
        {
          model: OrderItemModel,
          as: 'orderItems',
          include: [
            {
              model: MenuItemModel,
              as: 'menuItem',
              attributes: ['id', 'name', 'description', 'price']
            }
          ]
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: createdOrder,
      message: 'Table order created successfully'
    });
  } catch (error) {
    logger(`Error creating table order: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to create table order'
    });
  }
});

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, preparing, ready, served, completed, cancelled]
 *                 example: confirmed
 *               notes:
 *                 type: string
 *                 description: Optional notes about the status change
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *                 message:
 *                   type: string
 *                   example: Order status updated successfully
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

    if (!status) {
      res.status(400).json({
        success: false,
        message: 'Status is required'
      });
      return;
    }

    const order = await OrderModel.findOne({
      where: { id, businessId }
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    await order.update({ status });

    // Update table status based on order status for dine-in orders
    if (order.tableId && order.orderType === OrderType.DINE_IN) {
      const table = await TableModel.findOne({
        where: { id: order.tableId, businessId }
      });

      if (table) {
        if (status === OrderStatus.COMPLETED || status === OrderStatus.CANCELLED) {
          // Free up the table
          await table.update({
            status: TableStatus.AVAILABLE,
            currentOrderId: null,
            serverId: null
          });
          logger(`Order ${id} ${status} - Table ${order.tableId} status updated to available`);
        } else if (status === OrderStatus.PENDING || status === OrderStatus.CONFIRMED) {
          // Ensure table is marked as occupied
          await table.update({
            status: TableStatus.OCCUPIED,
            currentOrderId: order.id,
            serverId: req.user?.userId || 1
          });
          logger(`Order ${id} ${status} - Table ${order.tableId} status updated to occupied`);
        }
      }
    }

    logger(`Updated order ${id} status to: ${status}`);

    res.json({
      success: true,
      data: order,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    logger(`Error updating order status: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
});

/**
 * @swagger
 * /api/orders/{id}/items:
 *   post:
 *     summary: Add items to an existing order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - itemId
 *                     - quantity
 *                   properties:
 *                     itemId:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       example: 1
 *                     notes:
 *                       type: string
 *                       example: Extra spicy
 *     responses:
 *       200:
 *         description: Items added to order successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *                 message:
 *                   type: string
 *                   example: Items added to order successfully
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/items', authenticateToken, async (req: AuthRequest, res): Promise<void> => {
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
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Items array is required'
      });
      return;
    }

    const order = await OrderModel.findOne({
      where: { id, businessId }
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) {
      res.status(400).json({
        success: false,
        message: 'Cannot add items to completed or cancelled order'
      });
      return;
    }

    let additionalSubtotal = 0;

    for (const item of items) {
      if (!item.itemId || !item.quantity) {
        res.status(400).json({
          success: false,
          message: 'Each item must have itemId and quantity'
        });
        return;
      }

      const menuItem = await MenuItemModel.findByPk(item.itemId);
      if (!menuItem || menuItem.businessId !== businessId) {
        res.status(400).json({
          success: false,
          message: `Invalid menu item: ${item.itemId}`
        });
        return;
      }

      const itemTotal = menuItem.price * item.quantity;
      additionalSubtotal += itemTotal;

      await OrderItemModel.create({
        orderId: order.id,
        itemId: item.itemId,
        itemName: menuItem.name,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        totalPrice: itemTotal,
        notes: item.notes
      } as any);

      logger(`Added item ${menuItem.name} to order ${id}`);
    }

    // Update order totals
    const newSubtotal = order.subtotal + additionalSubtotal;
    const business = await BusinessModel.findByPk(businessId);
    const taxRate = business?.taxRate || 0;
    const newTaxAmount = newSubtotal * (taxRate / 100);
    const newTotalAmount = newSubtotal + newTaxAmount;

    await order.update({
      subtotal: newSubtotal,
      taxAmount: newTaxAmount,
      totalAmount: newTotalAmount
    });

    // Reload order with items
    const updatedOrder = await OrderModel.findByPk(order.id, {
      include: [
        {
          model: OrderItemModel,
          as: 'orderItems',
          include: [
            {
              model: MenuItemModel,
              as: 'menuItem',
              attributes: ['id', 'name', 'description', 'price']
            }
          ]
        }
      ]
    });

    res.json({
      success: true,
      data: updatedOrder,
      message: 'Items added to order successfully'
    });
  } catch (error) {
    logger(`Error adding items to order: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to add items to order'
    });
  }
});

/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     summary: Update an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerId:
 *                 type: integer
 *                 description: Customer ID
 *               tableId:
 *                 type: integer
 *                 description: Table ID
 *               notes:
 *                 type: string
 *                 description: Order notes
 *               estimatedReadyTime:
 *                 type: string
 *                 format: date-time
 *                 description: Estimated ready time
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *                 message:
 *                   type: string
 *                   example: Order updated successfully
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', authenticateToken, async (req: AuthRequest, res): Promise<void> => {
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
    const { customerId, tableId, notes, estimatedReadyTime } = req.body;

    const order = await OrderModel.findOne({
      where: { id, businessId }
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    await order.update({
      customerId,
      tableId,
      notes,
      estimatedReadyTime
    });

    res.json({
      success: true,
      data: order,
      message: 'Order updated successfully'
    });
  } catch (error) {
    logger(`Error updating order: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to update order'
    });
  }
});

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Cancel an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Order cancelled successfully
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authenticateToken, async (req: AuthRequest, res): Promise<void> => {
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

    const order = await OrderModel.findOne({
      where: { id, businessId }
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    if (order.status === OrderStatus.COMPLETED) {
      res.status(400).json({
        success: false,
        message: 'Cannot cancel completed order'
      });
      return;
    }

    await order.update({ status: OrderStatus.CANCELLED });

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    logger(`Error cancelling order: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order'
    });
  }
});

/**
 * @swagger
 * /api/orders/stats/overview:
 *   get:
 *     summary: Get order statistics overview
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month, year]
 *           default: today
 *         description: Time period for statistics
 *     responses:
 *       200:
 *         description: Order statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalOrders:
 *                       type: integer
 *                       example: 45
 *                     totalRevenue:
 *                       type: number
 *                       example: 1250.75
 *                     averageOrderValue:
 *                       type: number
 *                       example: 27.79
 *                     ordersByStatus:
 *                       type: object
 *                       properties:
 *                         pending:
 *                           type: integer
 *                           example: 5
 *                         confirmed:
 *                           type: integer
 *                           example: 8
 *                         preparing:
 *                           type: integer
 *                           example: 3
 *                         ready:
 *                           type: integer
 *                           example: 2
 *                         served:
 *                           type: integer
 *                           example: 15
 *                         completed:
 *                           type: integer
 *                           example: 10
 *                         cancelled:
 *                           type: integer
 *                           example: 2
 *                     ordersByType:
 *                       type: object
 *                       properties:
 *                         dine_in:
 *                           type: integer
 *                           example: 25
 *                         takeaway:
 *                           type: integer
 *                           example: 15
 *                         delivery:
 *                           type: integer
 *                           example: 5
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

    const period = req.query.period as string || 'today';
    let startDate: Date;
    const endDate = new Date();

    switch (period) {
      case 'today':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
    }

    const whereClause = {
      businessId,
      createdAt: {
        [Op.between]: [startDate, endDate]
      }
    };

    const orders = await OrderModel.findAll({
      where: whereClause,
      attributes: ['status', 'orderType', 'totalAmount']
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const ordersByStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as any);

    const ordersByType = orders.reduce((acc, order) => {
      acc[order.orderType] = (acc[order.orderType] || 0) + 1;
      return acc;
    }, {} as any);

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        ordersByStatus,
        ordersByType
      }
    });
  } catch (error) {
    logger(`Error getting order stats: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get order statistics'
    });
  }
});

/**
 * @swagger
 * /api/orders/table/{tableId}:
 *   get:
 *     summary: Get all orders for a specific table
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tableId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Table ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, in_progress, ready, served, completed, cancelled]
 *         description: Filter by order status
 *       - in: query
 *         name: includeItems
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Include order items in response
 *     responses:
 *       200:
 *         description: Table orders retrieved successfully
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
 *                     $ref: '#/components/schemas/Order'
 *       404:
 *         description: Table not found
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
router.get('/table/:tableId', authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const tableId = parseInt(req.params.tableId || '0');
    const status = req.query.status as string;
    const includeItems = req.query.includeItems !== 'false';

    // Verify table exists and belongs to business
    const table = await TableModel.findOne({
      where: { id: tableId, businessId }
    });

    if (!table) {
      res.status(404).json({
        success: false,
        message: 'Table not found'
      });
      return;
    }

    const whereClause: any = { 
      businessId, 
      tableId,
      orderType: OrderType.DINE_IN
    };

    if (status) {
      whereClause.status = status;
    }

    const includeOptions = includeItems ? [{
      model: OrderItemModel,
      as: 'orderItems',
      include: [{
        model: MenuItemModel,
        as: 'menuItem',
        attributes: ['id', 'name', 'description', 'price', 'sku']
      }]
    }] : [];

    const orders = await OrderModel.findAll({
      where: whereClause,
      include: includeOptions,
      order: [['createdAt', 'DESC']]
    });

    logger(`Found ${orders.length} orders for table ${tableId} in business ${businessId}`);

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    logger(`Error getting table orders: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get table orders'
    });
  }
});

/**
 * @swagger
 * /api/orders/{id}/complete:
 *   post:
 *     summary: Complete an order and update table status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order completed and table status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Order completed successfully
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/complete', authenticateToken, async (req: AuthRequest, res): Promise<void> => {
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

    const order = await OrderModel.findOne({
      where: { id, businessId }
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    if (order.status === OrderStatus.COMPLETED) {
      res.status(400).json({
        success: false,
        message: 'Order is already completed'
      });
      return;
    }

    // Complete the order
    await order.update({ 
      status: OrderStatus.COMPLETED,
      actualReadyTime: new Date()
    });

    // If this is a table order, update table status
    if (order.tableId && order.orderType === OrderType.DINE_IN) {
      const table = await TableModel.findOne({
        where: { id: order.tableId, businessId }
      });

      if (table) {
        await table.update({
          status: TableStatus.AVAILABLE,
          currentOrderId: null,
          serverId: null
        });

        logger(`Order ${id} completed - Table ${order.tableId} status updated to available`);
      }
    }

    res.json({
      success: true,
      message: 'Order completed successfully'
    });
  } catch (error) {
    logger(`Error completing order: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to complete order'
    });
  }
});

export default router; 