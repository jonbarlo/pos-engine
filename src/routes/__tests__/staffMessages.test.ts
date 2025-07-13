import request from 'supertest';
import app from '../../index';
import { StaffMessageModel, MessageType, RecipientType, MessageStatus } from '../../models/StaffMessageModel';
import { UserModel, UserRole } from '../../models/UserModel';
import { BusinessModel } from '../../models/BusinessModel';
import jwt from 'jsonwebtoken';

describe('Staff Messages API', () => {
  let authToken: string;
  let businessId: number;
  let userId: number;
  let testMessageId: number;

  beforeAll(async () => {
    // Create test business
    const business = await BusinessModel.create({
      name: 'Test Restaurant',
      slug: 'test-restaurant',
      type: 'restaurant',
      taxRate: 0.10,
      currency: 'USD',
      timezone: 'UTC'
    });
    businessId = business.id;

    // Create test user
    const user = await UserModel.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      businessId: businessId,
      role: UserRole.MANAGER
    });
    userId = user.id;

    // Create auth token directly
    authToken = jwt.sign(
      { userId: user.id, businessId: business.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await StaffMessageModel.destroy({ where: {} });
    await UserModel.destroy({ where: {} });
    await BusinessModel.destroy({ where: {} });
  });

  describe('POST /api/staff-messages', () => {
    it('should create a new staff message', async () => {
      const messageData = {
        messageType: MessageType.ANNOUNCEMENT,
        title: 'Test Announcement',
        content: 'This is a test announcement',
        recipientType: RecipientType.ALL,
        priority: 'normal'
      };

      const response = await request(app)
        .post('/api/staff-messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send(messageData);

      if (response.status !== 201) {
        console.log('Response status:', response.status);
        console.log('Response body:', response.body);
      }

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Announcement');
      expect(response.body.businessId).toBe(businessId);
      expect(response.body.senderId).toBe(userId);

      testMessageId = response.body.id;
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/staff-messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/staff-messages')
        .send({ title: 'Test' });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/staff-messages', () => {
    it('should get all staff messages for business', async () => {
      const response = await request(app)
        .get('/api/staff-messages')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should filter messages by query parameters', async () => {
      const response = await request(app)
        .get('/api/staff-messages?messageType=announcement')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/staff-messages/:id', () => {
    it('should get a specific staff message', async () => {
      const response = await request(app)
        .get(`/api/staff-messages/${testMessageId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testMessageId);
    });

    it('should return 404 for non-existent message', async () => {
      const response = await request(app)
        .get('/api/staff-messages/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid message ID', async () => {
      const response = await request(app)
        .get('/api/staff-messages/invalid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/staff-messages/:id', () => {
    it('should update a staff message', async () => {
      const updateData = {
        title: 'Updated Title',
        content: 'Updated content'
      };

      const response = await request(app)
        .put(`/api/staff-messages/${testMessageId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Title');
      expect(response.body.content).toBe('Updated content');
    });

    it('should return 404 for non-existent message', async () => {
      const response = await request(app)
        .put('/api/staff-messages/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Test' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/staff-messages/:id', () => {
    it('should delete a staff message', async () => {
      const response = await request(app)
        .delete(`/api/staff-messages/${testMessageId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });

    it('should return 404 for non-existent message', async () => {
      const response = await request(app)
        .delete('/api/staff-messages/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/staff-messages/user/me', () => {
    it('should get messages for current user', async () => {
      const response = await request(app)
        .get('/api/staff-messages/user/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/staff-messages/:id/read', () => {
    beforeEach(async () => {
      // Create a new message for testing
      const message = await StaffMessageModel.create({
        businessId,
        senderId: userId,
        senderName: 'test@example.com',
        messageType: MessageType.ANNOUNCEMENT,
        title: 'Test Read',
        content: 'Test content',
        recipientType: RecipientType.ALL,
        status: MessageStatus.SENT,
        priority: 'normal'
      });
      testMessageId = message.id;
    });

    it('should mark message as read', async () => {
      const response = await request(app)
        .post(`/api/staff-messages/${testMessageId}/read`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/staff-messages/:id/acknowledge', () => {
    it('should mark message as acknowledged', async () => {
      const response = await request(app)
        .post(`/api/staff-messages/${testMessageId}/acknowledge`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/staff-messages/user/me/unread-count', () => {
    it('should get unread message count', async () => {
      const response = await request(app)
        .get('/api/staff-messages/user/me/unread-count')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('unreadCount');
      expect(typeof response.body.unreadCount).toBe('number');
    });
  });

  describe('GET /api/staff-messages/active', () => {
    it('should get active messages for user role', async () => {
      const response = await request(app)
        .get('/api/staff-messages/active')
        .set('Authorization', `Bearer ${authToken}`);

      if (response.status !== 200) {
        console.log('Response status:', response.status);
        console.log('Response body:', response.body);
      }

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
}); 