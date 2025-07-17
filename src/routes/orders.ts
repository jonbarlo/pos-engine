import { Router } from 'express';
import { 
  OrderModel, 
  MenuItemModel, 
  CustomerModel, 
  TableModel, 
  BusinessModel, 
  OrderItemModel,
  KitchenOrderModel
} from '../models';
import { OrderStatus, OrderType } from '../models/OrderModel';
import { OrderItemStatus } from '../models/OrderItemModel';
import { TableStatus } from '../models/TableModel';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';
import { OrderController } from '../controllers/orderController';

const router = Router();

/**
 * Helper function to create kitchen order from order
 */
async function createKitchenOrderFromOrder(order: any, orderItems: any[]): Promise<void> {
  try {
    // Create kitchen order items
    const kitchenItems = orderItems.map((item, index) => ({
      id: index + 1,
      itemName: item.itemName,
      quantity: item.quantity,
      status: 'pending' as const,
      specialInstructions: item.notes || '',
      modifications: [],
      allergens: [],
      preparationTime: 15 // Default preparation time
    }));

    // Create kitchen order
    await KitchenOrderModel.create({
      businessId: order.businessId,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: 'Customer', // Could be enhanced to get from customer
      orderType: order.orderType,
      priority: 'normal',
      status: 'pending',
      estimatedPrepTime: 15,
      items: kitchenItems,
      totalItems: kitchenItems.length,
      completedItems: 0,
      notes: `Auto-generated from order ${order.orderNumber}`
    });

    logger(`Created kitchen order for order ${order.orderNumber}`);
  } catch (error) {
    logger(`Error creating kitchen order for order ${order.orderNumber}: ${error}`);
    // Don't throw error to avoid breaking order creation
  }
}

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
    
    // Validate order ID
    if (!id || id === null || id === 'undefined') {
      res.status(400).json({
        success: false,
        message: 'Valid order ID is required'
      });
      return;
    }

    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      res.status(400).json({
        success: false,
        message: 'Order ID must be a valid number'
      });
      return;
    }

    const order = await OrderModel.findOne({
      where: { id: orderId, businessId },
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

      const itemTotal = Math.round((menuItem.price * item.quantity) * 100) / 100;
      subtotal += itemTotal;

      orderItems.push({
        itemId: item.itemId,
        itemName: menuItem.name,
        quantity: item.quantity,
        unitPrice: Math.round(menuItem.price * 100) / 100,
        totalPrice: itemTotal,
        notes: item.notes
      });
    }

    // Get business tax rate
    const business = await BusinessModel.findByPk(businessId);
    const taxRate = business?.taxRate || 0;
    const taxAmount = Math.round((subtotal * (taxRate / 100)) * 100) / 100;
    const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

    // Generate order number
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const orderNumber = `ORD-${timestamp}-${random}`;

    // Create order with properly formatted decimal values
    const order = await OrderModel.create({
      businessId,
      serverId: req.user?.userId || 1, // Use current user as server
      customerId,
      tableId,
      orderNumber,
      orderType, // Use the orderType from request body
      status: OrderStatus.PENDING,
      subtotal: parseFloat(subtotal.toFixed(2)), // Ensure proper decimal format
      taxAmount: parseFloat(taxAmount.toFixed(2)), // Ensure proper decimal format
      discountAmount: 0,
      totalAmount: parseFloat(totalAmount.toFixed(2)), // Ensure proper decimal format
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
        status: OrderItemStatus.PENDING,
        notes: item.notes
      });
    }

    // Create kitchen order
    await createKitchenOrderFromOrder(order, orderItems);

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

      const itemTotal = Math.round((menuItem.price * item.quantity) * 100) / 100;
      subtotal += itemTotal;

      orderItems.push({
        itemId: item.itemId,
        itemName: menuItem.name,
        quantity: item.quantity,
        unitPrice: Math.round(menuItem.price * 100) / 100,
        totalPrice: itemTotal,
        notes: item.notes
      });
    }

    // Get business tax rate
    const business = await BusinessModel.findByPk(businessId);
    const taxRate = business?.taxRate || 0;
    const taxAmount = Math.round((subtotal * (taxRate / 100)) * 100) / 100;
    const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

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
      subtotal: parseFloat(subtotal.toFixed(2)), // Ensure proper decimal format
      taxAmount: parseFloat(taxAmount.toFixed(2)), // Ensure proper decimal format
      discountAmount: 0,
      totalAmount: parseFloat(totalAmount.toFixed(2)), // Ensure proper decimal format
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

    // Create kitchen order
    await createKitchenOrderFromOrder(order, orderItems);

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
    
    // Validate order ID
    if (!id || id === null || id === 'undefined') {
      res.status(400).json({
        success: false,
        message: 'Valid order ID is required'
      });
      return;
    }

    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      res.status(400).json({
        success: false,
        message: 'Order ID must be a valid number'
      });
      return;
    }

    const { status, notes } = req.body;

    if (!status) {
      res.status(400).json({
        success: false,
        message: 'Status is required'
      });
      return;
    }

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
    
    // Validate order ID
    if (!id || id === null || id === 'undefined') {
      res.status(400).json({
        success: false,
        message: 'Valid order ID is required'
      });
      return;
    }

    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      res.status(400).json({
        success: false,
        message: 'Order ID must be a valid number'
      });
      return;
    }

    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      logger(`Invalid items array: ${JSON.stringify(items)}`);
      res.status(400).json({
        success: false,
        message: 'Items array is required and must be a non-empty array'
      });
      return;
    }

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
        logger(`Invalid item data in add items endpoint: ${JSON.stringify(item)}`);
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

      const itemTotal = Math.round((menuItem.price * item.quantity) * 100) / 100;
      additionalSubtotal += itemTotal;

      await OrderItemModel.create({
        orderId: order.id,
        itemId: item.itemId,
        itemName: menuItem.name,
        quantity: item.quantity,
        unitPrice: Math.round(menuItem.price * 100) / 100,
        totalPrice: itemTotal,
        status: OrderItemStatus.PENDING,
        notes: item.notes
      });

      logger(`Added item ${menuItem.name} to order ${id}`);
    }

    // Update order totals
    const newSubtotal = order.subtotal + additionalSubtotal;
    const business = await BusinessModel.findByPk(businessId);
    const taxRate = business?.taxRate || 0;
    const newTaxAmount = Math.round((newSubtotal * (taxRate / 100)) * 100) / 100;
    const newTotalAmount = Math.round((newSubtotal + newTaxAmount) * 100) / 100;

    await order.update({
      subtotal: parseFloat(newSubtotal.toFixed(2)),
      taxAmount: parseFloat(newTaxAmount.toFixed(2)),
      totalAmount: parseFloat(newTotalAmount.toFixed(2))
    });

    // Check if kitchen order exists for this order
    const existingKitchenOrder = await KitchenOrderModel.findOne({
      where: { orderId: order.id }
    });

    if (!existingKitchenOrder) {
      // Create kitchen order if it doesn't exist
      const orderItems = await OrderItemModel.findAll({
        where: { orderId: order.id }
      });
      
      if (orderItems.length > 0) {
        await createKitchenOrderFromOrder(order, orderItems);
        logger(`Created missing kitchen order for order ${order.id} when adding items`);
      }
    } else {
      // Update existing kitchen order with new items
      const newItems = items.map((item, index) => {
        const menuItem = items.find(mi => mi.itemId === item.itemId);
        return {
          id: existingKitchenOrder.totalItems + index + 1,
          itemName: menuItem?.name || `Item ${item.itemId}`,
          quantity: item.quantity,
          status: 'pending' as const,
          specialInstructions: item.notes || '',
          modifications: [],
          allergens: [],
          preparationTime: 15
        };
      });

      const currentItems = existingKitchenOrder.items || [];
      const updatedItems = [...currentItems, ...newItems];
      
      await existingKitchenOrder.update({
        items: updatedItems,
        totalItems: updatedItems.length,
        notes: `Updated with new items - ${new Date().toISOString()}`
      });
      
      logger(`Updated existing kitchen order ${existingKitchenOrder.id} with new items`);
    }

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

