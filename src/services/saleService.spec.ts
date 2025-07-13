import { SaleService } from './saleService';
import { SaleModel } from '../models/SaleModel';
import { SaleItemModel } from '../models/SaleItemModel';
import { OrderModel } from '../models/OrderModel';
import { KitchenOrderModel } from '../models/KitchenOrderModel';
import { ItemModel } from '../models/ItemModel';
import { UserModel } from '../models/UserModel';
import { BusinessModel } from '../models/BusinessModel';

// Mock the models
jest.mock('../models/SaleModel');
jest.mock('../models/SaleItemModel');
jest.mock('../models/OrderModel');
jest.mock('../models/KitchenOrderModel');
jest.mock('../models/ItemModel');
jest.mock('../models/UserModel');
jest.mock('../models/BusinessModel');
jest.mock('../utils/logger');
jest.mock('../utils/saleNumberGenerator', () => ({
  generateSaleNumber: jest.fn().mockResolvedValue('SALE-TEST-2024-001')
}));

describe('SaleService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSaleWithItems', () => {
    it('should rollback sale creation when order creation fails', async () => {
      // Mock transaction
      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn()
      };

      // Mock sequelize instance
      const mockSequelize = {
        transaction: jest.fn().mockResolvedValue(mockTransaction)
      };

      // Mock SaleModel.sequelize
      (SaleModel.sequelize as any) = mockSequelize;

      // Mock successful sale creation
      const mockSale = {
        id: 1,
        businessId: 1,
        userId: 1,
        totalAmount: 100,
        toJSON: jest.fn().mockReturnValue({ id: 1, businessId: 1, userId: 1, totalAmount: 100 })
      };
      (SaleModel.create as jest.Mock).mockResolvedValue(mockSale);

      // Mock successful sale item creation
      (SaleItemModel.create as jest.Mock).mockResolvedValue({});

      // Mock successful item stock update
      const mockItem = { update: jest.fn() };
      (ItemModel.findByPk as jest.Mock).mockResolvedValue(mockItem);

      // Mock order creation to fail
      (OrderModel.create as jest.Mock).mockRejectedValue(new Error('Order creation failed'));

      const saleData = {
        businessId: 1,
        userId: 1,
        totalAmount: 100,
        customerName: 'Test Customer'
      };

      const orderItems = [
        { itemId: 1, quantity: 2, unitPrice: 50 }
      ];

      // Execute the method
      await expect(SaleService.createSaleWithItems(saleData, orderItems))
        .rejects.toThrow('Order creation failed');

      // Verify transaction was rolled back
      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockTransaction.commit).not.toHaveBeenCalled();

      // Verify sale was created (within transaction)
      expect(SaleModel.create).toHaveBeenCalledWith(saleData, { transaction: mockTransaction });

      // Verify order creation was attempted
      expect(OrderModel.create).toHaveBeenCalled();
    });

    it('should commit transaction when all operations succeed', async () => {
      // Mock transaction
      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn()
      };

      // Mock sequelize instance
      const mockSequelize = {
        transaction: jest.fn().mockResolvedValue(mockTransaction)
      };

      // Mock SaleModel.sequelize
      (SaleModel.sequelize as any) = mockSequelize;

      // Mock successful sale creation
      const mockSale = {
        id: 1,
        businessId: 1,
        userId: 1,
        totalAmount: 100,
        toJSON: jest.fn().mockReturnValue({ id: 1, businessId: 1, userId: 1, totalAmount: 100 })
      };
      (SaleModel.create as jest.Mock).mockResolvedValue(mockSale);

      // Mock successful sale item creation
      (SaleItemModel.create as jest.Mock).mockResolvedValue({});

      // Mock successful item stock update
      const mockItem = { update: jest.fn() };
      (ItemModel.findByPk as jest.Mock).mockResolvedValue(mockItem);

      // Mock successful order creation
      const mockOrder = { id: 1, orderNumber: 'ORD-123' };
      (OrderModel.create as jest.Mock).mockResolvedValue(mockOrder);

      // Mock successful order item creation
      (OrderItemModel.create as jest.Mock).mockResolvedValue({});

      // Mock successful kitchen order creation
      const mockKitchenOrder = { id: 1 };
      (KitchenOrderModel.create as jest.Mock).mockResolvedValue(mockKitchenOrder);

      const saleData = {
        businessId: 1,
        userId: 1,
        totalAmount: 100,
        customerName: 'Test Customer'
      };

      const orderItems = [
        { itemId: 1, quantity: 2, unitPrice: 50 }
      ];

      // Execute the method
      const result = await SaleService.createSaleWithItems(saleData, orderItems);

      // Verify transaction was committed
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockTransaction.rollback).not.toHaveBeenCalled();

      // Verify all operations were called with transaction
      expect(SaleModel.create).toHaveBeenCalledWith(saleData, { transaction: mockTransaction });
      expect(OrderModel.create).toHaveBeenCalledWith(expect.objectContaining({
        businessId: 1,
        serverId: 1
      }), { transaction: mockTransaction });

      expect(result).toEqual({ id: 1, businessId: 1, userId: 1, totalAmount: 100 });
    });
  });

  describe('createMissingOrdersForSales', () => {
    it('should create missing orders for sales without orders', async () => {
      // Mock sales without orders
      const mockSales = [
        {
          id: 1,
          businessId: 1,
          userId: 1,
          totalAmount: 100,
          saleItems: [
            { itemId: 1, quantity: 2, unitPrice: 50 }
          ]
        }
      ];

      (SaleModel.findAll as jest.Mock).mockResolvedValue(mockSales);

      // Mock no existing orders
      (OrderModel.findOne as jest.Mock).mockResolvedValue(null);

      // Mock successful order creation
      const mockOrder = { id: 1, orderNumber: 'ORD-123' };
      (OrderModel.create as jest.Mock).mockResolvedValue(mockOrder);

      // Mock successful order item creation
      (OrderItemModel.create as jest.Mock).mockResolvedValue({});

      // Mock successful kitchen order creation
      const mockKitchenOrder = { id: 1 };
      (KitchenOrderModel.create as jest.Mock).mockResolvedValue(mockKitchenOrder);

      const result = await SaleService.createMissingOrdersForSales(1);

      expect(result.success).toBe(1);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should skip sales that already have orders', async () => {
      // Mock sales
      const mockSales = [
        {
          id: 1,
          businessId: 1,
          userId: 1,
          totalAmount: 100,
          saleItems: [
            { itemId: 1, quantity: 2, unitPrice: 50 }
          ]
        }
      ];

      (SaleModel.findAll as jest.Mock).mockResolvedValue(mockSales);

      // Mock existing order
      (OrderModel.findOne as jest.Mock).mockResolvedValue({ id: 1 });

      const result = await SaleService.createMissingOrdersForSales(1);

      expect(result.success).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(OrderModel.create).not.toHaveBeenCalled();
    });
  });
}); 