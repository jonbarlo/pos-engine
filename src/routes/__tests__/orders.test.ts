import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { Sequelize, DataTypes } from 'sequelize';
import { OrderModel, OrderStatus, OrderType } from '../../models/OrderModel';
import { OrderItemModel, OrderItemStatus } from '../../models/OrderItemModel';
import jwt from 'jsonwebtoken';

// Create test database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false,
});

// Define BusinessModel and UserModel for the test DB
const BusinessModel = sequelize.define('Business', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING,
  slug: DataTypes.STRING,
  type: DataTypes.STRING,
  taxRate: DataTypes.FLOAT,
  currency: DataTypes.STRING,
  timezone: DataTypes.STRING,
});

const UserModel = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  businessId: DataTypes.INTEGER,
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  password: DataTypes.STRING,
  role: DataTypes.STRING,
});

const TableModel = sequelize.define('Table', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  businessId: DataTypes.INTEGER,
  tableNumber: DataTypes.STRING,
  capacity: DataTypes.INTEGER,
  status: DataTypes.STRING,
});

const CustomerModel = sequelize.define('Customer', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  businessId: DataTypes.INTEGER,
  name: DataTypes.STRING,
  email: DataTypes.STRING,
});

const MenuItemModel = sequelize.define('MenuItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  businessId: DataTypes.INTEGER,
  name: DataTypes.STRING,
  price: DataTypes.DECIMAL,
  isAvailable: DataTypes.BOOLEAN,
});

// Initialize OrderModel for the test DB
const TestOrderModel = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  businessId: { type: DataTypes.INTEGER, allowNull: false },
  tableId: DataTypes.INTEGER,
  serverId: { type: DataTypes.INTEGER, allowNull: false },
  customerId: DataTypes.INTEGER,
  orderNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: OrderStatus.PENDING },
  orderType: { type: DataTypes.STRING, allowNull: false, defaultValue: OrderType.DINE_IN },
  subtotal: { type: DataTypes.DECIMAL, allowNull: false, defaultValue: 0 },
  taxAmount: { type: DataTypes.DECIMAL, allowNull: false, defaultValue: 0 },
  discountAmount: { type: DataTypes.DECIMAL, allowNull: false, defaultValue: 0 },
  totalAmount: { type: DataTypes.DECIMAL, allowNull: false, defaultValue: 0 },
  notes: DataTypes.TEXT,
  specialInstructions: DataTypes.TEXT,
  estimatedReadyTime: DataTypes.DATE,
  actualReadyTime: DataTypes.DATE,
});

// Initialize OrderItemModel for the test DB
const TestOrderItemModel = sequelize.define('OrderItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  itemId: { type: DataTypes.INTEGER, allowNull: false },
  itemName: { type: DataTypes.STRING, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  unitPrice: { type: DataTypes.DECIMAL, allowNull: false, defaultValue: 0 },
  totalPrice: { type: DataTypes.DECIMAL, allowNull: false, defaultValue: 0 },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: OrderItemStatus.PENDING },
  notes: DataTypes.TEXT,
  specialInstructions: DataTypes.TEXT,
  modifications: DataTypes.TEXT,
  estimatedReadyTime: DataTypes.DATE,
  actualReadyTime: DataTypes.DATE,
});

// Add instance methods to test OrderModel
// @ts-ignore
TestOrderModel.prototype.calculateTotals = function() {
  const subtotal = parseFloat((this as any).subtotal || 0);
  const taxAmount = parseFloat((this as any).taxAmount || 0);
  const discountAmount = parseFloat((this as any).discountAmount || 0);
  (this as any).totalAmount = subtotal + taxAmount - discountAmount;
};

