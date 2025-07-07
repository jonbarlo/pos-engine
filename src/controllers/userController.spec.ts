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
        it('should call logger and return users', async () => {
            // Arrange
            const mockUsers = [
                { id: 1, name: 'User 1', email: 'user1@example.com' },
                { id: 2, name: 'User 2', email: 'user2@example.com' }
            ];
            (UserService.getAllUsers as jest.Mock).mockResolvedValue(mockUsers);

            // Act
            await UserController.getAll(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(logger).toHaveBeenCalledWith('API endpoint /users was called...');
            expect(UserService.getAllUsers).toHaveBeenCalled();
            expect(mockJson).toHaveBeenCalledWith(mockUsers);
        });

        it('should handle errors and return 500 status', async () => {
            // Arrange
            const error = new Error('Database error');
            (UserService.getAllUsers as jest.Mock).mockRejectedValue(error);

            // Act
            await UserController.getAll(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(logger).toHaveBeenCalledWith('Error getting users: Error: Database error');
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Internal server error' });
        });

        it('should call logger exactly once on success', async () => {
            // Arrange
            (UserService.getAllUsers as jest.Mock).mockResolvedValue([]);

            // Act
            await UserController.getAll(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(logger).toHaveBeenCalledTimes(1);
        });
    });
});