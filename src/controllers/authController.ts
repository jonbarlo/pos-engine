import { Request, Response, RequestHandler } from 'express';
import { logger } from '../utils/logger';
import { AuthService } from '../services/authService';
import { asyncHandler } from '../middleware/errorHandler';

export class AuthController {
    public static register: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
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

        res.status(201).json({
            message: req.t('auth.register.success'),
            data: result
        });
    });

    public static login: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
        logger('API endpoint /auth/login was called...');
        
        const { email, password, businessId, businessSlug } = req.body;

        const result = await AuthService.login({
            email,
            password,
            businessId,
            businessSlug
        });

        res.json({
            message: req.t('auth.login.success'),
            data: result
        });
    });

    public static getProfile: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
        const authReq = req as any;
        if (!authReq.user) {
            throw new Error('Authentication required');
        }

        const { userId, businessId } = authReq.user;
        
        const result = await AuthService.getProfile(userId, businessId);

        res.json({
            message: req.t('auth.profile.title'),
            data: result
        });
    });
} 