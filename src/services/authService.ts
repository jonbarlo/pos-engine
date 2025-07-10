import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { UserService } from './userService';
import { BusinessService } from './businessService';
import { UserRole } from '../models/UserModel';
import { 
    ValidationError, 
    NotFoundError, 
    ConflictError, 
    AuthenticationError,
    ServiceError 
} from '../utils/errors';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface LoginCredentials {
    email: string;
    password: string;
    businessId?: number;
    businessSlug?: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    businessId?: number;
    businessSlug?: string;
    role?: string;
}

export interface AuthResponse {
    user: any;
    business: any;
    token: string;
    message: string;
}

export class AuthService {
    /**
     * Register a new user
     */
    public static async register(data: RegisterData): Promise<AuthResponse> {
        const { name, email, password, businessId, businessSlug, role } = data;

        // Validate input
        if (!name || !email || !password) {
            throw new ValidationError('Name, email, and password are required');
        }

        // Admin registration: only allow if no admin exists yet
        if (role === 'admin') {
            const existingAdmin = await UserService.findAnyAdmin();
            if (existingAdmin) {
                throw new ConflictError('Admin user already exists. Only one admin can be registered via API.');
            }
        }

        // Determine business context
        const targetBusinessId = await this.resolveBusinessId(businessId, businessSlug);

        // Verify business exists and is active
        const business = await BusinessService.getBusinessById(targetBusinessId);
        if (!business || !business.isActive) {
            throw new NotFoundError('Business not found or inactive');
        }

        // Check if user already exists in this business
        const existingUser = await UserService.userExists(email, targetBusinessId);
        if (existingUser) {
            throw new ConflictError('User with this email already exists in this business');
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user
        const newUser = await UserService.createUser({
            name,
            email,
            password: hashedPassword,
            businessId: targetBusinessId,
            role: role === 'admin' ? UserRole.ADMIN : UserRole.CASHIER
        });

        // Generate JWT token
        const token = this.generateToken(newUser);

        return {
            message: 'User registered successfully',
            user: newUser,
            business: this.formatBusinessResponse(business),
            token
        };
    }

    /**
     * Authenticate user login
     */
    public static async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const { email, password, businessId, businessSlug } = credentials;

        // Validate input
        if (!email || !password) {
            throw new ValidationError('Email and password are required');
        }

        // Determine business context
        const targetBusinessId = await this.resolveBusinessId(businessId, businessSlug);

        // Find user by email within the business
        const user = await UserService.getUserByEmail(email, targetBusinessId);
        if (!user) {
            throw new AuthenticationError('Invalid email or password');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new AuthenticationError('Invalid email or password');
        }

        // Get business info
        const business = await BusinessService.getBusinessById(targetBusinessId);

        // Generate JWT token
        const token = this.generateToken(user);

        // Return user data without password
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = user;

        return {
            message: 'Login successful',
            user: userWithoutPassword,
            business: business ? this.formatBusinessResponse(business) : null,
            token
        };
    }

    /**
     * Get user profile with business info
     */
    public static async getProfile(userId: number, businessId: number): Promise<{ user: any; business: any }> {
        const user = await UserService.getUserById(userId, businessId);
        if (!user) {
            throw new NotFoundError('User not found');
        }

        const business = await BusinessService.getBusinessById(businessId);

        return {
            user,
            business: business ? this.formatBusinessResponse(business) : null
        };
    }

    /**
     * Resolve business ID from either businessId or businessSlug
     */
    private static async resolveBusinessId(businessId?: number, businessSlug?: string): Promise<number> {
        if (businessSlug) {
            const business = await BusinessService.getBusinessBySlug(businessSlug);
            if (!business) {
                throw new NotFoundError('Business not found');
            }
            return business.id;
        } else if (businessId) {
            return businessId;
        } else {
            throw new ValidationError('Business ID or business slug is required');
        }
    }

    /**
     * Generate JWT token for user
     */
    private static generateToken(user: any): string {
        return jwt.sign(
            {
                userId: user.id,
                businessId: user.businessId,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
    }

    /**
     * Format business response with all required fields
     */
    private static formatBusinessResponse(business: any): any {
        return {
            id: business.id,
            name: business.name,
            slug: business.slug,
            description: business.description,
            logo: business.logo,
            primaryColor: business.primaryColor,
            secondaryColor: business.secondaryColor,
            address: business.address,
            phone: business.phone,
            email: business.email,
            website: business.website,
            taxRate: business.taxRate,
            currency: business.currency,
            timezone: business.timezone,
            isActive: business.isActive,
            type: business.type,
            createdAt: business.createdAt,
            updatedAt: business.updatedAt
        };
    }
} 