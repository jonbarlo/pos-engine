import { Request, Response } from 'express';
import { SaleController } from './saleController';
import { SaleService } from '../services/saleService';

// Mock the SaleService
jest.mock('../services/saleService', () => ({
  SaleService: {
    createSale: jest.fn(),
    getSaleById: jest.fn(),
    getAllSales: jest.fn(),
    updateSale: jest.fn(),
    deleteSale: jest.fn(),
    getSalesByUser: jest.fn(),
    getSalesByDateRange: jest.fn(),
    getSalesStats: jest.fn(),
    createSaleWithItems: jest.fn(),
    getSaleWithItems: jest.fn(),
    calculateSaleTotals: jest.fn(),
  },
}));

describe('SaleController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('createSale', () => {
    it('should create a new sale with valid data', async () => {
      // Arrange (Red - Test will fail)
      const saleData = {
        userId: 1,
        customerName: 'John Doe',
        subtotal: 100.00,
        tax: 10.00,
        discount: 5.00,
        total: 105.00,
        paymentMethod: 'card',
        status: 'completed',
      };

      const createdSale = { id: 1, ...saleData };

      mockRequest.body = saleData;
      (SaleService.createSale as jest.Mock).mockResolvedValue(createdSale);

      // Act
      await SaleController.createSale(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert (Green - Test should pass)
      expect(SaleService.createSale).toHaveBeenCalledWith(saleData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Sale created successfully',
        sale: createdSale,
      });
    });

    it('should return 400 when required fields are missing', async () => {
      // Arrange (Red - Test will fail)
      const invalidData = {
        customerName: 'John Doe',
        // Missing required fields
      };

      mockRequest.body = invalidData;
      (SaleService.createSale as jest.Mock).mockRejectedValue(new Error('Missing required fields'));

      // Act
      await SaleController.createSale(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert (Green - Test should pass)
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'Missing required fields',
      });
    });

    it('should handle server errors', async () => {
      // Arrange (Red - Test will fail)
      const saleData = { userId: 1, subtotal: 100, total: 100 };
      mockRequest.body = saleData;
      (SaleService.createSale as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Act
      await SaleController.createSale(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert (Green - Test should pass)
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Database error',
      });
    });
  });

  describe('getSaleById', () => {
    it('should return sale when found', async () => {
      // Arrange (Red - Test will fail)
      const saleId = 1;
      const sale = {
        id: saleId,
        userId: 1,
        customerName: 'John Doe',
        total: 105.00,
        status: 'completed',
      };

      mockRequest.params = { id: saleId.toString() };
      (SaleService.getSaleById as jest.Mock).mockResolvedValue(sale);

      // Act
      await SaleController.getSaleById(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert (Green - Test should pass)
      expect(SaleService.getSaleById).toHaveBeenCalledWith(saleId);
      expect(mockResponse.json).toHaveBeenCalledWith(sale);
    });

    it('should return 404 when sale not found', async () => {
      // Arrange (Red - Test will fail)
      const saleId = 999;
      mockRequest.params = { id: saleId.toString() };
      (SaleService.getSaleById as jest.Mock).mockResolvedValue(null);

      // Act
      await SaleController.getSaleById(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert (Green - Test should pass)
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Sale not found',
      });
    });

    it('should return 400 for invalid sale ID', async () => {
      // Arrange (Red - Test will fail)
      mockRequest.params = { id: 'invalid' };

      // Act
      await SaleController.getSaleById(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert (Green - Test should pass)
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid sale ID',
      });
    });
  });

  describe('getAllSales', () => {
    it('should return all sales with pagination', async () => {
      // Arrange (Red - Test will fail)
      const sales = [
        { id: 1, customerName: 'John Doe', total: 105.00 },
        { id: 2, customerName: 'Jane Smith', total: 55.00 },
      ];

      mockRequest.query = { page: '1', limit: '10' };
      (SaleService.getAllSales as jest.Mock).mockResolvedValue(sales);

      // Act
      await SaleController.getAllSales(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert (Green - Test should pass)
      expect(SaleService.getAllSales).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
      expect(mockResponse.json).toHaveBeenCalledWith(sales);
    });

    it('should return sales filtered by status', async () => {
      // Arrange (Red - Test will fail)
      const sales = [{ id: 1, status: 'completed' }];
      mockRequest.query = { status: 'completed' };
      (SaleService.getAllSales as jest.Mock).mockResolvedValue(sales);

      // Act
      await SaleController.getAllSales(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert (Green - Test should pass)
      expect(SaleService.getAllSales).toHaveBeenCalledWith({
        status: 'completed',
      });
      expect(mockResponse.json).toHaveBeenCalledWith(sales);
    });

    it('should handle server errors', async () => {
      // Arrange (Red - Test will fail)
      mockRequest.query = {};
      (SaleService.getAllSales as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Act
      await SaleController.getAllSales(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert (Green - Test should pass)
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Database error',
      });
    });
  });

  describe('updateSale', () => {
    it('should update sale when found', async () => {
      // Arrange (Red - Test will fail)
      const saleId = 1;
      const updateData = {
        status: 'cancelled',
        notes: 'Cancelled by customer',
      };
      const updatedSale = { id: saleId, ...updateData };

      mockRequest.params = { id: saleId.toString() };
      mockRequest.body = updateData;
      (SaleService.updateSale as jest.Mock).mockResolvedValue(updatedSale);

      // Act
      await SaleController.updateSale(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert (Green - Test should pass)
      expect(SaleService.updateSale).toHaveBeenCalledWith(saleId, updateData);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Sale updated successfully',
        sale: updatedSale,
      });
    });

    it('should return 404 when sale not found', async () => {
      // Arrange (Red - Test will fail)
      const saleId = 999;
      mockRequest.params = { id: saleId.toString() };
      mockRequest.body = { status: 'cancelled' };
      (SaleService.updateSale as jest.Mock).mockResolvedValue(null);

      // Act
      await SaleController.updateSale(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert (Green - Test should pass)
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Sale not found',
      });
    });
  });

  describe('deleteSale', () => {
    it('should delete sale when found', async () => {
      // Arrange (Red - Test will fail)
      const saleId = 1;
      mockRequest.params = { id: saleId.toString() };
      (SaleService.deleteSale as jest.Mock).mockResolvedValue(true);

      // Act
      await SaleController.deleteSale(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert (Green - Test should pass)
      expect(SaleService.deleteSale).toHaveBeenCalledWith(saleId);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Sale deleted successfully',
      });
    });

    it('should return 404 when sale not found', async () => {
      // Arrange (Red - Test will fail)
      const saleId = 999;
      mockRequest.params = { id: saleId.toString() };
      (SaleService.deleteSale as jest.Mock).mockResolvedValue(false);

      // Act
      await SaleController.deleteSale(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert (Green - Test should pass)
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Sale not found',
      });
    });
  });

  describe('getSalesByUser', () => {
    it('should return sales for specific user', async () => {
      // Arrange (Red - Test will fail)
      const userId = 1;
      const sales = [{ id: 1, userId, customerName: 'John Doe' }];

      mockRequest.params = { userId: userId.toString() };
      (SaleService.getSalesByUser as jest.Mock).mockResolvedValue(sales);

      // Act
      await SaleController.getSalesByUser(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert (Green - Test should pass)
      expect(SaleService.getSalesByUser).toHaveBeenCalledWith(userId);
      expect(mockResponse.json).toHaveBeenCalledWith(sales);
    });
  });

  describe('getSalesStats', () => {
    it('should return sales statistics', async () => {
      // Arrange (Red - Test will fail)
      const stats = {
        totalSales: 1000.00,
        totalTransactions: 50,
        averageOrderValue: 20.00,
        topSellingItems: [],
      };

      (SaleService.getSalesStats as jest.Mock).mockResolvedValue(stats);

      // Act
      await SaleController.getSalesStats(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert (Green - Test should pass)
      expect(SaleService.getSalesStats).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(stats);
    });
  });

  describe('createSaleWithItems', () => {
    it('should create sale with order items', async () => {
      // Arrange (Red - Test will fail)
      const saleData = {
        userId: 1,
        customerName: 'John Doe',
        subtotal: 100.00,
        tax: 10.00,
        total: 110.00,
        paymentMethod: 'card',
        status: 'completed',
      };

      const orderItems = [
        { itemId: 1, quantity: 2, unitPrice: 50.00 },
        { itemId: 2, quantity: 1, unitPrice: 10.00 },
      ];

      const createdSale = { id: 1, ...saleData };

      mockRequest.body = { ...saleData, orderItems };
      (SaleService.createSaleWithItems as jest.Mock).mockResolvedValue(createdSale);

      // Act
      await SaleController.createSaleWithItems(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert (Green - Test should pass)
      expect(SaleService.createSaleWithItems).toHaveBeenCalledWith(saleData, orderItems);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Sale with items created successfully',
        sale: createdSale,
      });
    });
  });

  describe('getSaleWithItems', () => {
    it('should return sale with order items', async () => {
      // Arrange (Red - Test will fail)
      const saleId = 1;
      const saleWithItems = {
        id: saleId,
        customerName: 'John Doe',
        orderItems: [
          { id: 1, itemId: 1, quantity: 2, item: { name: 'Product 1' } },
        ],
      };

      mockRequest.params = { id: saleId.toString() };
      (SaleService.getSaleWithItems as jest.Mock).mockResolvedValue(saleWithItems);

      // Act
      await SaleController.getSaleWithItems(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert (Green - Test should pass)
      expect(SaleService.getSaleWithItems).toHaveBeenCalledWith(saleId);
      expect(mockResponse.json).toHaveBeenCalledWith(saleWithItems);
    });

    it('should return 404 when sale not found', async () => {
      // Arrange (Red - Test will fail)
      const saleId = 999;
      mockRequest.params = { id: saleId.toString() };
      (SaleService.getSaleWithItems as jest.Mock).mockResolvedValue(null);

      // Act
      await SaleController.getSaleWithItems(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert (Green - Test should pass)
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Sale not found',
      });
    });
  });
}); 