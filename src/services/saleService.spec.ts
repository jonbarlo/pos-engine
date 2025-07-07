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
      transaction: jest.fn().mockResolvedValue({
        commit: jest.fn(),
        rollback: jest.fn()
      }),
      QueryTypes: {
        SELECT: 'SELECT'
      },
      Op: {
        and: 'and',
        or: 'or',
        gte: 'gte',
        lte: 'lte',
        between: 'between',
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
      transaction: jest.fn().mockResolvedValue({
        commit: jest.fn(),
        rollback: jest.fn()
      }),
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
    update: jest.fn(),
  },
}));

jest.mock('../utils/logger', () => ({
  logger: jest.fn(),
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
        businessId: 1,
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        subtotal: 100.00,
        tax: 8.50,
        discount: 5.00,
        total: 103.50,
        paymentMethod: 'card' as const,
        status: 'completed' as const,
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
      expect(result).toEqual(mockSale.toJSON());
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
        businessId: 1,
        customerName: 'John Doe',
        total: 103.50,
        status: 'completed',
        toJSON: () => ({
          id: saleId,
          businessId: 1,
          customerName: 'John Doe',
          total: 103.50,
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
          businessId: 1,
          customerName: 'John Doe',
          total: 103.50,
          status: 'completed' as const,
          toJSON: () => ({
            id: 1,
            businessId: 1,
            customerName: 'John Doe',
            total: 103.50,
            status: 'completed' as const
          })
        },
        {
          id: 2,
          businessId: 1,
          customerName: 'Jane Smith',
          total: 75.25,
          status: 'completed' as const,
          toJSON: () => ({
            id: 2,
            businessId: 1,
            customerName: 'Jane Smith',
            total: 75.25,
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
          businessId: 1,
          status: 'completed' as const,
          toJSON: () => ({ id: 1, businessId: 1, status: 'completed' as const })
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
        businessId: 1,
        customerName: 'John Doe',
        status: 'cancelled',
        notes: 'Cancelled due to customer request',
        update: jest.fn().mockResolvedValue(true),
        toJSON: () => ({
          id: saleId,
          businessId: 1,
          customerName: 'John Doe',
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
        businessId: 1,
        customerName: 'John Doe',
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
          businessId: 1,
          userId,
          customerName: 'John Doe',
          total: 103.50,
          toJSON: () => ({
            id: 1,
            businessId: 1,
            userId,
            customerName: 'John Doe',
            total: 103.50
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
          businessId: 1,
          createdAt: new Date('2025-01-15'),
          total: 103.50,
          toJSON: () => ({
            id: 1,
            businessId: 1,
            createdAt: new Date('2025-01-15'),
            total: 103.50
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

  describe('createSaleWithItems', () => {
    it('should create sale with items successfully', async () => {
      // Arrange
      const saleData = {
        userId: 1,
        businessId: 1,
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        subtotal: 100.00,
        tax: 8.50,
        discount: 0,
        total: 108.50,
        paymentMethod: 'card' as const,
        status: 'completed' as const,
        notes: ''
      };

      const orderItems = [
        { itemId: 1, quantity: 2, unitPrice: 50.00 }
      ];

      const mockSale = {
        id: 1,
        ...saleData,
        createdAt: new Date(),
        updatedAt: new Date(),
        toJSON: () => ({
          id: 1,
          ...saleData,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      };

      const mockItem = {
        id: 1,
        businessId: 1,
        name: 'Test Item',
        stock: 100,
        update: jest.fn()
      };

      (SaleModel.create as jest.Mock).mockResolvedValue(mockSale);
      (ItemModel.findByPk as jest.Mock).mockResolvedValue(mockItem);

      // Act
      const result = await SaleService.createSaleWithItems(saleData, orderItems);

      // Assert
      expect(SaleModel.create).toHaveBeenCalledWith(saleData, expect.objectContaining({ transaction: expect.any(Object) }));
      expect(ItemModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockItem.update).toHaveBeenCalledWith({ stock: 98 }, expect.objectContaining({ transaction: expect.any(Object) }));
      expect(result).toEqual(expect.objectContaining({
        ...mockSale.toJSON(),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      }));
    });

    it('should handle errors when creating sale with items', async () => {
      // Arrange
      const saleData = {
        userId: 1,
        businessId: 1,
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        subtotal: 100.00,
        tax: 8.50,
        discount: 0,
        total: 108.50,
        paymentMethod: 'card' as const,
        status: 'completed' as const,
        notes: ''
      };

      const orderItems = [
        { itemId: 1, quantity: 2, unitPrice: 50.00 }
      ];

      const error = new Error('Database error');
      (SaleModel.create as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(SaleService.createSaleWithItems(saleData, orderItems)).rejects.toThrow('Database error');
    });
  });

  describe('getSaleWithItems', () => {
    it('should get sale with items successfully', async () => {
      // Arrange
      const saleId = 1;
      const mockSale = {
        id: saleId,
        businessId: 1,
        customerName: 'John Doe',
        total: 103.50,
        status: 'completed',
        SaleItems: [
          { itemId: 1, quantity: 2, price: 50.00, subtotal: 100.00 }
        ],
        toJSON: () => ({
          id: saleId,
          businessId: 1,
          customerName: 'John Doe',
          total: 103.50,
          status: 'completed',
          SaleItems: [
            { itemId: 1, quantity: 2, price: 50.00, subtotal: 100.00 }
          ]
        })
      };

      (SaleModel.findByPk as jest.Mock).mockResolvedValue(mockSale);

      // Act
      const result = await SaleService.getSaleWithItems(saleId);

      // Assert
      expect(SaleModel.findByPk).toHaveBeenCalledWith(saleId, {
        include: [
          {
            model: OrderItemModel,
            as: 'orderItems',
            include: [
              {
                model: ItemModel,
                as: 'item'
              }
            ]
          },
          {
            model: UserModel,
            as: 'user'
          }
        ]
      });
      expect(result).toEqual(mockSale.toJSON());
    });

    it('should return null when sale not found with items', async () => {
      // Arrange
      const saleId = 999;
      (SaleModel.findByPk as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await SaleService.getSaleWithItems(saleId);

      // Assert
      expect(result).toBeNull();
    });
  });
}); 