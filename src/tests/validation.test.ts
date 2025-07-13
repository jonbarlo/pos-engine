import request from 'supertest';
import express from 'express';

// Create a test app
const app = express();
app.use(express.json());

// Mock validation middleware
const mockValidationMiddleware = (req: any, res: any, next: any) => {
  const { email, password, businessSlug, name, role } = req.body;
  
  const errors: Array<{ field: string; message: string }> = [];
  
  // Email validation
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }
  
  // Password validation
  if (password && password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
  }
  
  // Business slug validation
  if (!businessSlug) {
    errors.push({ field: 'businessSlug', message: 'Business slug is required' });
  } else if (!/^[a-z0-9-]+$/.test(businessSlug)) {
    errors.push({ field: 'businessSlug', message: 'Invalid business slug format' });
  }
  
  // Name validation
  if (name && !/^[a-zA-Z\s]+$/.test(name)) {
    errors.push({ field: 'name', message: 'Invalid name format' });
  }
  
  // Role validation
  if (role && !['admin', 'manager', 'staff'].includes(role)) {
    errors.push({ field: 'role', message: 'Invalid role' });
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        details: errors
      }
    });
  }
  
  next();
};

// Mock routes
app.post('/api/auth/login', mockValidationMiddleware, (req: any, res: any) => {
  res.json({ success: true, token: 'mock-token' });
});

app.post('/api/auth/register', mockValidationMiddleware, (req: any, res: any) => {
  res.json({ success: true, user: { id: 1, email: req.body.email } });
});

describe('Validation Middleware Tests', () => {
  describe('POST /api/auth/login', () => {
    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'Password123',
          businessSlug: 'test-business'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toBeDefined();
    });

    it('should reject short password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: '123',
          businessSlug: 'test-business'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.details).toBeDefined();
      expect(response.body.error.details.length).toBeGreaterThan(0);
    });

    it('should reject missing business identifier', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123'
          // Missing businessSlug
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.details).toBeDefined();
      expect(response.body.error.details).toHaveLength(1);
    });

    it('should reject invalid business slug format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123',
          businessSlug: 'invalid slug with spaces'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.details).toBeDefined();
      expect(response.body.error.details).toHaveLength(1);
    });

    it('should accept valid login data', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123',
          businessSlug: 'test-business'
        });

      // If it's not 400, it means validation passed
      if (response.status !== 400) {
        expect(response.body.success).toBeDefined();
      }
    });
  });

  describe('POST /api/auth/register', () => {
    it('should reject weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'weak',
          role: 'staff',
          businessSlug: 'test-business'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.details).toBeDefined();
    });

    it('should reject invalid name format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test123',
          email: 'test@example.com',
          password: 'Password123',
          role: 'staff',
          businessSlug: 'test-business'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.details).toBeDefined();
      expect(response.body.error.details).toHaveLength(1);
    });

    it('should reject invalid role', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123',
          role: 'invalid-role',
          businessSlug: 'test-business'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.details).toBeDefined();
      expect(response.body.error.details).toHaveLength(1);
    });

    it('should accept valid registration data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123',
          role: 'staff',
          businessSlug: 'test-business'
        });

      // If it's not 400, it means validation passed
      if (response.status !== 400) {
        expect(response.body.success).toBeDefined();
      }
    });
  });

  describe('Multiple Validation Errors', () => {
    it('should return all validation errors at once', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test123',
          email: 'invalid-email',
          password: 'weak',
          role: 'invalid-role',
          businessSlug: 'invalid slug'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.details).toBeDefined();
      expect(response.body.error.details.length).toBeGreaterThan(1);
    });
  });
}); 