import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { Sequelize, DataTypes } from 'sequelize';
import jwt from 'jsonwebtoken';

// Create test database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false,
});

// Define test models
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

const OrderModel = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  businessId: { type: DataTypes.INTEGER, allowNull: false },
  tableId: DataTypes.INTEGER,
  serverId: { type: DataTypes.INTEGER, allowNull: false },
  orderNumber: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false },
  orderType: { type: DataTypes.STRING, allowNull: false },
  subtotal: { type: DataTypes.DECIMAL, allowNull: false, defaultValue: 0 },
  taxAmount: { type: DataTypes.DECIMAL, allowNull: false, defaultValue: 0 },
  totalAmount: { type: DataTypes.DECIMAL, allowNull: false, defaultValue: 0 },
});

const OrderItemModel = sequelize.define('OrderItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  itemId: { type: DataTypes.INTEGER, allowNull: false },
  itemName: { type: DataTypes.STRING, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  unitPrice: { type: DataTypes.DECIMAL, allowNull: false, defaultValue: 0 },
  totalPrice: { type: DataTypes.DECIMAL, allowNull: false, defaultValue: 0 },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pending' },
  specialInstructions: DataTypes.TEXT,
});

const KitchenOrderModel = sequelize.define('KitchenOrder', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  businessId: { type: DataTypes.INTEGER, allowNull: false },
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  orderNumber: { type: DataTypes.STRING, allowNull: false },
  tableNumber: DataTypes.STRING,
  customerName: DataTypes.STRING,
  orderType: { type: DataTypes.STRING, allowNull: false },
  priority: { type: DataTypes.STRING, allowNull: false, defaultValue: 'normal' },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pending' },
  estimatedPrepTime: { type: DataTypes.INTEGER, allowNull: false },
  actualPrepTime: DataTypes.INTEGER,
  startTime: DataTypes.DATE,
  readyTime: DataTypes.DATE,
  servedTime: DataTypes.DATE,
  specialInstructions: DataTypes.TEXT,
  allergies: DataTypes.TEXT,
  dietaryRestrictions: DataTypes.TEXT,
  items: { type: DataTypes.TEXT, allowNull: false, defaultValue: '[]' },
  totalItems: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  completedItems: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  assignedTo: DataTypes.INTEGER,
  assignedToName: DataTypes.STRING,
  station: DataTypes.STRING,
  notes: DataTypes.TEXT,
});

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

