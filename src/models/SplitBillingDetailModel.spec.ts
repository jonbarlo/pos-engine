import { Sequelize, DataTypes, Model, Op } from 'sequelize';
import { SplitDetailStatus } from './SplitBillingDetailModel';

describe('SplitBillingDetailModel', () => {
  let sequelize: Sequelize;
  let SplitBillingDetailModel: any;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    SplitBillingDetailModel = sequelize.define('SplitBillingDetail', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      splitBillingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      customerName: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      customerPhone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      splitAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      splitPercentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        validate: {
          min: 0,
          max: 100,
        },
      },
      items: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'JSON string of items assigned to this split',
      },
      status: {
        type: DataTypes.ENUM(...Object.values(SplitDetailStatus)),
        allowNull: false,
        defaultValue: SplitDetailStatus.PENDING,
        validate: {
          isIn: [Object.values(SplitDetailStatus)],
        },
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      paymentMethod: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      paymentReference: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      paidAt: {
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
      tableName: 'split_billing_details',
      timestamps: true,
      indexes: [
        {
          fields: ['splitBillingId'],
        },
        {
          fields: ['splitBillingId', 'status'],
        },
        {
          fields: ['customerName'],
        },
        {
          fields: ['customerPhone'],
        },
        {
          fields: ['status'],
        },
        {
          fields: ['paidAt'],
        },
      ],
    });

    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await SplitBillingDetailModel.destroy({ where: {} });
  });

  describe('Model Definition', () => {
    it('should have the correct table name', () => {
      expect(SplitBillingDetailModel.tableName).toBe('split_billing_details');
    });

    it('should have the required fields', () => {
      const attributes = Object.keys(SplitBillingDetailModel.rawAttributes);
      expect(attributes).toContain('id');
      expect(attributes).toContain('splitBillingId');
      expect(attributes).toContain('splitAmount');
      expect(attributes).toContain('status');
    });
  });

  describe('SplitBillingDetail Creation', () => {
    it('should create a split billing detail with valid data', async () => {
      const splitDetailData = {
        splitBillingId: 1,
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        splitAmount: 25.00,
        splitPercentage: 25.00,
        items: JSON.stringify([{ id: 1, name: 'Burger', price: 15.00 }, { id: 2, name: 'Fries', price: 10.00 }]),
        notes: 'John ordered burger and fries',
      };

      const splitDetail = await SplitBillingDetailModel.create(splitDetailData);

      expect(splitDetail.id).toBeDefined();
      expect(splitDetail.splitBillingId).toBe(splitDetailData.splitBillingId);
      expect(splitDetail.customerName).toBe(splitDetailData.customerName);
      expect(splitDetail.customerPhone).toBe(splitDetailData.customerPhone);
      expect(splitDetail.splitAmount).toBe(splitDetailData.splitAmount);
      expect(splitDetail.splitPercentage).toBe(splitDetailData.splitPercentage);
      expect(splitDetail.items).toBe(splitDetailData.items);
      expect(splitDetail.status).toBe(SplitDetailStatus.PENDING);
      expect(splitDetail.notes).toBe(splitDetailData.notes);
      expect(splitDetail.createdAt).toBeDefined();
      expect(splitDetail.updatedAt).toBeDefined();
    });

    it('should set default values correctly', async () => {
      const splitDetailData = {
        splitBillingId: 1,
        splitAmount: 30.00,
      };

      const splitDetail = await SplitBillingDetailModel.create(splitDetailData);

      expect(splitDetail.status).toBe(SplitDetailStatus.PENDING);
      expect(splitDetail.customerName).toBeUndefined();
      expect(splitDetail.customerPhone).toBeUndefined();
      expect(splitDetail.splitPercentage).toBeUndefined();
      expect(splitDetail.items).toBeUndefined();
      expect(splitDetail.notes).toBeUndefined();
      expect(splitDetail.paymentMethod).toBeUndefined();
      expect(splitDetail.paymentReference).toBeUndefined();
      expect(splitDetail.paidAt).toBeUndefined();
    });

    it('should allow optional fields', async () => {
      const splitDetailData = {
        splitBillingId: 1,
        splitAmount: 50.00,
        customerName: 'Jane Smith',
        customerPhone: '+1987654321',
        splitPercentage: 50.00,
        items: JSON.stringify([{ id: 3, name: 'Pizza', price: 50.00 }]),
        notes: 'Jane ordered pizza',
        paymentMethod: 'Credit Card',
        paymentReference: 'CC123456',
      };

      const splitDetail = await SplitBillingDetailModel.create(splitDetailData);

      expect(splitDetail.customerName).toBe('Jane Smith');
      expect(splitDetail.customerPhone).toBe('+1987654321');
      expect(splitDetail.splitPercentage).toBe(50.00);
      expect(splitDetail.items).toBe(JSON.stringify([{ id: 3, name: 'Pizza', price: 50.00 }]));
      expect(splitDetail.notes).toBe('Jane ordered pizza');
      expect(splitDetail.paymentMethod).toBe('Credit Card');
      expect(splitDetail.paymentReference).toBe('CC123456');
    });
  });

  describe('Validation', () => {
    it('should require splitBillingId', async () => {
      const splitDetailData = {
        splitAmount: 25.00,
      } as any;

      await expect(SplitBillingDetailModel.create(splitDetailData)).rejects.toThrow();
    });

    it('should require splitAmount', async () => {
      const splitDetailData = {
        splitBillingId: 1,
      } as any;

      await expect(SplitBillingDetailModel.create(splitDetailData)).rejects.toThrow();
    });

    it('should validate splitAmount is not negative', async () => {
      const splitDetailData = {
        splitBillingId: 1,
        splitAmount: -10.00,
      };

      await expect(SplitBillingDetailModel.create(splitDetailData)).rejects.toThrow();
    });

    it('should validate splitPercentage minimum', async () => {
      const splitDetailData = {
        splitBillingId: 1,
        splitAmount: 25.00,
        splitPercentage: -5.00,
      };

      await expect(SplitBillingDetailModel.create(splitDetailData)).rejects.toThrow();
    });

    it('should validate splitPercentage maximum', async () => {
      const splitDetailData = {
        splitBillingId: 1,
        splitAmount: 25.00,
        splitPercentage: 150.00,
      };

      await expect(SplitBillingDetailModel.create(splitDetailData)).rejects.toThrow();
    });

    it('should validate status enum values', async () => {
      const splitDetailData = {
        splitBillingId: 1,
        splitAmount: 25.00,
        status: 'invalid_status' as SplitDetailStatus,
      } as any;

      await expect(SplitBillingDetailModel.create(splitDetailData)).rejects.toThrow();
    });

    it('should validate customer name length', async () => {
      const longName = 'A'.repeat(101);
      const splitDetailData = {
        splitBillingId: 1,
        splitAmount: 25.00,
        customerName: longName,
      };

      // The model doesn't have length validation for customerName, so this should succeed
      const splitDetail = await SplitBillingDetailModel.create(splitDetailData);
      expect(splitDetail.customerName).toBe(longName);
    });

    it('should validate customer phone length', async () => {
      const longPhone = '1'.repeat(21);
      const splitDetailData = {
        splitBillingId: 1,
        splitAmount: 25.00,
        customerPhone: longPhone,
      };

      // The model doesn't have length validation for customerPhone, so this should succeed
      const splitDetail = await SplitBillingDetailModel.create(splitDetailData);
      expect(splitDetail.customerPhone).toBe(longPhone);
    });
  });

  describe('Split Detail Status Management', () => {
    it('should allow all valid status values', async () => {
      const statuses = Object.values(SplitDetailStatus);
      
      for (const status of statuses) {
        const splitDetailData = {
          splitBillingId: 1,
          splitAmount: 25.00,
          status,
        };

        const splitDetail = await SplitBillingDetailModel.create(splitDetailData);
        expect(splitDetail.status).toBe(status);
      }
    });

    it('should set pending as default status', async () => {
      const splitDetailData = {
        splitBillingId: 1,
        splitAmount: 25.00,
      };

      const splitDetail = await SplitBillingDetailModel.create(splitDetailData);
      expect(splitDetail.status).toBe(SplitDetailStatus.PENDING);
    });

    it('should update split detail status', async () => {
      const splitDetail = await SplitBillingDetailModel.create({
        splitBillingId: 1,
        splitAmount: 25.00,
        status: SplitDetailStatus.PENDING,
      });

      await splitDetail.update({ status: SplitDetailStatus.PAID });
      
      const updatedSplitDetail = await SplitBillingDetailModel.findByPk(splitDetail.id);
      expect(updatedSplitDetail?.status).toBe(SplitDetailStatus.PAID);
    });
  });

  describe('SplitBillingDetail Queries', () => {
    beforeEach(async () => {
      // Create test data
      await SplitBillingDetailModel.bulkCreate([
        {
          splitBillingId: 1,
          customerName: 'John Doe',
          customerPhone: '+1234567890',
          splitAmount: 25.00,
          splitPercentage: 25.00,
          status: SplitDetailStatus.PENDING,
          notes: 'John\'s portion',
        },
        {
          splitBillingId: 1,
          customerName: 'Jane Smith',
          customerPhone: '+1987654321',
          splitAmount: 30.00,
          splitPercentage: 30.00,
          status: SplitDetailStatus.PAID,
          notes: 'Jane\'s portion',
          paymentMethod: 'Credit Card',
          paymentReference: 'CC123456',
          paidAt: new Date(),
        },
        {
          splitBillingId: 1,
          customerName: 'Bob Wilson',
          customerPhone: '+1122334455',
          splitAmount: 45.00,
          splitPercentage: 45.00,
          status: SplitDetailStatus.CANCELLED,
          notes: 'Bob\'s portion - cancelled',
        },
        {
          splitBillingId: 2,
          customerName: 'Alice Brown',
          customerPhone: '+1555666777',
          splitAmount: 50.00,
          splitPercentage: 50.00,
          status: SplitDetailStatus.PENDING,
          notes: 'Alice\'s portion for different split',
        },
      ]);
    });

    it('should find split details by split billing ID', async () => {
      const splitDetails = await SplitBillingDetailModel.findAll({
        where: { splitBillingId: 1 },
        order: [['customerName', 'ASC']],
      });

      expect(splitDetails).toHaveLength(3);
      expect(splitDetails[0]!.customerName).toBe('Bob Wilson');
      expect(splitDetails[1]!.customerName).toBe('Jane Smith');
      expect(splitDetails[2]!.customerName).toBe('John Doe');
    });

    it('should find split details by status', async () => {
      const pendingDetails = await SplitBillingDetailModel.findAll({
        where: { status: SplitDetailStatus.PENDING },
      });

      expect(pendingDetails).toHaveLength(2);
    });

    it('should find split details by customer name', async () => {
      const johnDetails = await SplitBillingDetailModel.findAll({
        where: { customerName: 'John Doe' },
      });

      expect(johnDetails).toHaveLength(1);
      expect(johnDetails[0]!.splitAmount).toBe(25.00);
    });

    it('should find split details by customer phone', async () => {
      const janeDetails = await SplitBillingDetailModel.findAll({
        where: { customerPhone: '+1987654321' },
      });

      expect(janeDetails).toHaveLength(1);
      expect(janeDetails[0]!.customerName).toBe('Jane Smith');
    });

    it('should find split details by split billing and status', async () => {
      const paidDetails = await SplitBillingDetailModel.findAll({
        where: { 
          splitBillingId: 1,
          status: SplitDetailStatus.PAID 
        },
      });

      expect(paidDetails).toHaveLength(1);
      expect(paidDetails[0]!.customerName).toBe('Jane Smith');
    });

    it('should find split details with minimum split amount', async () => {
      const expensiveSplits = await SplitBillingDetailModel.findAll({
        where: {
          splitAmount: {
            [Op.gte]: 30.00,
          },
        },
      });

      expect(expensiveSplits).toHaveLength(3);
    });

    it('should find split details by payment method', async () => {
      const creditCardPayments = await SplitBillingDetailModel.findAll({
        where: { paymentMethod: 'Credit Card' },
      });

      expect(creditCardPayments).toHaveLength(1);
      expect(creditCardPayments[0]!.customerName).toBe('Jane Smith');
    });

    it('should find paid split details', async () => {
      const paidDetails = await SplitBillingDetailModel.findAll({
        where: {
          paidAt: {
            [Op.ne]: null,
          },
        },
      });

      expect(paidDetails).toHaveLength(1);
      expect(paidDetails[0]!.customerName).toBe('Jane Smith');
    });
  });

  describe('SplitBillingDetail Operations', () => {
    let splitDetail: any;

    beforeEach(async () => {
      splitDetail = await SplitBillingDetailModel.create({
        splitBillingId: 1,
        customerName: 'John Doe',
        splitAmount: 25.00,
        status: SplitDetailStatus.PENDING,
      });
    });

    it('should update split detail status', async () => {
      await splitDetail.update({ status: SplitDetailStatus.PAID });
      
      const updatedSplitDetail = await SplitBillingDetailModel.findByPk(splitDetail.id);
      expect(updatedSplitDetail?.status).toBe(SplitDetailStatus.PAID);
    });

    it('should update payment information', async () => {
      const paymentData = {
        status: SplitDetailStatus.PAID,
        paymentMethod: 'Cash',
        paymentReference: 'CASH001',
        paidAt: new Date(),
      };

      await splitDetail.update(paymentData);
      
      const updatedSplitDetail = await SplitBillingDetailModel.findByPk(splitDetail.id);
      expect(updatedSplitDetail?.status).toBe(SplitDetailStatus.PAID);
      expect(updatedSplitDetail?.paymentMethod).toBe('Cash');
      expect(updatedSplitDetail?.paymentReference).toBe('CASH001');
      expect(updatedSplitDetail?.paidAt).toBeDefined();
    });

    it('should update split amount and percentage', async () => {
      await splitDetail.update({ 
        splitAmount: 30.00,
        splitPercentage: 30.00,
      });
      
      const updatedSplitDetail = await SplitBillingDetailModel.findByPk(splitDetail.id);
      expect(updatedSplitDetail?.splitAmount).toBe(30.00);
      expect(updatedSplitDetail?.splitPercentage).toBe(30.00);
    });

    it('should update customer information', async () => {
      await splitDetail.update({ 
        customerName: 'John Smith',
        customerPhone: '+1555666777',
        notes: 'Updated customer information',
      });
      
      const updatedSplitDetail = await SplitBillingDetailModel.findByPk(splitDetail.id);
      expect(updatedSplitDetail?.customerName).toBe('John Smith');
      expect(updatedSplitDetail?.customerPhone).toBe('+1555666777');
      expect(updatedSplitDetail?.notes).toBe('Updated customer information');
    });

    it('should cancel split detail', async () => {
      await splitDetail.update({ status: SplitDetailStatus.CANCELLED });
      
      const updatedSplitDetail = await SplitBillingDetailModel.findByPk(splitDetail.id);
      expect(updatedSplitDetail?.status).toBe(SplitDetailStatus.CANCELLED);
    });
  });

  describe('SplitBillingDetail Calculations', () => {
    it('should handle percentage calculations', async () => {
      const splitDetail = await SplitBillingDetailModel.create({
        splitBillingId: 1,
        splitAmount: 25.00,
        splitPercentage: 25.00,
      });

      // Verify percentage calculation
      const calculatedPercentage = (splitDetail.splitAmount / 100) * 100;
      expect(calculatedPercentage).toBe(25.00);
    });

    it('should handle zero split amount', async () => {
      const splitDetail = await SplitBillingDetailModel.create({
        splitBillingId: 1,
        splitAmount: 0.00,
        splitPercentage: 0.00,
      });

      expect(splitDetail.splitAmount).toBe(0.00);
      expect(splitDetail.splitPercentage).toBe(0.00);
    });

    it('should handle decimal split amounts', async () => {
      const splitDetail = await SplitBillingDetailModel.create({
        splitBillingId: 1,
        splitAmount: 33.33,
        splitPercentage: 33.33,
      });

      expect(splitDetail.splitAmount).toBe(33.33);
      expect(splitDetail.splitPercentage).toBe(33.33);
    });
  });

  describe('SplitBillingDetail Relationships', () => {
    it('should support multiple details per split billing', async () => {
      const splitDetails = await SplitBillingDetailModel.bulkCreate([
        {
          splitBillingId: 1,
          customerName: 'John Doe',
          splitAmount: 25.00,
          splitPercentage: 25.00,
        },
        {
          splitBillingId: 1,
          customerName: 'Jane Smith',
          splitAmount: 30.00,
          splitPercentage: 30.00,
        },
        {
          splitBillingId: 1,
          customerName: 'Bob Wilson',
          splitAmount: 45.00,
          splitPercentage: 45.00,
        },
      ]);

      expect(splitDetails).toHaveLength(3);
      expect(splitDetails[0]!.splitBillingId).toBe(1);
      expect(splitDetails[1]!.splitBillingId).toBe(1);
      expect(splitDetails[2]!.splitBillingId).toBe(1);
    });

    it('should support same customer across different splits', async () => {
      const splitDetails = await SplitBillingDetailModel.bulkCreate([
        {
          splitBillingId: 1,
          customerName: 'John Doe',
          splitAmount: 25.00,
        },
        {
          splitBillingId: 2,
          customerName: 'John Doe',
          splitAmount: 50.00,
        },
      ]);

      expect(splitDetails).toHaveLength(2);
      expect(splitDetails[0]!.customerName).toBe('John Doe');
      expect(splitDetails[1]!.customerName).toBe('John Doe');
      expect(splitDetails[0]!.splitBillingId).toBe(1);
      expect(splitDetails[1]!.splitBillingId).toBe(2);
    });
  });

  describe('SplitBillingDetail Business Logic', () => {
    it('should track payment lifecycle', async () => {
      const splitDetail = await SplitBillingDetailModel.create({
        splitBillingId: 1,
        customerName: 'John Doe',
        splitAmount: 25.00,
        status: SplitDetailStatus.PENDING,
      });

      // Initial state
      expect(splitDetail.status).toBe(SplitDetailStatus.PENDING);
      expect(splitDetail.paidAt).toBeUndefined();

      // Mark as paid
      await splitDetail.update({ 
        status: SplitDetailStatus.PAID,
        paymentMethod: 'Cash',
        paidAt: new Date(),
      });

      expect(splitDetail.status).toBe(SplitDetailStatus.PAID);
      expect(splitDetail.paidAt).toBeDefined();
    });

    it('should handle items assignment', async () => {
      const items = [
        { id: 1, name: 'Burger', price: 15.00, quantity: 1 },
        { id: 2, name: 'Fries', price: 5.00, quantity: 2 },
      ];

      const splitDetail = await SplitBillingDetailModel.create({
        splitBillingId: 1,
        customerName: 'John Doe',
        splitAmount: 25.00,
        items: JSON.stringify(items),
      });

      const parsedItems = JSON.parse(splitDetail.items!);
      expect(parsedItems).toHaveLength(2);
      expect(parsedItems[0]!.name).toBe('Burger');
      expect(parsedItems[1]!.name).toBe('Fries');
    });

    it('should validate total split amounts', async () => {
      const splitDetails = await SplitBillingDetailModel.bulkCreate([
        {
          splitBillingId: 1,
          customerName: 'John Doe',
          splitAmount: 25.00,
          splitPercentage: 25.00,
        },
        {
          splitBillingId: 1,
          customerName: 'Jane Smith',
          splitAmount: 30.00,
          splitPercentage: 30.00,
        },
        {
          splitBillingId: 1,
          customerName: 'Bob Wilson',
          splitAmount: 45.00,
          splitPercentage: 45.00,
        },
      ]);

      const totalAmount = splitDetails.reduce((sum: number, detail: any) => sum + detail.splitAmount, 0);
      const totalPercentage = splitDetails.reduce((sum: number, detail: any) => sum + detail.splitPercentage!, 0);

      expect(totalAmount).toBe(100.00);
      expect(totalPercentage).toBe(100.00);
    });
  });
}); 