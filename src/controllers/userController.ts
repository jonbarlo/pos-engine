import { Request, Response, RequestHandler } from 'express';
import { logger } from '../utils/logger';
import { UserService } from '../services/userService';

interface AuthRequest extends Request {
    user?: {
        userId: number;
        businessId: number;
        email: string;
        role: string;
    };
}

export class UserController {

    // Get all users for the current business
    public static getAll: RequestHandler = async (req: AuthRequest, res: Response) => {
        try {
            logger('API endpoint /users was called...');
            
            if (!req.user?.businessId) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }

            const users = await UserService.getAllUsers(req.user.businessId);
            res.json(users);
        } catch (error) {
            logger(`Error getting users: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    // Get user by ID within the current business
    public static getUserById: RequestHandler = async (req: AuthRequest, res: Response) => {
        try {
            const { id } = req.params;
            
            if (!id) {
                res.status(400).json({ error: 'User ID is required' });
                return;
            }
            
            if (!req.user?.businessId) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            
            const userId = parseInt(id);
            
            if (isNaN(userId)) {
                res.status(400).json({ error: 'Invalid user ID' });
                return;
            }

            logger(`API endpoint /users/${id} was called...`);
            const user = await UserService.getUserById(userId, req.user.businessId);
            
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            res.json(user);
        } catch (error) {
            logger(`Error getting user by ID: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    // Create new user in the current business
    public static createUser: RequestHandler = async (req: AuthRequest, res: Response) => {
        try {
            if (!req.user?.businessId) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }

            const { name, email, password, role, assignment } = req.body;

            // Validate input
            if (!name || !email || !password) {
                res.status(400).json({ 
                    error: 'Name, email, and password are required' 
                });
                return;
            }

            // Check if user already exists in this business
            const existingUser = await UserService.userExists(email, req.user.businessId);
            if (existingUser) {
                res.status(409).json({ 
                    error: 'User with this email already exists in this business' 
                });
                return;
            }

            logger('API endpoint POST /users was called...');
            const newUser = await UserService.createUser({ 
                name, 
                email, 
                password, 
                businessId: req.user.businessId,
                role: role || 'cashier',
                assignment: assignment || null
            });
            res.status(201).json(newUser);
        } catch (error) {
            logger(`Error creating user: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    // Update user within the current business
    public static updateUser: RequestHandler = async (req: AuthRequest, res: Response) => {
        try {
            const { id } = req.params;
            
            if (!id) {
                res.status(400).json({ error: 'User ID is required' });
                return;
            }
            
            if (!req.user?.businessId) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            
            const userId = parseInt(id);
            
            if (isNaN(userId)) {
                res.status(400).json({ error: 'Invalid user ID' });
                return;
            }

            const { name, email, password, role, isActive, assignment } = req.body;
            const updateData: any = {};
            
            if (name) updateData.name = name;
            if (email) updateData.email = email;
            if (password) updateData.password = password;
            if (role) updateData.role = role;
            if (isActive !== undefined) updateData.isActive = isActive;
            if (assignment !== undefined) updateData.assignment = assignment;

            if (Object.keys(updateData).length === 0) {
                res.status(400).json({ error: 'No fields to update' });
                return;
            }

            logger(`API endpoint PUT /users/${id} was called...`);
            const updatedUser = await UserService.updateUser(userId, req.user.businessId, updateData);
            
            if (!updatedUser) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            res.json(updatedUser);
        } catch (error) {
            logger(`Error updating user: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    // Delete user within the current business
    public static deleteUser: RequestHandler = async (req: AuthRequest, res: Response) => {
        try {
            const { id } = req.params;
            
            if (!id) {
                res.status(400).json({ error: 'User ID is required' });
                return;
            }
            
            if (!req.user?.businessId) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            
            const userId = parseInt(id);
            
            if (isNaN(userId)) {
                res.status(400).json({ error: 'Invalid user ID' });
                return;
            }

            logger(`API endpoint DELETE /users/${id} was called...`);
            const deleted = await UserService.deleteUser(userId, req.user.businessId);
            
            if (!deleted) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            logger(`Error deleting user: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    // Get users by role within the current business
    public static getUsersByRole: RequestHandler = async (req: AuthRequest, res: Response) => {
        try {
            const { role } = req.params;
            
            if (!role) {
                res.status(400).json({ error: 'Role is required' });
                return;
            }

            if (!req.user?.businessId) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }

            logger(`API endpoint /users/role/${role} was called...`);
            const users = await UserService.getUsersByRole(req.user.businessId, role);
            res.json(users);
        } catch (error) {
            logger(`Error getting users by role: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    // Search users within the current business
    public static searchUsers: RequestHandler = async (req: AuthRequest, res: Response) => {
        try {
            const { q } = req.query;
            
            if (!q || typeof q !== 'string') {
                res.status(400).json({ error: 'Search query is required' });
                return;
            }

            if (!req.user?.businessId) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }

            logger(`API endpoint /users/search?q=${q} was called...`);
            const users = await UserService.searchUsers(req.user.businessId, q);
            res.json(users);
        } catch (error) {
            logger(`Error searching users: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
}