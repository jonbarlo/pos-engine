import { AuthController } from './authController';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserService } from '../services/userService';
import { BusinessService } from '../services/businessService';
import { AuthService } from '../services/authService';

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../services/userService');
jest.mock('../services/businessService');
jest.mock('../services/authService');
jest.mock('../utils/logger', () => ({
    logger: jest.fn(),
}));

describe('AuthController', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockSend: jest.Mock;
    let mockStatus: jest.Mock;
    let mockJson: jest.Mock;

    beforeEach(() => {
        mockSend = jest.fn();
        mockStatus = jest.fn().mockReturnThis();
        mockJson = jest.fn();
        mockRequest = {};
        mockResponse = {
            send: mockSend,
            status: mockStatus,
            json: mockJson,
        };
        
        // Clear all mocks
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            // Arrange
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                businessId: 1
            };
            mockRequest.body = userData;
            
            const mockResult = {
                message: 'User registered successfully',
                user: {
                    id: 3,
                    businessId: 1,
                    name: userData.name,
                    email: userData.email,
                    role: 'cashier',
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                business: {
                    id: 1,
                    name: 'Test Business',
                    slug: 'test-business'
                },
                token: 'mockToken'
            };

            (AuthService.register as jest.Mock).mockResolvedValue(mockResult);

            // Act
            await AuthController.register(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(AuthService.register).toHaveBeenCalledWith({
                name: userData.name,
                email: userData.email,
                password: userData.password,
                businessId: userData.businessId,
                businessSlug: undefined,
                role: undefined
            });
            expect(mockStatus).toHaveBeenCalledWith(201);
            expect(mockJson).toHaveBeenCalledWith(mockResult);
        });

        it('should return error if business not found', async () => {
            // Arrange
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                businessId: 999
            };
            mockRequest.body = userData;
            
            const { NotFoundError } = require('../utils/errors');
            (AuthService.register as jest.Mock).mockRejectedValue(new NotFoundError('Business not found or inactive'));

            // Act
            await AuthController.register(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(AuthService.register).toHaveBeenCalledWith({
                name: userData.name,
                email: userData.email,
                password: userData.password,
                businessId: userData.businessId,
                businessSlug: undefined,
                role: undefined
            });
            // The error should be caught by asyncHandler and handled by error middleware
            // We can't test the response here since it's handled by middleware
        });

        it('should return error if user already exists in business', async () => {
            // Arrange
            const userData = {
                name: 'Test User',
                email: 'existing@example.com',
                password: 'password123',
                businessId: 1
            };
            mockRequest.body = userData;
            
            const { ConflictError } = require('../utils/errors');
            (AuthService.register as jest.Mock).mockRejectedValue(new ConflictError('User with this email already exists in this business'));

            // Act
            await AuthController.register(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(AuthService.register).toHaveBeenCalledWith({
                name: userData.name,
                email: userData.email,
                password: userData.password,
                businessId: userData.businessId,
                businessSlug: undefined,
                role: undefined
            });
        });

        it('should return error if businessId is missing', async () => {
            // Arrange
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            };
            mockRequest.body = userData;
            
            const { ValidationError } = require('../utils/errors');
            (AuthService.register as jest.Mock).mockRejectedValue(new ValidationError('Business ID or business slug is required'));

            // Act
            await AuthController.register(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(AuthService.register).toHaveBeenCalledWith({
                name: userData.name,
                email: userData.email,
                password: userData.password,
                businessId: undefined,
                businessSlug: undefined,
                role: undefined
            });
        });

        it('should allow admin registration when no admin exists', async () => {
            // Arrange
            const userData = {
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'password123',
                businessId: 1,
                role: 'admin'
            };
            mockRequest.body = userData;
            
            const mockResult = {
                message: 'User registered successfully',
                user: {
                    id: 1,
                    businessId: 1,
                    name: userData.name,
                    email: userData.email,
                    role: 'admin',
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                business: {
                    id: 1,
                    name: 'Test Business',
                    slug: 'test-business'
                },
                token: 'mockToken'
            };

            (AuthService.register as jest.Mock).mockResolvedValue(mockResult);

            // Act
            await AuthController.register(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(AuthService.register).toHaveBeenCalledWith({
                name: userData.name,
                email: userData.email,
                password: userData.password,
                businessId: userData.businessId,
                businessSlug: undefined,
                role: userData.role
            });
            expect(mockStatus).toHaveBeenCalledWith(201);
            expect(mockJson).toHaveBeenCalledWith(mockResult);
        });

        it('should reject admin registration when admin already exists', async () => {
            // Arrange
            const userData = {
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'password123',
                businessId: 1,
                role: 'admin'
            };
            mockRequest.body = userData;
            
            const { ConflictError } = require('../utils/errors');
            (AuthService.register as jest.Mock).mockRejectedValue(new ConflictError('Admin user already exists. Only one admin can be registered via API.'));

            // Act
            await AuthController.register(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(AuthService.register).toHaveBeenCalledWith({
                name: userData.name,
                email: userData.email,
                password: userData.password,
                businessId: userData.businessId,
                businessSlug: undefined,
                role: userData.role
            });
        });

        it('should register non-admin user normally when admin exists', async () => {
            // Arrange
            const userData = {
                name: 'Regular User',
                email: 'user@example.com',
                password: 'password123',
                businessId: 1
            };
            mockRequest.body = userData;
            
            const mockResult = {
                message: 'User registered successfully',
                user: {
                    id: 2,
                    businessId: 1,
                    name: userData.name,
                    email: userData.email,
                    role: 'cashier',
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                business: {
                    id: 1,
                    name: 'Test Business',
                    slug: 'test-business'
                },
                token: 'mockToken'
            };

            (AuthService.register as jest.Mock).mockResolvedValue(mockResult);

            // Act
            await AuthController.register(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(AuthService.register).toHaveBeenCalledWith({
                name: userData.name,
                email: userData.email,
                password: userData.password,
                businessId: userData.businessId,
                businessSlug: undefined,
                role: undefined
            });
            expect(mockStatus).toHaveBeenCalledWith(201);
            expect(mockJson).toHaveBeenCalledWith(mockResult);
        });
    });

    describe('login', () => {
        it('should login user successfully with valid credentials', async () => {
            // Arrange
            const loginData = {
                email: 'test@example.com',
                password: 'password123',
                businessId: 1
            };
            mockRequest.body = loginData;
            
            const mockResult = {
                message: 'Login successful',
                user: {
                    id: 1,
                    businessId: 1,
                    name: 'Test User',
                    email: 'test@example.com',
                    role: 'cashier',
                    isActive: true
                },
                business: {
                    id: 1,
                    name: 'Test Business',
                    slug: 'test-business'
                },
                token: 'mockToken'
            };

            (AuthService.login as jest.Mock).mockResolvedValue(mockResult);

            // Act
            await AuthController.login(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(AuthService.login).toHaveBeenCalledWith({
                email: loginData.email,
                password: loginData.password,
                businessId: loginData.businessId,
                businessSlug: undefined
            });
            expect(mockJson).toHaveBeenCalledWith(mockResult);
        });

        it('should return error for invalid credentials', async () => {
            // Arrange
            const loginData = {
                email: 'wrong@example.com',
                password: 'wrongpassword',
                businessId: 1
            };
            mockRequest.body = loginData;
            
            const { AuthenticationError } = require('../utils/errors');
            (AuthService.login as jest.Mock).mockRejectedValue(new AuthenticationError('Invalid email or password'));

            // Act
            await AuthController.login(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(AuthService.login).toHaveBeenCalledWith({
                email: loginData.email,
                password: loginData.password,
                businessId: loginData.businessId,
                businessSlug: undefined
            });
        });

        it('should return error if businessId is missing', async () => {
            // Arrange
            const loginData = {
                email: 'test@example.com',
                password: 'password123'
            };
            mockRequest.body = loginData;
            
            const { ValidationError } = require('../utils/errors');
            (AuthService.login as jest.Mock).mockRejectedValue(new ValidationError('Business ID or business slug is required'));

            // Act
            await AuthController.login(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(AuthService.login).toHaveBeenCalledWith({
                email: loginData.email,
                password: loginData.password,
                businessId: undefined,
                businessSlug: undefined
            });
        });
    });

    describe('getProfile', () => {
        it('should get user profile successfully', async () => {
            // Arrange
            const mockUser = {
                id: 1,
                businessId: 1,
                name: 'Test User',
                email: 'test@example.com',
                role: 'cashier'
            };
            const mockBusiness = {
                id: 1,
                name: 'Test Business',
                slug: 'test-business',
                primaryColor: '#007bff',
                secondaryColor: '#6c757d',
                logo: 'logo.png',
                currency: 'USD',
                taxRate: 8.5,
                timezone: 'UTC'
            };
            
            (mockRequest as any).user = { userId: 1, businessId: 1 };
            
            const mockResult = {
                user: mockUser,
                business: mockBusiness
            };

            (AuthService.getProfile as jest.Mock).mockResolvedValue(mockResult);

            // Act
            await AuthController.getProfile(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(AuthService.getProfile).toHaveBeenCalledWith(1, 1);
            expect(mockJson).toHaveBeenCalledWith(mockResult);
        });

        it('should return error if user not authenticated', async () => {
            // Arrange
            mockRequest = {};
            
            const { AuthenticationError } = require('../utils/errors');
            (AuthService.getProfile as jest.Mock).mockRejectedValue(new AuthenticationError('Authentication required'));

            // Act
            await AuthController.getProfile(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(AuthService.getProfile).not.toHaveBeenCalled();
        });
    });
}); 