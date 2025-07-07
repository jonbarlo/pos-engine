import { ItemController } from './itemController';
import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { ItemService } from '../services/itemService';

// Mock the logger module
jest.mock('../utils/logger', () => ({
    logger: jest.fn(),
}));

// Mock the ItemService module
jest.mock('../services/itemService');

describe('ItemController', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnThis();
        mockRequest = {};
        mockResponse = {
            json: mockJson,
            status: mockStatus,
        };
        
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('getAll', () => {
        it('should call logger and return items', async () => {
            // Arrange
            const mockItems = [
                { id: 1, name: 'Item 1', price: 10.99 },
                { id: 2, name: 'Item 2', price: 15.99 }
            ];
            (ItemService.getAllItems as jest.Mock).mockResolvedValue(mockItems);

            // Act
            await ItemController.getAll(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(logger).toHaveBeenCalledWith('API endpoint /items was called...');
            expect(ItemService.getAllItems).toHaveBeenCalled();
            expect(mockJson).toHaveBeenCalledWith(mockItems);
        });

        it('should handle errors and return 500 status', async () => {
            // Arrange
            const error = new Error('Database error');
            (ItemService.getAllItems as jest.Mock).mockRejectedValue(error);

            // Act
            await ItemController.getAll(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(logger).toHaveBeenCalledWith('Error getting items: Error: Database error');
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Internal server error' });
        });

        it('should call logger exactly once on success', async () => {
            // Arrange
            (ItemService.getAllItems as jest.Mock).mockResolvedValue([]);

            // Act
            await ItemController.getAll(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(logger).toHaveBeenCalledTimes(1);
        });
    });
});