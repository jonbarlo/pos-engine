import { KitchenOrderService } from './kitchenOrderService';
import { KitchenOrderModel } from '../models/KitchenOrderModel';
import { OrderModel, OrderType, OrderStatus } from '../models/OrderModel';
import { UserModel, UserRole } from '../models/UserModel';
import { BusinessModel } from '../models/BusinessModel';
import { ItemModel } from '../models/ItemModel';

describe('KitchenOrderService', () => {
  let testBusiness: any;
  let testUser: any;
  let testOrder: any;
  let testKitchenOrder: any;

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

    // Create test user
    testUser = await UserModel.create({
      name: 'Test Chef',
      email: 'chef@test.com',
      password: 'password123',
      role: UserRole.MANAGER,
      businessId: testBusiness.id,
      assignment: 'kitchen'
    });

    // Create test item
    const testItem = await ItemModel.create({
      name: 'Test Burger',
      description: 'A delicious test burger',
      price: 12.99,
      category: 'Main Course',
      businessId: testBusiness.id,
      stock: 100,
      cost: 8.00,
      unit: 'piece',
      minStock: 10,
      maxStock: 200
    });

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
  });

  afterAll(async () => {
    // Clean up test data
    await KitchenOrderModel.destroy({ where: { businessId: testBusiness.id } });
    await OrderModel.destroy({ where: { businessId: testBusiness.id } });
    await ItemModel.destroy({ where: { businessId: testBusiness.id } });
    await UserModel.destroy({ where: { businessId: testBusiness.id } });
    await BusinessModel.destroy({ where: { id: testBusiness.id } });
  });

  describe('getKitchenOrders', () => {
    it('should get all kitchen orders for a business', async () => {
      const orders = await KitchenOrderService.getKitchenOrders({
        businessId: testBusiness.id
      });

      expect(Array.isArray(orders)).toBe(true);
      expect(orders.length).toBeGreaterThan(0);
      expect(orders[0]?.businessId).toBe(testBusiness.id);
    });

    it('should filter orders by status', async () => {
      const orders = await KitchenOrderService.getKitchenOrders({
        businessId: testBusiness.id,
        status: 'pending'
      });

      expect(orders.every(order => order.status === 'pending')).toBe(true);
    });

    it('should filter orders by priority', async () => {
      const orders = await KitchenOrderService.getKitchenOrders({
        businessId: testBusiness.id,
        priority: 'normal'
      });

      expect(orders.every(order => order.priority === 'normal')).toBe(true);
    });

    it('should filter orders by assignedTo', async () => {
      // First assign the order
      await testKitchenOrder.update({ assignedTo: testUser.id });

      const orders = await KitchenOrderService.getKitchenOrders({
        businessId: testBusiness.id,
        assignedTo: testUser.id
      });

      expect(orders.every(order => order.assignedTo === testUser.id)).toBe(true);
    });
  });

  describe('getKitchenOrderById', () => {
    it('should get a specific kitchen order by ID', async () => {
      const order = await KitchenOrderService.getKitchenOrderById(
        testKitchenOrder.id,
        testBusiness.id
      );

      expect(order).toBeDefined();
      expect(order?.id).toBe(testKitchenOrder.id);
      expect(order?.orderNumber).toBe(testOrder.orderNumber);
    });

    it('should return null for non-existent order', async () => {
      const order = await KitchenOrderService.getKitchenOrderById(
        99999,
        testBusiness.id
      );

      expect(order).toBeNull();
    });

    it('should return null for order from different business', async () => {
      const otherBusiness = await BusinessModel.create({
        name: 'Other Restaurant',
        type: 'restaurant',
        address: '456 Other St',
        phone: '555-5678',
        email: 'other@restaurant.com',
        slug: 'other-restaurant',
        taxRate: 0.10,
        currency: 'USD',
        timezone: 'UTC'
      });

      const order = await KitchenOrderService.getKitchenOrderById(
        testKitchenOrder.id,
        otherBusiness.id
      );

      expect(order).toBeNull();

      await BusinessModel.destroy({ where: { id: otherBusiness.id } });
    });
  });

  describe('updateKitchenOrder', () => {
    it('should update kitchen order status', async () => {
      const updateData = {
        status: 'confirmed' as const,
        notes: 'Order confirmed by kitchen'
      };

      const updatedOrder = await KitchenOrderService.updateKitchenOrder(
        testKitchenOrder.id,
        testBusiness.id,
        updateData
      );

      expect(updatedOrder).toBeDefined();
      expect(updatedOrder?.status).toBe('confirmed');
      expect(updatedOrder?.notes).toBe('Order confirmed by kitchen');
    });

    it('should handle status-specific logic for preparing', async () => {
      const updateData = { status: 'preparing' as const };

      const updatedOrder = await KitchenOrderService.updateKitchenOrder(
        testKitchenOrder.id,
        testBusiness.id,
        updateData
      );

      expect(updatedOrder).toBeDefined();
      expect(updatedOrder?.status).toBe('preparing');
      expect(updatedOrder?.startTime).toBeDefined();
    });

    it('should handle status-specific logic for ready', async () => {
      // First set start time
      await testKitchenOrder.update({ startTime: new Date() });

      const updateData = { status: 'ready' as const };

      const updatedOrder = await KitchenOrderService.updateKitchenOrder(
        testKitchenOrder.id,
        testBusiness.id,
        updateData
      );

      expect(updatedOrder).toBeDefined();
      expect(updatedOrder?.status).toBe('ready');
      expect(updatedOrder?.readyTime).toBeDefined();
      expect(updatedOrder?.actualPrepTime).toBeDefined();
    });

    it('should return null for non-existent order', async () => {
      const updatedOrder = await KitchenOrderService.updateKitchenOrder(
        99999,
        testBusiness.id,
        { status: 'confirmed' }
      );

      expect(updatedOrder).toBeNull();
    });
  });

  describe('startPreparing', () => {
    it('should start preparing a kitchen order', async () => {
      // Reset order to pending
      await testKitchenOrder.update({ status: 'pending' });

      const updatedOrder = await KitchenOrderService.startPreparing(
        testKitchenOrder.id,
        testBusiness.id,
        testUser.id
      );

      expect(updatedOrder).toBeDefined();
      expect(updatedOrder?.status).toBe('preparing');
      expect(updatedOrder?.assignedTo).toBe(testUser.id);
      expect(updatedOrder?.assignedToName).toBe(testUser.name);
      expect(updatedOrder?.startTime).toBeDefined();
    });

    it('should start preparing without assignment', async () => {
      // Reset order to pending
      await testKitchenOrder.update({ status: 'pending' });

      const updatedOrder = await KitchenOrderService.startPreparing(
        testKitchenOrder.id,
        testBusiness.id
      );

      expect(updatedOrder).toBeDefined();
      expect(updatedOrder?.status).toBe('preparing');
      expect(updatedOrder?.startTime).toBeDefined();
    });

    it('should return null for non-existent order', async () => {
      const updatedOrder = await KitchenOrderService.startPreparing(
        99999,
        testBusiness.id
      );

      expect(updatedOrder).toBeNull();
    });
  });

  describe('markReady', () => {
    it('should mark kitchen order as ready', async () => {
      // First start preparing
      await testKitchenOrder.update({ 
        status: 'preparing', 
        startTime: new Date() 
      });

      const updatedOrder = await KitchenOrderService.markReady(
        testKitchenOrder.id,
        testBusiness.id
      );

      expect(updatedOrder).toBeDefined();
      expect(updatedOrder?.status).toBe('ready');
      expect(updatedOrder?.readyTime).toBeDefined();
      expect(updatedOrder?.actualPrepTime).toBeDefined();
    });

    it('should return null for non-existent order', async () => {
      const updatedOrder = await KitchenOrderService.markReady(
        99999,
        testBusiness.id
      );

      expect(updatedOrder).toBeNull();
    });
  });

  describe('markServed', () => {
    it('should mark kitchen order as served', async () => {
      // First mark as ready
      await testKitchenOrder.update({ 
        status: 'ready', 
        readyTime: new Date() 
      });

      const updatedOrder = await KitchenOrderService.markServed(
        testKitchenOrder.id,
        testBusiness.id
      );

      expect(updatedOrder).toBeDefined();
      expect(updatedOrder?.status).toBe('served');
      expect(updatedOrder?.servedTime).toBeDefined();
    });

    it('should return null for non-existent order', async () => {
      const updatedOrder = await KitchenOrderService.markServed(
        99999,
        testBusiness.id
      );

      expect(updatedOrder).toBeNull();
    });
  });

  describe('updateItemStatus', () => {
    it('should update individual item status', async () => {
      // Reset order to pending
      await testKitchenOrder.update({ status: 'pending' });

      const updatedOrder = await KitchenOrderService.updateItemStatus(
        testKitchenOrder.id,
        testBusiness.id,
        1,
        'preparing'
      );

      expect(updatedOrder).toBeDefined();
      expect(updatedOrder?.items[0]?.status).toBe('preparing');
    });

    it('should update item status with assignment', async () => {
      const updatedOrder = await KitchenOrderService.updateItemStatus(
        testKitchenOrder.id,
        testBusiness.id,
        1,
        'ready',
        testUser.id
      );

      expect(updatedOrder).toBeDefined();
      expect(updatedOrder?.items[0]?.status).toBe('ready');
      expect(updatedOrder?.items[0]?.assignedTo).toBe(testUser.id);
    });

    it('should return null for non-existent order', async () => {
      const updatedOrder = await KitchenOrderService.updateItemStatus(
        99999,
        testBusiness.id,
        1,
        'preparing'
      );

      expect(updatedOrder).toBeNull();
    });
  });

  describe('assignOrder', () => {
    it('should assign kitchen order to a chef', async () => {
      const updatedOrder = await KitchenOrderService.assignOrder(
        testKitchenOrder.id,
        testBusiness.id,
        testUser.id
      );

      expect(updatedOrder).toBeDefined();
      expect(updatedOrder?.assignedTo).toBe(testUser.id);
      expect(updatedOrder?.assignedToName).toBe(testUser.name);
    });

    it('should throw error for non-existent user', async () => {
      await expect(
        KitchenOrderService.assignOrder(
          testKitchenOrder.id,
          testBusiness.id,
          99999
        )
      ).rejects.toThrow('User not found');
    });

    it('should return null for non-existent order', async () => {
      const updatedOrder = await KitchenOrderService.assignOrder(
        99999,
        testBusiness.id,
        testUser.id
      );

      expect(updatedOrder).toBeNull();
    });
  });

  describe('getKitchenStats', () => {
    it('should get kitchen statistics', async () => {
      const stats = await KitchenOrderService.getKitchenStats(testBusiness.id);

      expect(stats).toHaveProperty('totalOrders');
      expect(stats).toHaveProperty('pendingOrders');
      expect(stats).toHaveProperty('preparingOrders');
      expect(stats).toHaveProperty('readyOrders');
      expect(stats).toHaveProperty('averagePrepTime');
      expect(typeof stats.totalOrders).toBe('number');
      expect(typeof stats.averagePrepTime).toBe('number');
    });
  });
}); 