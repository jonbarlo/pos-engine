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
    count: jest.fn()
  }
}));

// Mock dependencies
jest.mock('../utils/logger', () => ({
    logger: jest.fn(),
}));

// Mock the repository factory
jest.mock('../repositories/RepositoryFactory', () => ({
  getBusinessRepository: jest.fn()
}));

describe('BusinessService', () => {
  let mockBusinessRepository: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a mock repository
    mockBusinessRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findActive: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      slugExists: jest.fn(),
      search: jest.fn(),
      getStatistics: jest.fn(),
      findAllBusinesses: jest.fn(),
      findBusinessById: jest.fn(),
      findBusinessOne: jest.fn(),
      createBusiness: jest.fn(),
      updateBusiness: jest.fn(),
      findOrCreateBusiness: jest.fn(),
      bulkCreateBusinesses: jest.fn()
    };

    // Mock the repository factory to return our mock
    const { getBusinessRepository } = require('../repositories/RepositoryFactory');
    getBusinessRepository.mockReturnValue(mockBusinessRepository);
  });

  describe('createBusiness', () => {
    it('should create a new business successfully', async () => {
      // Arrange
      const businessData = {
        name: 'Test Business',
        slug: 'test-business',
        description: 'A test business',
        type: 'generic' as const,
        currency: 'USD',
        timezone: 'UTC',
        taxRate: 8.5
      };

      const mockBusiness = {
        id: 1,
        ...businessData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockBusinessRepository.create.mockResolvedValue(mockBusiness);

      // Act
      const result = await BusinessService.createBusiness(businessData);

      // Assert
      expect(mockBusinessRepository.create).toHaveBeenCalledWith(businessData);
      expect(result).toEqual(mockBusiness);
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

      mockBusinessRepository.findById.mockResolvedValue(mockBusiness);

      // Act
      const result = await BusinessService.getBusinessById(businessId);

      // Assert
      expect(mockBusinessRepository.findById).toHaveBeenCalledWith(businessId);
      expect(result).toEqual(mockBusiness);
    });
  });

  describe('getBusinessBySlug', () => {
    it('should get active business by slug successfully', async () => {
      // Arrange
      const slug = 'test-business';
      const mockBusiness = {
        id: 1,
        name: 'Test Business',
        slug: slug,
        isActive: true
      };

      mockBusinessRepository.findBySlug.mockResolvedValue(mockBusiness);

      // Act
      const result = await BusinessService.getBusinessBySlug(slug);

      // Assert
      expect(mockBusinessRepository.findBySlug).toHaveBeenCalledWith(slug);
      expect(result).toEqual(mockBusiness);
    });

    it('should return null when business not found by slug', async () => {
      // Arrange
      const slug = 'nonexistent-business';
      mockBusinessRepository.findBySlug.mockResolvedValue(null);

      // Act
      const result = await BusinessService.getBusinessBySlug(slug);

      // Assert
      expect(mockBusinessRepository.findBySlug).toHaveBeenCalledWith(slug);
      expect(result).toBeNull();
    });
  });

  describe('getAllActiveBusinesses', () => {
    it('should get all active businesses successfully', async () => {
      // Arrange
      const mockBusinesses = [
        {
          id: 1,
          name: 'Business 1',
          slug: 'business-1',
          isActive: true
        },
        {
          id: 2,
          name: 'Business 2',
          slug: 'business-2',
          isActive: true
        }
      ];

      mockBusinessRepository.findActive.mockResolvedValue(mockBusinesses);

      // Act
      const result = await BusinessService.getAllActiveBusinesses();

      // Assert
      expect(mockBusinessRepository.findActive).toHaveBeenCalled();
      expect(result).toEqual(mockBusinesses);
    });
  });

  describe('updateBusiness', () => {
    it('should update business successfully', async () => {
      // Arrange
      const businessId = 1;
      const updateData = {
        name: 'Updated Business',
        description: 'Updated description'
      };

      const mockBusiness = {
        id: businessId,
        name: 'Updated Business',
        description: 'Updated description',
        isActive: true
      };

      mockBusinessRepository.findById.mockResolvedValue(mockBusiness);
      mockBusinessRepository.update.mockResolvedValue(mockBusiness);

      // Act
      const result = await BusinessService.updateBusiness(businessId, updateData);

      // Assert
      expect(mockBusinessRepository.findById).toHaveBeenCalledWith(businessId);
      expect(mockBusinessRepository.update).toHaveBeenCalledWith(businessId, updateData);
      expect(result).toEqual(mockBusiness);
    });
  });

  describe('deleteBusiness', () => {
    it('should soft delete business successfully', async () => {
      // Arrange
      const businessId = 1;
      const mockBusiness = {
        id: businessId,
        name: 'Test Business',
        isActive: true
      };

      mockBusinessRepository.findById.mockResolvedValue(mockBusiness);
      mockBusinessRepository.updateStatus.mockResolvedValue(true);

      // Act
      const result = await BusinessService.deleteBusiness(businessId);

      // Assert
      expect(mockBusinessRepository.findById).toHaveBeenCalledWith(businessId);
      expect(mockBusinessRepository.updateStatus).toHaveBeenCalledWith(businessId, false);
      expect(result).toBe(true);
    });
  });

  describe('businessExistsBySlug', () => {
    it('should return true when business exists by slug', async () => {
      // Arrange
      const slug = 'test-business';
      mockBusinessRepository.slugExists.mockResolvedValue(true);

      // Act
      const result = await BusinessService.businessExistsBySlug(slug);

      // Assert
      expect(mockBusinessRepository.slugExists).toHaveBeenCalledWith(slug);
      expect(result).toBe(true);
    });

    it('should return false when business does not exist by slug', async () => {
      // Arrange
      const slug = 'nonexistent-business';
      mockBusinessRepository.slugExists.mockResolvedValue(false);

      // Act
      const result = await BusinessService.businessExistsBySlug(slug);

      // Assert
      expect(mockBusinessRepository.slugExists).toHaveBeenCalledWith(slug);
      expect(result).toBe(false);
    });
  });

  describe('searchBusinesses', () => {
    it('should search businesses successfully', async () => {
      // Arrange
      const query = 'restaurant';
      const mockBusinesses = [
        {
          id: 1,
          name: 'Restaurant A',
          slug: 'restaurant-a',
          isActive: true
        }
      ];

      mockBusinessRepository.search.mockResolvedValue(mockBusinesses);

      // Act
      const result = await BusinessService.searchBusinesses(query);

      // Assert
      expect(mockBusinessRepository.search).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockBusinesses);
    });
  });
}); 