import { ItemController } from './itemController';
import { Request, Response } from 'express';
import { logger } from '../utils/logger';

// Mock the logger module
jest.mock('../utils/logger', () => ({
    logger: jest.fn(),
}));

describe('ItemController', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockSend: jest.Mock;

    beforeEach(() => {
        mockSend = jest.fn();
        mockRequest = {};
        mockResponse = {
            send: mockSend,
        };
        
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('getAll', () => {
        it('should call logger and send "List of items"', async () => {
            // Act
            await ItemController.getAll(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(logger).toHaveBeenCalledWith('API endpoint /items was called...');
            expect(mockSend).toHaveBeenCalledWith('List of items');
        });

        it('should call logger exactly once', async () => {
            // Act
            await ItemController.getAll(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(logger).toHaveBeenCalledTimes(1);
        });

        it('should call res.send exactly once', async () => {
            // Act
            await ItemController.getAll(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockSend).toHaveBeenCalledTimes(1);
        });
    });
});