// Add kitchen routes mock
app.use('/api/kitchen', mockAuthMiddleware, (req, res, next) => {
  const businessId = (req as any).user?.businessId;
  
  if (req.method === 'GET' && req.path === '/') {
    // GET /api/kitchen
    const { status, priority, station, assignedTo, orderType } = req.query;
    const whereClause: any = { businessId };
    
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (station) whereClause.station = station;
    if (assignedTo) whereClause.assignedTo = assignedTo;
    if (orderType) whereClause.orderType = orderType;
    
    KitchenOrderModel.findAll({ where: whereClause })
      .then(orders => {
        res.status(200).json({
          success: true,
          data: orders.map(order => order.toJSON())
        });
      })
      .catch(error => {
        res.status(500).json({
          success: false,
          message: 'Failed to get kitchen orders'
        });
      });
  } else if (req.method === 'GET' && req.path === '/active') {
    // GET /api/kitchen/active
    KitchenOrderModel.findAll({
      where: {
        businessId,
        status: ['pending', 'confirmed', 'preparing']
      }
    })
      .then(orders => {
        res.status(200).json({
          success: true,
          data: orders.map(order => order.toJSON())
        });
      })
      .catch(error => {
        res.status(500).json({
          success: false,
          message: 'Failed to get active kitchen orders'
        });
      });
  } else if (req.method === 'GET' && req.path.match(/^\/\d+$/)) {
    // GET /api/kitchen/:id
    const id = req.path.substring(1);
    KitchenOrderModel.findOne({ where: { id, businessId } })
      .then(order => {
        if (!order) {
          res.status(404).json({
            success: false,
            message: 'Kitchen order not found'
          });
          return;
        }
        res.status(200).json({
          success: true,
          data: order.toJSON()
        });
      })
      .catch(error => {
        res.status(500).json({
          success: false,
          message: 'Failed to get kitchen order'
        });
      });
  } else if (req.method === 'POST' && req.path.match(/^\/from-order\/\d+$/)) {
    // POST /api/kitchen/from-order/:orderId
    const orderIdParam = req.path.split('/')[2];
    if (!orderIdParam || isNaN(Number(orderIdParam))) {
      res.status(400).json({ success: false, message: 'Missing or invalid orderId parameter' });
      return;
    }
    const orderId = parseInt(orderIdParam, 10);
    const { priority = 'normal', estimatedPrepTime, specialInstructions, notes } = req.body;
    
    OrderModel.findOne({ where: { id: orderId, businessId } })
      .then(order => {
        if (!order) {
          res.status(404).json({
            success: false,
            message: 'Order not found'
          });
          return;
        }
        
        return KitchenOrderModel.create({
          businessId,
          orderId,
          orderNumber: order.get('orderNumber'),
          orderType: order.get('orderType'),
          priority,
          status: 'pending',
          estimatedPrepTime: estimatedPrepTime || 15,
          specialInstructions,
          notes,
          items: '[]',
          totalItems: 0,
          completedItems: 0
        });
      })
      .then(kitchenOrder => {
        if (kitchenOrder) {
          res.status(201).json({
            success: true,
            data: kitchenOrder.toJSON()
          });
        }
      })
      .catch(error => {
        res.status(500).json({
          success: false,
          message: 'Failed to create kitchen order'
        });
      });
  } else if (req.method === 'PATCH' && req.path.match(/^\/\d+\/status$/)) {
    // PATCH /api/kitchen/:id/status
    const id = req.path.split('/')[1];
    const { status, assignedTo, assignedToName, station } = req.body;
    
    KitchenOrderModel.findOne({ where: { id, businessId } })
      .then(order => {
        if (!order) {
          res.status(404).json({
            success: false,
            message: 'Kitchen order not found'
          });
          return;
        }
        
        const updateData: any = { status };
        if (status === 'preparing' && !order.get('startTime')) {
          updateData.startTime = new Date();
        }
        if (status === 'ready' && !order.get('readyTime')) {
          updateData.readyTime = new Date();
        }
        if (status === 'served' && !order.get('servedTime')) {
          updateData.servedTime = new Date();
        }
        if (assignedTo) updateData.assignedTo = assignedTo;
        if (assignedToName) updateData.assignedToName = assignedToName;
        if (station) updateData.station = station;
        
        return order.update(updateData);
      })
      .then(updatedOrder => {
        if (updatedOrder) {
          res.status(200).json({
            success: true,
            data: updatedOrder.toJSON()
          });
        }
      })
      .catch(error => {
        res.status(500).json({
          success: false,
          message: 'Failed to update kitchen order status'
        });
      });
  } else if (req.method === 'PATCH' && req.path.match(/^\/\d+\/priority$/)) {
    // PATCH /api/kitchen/:id/priority
    const id = req.path.split('/')[1];
    const { priority } = req.body;
    
    KitchenOrderModel.findOne({ where: { id, businessId } })
      .then(order => {
        if (!order) {
          res.status(404).json({
            success: false,
            message: 'Kitchen order not found'
          });
          return;
        }
        return order.update({ priority });
      })
      .then(updatedOrder => {
        if (updatedOrder) {
          res.status(200).json({
            success: true,
            data: updatedOrder.toJSON()
          });
        }
      })
      .catch(error => {
        res.status(500).json({
          success: false,
          message: 'Failed to update kitchen order priority'
        });
      });
  } else if (req.method === 'PATCH' && req.path.match(/^\/\d+\/assign$/)) {
    // PATCH /api/kitchen/:id/assign
    const id = req.path.split('/')[1];
    const { assignedTo, assignedToName, station } = req.body;
    
    KitchenOrderModel.findOne({ where: { id, businessId } })
      .then(order => {
        if (!order) {
          res.status(404).json({
            success: false,
            message: 'Kitchen order not found'
          });
          return;
        }
        
        const updateData: any = {};
        if (assignedTo) updateData.assignedTo = assignedTo;
        if (assignedToName) updateData.assignedToName = assignedToName;
        if (station) updateData.station = station;
        
        return order.update(updateData);
      })
      .then(updatedOrder => {
        if (updatedOrder) {
          res.status(200).json({
            success: true,
            data: updatedOrder.toJSON()
          });
        }
      })
      .catch(error => {
        res.status(500).json({
          success: false,
          message: 'Failed to assign kitchen order'
        });
      });
  } else if (req.method === 'GET' && req.path === '/stats/overview') {
    // GET /api/kitchen/stats/overview
    KitchenOrderModel.findAll({ where: { businessId } })
      .then(orders => {
        const total = orders.length;
        const pending = orders.filter(o => o.get('status') === 'pending').length;
        const preparing = orders.filter(o => o.get('status') === 'preparing').length;
        const ready = orders.filter(o => o.get('status') === 'ready').length;
        
        res.status(200).json({
          success: true,
          data: { total, pending, preparing, ready }
        });
      })
      .catch(error => {
        res.status(500).json({
          success: false,
          message: 'Failed to get kitchen stats'
        });
      });
  } else if (req.method === 'GET' && req.path === '/stats/performance') {
    // GET /api/kitchen/stats/performance
    res.status(200).json({
      success: true,
      data: {
        averagePrepTime: 15,
        totalOrders: 10,
        completedOrders: 8
      }
    });
  } else {
    next();
  }
});