/**
 * @swagger
 * /api/orders/{id}/complete:
 *   put:
 *     summary: Complete an order and create a sale
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
 *               - paymentMethod
 *             properties:
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, card, check, mobile]
 *                 description: Payment method used
 *               customerName:
 *                 type: string
 *                 description: Customer name
 *               customerEmail:
 *                 type: string
 *                 format: email
 *                 description: Customer email
 *               customerPhone:
 *                 type: string
 *                 description: Customer phone number
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *     responses:
 *       200:
 *         description: Order completed and sale created successfully
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
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *                     sale:
 *                       $ref: '#/components/schemas/Sale'
 *                 message:
 *                   type: string
 *                   example: Order completed successfully
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
router.put('/:id/complete', OrderController.completeOrder);

/**
 * @swagger
 * /api/tables/{tableId}/clear:
 *   put:
 *     summary: Clear a table and complete all pending orders
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tableId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Table ID
 *     responses:
 *       200:
 *         description: Table cleared successfully
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
 *                     ordersCompleted:
 *                       type: integer
 *                       description: Number of orders completed
 *                     salesCreated:
 *                       type: integer
 *                       description: Number of sales created
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Any errors encountered
 *                 message:
 *                   type: string
 *                   example: Table cleared successfully
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
router.put('/tables/:tableId/clear', OrderController.clearTable);

/**
 * @swagger
 * /api/tables/{tableId}/orders:
 *   get:
 *     summary: Get all orders for a specific table
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tableId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Table ID
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
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
 *                 message:
 *                   type: string
 *                   example: Found 3 orders for table 1
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
router.get('/tables/:tableId/orders', OrderController.getOrdersByTable);

/**
 * @swagger
 * /api/orders/pending:
 *   get:
 *     summary: Get all pending orders for the business
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending orders retrieved successfully
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
 *                 message:
 *                   type: string
 *                   example: Found 5 pending orders
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/pending', OrderController.getPendingOrders);

/**
 * @swagger
 * /api/orders/completed:
 *   get:
 *     summary: Get completed orders for the business
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Completed orders retrieved successfully
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
 *                 message:
 *                   type: string
 *                   example: Found 25 completed orders
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
router.get('/completed', OrderController.getCompletedOrders);

/**
 * @swagger
 * /api/orders/stats:
 *   get:
 *     summary: Get order statistics for the business
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering (YYYY-MM-DD)
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
 *                     totalCompletedOrders:
 *                       type: integer
 *                       description: Total number of completed orders
 *                     totalPendingOrders:
 *                       type: integer
 *                       description: Total number of pending orders
 *                     totalRevenue:
 *                       type: number
 *                       description: Total revenue from completed orders
 *                     averageOrderValue:
 *                       type: number
 *                       description: Average order value
 *                     ordersByStatus:
 *                       type: object
 *                       properties:
 *                         pending:
 *                           type: integer
 *                         confirmed:
 *                           type: integer
 *                         in_progress:
 *                           type: integer
 *                         ready:
 *                           type: integer
 *                         served:
 *                           type: integer
 *                 message:
 *                   type: string
 *                   example: Order statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/stats', OrderController.getOrderStats);

/**
 * @swagger
 * /api/orders/create-missing-kitchen-orders:
 *   post:
 *     summary: Create missing kitchen orders for existing orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Missing kitchen orders created successfully
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
 *                     success:
 *                       type: integer
 *                       description: Number of kitchen orders created successfully
 *                     failed:
 *                       type: integer
 *                       description: Number of kitchen orders that failed to create
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: List of error messages
 *                 message:
 *                   type: string
 *                   example: Missing kitchen orders created successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/create-missing-kitchen-orders', authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    logger(`API endpoint POST /orders/create-missing-kitchen-orders was called for business ${businessId}`);

    // Find orders that don't have associated kitchen orders
    const ordersWithoutKitchenOrders = await OrderModel.findAll({
      where: { businessId },
      include: [
        {
          model: OrderItemModel,
          as: 'orderItems'
        }
      ]
    });

    const result = { success: 0, failed: 0, errors: [] as string[] };

    for (const order of ordersWithoutKitchenOrders) {
      try {
        // Check if kitchen order already exists for this order
        const existingKitchenOrder = await KitchenOrderModel.findOne({
          where: { orderId: order.id }
        });

        if (existingKitchenOrder) {
          continue; // Kitchen order already exists, skip
        }

        // Convert order items to kitchen order format
        const orderItems = (order as any).orderItems || [];
        if (orderItems.length === 0) {
          logger(`WARNING: Order ${order.id} has no items, skipping kitchen order creation`);
          continue;
        }

        // Create kitchen order
        await createKitchenOrderFromOrder(order, orderItems);
        result.success++;
        logger(`SUCCESS: Created missing kitchen order for order ${order.id}`);

      } catch (error) {
        result.failed++;
        const errorMsg = `Failed to create kitchen order for order ${order.id}: ${error}`;
        result.errors.push(errorMsg);
        logger(`ERROR: ${errorMsg}`);
      }
    }

    logger(`INFO: Completed creating missing kitchen orders. Success: ${result.success}, Failed: ${result.failed}`);

    res.json({
      success: true,
      data: result,
      message: 'Missing kitchen orders created successfully'
    });

  } catch (error) {
    logger(`Error creating missing kitchen orders: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to create missing kitchen orders'
    });
  }
});

export default router; 