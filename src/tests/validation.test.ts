import request from 'supertest';
import app from '../index';
import { logger } from '../utils/logger';

describe('Validation Middleware Tests', () => {
    describe('POST /api/auth/login', () => {
        it('should reject invalid email format', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'invalid-email',
                    password: 'password123',
                    businessId: 1
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('VALIDATION_ERROR');
            expect(response.body.error.details).toBeDefined();
            expect(response.body.error.details).toHaveLength(1);
            expect(response.body.error.details[0].field).toBe('email');
            expect(response.body.error.details[0].message).toBe('Please provide a valid email address');
        });

        it('should reject short password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: '123',
                    businessId: 1
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.details).toBeDefined();
            expect(response.body.error.details.length).toBeGreaterThan(0);
            
            // Should have password validation errors
            const passwordErrors = response.body.error.details.filter((detail: any) => detail.field === 'password');
            expect(passwordErrors.length).toBeGreaterThan(0);
            expect(passwordErrors.some((error: any) => error.message.includes('at least 6 characters'))).toBe(true);
        });

        it('should reject missing business identifier', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.details).toBeDefined();
            expect(response.body.error.details).toHaveLength(1);
            expect(response.body.error.details[0].message).toBe('Either businessId or businessSlug is required');
        });

        it('should reject invalid business slug format', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                    businessSlug: 'invalid slug with spaces'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.details).toBeDefined();
            expect(response.body.error.details).toHaveLength(1);
            expect(response.body.error.details[0].field).toBe('businessSlug');
            expect(response.body.error.details[0].message).toBe('Business slug can only contain lowercase letters, numbers, and hyphens');
        });

        it('should accept valid login data', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin@demo.com',
                    password: 'admin123',
                    businessSlug: 'demo-restaurant'
                });

            // This should pass validation but may fail authentication (which is expected)
            expect(response.status).not.toBe(400);
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
                    businessId: 1
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.details).toBeDefined();
            
            // Should have multiple password validation errors
            const passwordErrors = response.body.error.details.filter((detail: any) => detail.field === 'password');
            expect(passwordErrors.length).toBeGreaterThan(0);
        });

        it('should reject invalid name format', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test123User!@#',
                    email: 'test@example.com',
                    password: 'StrongPass123!',
                    businessId: 1
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.details).toBeDefined();
            expect(response.body.error.details).toHaveLength(1);
            expect(response.body.error.details[0].field).toBe('name');
            expect(response.body.error.details[0].message).toBe('Name can only contain letters, spaces, hyphens, and apostrophes');
        });

        it('should reject invalid role', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'StrongPass123!',
                    businessId: 1,
                    role: 'invalid-role'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.details).toBeDefined();
            expect(response.body.error.details).toHaveLength(1);
            expect(response.body.error.details[0].field).toBe('role');
            expect(response.body.error.details[0].message).toBe('Role must be one of: admin, cashier, manager');
        });

        it('should accept valid registration data', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'newuser@example.com',
                    password: 'StrongPass123!',
                    businessId: 1,
                    role: 'cashier'
                });

            // This should pass validation but may fail due to business logic (which is expected)
            expect(response.status).not.toBe(400);
            // If it's not 400, it means validation passed
            if (response.status !== 400) {
                expect(response.body.success).toBeDefined();
            }
        });
    });

    describe('Input Sanitization', () => {
        it('should normalize email addresses', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: '  TEST@EXAMPLE.COM  ',
                    password: 'password123',
                    businessId: 1
                });

            // Should pass validation (email will be normalized)
            expect(response.status).not.toBe(400);
        });

        it('should trim whitespace from names', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: '  Test User  ',
                    email: 'test@example.com',
                    password: 'StrongPass123!',
                    businessId: 1
                });

            // Should pass validation (name will be trimmed)
            expect(response.status).not.toBe(400);
        });
    });

    describe('Multiple Validation Errors', () => {
        it('should return all validation errors at once', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'T', // Too short
                    email: 'invalid-email', // Invalid format
                    password: 'weak', // Too weak
                    businessId: -1 // Invalid ID
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.details).toBeDefined();
            expect(response.body.error.details.length).toBeGreaterThan(1);
            
            // Should have multiple validation errors
            const fieldNames = response.body.error.details.map((detail: any) => detail.field);
            expect(fieldNames).toContain('name');
            expect(fieldNames).toContain('email');
            expect(fieldNames).toContain('password');
            expect(fieldNames).toContain('businessId');
        });
    });
}); 