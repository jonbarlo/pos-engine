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
        it('should get all items for the current business successfully', async () => {
            // Arrange
            const mockItems = [
                { id: 1, businessId: 1, name: 'Item 1', price: 10.99 },
                { id: 2, businessId: 1, name: 'Item 2', price: 15.99 }
            ];
            
            (mockRequest as any).user = {
                userId: 1,
                businessId: 1,
                email: 'admin@test.com',
                role: 'admin'
            };
            
            (ItemService.getAllItems as jest.Mock).mockResolvedValue(mockItems);

            // Act
            await ItemController.getAll(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(ItemService.getAllItems).toHaveBeenCalledWith(1);
            expect(mockJson).toHaveBeenCalledWith(mockItems);
        });

        it('should return error if user not authenticated', async () => {
            // Arrange
            (mockRequest as any).user = undefined;

            // Act
            await ItemController.getAll(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Authentication required' });
        });
    });

    describe('getItemById', () => {
        it('should get item by ID within the current business successfully', async () => {
            // Arrange
            const itemId = 1;
            mockRequest.params = { id: itemId.toString() };
            
            (mockRequest as any).user = {
                userId: 1,
                businessId: 1,
                email: 'admin@test.com',
                role: 'admin'
            };
            
            const mockItem = {
                id: itemId,
                businessId: 1,
                name: 'Test Item',
                price: 10.99,
                stock: 50
            };
            
            (ItemService.getItemById as jest.Mock).mockResolvedValue(mockItem);

            // Act
            await ItemController.getItemById(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(ItemService.getItemById).toHaveBeenCalledWith(itemId, 1);
            expect(mockJson).toHaveBeenCalledWith(mockItem);
        });

        it('should return error if item not found', async () => {
            // Arrange
            const itemId = 999;
            mockRequest.params = { id: itemId.toString() };
            
            (mockRequest as any).user = {
                userId: 1,
                businessId: 1,
                email: 'admin@test.com',
                role: 'admin'
            };
            
            (ItemService.getItemById as jest.Mock).mockResolvedValue(null);

            // Act
            await ItemController.getItemById(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Item not found' });
        });

        it('should return error if user not authenticated', async () => {
            // Arrange
            const itemId = 1;
            mockRequest.params = { id: itemId.toString() };
            (mockRequest as any).user = undefined;

            // Act
            await ItemController.getItemById(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Authentication required' });
        });
    });

    describe('createItem', () => {
        it('should create a new item in the current business successfully', async () => {
            // Arrange
            const itemData = {
                name: 'New Item',
                description: 'A new test item',
                price: 25.99,
                stock: 100,
                category: 'Electronics',
                sku: 'SKU123',
                barcode: '123456789'
            };
            mockRequest.body = itemData;
            
            (mockRequest as any).user = {
                userId: 1,
                businessId: 1,
                email: 'admin@test.com',
                role: 'admin'
            };
            
            const mockItem = {
                id: 3,
                businessId: 1,
                ...itemData,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            (ItemService.itemExistsBySku as jest.Mock).mockResolvedValue(false);
            (ItemService.itemExistsByBarcode as jest.Mock).mockResolvedValue(false);
            (ItemService.createItem as jest.Mock).mockResolvedValue(mockItem);

            // Act
            await ItemController.createItem(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(ItemService.itemExistsBySku).toHaveBeenCalledWith(itemData.sku, 1);
            expect(ItemService.itemExistsByBarcode).toHaveBeenCalledWith(itemData.barcode, 1);
            expect(ItemService.createItem).toHaveBeenCalledWith({
                ...itemData,
                cost: 0,
                unit: 'piece',
                minStock: 0,
                maxStock: 1000,
                businessId: 1
            });
            expect(mockStatus).toHaveBeenCalledWith(201);
            expect(mockJson).toHaveBeenCalledWith(mockItem);
        });

        it('should return error if SKU already exists in business', async () => {
            // Arrange
            const itemData = {
                name: 'New Item',
                price: 25.99,
                sku: 'EXISTING-SKU'
            };
            mockRequest.body = itemData;
            
            (mockRequest as any).user = {
                userId: 1,
                businessId: 1,
                email: 'admin@test.com',
                role: 'admin'
            };
            
            (ItemService.itemExistsBySku as jest.Mock).mockResolvedValue(true);

            // Act
            await ItemController.createItem(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(409);
            expect(mockJson).toHaveBeenCalledWith({
                error: 'Item with this SKU already exists in this business'
            });
        });

        it('should return error if barcode already exists in business', async () => {
            // Arrange
            const itemData = {
                name: 'New Item',
                price: 25.99,
                barcode: 'EXISTING-BARCODE'
            };
            mockRequest.body = itemData;
            
            (mockRequest as any).user = {
                userId: 1,
                businessId: 1,
                email: 'admin@test.com',
                role: 'admin'
            };
            
            (ItemService.itemExistsBySku as jest.Mock).mockResolvedValue(false);
            (ItemService.itemExistsByBarcode as jest.Mock).mockResolvedValue(true);

            // Act
            await ItemController.createItem(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(409);
            expect(mockJson).toHaveBeenCalledWith({
                error: 'Item with this barcode already exists in this business'
            });
        });

        it('should return error if user not authenticated', async () => {
            // Arrange
            const itemData = {
                name: 'New Item',
                price: 25.99
            };
            mockRequest.body = itemData;
            (mockRequest as any).user = undefined;

            // Act
            await ItemController.createItem(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Authentication required' });
        });
    });

    describe('updateItem', () => {
        it('should update item within the current business successfully', async () => {
            // Arrange
            const itemId = 1;
            const updateData = { name: 'Updated Item', price: 30.99 };
            mockRequest.params = { id: itemId.toString() };
            mockRequest.body = updateData;
            
            (mockRequest as any).user = {
                userId: 1,
                businessId: 1,
                email: 'admin@test.com',
                role: 'admin'
            };
            
            const mockItem = {
                id: itemId,
                businessId: 1,
                name: 'Updated Item',
                price: 30.99,
                stock: 50
            };
            
            (ItemService.updateItem as jest.Mock).mockResolvedValue(mockItem);

            // Act
            await ItemController.updateItem(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(ItemService.updateItem).toHaveBeenCalledWith(itemId, 1, updateData);
            expect(mockJson).toHaveBeenCalledWith(mockItem);
        });

        it('should return error if item not found for update', async () => {
            // Arrange
            const itemId = 999;
            const updateData = { name: 'Updated Item' };
            mockRequest.params = { id: itemId.toString() };
            mockRequest.body = updateData;
            
            (mockRequest as any).user = {
                userId: 1,
                businessId: 1,
                email: 'admin@test.com',
                role: 'admin'
            };
            
            (ItemService.updateItem as jest.Mock).mockResolvedValue(null);

            // Act
            await ItemController.updateItem(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Item not found' });
        });

        it('should return error if user not authenticated for update', async () => {
            // Arrange
            const itemId = 1;
            const updateData = { name: 'Updated Item' };
            mockRequest.params = { id: itemId.toString() };
            mockRequest.body = updateData;
            (mockRequest as any).user = undefined;

            // Act
            await ItemController.updateItem(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Authentication required' });
        });
    });

    describe('deleteItem', () => {
        it('should delete item within the current business successfully', async () => {
            // Arrange
            const itemId = 1;
            mockRequest.params = { id: itemId.toString() };
            
            (mockRequest as any).user = {
                userId: 1,
                businessId: 1,
                email: 'admin@test.com',
                role: 'admin'
            };
            
            (ItemService.deleteItem as jest.Mock).mockResolvedValue(true);

            // Act
            await ItemController.deleteItem(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(ItemService.deleteItem).toHaveBeenCalledWith(itemId, 1);
            expect(mockJson).toHaveBeenCalledWith({ message: 'Item deleted successfully' });
        });

        it('should return error if item not found for deletion', async () => {
            // Arrange
            const itemId = 999;
            mockRequest.params = { id: itemId.toString() };
            
            (mockRequest as any).user = {
                userId: 1,
                businessId: 1,
                email: 'admin@test.com',
                role: 'admin'
            };
            
            (ItemService.deleteItem as jest.Mock).mockResolvedValue(false);

            // Act
            await ItemController.deleteItem(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Item not found' });
        });

        it('should return error if user not authenticated for deletion', async () => {
            // Arrange
            const itemId = 1;
            mockRequest.params = { id: itemId.toString() };
            (mockRequest as any).user = undefined;

            // Act
            await ItemController.deleteItem(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Authentication required' });
        });
    });

    describe('getItemsByCategory', () => {
        it('should get items by category within the current business successfully', async () => {
            // Arrange
            const category = 'Electronics';
            mockRequest.params = { category };
            
            (mockRequest as any).user = {
                userId: 1,
                businessId: 1,
                email: 'admin@test.com',
                role: 'admin'
            };
            
            const mockItems = [
                { id: 1, businessId: 1, name: 'Phone', category: 'Electronics' },
                { id: 2, businessId: 1, name: 'Laptop', category: 'Electronics' }
            ];
            
            (ItemService.getItemsByCategory as jest.Mock).mockResolvedValue(mockItems);

            // Act
            await ItemController.getItemsByCategory(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(ItemService.getItemsByCategory).toHaveBeenCalledWith(1, category);
            expect(mockJson).toHaveBeenCalledWith(mockItems);
        });

        it('should return error if user not authenticated for category search', async () => {
            // Arrange
            const category = 'Electronics';
            mockRequest.params = { category };
            (mockRequest as any).user = undefined;

            // Act
            await ItemController.getItemsByCategory(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Authentication required' });
        });
    });

    describe('searchItems', () => {
        it('should search items within the current business successfully', async () => {
            // Arrange
            const query = 'phone';
            mockRequest.query = { q: query };
            
            (mockRequest as any).user = {
                userId: 1,
                businessId: 1,
                email: 'admin@test.com',
                role: 'admin'
            };
            
            const mockItems = [
                { id: 1, businessId: 1, name: 'iPhone', description: 'Smartphone' },
                { id: 2, businessId: 1, name: 'Phone Case', description: 'Phone accessory' }
            ];
            
            (ItemService.searchItems as jest.Mock).mockResolvedValue(mockItems);

            // Act
            await ItemController.searchItems(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(ItemService.searchItems).toHaveBeenCalledWith(1, query);
            expect(mockJson).toHaveBeenCalledWith(mockItems);
        });

        it('should return error if user not authenticated for search', async () => {
            // Arrange
            const query = 'phone';
            mockRequest.query = { q: query };
            (mockRequest as any).user = undefined;

            // Act
            await ItemController.searchItems(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Authentication required' });
        });
    });

    describe('updateStock', () => {
        it('should update stock within the current business successfully', async () => {
            // Arrange
            const itemId = 1;
            const quantity = 10;
            mockRequest.params = { id: itemId.toString() };
            mockRequest.body = { quantity };
            
            (mockRequest as any).user = {
                userId: 1,
                businessId: 1,
                email: 'admin@test.com',
                role: 'admin'
            };
            
            const mockItem = {
                id: itemId,
                businessId: 1,
                name: 'Test Item',
                stock: 60
            };
            
            (ItemService.updateStock as jest.Mock).mockResolvedValue(mockItem);

            // Act
            await ItemController.updateStock(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(ItemService.updateStock).toHaveBeenCalledWith(itemId, 1, quantity);
            expect(mockJson).toHaveBeenCalledWith(mockItem);
        });

        it('should return error if user not authenticated for stock update', async () => {
            // Arrange
            const itemId = 1;
            const quantity = 10;
            mockRequest.params = { id: itemId.toString() };
            mockRequest.body = { quantity };
            (mockRequest as any).user = undefined;

            // Act
            await ItemController.updateStock(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Authentication required' });
        });
    });

    describe('getLowStockItems', () => {
        it('should get low stock items for the current business successfully', async () => {
            // Arrange
            const threshold = 5;
            mockRequest.query = { threshold: threshold.toString() };
            
            (mockRequest as any).user = {
                userId: 1,
                businessId: 1,
                email: 'admin@test.com',
                role: 'admin'
            };
            
            const mockItems = [
                { id: 1, businessId: 1, name: 'Low Stock Item 1', stock: 3 },
                { id: 2, businessId: 1, name: 'Low Stock Item 2', stock: 1 }
            ];
            
            (ItemService.getLowStockItems as jest.Mock).mockResolvedValue(mockItems);

            // Act
            await ItemController.getLowStockItems(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(ItemService.getLowStockItems).toHaveBeenCalledWith(1, threshold);
            expect(mockJson).toHaveBeenCalledWith(mockItems);
        });

        it('should return error if user not authenticated for low stock items', async () => {
            // Arrange
            mockRequest.query = { threshold: '5' };
            (mockRequest as any).user = undefined;

            // Act
            await ItemController.getLowStockItems(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Authentication required' });
        });
    });
});