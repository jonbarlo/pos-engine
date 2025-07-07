import { AuthController } from './authController';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserService } from '../services/userService';

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../services/userService');
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
                password: 'password123'
            };
            mockRequest.body = userData;
            
            (UserService.userExists as jest.Mock).mockResolvedValue(false);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
            (UserService.createUser as jest.Mock).mockResolvedValue({
                id: 3,
                name: userData.name,
                email: userData.email,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            (jwt.sign as jest.Mock).mockReturnValue('mockToken');

            // Act
            await AuthController.register(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(UserService.userExists).toHaveBeenCalledWith(userData.email);
            expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
            expect(UserService.createUser).toHaveBeenCalledWith({
                name: userData.name,
                email: userData.email,
                password: 'hashedPassword'
            });
            expect(jwt.sign).toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(201);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'User registered successfully',
                user: {
                    id: 3,
                    name: userData.name,
                    email: userData.email,
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date)
                },
                token: 'mockToken'
            });
        });

        it('should return error if user already exists', async () => {
            // Arrange
            const userData = {
                name: 'Test User',
                email: 'existing@example.com',
                password: 'password123'
            };
            mockRequest.body = userData;
            
            (UserService.userExists as jest.Mock).mockResolvedValue(true);

            // Act
            await AuthController.register(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(409);
            expect(mockJson).toHaveBeenCalledWith({
                error: 'User with this email already exists'
            });
        });
    });

    describe('login', () => {
        it('should login user successfully with valid credentials', async () => {
            // Arrange
            const loginData = {
                email: 'test@example.com',
                password: 'password123'
            };
            mockRequest.body = loginData;
            
            const mockUser = {
                id: 1,
                name: 'Test User',
                email: loginData.email,
                password: 'hashedPassword',
                get: jest.fn((field: string) => {
                    const data: any = {
                        id: 1,
                        name: 'Test User',
                        email: loginData.email,
                        password: 'hashedPassword'
                    };
                    return data[field];
                }),
                toJSON: () => ({
                    id: 1,
                    name: 'Test User',
                    email: loginData.email,
                    password: 'hashedPassword'
                })
            };
            
            (UserService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockReturnValue('mockToken');

            // Act
            await AuthController.login(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(UserService.getUserByEmail).toHaveBeenCalledWith(loginData.email);
            expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, 'hashedPassword');
            expect(jwt.sign).toHaveBeenCalled();
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Login successful',
                user: {
                    id: 1,
                    name: 'Test User',
                    email: loginData.email
                },
                token: 'mockToken'
            });
        });

        it('should return error for invalid credentials', async () => {
            // Arrange
            const loginData = {
                email: 'test@example.com',
                password: 'wrongpassword'
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
    });
}); 