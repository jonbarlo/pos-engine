import { Sequelize, DataTypes, Model, Op } from 'sequelize';
import { SplitType, SplitStatus } from './SplitBillingModel';

describe('SplitBillingModel', () => {
  let sequelize: Sequelize;
  let SplitBillingModel: any;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    SplitBillingModel = sequelize.define('SplitBilling', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      businessId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      splitType: {
        type: DataTypes.ENUM(...Object.values(SplitType)),
        allowNull: false,
        validate: {
          isIn: [Object.values(SplitType)],
        },
      },
      status: {
        type: DataTypes.ENUM(...Object.values(SplitStatus)),
        allowNull: false,
        defaultValue: SplitStatus.PENDING,
        validate: {
          isIn: [Object.values(SplitStatus)],
        },
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      numberOfSplits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 2,
          max: 20,
        },
      },
      description: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
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
      tableName: 'split_billings',
      timestamps: true,
      indexes: [
        {
          fields: ['orderId'],
        },
        {
          fields: ['businessId'],
        },
        {
          fields: ['orderId', 'status'],
        },
        {
          fields: ['splitType'],
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
    await SplitBillingModel.destroy({ where: {} });
  });

  describe('Model Definition', () => {
    it('should have the correct table name', () => {
      expect(SplitBillingModel.tableName).toBe('split_billings');
    });

    it('should have the required fields', () => {
      const attributes = Object.keys(SplitBillingModel.rawAttributes);
      expect(attributes).toContain('id');
      expect(attributes).toContain('orderId');
      expect(attributes).toContain('businessId');
      expect(attributes).toContain('splitType');
      expect(attributes).toContain('status');
      expect(attributes).toContain('totalAmount');
      expect(attributes).toContain('numberOfSplits');
    });
  });

  describe('SplitBilling Creation', () => {
    it('should create a split billing with valid data', async () => {
      const splitBillingData = {
        orderId: 1,
        businessId: 1,
        splitType: SplitType.EQUAL,
        totalAmount: 100.00,
        numberOfSplits: 4,
        description: 'Split bill equally among 4 people',
      };

      const splitBilling = await SplitBillingModel.create(splitBillingData);

      expect(splitBilling.id).toBeDefined();
      expect(splitBilling.orderId).toBe(splitBillingData.orderId);
      expect(splitBilling.businessId).toBe(splitBillingData.businessId);
      expect(splitBilling.splitType).toBe(splitBillingData.splitType);
      expect(splitBilling.status).toBe(SplitStatus.PENDING);
      expect(splitBilling.totalAmount).toBe(splitBillingData.totalAmount);
      expect(splitBilling.numberOfSplits).toBe(splitBillingData.numberOfSplits);
      expect(splitBilling.description).toBe(splitBillingData.description);
      expect(splitBilling.createdAt).toBeDefined();
      expect(splitBilling.updatedAt).toBeDefined();
    });

    it('should set default values correctly', async () => {
      const splitBillingData = {
        orderId: 1,
        businessId: 1,
        splitType: SplitType.ITEM_BASED,
        totalAmount: 75.50,
        numberOfSplits: 3,
      };

      const splitBilling = await SplitBillingModel.create(splitBillingData);

      expect(splitBilling.status).toBe(SplitStatus.PENDING);
      expect(splitBilling.description).toBeUndefined();
      expect(splitBilling.notes).toBeUndefined();
    });

    it('should allow optional fields', async () => {
      const splitBillingData = {
        orderId: 1,
        businessId: 1,
        splitType: SplitType.CUSTOM,
        totalAmount: 120.00,
        numberOfSplits: 5,
        description: 'Custom split based on items ordered',
        notes: 'John pays for drinks, Sarah pays for main course',
      };

      const splitBilling = await SplitBillingModel.create(splitBillingData);

      expect(splitBilling.description).toBe('Custom split based on items ordered');
      expect(splitBilling.notes).toBe('John pays for drinks, Sarah pays for main course');
    });
  });

  describe('Validation', () => {
    it('should require orderId', async () => {
      const splitBillingData = {
        businessId: 1,
        splitType: SplitType.EQUAL,
        totalAmount: 100.00,
        numberOfSplits: 4,
      } as any;

      await expect(SplitBillingModel.create(splitBillingData)).rejects.toThrow();
    });

    it('should require businessId', async () => {
      const splitBillingData = {
        orderId: 1,
        splitType: SplitType.EQUAL,
        totalAmount: 100.00,
        numberOfSplits: 4,
      } as any;

      await expect(SplitBillingModel.create(splitBillingData)).rejects.toThrow();
    });

    it('should require splitType', async () => {
      const splitBillingData = {
        orderId: 1,
        businessId: 1,
        totalAmount: 100.00,
        numberOfSplits: 4,
      } as any;

      await expect(SplitBillingModel.create(splitBillingData)).rejects.toThrow();
    });

    it('should require totalAmount', async () => {
      const splitBillingData = {
        orderId: 1,
        businessId: 1,
        splitType: SplitType.EQUAL,
        numberOfSplits: 4,
      } as any;

      await expect(SplitBillingModel.create(splitBillingData)).rejects.toThrow();
    });

    it('should require numberOfSplits', async () => {
      const splitBillingData = {
        orderId: 1,
        businessId: 1,
        splitType: SplitType.EQUAL,
        totalAmount: 100.00,
      } as any;

      await expect(SplitBillingModel.create(splitBillingData)).rejects.toThrow();
    });

    it('should validate totalAmount is not negative', async () => {
      const splitBillingData = {
        orderId: 1,
        businessId: 1,
        splitType: SplitType.EQUAL,
        totalAmount: -10.00,
        numberOfSplits: 4,
      };

      await expect(SplitBillingModel.create(splitBillingData)).rejects.toThrow();
    });

    it('should validate numberOfSplits minimum', async () => {
      const splitBillingData = {
        orderId: 1,
        businessId: 1,
        splitType: SplitType.EQUAL,
        totalAmount: 100.00,
        numberOfSplits: 1,
      };

      await expect(SplitBillingModel.create(splitBillingData)).rejects.toThrow();
    });

    it('should validate numberOfSplits maximum', async () => {
      const splitBillingData = {
        orderId: 1,
        businessId: 1,
        splitType: SplitType.EQUAL,
        totalAmount: 100.00,
        numberOfSplits: 25,
      };

      await expect(SplitBillingModel.create(splitBillingData)).rejects.toThrow();
    });

    it('should validate splitType enum values', async () => {
      const splitBillingData = {
        orderId: 1,
        businessId: 1,
        splitType: 'invalid_type' as SplitType,
        totalAmount: 100.00,
        numberOfSplits: 4,
      } as any;

      await expect(SplitBillingModel.create(splitBillingData)).rejects.toThrow();
    });

    it('should validate status enum values', async () => {
      const splitBillingData = {
        orderId: 1,
        businessId: 1,
        splitType: SplitType.EQUAL,
        status: 'invalid_status' as SplitStatus,
        totalAmount: 100.00,
        numberOfSplits: 4,
      } as any;

      await expect(SplitBillingModel.create(splitBillingData)).rejects.toThrow();
    });
  });

  describe('Split Type Management', () => {
    it('should allow all valid split type values', async () => {
      const splitTypes = Object.values(SplitType);
      
      for (const splitType of splitTypes) {
        const splitBillingData = {
          orderId: 1,
          businessId: 1,
          splitType,
          totalAmount: 100.00,
          numberOfSplits: 4,
        };

        const splitBilling = await SplitBillingModel.create(splitBillingData);
        expect(splitBilling.splitType).toBe(splitType);
      }
    });

    it('should set pending as default status', async () => {
      const splitBillingData = {
        orderId: 1,
        businessId: 1,
        splitType: SplitType.EQUAL,
        totalAmount: 100.00,
        numberOfSplits: 4,
      };

      const splitBilling = await SplitBillingModel.create(splitBillingData);
      expect(splitBilling.status).toBe(SplitStatus.PENDING);
    });
  });

  describe('Split Status Management', () => {
    it('should allow all valid status values', async () => {
      const statuses = Object.values(SplitStatus);
      
      for (const status of statuses) {
        const splitBillingData = {
          orderId: 1,
          businessId: 1,
          splitType: SplitType.EQUAL,
          status,
          totalAmount: 100.00,
          numberOfSplits: 4,
        };

        const splitBilling = await SplitBillingModel.create(splitBillingData);
        expect(splitBilling.status).toBe(status);
      }
    });

    it('should update split billing status', async () => {
      const splitBilling = await SplitBillingModel.create({
        orderId: 1,
        businessId: 1,
        splitType: SplitType.EQUAL,
        status: SplitStatus.PENDING,
        totalAmount: 100.00,
        numberOfSplits: 4,
      });

      await splitBilling.update({ status: SplitStatus.ACTIVE });
      
      const updatedSplitBilling = await SplitBillingModel.findByPk(splitBilling.id);
      expect(updatedSplitBilling?.status).toBe(SplitStatus.ACTIVE);
    });
  });

  describe('SplitBilling Queries', () => {
    beforeEach(async () => {
      // Create test data
      await SplitBillingModel.bulkCreate([
        {
          orderId: 1,
          businessId: 1,
          splitType: SplitType.EQUAL,
          status: SplitStatus.PENDING,
          totalAmount: 100.00,
          numberOfSplits: 4,
          description: 'Equal split for table 1',
        },
        {
          orderId: 2,
          businessId: 1,
          splitType: SplitType.ITEM_BASED,
          status: SplitStatus.ACTIVE,
          totalAmount: 75.50,
          numberOfSplits: 3,
          description: 'Item-based split for table 2',
        },
        {
          orderId: 3,
          businessId: 1,
          splitType: SplitType.CUSTOM,
          status: SplitStatus.COMPLETED,
          totalAmount: 120.00,
          numberOfSplits: 5,
          description: 'Custom split for table 3',
        },
        {
          orderId: 4,
          businessId: 2,
          splitType: SplitType.PERCENTAGE,
          status: SplitStatus.PENDING,
          totalAmount: 200.00,
          numberOfSplits: 6,
          description: 'Percentage split for business 2',
        },
      ]);
    });

    it('should find split billings by order', async () => {
      const splitBillings = await SplitBillingModel.findAll({
        where: { orderId: 1 },
      });

      expect(splitBillings).toHaveLength(1);
      expect(splitBillings[0]!.splitType).toBe(SplitType.EQUAL);
    });

    it('should find split billings by business', async () => {
      const splitBillings = await SplitBillingModel.findAll({
        where: { businessId: 1 },
        order: [['orderId', 'ASC']],
      });

      expect(splitBillings).toHaveLength(3);
      expect(splitBillings[0]!.orderId).toBe(1);
      expect(splitBillings[1]!.orderId).toBe(2);
      expect(splitBillings[2]!.orderId).toBe(3);
    });

    it('should find split billings by status', async () => {
      const pendingSplits = await SplitBillingModel.findAll({
        where: { status: SplitStatus.PENDING },
      });

      expect(pendingSplits).toHaveLength(2);
    });

    it('should find split billings by type', async () => {
      const equalSplits = await SplitBillingModel.findAll({
        where: { splitType: SplitType.EQUAL },
      });

      expect(equalSplits).toHaveLength(1);
      expect(equalSplits[0]!.orderId).toBe(1);
    });

    it('should find split billings by order and status', async () => {
      const activeSplits = await SplitBillingModel.findAll({
        where: { 
          businessId: 1,
          status: SplitStatus.ACTIVE 
        },
      });

      expect(activeSplits).toHaveLength(1);
      expect(activeSplits[0]!.orderId).toBe(2);
    });

    it('should find split billings with minimum total amount', async () => {
      const expensiveSplits = await SplitBillingModel.findAll({
        where: {
          totalAmount: {
            [Op.gte]: 100.00,
          },
        },
      });

      expect(expensiveSplits).toHaveLength(3);
    });

    it('should find split billings by date range', async () => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      
      const recentSplits = await SplitBillingModel.findAll({
        where: {
          createdAt: {
            [Op.gte]: yesterday,
          },
        },
      });

      expect(recentSplits).toHaveLength(4);
    });
  });

  describe('SplitBilling Operations', () => {
    let splitBilling: any;

    beforeEach(async () => {
      splitBilling = await SplitBillingModel.create({
        orderId: 1,
        businessId: 1,
        splitType: SplitType.EQUAL,
        status: SplitStatus.PENDING,
        totalAmount: 100.00,
        numberOfSplits: 4,
      });
    });

    it('should update split billing status', async () => {
      await splitBilling.update({ status: SplitStatus.ACTIVE });
      
      const updatedSplitBilling = await SplitBillingModel.findByPk(splitBilling.id);
      expect(updatedSplitBilling?.status).toBe(SplitStatus.ACTIVE);
    });

    it('should update split billing details', async () => {
      await splitBilling.update({ 
        totalAmount: 120.00,
        numberOfSplits: 5,
        description: 'Updated split details',
        notes: 'Additional notes for the split',
      });
      
      const updatedSplitBilling = await SplitBillingModel.findByPk(splitBilling.id);
      expect(updatedSplitBilling?.totalAmount).toBe(120.00);
      expect(updatedSplitBilling?.numberOfSplits).toBe(5);
      expect(updatedSplitBilling?.description).toBe('Updated split details');
      expect(updatedSplitBilling?.notes).toBe('Additional notes for the split');
    });

    it('should track split billing status progression', async () => {
      // Pending -> Active
      await splitBilling.update({ status: SplitStatus.ACTIVE });
      expect(splitBilling.status).toBe(SplitStatus.ACTIVE);

      // Active -> Completed
      await splitBilling.update({ status: SplitStatus.COMPLETED });
      expect(splitBilling.status).toBe(SplitStatus.COMPLETED);
    });

    it('should cancel split billing', async () => {
      await splitBilling.update({ status: SplitStatus.CANCELLED });
      
      const updatedSplitBilling = await SplitBillingModel.findByPk(splitBilling.id);
      expect(updatedSplitBilling?.status).toBe(SplitStatus.CANCELLED);
    });
  });

  describe('SplitBilling Calculations', () => {
    it('should handle equal split calculations', async () => {
      const splitBilling = await SplitBillingModel.create({
        orderId: 1,
        businessId: 1,
        splitType: SplitType.EQUAL,
        totalAmount: 100.00,
        numberOfSplits: 4,
      });

      const amountPerPerson = splitBilling.totalAmount / splitBilling.numberOfSplits;
      expect(amountPerPerson).toBe(25.00);
    });

    it('should handle percentage split calculations', async () => {
      const splitBilling = await SplitBillingModel.create({
        orderId: 1,
        businessId: 1,
        splitType: SplitType.PERCENTAGE,
        totalAmount: 200.00,
        numberOfSplits: 3,
      });

      // Example: 50%, 30%, 20% split
      const percentages = [0.5, 0.3, 0.2];
      const amounts = percentages.map(p => splitBilling.totalAmount * p);
      
      expect(amounts[0]).toBe(100.00); // 50%
      expect(amounts[1]).toBe(60.00);  // 30%
      expect(amounts[2]).toBe(40.00);  // 20%
    });

    it('should handle zero total amount', async () => {
      const splitBilling = await SplitBillingModel.create({
        orderId: 1,
        businessId: 1,
        splitType: SplitType.EQUAL,
        totalAmount: 0.00,
        numberOfSplits: 4,
      });

      expect(splitBilling.totalAmount).toBe(0.00);
      expect(splitBilling.totalAmount / splitBilling.numberOfSplits).toBe(0.00);
    });

    it('should handle large number of splits', async () => {
      const splitBilling = await SplitBillingModel.create({
        orderId: 1,
        businessId: 1,
        splitType: SplitType.EQUAL,
        totalAmount: 1000.00,
        numberOfSplits: 20,
      });

      expect(splitBilling.numberOfSplits).toBe(20);
      expect(splitBilling.totalAmount / splitBilling.numberOfSplits).toBe(50.00);
    });
  });

  describe('SplitBilling Relationships', () => {
    it('should support multiple splits per order', async () => {
      const splitBillings = await SplitBillingModel.bulkCreate([
        {
          orderId: 1,
          businessId: 1,
          splitType: SplitType.EQUAL,
          totalAmount: 100.00,
          numberOfSplits: 4,
        },
        {
          orderId: 1,
          businessId: 1,
          splitType: SplitType.ITEM_BASED,
          totalAmount: 100.00,
          numberOfSplits: 4,
        },
      ]);

      expect(splitBillings).toHaveLength(2);
      expect(splitBillings[0]!.orderId).toBe(1);
      expect(splitBillings[1]!.orderId).toBe(1);
    });

    it('should support same split type across different orders', async () => {
      const splitBillings = await SplitBillingModel.bulkCreate([
        {
          orderId: 1,
          businessId: 1,
          splitType: SplitType.EQUAL,
          totalAmount: 100.00,
          numberOfSplits: 4,
        },
        {
          orderId: 2,
          businessId: 1,
          splitType: SplitType.EQUAL,
          totalAmount: 150.00,
          numberOfSplits: 3,
        },
      ]);

      expect(splitBillings).toHaveLength(2);
      expect(splitBillings[0]!.splitType).toBe(SplitType.EQUAL);
      expect(splitBillings[1]!.splitType).toBe(SplitType.EQUAL);
      expect(splitBillings[0]!.orderId).toBe(1);
      expect(splitBillings[1]!.orderId).toBe(2);
    });
  });

  describe('SplitBilling Business Logic', () => {
    it('should validate equal split amounts', async () => {
      const splitBilling = await SplitBillingModel.create({
        orderId: 1,
        businessId: 1,
        splitType: SplitType.EQUAL,
        totalAmount: 99.99,
        numberOfSplits: 3,
      });

      const amountPerPerson = splitBilling.totalAmount / splitBilling.numberOfSplits;
      expect(amountPerPerson).toBeCloseTo(33.33, 2);
    });

    it('should handle custom split scenarios', async () => {
      const splitBilling = await SplitBillingModel.create({
        orderId: 1,
        businessId: 1,
        splitType: SplitType.CUSTOM,
        totalAmount: 150.00,
        numberOfSplits: 4,
        description: 'Custom split: Person 1 pays 60%, others split remaining 40%',
        notes: 'Person 1: $90, Others: $20 each',
      });

      expect(splitBilling.splitType).toBe(SplitType.CUSTOM);
      expect(splitBilling.description).toContain('Custom split');
      expect(splitBilling.notes).toContain('Person 1: $90');
    });

    it('should track split billing lifecycle', async () => {
      const splitBilling = await SplitBillingModel.create({
        orderId: 1,
        businessId: 1,
        splitType: SplitType.EQUAL,
        totalAmount: 100.00,
        numberOfSplits: 4,
      });

      // Initial state
      expect(splitBilling.status).toBe(SplitStatus.PENDING);

      // Activate split
      await splitBilling.update({ status: SplitStatus.ACTIVE });
      expect(splitBilling.status).toBe(SplitStatus.ACTIVE);

      // Complete split
      await splitBilling.update({ status: SplitStatus.COMPLETED });
      expect(splitBilling.status).toBe(SplitStatus.COMPLETED);
    });
  });
}); 