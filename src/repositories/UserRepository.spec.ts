import { UserRepository } from './UserRepository';
import { UserModel, UserAttributes, UserRole } from '../models/UserModel';
import { BusinessModel } from '../models/BusinessModel';

// Mock the models
jest.mock('../models/UserModel');
jest.mock('../models/BusinessModel');

describe('UserRepository', () => {
    let userRepository: UserRepository;
    let mockUserModel: jest.Mocked<typeof UserModel>;
    let mockBusinessModel: jest.Mocked<typeof BusinessModel>;

    beforeEach(() => {
        userRepository = new UserRepository();
        mockUserModel = UserModel as jest.Mocked<typeof UserModel>;
        mockBusinessModel = BusinessModel as jest.Mocked<typeof BusinessModel>;
        
        // Reset all mocks
        jest.clearAllMocks();
    });

    describe('findByEmail', () => {
        it('should find user by email and businessId', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                businessId: 1,
                name: 'Test User',
                password: 'hashedpassword',
                role: UserRole.CASHIER,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                toJSON: jest.fn().mockReturnValue({
                    id: 1,
                    email: 'test@example.com',
                    businessId: 1,
                    name: 'Test User',
                    role: UserRole.CASHIER,
                    isActive: true
                })
            };

            mockUserModel.findOne = jest.fn().mockResolvedValue(mockUser);

            const result = await userRepository.findByEmail('test@example.com', 1);

            expect(mockUserModel.findOne).toHaveBeenCalledWith({
                where: {
                    email: 'test@example.com',
                    businessId: 1
                }
            });
            expect(result).toEqual(mockUser.toJSON());
        });

        it('should return null when user not found', async () => {
            mockUserModel.findOne = jest.fn().mockResolvedValue(null);

            const result = await userRepository.findByEmail('nonexistent@example.com', 1);

            expect(result).toBeNull();
        });
    });

    describe('findByEmailAndBusinessSlug', () => {
        it('should find user by email and business slug', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                businessId: 1,
                name: 'Test User',
                password: 'hashedpassword',
                role: UserRole.CASHIER,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                toJSON: jest.fn().mockReturnValue({
                    id: 1,
                    email: 'test@example.com',
                    businessId: 1,
                    name: 'Test User',
                    role: UserRole.CASHIER,
                    isActive: true
                })
            };

            mockUserModel.findOne = jest.fn().mockResolvedValue(mockUser);

            const result = await userRepository.findByEmailAndBusinessSlug('test@example.com', 'demo-business');

            expect(mockUserModel.findOne).toHaveBeenCalledWith({
                include: [{
                    model: mockBusinessModel,
                    as: 'business',
                    where: { slug: 'demo-business' }
                }],
                where: { email: 'test@example.com' }
            });
            expect(result).toEqual(mockUser.toJSON());
        });
    });

    describe('findByBusinessId', () => {
        it('should find all users for a business', async () => {
            const mockUsers = [
                {
                    id: 1,
                    email: 'user1@example.com',
                    businessId: 1,
                    name: 'User 1',
                    toJSON: jest.fn().mockReturnValue({
                        id: 1,
                        email: 'user1@example.com',
                        businessId: 1,
                        name: 'User 1'
                    })
                },
                {
                    id: 2,
                    email: 'user2@example.com',
                    businessId: 1,
                    name: 'User 2',
                    toJSON: jest.fn().mockReturnValue({
                        id: 2,
                        email: 'user2@example.com',
                        businessId: 1,
                        name: 'User 2'
                    })
                }
            ];

            mockUserModel.findAll = jest.fn().mockResolvedValue(mockUsers);

            const result = await userRepository.findByBusinessId(1);

            expect(mockUserModel.findAll).toHaveBeenCalledWith({
                where: { businessId: 1 }
            });
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual(mockUsers[0]?.toJSON());
            expect(result[1]).toEqual(mockUsers[1]?.toJSON());
        });

        it('should apply options when provided', async () => {
            const mockUsers: any[] = [];
            mockUserModel.findAll = jest.fn().mockResolvedValue(mockUsers);

            await userRepository.findByBusinessId(1, {
                limit: 10,
                offset: 0,
                order: [['name', 'ASC']]
            });

            expect(mockUserModel.findAll).toHaveBeenCalledWith({
                where: { businessId: 1 },
                limit: 10,
                offset: 0,
                order: [['name', 'ASC']]
            });
        });
    });

    describe('findByRole', () => {
        it('should find users by role and business', async () => {
            const mockUsers = [
                {
                    id: 1,
                    email: 'admin@example.com',
                    businessId: 1,
                    role: UserRole.ADMIN,
                    toJSON: jest.fn().mockReturnValue({
                        id: 1,
                        email: 'admin@example.com',
                        businessId: 1,
                        role: UserRole.ADMIN
                    })
                }
            ];

            mockUserModel.findAll = jest.fn().mockResolvedValue(mockUsers);

            const result = await userRepository.findByRole(1, UserRole.ADMIN);

            expect(mockUserModel.findAll).toHaveBeenCalledWith({
                where: {
                    businessId: 1,
                    role: UserRole.ADMIN
                }
            });
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(mockUsers[0]?.toJSON());
        });
    });

    describe('findActiveByBusinessId', () => {
        it('should find only active users for a business', async () => {
            const mockUsers = [
                {
                    id: 1,
                    email: 'active@example.com',
                    businessId: 1,
                    isActive: true,
                    toJSON: jest.fn().mockReturnValue({
                        id: 1,
                        email: 'active@example.com',
                        businessId: 1,
                        isActive: true
                    })
                }
            ];

            mockUserModel.findAll = jest.fn().mockResolvedValue(mockUsers);

            const result = await userRepository.findActiveByBusinessId(1);

            expect(mockUserModel.findAll).toHaveBeenCalledWith({
                where: {
                    businessId: 1,
                    isActive: true
                }
            });
            expect(result).toHaveLength(1);
        });
    });

    describe('updatePassword', () => {
        it('should update user password', async () => {
            mockUserModel.update = jest.fn().mockResolvedValue([1]);

            const result = await userRepository.updatePassword(1, 'newhashedpassword');

            expect(mockUserModel.update).toHaveBeenCalledWith(
                { password: 'newhashedpassword' },
                { where: { id: 1 } }
            );
            expect(result).toBe(true);
        });

        it('should return false when user not found', async () => {
            mockUserModel.update = jest.fn().mockResolvedValue([0]);

            const result = await userRepository.updatePassword(999, 'newhashedpassword');

            expect(result).toBe(false);
        });
    });

    describe('emailExistsInBusiness', () => {
        it('should return true when email exists in business', async () => {
            mockUserModel.count = jest.fn().mockResolvedValue(1);

            const result = await userRepository.emailExistsInBusiness('test@example.com', 1);

            expect(mockUserModel.count).toHaveBeenCalledWith({
                where: {
                    email: 'test@example.com',
                    businessId: 1
                }
            });
            expect(result).toBe(true);
        });

        it('should return false when email does not exist in business', async () => {
            mockUserModel.count = jest.fn().mockResolvedValue(0);

            const result = await userRepository.emailExistsInBusiness('nonexistent@example.com', 1);

            expect(result).toBe(false);
        });
    });

    describe('countByBusiness', () => {
        it('should count users in a business', async () => {
            mockUserModel.count = jest.fn().mockResolvedValue(5);

            const result = await userRepository.countByBusiness(1);

            expect(mockUserModel.count).toHaveBeenCalledWith({
                where: { businessId: 1 }
            });
            expect(result).toBe(5);
        });
    });

    describe('countByRoleAndBusiness', () => {
        it('should count users by role in a business', async () => {
            mockUserModel.count = jest.fn().mockResolvedValue(2);

            const result = await userRepository.countByRoleAndBusiness(1, UserRole.CASHIER);

            expect(mockUserModel.count).toHaveBeenCalledWith({
                where: {
                    businessId: 1,
                    role: UserRole.CASHIER
                }
            });
            expect(result).toBe(2);
        });
    });

    describe('Base repository methods', () => {
        it('should create user', async () => {
            const userData: Partial<UserAttributes> = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'hashedpassword',
                businessId: 1,
                role: UserRole.CASHIER
            };

            const mockUser = {
                ...userData,
                id: 1,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                toJSON: jest.fn().mockReturnValue({
                    id: 1,
                    ...userData,
                    isActive: true
                })
            };

            // Fix: ensure mock receives correct arguments
            mockUserModel.create = jest.fn().mockImplementation((data) => {
                expect(data).toEqual(userData);
                return Promise.resolve(mockUser);
            });

            const result = await userRepository.createUser(userData);

            expect(result).toEqual(mockUser.toJSON());
        });

        it('should find user by ID', async () => {
            const mockUser = {
                id: 1,
                name: 'Test User',
                toJSON: jest.fn().mockReturnValue({
                    id: 1,
                    name: 'Test User'
                })
            };

            mockUserModel.findByPk = jest.fn().mockResolvedValue(mockUser);

            const result = await userRepository.findUserById(1);

            expect(mockUserModel.findByPk).toHaveBeenCalledWith(1, { where: { id: 1 } });
            expect(result).toEqual(mockUser.toJSON());
        });
    });
}); 