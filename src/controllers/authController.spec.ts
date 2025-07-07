import { AuthController } from './authController';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserService } from '../services/userService';
import { BusinessService } from '../services/businessService';

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../services/userService');
jest.mock('../services/businessService');
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
            
            const mockBusiness = {
                id: 1,
                name: 'Test Business',
                slug: 'test-business',
                isActive: true
            };
            
            (BusinessService.getBusinessById as jest.Mock).mockResolvedValue(mockBusiness);
            (UserService.userExists as jest.Mock).mockResolvedValue(false);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
            (UserService.createUser as jest.Mock).mockResolvedValue({
                id: 3,
                businessId: 1,
                name: userData.name,
                email: userData.email,
                role: 'cashier',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            (jwt.sign as jest.Mock).mockReturnValue('mockToken');

            // Act
            await AuthController.register(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(BusinessService.getBusinessById).toHaveBeenCalledWith(1);
            expect(UserService.userExists).toHaveBeenCalledWith(userData.email, 1);
            expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
            expect(UserService.createUser).toHaveBeenCalledWith({
                name: userData.name,
                email: userData.email,
                password: 'hashedPassword',
                businessId: 1,
                role: 'cashier'
            });
            expect(jwt.sign).toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(201);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'User registered successfully',
                user: {
                    id: 3,
                    businessId: 1,
                    name: userData.name,
                    email: userData.email,
                    role: 'cashier',
                    isActive: true,
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date)
                },
                business: {
                    id: 1,
                    name: 'Test Business',
                    slug: 'test-business'
                },
                token: 'mockToken'
            });
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
            
            (BusinessService.getBusinessById as jest.Mock).mockResolvedValue(null);

            // Act
            await AuthController.register(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                error: 'Business not found or inactive'
            });
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
            
            const mockBusiness = {
                id: 1,
                name: 'Test Business',
                slug: 'test-business',
                isActive: true
            };
            
            (BusinessService.getBusinessById as jest.Mock).mockResolvedValue(mockBusiness);
            (UserService.userExists as jest.Mock).mockResolvedValue(true);

            // Act
            await AuthController.register(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(409);
            expect(mockJson).toHaveBeenCalledWith({
                error: 'User with this email already exists in this business'
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

            // Act
            await AuthController.register(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                error: 'Business ID or business slug is required'
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
            
            const mockBusiness = {
                id: 1,
                name: 'Test Business',
                slug: 'test-business',
                isActive: true
            };
            
            (BusinessService.getBusinessById as jest.Mock).mockResolvedValue(mockBusiness);
            (UserService.userExists as jest.Mock).mockResolvedValue(false);
            (UserService.findAnyAdmin as jest.Mock).mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
            (UserService.createUser as jest.Mock).mockResolvedValue({
                id: 1,
                businessId: 1,
                name: userData.name,
                email: userData.email,
                role: 'admin',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            (jwt.sign as jest.Mock).mockReturnValue('mockToken');

            // Act
            await AuthController.register(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(UserService.findAnyAdmin).toHaveBeenCalled();
            expect(UserService.createUser).toHaveBeenCalledWith({
                name: userData.name,
                email: userData.email,
                password: 'hashedPassword',
                businessId: 1,
                role: 'admin'
            });
            expect(mockStatus).toHaveBeenCalledWith(201);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'User registered successfully',
                user: {
                    id: 1,
                    businessId: 1,
                    name: userData.name,
                    email: userData.email,
                    role: 'admin',
                    isActive: true,
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date)
                },
                business: {
                    id: 1,
                    name: 'Test Business',
                    slug: 'test-business'
                },
                token: 'mockToken'
            });
        });

        it('should reject admin registration when admin already exists', async () => {
            // Arrange
            const userData = {
                name: 'Second Admin',
                email: 'admin2@example.com',
                password: 'password123',
                businessId: 1,
                role: 'admin'
            };
            mockRequest.body = userData;
            
            const existingAdmin = {
                id: 1,
                name: 'First Admin',
                email: 'admin1@example.com',
                role: 'admin'
            };
            
            (UserService.findAnyAdmin as jest.Mock).mockResolvedValue(existingAdmin);

            // Act
            await AuthController.register(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(UserService.findAnyAdmin).toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(403);
            expect(mockJson).toHaveBeenCalledWith({
                error: 'Admin user already exists. Only one admin can be registered via API.'
            });
        });

        it('should register non-admin user normally when admin exists', async () => {
            // Arrange
            const userData = {
                name: 'Regular User',
                email: 'user@example.com',
                password: 'password123',
                businessId: 1
                // No role specified - should default to cashier
            };
            mockRequest.body = userData;
            
            const mockBusiness = {
                id: 1,
                name: 'Test Business',
                slug: 'test-business',
                isActive: true
            };
            
            (BusinessService.getBusinessById as jest.Mock).mockResolvedValue(mockBusiness);
            (UserService.userExists as jest.Mock).mockResolvedValue(false);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
            (UserService.createUser as jest.Mock).mockResolvedValue({
                id: 2,
                businessId: 1,
                name: userData.name,
                email: userData.email,
                role: 'cashier',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            (jwt.sign as jest.Mock).mockReturnValue('mockToken');

            // Act
            await AuthController.register(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(UserService.findAnyAdmin).not.toHaveBeenCalled();
            expect(UserService.createUser).toHaveBeenCalledWith({
                name: userData.name,
                email: userData.email,
                password: 'hashedPassword',
                businessId: 1,
                role: 'cashier'
            });
            expect(mockStatus).toHaveBeenCalledWith(201);
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
            
            const mockUser = {
                id: 1,
                businessId: 1,
                name: 'Test User',
                email: loginData.email,
                password: 'hashedPassword',
                role: 'cashier',
                isActive: true,
                get: jest.fn((field: string) => {
                    const data: any = {
                        id: 1,
                        businessId: 1,
                        name: 'Test User',
                        email: loginData.email,
                        password: 'hashedPassword',
                        role: 'cashier'
                    };
                    return data[field];
                }),
                toJSON: () => ({
                    id: 1,
                    businessId: 1,
                    name: 'Test User',
                    email: loginData.email,
                    password: 'hashedPassword',
                    role: 'cashier'
                })
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
            
            (UserService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
            (BusinessService.getBusinessById as jest.Mock).mockResolvedValue(mockBusiness);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockReturnValue('mockToken');

            // Act
            await AuthController.login(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(UserService.getUserByEmail).toHaveBeenCalledWith(loginData.email, 1);
            expect(BusinessService.getBusinessById).toHaveBeenCalledWith(1);
            expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, 'hashedPassword');
            expect(jwt.sign).toHaveBeenCalled();
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Login successful',
                user: {
                    id: 1,
                    businessId: 1,
                    name: 'Test User',
                    email: loginData.email,
                    role: 'cashier'
                },
                business: {
                    id: 1,
                    name: 'Test Business',
                    slug: 'test-business',
                    primaryColor: '#007bff',
                    secondaryColor: '#6c757d',
                    logo: 'logo.png',
                    currency: 'USD',
                    taxRate: 8.5,
                    timezone: 'UTC'
                },
                token: 'mockToken'
            });
        });

        it('should return error for invalid credentials', async () => {
            // Arrange
            const loginData = {
                email: 'test@example.com',
                password: 'wrongpassword',
                businessId: 1
            };
            mockRequest.body = loginData;
            
            (UserService.getUserByEmail as jest.Mock).mockResolvedValue(null);

            // Act
            await AuthController.login(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                error: 'Invalid email or password'
            });
        });

        it('should return error if businessId is missing', async () => {
            // Arrange
            const loginData = {
                email: 'test@example.com',
                password: 'password123'
            };
            mockRequest.body = loginData;

            // Act
            await AuthController.login(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                error: 'Business ID or business slug is required'
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
            
            (mockRequest as any).user = {
                userId: 1,
                businessId: 1,
                email: 'test@example.com',
                role: 'cashier'
            };
            
            (UserService.getUserById as jest.Mock).mockResolvedValue(mockUser);
            (BusinessService.getBusinessById as jest.Mock).mockResolvedValue(mockBusiness);

            // Act
            await AuthController.getProfile(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(UserService.getUserById).toHaveBeenCalledWith(1, 1);
            expect(BusinessService.getBusinessById).toHaveBeenCalledWith(1);
            expect(mockJson).toHaveBeenCalledWith({
                user: mockUser,
                business: {
                    id: 1,
                    name: 'Test Business',
                    slug: 'test-business',
                    primaryColor: '#007bff',
                    secondaryColor: '#6c757d',
                    logo: 'logo.png',
                    currency: 'USD',
                    taxRate: 8.5,
                    timezone: 'UTC'
                }
            });
        });

        it('should return error if user not authenticated', async () => {
            // Arrange
            (mockRequest as any).user = undefined;

            // Act
            await AuthController.getProfile(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                error: 'Authentication required'
            });
        });
    });
}); 