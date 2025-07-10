import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { Sequelize, DataTypes } from 'sequelize';
// import { CustomerModel, initializeCustomerModel } from '../../models/CustomerModel';
import { createCustomerRoutes } from '../../routes/customers';
import jwt from 'jsonwebtoken';

// Create test database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false,
});

// Define BusinessModel and UserModel for the test DB
const BusinessModel = sequelize.define('Business', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING,
  slug: DataTypes.STRING,
  type: DataTypes.STRING,
  taxRate: DataTypes.FLOAT,
  currency: DataTypes.STRING,
  timezone: DataTypes.STRING,
}, { tableName: 'businesses' });

const UserModel = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  businessId: DataTypes.INTEGER,
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  password: DataTypes.STRING,
  role: DataTypes.STRING,
}, { tableName: 'users' });

// Initialize CustomerModel for the test DB with restaurant-specific fields
const CustomerModel = sequelize.define('Customer', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  businessId: DataTypes.INTEGER,
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true, len: [1, 100] },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isEmail: true },
  },
  phone: DataTypes.STRING,
  loyaltyPoints: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalSpent: { type: DataTypes.FLOAT, defaultValue: 0 },
  visitCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  preferences: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const raw = this.getDataValue('preferences');
      return raw ? JSON.parse(raw) : undefined;
    },
    set(val) {
      this.setDataValue('preferences', val ? JSON.stringify(val) : null);
    },
  },
  dietaryRestrictions: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const raw = this.getDataValue('dietaryRestrictions');
      return raw ? JSON.parse(raw) : undefined;
    },
    set(val) {
      this.setDataValue('dietaryRestrictions', val ? JSON.stringify(val) : null);
    },
  },
  allergies: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const raw = this.getDataValue('allergies');
      return raw ? JSON.parse(raw) : undefined;
    },
    set(val) {
      this.setDataValue('allergies', val ? JSON.stringify(val) : null);
    },
  },
}, {
  tableName: 'customers',
  indexes: [
    { unique: true, fields: ['businessId', 'email'] },
  ],
});

// Add instance methods to test CustomerModel
// @ts-ignore
CustomerModel.prototype.canBeDeleted = function () {
  return ((this as any).visitCount === 0 && (this as any).totalSpent === 0);
};
// @ts-ignore
CustomerModel.prototype.recordVisit = function (amount = 0) {
  (this as any).visitCount = ((this as any).visitCount || 0) + 1;
  (this as any).totalSpent = ((this as any).totalSpent || 0) + amount;
};
// @ts-ignore
CustomerModel.prototype.addLoyaltyPoints = function (points: number) {
  (this as any).loyaltyPoints = ((this as any).loyaltyPoints || 0) + points;
};
// @ts-ignore
CustomerModel.prototype.getLoyaltyTier = function () {
  const spent = (this as any).totalSpent || 0;
  if (spent >= 1000) return 'platinum';
  if (spent >= 500) return 'gold';
  if (spent >= 100) return 'silver';
  return 'bronze';
};
// @ts-ignore
CustomerModel.prototype.getDiscountPercentage = function () {
  const tier = (this as any).getLoyaltyTier();
  switch (tier) {
    case 'platinum': return 15;
    case 'gold': return 10;
    case 'silver': return 5;
    default: return 0;
  }
};

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

// Add customer routes with test models and mock auth
app.use('/api/customers', createCustomerRoutes(CustomerModel, BusinessModel, mockAuthMiddleware));