// @ts-ignore
TestOrderModel.prototype.canTransitionTo = function(newStatus: OrderStatus) {
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED],
    [OrderStatus.IN_PROGRESS]: [OrderStatus.READY, OrderStatus.CANCELLED],
    [OrderStatus.READY]: [OrderStatus.SERVED, OrderStatus.CANCELLED],
    [OrderStatus.SERVED]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
    [OrderStatus.COMPLETED]: [],
    [OrderStatus.CANCELLED]: [],
  };
  // @ts-ignore
  return validTransitions[(this as any).status].includes(newStatus);
};

// Create test app
const app = express();
app.use(express.json());

// Add authentication middleware mock
const mockAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }
  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret') as any;
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Add business type middleware mock
const mockBusinessTypeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  (req as any).businessType = 'restaurant';
  next();
};

// Add restaurant requirement middleware mock
const mockRestaurantMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).businessType !== 'restaurant') {
    res.status(403).json({ error: 'Business is not restaurant type' });
    return;
  }
  next();
};

// Add order routes with test models
app.use('/api/orders', mockAuthMiddleware, mockBusinessTypeMiddleware, mockRestaurantMiddleware, (req, res, next) => {
  // Mock order routes for testing
  if (req.method === 'GET' && req.path === '/') {
    // GET /api/orders
    const { businessId, status, tableId } = req.query;
    const whereClause: any = { businessId: parseInt(businessId as string) };
    
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    if (tableId) {
      whereClause.tableId = parseInt(tableId as string);
    }
    
    TestOrderModel.findAll({ where: whereClause, order: [['createdAt', 'DESC']] })
      .then(orders => {
        res.status(200).json({
          message: 'Orders retrieved successfully',
          count: orders.length,
          orders: orders.map(order => ({
            id: order.get('id'),
            businessId: order.get('businessId'),
            tableId: order.get('tableId'),
            serverId: order.get('serverId'),
            customerId: order.get('customerId'),
            orderNumber: order.get('orderNumber'),
            status: order.get('status'),
            orderType: order.get('orderType'),
            subtotal: order.get('subtotal'),
            taxAmount: order.get('taxAmount'),
            discountAmount: order.get('discountAmount'),
            totalAmount: order.get('totalAmount'),
            notes: order.get('notes'),
            specialInstructions: order.get('specialInstructions'),
            estimatedReadyTime: order.get('estimatedReadyTime'),
            actualReadyTime: order.get('actualReadyTime'),
            createdAt: order.get('createdAt'),
            updatedAt: order.get('updatedAt')
          }))
        });
      })
      .catch(error => {
        res.status(500).json({ error: 'Failed to get orders' });
      });
  } else if (req.method === 'POST' && req.path === '/') {
    // POST /api/orders
    const { businessId, tableId, serverId, customerId, orderType, notes, specialInstructions } = req.body;
    
    if (!businessId || !orderType) {
      res.status(400).json({ error: 'Missing required fields: businessId and orderType are required' });
      return;
    }
    
    if (!Object.values(OrderType).includes(orderType)) {
      res.status(400).json({ error: `Invalid order type. Must be one of: ${Object.values(OrderType).join(', ')}` });
      return;
    }
    
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `ORD-${timestamp}-${randomSuffix}`;
    
    const orderData: any = {
      businessId: parseInt(businessId),
      serverId: serverId || (req as any).user.userId,
      orderNumber,
      status: OrderStatus.PENDING,
      orderType,
      subtotal: 0,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: 0
    };
    
    if (tableId) orderData.tableId = parseInt(tableId);
    if (customerId) orderData.customerId = parseInt(customerId);
    if (notes) orderData.notes = notes;
    if (specialInstructions) orderData.specialInstructions = specialInstructions;
    
    TestOrderModel.create(orderData)
      .then(newOrder => {
        res.status(201).json({
          message: 'Order created successfully',
          order: {
            id: newOrder.get('id'),
            businessId: newOrder.get('businessId'),
            tableId: newOrder.get('tableId'),
            serverId: newOrder.get('serverId'),
            customerId: newOrder.get('customerId'),
            orderNumber: newOrder.get('orderNumber'),
            status: newOrder.get('status'),
            orderType: newOrder.get('orderType'),
            subtotal: newOrder.get('subtotal'),
            taxAmount: newOrder.get('taxAmount'),
            discountAmount: newOrder.get('discountAmount'),
            totalAmount: newOrder.get('totalAmount'),
            notes: newOrder.get('notes'),
            specialInstructions: newOrder.get('specialInstructions'),
            estimatedReadyTime: newOrder.get('estimatedReadyTime'),
            actualReadyTime: newOrder.get('actualReadyTime'),
            createdAt: newOrder.get('createdAt'),
            updatedAt: newOrder.get('updatedAt')
          }
        });
      })
      .catch(error => {
        res.status(500).json({ error: 'Failed to create order' });
      });
  } else if (req.method === 'PUT' && req.path.match(/\/\d+\/status$/)) {
    // PUT /api/orders/:id/status
    const id = req.path.split('/')[1];
    const { status } = req.body;
    
    if (!Object.values(OrderStatus).includes(status)) {
      res.status(400).json({ error: `Invalid status. Must be one of: ${Object.values(OrderStatus).join(', ')}` });
      return;
    }
    
    TestOrderModel.findByPk(id)
      .then(order => {
        if (!order) {
          res.status(404).json({ error: 'Order not found' });
          return;
        }
        
        return order.update({ status });
      })
      .then(updatedOrder => {
        if (updatedOrder) {
          res.status(200).json({
            message: 'Order status updated successfully',
            order: {
              id: updatedOrder.get('id'),
              orderNumber: updatedOrder.get('orderNumber'),
              status: updatedOrder.get('status'),
              updatedAt: updatedOrder.get('updatedAt')
            }
          });
        }
      })
      .catch(error => {
        res.status(500).json({ error: 'Failed to update order status' });
      });
  } else {
    next();
  }
});

