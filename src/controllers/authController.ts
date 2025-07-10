import { Request, Response, RequestHandler } from 'express';
import { logger } from '../utils/logger';
import { AuthService } from '../services/authService';

export class AuthController {
    public static register: RequestHandler = async (req: Request, res: Response) => {
        try {
            logger('API endpoint /auth/register was called...');
            
            const { name, email, password, businessId, businessSlug, role } = req.body;

            const result = await AuthService.register({
                name,
                email,
                password,
                businessId,
                businessSlug,
                role
            });

            res.status(201).json(result);

        } catch (error) {
            logger(`Error in register: ${error}`);
            
            if (error instanceof Error) {
                const message = error.message;
                if (message.includes('required')) {
                    res.status(400).json({ error: message });
                } else if (message.includes('already exists')) {
                    res.status(409).json({ error: message });
                } else if (message.includes('not found')) {
                    res.status(404).json({ error: message });
                } else if (message.includes('Admin user already exists')) {
                    res.status(403).json({ error: message });
                } else {
                    res.status(500).json({ error: 'Internal server error' });
                }
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    };

    public static login: RequestHandler = async (req: Request, res: Response) => {
        try {
            logger('API endpoint /auth/login was called...');
            
            const { email, password, businessId, businessSlug } = req.body;

            const result = await AuthService.login({
                email,
                password,
                businessId,
                businessSlug
            });

            res.json(result);

        } catch (error) {
            logger(`Error in login: ${error}`);
            
            if (error instanceof Error) {
                const message = error.message;
                if (message.includes('required')) {
                    res.status(400).json({ error: message });
                } else if (message.includes('Invalid email or password')) {
                    res.status(401).json({ error: message });
                } else if (message.includes('not found')) {
                    res.status(404).json({ error: message });
                } else {
                    res.status(500).json({ error: 'Internal server error' });
                }
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
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
            
            const result = await AuthService.getProfile(userId, businessId);

            res.json(result);

        } catch (error) {
            logger(`Error getting profile: ${error}`);
            
            if (error instanceof Error) {
                const message = error.message;
                if (message.includes('not found')) {
                    res.status(404).json({ error: message });
                } else {
                    res.status(500).json({ error: 'Internal server error' });
                }
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    };
} 