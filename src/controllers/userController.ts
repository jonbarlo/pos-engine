import { Request, Response, RequestHandler } from 'express';
import { logger } from '../utils/logger';
import { UserService } from '../services/userService';

export class UserController {

    // Get all users
    public static getAll: RequestHandler = async (req: Request, res: Response) => {
        try {
            logger('API endpoint /users was called...');
            const users = await UserService.getAllUsers();
            res.json(users);
        } catch (error) {
            logger(`Error getting users: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    // Get user by ID
    public static getUserById: RequestHandler = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            
            if (!id) {
                res.status(400).json({ error: 'User ID is required' });
                return;
            }
            
            const userId = parseInt(id);
            
            if (isNaN(userId)) {
                res.status(400).json({ error: 'Invalid user ID' });
                return;
            }

            logger(`API endpoint /users/${id} was called...`);
            const user = await UserService.getUserById(userId);
            
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

    // Create new user
    public static createUser: RequestHandler = async (req: Request, res: Response) => {
        try {
            const { name, email, password } = req.body;

            // Validate input
            if (!name || !email || !password) {
                res.status(400).json({ 
                    error: 'Name, email, and password are required' 
                });
                return;
            }

            // Check if user already exists
            const existingUser = await UserService.userExists(email);
            if (existingUser) {
                res.status(409).json({ 
                    error: 'User with this email already exists' 
                });
                return;
            }

            logger('API endpoint POST /users was called...');
            const newUser = await UserService.createUser({ name, email, password });
            res.status(201).json(newUser);
        } catch (error) {
            logger(`Error creating user: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    // Update user
    public static updateUser: RequestHandler = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            
            if (!id) {
                res.status(400).json({ error: 'User ID is required' });
                return;
            }
            
            const userId = parseInt(id);
            
            if (isNaN(userId)) {
                res.status(400).json({ error: 'Invalid user ID' });
                return;
            }

            const { name, email, password } = req.body;
            const updateData: any = {};
            
            if (name) updateData.name = name;
            if (email) updateData.email = email;
            if (password) updateData.password = password;

            if (Object.keys(updateData).length === 0) {
                res.status(400).json({ error: 'No fields to update' });
                return;
            }

            logger(`API endpoint PUT /users/${id} was called...`);
            const updatedUser = await UserService.updateUser(userId, updateData);
            
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

    // Delete user
    public static deleteUser: RequestHandler = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            
            if (!id) {
                res.status(400).json({ error: 'User ID is required' });
                return;
            }
            
            const userId = parseInt(id);
            
            if (isNaN(userId)) {
                res.status(400).json({ error: 'Invalid user ID' });
                return;
            }

            logger(`API endpoint DELETE /users/${id} was called...`);
            const deleted = await UserService.deleteUser(userId);
            
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
}