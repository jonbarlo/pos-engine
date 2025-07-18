import request from 'supertest';
import { app } from '../../index';
import { sequelize } from '../../models/sequelize';
import { BusinessModel } from '../../models/BusinessModel';
import { UserModel, UserRole } from '../../models/UserModel';
import { TableModel, TableStatus } from '../../models/TableModel';
import { ReservationModel } from '../../models/ReservationModel';
import bcrypt from 'bcrypt';

describe('Reservation API Endpoints', () => {
  let authToken: string;
  let businessId: number;
  let tableId: number;
  let userId: number;

  beforeAll(async () => {
    // Create test business
    const business = await BusinessModel.create({
      name: 'Test Restaurant',
      slug: 'test-restaurant',
      description: 'Test restaurant for reservations',
      type: 'restaurant',
      isActive: true
    });
    businessId = business.id;

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await UserModel.create({
      businessId,
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      role: UserRole.MANAGER,
      isActive: true
    });
    userId = user.id;

    // Create test table
    const table = await TableModel.create({
      businessId,
      tableNumber: 'T1',
      capacity: 4,
      status: TableStatus.AVAILABLE,
      section: 'Main Floor',
      isActive: true
    });
    tableId = table.id;

    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await ReservationModel.destroy({ where: {} });
    await TableModel.destroy({ where: {} });
    await UserModel.destroy({ where: {} });
    await BusinessModel.destroy({ where: {} });
    await sequelize.close();
  });

  beforeEach(async () => {
    await ReservationModel.destroy({ where: {} });
  });

  describe('GET /api/reservations', () => {
    it('should get all reservations for the business', async () => {
      // Create test reservation
      await ReservationModel.create({
        businessId,
        tableId,
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        partySize: 4,
        reservationDate: '2024-01-15',
        reservationTime: '19:00:00',
        status: 'confirmed',
        duration: 90,
        source: 'phone'
      });

      const response = await request(app)
        .get('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].customerName).toBe('John Doe');
    });

    it('should filter reservations by date', async () => {
      // Create reservations for different dates
      await ReservationModel.create({
        businessId,
        tableId,
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        partySize: 4,
        reservationDate: '2024-01-15',
        reservationTime: '19:00:00',
        status: 'confirmed',
        duration: 90,
        source: 'phone'
      });

      await ReservationModel.create({
        businessId,
        tableId,
        customerName: 'Jane Smith',
        customerPhone: '+1234567891',
        partySize: 2,
        reservationDate: '2024-01-16',
        reservationTime: '20:00:00',
        status: 'pending',
        duration: 90,
        source: 'phone'
      });

      const response = await request(app)
        .get('/api/reservations?date=2024-01-15')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].customerName).toBe('John Doe');
    });
  });

  describe('GET /api/reservations/:id', () => {
    it('should get a specific reservation', async () => {
      const reservation = await ReservationModel.create({
        businessId,
        tableId,
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        partySize: 4,
        reservationDate: '2024-01-15',
        reservationTime: '19:00:00',
        status: 'confirmed',
        duration: 90,
        source: 'phone'
      });

      const response = await request(app)
        .get(`/api/reservations/${reservation.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(reservation.id);
      expect(response.body.data.customerName).toBe('John Doe');
    });

    it('should return 404 for non-existent reservation', async () => {
      const response = await request(app)
        .get('/api/reservations/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/reservations', () => {
    it('should create a new reservation', async () => {
      const reservationData = {
        tableId,
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        customerEmail: 'john@example.com',
        partySize: 4,
        reservationDate: '2024-01-15',
        reservationTime: '19:00:00',
        status: 'pending',
        specialRequests: 'Window seat preferred'
      };

      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reservationData);

      expect(response.status).toBe(201);
      expect(response.body.data.customerName).toBe('John Doe');
      expect(response.body.data.partySize).toBe(4);
      expect(response.body.data.status).toBe('pending');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerName: 'John Doe'
          // Missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should validate party size', async () => {
      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerName: 'John Doe',
          partySize: 25, // Invalid party size
          reservationDate: '2024-01-15',
          reservationTime: '19:00:00'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Party size must be between 1 and 20');
    });
  });

  describe('PUT /api/reservations/:id', () => {
    it('should update a reservation', async () => {
      const reservation = await ReservationModel.create({
        businessId,
        tableId,
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        partySize: 4,
        reservationDate: '2024-01-15',
        reservationTime: '19:00:00',
        status: 'pending',
        duration: 90,
        source: 'phone'
      });

      const updateData = {
        customerName: 'John Smith',
        partySize: 6,
        status: 'confirmed'
      };

      const response = await request(app)
        .put(`/api/reservations/${reservation.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.customerName).toBe('John Smith');
      expect(response.body.data.partySize).toBe(6);
      expect(response.body.data.status).toBe('confirmed');
    });

    it('should return 404 for non-existent reservation', async () => {
      const response = await request(app)
        .put('/api/reservations/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerName: 'John Smith'
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/reservations/:id', () => {
    it('should delete a reservation', async () => {
      const reservation = await ReservationModel.create({
        businessId,
        tableId,
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        partySize: 4,
        reservationDate: '2024-01-15',
        reservationTime: '19:00:00',
        status: 'pending',
        duration: 90,
        source: 'phone'
      });

      const response = await request(app)
        .delete(`/api/reservations/${reservation.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Reservation deleted successfully');

      // Verify reservation is deleted
      const deletedReservation = await ReservationModel.findByPk(reservation.id);
      expect(deletedReservation).toBeNull();
    });

    it('should return 404 for non-existent reservation', async () => {
      const response = await request(app)
        .delete('/api/reservations/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});