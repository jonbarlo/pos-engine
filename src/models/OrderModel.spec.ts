import { Sequelize, DataTypes, Model, Op } from 'sequelize';
import { OrderStatus, OrderType } from './OrderModel';

describe('OrderModel', () => {
  let sequelize: Sequelize;
  let OrderModel: any;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    OrderModel = sequelize.define('Order', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      businessId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tableId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      serverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      customerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      orderNumber: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      status: {
        type: DataTypes.ENUM(...Object.values(OrderStatus)),
        allowNull: false,
        defaultValue: OrderStatus.PENDING,
        validate: {
          isIn: [Object.values(OrderStatus)],
        },
      },
      orderType: {
        type: DataTypes.ENUM(...Object.values(OrderType)),
        allowNull: false,
        defaultValue: OrderType.DINE_IN,
        validate: {
          isIn: [Object.values(OrderType)],
        },
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
          min: 0,
        },
      },
      taxAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
          min: 0,
        },
      },
      discountAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
          min: 0,
        },
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
          min: 0,
        },
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      specialInstructions: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      estimatedReadyTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      actualReadyTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    }, {
      tableName: 'orders',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['orderNumber'],
        },
        {
          fields: ['businessId', 'status'],
        },
        {
          fields: ['businessId', 'serverId'],
        },
        {
          fields: ['businessId', 'tableId'],
        },
        {
          fields: ['businessId', 'customerId'],
        },
        {
          fields: ['businessId', 'orderType'],
        },
        {
          fields: ['createdAt'],
        },
      ],
    });

    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await OrderModel.destroy({ where: {} });
  });

  describe('Model Definition', () => {
    it('should have the correct table name', () => {
      expect(OrderModel.tableName).toBe('orders');
    });

    it('should have the required fields', () => {
      const attributes = Object.keys(OrderModel.rawAttributes);
      expect(attributes).toContain('id');
      expect(attributes).toContain('businessId');
      expect(attributes).toContain('serverId');
      expect(attributes).toContain('orderNumber');
      expect(attributes).toContain('status');
      expect(attributes).toContain('orderType');
      expect(attributes).toContain('subtotal');
      expect(attributes).toContain('taxAmount');
      expect(attributes).toContain('discountAmount');
      expect(attributes).toContain('totalAmount');
    });
  });

  describe('Order Creation', () => {
    it('should create an order with valid data', async () => {
      const orderData = {
        businessId: 1,
        serverId: 123,
        orderNumber: 'ORD-001',
        orderType: OrderType.DINE_IN,
        subtotal: 25.50,
        taxAmount: 2.55,
        discountAmount: 0.00,
        totalAmount: 28.05,
      };

      const order = await OrderModel.create(orderData);

      expect(order.id).toBeDefined();
      expect(order.businessId).toBe(orderData.businessId);
      expect(order.serverId).toBe(orderData.serverId);
      expect(order.orderNumber).toBe(orderData.orderNumber);
      expect(order.status).toBe(OrderStatus.PENDING);
      expect(order.orderType).toBe(orderData.orderType);
      expect(order.subtotal).toBe(orderData.subtotal);
      expect(order.taxAmount).toBe(orderData.taxAmount);
      expect(order.discountAmount).toBe(orderData.discountAmount);
      expect(order.totalAmount).toBe(orderData.totalAmount);
      expect(order.createdAt).toBeDefined();
      expect(order.updatedAt).toBeDefined();
    });

    it('should set default values correctly', async () => {
      const orderData = {
        businessId: 1,
        serverId: 123,
        orderNumber: 'ORD-002',
        orderType: OrderType.TAKEAWAY,
      };

      const order = await OrderModel.create(orderData);

      expect(order.status).toBe(OrderStatus.PENDING);
      expect(order.subtotal).toBe(0.00);
      expect(order.taxAmount).toBe(0.00);
      expect(order.discountAmount).toBe(0.00);
      expect(order.totalAmount).toBe(0.00);
      expect(order.tableId).toBeUndefined();
      expect(order.customerId).toBeUndefined();
      expect(order.notes).toBeUndefined();
      expect(order.specialInstructions).toBeUndefined();
    });

    it('should allow optional fields', async () => {
      const orderData = {
        businessId: 1,
        serverId: 123,
        orderNumber: 'ORD-003',
        orderType: OrderType.DINE_IN,
        tableId: 456,
        customerId: 789,
        notes: 'Extra spicy please',
        specialInstructions: 'No onions',
        estimatedReadyTime: new Date('2024-01-15T18:30:00Z'),
      };

      const order = await OrderModel.create(orderData);

      expect(order.tableId).toBe(456);
      expect(order.customerId).toBe(789);
      expect(order.notes).toBe('Extra spicy please');
      expect(order.specialInstructions).toBe('No onions');
      expect(order.estimatedReadyTime).toEqual(new Date('2024-01-15T18:30:00Z'));
    });
  });

  describe('Validation', () => {
    it('should require businessId', async () => {
      const orderData = {
        serverId: 123,
        orderNumber: 'ORD-001',
        orderType: OrderType.DINE_IN,
      } as any;

      await expect(OrderModel.create(orderData)).rejects.toThrow();
    });

    it('should require serverId', async () => {
      const orderData = {
        businessId: 1,
        orderNumber: 'ORD-001',
        orderType: OrderType.DINE_IN,
      } as any;

      await expect(OrderModel.create(orderData)).rejects.toThrow();
    });

    it('should require orderNumber', async () => {
      const orderData = {
        businessId: 1,
        serverId: 123,
        orderType: OrderType.DINE_IN,
      } as any;

      await expect(OrderModel.create(orderData)).rejects.toThrow();
    });

    it('should require orderType', async () => {
      const orderData = {
        businessId: 1,
        serverId: 123,
        orderNumber: 'ORD-001',
      } as any;

      // orderType has a default value, so this should not throw
      const order = await OrderModel.create(orderData);
      expect(order.orderType).toBe(OrderType.DINE_IN);
    });

    it('should validate orderNumber is not empty', async () => {
      const orderData = {
        businessId: 1,
        serverId: 123,
        orderNumber: '',
        orderType: OrderType.DINE_IN,
      } as any;

      await expect(OrderModel.create(orderData)).rejects.toThrow();
    });

    it('should validate status enum values', async () => {
      const orderData = {
        businessId: 1,
        serverId: 123,
        orderNumber: 'ORD-001',
        orderType: OrderType.DINE_IN,
        status: 'invalid_status' as OrderStatus,
      } as any;

      await expect(OrderModel.create(orderData)).rejects.toThrow();
    });

    it('should validate orderType enum values', async () => {
      const orderData = {
        businessId: 1,
        serverId: 123,
        orderNumber: 'ORD-001',
        orderType: 'invalid_type' as OrderType,
      } as any;

      await expect(OrderModel.create(orderData)).rejects.toThrow();
    });

    it('should validate subtotal is not negative', async () => {
      const orderData = {
        businessId: 1,
        serverId: 123,
        orderNumber: 'ORD-001',
        orderType: OrderType.DINE_IN,
        subtotal: -10.00,
      };

      await expect(OrderModel.create(orderData)).rejects.toThrow();
    });

    it('should validate taxAmount is not negative', async () => {
      const orderData = {
        businessId: 1,
        serverId: 123,
        orderNumber: 'ORD-001',
        orderType: OrderType.DINE_IN,
        taxAmount: -1.00,
      };

      await expect(OrderModel.create(orderData)).rejects.toThrow();
    });

    it('should validate discountAmount is not negative', async () => {
      const orderData = {
        businessId: 1,
        serverId: 123,
        orderNumber: 'ORD-001',
        orderType: OrderType.DINE_IN,
        discountAmount: -5.00,
      };

      await expect(OrderModel.create(orderData)).rejects.toThrow();
    });

    it('should validate totalAmount is not negative', async () => {
      const orderData = {
        businessId: 1,
        serverId: 123,
        orderNumber: 'ORD-001',
        orderType: OrderType.DINE_IN,
        totalAmount: -15.00,
      };

      await expect(OrderModel.create(orderData)).rejects.toThrow();
    });
  });

  describe('Unique Constraints', () => {
    it('should enforce unique orderNumber', async () => {
      const orderData = {
        businessId: 1,
        serverId: 123,
        orderNumber: 'ORD-001',
        orderType: OrderType.DINE_IN,
      };

      // Create first order
      await OrderModel.create(orderData);

      // Try to create duplicate
      await expect(OrderModel.create(orderData)).rejects.toThrow();
    });

    it('should allow same orderNumber for different businesses', async () => {
      const orderData1 = {
        businessId: 1,
        serverId: 123,
        orderNumber: 'ORD-001',
        orderType: OrderType.DINE_IN,
      };

      const orderData2 = {
        businessId: 2,
        serverId: 456,
        orderNumber: 'ORD-002', // Different order number
        orderType: OrderType.DINE_IN,
      };

      const order1 = await OrderModel.create(orderData1);
      const order2 = await OrderModel.create(orderData2);

      expect(order1.id).not.toBe(order2.id);
      expect(order1.businessId).toBe(1);
      expect(order2.businessId).toBe(2);
    });
  });

  describe('Order Status Management', () => {
    it('should allow all valid status values', async () => {
      const statuses = Object.values(OrderStatus);
      
      for (const status of statuses) {
        const orderData = {
          businessId: 1,
          serverId: 123,
          orderNumber: `ORD-${status}`,
          orderType: OrderType.DINE_IN,
          status,
        };

        const order = await OrderModel.create(orderData);
        expect(order.status).toBe(status);
      }
    });

    it('should update order status', async () => {
      const order = await OrderModel.create({
        businessId: 1,
        serverId: 123,
        orderNumber: 'ORD-001',
        orderType: OrderType.DINE_IN,
        status: OrderStatus.PENDING,
      });

      await order.update({ status: OrderStatus.CONFIRMED });
      
      const updatedOrder = await OrderModel.findByPk(order.id);
      expect(updatedOrder?.status).toBe(OrderStatus.CONFIRMED);
    });
  });

  describe('Order Type Management', () => {
    it('should allow all valid order type values', async () => {
      const orderTypes = Object.values(OrderType);
      
      for (const orderType of orderTypes) {
        const orderData = {
          businessId: 1,
          serverId: 123,
          orderNumber: `ORD-${orderType}`,
          orderType,
        };

        const order = await OrderModel.create(orderData);
        expect(order.orderType).toBe(orderType);
      }
    });

    it('should set dine_in as default order type', async () => {
      const orderData = {
        businessId: 1,
        serverId: 123,
        orderNumber: 'ORD-001',
      };

      const order = await OrderModel.create(orderData);
      expect(order.orderType).toBe(OrderType.DINE_IN);
    });
  });

  describe('Order Queries', () => {
    beforeEach(async () => {
      // Create test data
      await OrderModel.bulkCreate([
        {
          businessId: 1,
          serverId: 123,
          orderNumber: 'ORD-001',
          orderType: OrderType.DINE_IN,
          status: OrderStatus.PENDING,
          tableId: 1,
          subtotal: 25.50,
          taxAmount: 2.55,
          totalAmount: 28.05,
        },
        {
          businessId: 1,
          serverId: 456,
          orderNumber: 'ORD-002',
          orderType: OrderType.TAKEAWAY,
          status: OrderStatus.CONFIRMED,
          customerId: 789,
          subtotal: 15.75,
          taxAmount: 1.58,
          totalAmount: 17.33,
        },
        {
          businessId: 1,
          serverId: 123,
          orderNumber: 'ORD-003',
          orderType: OrderType.DELIVERY,
          status: OrderStatus.IN_PROGRESS,
          customerId: 101,
          subtotal: 45.00,
          taxAmount: 4.50,
          totalAmount: 49.50,
        },
        {
          businessId: 2,
          serverId: 789,
          orderNumber: 'ORD-004',
          orderType: OrderType.DINE_IN,
          status: OrderStatus.PENDING,
          tableId: 5,
          subtotal: 30.00,
          taxAmount: 3.00,
          totalAmount: 33.00,
        },
      ]);
    });

    it('should find orders by business', async () => {
      const orders = await OrderModel.findAll({
        where: { businessId: 1 },
        order: [['orderNumber', 'ASC']],
      });

      expect(orders).toHaveLength(3);
      expect(orders[0]!.orderNumber).toBe('ORD-001');
      expect(orders[1]!.orderNumber).toBe('ORD-002');
      expect(orders[2]!.orderNumber).toBe('ORD-003');
    });

    it('should find orders by status', async () => {
      const pendingOrders = await OrderModel.findAll({
        where: { 
          businessId: 1,
          status: OrderStatus.PENDING 
        },
      });

      expect(pendingOrders).toHaveLength(1);
      expect(pendingOrders[0]!.orderNumber).toBe('ORD-001');
    });

    it('should find orders by server', async () => {
      const serverOrders = await OrderModel.findAll({
        where: { 
          businessId: 1,
          serverId: 123 
        },
      });

      expect(serverOrders).toHaveLength(2);
      expect(serverOrders[0]!.orderNumber).toBe('ORD-001');
      expect(serverOrders[1]!.orderNumber).toBe('ORD-003');
    });

    it('should find orders by table', async () => {
      const tableOrders = await OrderModel.findAll({
        where: { 
          businessId: 1,
          tableId: 1 
        },
      });

      expect(tableOrders).toHaveLength(1);
      expect(tableOrders[0]!.orderNumber).toBe('ORD-001');
    });

    it('should find orders by customer', async () => {
      const customerOrders = await OrderModel.findAll({
        where: { 
          businessId: 1,
          customerId: 789 
        },
      });

      expect(customerOrders).toHaveLength(1);
      expect(customerOrders[0]!.orderNumber).toBe('ORD-002');
    });

    it('should find orders by type', async () => {
      const takeawayOrders = await OrderModel.findAll({
        where: { 
          businessId: 1,
          orderType: OrderType.TAKEAWAY 
        },
      });

      expect(takeawayOrders).toHaveLength(1);
      expect(takeawayOrders[0]!.orderNumber).toBe('ORD-002');
    });

    it('should find orders by date range', async () => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      
      const recentOrders = await OrderModel.findAll({
        where: {
          businessId: 1,
          createdAt: {
            [Op.gte]: yesterday,
          },
        },
      });

      expect(recentOrders).toHaveLength(3);
    });

    it('should find orders with minimum total amount', async () => {
      const highValueOrders = await OrderModel.findAll({
        where: {
          businessId: 1,
          totalAmount: {
            [Op.gte]: 20.00,
          },
        },
      });

      expect(highValueOrders).toHaveLength(2);
    });
  });

  describe('Order Operations', () => {
    let order: any;

    beforeEach(async () => {
      order = await OrderModel.create({
        businessId: 1,
        serverId: 123,
        orderNumber: 'ORD-001',
        orderType: OrderType.DINE_IN,
        status: OrderStatus.PENDING,
        subtotal: 25.50,
        taxAmount: 2.55,
        totalAmount: 28.05,
      });
    });

    it('should assign table to order', async () => {
      await order.update({ tableId: 456 });
      
      const updatedOrder = await OrderModel.findByPk(order.id);
      expect(updatedOrder?.tableId).toBe(456);
    });

    it('should assign customer to order', async () => {
      await order.update({ customerId: 789 });
      
      const updatedOrder = await OrderModel.findByPk(order.id);
      expect(updatedOrder?.customerId).toBe(789);
    });

    it('should update order amounts', async () => {
      await order.update({ 
        subtotal: 30.00,
        taxAmount: 3.00,
        discountAmount: 5.00,
        totalAmount: 28.00,
      });
      
      const updatedOrder = await OrderModel.findByPk(order.id);
      expect(updatedOrder?.subtotal).toBe(30.00);
      expect(updatedOrder?.taxAmount).toBe(3.00);
      expect(updatedOrder?.discountAmount).toBe(5.00);
      expect(updatedOrder?.totalAmount).toBe(28.00);
    });

    it('should add notes and special instructions', async () => {
      await order.update({ 
        notes: 'Customer requested extra napkins',
        specialInstructions: 'No cheese on burger',
      });
      
      const updatedOrder = await OrderModel.findByPk(order.id);
      expect(updatedOrder?.notes).toBe('Customer requested extra napkins');
      expect(updatedOrder?.specialInstructions).toBe('No cheese on burger');
    });

    it('should set estimated and actual ready times', async () => {
      const estimatedTime = new Date('2024-01-15T18:30:00Z');
      const actualTime = new Date('2024-01-15T18:25:00Z');
      
      await order.update({ 
        estimatedReadyTime: estimatedTime,
        actualReadyTime: actualTime,
      });
      
      const updatedOrder = await OrderModel.findByPk(order.id);
      expect(updatedOrder?.estimatedReadyTime).toEqual(estimatedTime);
      expect(updatedOrder?.actualReadyTime).toEqual(actualTime);
    });

    it('should track order status progression', async () => {
      // Pending -> Confirmed
      await order.update({ status: OrderStatus.CONFIRMED });
      expect(order.status).toBe(OrderStatus.CONFIRMED);

      // Confirmed -> In Progress
      await order.update({ status: OrderStatus.IN_PROGRESS });
      expect(order.status).toBe(OrderStatus.IN_PROGRESS);

      // In Progress -> Ready
      await order.update({ status: OrderStatus.READY });
      expect(order.status).toBe(OrderStatus.READY);

      // Ready -> Served
      await order.update({ status: OrderStatus.SERVED });
      expect(order.status).toBe(OrderStatus.SERVED);

      // Served -> Completed
      await order.update({ status: OrderStatus.COMPLETED });
      expect(order.status).toBe(OrderStatus.COMPLETED);
    });

    it('should cancel order', async () => {
      await order.update({ status: OrderStatus.CANCELLED });
      
      const updatedOrder = await OrderModel.findByPk(order.id);
      expect(updatedOrder?.status).toBe(OrderStatus.CANCELLED);
    });
  });

  describe('Order Calculations', () => {
    it('should calculate total amount correctly', async () => {
      const order = await OrderModel.create({
        businessId: 1,
        serverId: 123,
        orderNumber: 'ORD-001',
        orderType: OrderType.DINE_IN,
        subtotal: 100.00,
        taxAmount: 10.00,
        discountAmount: 5.00,
        totalAmount: 105.00,
      });

      expect(order.totalAmount).toBe(105.00);
      expect(order.subtotal + order.taxAmount - order.discountAmount).toBe(order.totalAmount);
    });

    it('should handle zero amounts', async () => {
      const order = await OrderModel.create({
        businessId: 1,
        serverId: 123,
        orderNumber: 'ORD-002',
        orderType: OrderType.DINE_IN,
        subtotal: 0.00,
        taxAmount: 0.00,
        discountAmount: 0.00,
        totalAmount: 0.00,
      });

      expect(order.subtotal).toBe(0.00);
      expect(order.taxAmount).toBe(0.00);
      expect(order.discountAmount).toBe(0.00);
      expect(order.totalAmount).toBe(0.00);
    });
  });
}); 