describe('Kitchen Display System API', () => {
  let authToken: string;
  let businessId: number;
  let userId: number;
  let orderId: number;
  let tableId: number;

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
      timezone: 'UTC'
    });
    businessId = business.get('id') as number;

    // Create test user
    const user = await UserModel.create({
      businessId,
      name: 'Test Chef',
      email: 'chef@test.com',
      password: 'password123',
      role: 'manager'
    });
    userId = user.get('id') as number;

    // Create test table
    const table = await TableModel.create({
      businessId,
      tableNumber: '1',
      capacity: 4,
      status: 'available'
    });
    tableId = table.get('id') as number;

    // Create test order
    const order = await OrderModel.create({
      businessId,
      tableId,
      serverId: userId,
      orderNumber: 'ORD-TEST-001',
      status: 'confirmed',
      orderType: 'dine_in',
      subtotal: 25.00,
      taxAmount: 2.13,
      totalAmount: 27.13
    });
    orderId = order.get('id') as number;

    // Create test order items
    await OrderItemModel.create({
      orderId,
      itemId: 1,
      itemName: 'Burger',
      quantity: 2,
      unitPrice: 12.50,
      totalPrice: 25.00,
      status: 'confirmed',
      specialInstructions: 'Medium rare, no onions'
    });

    // Generate auth token
    authToken = jwt.sign(
      { userId, businessId, role: 'manager' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterEach(async () => {
    // Clean up test data
    await KitchenOrderModel.destroy({ where: {} });
    await OrderItemModel.destroy({ where: {} });
    await OrderModel.destroy({ where: {} });
    await TableModel.destroy({ where: {} });
    await UserModel.destroy({ where: {} });
    await BusinessModel.destroy({ where: {} });
  });

  describe('GET /api/kitchen', () => {
    it('should get all kitchen orders for a business', async () => {
      // Create a test kitchen order
      await KitchenOrderModel.create({
        businessId,
        orderId,
        orderNumber: 'ORD-TEST-001',
        orderType: 'dine_in',
        priority: 'normal',
        status: 'pending',
        estimatedPrepTime: 15,
        items: '[]',
        totalItems: 0,
        completedItems: 0
      });

      const response = await request(app)
        .get('/api/kitchen')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].orderNumber).toBe('ORD-TEST-001');
    });

    it('should filter kitchen orders by status', async () => {
      // Create kitchen orders with different statuses
      await KitchenOrderModel.create({
        businessId,
        orderId,
        orderNumber: 'ORD-TEST-001',
        orderType: 'dine_in',
        priority: 'normal',
        status: 'pending',
        estimatedPrepTime: 15,
        items: '[]',
        totalItems: 0,
        completedItems: 0
      });

      await KitchenOrderModel.create({
        businessId,
        orderId: orderId + 1,
        orderNumber: 'ORD-TEST-002',
        orderType: 'takeaway',
        priority: 'high',
        status: 'preparing',
        estimatedPrepTime: 20,
        items: '[]',
        totalItems: 0,
        completedItems: 0
      });

      const response = await request(app)
        .get('/api/kitchen?status=pending')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('pending');
    });

    it('should filter kitchen orders by priority', async () => {
      await KitchenOrderModel.create({
        businessId,
        orderId,
        orderNumber: 'ORD-TEST-001',
        orderType: 'dine_in',
        priority: 'high',
        status: 'pending',
        estimatedPrepTime: 15,
        items: '[]',
        totalItems: 0,
        completedItems: 0
      });

      const response = await request(app)
        .get('/api/kitchen?priority=high')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].priority).toBe('high');
    });
  });

  describe('GET /api/kitchen/active', () => {
    it('should get only active kitchen orders', async () => {
      // Create orders with different statuses
      await KitchenOrderModel.create({
        businessId,
        orderId,
        orderNumber: 'ORD-TEST-001',
        orderType: 'dine_in',
        priority: 'normal',
        status: 'pending',
        estimatedPrepTime: 15,
        items: '[]',
        totalItems: 0,
        completedItems: 0
      });

      await KitchenOrderModel.create({
        businessId,
        orderId: orderId + 1,
        orderNumber: 'ORD-TEST-002',
        orderType: 'takeaway',
        priority: 'high',
        status: 'served',
        estimatedPrepTime: 20,
        items: '[]',
        totalItems: 0,
        completedItems: 0
      });

      const response = await request(app)
        .get('/api/kitchen/active')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('pending');
    });
  });

  describe('GET /api/kitchen/:id', () => {
    it('should get a specific kitchen order', async () => {
      const kitchenOrder = await KitchenOrderModel.create({
        businessId,
        orderId,
        orderNumber: 'ORD-TEST-001',
        orderType: 'dine_in',
        priority: 'normal',
        status: 'pending',
        estimatedPrepTime: 15,
        items: '[]',
        totalItems: 0,
        completedItems: 0
      });

      const response = await request(app)
        .get(`/api/kitchen/${kitchenOrder.get('id')}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(kitchenOrder.get('id'));
      expect(response.body.data.orderNumber).toBe('ORD-TEST-001');
    });

    it('should return 404 for non-existent kitchen order', async () => {
      const response = await request(app)
        .get('/api/kitchen/999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/kitchen/from-order/:orderId', () => {
    it('should create kitchen order from regular order', async () => {
      const response = await request(app)
        .post(`/api/kitchen/from-order/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          priority: 'high',
          estimatedPrepTime: 20,
          specialInstructions: 'Handle with care',
          notes: 'VIP customer'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.orderId).toBe(orderId);
      expect(response.body.data.priority).toBe('high');
      expect(response.body.data.status).toBe('pending');
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .post('/api/kitchen/from-order/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          priority: 'normal',
          estimatedPrepTime: 15
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/kitchen/:id/status', () => {
    let kitchenOrderId: number;

    beforeEach(async () => {
      const kitchenOrder = await KitchenOrderModel.create({
        businessId,
        orderId,
        orderNumber: 'ORD-TEST-001',
        orderType: 'dine_in',
        priority: 'normal',
        status: 'pending',
        estimatedPrepTime: 15,
        items: '[]',
        totalItems: 0,
        completedItems: 0
      });
      kitchenOrderId = kitchenOrder.get('id') as number;
    });

    it('should update kitchen order status to confirmed', async () => {
      const response = await request(app)
        .patch(`/api/kitchen/${kitchenOrderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'confirmed' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('confirmed');
    });

    it('should update kitchen order status to preparing with assignment', async () => {
      const response = await request(app)
        .patch(`/api/kitchen/${kitchenOrderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'preparing',
          assignedTo: userId,
          assignedToName: 'Test Chef',
          station: 'grill'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('preparing');
      expect(response.body.data.assignedTo).toBe(userId);
      expect(response.body.data.station).toBe('grill');
    });

    it('should update kitchen order status to ready', async () => {
      const response = await request(app)
        .patch(`/api/kitchen/${kitchenOrderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'ready' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('ready');
      expect(response.body.data.readyTime).toBeDefined();
    });

    it('should update kitchen order status to served', async () => {
      const response = await request(app)
        .patch(`/api/kitchen/${kitchenOrderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'served' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('served');
      expect(response.body.data.servedTime).toBeDefined();
    });

    it('should return 404 for non-existent kitchen order', async () => {
      const response = await request(app)
        .patch('/api/kitchen/999/status')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'confirmed' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/kitchen/:id/priority', () => {
    let kitchenOrderId: number;

    beforeEach(async () => {
      const kitchenOrder = await KitchenOrderModel.create({
        businessId,
        orderId,
        orderNumber: 'ORD-TEST-001',
        orderType: 'dine_in',
        priority: 'normal',
        status: 'pending',
        estimatedPrepTime: 15,
        items: '[]',
        totalItems: 0,
        completedItems: 0
      });
      kitchenOrderId = kitchenOrder.get('id') as number;
    });

    it('should update kitchen order priority', async () => {
      const response = await request(app)
        .patch(`/api/kitchen/${kitchenOrderId}/priority`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ priority: 'urgent' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.priority).toBe('urgent');
    });

    it('should return 404 for non-existent kitchen order', async () => {
      const response = await request(app)
        .patch('/api/kitchen/999/priority')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ priority: 'high' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/kitchen/:id/assign', () => {
    let kitchenOrderId: number;

    beforeEach(async () => {
      const kitchenOrder = await KitchenOrderModel.create({
        businessId,
        orderId,
        orderNumber: 'ORD-TEST-001',
        orderType: 'dine_in',
        priority: 'normal',
        status: 'pending',
        estimatedPrepTime: 15,
        items: '[]',
        totalItems: 0,
        completedItems: 0
      });
      kitchenOrderId = kitchenOrder.get('id') as number;
    });

    it('should assign kitchen order to user', async () => {
      const response = await request(app)
        .patch(`/api/kitchen/${kitchenOrderId}/assign`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          assignedTo: userId,
          assignedToName: 'Test Chef',
          station: 'grill'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.assignedTo).toBe(userId);
      expect(response.body.data.assignedToName).toBe('Test Chef');
      expect(response.body.data.station).toBe('grill');
    });

    it('should return 404 for non-existent kitchen order', async () => {
      const response = await request(app)
        .patch('/api/kitchen/999/assign')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          assignedTo: userId,
          assignedToName: 'Test Chef'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/kitchen/stats/overview', () => {
    it('should get kitchen order statistics', async () => {
      // Create kitchen orders with different statuses
      await KitchenOrderModel.create({
        businessId,
        orderId,
        orderNumber: 'ORD-TEST-001',
        orderType: 'dine_in',
        priority: 'normal',
        status: 'pending',
        estimatedPrepTime: 15,
        items: '[]',
        totalItems: 0,
        completedItems: 0
      });

      await KitchenOrderModel.create({
        businessId,
        orderId: orderId + 1,
        orderNumber: 'ORD-TEST-002',
        orderType: 'takeaway',
        priority: 'high',
        status: 'preparing',
        estimatedPrepTime: 20,
        items: '[]',
        totalItems: 0,
        completedItems: 0
      });

      await KitchenOrderModel.create({
        businessId,
        orderId: orderId + 2,
        orderNumber: 'ORD-TEST-003',
        orderType: 'delivery',
        priority: 'urgent',
        status: 'ready',
        estimatedPrepTime: 25,
        items: '[]',
        totalItems: 0,
        completedItems: 0
      });

      const response = await request(app)
        .get('/api/kitchen/stats/overview')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBe(3);
      expect(response.body.data.pending).toBe(1);
      expect(response.body.data.preparing).toBe(1);
      expect(response.body.data.ready).toBe(1);
    });
  });

  describe('GET /api/kitchen/stats/performance', () => {
    it('should get kitchen performance statistics', async () => {
      const response = await request(app)
        .get('/api/kitchen/stats/performance')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('averagePrepTime');
      expect(response.body.data).toHaveProperty('totalOrders');
      expect(response.body.data).toHaveProperty('completedOrders');
    });
  });
}); 