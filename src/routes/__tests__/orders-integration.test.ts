// Set test environment
process.env.NODE_ENV = 'test';

import request from 'supertest';
import express from 'express';
import app from '../../index';
import { initializeAllModels, setupAssociations } from '../../models';
import DatabaseService from '../../services/databaseService';
import { OrderModel, OrderStatus, OrderType } from '../../models/OrderModel';
import { OrderItemModel, OrderItemStatus } from '../../models/OrderItemModel';
import { BusinessModel } from '../../models/BusinessModel';
import { UserModel, UserRole } from '../../models/UserModel';
import { MenuItemModel } from '../../models/MenuItemModel';
import { MenuCategoryModel } from '../../models/MenuCategoryModel';
import { ItemModel } from '../../models/ItemModel';
import { CustomerModel } from '../../models/CustomerModel';
import jwt from 'jsonwebtoken';
import { getSequelize } from '../../models/sequelize';

// Initialize all models and sync database before running tests
beforeAll(async () => {
  // Initialize models first
  initializeAllModels();
  
  // Setup associations
  setupAssociations();
  
  // Then sync database with force to recreate all tables
  const sequelize = getSequelize();
  await sequelize.sync({ force: true }); // Force sync to recreate tables
});

describe('Order Management Integration Tests', () => {
  let businessId: number;
  let userId: number;
  let customerId: number;
  let menuItemId: number;
  let itemId: number;
  let categoryId: number;
  let authToken: string;
  let orderId: number;

  beforeAll(async () => {
    // Create test business
    const business = await BusinessModel.create({
      name: 'Test Restaurant',
      slug: `test-restaurant-integration-${Date.now()}`,
      type: 'restaurant',
      taxRate: 8.5,
      currency: 'USD',
      timezone: 'UTC',
    });
    businessId = business.id;

    // Create test user
    const user = await UserModel.create({
      businessId: business.id,
      name: 'Test Server',
      email: 'server-integration@example.com',
      password: 'password123',
      role: UserRole.MANAGER,
    });
    userId = user.id;

    // Create test customer
    const customer = await CustomerModel.create({
      businessId: business.id,
      name: 'Test Customer',
      email: 'customer-integration@example.com',
    });
    customerId = customer.id;

    // Create test menu category
    const category = await MenuCategoryModel.create({
      businessId: business.id,
      name: 'Test Category',
      description: 'Test category for integration tests',
    });
    categoryId = category.id;

    // Create test menu item
    const menuItem = await MenuItemModel.create({
      businessId: business.id,
      categoryId: category.id,
      name: 'Test Burger',
      price: 12.99,
      cost: 8.00,
      isAvailable: true,
    });
    menuItemId = menuItem.id;

    // Create test item (for order items)
    const item = await ItemModel.create({
      businessId: business.id,
      name: 'Test Burger',
      description: 'Test burger for integration tests',
      price: 12.99,
      cost: 8.00,
      stock: 100,
      category: 'Burgers',
      unit: 'piece',
      minStock: 10,
      maxStock: 1000,
      isActive: true,
    });
    itemId = item.id;

    // Create auth token
    authToken = jwt.sign(
      { userId: user.id, businessId: business.id, role: user.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Clean up test data
    await OrderItemModel.destroy({ where: {} });
    await OrderModel.destroy({ where: {} });
    await MenuItemModel.destroy({ where: {} });
    await ItemModel.destroy({ where: {} });
    await MenuCategoryModel.destroy({ where: {} });
    await CustomerModel.destroy({ where: {} });
    await UserModel.destroy({ where: {} });
    await BusinessModel.destroy({ where: {} });
    
    // Don't close database connection - it's handled globally
  });

  describe('Order Creation and Management', () => {
    it('should create a new order successfully', async () => {
      const orderData = {
        orderType: OrderType.DINE_IN,
        customerId,
        items: [
          {
            itemId: menuItemId,
            quantity: 2,
            notes: 'Extra crispy'
          }
        ],
        notes: 'Integration test order',
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Order created successfully');
      expect(response.body.data.businessId).toBe(businessId);
      expect(response.body.data.orderType).toBe(OrderType.DINE_IN);
      expect(response.body.data.status).toBe(OrderStatus.PENDING);
      expect(response.body.data.orderNumber).toMatch(/^ORD-\d+-\d{3}$/);

      orderId = response.body.data.id;
    });

    it('should retrieve the created order', async () => {
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(orderId);
      expect(response.body.data.businessId).toBe(businessId);
      expect(response.body.data.orderType).toBe(OrderType.DINE_IN);
    });

    it('should add items to the order', async () => {
      const itemData = {
        items: [
          {
            itemId: menuItemId,
            quantity: 2,
            notes: 'Extra crispy'
          }
        ]
      };

      const response = await request(app)
        .post(`/api/orders/${orderId}/items`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Items added to order successfully');
      expect(response.body.data.orderItems).toHaveLength(2); // 1 from initial creation + 1 from adding
      expect(response.body.data.orderItems[1].itemId).toBe(menuItemId); // Check the newly added item
      expect(response.body.data.orderItems[1].quantity).toBe(2);
    });

    it('should retrieve order items', async () => {
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.orderItems).toHaveLength(2); // 1 from initial creation + 1 from adding
      expect(response.body.data.orderItems[0].itemName).toBe('Test Burger');
      expect(response.body.data.orderItems[0].quantity).toBe(2);
    });

    it('should update order status', async () => {
      const response = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: OrderStatus.CONFIRMED });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Order status updated successfully');
      expect(response.body.data.status).toBe(OrderStatus.CONFIRMED);
    });

    it('should list all orders for the business', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ businessId });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe(orderId);
      expect(response.body.data[0].businessId).toBe(businessId);
      expect(response.body.data[0].orderType).toBe(OrderType.DINE_IN);
    });

    it('should filter orders by status', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ businessId, status: OrderStatus.CONFIRMED });

      expect(response.status).toBe(200);
      expect(response.body.data).toContainEqual(
        expect.objectContaining({
          id: orderId,
          status: OrderStatus.CONFIRMED,
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should reject unauthorized requests', async () => {
      const response = await request(app)
        .get('/api/orders')
        .query({ businessId });

      expect(response.status).toBe(401);
    });

    it('should reject invalid order ID', async () => {
      const response = await request(app)
        .get('/api/orders/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should reject adding items to non-existent order', async () => {
      const itemData = {
        items: [
          {
            itemId: menuItemId,
            quantity: 1,
            notes: 'Test item'
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders/99999/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData);

      expect(response.status).toBe(404);
    });
  });
});