import { Sequelize, DataTypes, Op } from 'sequelize';
import { CustomerModel, initializeCustomerModel, CustomerCreationAttributes } from '../CustomerModel';

// Create in-memory SQLite database for testing
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false,
});

// Mock Business model for foreign key constraint
const BusinessModel = sequelize.define('Business', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: DataTypes.STRING,
  slug: DataTypes.STRING,
  type: DataTypes.STRING,
}, { tableName: 'businesses' });

describe('CustomerModel', () => {
  beforeAll(async () => {
    // Initialize models
    initializeCustomerModel(sequelize);
    
    // Create tables
    await BusinessModel.sync({ force: true });
    await CustomerModel.sync({ force: true });
    
    // Create test businesses
    await BusinessModel.bulkCreate([
      {
        id: 1,
        name: 'Test Restaurant',
        slug: 'test-restaurant',
        type: 'restaurant',
      },
      {
        id: 2,
        name: 'Test Business 2',
        slug: 'test-business-2',
        type: 'generic',
      },
    ]);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await CustomerModel.destroy({ where: {} });
  });

  describe('Creation and Validation', () => {
    it('should create a customer with required fields', async () => {
      const customerData: CustomerCreationAttributes = {
        businessId: 1,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
      };

      const customer = await CustomerModel.create(customerData);
      
      expect(customer.id).toBeDefined();
      expect(customer.name).toBe('John Doe');
      expect(customer.email).toBe('john@example.com');
      expect(customer.phone).toBe('+1234567890');
      expect(customer.loyaltyPoints).toBe(0);
      expect(customer.totalSpent).toBe(0);
      expect(customer.visitCount).toBe(0);
      expect(customer.isActive).toBe(true);
    });

    it('should create a customer with minimal required fields', async () => {
      const customerData: CustomerCreationAttributes = {
        businessId: 1,
        name: 'Jane Smith',
      };

      const customer = await CustomerModel.create(customerData);
      
      expect(customer.id).toBeDefined();
      expect(customer.name).toBe('Jane Smith');
      expect(customer.email).toBeUndefined();
      expect(customer.phone).toBeUndefined();
      expect(customer.loyaltyPoints).toBe(0);
      expect(customer.totalSpent).toBe(0);
      expect(customer.visitCount).toBe(0);
    });

    it('should validate email format', async () => {
      const customerData: CustomerCreationAttributes = {
        businessId: 1,
        name: 'Test Customer',
        email: 'invalid-email',
      };

      await expect(CustomerModel.create(customerData)).rejects.toThrow();
    });

    it('should validate name length', async () => {
      const customerData: CustomerCreationAttributes = {
        businessId: 1,
        name: '', // Empty name
      };

      await expect(CustomerModel.create(customerData)).rejects.toThrow();
    });

    it('should validate date of birth is in the past', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const customerData: CustomerCreationAttributes = {
        businessId: 1,
        name: 'Test Customer',
        dateOfBirth: futureDate,
      };

      await expect(CustomerModel.create(customerData)).rejects.toThrow();
    });

    it('should validate loyalty points are non-negative', async () => {
      const customerData: CustomerCreationAttributes = {
        businessId: 1,
        name: 'Test Customer',
        loyaltyPoints: -10,
      };

      await expect(CustomerModel.create(customerData)).rejects.toThrow();
    });
  });

  describe('Business Logic Methods', () => {
    let customer: CustomerModel;

    beforeEach(async () => {
      customer = await CustomerModel.create({
        businessId: 1,
        name: 'Test Customer',
        loyaltyPoints: 100,
        totalSpent: 250,
        visitCount: 5,
      });
    });

    it('should add loyalty points', () => {
      const initialPoints = customer.loyaltyPoints;
      customer.addLoyaltyPoints(50);
      
      expect(customer.loyaltyPoints).toBe(initialPoints + 50);
    });

    it('should record a visit', () => {
      const initialVisitCount = customer.visitCount;
      const initialTotalSpent = customer.totalSpent;
      const initialLastVisit = customer.lastVisit;
      
      customer.recordVisit(75.50);
      
      expect(customer.visitCount).toBe(initialVisitCount + 1);
      expect(customer.totalSpent).toBe(initialTotalSpent + 75.50);
      expect(customer.lastVisit).toBeInstanceOf(Date);
      expect(customer.lastVisit).not.toEqual(initialLastVisit);
    });

    it('should update preferences', () => {
      const preferences = ['vegetarian', 'gluten-free', 'no-dairy'];
      customer.updatePreferences(preferences);
      
      expect(customer.preferences).toEqual(preferences);
    });

    it('should determine loyalty tier correctly', () => {
      // Test bronze tier
      customer.totalSpent = 50;
      expect(customer.getLoyaltyTier()).toBe('bronze');

      // Test silver tier
      customer.totalSpent = 150;
      expect(customer.getLoyaltyTier()).toBe('silver');

      // Test gold tier
      customer.totalSpent = 600;
      expect(customer.getLoyaltyTier()).toBe('gold');

      // Test platinum tier
      customer.totalSpent = 1200;
      expect(customer.getLoyaltyTier()).toBe('platinum');
    });

    it('should return correct discount percentage', () => {
      // Test bronze tier (0% discount)
      customer.totalSpent = 50;
      expect(customer.getDiscountPercentage()).toBe(0);

      // Test silver tier (5% discount)
      customer.totalSpent = 150;
      expect(customer.getDiscountPercentage()).toBe(5);

      // Test gold tier (10% discount)
      customer.totalSpent = 600;
      expect(customer.getDiscountPercentage()).toBe(10);

      // Test platinum tier (15% discount)
      customer.totalSpent = 1200;
      expect(customer.getDiscountPercentage()).toBe(15);
    });

    it('should determine if customer can be deleted', () => {
      // Customer with no visits and no spending
      customer.visitCount = 0;
      customer.totalSpent = 0;
      expect(customer.canBeDeleted()).toBe(true);

      // Customer with visits but no spending
      customer.visitCount = 5;
      customer.totalSpent = 0;
      expect(customer.canBeDeleted()).toBe(false);

      // Customer with spending but no visits
      customer.visitCount = 0;
      customer.totalSpent = 100;
      expect(customer.canBeDeleted()).toBe(false);

      // Customer with both visits and spending
      customer.visitCount = 5;
      customer.totalSpent = 100;
      expect(customer.canBeDeleted()).toBe(false);
    });
  });

  describe('Database Operations', () => {
    it('should find customers by business ID', async () => {
      await CustomerModel.bulkCreate([
        { businessId: 1, name: 'Customer 1' },
        { businessId: 1, name: 'Customer 2' },
        { businessId: 2, name: 'Customer 3' },
      ]);

      const customers = await CustomerModel.findAll({
        where: { businessId: 1 },
      });

      expect(customers).toHaveLength(2);
      expect(customers[0]?.businessId).toBe(1);
      expect(customers[1]?.businessId).toBe(1);
    });

    it('should find active customers only', async () => {
      await CustomerModel.bulkCreate([
        { businessId: 1, name: 'Active Customer', isActive: true },
        { businessId: 1, name: 'Inactive Customer', isActive: false },
      ]);

      const activeCustomers = await CustomerModel.findAll({
        where: { businessId: 1, isActive: true },
      });

      expect(activeCustomers).toHaveLength(1);
      expect(activeCustomers[0]?.name).toBe('Active Customer');
    });

    it('should handle JSON preferences correctly', async () => {
      const preferences = ['vegetarian', 'gluten-free'];
      const customer = await CustomerModel.create({
        businessId: 1,
        name: 'Test Customer',
        preferences,
      });

      expect(customer.preferences).toEqual(preferences);

      // Fetch from database to ensure JSON serialization works
      const fetchedCustomer = await CustomerModel.findByPk(customer.id);
      expect(fetchedCustomer?.preferences).toEqual(preferences);
    });

    it('should enforce unique email per business', async () => {
      await CustomerModel.create({
        businessId: 1,
        name: 'Customer 1',
        email: 'test@example.com',
      });

      await expect(
        CustomerModel.create({
          businessId: 1,
          name: 'Customer 2',
          email: 'test@example.com',
        })
      ).rejects.toThrow();
    });

    it('should enforce unique phone per business', async () => {
      await CustomerModel.create({
        businessId: 1,
        name: 'Customer 1',
        phone: '+1234567890',
      });

      await expect(
        CustomerModel.create({
          businessId: 1,
          name: 'Customer 2',
          phone: '+1234567890',
        })
      ).rejects.toThrow();
    });

    it('should allow same email/phone across different businesses', async () => {
      await CustomerModel.create({
        businessId: 1,
        name: 'Customer 1',
        email: 'test@example.com',
        phone: '+1234567890',
      });

      const customer2 = await CustomerModel.create({
        businessId: 2,
        name: 'Customer 2',
        email: 'test@example.com',
        phone: '+1234567890',
      });

      expect(customer2.id).toBeDefined();
    });
  });

  describe('Queries and Filters', () => {
    beforeEach(async () => {
      await CustomerModel.bulkCreate([
        {
          businessId: 1,
          name: 'John Doe',
          email: 'john@example.com',
          loyaltyPoints: 100,
          totalSpent: 250,
          visitCount: 5,
          isActive: true,
        },
        {
          businessId: 1,
          name: 'Jane Smith',
          email: 'jane@example.com',
          loyaltyPoints: 500,
          totalSpent: 1200,
          visitCount: 15,
          isActive: true,
        },
        {
          businessId: 1,
          name: 'Bob Wilson',
          email: 'bob@example.com',
          loyaltyPoints: 50,
          totalSpent: 75,
          visitCount: 2,
          isActive: false,
        },
      ]);
    });

    it('should find customers by loyalty points range', async () => {
      const highLoyaltyCustomers = await CustomerModel.findAll({
        where: {
          businessId: 1,
          loyaltyPoints: {
            [Op.gte]: 100,
          },
        },
      });

      expect(highLoyaltyCustomers).toHaveLength(2);
    });

    it('should find customers by total spent range', async () => {
      const highSpenders = await CustomerModel.findAll({
        where: {
          businessId: 1,
          totalSpent: {
            [Op.gte]: 200,
          },
        },
      });

      expect(highSpenders).toHaveLength(2);
    });

    it('should find customers by name search', async () => {
      const johnCustomers = await CustomerModel.findAll({
        where: {
          businessId: 1,
          name: {
            [Op.like]: '%John%',
          },
        },
      });

      expect(johnCustomers).toHaveLength(1);
      expect(johnCustomers[0]?.name).toBe('John Doe');
    });
  });
}); 