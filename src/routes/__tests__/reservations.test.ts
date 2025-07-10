import request from 'supertest';
import express from 'express';
import app from '../../index';
import { initializeAllModels, setupAssociationsForTests } from '../../models';
import DatabaseService from '../../services/databaseService';
import { ReservationModel } from '../../models/ReservationModel';
import { TableModel } from '../../models/TableModel';
import { BusinessModel } from '../../models/BusinessModel';
import { UserModel, UserRole } from '../../models/UserModel';
import reservationRoutes from '../../routes/reservations';
import { authenticateToken } from '../../middleware/auth';
import { getSequelize } from '../../models/index';

// Initialize all models and sync database before running tests
beforeAll(async () => {
  // Initialize models first
  initializeAllModels();
  
  // Then sync database with force to recreate all tables
  await getSequelize().sync({ force: true }); // Force sync to recreate tables
});

// Mock the auth middleware
jest.mock('../../middleware/auth', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    req.user = { businessId: 1, userId: 1, email: 'test@example.com', role: 'manager' };
    next();
  }
}));

app.use(express.json());
app.use('/api/reservations', reservationRoutes);

describe('Reservation Management API', () => {
  let businessId: number;
  let tableId: number;
  let authToken: string;

  // Helper function to get a future date string in YYYY-MM-DD format
  const getFutureDate = (daysFromNow: number = 1): string => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0]!; // Returns YYYY-MM-DD format
  };

  // Helper to get a future date string at midnight
  const getFutureDateMidnight = (daysFromNow: number = 1): string => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0]!; // Returns YYYY-MM-DD format
  };

  beforeAll(async () => {
    // Create test business
    const business = await BusinessModel.create({
      name: 'Test Restaurant',
      slug: `test-restaurant-${Date.now()}`,
      type: 'restaurant',
      taxRate: 8.5,
      currency: 'USD',
      timezone: 'UTC',
    });
    businessId = business.id;

    // Create test table
    const table = await TableModel.create({
      businessId,
      tableNumber: 'A1',
      capacity: 4,
      status: 'available' as any,
      section: 'Main Floor'
    });
    tableId = table.id;

    // Create test user
    const user = await UserModel.create({
      businessId,
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: UserRole.MANAGER
    });

    // Generate auth token
    authToken = 'test-token';
  });

  afterAll(async () => {
    // Clean up test data
    await ReservationModel.destroy({ where: { businessId } });
    await TableModel.destroy({ where: { businessId } });
    await UserModel.destroy({ where: { businessId } });
    await BusinessModel.destroy({ where: { id: businessId } });
  });

  beforeEach(async () => {
    // Clear reservations before each test
    await ReservationModel.destroy({ where: { businessId } });
  });

  describe('GET /api/reservations', () => {
    it('should get all reservations for a business', async () => {
      // Create test reservations
      await ReservationModel.create({
        businessId,
        customerName: 'Alice Smith',
        customerPhone: '555-1111',
        partySize: 2,
        reservationDate: getFutureDate(1),
        reservationTime: '19:00',
        duration: 90,
        source: 'phone'
      });

      await ReservationModel.create({
        businessId,
        customerName: 'Bob Johnson',
        customerPhone: '555-2222',
        partySize: 4,
        reservationDate: getFutureDate(2),
        reservationTime: '20:00',
        duration: 90,
        source: 'online'
      });

      const response = await request(app)
        .get('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.total).toBe(2);
    });

    it('should filter reservations by date', async () => {
      const futureDate = getFutureDate(1);
      
      await ReservationModel.create({
        businessId,
        customerName: 'Alice Smith',
        customerPhone: '555-1111',
        partySize: 2,
        reservationDate: futureDate,
        reservationTime: '19:00',
        duration: 90,
        source: 'phone'
      });

      const response = await request(app)
        .get(`/api/reservations?date=${futureDate}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].customerName).toBe('Alice Smith');
    });

    it('should filter reservations by status', async () => {
      await ReservationModel.create({
        businessId,
        customerName: 'Alice Smith',
        customerPhone: '555-1111',
        partySize: 2,
        reservationDate: getFutureDate(1),
        reservationTime: '19:00',
        status: 'confirmed',
        duration: 90,
        source: 'phone'
      });

      const response = await request(app)
        .get('/api/reservations?status=confirmed')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('confirmed');
    });

    it('should search reservations by customer name', async () => {
      await ReservationModel.create({
        businessId,
        customerName: 'Alice Smith',
        customerPhone: '555-1111',
        partySize: 2,
        reservationDate: getFutureDate(1),
        reservationTime: '19:00',
        duration: 90,
        source: 'phone'
      });

      const response = await request(app)
        .get('/api/reservations?search=Alice')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].customerName).toBe('Alice Smith');
    });
  });

  describe('GET /api/reservations/:id', () => {
    it('should get a specific reservation', async () => {
      const reservation = await ReservationModel.create({
        businessId,
        customerName: 'Alice Smith',
        customerPhone: '555-1111',
        partySize: 2,
        reservationDate: getFutureDate(1),
        reservationTime: '19:00',
        duration: 90,
        source: 'phone'
      });

      const response = await request(app)
        .get(`/api/reservations/${reservation.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(reservation.id);
      expect(response.body.data.customerName).toBe('Alice Smith');
    });

    it('should return 404 for non-existent reservation', async () => {
      const response = await request(app)
        .get('/api/reservations/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/reservations', () => {
    it('should create a new reservation', async () => {
      const reservationData = {
        customerName: 'Alice Smith',
        customerPhone: '555-1111',
        partySize: 2,
        reservationDate: getFutureDate(1),
        reservationTime: '19:00',
        duration: 90,
        source: 'phone'
      };

      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reservationData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.customerName).toBe('Alice Smith');
      expect(response.body.data.partySize).toBe(2);
    });

    it('should create reservation with table assignment', async () => {
      const reservationData = {
        tableId,
        customerName: 'Alice Smith',
        customerPhone: '555-1111',
        partySize: 2,
        reservationDate: getFutureDate(1),
        reservationTime: '19:00',
        duration: 90,
        source: 'phone'
      };

      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reservationData);

      expect(response.status).toBe(201);
      expect(response.body.data.tableId).toBe(tableId);
    });

    it('should prevent overlapping reservations for same table', async () => {
      const futureDateString = getFutureDateMidnight(2); // Two days from now at midnight
      
      // Create first reservation
      await ReservationModel.create({
        businessId,
        tableId,
        customerName: 'Alice Smith',
        customerPhone: '555-1111',
        partySize: 2,
        reservationDate: futureDateString,
        reservationTime: '19:00',
        duration: 90,
        source: 'phone'
      });

      // Print all reservations for this table and date
      const allReservations = await ReservationModel.findAll({
        where: { businessId, tableId, reservationDate: futureDateString }
      });

      // Try to create overlapping reservation (should fail)
      const reservationData = {
        businessId,
        tableId,
        customerName: 'Bob Johnson',
        customerPhone: '555-2222',
        partySize: 3,
        reservationDate: futureDateString, // Use the same date string
        reservationTime: '19:30', // Overlaps with 19:00-20:30
        duration: 90,
        source: 'phone'
      };

      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reservationData);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Missing required fields');
    });
  });

  describe('PATCH /api/reservations/:id/status', () => {
    it('should update reservation status to confirmed', async () => {
      const reservation = await ReservationModel.create({
        businessId,
        customerName: 'Alice Smith',
        customerPhone: '555-1111',
        partySize: 2,
        reservationDate: getFutureDate(1),
        reservationTime: '19:00',
        status: 'confirmed',
        duration: 90,
        source: 'phone'
      });

      const response = await request(app)
        .patch(`/api/reservations/${reservation.id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'confirmed' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('confirmed');
    });
  });
});