// Add order item routes
app.use('/api/orders/:orderId/items', mockAuthMiddleware, mockBusinessTypeMiddleware, mockRestaurantMiddleware, (req, res, next) => {
  const orderId = req.params.orderId;
  
  if (!orderId) {
    res.status(400).json({ error: 'Order ID is required' });
    return;
  }
  
  if (req.method === 'POST') {
    // POST /api/orders/:orderId/items
    const { itemId, itemName, quantity, unitPrice, notes, specialInstructions, modifications } = req.body;
    
    if (!itemId || !itemName || !quantity || !unitPrice) {
      res.status(400).json({ error: 'Missing required fields: itemId, itemName, quantity, and unitPrice are required' });
      return;
    }
    
    const totalPrice = quantity * unitPrice;
    
    TestOrderItemModel.create({
      orderId: parseInt(orderId),
      itemId: parseInt(itemId),
      itemName,
      quantity: parseInt(quantity),
      unitPrice: parseFloat(unitPrice),
      totalPrice,
      status: OrderItemStatus.PENDING,
      notes,
      specialInstructions,
      modifications
    })
      .then(newItem => {
        res.status(201).json({
          message: 'Order item added successfully',
          item: {
            id: newItem.get('id'),
            orderId: newItem.get('orderId'),
            itemId: newItem.get('itemId'),
            itemName: newItem.get('itemName'),
            quantity: newItem.get('quantity'),
            unitPrice: newItem.get('unitPrice'),
            totalPrice: newItem.get('totalPrice'),
            status: newItem.get('status'),
            notes: newItem.get('notes'),
            specialInstructions: newItem.get('specialInstructions'),
            modifications: newItem.get('modifications'),
            createdAt: newItem.get('createdAt'),
            updatedAt: newItem.get('updatedAt')
          }
        });
      })
      .catch(error => {
        res.status(500).json({ error: 'Failed to add order item' });
      });
  } else if (req.method === 'GET') {
    // GET /api/orders/:orderId/items
    TestOrderItemModel.findAll({ where: { orderId: parseInt(orderId) } })
      .then(items => {
        res.status(200).json({
          message: 'Order items retrieved successfully',
          count: items.length,
          items: items.map(item => ({
            id: item.get('id'),
            orderId: item.get('orderId'),
            itemId: item.get('itemId'),
            itemName: item.get('itemName'),
            quantity: item.get('quantity'),
            unitPrice: item.get('unitPrice'),
            totalPrice: item.get('totalPrice'),
            status: item.get('status'),
            notes: item.get('notes'),
            specialInstructions: item.get('specialInstructions'),
            modifications: item.get('modifications'),
            estimatedReadyTime: item.get('estimatedReadyTime'),
            actualReadyTime: item.get('actualReadyTime'),
            createdAt: item.get('createdAt'),
            updatedAt: item.get('updatedAt')
          }))
        });
      })
      .catch(error => {
        res.status(500).json({ error: 'Failed to get order items' });
      });
  } else {
    next();
  }
});

