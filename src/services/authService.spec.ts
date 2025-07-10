import { AuthService, LoginCredentials, RegisterData } from './authService';
import { UserService } from './userService';
import { BusinessService } from './businessService';
import { UserRole } from '../models/UserModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('./userService');
jest.mock('./businessService');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const mockUserService = UserService as jest.Mocked<typeof UserService>;
const mockBusinessService = BusinessService as jest.Mocked<typeof BusinessService>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        const mockBusiness = {
            id: 1,
            name: 'Test Business',
            slug: 'test-business',
            isActive: true,
            description: 'Test description',
            logo: 'logo.png',
            primaryColor: '#000000',
            secondaryColor: '#ffffff',
            address: 'Test Address',
            phone: '1234567890',
            email: 'test@business.com',
            website: 'https://test.com',
            taxRate: 0.1,
            currency: 'USD',
            timezone: 'UTC',
            type: 'restaurant' as const,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const mockUser = {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            businessId: 1,
            role: UserRole.CASHIER,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        it('should register a new user successfully', async () => {
            const registerData: RegisterData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                businessSlug: 'test-business'
            };

            mockBusinessService.getBusinessBySlug.mockResolvedValue(mockBusiness as any);
            mockBusinessService.getBusinessById.mockResolvedValue(mockBusiness as any);
            mockUserService.findAnyAdmin.mockResolvedValue(null);
            mockUserService.userExists.mockResolvedValue(false);
            (mockBcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
            mockUserService.createUser.mockResolvedValue(mockUser as any);
            (mockJwt.sign as jest.Mock).mockReturnValue('mock-token');

            const result = await AuthService.register(registerData);

            expect(result.message).toBe('User registered successfully');
            expect(result.user).toEqual(mockUser);
            expect(result.business).toEqual(mockBusiness);
            expect(result.token).toBe('mock-token');
            expect(mockUserService.createUser).toHaveBeenCalledWith({
                name: 'Test User',
                email: 'test@example.com',
                password: 'hashedPassword',
                businessId: 1,
                role: UserRole.CASHIER
            });
        });

        it('should throw error if required fields are missing', async () => {
            const registerData: RegisterData = {
                name: '',
                email: 'test@example.com',
                password: 'password123',
                businessSlug: 'test-business'
            };

            await expect(AuthService.register(registerData)).rejects.toThrow('Name, email, and password are required');
        });

        it('should throw error if admin already exists', async () => {
            const registerData: RegisterData = {
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'password123',
                businessSlug: 'test-business',
                role: 'admin'
            };

            mockBusinessService.getBusinessBySlug.mockResolvedValue(mockBusiness as any);
            mockUserService.findAnyAdmin.mockResolvedValue(mockUser as any);

            await expect(AuthService.register(registerData)).rejects.toThrow('Admin user already exists');
        });

        it('should throw error if business not found', async () => {
            const registerData: RegisterData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                businessSlug: 'non-existent-business'
            };

            mockBusinessService.getBusinessBySlug.mockResolvedValue(null);

            await expect(AuthService.register(registerData)).rejects.toThrow('Business not found');
        });

        it('should throw error if user already exists', async () => {
            const registerData: RegisterData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                businessSlug: 'test-business'
            };

            mockBusinessService.getBusinessBySlug.mockResolvedValue(mockBusiness as any);
            mockBusinessService.getBusinessById.mockResolvedValue(mockBusiness as any);
            mockUserService.findAnyAdmin.mockResolvedValue(null);
            mockUserService.userExists.mockResolvedValue(true);

            await expect(AuthService.register(registerData)).rejects.toThrow('User with this email already exists');
        });
    });

    describe('login', () => {
        const mockUser = {
            get: jest.fn((field: string) => {
                const values: { [key: string]: any } = {
                    id: 1,
                    businessId: 1,
                    email: 'test@example.com',
                    role: UserRole.CASHIER,
                    password: 'hashedPassword'
                };
                return values[field];
            }),
            toJSON: jest.fn(() => ({
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
                businessId: 1,
                role: UserRole.CASHIER,
                password: 'hashedPassword'
            }))
        };

        const mockBusiness = {
            id: 1,
            name: 'Test Business',
            slug: 'test-business',
            isActive: true,
            description: 'Test description',
            logo: 'logo.png',
            primaryColor: '#000000',
            secondaryColor: '#ffffff',
            address: 'Test Address',
            phone: '1234567890',
            email: 'test@business.com',
            website: 'https://test.com',
            taxRate: 0.1,
            currency: 'USD',
            timezone: 'UTC',
            type: 'restaurant' as const,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        it('should login user successfully', async () => {
            const credentials: LoginCredentials = {
                email: 'test@example.com',
                password: 'password123',
                businessSlug: 'test-business'
            };

            mockBusinessService.getBusinessBySlug.mockResolvedValue(mockBusiness as any);
            mockUserService.getUserByEmail.mockResolvedValue(mockUser as any);
            (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);
            mockBusinessService.getBusinessById.mockResolvedValue(mockBusiness as any);
            (mockJwt.sign as jest.Mock).mockReturnValue('mock-token');

            const result = await AuthService.login(credentials);

            expect(result.message).toBe('Login successful');
            expect(result.user).not.toHaveProperty('password');
            expect(result.business).toEqual(mockBusiness);
            expect(result.token).toBe('mock-token');
        });

        it('should throw error if credentials are missing', async () => {
            const credentials: LoginCredentials = {
                email: '',
                password: 'password123',
                businessSlug: 'test-business'
            };

            await expect(AuthService.login(credentials)).rejects.toThrow('Email and password are required');
        });

        it('should throw error if user not found', async () => {
            const credentials: LoginCredentials = {
                email: 'test@example.com',
                password: 'password123',
                businessSlug: 'test-business'
            };

            mockBusinessService.getBusinessBySlug.mockResolvedValue(mockBusiness as any);
            mockUserService.getUserByEmail.mockResolvedValue(null);

            await expect(AuthService.login(credentials)).rejects.toThrow('Invalid email or password');
        });

        it('should throw error if password is invalid', async () => {
            const credentials: LoginCredentials = {
                email: 'test@example.com',
                password: 'wrongpassword',
                businessSlug: 'test-business'
            };

            mockBusinessService.getBusinessBySlug.mockResolvedValue(mockBusiness as any);
            mockUserService.getUserByEmail.mockResolvedValue(mockUser as any);
            (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(AuthService.login(credentials)).rejects.toThrow('Invalid email or password');
        });
    });

    describe('getProfile', () => {
        const mockUser = {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            businessId: 1,
            role: UserRole.CASHIER,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const mockBusiness = {
            id: 1,
            name: 'Test Business',
            slug: 'test-business',
            isActive: true,
            description: 'Test description',
            logo: 'logo.png',
            primaryColor: '#000000',
            secondaryColor: '#ffffff',
            address: 'Test Address',
            phone: '1234567890',
            email: 'test@business.com',
            website: 'https://test.com',
            taxRate: 0.1,
            currency: 'USD',
            timezone: 'UTC',
            type: 'restaurant' as const,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        it('should get user profile successfully', async () => {
            mockUserService.getUserById.mockResolvedValue(mockUser as any);
            mockBusinessService.getBusinessById.mockResolvedValue(mockBusiness as any);

            const result = await AuthService.getProfile(1, 1);

            expect(result.user).toEqual(mockUser);
            expect(result.business).toEqual(mockBusiness);
        });

        it('should throw error if user not found', async () => {
            mockUserService.getUserById.mockResolvedValue(null);

            await expect(AuthService.getProfile(999, 1)).rejects.toThrow('User not found');
        });

        it('should return null business if business not found', async () => {
            mockUserService.getUserById.mockResolvedValue(mockUser as any);
            mockBusinessService.getBusinessById.mockResolvedValue(null);

            const result = await AuthService.getProfile(1, 1);

            expect(result.user).toEqual(mockUser);
            expect(result.business).toBeNull();
        });
    });
}); 