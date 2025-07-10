import { Sequelize, DataTypes, Model, Op } from 'sequelize';
import { OrderItemStatus } from './OrderItemModel';

describe('OrderItemModel', () => {
  let sequelize: Sequelize;
  let OrderItemModel: any;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    OrderItemModel = sequelize.define('OrderItem', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      itemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      itemName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 1,
          max: 100,
        },
      },
      unitPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
          min: 0,
        },
      },
      totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
          min: 0,
        },
      },
      status: {
        type: DataTypes.ENUM(...Object.values(OrderItemStatus)),
        allowNull: false,
        defaultValue: OrderItemStatus.PENDING,
        validate: {
          isIn: [Object.values(OrderItemStatus)],
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
      modifications: {
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
      tableName: 'order_items',
      timestamps: true,
      indexes: [
        {
          fields: ['orderId'],
        },
        {
          fields: ['itemId'],
        },
        {
          fields: ['orderId', 'status'],
        },
        {
          fields: ['status'],
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
    await OrderItemModel.destroy({ where: {} });
  });

  describe('Model Definition', () => {
    it('should have the correct table name', () => {
      expect(OrderItemModel.tableName).toBe('order_items');
    });

    it('should have the required fields', () => {
      const attributes = Object.keys(OrderItemModel.rawAttributes);
      expect(attributes).toContain('id');
      expect(attributes).toContain('orderId');
      expect(attributes).toContain('itemId');
      expect(attributes).toContain('itemName');
      expect(attributes).toContain('quantity');
      expect(attributes).toContain('unitPrice');
      expect(attributes).toContain('totalPrice');
      expect(attributes).toContain('status');
    });
  });

  describe('OrderItem Creation', () => {
    it('should create an order item with valid data', async () => {
      const orderItemData = {
        orderId: 1,
        itemId: 123,
        itemName: 'Cheeseburger',
        quantity: 2,
        unitPrice: 12.99,
        totalPrice: 25.98,
      };

      const orderItem = await OrderItemModel.create(orderItemData);

      expect(orderItem.id).toBeDefined();
      expect(orderItem.orderId).toBe(orderItemData.orderId);
      expect(orderItem.itemId).toBe(orderItemData.itemId);
      expect(orderItem.itemName).toBe(orderItemData.itemName);
      expect(orderItem.quantity).toBe(orderItemData.quantity);
      expect(orderItem.unitPrice).toBe(orderItemData.unitPrice);
      expect(orderItem.totalPrice).toBe(orderItemData.totalPrice);
      expect(orderItem.status).toBe(OrderItemStatus.PENDING);
      expect(orderItem.createdAt).toBeDefined();
      expect(orderItem.updatedAt).toBeDefined();
    });

    it('should set default values correctly', async () => {
      const orderItemData = {
        orderId: 1,
        itemId: 123,
        itemName: 'French Fries',
      };

      const orderItem = await OrderItemModel.create(orderItemData);

      expect(orderItem.status).toBe(OrderItemStatus.PENDING);
      expect(orderItem.quantity).toBe(1);
      expect(orderItem.unitPrice).toBe(0.00);
      expect(orderItem.totalPrice).toBe(0.00);
      expect(orderItem.notes).toBeUndefined();
      expect(orderItem.specialInstructions).toBeUndefined();
      expect(orderItem.modifications).toBeUndefined();
    });

    it('should allow optional fields', async () => {
      const orderItemData = {
        orderId: 1,
        itemId: 123,
        itemName: 'Pizza Margherita',
        quantity: 1,
        unitPrice: 18.50,
        totalPrice: 18.50,
        notes: 'Extra cheese please',
        specialInstructions: 'Well done crust',
        modifications: 'No mushrooms, extra olives',
        estimatedReadyTime: new Date('2024-01-15T18:30:00Z'),
      };

      const orderItem = await OrderItemModel.create(orderItemData);

      expect(orderItem.notes).toBe('Extra cheese please');
      expect(orderItem.specialInstructions).toBe('Well done crust');
      expect(orderItem.modifications).toBe('No mushrooms, extra olives');
      expect(orderItem.estimatedReadyTime).toEqual(new Date('2024-01-15T18:30:00Z'));
    });
  });

  describe('Validation', () => {
    it('should require orderId', async () => {
      const orderItemData = {
        itemId: 123,
        itemName: 'Burger',
      } as any;

      await expect(OrderItemModel.create(orderItemData)).rejects.toThrow();
    });

    it('should require itemId', async () => {
      const orderItemData = {
        orderId: 1,
        itemName: 'Burger',
      } as any;

      await expect(OrderItemModel.create(orderItemData)).rejects.toThrow();
    });

    it('should require itemName', async () => {
      const orderItemData = {
        orderId: 1,
        itemId: 123,
      } as any;

      await expect(OrderItemModel.create(orderItemData)).rejects.toThrow();
    });

    it('should validate itemName is not empty', async () => {
      const orderItemData = {
        orderId: 1,
        itemId: 123,
        itemName: '',
      } as any;

      await expect(OrderItemModel.create(orderItemData)).rejects.toThrow();
    });

    it('should validate quantity range', async () => {
      const orderItemData = {
        orderId: 1,
        itemId: 123,
        itemName: 'Burger',
        quantity: 0,
      };

      await expect(OrderItemModel.create(orderItemData)).rejects.toThrow();

      const orderItemData2 = {
        orderId: 1,
        itemId: 123,
        itemName: 'Burger',
        quantity: 101,
      };

      await expect(OrderItemModel.create(orderItemData2)).rejects.toThrow();
    });

    it('should validate unitPrice is not negative', async () => {
      const orderItemData = {
        orderId: 1,
        itemId: 123,
        itemName: 'Burger',
        unitPrice: -5.00,
      };

      await expect(OrderItemModel.create(orderItemData)).rejects.toThrow();
    });

    it('should validate totalPrice is not negative', async () => {
      const orderItemData = {
        orderId: 1,
        itemId: 123,
        itemName: 'Burger',
        totalPrice: -10.00,
      };

      await expect(OrderItemModel.create(orderItemData)).rejects.toThrow();
    });

    it('should validate status enum values', async () => {
      const orderItemData = {
        orderId: 1,
        itemId: 123,
        itemName: 'Burger',
        status: 'invalid_status' as OrderItemStatus,
      } as any;

      await expect(OrderItemModel.create(orderItemData)).rejects.toThrow();
    });
  });

  describe('OrderItem Status Management', () => {
    it('should allow all valid status values', async () => {
      const statuses = Object.values(OrderItemStatus);
      
      for (const status of statuses) {
        const orderItemData = {
          orderId: 1,
          itemId: 123,
          itemName: `Item_${status}`,
          status,
        };

        const orderItem = await OrderItemModel.create(orderItemData);
        expect(orderItem.status).toBe(status);
      }
    });

    it('should update order item status', async () => {
      const orderItem = await OrderItemModel.create({
        orderId: 1,
        itemId: 123,
        itemName: 'Burger',
        status: OrderItemStatus.PENDING,
      });

      await orderItem.update({ status: OrderItemStatus.CONFIRMED });
      
      const updatedOrderItem = await OrderItemModel.findByPk(orderItem.id);
      expect(updatedOrderItem?.status).toBe(OrderItemStatus.CONFIRMED);
    });
  });

  describe('OrderItem Queries', () => {
    beforeEach(async () => {
      // Create test data
      await OrderItemModel.bulkCreate([
        {
          orderId: 1,
          itemId: 123,
          itemName: 'Cheeseburger',
          quantity: 2,
          unitPrice: 12.99,
          totalPrice: 25.98,
          status: OrderItemStatus.PENDING,
        },
        {
          orderId: 1,
          itemId: 456,
          itemName: 'French Fries',
          quantity: 1,
          unitPrice: 4.99,
          totalPrice: 4.99,
          status: OrderItemStatus.CONFIRMED,
        },
        {
          orderId: 2,
          itemId: 789,
          itemName: 'Pizza Margherita',
          quantity: 1,
          unitPrice: 18.50,
          totalPrice: 18.50,
          status: OrderItemStatus.IN_PROGRESS,
        },
        {
          orderId: 2,
          itemId: 123,
          itemName: 'Cheeseburger',
          quantity: 1,
          unitPrice: 12.99,
          totalPrice: 12.99,
          status: OrderItemStatus.READY,
        },
      ]);
    });

    it('should find order items by order', async () => {
      const orderItems = await OrderItemModel.findAll({
        where: { orderId: 1 },
        order: [['itemName', 'ASC']],
      });

      expect(orderItems).toHaveLength(2);
      expect(orderItems[0]!.itemName).toBe('Cheeseburger');
      expect(orderItems[1]!.itemName).toBe('French Fries');
    });

    it('should find order items by status', async () => {
      const pendingItems = await OrderItemModel.findAll({
        where: { status: OrderItemStatus.PENDING },
      });

      expect(pendingItems).toHaveLength(1);
      expect(pendingItems[0]!.itemName).toBe('Cheeseburger');
    });

    it('should find order items by item', async () => {
      const burgerItems = await OrderItemModel.findAll({
        where: { itemId: 123 },
      });

      expect(burgerItems).toHaveLength(2);
      expect(burgerItems[0]!.itemName).toBe('Cheeseburger');
      expect(burgerItems[1]!.itemName).toBe('Cheeseburger');
    });

    it('should find order items by order and status', async () => {
      const confirmedItems = await OrderItemModel.findAll({
        where: { 
          orderId: 1,
          status: OrderItemStatus.CONFIRMED 
        },
      });

      expect(confirmedItems).toHaveLength(1);
      expect(confirmedItems[0]!.itemName).toBe('French Fries');
    });

    it('should find order items with minimum total price', async () => {
      const expensiveItems = await OrderItemModel.findAll({
        where: {
          totalPrice: {
            [Op.gte]: 15.00,
          },
        },
      });

      expect(expensiveItems).toHaveLength(2);
      expect(expensiveItems[0]!.itemName).toBe('Cheeseburger');
      expect(expensiveItems[1]!.itemName).toBe('Pizza Margherita');
    });

    it('should find order items by date range', async () => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      
      const recentItems = await OrderItemModel.findAll({
        where: {
          createdAt: {
            [Op.gte]: yesterday,
          },
        },
      });

      expect(recentItems).toHaveLength(4);
    });
  });

  describe('OrderItem Operations', () => {
    let orderItem: any;

    beforeEach(async () => {
      orderItem = await OrderItemModel.create({
        orderId: 1,
        itemId: 123,
        itemName: 'Cheeseburger',
        quantity: 1,
        unitPrice: 12.99,
        totalPrice: 12.99,
        status: OrderItemStatus.PENDING,
      });
    });

    it('should update order item quantities', async () => {
      await orderItem.update({ 
        quantity: 3,
        totalPrice: 38.97,
      });
      
      const updatedOrderItem = await OrderItemModel.findByPk(orderItem.id);
      expect(updatedOrderItem?.quantity).toBe(3);
      expect(updatedOrderItem?.totalPrice).toBe(38.97);
    });

    it('should update order item prices', async () => {
      await orderItem.update({ 
        unitPrice: 15.99,
        totalPrice: 15.99,
      });
      
      const updatedOrderItem = await OrderItemModel.findByPk(orderItem.id);
      expect(updatedOrderItem?.unitPrice).toBe(15.99);
      expect(updatedOrderItem?.totalPrice).toBe(15.99);
    });

    it('should add notes and special instructions', async () => {
      await orderItem.update({ 
        notes: 'Extra crispy fries',
        specialInstructions: 'No pickles',
        modifications: 'Add bacon, extra cheese',
      });
      
      const updatedOrderItem = await OrderItemModel.findByPk(orderItem.id);
      expect(updatedOrderItem?.notes).toBe('Extra crispy fries');
      expect(updatedOrderItem?.specialInstructions).toBe('No pickles');
      expect(updatedOrderItem?.modifications).toBe('Add bacon, extra cheese');
    });

    it('should set estimated and actual ready times', async () => {
      const estimatedTime = new Date('2024-01-15T18:30:00Z');
      const actualTime = new Date('2024-01-15T18:25:00Z');
      
      await orderItem.update({ 
        estimatedReadyTime: estimatedTime,
        actualReadyTime: actualTime,
      });
      
      const updatedOrderItem = await OrderItemModel.findByPk(orderItem.id);
      expect(updatedOrderItem?.estimatedReadyTime).toEqual(estimatedTime);
      expect(updatedOrderItem?.actualReadyTime).toEqual(actualTime);
    });

    it('should track order item status progression', async () => {
      // Pending -> Confirmed
      await orderItem.update({ status: OrderItemStatus.CONFIRMED });
      expect(orderItem.status).toBe(OrderItemStatus.CONFIRMED);

      // Confirmed -> In Progress
      await orderItem.update({ status: OrderItemStatus.IN_PROGRESS });
      expect(orderItem.status).toBe(OrderItemStatus.IN_PROGRESS);

      // In Progress -> Ready
      await orderItem.update({ status: OrderItemStatus.READY });
      expect(orderItem.status).toBe(OrderItemStatus.READY);

      // Ready -> Served
      await orderItem.update({ status: OrderItemStatus.SERVED });
      expect(orderItem.status).toBe(OrderItemStatus.SERVED);
    });

    it('should cancel order item', async () => {
      await orderItem.update({ status: OrderItemStatus.CANCELLED });
      
      const updatedOrderItem = await OrderItemModel.findByPk(orderItem.id);
      expect(updatedOrderItem?.status).toBe(OrderItemStatus.CANCELLED);
    });
  });

  describe('OrderItem Calculations', () => {
    it('should calculate total price correctly', async () => {
      const orderItem = await OrderItemModel.create({
        orderId: 1,
        itemId: 123,
        itemName: 'Cheeseburger',
        quantity: 2,
        unitPrice: 12.99,
        totalPrice: 25.98,
      });

      expect(orderItem.totalPrice).toBe(25.98);
      expect(orderItem.quantity * orderItem.unitPrice).toBe(orderItem.totalPrice);
    });

    it('should handle zero prices', async () => {
      const orderItem = await OrderItemModel.create({
        orderId: 1,
        itemId: 123,
        itemName: 'Free Item',
        quantity: 1,
        unitPrice: 0.00,
        totalPrice: 0.00,
      });

      expect(orderItem.unitPrice).toBe(0.00);
      expect(orderItem.totalPrice).toBe(0.00);
    });

    it('should handle large quantities', async () => {
      const orderItem = await OrderItemModel.create({
        orderId: 1,
        itemId: 123,
        itemName: 'Bulk Item',
        quantity: 50,
        unitPrice: 2.50,
        totalPrice: 125.00,
      });

      expect(orderItem.quantity).toBe(50);
      expect(orderItem.totalPrice).toBe(125.00);
    });
  });

  describe('OrderItem Relationships', () => {
    it('should support multiple items per order', async () => {
      const orderItems = await OrderItemModel.bulkCreate([
        {
          orderId: 1,
          itemId: 123,
          itemName: 'Cheeseburger',
          quantity: 1,
          unitPrice: 12.99,
          totalPrice: 12.99,
        },
        {
          orderId: 1,
          itemId: 456,
          itemName: 'French Fries',
          quantity: 1,
          unitPrice: 4.99,
          totalPrice: 4.99,
        },
        {
          orderId: 1,
          itemId: 789,
          itemName: 'Soft Drink',
          quantity: 2,
          unitPrice: 2.50,
          totalPrice: 5.00,
        },
      ]);

      expect(orderItems).toHaveLength(3);
      expect(orderItems[0]!.orderId).toBe(1);
      expect(orderItems[1]!.orderId).toBe(1);
      expect(orderItems[2]!.orderId).toBe(1);
    });

    it('should support same item in different orders', async () => {
      const orderItems = await OrderItemModel.bulkCreate([
        {
          orderId: 1,
          itemId: 123,
          itemName: 'Cheeseburger',
          quantity: 1,
          unitPrice: 12.99,
          totalPrice: 12.99,
        },
        {
          orderId: 2,
          itemId: 123,
          itemName: 'Cheeseburger',
          quantity: 2,
          unitPrice: 12.99,
          totalPrice: 25.98,
        },
      ]);

      expect(orderItems).toHaveLength(2);
      expect(orderItems[0]!.orderId).toBe(1);
      expect(orderItems[1]!.orderId).toBe(2);
      expect(orderItems[0]!.itemId).toBe(123);
      expect(orderItems[1]!.itemId).toBe(123);
    });
  });
}); 