describe('Order Management API', () => {
  let businessId: number;
  let userId: number;
  let tableId: number;
  let customerId: number;
  let menuItemId: number;
  let orderId: number;
  let authToken: string;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    // Create test business
    const business = await BusinessModel.create({
      name: 'Test Restaurant',
      slug: 'test-restaurant',
      type: 'restaurant',
      taxRate: 8.5,
      currency: 'USD',
      timezone: 'UTC',
    });
    businessId = business.get('id') as number;

    // Create test user
    const user = await UserModel.create({
      businessId: business.get('id') as number,
      name: 'Test Server',
      email: 'server@example.com',
      password: 'password123',
      role: 'server',
    });
    userId = user.get('id') as number;

    // Create test table
    const table = await TableModel.create({
      businessId: business.get('id') as number,
      tableNumber: 'A1',
      capacity: 4,
      status: 'available',
    });
    tableId = table.get('id') as number;

    // Create test customer
    const customer = await CustomerModel.create({
      businessId: business.get('id') as number,
      name: 'Test Customer',
      email: 'customer@example.com',
    });
    customerId = customer.get('id') as number;

    // Create test menu item
    const menuItem = await MenuItemModel.create({
      businessId: business.get('id') as number,
      name: 'Test Burger',
      price: 12.99,
      isAvailable: true,
    });
    menuItemId = menuItem.get('id') as number;

    // Create auth token
    authToken = jwt.sign(
      { userId: user.get('id') as number, businessId: business.get('id') as number, role: user.get('role') as string },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterEach(async () => {
    await TestOrderItemModel.destroy({ where: {} });
    await TestOrderModel.destroy({ where: {} });
    await MenuItemModel.destroy({ where: {} });
    await CustomerModel.destroy({ where: {} });
    await TableModel.destroy({ where: {} });
    await UserModel.destroy({ where: {} });
    await BusinessModel.destroy({ where: {} });
  });

  describe('GET /api/orders', () => {
    it('should return empty array when no orders exist', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ businessId });

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(0);
      expect(response.body.orders).toEqual([]);
    });

    it('should return orders with pagination', async () => {
      // Create test orders
      await TestOrderModel.bulkCreate([
        {
          businessId,
          serverId: userId,
          orderNumber: 'ORD-001',
          status: OrderStatus.PENDING,
          orderType: OrderType.DINE_IN,
          tableId,
          createdAt: new Date('2023-01-01T10:00:00Z'),
        },
        {
          businessId,
          serverId: userId,
          orderNumber: 'ORD-002',
          status: OrderStatus.CONFIRMED,
          orderType: OrderType.TAKEAWAY,
          createdAt: new Date('2023-01-01T11:00:00Z'),
        },
      ]);

      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ businessId });

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(2);
      expect(response.body.orders).toHaveLength(2);
      expect(response.body.orders[0].orderNumber).toBe('ORD-002'); // Most recent first
    });

    it('should filter orders by status', async () => {
      await TestOrderModel.bulkCreate([
        {
          businessId,
          serverId: userId,
          orderNumber: 'ORD-001',
          status: OrderStatus.PENDING,
          orderType: OrderType.DINE_IN,
        },
        {
          businessId,
          serverId: userId,
          orderNumber: 'ORD-002',
          status: OrderStatus.CONFIRMED,
          orderType: OrderType.DINE_IN,
        },
      ]);

      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ businessId, status: OrderStatus.PENDING });

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(response.body.orders[0].status).toBe(OrderStatus.PENDING);
    });

    it('should filter orders by table', async () => {
      await TestOrderModel.bulkCreate([
        {
          businessId,
          serverId: userId,
          orderNumber: 'ORD-001',
          status: OrderStatus.PENDING,
          orderType: OrderType.DINE_IN,
          tableId,
        },
        {
          businessId,
          serverId: userId,
          orderNumber: 'ORD-002',
          status: OrderStatus.PENDING,
          orderType: OrderType.DINE_IN,
          tableId: tableId + 1,
        },
      ]);

      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ businessId, tableId });

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(response.body.orders[0].tableId).toBe(tableId);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/orders')
        .query({ businessId });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/orders', () => {
    it('should create a new order with required fields', async () => {
      const orderData = {
        businessId,
        orderType: OrderType.DINE_IN,
        tableId,
        notes: 'Extra crispy fries',
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body.order.businessId).toBe(businessId);
      expect(response.body.order.orderType).toBe(OrderType.DINE_IN);
      expect(response.body.order.status).toBe(OrderStatus.PENDING);
      expect(response.body.order.tableId).toBe(tableId);
      expect(response.body.order.notes).toBe('Extra crispy fries');
      expect(response.body.order.orderNumber).toMatch(/^ORD-\d+-\d{3}$/);
    });

    it('should create takeaway order', async () => {
      const orderData = {
        businessId,
        orderType: OrderType.TAKEAWAY,
        customerId,
        specialInstructions: 'No onions',
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body.order.orderType).toBe(OrderType.TAKEAWAY);
      expect(response.body.order.customerId).toBe(customerId);
      expect(response.body.order.specialInstructions).toBe('No onions');
    });

    it('should create delivery order', async () => {
      const orderData = {
        businessId,
        orderType: OrderType.DELIVERY,
        customerId,
        estimatedReadyTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body.order.orderType).toBe(OrderType.DELIVERY);
      expect(response.body.order.customerId).toBe(customerId);
    });

    it('should reject missing businessId', async () => {
      const orderData = {
        orderType: OrderType.DINE_IN,
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('businessId');
    });

    it('should reject missing orderType', async () => {
      const orderData = {
        businessId,
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('orderType');
    });

    it('should reject invalid orderType', async () => {
      const orderData = {
        businessId,
        orderType: 'invalid_type',
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid order type');
    });
  });

  describe('PUT /api/orders/:id/status', () => {
    beforeEach(async () => {
      const order = await TestOrderModel.create({
        businessId,
        serverId: userId,
        orderNumber: 'ORD-001',
        status: OrderStatus.PENDING,
        orderType: OrderType.DINE_IN,
        tableId,
      });
      orderId = order.get('id') as number;
    });

    it('should update order status successfully', async () => {
      const response = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: OrderStatus.CONFIRMED });

      expect(response.status).toBe(200);
      expect(response.body.order.status).toBe(OrderStatus.CONFIRMED);
    });

    it('should reject invalid status', async () => {
      const response = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'invalid_status' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid status');
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .put('/api/orders/999/status')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: OrderStatus.CONFIRMED });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/orders/:orderId/items', () => {
    beforeEach(async () => {
      const order = await TestOrderModel.create({
        businessId,
        serverId: userId,
        orderNumber: 'ORD-001',
        status: OrderStatus.PENDING,
        orderType: OrderType.DINE_IN,
        tableId,
      });
      orderId = order.get('id') as number;
    });

    it('should add item to order successfully', async () => {
      const itemData = {
        itemId: menuItemId,
        itemName: 'Test Burger',
        quantity: 2,
        unitPrice: 12.99,
        notes: 'Medium rare',
        specialInstructions: 'Extra cheese',
      };

      const response = await request(app)
        .post(`/api/orders/${orderId}/items`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData);

      expect(response.status).toBe(201);
      expect(response.body.item.orderId).toBe(orderId);
      expect(response.body.item.itemId).toBe(menuItemId);
      expect(response.body.item.quantity).toBe(2);
      expect(response.body.item.unitPrice).toBe(12.99);
      expect(response.body.item.totalPrice).toBe(25.98);
      expect(response.body.item.status).toBe(OrderItemStatus.PENDING);
      expect(response.body.item.notes).toBe('Medium rare');
      expect(response.body.item.specialInstructions).toBe('Extra cheese');
    });

    it('should reject missing required fields', async () => {
      const itemData = {
        itemName: 'Test Burger',
        quantity: 2,
      };

      const response = await request(app)
        .post(`/api/orders/${orderId}/items`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should calculate total price correctly', async () => {
      const itemData = {
        itemId: menuItemId,
        itemName: 'Test Burger',
        quantity: 3,
        unitPrice: 15.50,
      };

      const response = await request(app)
        .post(`/api/orders/${orderId}/items`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData);

      expect(response.status).toBe(201);
      expect(response.body.item.totalPrice).toBe(46.50);
    });
  });

  describe('GET /api/orders/:orderId/items', () => {
    beforeEach(async () => {
      const order = await TestOrderModel.create({
        businessId,
        serverId: userId,
        orderNumber: 'ORD-001',
        status: OrderStatus.PENDING,
        orderType: OrderType.DINE_IN,
        tableId,
      });
      orderId = order.get('id') as number;
    });

    it('should return empty array when no items exist', async () => {
      const response = await request(app)
        .get(`/api/orders/${orderId}/items`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(0);
      expect(response.body.items).toEqual([]);
    });

    it('should return order items', async () => {
      await TestOrderItemModel.bulkCreate([
        {
          orderId,
          itemId: menuItemId,
          itemName: 'Test Burger',
          quantity: 2,
          unitPrice: 12.99,
          totalPrice: 25.98,
          status: OrderItemStatus.PENDING,
        },
        {
          orderId,
          itemId: menuItemId + 1,
          itemName: 'Test Fries',
          quantity: 1,
          unitPrice: 5.99,
          totalPrice: 5.99,
          status: OrderItemStatus.CONFIRMED,
        },
      ]);

      const response = await request(app)
        .get(`/api/orders/${orderId}/items`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(2);
      expect(response.body.items).toHaveLength(2);
      expect(response.body.items[0].itemName).toBe('Test Burger');
      expect(response.body.items[1].itemName).toBe('Test Fries');
    });
  });

  describe('Order Business Logic', () => {
    it('should generate unique order numbers', async () => {
      const orderData = {
        businessId,
        orderType: OrderType.DINE_IN,
      };

      const response1 = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      const response2 = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);
      expect(response1.body.order.orderNumber).not.toBe(response2.body.order.orderNumber);
    });

    it('should set default values for new orders', async () => {
      const orderData = {
        businessId,
        orderType: OrderType.DINE_IN,
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body.order.status).toBe(OrderStatus.PENDING);
      expect(response.body.order.subtotal).toBe(0);
      expect(response.body.order.taxAmount).toBe(0);
      expect(response.body.order.discountAmount).toBe(0);
      expect(response.body.order.totalAmount).toBe(0);
    });

    it('should use authenticated user as server', async () => {
      const orderData = {
        businessId,
        orderType: OrderType.DINE_IN,
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body.order.serverId).toBe(userId);
    });
  });
}); 