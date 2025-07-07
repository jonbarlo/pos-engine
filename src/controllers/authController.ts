import { Request, Response, RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { UserService } from '../services/userService';
import { BusinessService } from '../services/businessService';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export class AuthController {
    public static register: RequestHandler = async (req: Request, res: Response) => {
        try {
            logger('API endpoint /auth/register was called...');
            
            const { name, email, password, businessId, businessSlug, role } = req.body;

            // Validate input
            if (!name || !email || !password) {
                res.status(400).json({ 
                    error: 'Name, email, and password are required' 
                });
                return;
            }

            // Admin registration: only allow if no admin exists yet
            if (role === 'admin') {
                const existingAdmin = await UserService.findAnyAdmin();
                if (existingAdmin) {
                    res.status(403).json({ error: 'Admin user already exists. Only one admin can be registered via API.' });
                    return;
                }
            }

            // Determine business context
            let targetBusinessId = businessId;
            
            if (businessSlug) {
                // If business slug is provided, get the business ID
                const business = await BusinessService.getBusinessBySlug(businessSlug);
                if (!business) {
                    res.status(404).json({ 
                        error: 'Business not found' 
                    });
                    return;
                }
                targetBusinessId = business.id;
            } else if (!businessId) {
                res.status(400).json({ 
                    error: 'Business ID or business slug is required' 
                });
                return;
            }

            // Verify business exists and is active
            const business = await BusinessService.getBusinessById(targetBusinessId);
            if (!business || !business.isActive) {
                res.status(404).json({ 
                    error: 'Business not found or inactive' 
                });
                return;
            }

            // Check if user already exists in this business
            const existingUser = await UserService.userExists(email, targetBusinessId);
            if (existingUser) {
                res.status(409).json({ 
                    error: 'User with this email already exists in this business' 
                });
                return;
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
                role: role === 'admin' ? 'admin' : 'cashier'
            });

            // Generate JWT token with business context
            const token = jwt.sign(
                { 
                    userId: newUser.id, 
                    businessId: newUser.businessId,
                    email: newUser.email,
                    role: newUser.role
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(201).json({
                message: 'User registered successfully',
                user: newUser,
                business: {
                    id: business.id,
                    name: business.name,
                    slug: business.slug
                },
                token
            });

        } catch (error) {
            logger(`Error in register: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    public static login: RequestHandler = async (req: Request, res: Response) => {
        try {
            logger('API endpoint /auth/login was called...');
            
            const { email, password, businessId, businessSlug } = req.body;

            // Validate input
            if (!email || !password) {
                res.status(400).json({ 
                    error: 'Email and password are required' 
                });
                return;
            }

            // Determine business context
            let targetBusinessId = businessId;
            
            if (businessSlug) {
                // If business slug is provided, get the business ID
                const business = await BusinessService.getBusinessBySlug(businessSlug);
                if (!business) {
                    res.status(404).json({ 
                        error: 'Business not found' 
                    });
                    return;
                }
                targetBusinessId = business.id;
            } else if (!businessId) {
                res.status(400).json({ 
                    error: 'Business ID or business slug is required' 
                });
                return;
            }

            // Find user by email within the business
            const user = await UserService.getUserByEmail(email, targetBusinessId);
            if (!user) {
                res.status(401).json({ 
                    error: 'Invalid email or password' 
                });
                return;
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.get('password') as string);
            if (!isValidPassword) {
                res.status(401).json({ 
                    error: 'Invalid email or password' 
                });
                return;
            }

            // Get business info
            const business = await BusinessService.getBusinessById(targetBusinessId);

            // Generate JWT token with business context
            const token = jwt.sign(
                { 
                    userId: user.get('id') as number, 
                    businessId: user.get('businessId') as number,
                    email: user.get('email') as string,
                    role: user.get('role') as string
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Return user data without password
            const userData = user.toJSON();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password: _, ...userWithoutPassword } = userData;

            res.json({
                message: 'Login successful',
                user: userWithoutPassword,
                business: business ? {
                    id: business.id,
                    name: business.name,
                    slug: business.slug,
                    primaryColor: business.primaryColor,
                    secondaryColor: business.secondaryColor,
                    logo: business.logo,
                    currency: business.currency,
                    taxRate: business.taxRate,
                    timezone: business.timezone
                } : null,
                token
            });

        } catch (error) {
            logger(`Error in login: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    public static getProfile: RequestHandler = async (req: Request, res: Response) => {
        try {
            const authReq = req as any;
            if (!authReq.user) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }

            const { userId, businessId } = authReq.user;
            
            const user = await UserService.getUserById(userId, businessId);
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            const business = await BusinessService.getBusinessById(businessId);

            res.json({
                user,
                business: business ? {
                    id: business.id,
                    name: business.name,
                    slug: business.slug,
                    primaryColor: business.primaryColor,
                    secondaryColor: business.secondaryColor,
                    logo: business.logo,
                    currency: business.currency,
                    taxRate: business.taxRate,
                    timezone: business.timezone
                } : null
            });

        } catch (error) {
            logger(`Error getting profile: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
} 