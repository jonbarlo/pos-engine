import { BusinessService } from './businessService';
import { BusinessModel } from '../models/BusinessModel';

// Mock the BusinessModel
jest.mock('../models/BusinessModel', () => ({
  BusinessModel: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    sequelize: {
      models: {
        UserModel: { count: jest.fn() },
        ItemModel: { count: jest.fn() },
        SaleModel: { 
          count: jest.fn(),
          findOne: jest.fn()
        }
      },
      fn: jest.fn(),
      col: jest.fn()
    }
  }
}));

jest.mock('../utils/logger', () => ({
    logger: jest.fn(),
}));

describe('BusinessService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createBusiness', () => {
        it('should create a new business successfully', async () => {
            // Arrange
            const businessData = {
                name: 'Test Business',
                slug: 'test-business',
                description: 'A test business',
                taxRate: 8.5,
                currency: 'USD',
                timezone: 'UTC',
                type: 'generic' as const
            };

            const mockBusiness = {
                id: 1,
                ...businessData,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            (BusinessModel.create as jest.Mock).mockResolvedValue(mockBusiness);

            // Act
            const result = await BusinessService.createBusiness(businessData);

            // Assert
            expect(BusinessModel.create).toHaveBeenCalledWith(businessData);
            expect(result).toEqual(mockBusiness);
        });

        it('should handle errors when creating business', async () => {
            // Arrange
            const businessData = {
                name: 'Test Business',
                slug: 'test-business',
                taxRate: 8.5,
                currency: 'USD',
                timezone: 'UTC',
                type: 'generic' as const
            };

            const error = new Error('Database error');
            (BusinessModel.create as jest.Mock).mockRejectedValue(error);

            // Act & Assert
            await expect(BusinessService.createBusiness(businessData)).rejects.toThrow('Database error');
        });
    });

    describe('getBusinessById', () => {
        it('should get business by ID successfully', async () => {
            // Arrange
            const businessId = 1;
            const mockBusiness = {
                id: businessId,
                name: 'Test Business',
                slug: 'test-business',
                isActive: true
            };

            (BusinessModel.findByPk as jest.Mock).mockResolvedValue(mockBusiness);

            // Act
            const result = await BusinessService.getBusinessById(businessId);

            // Assert
            expect(BusinessModel.findByPk).toHaveBeenCalledWith(businessId);
            expect(result).toEqual(mockBusiness);
        });

        it('should return null when business not found', async () => {
            // Arrange
            const businessId = 999;
            (BusinessModel.findByPk as jest.Mock).mockResolvedValue(null);

            // Act
            const result = await BusinessService.getBusinessById(businessId);

            // Assert
            expect(result).toBeNull();
        });
    });

    describe('getBusinessBySlug', () => {
        it('should get active business by slug successfully', async () => {
            // Arrange
            const slug = 'test-business';
            const mockBusiness = {
                id: 1,
                name: 'Test Business',
                slug,
                isActive: true
            };

            (BusinessModel.findOne as jest.Mock).mockResolvedValue(mockBusiness);

            // Act
            const result = await BusinessService.getBusinessBySlug(slug);

            // Assert
            expect(BusinessModel.findOne).toHaveBeenCalledWith({
                where: { slug, isActive: true }
            });
            expect(result).toEqual(mockBusiness);
        });

        it('should return null when business not found by slug', async () => {
            // Arrange
            const slug = 'non-existent';
            (BusinessModel.findOne as jest.Mock).mockResolvedValue(null);

            // Act
            const result = await BusinessService.getBusinessBySlug(slug);

            // Assert
            expect(result).toBeNull();
        });
    });

    describe('getAllActiveBusinesses', () => {
        it('should get all active businesses successfully', async () => {
            // Arrange
            const mockBusinesses = [
                { id: 1, name: 'Business 1', isActive: true },
                { id: 2, name: 'Business 2', isActive: true }
            ];

            (BusinessModel.findAll as jest.Mock).mockResolvedValue(mockBusinesses);

            // Act
            const result = await BusinessService.getAllActiveBusinesses();

            // Assert
            expect(BusinessModel.findAll).toHaveBeenCalledWith({
                where: { isActive: true },
                order: [['name', 'ASC']]
            });
            expect(result).toEqual(mockBusinesses);
        });
    });

    describe('updateBusiness', () => {
        it('should update business successfully', async () => {
            // Arrange
            const businessId = 1;
            const updateData = { name: 'Updated Business' };
            const mockBusiness = {
                id: businessId,
                name: 'Updated Business',
                slug: 'test-business',
                isActive: true,
                update: jest.fn()
            };

            (BusinessModel.findByPk as jest.Mock).mockResolvedValue(mockBusiness);

            // Act
            const result = await BusinessService.updateBusiness(businessId, updateData);

            // Assert
            expect(BusinessModel.findByPk).toHaveBeenCalledWith(businessId);
            expect(mockBusiness.update).toHaveBeenCalledWith(updateData);
            expect(result).toEqual(mockBusiness);
        });

        it('should return null when business not found for update', async () => {
            // Arrange
            const businessId = 999;
            const updateData = { name: 'Updated Business' };

            (BusinessModel.findByPk as jest.Mock).mockResolvedValue(null);

            // Act
            const result = await BusinessService.updateBusiness(businessId, updateData);

            // Assert
            expect(result).toBeNull();
        });
    });

    describe('deleteBusiness', () => {
        it('should soft delete business successfully', async () => {
            // Arrange
            const businessId = 1;
            const mockBusiness = {
                id: businessId,
                name: 'Test Business',
                isActive: true,
                update: jest.fn()
            };

            (BusinessModel.findByPk as jest.Mock).mockResolvedValue(mockBusiness);

            // Act
            const result = await BusinessService.deleteBusiness(businessId);

            // Assert
            expect(BusinessModel.findByPk).toHaveBeenCalledWith(businessId);
            expect(mockBusiness.update).toHaveBeenCalledWith({ isActive: false });
            expect(result).toBe(true);
        });

        it('should return false when business not found for deletion', async () => {
            // Arrange
            const businessId = 999;
            (BusinessModel.findByPk as jest.Mock).mockResolvedValue(null);

            // Act
            const result = await BusinessService.deleteBusiness(businessId);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe('businessExistsBySlug', () => {
        it('should return true when business exists by slug', async () => {
            // Arrange
            const slug = 'test-business';
            const mockBusiness = { id: 1, slug };

            (BusinessModel.findOne as jest.Mock).mockResolvedValue(mockBusiness);

            // Act
            const result = await BusinessService.businessExistsBySlug(slug);

            // Assert
            expect(BusinessModel.findOne).toHaveBeenCalledWith({
                where: { slug }
            });
            expect(result).toBe(true);
        });

        it('should return false when business does not exist by slug', async () => {
            // Arrange
            const slug = 'non-existent';
            (BusinessModel.findOne as jest.Mock).mockResolvedValue(null);

            // Act
            const result = await BusinessService.businessExistsBySlug(slug);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe('getBusinessStats', () => {
        it('should get business statistics successfully', async () => {
            // Arrange
            const businessId = 1;
            const mockBusiness = {
                id: businessId,
                name: 'Test Business',
                currency: 'USD',
                taxRate: 8.5
            };

            (BusinessModel.findByPk as jest.Mock).mockResolvedValue(mockBusiness);
            ((BusinessModel.sequelize as any).models.UserModel.count as jest.Mock).mockResolvedValue(5);
            ((BusinessModel.sequelize as any).models.ItemModel.count as jest.Mock).mockResolvedValue(20);
            ((BusinessModel.sequelize as any).models.SaleModel.count as jest.Mock)
                .mockResolvedValueOnce(100) // total sales
                .mockResolvedValueOnce(80);  // completed sales
            ((BusinessModel.sequelize as any).models.SaleModel.findOne as jest.Mock).mockResolvedValue({
                totalRevenue: '5000.00'
            });

            // Act
            const result = await BusinessService.getBusinessStats(businessId);

            // Assert
            expect(result).toEqual({
                businessId: 1,
                businessName: 'Test Business',
                totalUsers: 5,
                activeUsers: 5,
                totalItems: 20,
                activeItems: 20,
                totalSales: 100,
                completedSales: 80,
                totalRevenue: 5000.00,
                currency: 'USD',
                taxRate: 8.5
            });
        });

        it('should return null when business not found for stats', async () => {
            // Arrange
            const businessId = 999;
            (BusinessModel.findByPk as jest.Mock).mockResolvedValue(null);

            // Act
            const result = await BusinessService.getBusinessStats(businessId);

            // Assert
            expect(result).toBeNull();
        });
    });

    describe('searchBusinesses', () => {
        it('should search businesses successfully', async () => {
            // Arrange
            const query = 'test';
            const mockBusinesses = [
                { id: 1, name: 'Test Business 1' },
                { id: 2, name: 'Test Business 2' }
            ];

            (BusinessModel.findAll as jest.Mock).mockResolvedValue(mockBusinesses);

            // Act
            const result = await BusinessService.searchBusinesses(query);

            // Assert
            expect(BusinessModel.findAll).toHaveBeenCalledWith({
                where: expect.objectContaining({
                    isActive: true
                }),
                order: [['name', 'ASC']]
            });
            expect(result).toEqual(mockBusinesses);
        });
    });

    describe('getBusinessesByTimezone', () => {
        it('should get businesses by timezone successfully', async () => {
            // Arrange
            const timezone = 'America/New_York';
            const mockBusinesses = [
                { id: 1, name: 'Business 1', timezone },
                { id: 2, name: 'Business 2', timezone }
            ];

            (BusinessModel.findAll as jest.Mock).mockResolvedValue(mockBusinesses);

            // Act
            const result = await BusinessService.getBusinessesByTimezone(timezone);

            // Assert
            expect(BusinessModel.findAll).toHaveBeenCalledWith({
                where: { timezone, isActive: true },
                order: [['name', 'ASC']]
            });
            expect(result).toEqual(mockBusinesses);
        });
    });

    describe('getBusinessesByCurrency', () => {
        it('should get businesses by currency successfully', async () => {
            // Arrange
            const currency = 'USD';
            const mockBusinesses = [
                { id: 1, name: 'Business 1', currency },
                { id: 2, name: 'Business 2', currency }
            ];

            (BusinessModel.findAll as jest.Mock).mockResolvedValue(mockBusinesses);

            // Act
            const result = await BusinessService.getBusinessesByCurrency(currency);

            // Assert
            expect(BusinessModel.findAll).toHaveBeenCalledWith({
                where: { currency, isActive: true },
                order: [['name', 'ASC']]
            });
            expect(result).toEqual(mockBusinesses);
        });
    });
}); 