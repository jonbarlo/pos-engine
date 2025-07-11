import { SaleController } from '../controllers/saleController';
import { SaleService } from '../services/saleService';
import { AuthRequest } from '../middleware/auth';
import { Request, Response } from 'express';

// Mock the SaleService
jest.mock('../services/saleService');

// Mock the logger
jest.mock('../utils/logger', () => ({
  logger: jest.fn(),
}));

describe('SaleController', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock request with authenticated user
    mockRequest = {
      params: {},
      query: {},
      body: {},
      user: {
        userId: 1,
        businessId: 1,
        email: 'test@example.com',
        role: 'user'
      }
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe('createSale', () => {
    it('should create a new sale with valid data', async () => {
      // Arrange (Red - Test will fail)
      const saleData = {
        userId: 1,
        businessId: 1,
        totalAmount: 1193.49,
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        paymentMethod: 'card',
        status: 'completed'
      };

      const mockSale = {
        id: 1,
        userId: 1,
        businessId: 1,
        totalAmount: 1193.49,
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        paymentMethod: 'card',
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (SaleService.createSale as jest.Mock).mockResolvedValue(mockSale);

      mockRequest.body = saleData;

      // Act
      await SaleController.createSale(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      // Assert (Green - Test should pass)
      expect(SaleService.createSale).toHaveBeenCalledWith(saleData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Sale created successfully',
        sale: mockSale,
      });
    });

    it('should return 400 when required fields are missing', async () => {
      // Arrange (Red - Test will fail)
      const invalidSaleData = {
        customerEmail: 'john@example.com',
        // Missing userId, businessId, and totalAmount
      };

      mockRequest.body = invalidSaleData;

      // Act
      await SaleController.createSale(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      // Assert (Green - Test should pass)
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'User ID, business ID, and total amount are required'
      });
    });

    it('should handle server errors', async () => {
      // Arrange (Red - Test will fail)
      const saleData = {
        userId: 1,
        businessId: 1,
        totalAmount: 100
      };

      const error = new Error('Database error');
      (SaleService.createSale as jest.Mock).mockRejectedValue(error);

      mockRequest.body = saleData;

      // Act
      await SaleController.createSale(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      // Assert (Green - Test should pass)
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });
  });

  describe('getSaleById', () => {
    it('should return sale when found', async () => {
      // Arrange (Red - Test will fail)
      const saleId = 1;
      const mockSale = {
        id: saleId,
        userId: 1,
        totalAmount: 100,
        customerName: 'John Doe',
        status: 'completed'
      };

      (SaleService.getSaleById as jest.Mock).mockResolvedValue(mockSale);

      mockRequest.params = { id: saleId.toString() };

      // Act
      await SaleController.getSaleById(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      // Assert (Green - Test should pass)
      expect(SaleService.getSaleById).toHaveBeenCalledWith(saleId, 1);
      expect(mockResponse.json).toHaveBeenCalledWith(mockSale);
    });

    it('should return 404 when sale not found', async () => {
      // Arrange (Red - Test will fail)
      const saleId = 999;
      (SaleService.getSaleById as jest.Mock).mockResolvedValue(null);

      mockRequest.params = { id: saleId.toString() };

      // Act
      await SaleController.getSaleById(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      // Assert (Green - Test should pass)
      expect(SaleService.getSaleById).toHaveBeenCalledWith(saleId, 1);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Sale not found'
      });
    });

    it('should return 400 for invalid sale ID', async () => {
      // Arrange (Red - Test will fail)
      mockRequest.params = { id: 'invalid' };

      // Act
      await SaleController.getSaleById(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      // Assert (Green - Test should pass)
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid sale ID'
      });
    });
  });

  describe('getAllSales', () => {
    it('should return all sales with pagination', async () => {
      // Arrange (Red - Test will fail)
      const mockSales = [
        {
          id: 1,
          customerName: 'John Doe',
          totalAmount: 100,
          status: 'completed'
        },
        {
          id: 2,
          customerName: 'Jane Smith',
          totalAmount: 75.25,
          status: 'completed'
        }
      ];

      (SaleService.getAllSales as jest.Mock).mockResolvedValue(mockSales);

      mockRequest.query = { page: '1', limit: '10' };

      // Act
      await SaleController.getAllSales(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      // Assert (Green - Test should pass)
      expect(SaleService.getAllSales).toHaveBeenCalledWith({
        page: 1,
        limit: 10
      });
      expect(mockResponse.json).toHaveBeenCalledWith(mockSales);
    });

    it('should return sales filtered by status', async () => {
      // Arrange (Red - Test will fail)
      const mockSales = [
        {
          id: 1,
          customerName: 'John Doe',
          status: 'completed'
        }
      ];

      (SaleService.getAllSales as jest.Mock).mockResolvedValue(mockSales);

      mockRequest.query = { status: 'completed' };

      // Act
      await SaleController.getAllSales(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      // Assert (Green - Test should pass)
      expect(SaleService.getAllSales).toHaveBeenCalledWith({
        status: 'completed'
      });
      expect(mockResponse.json).toHaveBeenCalledWith(mockSales);
    });

    it('should handle server errors', async () => {
      // Arrange (Red - Test will fail)
      const error = new Error('Database error');
      (SaleService.getAllSales as jest.Mock).mockRejectedValue(error);

      // Act
      await SaleController.getAllSales(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      // Assert (Green - Test should pass)
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });
  });

  describe('updateSale', () => {
    it('should update sale when found', async () => {
      // Arrange (Red - Test will fail)
      const saleId = 1;
      const updateData = {
        notes: 'Cancelled by customer',
        status: 'cancelled'
      };

      const updatedSale = {
        id: saleId,
        customerName: 'John Doe',
        ...updateData
      };

      (SaleService.updateSale as jest.Mock).mockResolvedValue(updatedSale);

      mockRequest.params = { id: saleId.toString() };
      mockRequest.body = updateData;

      // Act
      await SaleController.updateSale(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      // Assert (Green - Test should pass)
      expect(SaleService.updateSale).toHaveBeenCalledWith(saleId, 1, updateData);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Sale updated successfully',
        sale: updatedSale,
      });
    });

    it('should return 404 when sale not found', async () => {
      // Arrange (Red - Test will fail)
      const saleId = 999;
      const updateData = { status: 'cancelled' };

      (SaleService.updateSale as jest.Mock).mockResolvedValue(null);

      mockRequest.params = { id: saleId.toString() };
      mockRequest.body = updateData;

      // Act
      await SaleController.updateSale(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      // Assert (Green - Test should pass)
      expect(SaleService.updateSale).toHaveBeenCalledWith(saleId, 1, updateData);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Sale not found'
      });
    });
  });

  describe('deleteSale', () => {
    it('should delete sale when found', async () => {
      // Arrange (Red - Test will fail)
      const saleId = 1;
      (SaleService.deleteSale as jest.Mock).mockResolvedValue(true);

      mockRequest.params = { id: saleId.toString() };

      // Act
      await SaleController.deleteSale(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      // Assert (Green - Test should pass)
      expect(SaleService.deleteSale).toHaveBeenCalledWith(saleId, 1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Sale deleted successfully',
      });
    });

    it('should return 404 when sale not found', async () => {
      // Arrange (Red - Test will fail)
      const saleId = 999;
      (SaleService.deleteSale as jest.Mock).mockResolvedValue(false);

      mockRequest.params = { id: saleId.toString() };

      // Act
      await SaleController.deleteSale(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      // Assert (Green - Test should pass)
      expect(SaleService.deleteSale).toHaveBeenCalledWith(saleId, 1);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Sale not found'
      });
    });
  });

  describe('getSalesByUser', () => {
    it('should return sales for specific user', async () => {
      // Arrange (Red - Test will fail)
      const userId = 1;
      const sales = [
        {
          id: 1,
          userId,
          customerName: 'John Doe',
          total: 100
        }
      ];

      (SaleService.getSalesByUser as jest.Mock).mockResolvedValue(sales);

      mockRequest.params = { userId: userId.toString() };

      // Act
      await SaleController.getSalesByUser(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      // Assert (Green - Test should pass)
      expect(SaleService.getSalesByUser).toHaveBeenCalledWith(userId, 1);
      expect(mockResponse.json).toHaveBeenCalledWith(sales);
    });
  });

  describe('getSalesStats', () => {
    it('should return sales statistics', async () => {
      // Arrange (Red - Test will fail)
      const stats = {
        totalSales: 15000.50,
        totalTransactions: 45,
        averageOrderValue: 333.34,
        topSellingItems: []
      };

      (SaleService.getSalesStats as jest.Mock).mockResolvedValue(stats);

      // Act
      await SaleController.getSalesStats(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

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
        businessId: 1,
        customerName: 'John Doe',
        total: 200
      };

      const orderItems = [
        { itemId: 1, quantity: 2, unitPrice: 50 }
      ];

      const sale = {
        id: 1,
        ...saleData,
        orderItems
      };

      (SaleService.createSaleWithItems as jest.Mock).mockResolvedValue(sale);

      mockRequest.body = { ...saleData, orderItems };

      // Act
      await SaleController.createSaleWithItems(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      // Assert (Green - Test should pass)
      expect(SaleService.createSaleWithItems).toHaveBeenCalledWith(saleData, orderItems);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Sale with items created successfully',
        sale
      });
    });
  });

  describe('getSaleWithItems', () => {
    it('should return sale with order items', async () => {
      // Arrange (Red - Test will fail)
      const saleId = 1;
      const sale = {
        id: saleId,
        customerName: 'John Doe',
        orderItems: [
          { itemId: 1, quantity: 2, price: 50 }
        ]
      };

      (SaleService.getSaleWithItems as jest.Mock).mockResolvedValue(sale);

      mockRequest.params = { id: saleId.toString() };

      // Act
      await SaleController.getSaleWithItems(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      // Assert (Green - Test should pass)
      expect(SaleService.getSaleWithItems).toHaveBeenCalledWith(saleId);
      expect(mockResponse.json).toHaveBeenCalledWith(sale);
    });

    it('should return 404 when sale not found', async () => {
      // Arrange (Red - Test will fail)
      const saleId = 999;
      (SaleService.getSaleWithItems as jest.Mock).mockResolvedValue(null);

      mockRequest.params = { id: saleId.toString() };

      // Act
      await SaleController.getSaleWithItems(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      // Assert (Green - Test should pass)
      expect(SaleService.getSaleWithItems).toHaveBeenCalledWith(saleId);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Sale not found'
      });
    });
  });
}); 