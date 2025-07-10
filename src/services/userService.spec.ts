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

describe('UserService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createUser', () => {
        it('should create a new user successfully', async () => {
            // Arrange
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                businessId: 1,
                role: UserRole.CASHIER
            };

            const hashedPassword = 'hashedPassword123';
            (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

            const mockUser = {
                id: 1,
                ...userData,
                password: hashedPassword,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                toJSON: () => ({
                    id: 1,
                    name: userData.name,
                    email: userData.email,
                    businessId: userData.businessId,
                    role: userData.role,
                    isActive: true,
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date)
                })
            };

            (UserModel.create as jest.Mock).mockResolvedValue(mockUser);

            // Act
            const result = await UserService.createUser(userData);

            // Assert
            expect(UserModel.create).toHaveBeenCalledWith({
                ...userData
            });
            expect(result).toEqual(mockUser.toJSON());
        });

        it('should create admin user when role is admin', async () => {
            // Arrange
            const userData = {
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'password123',
                businessId: 1,
                role: UserRole.ADMIN
            };

            const hashedPassword = 'hashedPassword123';
            (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

            const mockUser = {
                id: 1,
                ...userData,
                password: hashedPassword,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                toJSON: () => ({
                    id: 1,
                    name: userData.name,
                    email: userData.email,
                    businessId: userData.businessId,
                    role: 'admin',
                    isActive: true,
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date)
                })
            };

            (UserModel.create as jest.Mock).mockResolvedValue(mockUser);

            // Act
            const result = await UserService.createUser(userData);

            // Assert
            expect(UserModel.create).toHaveBeenCalledWith({
                ...userData
            });
            expect(result).toEqual(mockUser.toJSON());
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
                isActive: true,
                toJSON: () => ({
                    id: userId,
                    businessId,
                    name: 'Test User',
                    email: 'test@example.com',
                    role: 'cashier',
                    isActive: true
                })
            };

            (UserModel.findOne as jest.Mock).mockResolvedValue(mockUser);

            // Act
            const result = await UserService.getUserById(userId, businessId);

            // Assert
            expect(UserModel.findOne).toHaveBeenCalledWith({
                where: { id: userId, businessId, isActive: true },
                attributes: { exclude: ['password'] }
            });
            expect(result).toEqual(mockUser.toJSON());
        });

        it('should return null when user not found', async () => {
            // Arrange
            const userId = 999;
            const businessId = 1;
            (UserModel.findOne as jest.Mock).mockResolvedValue(null);

            // Act
            const result = await UserService.getUserById(userId, businessId);

            // Assert
            expect(UserModel.findOne).toHaveBeenCalledWith({
                where: { id: userId, businessId, isActive: true },
                attributes: { exclude: ['password'] }
            });
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
                isActive: true,
                toJSON: () => ({
                    id: 1,
                    name: 'Admin User',
                    email: 'admin@example.com',
                    role: 'admin',
                    businessId: 1,
                    isActive: true
                })
            };
            
            (UserModel.findOne as jest.Mock).mockResolvedValue(mockAdmin);

            // Act
            const result = await UserService.findAnyAdmin();

            // Assert
            expect(UserModel.findOne).toHaveBeenCalledWith({
                where: { role: 'admin' }
            });
            expect(result).toEqual(mockAdmin.toJSON());
        });

        it('should return null when no admin exists', async () => {
            // Arrange
            (UserModel.findOne as jest.Mock).mockResolvedValue(null);

            // Act
            const result = await UserService.findAnyAdmin();

            // Assert
            expect(UserModel.findOne).toHaveBeenCalledWith({
                where: { role: 'admin' }
            });
            expect(result).toBeNull();
        });

        it('should handle database errors gracefully', async () => {
            // Arrange
            const error = new Error('Database connection failed');
            (UserModel.findOne as jest.Mock).mockRejectedValue(error);

            // Act & Assert
            await expect(UserService.findAnyAdmin()).rejects.toThrow('Database connection failed');
        });
    });

    describe('userExists', () => {
        it('should return true when user exists in business', async () => {
            // Arrange
            const email = 'test@example.com';
            const businessId = 1;
            (UserModel.count as jest.Mock).mockResolvedValue(1);

            // Act
            const result = await UserService.userExists(email, businessId);

            // Assert
            expect(UserModel.count).toHaveBeenCalledWith({
                where: { email, businessId, isActive: true }
            });
            expect(result).toBe(true);
        });

        it('should return false when user does not exist in business', async () => {
            // Arrange
            const email = 'nonexistent@example.com';
            const businessId = 1;
            (UserModel.count as jest.Mock).mockResolvedValue(0);

            // Act
            const result = await UserService.userExists(email, businessId);

            // Assert
            expect(UserModel.count).toHaveBeenCalledWith({
                where: { email, businessId, isActive: true }
            });
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
                    role: 'cashier',
                    toJSON: () => ({
                        id: 1,
                        businessId,
                        name: 'User 1',
                        email: 'user1@test.com',
                        role: 'cashier'
                    })
                },
                {
                    id: 2,
                    businessId,
                    name: 'User 2',
                    email: 'user2@test.com',
                    role: 'manager',
                    toJSON: () => ({
                        id: 2,
                        businessId,
                        name: 'User 2',
                        email: 'user2@test.com',
                        role: 'manager'
                    })
                }
            ];

            (UserModel.findAll as jest.Mock).mockResolvedValue(mockUsers);

            // Act
            const result = await UserService.getAllUsers(businessId);

            // Assert
            expect(UserModel.findAll).toHaveBeenCalledWith({
                where: { businessId, isActive: true },
                attributes: { exclude: ['password'] },
                order: [['createdAt', 'DESC']]
            });
            expect(result).toEqual(mockUsers.map(user => user.toJSON()));
        });
    });
}); 