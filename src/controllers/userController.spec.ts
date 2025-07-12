import { UserController } from './userController';
import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { UserService } from '../services/userService';

// Mock the logger module
jest.mock('../utils/logger', () => ({
    logger: jest.fn(),
}));

// Mock the UserService module
jest.mock('../services/userService');

describe('UserController', () => {
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
        
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('getAll', () => {
        it('should get all users for the current business successfully', async () => {
            // Arrange
            const mockUsers = [
                { id: 1, businessId: 1, name: 'User 1', email: 'user1@test.com', role: 'cashier' },
                { id: 2, businessId: 1, name: 'User 2', email: 'user2@test.com', role: 'manager' }
            ];
            
            (mockRequest as any).user = {
                userId: 1,
                businessId: 1,
                email: 'admin@test.com',
                role: 'admin'
            };
            
            (UserService.getAllUsers as jest.Mock).mockResolvedValue(mockUsers);

            // Act
            await UserController.getAll(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(UserService.getAllUsers).toHaveBeenCalledWith(1);
            expect(mockJson).toHaveBeenCalledWith(mockUsers);
        });

        it('should return error if user not authenticated', async () => {
            // Arrange
            (mockRequest as any).user = undefined;

            // Act
            await UserController.getAll(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Authentication required' });
        });
    });

    describe('getUserById', () => {
        it('should get user by ID within the current business successfully', async () => {
            // Arrange
            const userId = 1;
            mockRequest.params = { id: userId.toString() };
            
            (mockRequest as any).user = {
                userId: 1,
                businessId: 1,
                email: 'admin@test.com',
                role: 'admin'
            };
            
            const mockUser = {
                id: userId,
                businessId: 1,
                name: 'Test User',
                email: 'test@example.com',
                role: 'cashier'
            };
            
            (UserService.getUserById as jest.Mock).mockResolvedValue(mockUser);

            // Act
            await UserController.getUserById(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(UserService.getUserById).toHaveBeenCalledWith(userId, 1);
            expect(mockJson).toHaveBeenCalledWith(mockUser);
        });

        it('should return error if user not found', async () => {
            // Arrange
            const userId = 999;
            mockRequest.params = { id: userId.toString() };
            
            (mockRequest as any).user = {
                userId: 1,
                businessId: 1,
                email: 'admin@test.com',
                role: 'admin'
            };
            
            (UserService.getUserById as jest.Mock).mockResolvedValue(null);

            // Act
            await UserController.getUserById(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({ error: 'User not found' });
        });

        it('should return error if user not authenticated', async () => {
            // Arrange
            const userId = 1;
            mockRequest.params = { id: userId.toString() };
            (mockRequest as any).user = undefined;

            // Act
            await UserController.getUserById(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Authentication required' });
        });
    });

    describe('createUser', () => {
        it('should create a new user in the current business successfully', async () => {
            // Arrange
            const userData = {
                name: 'New User',
                email: 'newuser@test.com',
                password: 'password123',
                role: 'cashier'
            };
            mockRequest.body = userData;
            
            (mockRequest as any).user = {
                userId: 1,
                businessId: 1,
                email: 'admin@test.com',
                role: 'admin'
            };
            
            const mockUser = {
                id: 3,
                businessId: 1,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            (UserService.userExists as jest.Mock).mockResolvedValue(false);
            (UserService.createUser as jest.Mock).mockResolvedValue(mockUser);

            // Act
            await UserController.createUser(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(UserService.userExists).toHaveBeenCalledWith(userData.email, 1);
            expect(UserService.createUser).toHaveBeenCalledWith({
                name: userData.name,
                email: userData.email,
                password: userData.password,
                businessId: 1,
                role: userData.role,
                assignment: null
            });
            expect(mockStatus).toHaveBeenCalledWith(201);
            expect(mockJson).toHaveBeenCalledWith(mockUser);
        });

        it('should return error if user already exists in business', async () => {
            // Arrange
            const userData = {
                name: 'Existing User',
                email: 'existing@test.com',
                password: 'password123'
            };
            mockRequest.body = userData;
            
            (mockRequest as any).user = {
                userId: 1,
                businessId: 1,
                email: 'admin@test.com',
                role: 'admin'
            };
            
            (UserService.userExists as jest.Mock).mockResolvedValue(true);

            // Act
            await UserController.createUser(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(409);
            expect(mockJson).toHaveBeenCalledWith({
                error: 'User with this email already exists in this business'
            });
        });

        it('should return error if user not authenticated', async () => {
            // Arrange
            const userData = {
                name: 'New User',
                email: 'newuser@test.com',
                password: 'password123'
            };
            mockRequest.body = userData;
            (mockRequest as any).user = undefined;

            // Act
            await UserController.createUser(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Authentication required' });
        });
    });

    describe('updateUser', () => {
        it('should update user within the current business successfully', async () => {
            // Arrange
            const userId = 1;
            const updateData = { name: 'Updated User', role: 'manager' };
            mockRequest.params = { id: userId.toString() };
            mockRequest.body = updateData;
            
            (mockRequest as any).user = {
                userId: 1,
                businessId: 1,
                email: 'admin@test.com',
                role: 'admin'
            };
            
            const mockUser = {
                id: userId,
                businessId: 1,
                name: 'Updated User',
                email: 'test@example.com',
                role: 'manager'
            };
            
            (UserService.updateUser as jest.Mock).mockResolvedValue(mockUser);

            // Act
            await UserController.updateUser(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(UserService.updateUser).toHaveBeenCalledWith(userId, 1, updateData);
            expect(mockJson).toHaveBeenCalledWith(mockUser);
        });

        it('should return error if user not found for update', async () => {
            // Arrange
            const userId = 999;
            const updateData = { name: 'Updated User' };
            mockRequest.params = { id: userId.toString() };
            mockRequest.body = updateData;
            
            (mockRequest as any).user = {
                userId: 1,
                businessId: 1,
                email: 'admin@test.com',
                role: 'admin'
            };
            
            (UserService.updateUser as jest.Mock).mockResolvedValue(null);

            // Act
            await UserController.updateUser(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({ error: 'User not found' });
        });

        it('should return error if user not authenticated for update', async () => {
            // Arrange
            const userId = 1;
            const updateData = { name: 'Updated User' };
            mockRequest.params = { id: userId.toString() };
            mockRequest.body = updateData;
            (mockRequest as any).user = undefined;

            // Act
            await UserController.updateUser(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Authentication required' });
        });
    });

    describe('deleteUser', () => {
        it('should delete user within the current business successfully', async () => {
            // Arrange
            const userId = 1;
            mockRequest.params = { id: userId.toString() };
            
            (mockRequest as any).user = {
                userId: 1,
                businessId: 1,
                email: 'admin@test.com',
                role: 'admin'
            };
            
            (UserService.deleteUser as jest.Mock).mockResolvedValue(true);

            // Act
            await UserController.deleteUser(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(UserService.deleteUser).toHaveBeenCalledWith(userId, 1);
            expect(mockJson).toHaveBeenCalledWith({ message: 'User deleted successfully' });
        });

        it('should return error if user not found for deletion', async () => {
            // Arrange
            const userId = 999;
            mockRequest.params = { id: userId.toString() };
            
            (mockRequest as any).user = {
                userId: 1,
                businessId: 1,
                email: 'admin@test.com',
                role: 'admin'
            };
            
            (UserService.deleteUser as jest.Mock).mockResolvedValue(false);

            // Act
            await UserController.deleteUser(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({ error: 'User not found' });
        });

        it('should return error if user not authenticated for deletion', async () => {
            // Arrange
            const userId = 1;
            mockRequest.params = { id: userId.toString() };
            (mockRequest as any).user = undefined;

            // Act
            await UserController.deleteUser(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Authentication required' });
        });
    });

    describe('getUsersByRole', () => {
        it('should get users by role within the current business successfully', async () => {
            // Arrange
            const role = 'cashier';
            mockRequest.params = { role };
            
            (mockRequest as any).user = {
                userId: 1,
                businessId: 1,
                email: 'admin@test.com',
                role: 'admin'
            };
            
            const mockUsers = [
                { id: 1, businessId: 1, name: 'Cashier 1', role: 'cashier' },
                { id: 2, businessId: 1, name: 'Cashier 2', role: 'cashier' }
            ];
            
            (UserService.getUsersByRole as jest.Mock).mockResolvedValue(mockUsers);

            // Act
            await UserController.getUsersByRole(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(UserService.getUsersByRole).toHaveBeenCalledWith(1, role);
            expect(mockJson).toHaveBeenCalledWith(mockUsers);
        });

        it('should return error if user not authenticated for role search', async () => {
            // Arrange
            const role = 'cashier';
            mockRequest.params = { role };
            (mockRequest as any).user = undefined;

            // Act
            await UserController.getUsersByRole(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Authentication required' });
        });
    });

    describe('searchUsers', () => {
        it('should search users within the current business successfully', async () => {
            // Arrange
            const query = 'john';
            mockRequest.query = { q: query };
            
            (mockRequest as any).user = {
                userId: 1,
                businessId: 1,
                email: 'admin@test.com',
                role: 'admin'
            };
            
            const mockUsers = [
                { id: 1, businessId: 1, name: 'John Doe', email: 'john@test.com' },
                { id: 2, businessId: 1, name: 'Johnny Smith', email: 'johnny@test.com' }
            ];
            
            (UserService.searchUsers as jest.Mock).mockResolvedValue(mockUsers);

            // Act
            await UserController.searchUsers(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(UserService.searchUsers).toHaveBeenCalledWith(1, query);
            expect(mockJson).toHaveBeenCalledWith(mockUsers);
        });

        it('should return error if user not authenticated for search', async () => {
            // Arrange
            const query = 'john';
            mockRequest.query = { q: query };
            (mockRequest as any).user = undefined;

            // Act
            await UserController.searchUsers(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Authentication required' });
        });
    });
});