describe('Customer API Endpoints', () => {
  let authToken: string;
  let businessId: number;
  let customerId: number;

  beforeAll(async () => {
    // Initialize models
    // initializeCustomerModel(sequelize); // This line is removed as per the edit hint
    
    // Create tables
    await BusinessModel.sync({ force: true });
    await UserModel.sync({ force: true });
    await CustomerModel.sync({ force: true });
    
    // Create test business
    const business = await BusinessModel.create({
      id: 1,
      name: 'Test Restaurant',
      slug: 'test-restaurant',
      type: 'restaurant',
      taxRate: 8.5,
      currency: 'USD',
      timezone: 'UTC',
    });
    businessId = business.get('id') as number;

    // Create test user
    const user = await UserModel.create({
      businessId: business.get('id') as number,
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'manager',
    });

    // Create auth token
    authToken = jwt.sign(
      { userId: user.get('id') as number, businessId: business.get('id') as number, role: user.get('role') as string },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await CustomerModel.destroy({ where: {} });
  });

  describe('GET /api/customers', () => {
    it('should return empty array when no customers exist', async () => {
      const response = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.pagination).toBeDefined();
    });

    it('should return customers with pagination', async () => {
      // Create test customers
      await CustomerModel.bulkCreate([
        { businessId, name: 'Customer 1', email: 'customer1@example.com' },
        { businessId, name: 'Customer 2', email: 'customer2@example.com' },
        { businessId, name: 'Customer 3', email: 'customer3@example.com' },
      ]);

      const response = await request(app)
        .get('/api/customers?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.total).toBe(3);
      expect(response.body.pagination.totalPages).toBe(2);
    });

    it('should filter customers by search term', async () => {
      await CustomerModel.bulkCreate([
        { businessId, name: 'John Doe', email: 'john@example.com' },
        { businessId, name: 'Jane Smith', email: 'jane@example.com' },
        { businessId, name: 'Bob Wilson', email: 'bob@example.com' },
      ]);

      const response = await request(app)
        .get('/api/customers?search=John')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('John Doe');
    });

    it('should filter customers by loyalty tier', async () => {
      await CustomerModel.bulkCreate([
        { businessId, name: 'Bronze Customer', email: 'bronze@example.com', totalSpent: 50 },
        { businessId, name: 'Silver Customer', email: 'silver@example.com', totalSpent: 250 },
        { businessId, name: 'Gold Customer', email: 'gold@example.com', totalSpent: 750 },
      ]);

      const response = await request(app)
        .get('/api/customers?loyaltyTier=silver')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Silver Customer');
    });

    it('should filter customers by active status', async () => {
      await CustomerModel.bulkCreate([
        { businessId, name: 'Active Customer', email: 'active@example.com', isActive: true },
        { businessId, name: 'Inactive Customer', email: 'inactive@example.com', isActive: false },
      ]);

      const response = await request(app)
        .get('/api/customers?isActive=true')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Active Customer');
    });

    it('should require authentication', async () => {
      const response = await request(app).get('/api/customers');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/customers/:id', () => {
    beforeEach(async () => {
      const customer = await CustomerModel.create({
        businessId,
        name: 'Test Customer',
        email: 'test@example.com',
      });
      customerId = customer.get('id') as number;
    });

    it('should return a specific customer', async () => {
      const response = await request(app)
        .get(`/api/customers/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Customer');
      expect(response.body.data.email).toBe('test@example.com');
    });

    it('should return 404 for non-existent customer', async () => {
      const response = await request(app)
        .get('/api/customers/999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should not return customer from different business', async () => {
      // Create customer in different business
      const otherBusiness = await BusinessModel.create({
        name: 'Other Business',
        slug: 'other-business',
        type: 'generic',
        taxRate: 8.5,
        currency: 'USD',
        timezone: 'UTC',
      });
      const otherCustomer = await CustomerModel.create({
        businessId: otherBusiness.get('id') as number,
        name: 'Other Customer',
        email: 'othercustomer@example.com',
      });

      const response = await request(app)
        .get(`/api/customers/${otherCustomer.get('id') as number}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/customers', () => {
    it('should create a new customer with required fields', async () => {
      const customerData = {
        name: 'New Customer',
        email: 'new@example.com',
        phone: '+1234567890',
      };

      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(customerData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('New Customer');
      expect(response.body.data.email).toBe('new@example.com');
      expect(response.body.data.businessId).toBe(businessId);
    });

    it('should create customer with minimal required fields', async () => {
      const customerData = {
        name: 'Minimal Customer',
        email: 'minimal@example.com',
      };

      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(customerData);

      expect(response.status).toBe(201);
      expect(response.body.data.name).toBe('Minimal Customer');
      expect(response.body.data.loyaltyPoints).toBe(0);
      expect(response.body.data.totalSpent).toBe(0);
    });

    it('should allow restaurant-specific fields for restaurant business', async () => {
      const customerData = {
        name: 'Restaurant Customer',
        email: 'restaurant@example.com',
        preferences: ['vegetarian', 'gluten-free'],
        dietaryRestrictions: ['no-dairy'],
        allergies: ['nuts'],
      };

      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(customerData);

      expect(response.status).toBe(201);
      expect(response.body.data.preferences).toEqual(['vegetarian', 'gluten-free']);
      expect(response.body.data.dietaryRestrictions).toEqual(['no-dairy']);
      expect(response.body.data.allergies).toEqual(['nuts']);
    });

    it('should reject invalid email format', async () => {
      const customerData = {
        name: 'Invalid Email Customer',
        email: 'invalid-email',
      };

      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(customerData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject empty name', async () => {
      const customerData = {
        name: '',
        email: 'test@example.com',
      };

      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(customerData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should enforce unique email per business', async () => {
      // Create first customer
      await CustomerModel.create({
        businessId,
        name: 'First Customer',
        email: 'duplicate@example.com',
      });

      // Try to create second customer with same email
      const customerData = {
        name: 'Second Customer',
        email: 'duplicate@example.com',
      };

      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(customerData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/customers/:id', () => {
    beforeEach(async () => {
      const customer = await CustomerModel.create({
        businessId,
        name: 'Update Customer',
        email: 'update@example.com',
      });
      customerId = customer.get('id') as number;
    });

    it('should update customer successfully', async () => {
      const updateData = {
        name: 'Updated Customer',
        phone: '+9876543210',
      };

      const response = await request(app)
        .put(`/api/customers/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Customer');
      expect(response.body.data.phone).toBe('+9876543210');
    });

    it('should return 404 for non-existent customer', async () => {
      const response = await request(app)
        .put('/api/customers/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated' });

      expect(response.status).toBe(404);
    });

    it('should reject invalid data', async () => {
      const response = await request(app)
        .put(`/api/customers/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'invalid-email' });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/customers/:id', () => {
    beforeEach(async () => {
      const customer = await CustomerModel.create({
        businessId,
        name: 'Delete Customer',
        email: 'delete@example.com',
      });
      customerId = customer.get('id') as number;
    });

    it('should delete customer successfully', async () => {
      const response = await request(app)
        .delete(`/api/customers/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify customer is deleted
      const deletedCustomer = await CustomerModel.findByPk(customerId);
      expect(deletedCustomer).toBeNull();
    });

    it('should not delete customer with visit history', async () => {
      // Update customer to have visit history
      await CustomerModel.update(
        { visitCount: 5, totalSpent: 100 },
        { where: { id: customerId } }
      );

      const response = await request(app)
        .delete(`/api/customers/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Cannot delete customer');
    });

    it('should return 404 for non-existent customer', async () => {
      const response = await request(app)
        .delete('/api/customers/999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/customers/:id/record-visit', () => {
    beforeEach(async () => {
      const customer = await CustomerModel.create({
        businessId,
        name: 'Visit Customer',
        email: 'visit@example.com',
        visitCount: 0,
        totalSpent: 0,
      });
      customerId = customer.get('id') as number;
    });

    it('should record visit successfully', async () => {
      const visitData = {
        amount: 75.50,
        loyaltyPointsEarned: 10,
      };

      const response = await request(app)
        .post(`/api/customers/${customerId}/record-visit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(visitData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.visitCount).toBe(1);
      expect(response.body.data.totalSpent).toBe(75.50);
      expect(response.body.data.loyaltyPoints).toBe(10);
    });

    it('should record visit with default values', async () => {
      const response = await request(app)
        .post(`/api/customers/${customerId}/record-visit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.data.visitCount).toBe(1);
      expect(response.body.data.totalSpent).toBe(0);
    });
  });

  describe('POST /api/customers/:id/add-loyalty-points', () => {
    beforeEach(async () => {
      const customer = await CustomerModel.create({
        businessId,
        name: 'Loyalty Customer',
        email: 'loyalty@example.com',
        loyaltyPoints: 50,
      });
      customerId = customer.get('id') as number;
    });

    it('should add loyalty points successfully', async () => {
      const response = await request(app)
        .post(`/api/customers/${customerId}/add-loyalty-points`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ points: 25 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.loyaltyPoints).toBe(75);
    });

    it('should reject invalid points', async () => {
      const response = await request(app)
        .post(`/api/customers/${customerId}/add-loyalty-points`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ points: -10 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/customers/:id/loyalty-info', () => {
    beforeEach(async () => {
      const customer = await CustomerModel.create({
        businessId,
        name: 'Loyalty Info Customer',
        email: 'loyaltyinfo@example.com',
        loyaltyPoints: 150,
        totalSpent: 300,
        visitCount: 8,
      });
      customerId = customer.get('id') as number;
    });

    it('should return loyalty information', async () => {
      const response = await request(app)
        .get(`/api/customers/${customerId}/loyalty-info`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.loyaltyPoints).toBe(150);
      expect(response.body.data.totalSpent).toBe(300);
      expect(response.body.data.visitCount).toBe(8);
      expect(response.body.data.loyaltyTier).toBe('silver');
      expect(response.body.data.discountPercentage).toBe(5);
    });
  });

  describe('GET /api/customers/stats/overview', () => {
    beforeEach(async () => {
      await CustomerModel.bulkCreate([
        {
          businessId,
          name: 'Customer 1',
          email: 'stats1@example.com',
          loyaltyPoints: 100,
          totalSpent: 200,
          visitCount: 5,
          isActive: true,
        },
        {
          businessId,
          name: 'Customer 2',
          email: 'stats2@example.com',
          loyaltyPoints: 50,
          totalSpent: 100,
          visitCount: 2,
          isActive: true,
        },
        {
          businessId,
          name: 'Customer 3',
          email: 'stats3@example.com',
          loyaltyPoints: 0,
          totalSpent: 0,
          visitCount: 0,
          isActive: false,
        },
      ]);
    });

    it('should return customer statistics', async () => {
      const response = await request(app)
        .get('/api/customers/stats/overview')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalCustomers).toBe(3);
      expect(response.body.data.activeCustomers).toBe(2);
      expect(response.body.data.totalLoyaltyPoints).toBe(150);
      expect(response.body.data.totalSpent).toBe(300);
      expect(response.body.data.topCustomers).toHaveLength(3);
    });
  });
}); 