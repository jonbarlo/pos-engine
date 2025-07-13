import request from 'supertest';
import app from '../index';
import { KitchenOrderModel } from '../models/KitchenOrderModel';
import { OrderModel, OrderType, OrderStatus } from '../models/OrderModel';
import { UserModel, UserRole } from '../models/UserModel';
import { BusinessModel } from '../models/BusinessModel';
import { ItemModel } from '../models/ItemModel';
import { UserService } from '../services/userService';

describe('KitchenOrderController', () => {
  let testBusiness: any;
  let testUser: any;
  let testOrder: any;
  let testKitchenOrder: any;
  let authToken: string;

  beforeAll(async () => {
    // Create test business
    testBusiness = await BusinessModel.create({
      name: 'Test Restaurant',
      type: 'restaurant',
      address: '123 Test St',
      phone: '555-1234',
      email: 'test@restaurant.com',
      slug: 'test-restaurant',
      taxRate: 0.10,
      currency: 'USD',
      timezone: 'UTC'
    });

    // Create test user using UserService to ensure password is hashed
    testUser = await UserService.createUser({
      name: 'Test Chef',
      email: 'chef@test.com',
      password: 'password123',
      role: UserRole.MANAGER,
      businessId: testBusiness.id,
      assignment: 'kitchen'
    });
    console.log('DEBUG testUser:', testUser?.toJSON ? testUser.toJSON() : testUser);

    // Create test order
    testOrder = await OrderModel.create({
      businessId: testBusiness.id,
      serverId: testUser.id,
      orderNumber: 'ORD-TEST-001',
      orderType: OrderType.DINE_IN,
      status: OrderStatus.CONFIRMED,
      subtotal: 12.99,
      taxAmount: 1.30,
      totalAmount: 14.29,
      notes: 'Test order'
    });
    console.log('DEBUG testOrder:', testOrder?.toJSON ? testOrder.toJSON() : testOrder);

    // Create test kitchen order
    testKitchenOrder = await KitchenOrderModel.create({
      businessId: testBusiness.id,
      orderId: testOrder.id,
      orderNumber: testOrder.orderNumber,
      customerName: 'Test Customer',
      orderType: 'dine_in',
      priority: 'normal',
      status: 'pending',
      estimatedPrepTime: 15,
      items: [
        {
          id: 1,
          itemName: 'Test Burger',
          quantity: 1,
          status: 'pending',
          preparationTime: 10,
          specialInstructions: 'No onions'
        }
      ],
      totalItems: 1,
      completedItems: 0
    });

    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'chef@test.com',
        password: 'password123',
        businessId: testBusiness.id
      });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    // Clean up test data
    await KitchenOrderModel.destroy({ where: { businessId: testBusiness.id } });
    await OrderModel.destroy({ where: { businessId: testBusiness.id } });
    await ItemModel.destroy({ where: { businessId: testBusiness.id } });
    await UserModel.destroy({ where: { businessId: testBusiness.id } });
    await BusinessModel.destroy({ where: { id: testBusiness.id } });
  });

  describe('GET /api/kitchen/orders', () => {
    it('should get all kitchen orders for the business', async () => {
      const response = await request(app)
        .get('/api/kitchen/orders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter orders by status', async () => {
      const response = await request(app)
        .get('/api/kitchen/orders?status=pending')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.every((order: any) => order.status === 'pending')).toBe(true);
    });

    it('should filter orders by priority', async () => {
      const response = await request(app)
        .get('/api/kitchen/orders?priority=normal')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.every((order: any) => order.priority === 'normal')).toBe(true);
    });
  });

  describe('GET /api/kitchen/orders/:id', () => {
    it('should get a specific kitchen order by ID', async () => {
      const response = await request(app)
        .get(`/api/kitchen/orders/${testKitchenOrder.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testKitchenOrder.id);
      expect(response.body.data.orderNumber).toBe(testOrder.orderNumber);
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/api/kitchen/orders/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/kitchen/orders/:id', () => {
    it('should update kitchen order status', async () => {
      const updateData = {
        status: 'confirmed',
        notes: 'Order confirmed by kitchen'
      };

      const response = await request(app)
        .put(`/api/kitchen/orders/${testKitchenOrder.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('confirmed');
      expect(response.body.data.notes).toBe('Order confirmed by kitchen');
    });

    it('should return 400 for empty update data', async () => {
      const response = await request(app)
        .put(`/api/kitchen/orders/${testKitchenOrder.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/kitchen/orders/:id/start-preparing', () => {
    it('should start preparing a kitchen order', async () => {
      const response = await request(app)
        .put(`/api/kitchen/orders/${testKitchenOrder.id}/start-preparing`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ assignedTo: testUser.id });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('preparing');
      expect(response.body.data.assignedTo).toBe(testUser.id);
      expect(response.body.data.startTime).toBeDefined();
    });

    it('should start preparing without assignment', async () => {
      // Reset order to pending first
      await testKitchenOrder.update({ status: 'pending' });

      const response = await request(app)
        .put(`/api/kitchen/orders/${testKitchenOrder.id}/start-preparing`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('preparing');
      expect(response.body.data.startTime).toBeDefined();
    });
  });

  describe('PUT /api/kitchen/orders/:id/ready', () => {
    it('should mark kitchen order as ready', async () => {
      // First start preparing
      await testKitchenOrder.update({ 
        status: 'preparing', 
        startTime: new Date() 
      });

      const response = await request(app)
        .put(`/api/kitchen/orders/${testKitchenOrder.id}/ready`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('ready');
      expect(response.body.data.readyTime).toBeDefined();
      expect(response.body.data.actualPrepTime).toBeDefined();
    });
  });

  describe('PUT /api/kitchen/orders/:id/served', () => {
    it('should mark kitchen order as served', async () => {
      // First mark as ready
      await testKitchenOrder.update({ 
        status: 'ready', 
        readyTime: new Date() 
      });

      const response = await request(app)
        .put(`/api/kitchen/orders/${testKitchenOrder.id}/served`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('served');
      expect(response.body.data.servedTime).toBeDefined();
    });
  });

  describe('PUT /api/kitchen/orders/:orderId/items/:itemId/status', () => {
    it('should update individual item status', async () => {
      // Reset order to pending
      await testKitchenOrder.update({ status: 'pending' });

      const response = await request(app)
        .put(`/api/kitchen/orders/${testKitchenOrder.id}/items/1/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'preparing' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items[0].status).toBe('preparing');
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .put(`/api/kitchen/orders/${testKitchenOrder.id}/items/1/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'invalid_status' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/kitchen/orders/:id/assign', () => {
    it('should assign kitchen order to a chef', async () => {
      const response = await request(app)
        .put(`/api/kitchen/orders/${testKitchenOrder.id}/assign`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ assignedTo: testUser.id });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.assignedTo).toBe(testUser.id);
      expect(response.body.data.assignedToName).toBe(testUser.name);
    });

    it('should return 400 for missing assignedTo', async () => {
      const response = await request(app)
        .put(`/api/kitchen/orders/${testKitchenOrder.id}/assign`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/kitchen/stats', () => {
    it('should get kitchen statistics', async () => {
      const response = await request(app)
        .get('/api/kitchen/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalOrders');
      expect(response.body.data).toHaveProperty('pendingOrders');
      expect(response.body.data).toHaveProperty('preparingOrders');
      expect(response.body.data).toHaveProperty('readyOrders');
      expect(response.body.data).toHaveProperty('averagePrepTime');
    });
  });

  describe('Authentication', () => {
    it('should require authentication for all endpoints', async () => {
      const endpoints = [
        { method: 'get', path: '/api/kitchen/orders' },
        { method: 'get', path: `/api/kitchen/orders/${testKitchenOrder.id}` },
        { method: 'put', path: `/api/kitchen/orders/${testKitchenOrder.id}` },
        { method: 'put', path: `/api/kitchen/orders/${testKitchenOrder.id}/start-preparing` },
        { method: 'put', path: `/api/kitchen/orders/${testKitchenOrder.id}/ready` },
        { method: 'put', path: `/api/kitchen/orders/${testKitchenOrder.id}/served` },
        { method: 'put', path: `/api/kitchen/orders/${testKitchenOrder.id}/assign` },
        { method: 'get', path: '/api/kitchen/stats' }
      ];

      for (const endpoint of endpoints) {
        let response;
        if (endpoint.method === 'get') {
          response = await request(app).get(endpoint.path);
        } else if (endpoint.method === 'put') {
          response = await request(app).put(endpoint.path);
        }
        expect(response!.status).toBe(401);
        expect(response!.body.success).toBe(false);
      }
    });
  });
}); 