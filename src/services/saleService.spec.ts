import { SaleService } from './saleService';
import { SaleModel, OrderItemModel, UserModel, ItemModel } from '../models';
import { SaleAttributes, SaleCreationAttributes } from '../models';

// Mock the models
jest.mock('../models', () => ({
  SaleModel: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    count: jest.fn(),
    sequelize: {
      fn: jest.fn(),
      col: jest.fn(),
      query: jest.fn(),
      QueryTypes: {
        SELECT: 'SELECT'
      }
    },
  },
  OrderItemModel: {
    create: jest.fn(),
    findAll: jest.fn(),
    destroy: jest.fn(),
    sequelize: {
      fn: jest.fn(),
      col: jest.fn(),
      query: jest.fn(),
      QueryTypes: {
        SELECT: 'SELECT'
      }
    },
  },
  UserModel: {
    findByPk: jest.fn(),
  },
  ItemModel: {
    findByPk: jest.fn(),
  },
}));

describe('SaleService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSale', () => {
    it('should create a new sale with valid data', async () => {
      // Arrange (Red - Test will fail)
      const saleData: SaleCreationAttributes = {
        userId: 1,
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        subtotal: 100.00,
        tax: 10.00,
        discount: 5.00,
        total: 105.00,
        paymentMethod: 'card',
        status: 'completed',
        notes: 'Test sale'
      };

      const mockSale = {
        id: 1,
        ...saleData,
        createdAt: new Date(),
        updatedAt: new Date(),
        toJSON: () => ({ id: 1, ...saleData })
      };

      (SaleModel.create as jest.Mock).mockResolvedValue(mockSale);

      // Act
      const result = await SaleService.createSale(saleData);

      // Assert (Green - Test should pass)
      expect(SaleModel.create).toHaveBeenCalledWith(saleData);
      expect(result).toEqual({ id: 1, ...saleData });
    });

    it('should throw error when required fields are missing', async () => {
      // Arrange (Red - Test will fail)
      const invalidSaleData = {
        customerName: 'John Doe',
        // Missing required fields: userId, subtotal, total
      };

      // Act & Assert
      await expect(SaleService.createSale(invalidSaleData as any)).rejects.toThrow();
    });
  });

  describe('getSaleById', () => {
    it('should return sale when found', async () => {
      // Arrange (Red - Test will fail)
      const saleId = 1;
      const mockSale = {
        id: saleId,
        userId: 1,
        customerName: 'John Doe',
        subtotal: 100.00,
        tax: 10.00,
        discount: 0,
        total: 110.00,
        paymentMethod: 'card',
        status: 'completed',
        toJSON: () => ({
          id: saleId,
          userId: 1,
          customerName: 'John Doe',
          subtotal: 100.00,
          tax: 10.00,
          discount: 0,
          total: 110.00,
          paymentMethod: 'card',
          status: 'completed'
        })
      };

      (SaleModel.findByPk as jest.Mock).mockResolvedValue(mockSale);

      // Act
      const result = await SaleService.getSaleById(saleId);

      // Assert (Green - Test should pass)
      expect(SaleModel.findByPk).toHaveBeenCalledWith(saleId);
      expect(result).toEqual(mockSale.toJSON());
    });

    it('should return null when sale not found', async () => {
      // Arrange (Red - Test will fail)
      const saleId = 999;
      (SaleModel.findByPk as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await SaleService.getSaleById(saleId);

      // Assert (Green - Test should pass)
      expect(SaleModel.findByPk).toHaveBeenCalledWith(saleId);
      expect(result).toBeNull();
    });
  });

  describe('getAllSales', () => {
    it('should return all sales with pagination', async () => {
      // Arrange (Red - Test will fail)
      const mockSales = [
        {
          id: 1,
          userId: 1,
          customerName: 'John Doe',
          subtotal: 100.00,
          total: 110.00,
          status: 'completed' as const,
          toJSON: () => ({
            id: 1,
            userId: 1,
            customerName: 'John Doe',
            subtotal: 100.00,
            total: 110.00,
            status: 'completed' as const
          })
        },
        {
          id: 2,
          userId: 1,
          customerName: 'Jane Smith',
          subtotal: 50.00,
          total: 55.00,
          status: 'completed' as const,
          toJSON: () => ({
            id: 2,
            userId: 1,
            customerName: 'Jane Smith',
            subtotal: 50.00,
            total: 55.00,
            status: 'completed' as const
          })
        }
      ];

      (SaleModel.findAll as jest.Mock).mockResolvedValue(mockSales);

      // Act
      const result = await SaleService.getAllSales({ page: 1, limit: 10 });

      // Assert (Green - Test should pass)
      expect(SaleModel.findAll).toHaveBeenCalledWith({
        where: {},
        order: [['createdAt', 'DESC']],
        limit: 10,
        offset: 0,
        include: []
      });
      expect(result.length).toBe(2);
      expect(result[0]!.id).toBe(1);
      expect(result[1]!.id).toBe(2);
    });

    it('should return sales filtered by status', async () => {
      // Arrange (Red - Test will fail)
      const mockSales = [
        {
          id: 1,
          status: 'completed' as const,
          toJSON: () => ({ id: 1, status: 'completed' as const })
        }
      ];

      (SaleModel.findAll as jest.Mock).mockResolvedValue(mockSales);

      // Act
      const result = await SaleService.getAllSales({ status: 'completed' });

      // Assert (Green - Test should pass)
      expect(SaleModel.findAll).toHaveBeenCalledWith({
        where: { status: 'completed' },
        order: [['createdAt', 'DESC']],
        limit: 50,
        offset: 0,
        include: []
      });
      expect(result.length).toBe(1);
      expect(result[0]!.status).toBe('completed');
    });
  });

  describe('updateSale', () => {
    it('should update sale when found', async () => {
      // Arrange (Red - Test will fail)
      const saleId = 1;
      const updateData: Partial<SaleAttributes> = {
        status: 'cancelled',
        notes: 'Cancelled due to customer request'
      };

      const mockSale = {
        id: saleId,
        status: 'cancelled',
        notes: 'Cancelled due to customer request',
        update: jest.fn().mockResolvedValue(true),
        toJSON: () => ({
          id: saleId,
          status: 'cancelled',
          notes: 'Cancelled due to customer request'
        })
      };

      (SaleModel.findByPk as jest.Mock).mockResolvedValue(mockSale);

      // Act
      const result = await SaleService.updateSale(saleId, updateData);

      // Assert (Green - Test should pass)
      expect(SaleModel.findByPk).toHaveBeenCalledWith(saleId);
      expect(mockSale.update).toHaveBeenCalledWith(updateData);
      expect(result).toEqual(mockSale.toJSON());
    });

    it('should return null when sale not found', async () => {
      // Arrange (Red - Test will fail)
      const saleId = 999;
      const updateData: Partial<SaleAttributes> = { status: 'cancelled' };

      (SaleModel.findByPk as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await SaleService.updateSale(saleId, updateData);

      // Assert (Green - Test should pass)
      expect(SaleModel.findByPk).toHaveBeenCalledWith(saleId);
      expect(result).toBeNull();
    });
  });

  describe('deleteSale', () => {
    it('should delete sale when found', async () => {
      // Arrange (Red - Test will fail)
      const saleId = 1;
      const mockSale = {
        id: saleId,
        destroy: jest.fn().mockResolvedValue(true)
      };

      (SaleModel.findByPk as jest.Mock).mockResolvedValue(mockSale);

      // Act
      const result = await SaleService.deleteSale(saleId);

      // Assert (Green - Test should pass)
      expect(SaleModel.findByPk).toHaveBeenCalledWith(saleId);
      expect(mockSale.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when sale not found', async () => {
      // Arrange (Red - Test will fail)
      const saleId = 999;
      (SaleModel.findByPk as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await SaleService.deleteSale(saleId);

      // Assert (Green - Test should pass)
      expect(SaleModel.findByPk).toHaveBeenCalledWith(saleId);
      expect(result).toBe(false);
    });
  });

  describe('getSalesByUser', () => {
    it('should return sales for specific user', async () => {
      // Arrange (Red - Test will fail)
      const userId = 1;
      const mockSales = [
        {
          id: 1,
          userId: 1,
          customerName: 'John Doe',
          toJSON: () => ({
            id: 1,
            userId: 1,
            customerName: 'John Doe'
          })
        }
      ];

      (SaleModel.findAll as jest.Mock).mockResolvedValue(mockSales);

      // Act
      const result = await SaleService.getSalesByUser(userId);

      // Assert (Green - Test should pass)
      expect(SaleModel.findAll).toHaveBeenCalledWith({
        where: { userId },
        order: [['createdAt', 'DESC']],
        include: []
      });
      expect(result.length).toBe(1);
      expect(result[0]!.userId).toBe(userId);
    });
  });

  describe('getSalesByDateRange', () => {
    it('should return sales within date range', async () => {
      // Arrange (Red - Test will fail)
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      const mockSales = [
        {
          id: 1,
          createdAt: new Date('2025-01-15'),
          toJSON: () => ({
            id: 1,
            createdAt: new Date('2025-01-15')
          })
        }
      ];

      (SaleModel.findAll as jest.Mock).mockResolvedValue(mockSales);

      // Act
      const result = await SaleService.getSalesByDateRange(startDate, endDate);

      // Assert (Green - Test should pass)
      expect(SaleModel.findAll).toHaveBeenCalledWith({
        where: {
          createdAt: {
            $gte: startDate,
            $lte: endDate
          }
        },
        order: [['createdAt', 'DESC']],
        include: []
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('getSalesStats', () => {
    it('should return sales statistics', async () => {
      // Arrange (Red - Test will fail)
      const mockSales = [
        {
          total: 100.00,
          createdAt: new Date(),
          toJSON: () => ({ total: 100.00, createdAt: new Date() })
        }
      ];

      const mockTopSellingItems = [
        { itemId: 1, totalQuantity: 5 }
      ];

      (SaleModel.findAll as jest.Mock).mockResolvedValue(mockSales);
      ((SaleModel.sequelize as any).query as jest.Mock).mockResolvedValue(mockTopSellingItems);

      // Act
      const result = await SaleService.getSalesStats();

      // Assert (Green - Test should pass)
      expect(SaleModel.findAll).toHaveBeenCalledWith({
        attributes: ['total', 'createdAt', 'status']
      });
      expect((SaleModel.sequelize as any).query).toHaveBeenCalled();
      expect(result).toEqual({
        totalSales: 100.00,
        totalTransactions: 1,
        averageOrderValue: 100.00,
        topSellingItems: mockTopSellingItems
      });
    });
  });
}); 