import { UserService } from './userService';
import { UserModel, UserRole } from '../models/UserModel';
import bcrypt from 'bcryptjs';

// Mock the UserModel
jest.mock('../models/UserModel', () => ({
  UserModel: {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    count: jest.fn(),
    update: jest.fn()
  },
  UserRole: {
    ADMIN: 'admin',
    MANAGER: 'manager',
    CASHIER: 'cashier'
  }
}));

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('../utils/logger', () => ({
    logger: jest.fn(),
}));

// Mock the repository factory
jest.mock('../repositories/RepositoryFactory', () => ({
  getUserRepository: jest.fn()
}));

describe('UserService', () => {
  let mockUserRepository: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a mock repository
    mockUserRepository = {
      findByBusinessId: jest.fn(),
      findOne: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      emailExistsInBusiness: jest.fn(),
      findByRole: jest.fn(),
      findAnyByRole: jest.fn(),
      findAll: jest.fn(),
      countByBusiness: jest.fn(),
      countByRoleAndBusiness: jest.fn(),
      updatePassword: jest.fn(),
      findByEmailAndBusinessSlug: jest.fn(),
      findActiveByBusinessId: jest.fn(),
      findAllUsers: jest.fn(),
      findUserById: jest.fn(),
      findUserOne: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      findOrCreateUser: jest.fn(),
      bulkCreateUsers: jest.fn()
    };

    // Mock the repository factory to return our mock
    const { getUserRepository } = require('../repositories/RepositoryFactory');
    getUserRepository.mockReturnValue(mockUserRepository);
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        businessId: 1,
        role: 'cashier' as UserRole
      };

      const mockUser = {
        id: 1,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        businessId: userData.businessId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUserRepository.create.mockResolvedValue(mockUser);

      // Act
      const result = await UserService.createUser(userData);

      // Assert
      expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
      expect(result).toEqual(mockUser);
    });

    it('should create admin user when role is admin', async () => {
      // Arrange
      const userData = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        businessId: 1,
        role: 'admin' as UserRole
      };

      const mockUser = {
        id: 1,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        businessId: userData.businessId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUserRepository.create.mockResolvedValue(mockUser);

      // Act
      const result = await UserService.createUser(userData);

      // Assert
      expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
      expect(result).toEqual(mockUser);
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      // Arrange
      const userId = 1;
      const businessId = 1;
      const mockUser = {
        id: userId,
        businessId,
        name: 'Test User',
        email: 'test@example.com',
        role: 'cashier',
        isActive: true
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await UserService.getUserById(userId, businessId);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ id: userId, businessId, isActive: true });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      // Arrange
      const userId = 999;
      const businessId = 1;
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await UserService.getUserById(userId, businessId);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ id: userId, businessId, isActive: true });
      expect(result).toBeNull();
    });
  });

  describe('findAnyAdmin', () => {
    it('should find admin user when exists', async () => {
      // Arrange
      const mockAdmin = {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        businessId: 1,
        isActive: true
      };
      
      mockUserRepository.findAnyByRole.mockResolvedValue([mockAdmin]);

      // Act
      const result = await UserService.findAnyAdmin();

      // Assert
      expect(mockUserRepository.findAnyByRole).toHaveBeenCalledWith('admin');
      expect(result).toEqual(mockAdmin);
    });

    it('should return null when no admin exists', async () => {
      // Arrange
      mockUserRepository.findAnyByRole.mockResolvedValue([]);

      // Act
      const result = await UserService.findAnyAdmin();

      // Assert
      expect(mockUserRepository.findAnyByRole).toHaveBeenCalledWith('admin');
      expect(result).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      mockUserRepository.findAnyByRole.mockRejectedValue(error);

      // Act & Assert
      await expect(UserService.findAnyAdmin()).rejects.toThrow('Database connection failed');
    });
  });

  describe('userExists', () => {
    it('should return true when user exists in business', async () => {
      // Arrange
      const email = 'test@example.com';
      const businessId = 1;
      mockUserRepository.emailExistsInBusiness.mockResolvedValue(true);

      // Act
      const result = await UserService.userExists(email, businessId);

      // Assert
      expect(mockUserRepository.emailExistsInBusiness).toHaveBeenCalledWith(email, businessId);
      expect(result).toBe(true);
    });

    it('should return false when user does not exist in business', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      const businessId = 1;
      mockUserRepository.emailExistsInBusiness.mockResolvedValue(false);

      // Act
      const result = await UserService.userExists(email, businessId);

      // Assert
      expect(mockUserRepository.emailExistsInBusiness).toHaveBeenCalledWith(email, businessId);
      expect(result).toBe(false);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users for business', async () => {
      // Arrange
      const businessId = 1;
      const mockUsers = [
        {
          id: 1,
          businessId,
          name: 'User 1',
          email: 'user1@test.com',
          role: 'cashier'
        },
        {
          id: 2,
          businessId,
          name: 'User 2',
          email: 'user2@test.com',
          role: 'manager'
        }
      ];

      mockUserRepository.findByBusinessId.mockResolvedValue(mockUsers);

      // Act
      const result = await UserService.getAllUsers(businessId);

      // Assert
      expect(mockUserRepository.findByBusinessId).toHaveBeenCalledWith(businessId);
      expect(result).toEqual(mockUsers);
    });
  });
}); 