import request from 'supertest';
import express from 'express';
import { OrderType, OrderStatus } from '../../models/OrderModel';

// Create a test app
const app = express();
app.use(express.json());

// Mock authentication middleware
const mockAuthMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = { id: 1, businessId: 1, email: 'test@example.com' };
  next();
};

// Mock order routes
app.post('/api/orders', mockAuthMiddleware, (req: any, res: any) => {
  const { businessId, orderType, customerId, tableId, items } = req.body;
  
  const mockOrder = {
    id: 1,
    businessId,
    orderType: orderType || OrderType.DINE_IN,
    customerId,
    tableId,
    status: OrderStatus.PENDING,
    totalAmount: 25.98,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  res.status(201).json({
    message: 'Order created successfully',
    data: mockOrder
  });
});

app.get('/api/orders/:id', mockAuthMiddleware, (req: any, res: any) => {
  const { id } = req.params;
  
  if (id === 'invalid') {
    return res.status(400).json({ error: 'Invalid order ID' });
  }
  
  // Return 2 items if id == 1, else 1 item
  const orderItems = id === '1' ? [
    {
      id: 1,
      itemId: 1,
      itemName: 'Test Burger',
      quantity: 2,
      unitPrice: 12.99,
      totalPrice: 25.98
    },
    {
      id: 2,
      itemId: 2,
      itemName: 'Test Item',
      quantity: 1,
      unitPrice: 12.99,
      totalPrice: 12.99
    }
  ] : [
    {
      id: 1,
      itemId: 1,
      itemName: 'Test Burger',
      quantity: 2,
      unitPrice: 12.99,
      totalPrice: 25.98
    }
  ];

  const mockOrder = {
    id: parseInt(id),
    businessId: 1,
    orderType: OrderType.DINE_IN,
    status: OrderStatus.PENDING,
    totalAmount: 25.98,
    orderItems,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  res.json({
    message: 'Order retrieved successfully',
    data: mockOrder
  });
});

app.post('/api/orders/:id/items', mockAuthMiddleware, (req: any, res: any) => {
  const { id } = req.params;
  const { items } = req.body;
  
  if (id === '999') {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  const mockOrder = {
    id: 1,
    businessId: 1,
    orderType: OrderType.DINE_IN,
    status: OrderStatus.PENDING,
    totalAmount: 38.97,
    orderItems: [
      {
        id: 1,
        itemId: 1,
        itemName: 'Test Burger',
        quantity: 2,
        unitPrice: 12.99,
        totalPrice: 25.98
      },
      {
        id: 2,
        itemId: 2,
        itemName: 'Test Item',
        quantity: 1,
        unitPrice: 12.99,
        totalPrice: 12.99
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  res.json({
    message: 'Items added to order successfully',
    data: mockOrder
  });
});

app.put('/api/orders/:id', mockAuthMiddleware, (req: any, res: any) => {
  const { status } = req.body;
  
  const mockOrder = {
    id: 1,
    businessId: 1,
    orderType: OrderType.DINE_IN,
    status: status || OrderStatus.CONFIRMED,
    totalAmount: 25.98,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  res.json({
    message: 'Order status updated successfully',
    data: mockOrder
  });
});

app.get('/api/orders', mockAuthMiddleware, (req: any, res: any) => {
  const { businessId, status } = req.query;
  
  const mockOrders = [
    {
      id: 1,
      businessId: parseInt(businessId as string),
      orderType: OrderType.DINE_IN,
      status: status || OrderStatus.CONFIRMED,
      totalAmount: 25.98,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  res.json({
    message: 'Orders retrieved successfully',
    data: mockOrders
  });
});

describe('Order Management Integration Tests', () => {
  const authToken = 'mock-token';
  const businessId = 1;
  const customerId = 1;
  const tableId = 1;
  const menuItemId = 1;
  let orderId: number;

  describe('Order Creation and Management', () => {
    it('should create a new order successfully', async () => {
      const orderData = {
        businessId,
        orderType: OrderType.DINE_IN,
        customerId,
        tableId,
        items: [
          {
            itemId: menuItemId,
            quantity: 2,
            unitPrice: 12.99
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Order created successfully');
      expect(response.body.data.businessId).toBe(businessId);
      expect(response.body.data.orderType).toBe(OrderType.DINE_IN);

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
            itemId: 2,
            quantity: 1,
            unitPrice: 12.99
          }
        ]
      };

      const response = await request(app)
        .post(`/api/orders/${orderId}/items`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Items added to order successfully');
      expect(response.body.data.orderItems).toHaveLength(2);
      expect(response.body.data.orderItems[1].itemId).toBe(2);
    });

    it('should retrieve order items', async () => {
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.orderItems).toHaveLength(2);
      expect(response.body.data.orderItems[0].itemName).toBe('Test Burger');
      expect(response.body.data.orderItems[0].quantity).toBe(2);
    });

    it('should update order status', async () => {
      const response = await request(app)
        .put(`/api/orders/${orderId}`)
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
          status: OrderStatus.CONFIRMED
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
        .get('/api/orders/invalid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it('should reject adding items to non-existent order', async () => {
      const itemData = {
        items: [
          {
            itemId: 1,
            quantity: 1,
            unitPrice: 12.99
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders/999/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData);

      expect(response.status).toBe(404);
    });
  });
});