import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { KitchenAssignment, UserRole } from '../models/UserModel';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
    user?: {
        userId: number;
        businessId: number;
        email: string;
        role: string;
        assignment?: string;
    };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        logger('Authentication failed: No token provided');
        res.status(401).json({ error: 'Access token required' });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { 
            userId: number; 
            businessId: number; 
            email: string; 
            role: string; 
            assignment?: string;
        };
        req.user = decoded;
        logger(`Authentication successful for user: ${decoded.email} in business: ${decoded.businessId}`);
        next();
    } catch (error) {
        logger(`Authentication failed: Invalid token - ${error}`);
        res.status(403).json({ error: 'Invalid or expired token' });
        return;
    }
};

// Middleware to check if user has required role
export const requireRole = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            logger('Role check failed: No user in request');
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        if (!roles.includes(req.user.role)) {
            logger(`Role check failed: User ${req.user.email} has role ${req.user.role}, required: ${roles.join(', ')}`);
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }

        logger(`Role check passed for user ${req.user.email} with role ${req.user.role}`);
        next();
    };
};

// Alias for requireRole for backward compatibility
export const authorizeRoles = requireRole;

// Middleware to check if user belongs to the specified business
export const requireBusinessAccess = (req: AuthRequest, res: Response, next: NextFunction) => {
    const businessId = parseInt(req.params.businessId || req.body.businessId);
    
    if (!req.user) {
        logger('Business access check failed: No user in request');
        res.status(401).json({ error: 'Authentication required' });
        return;
    }

    if (isNaN(businessId) || req.user.businessId !== businessId) {
        logger(`Business access check failed: User ${req.user.email} tried to access business ${businessId}, belongs to ${req.user.businessId}`);
        res.status(403).json({ error: 'Access denied to this business' });
        return;
    }

    logger(`Business access check passed for user ${req.user.email} accessing business ${businessId}`);
    next();
};

// Kitchen permission middleware functions
export const requireKitchenRead = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        logger('Kitchen read check failed: No user in request');
        res.status(401).json({ error: 'Authentication required' });
        return;
    }

    const { role, assignment } = req.user;
    
    // Check if user has kitchen read access
    const hasKitchenRead = 
        role === UserRole.ADMIN ||
        role === UserRole.OWNER ||
        role === UserRole.MANAGER ||
        role === UserRole.KITCHEN_STAFF ||
        assignment === KitchenAssignment.KITCHEN_READ ||
        assignment === KitchenAssignment.KITCHEN_WRITE ||
        assignment === KitchenAssignment.KITCHEN_MANAGER;

    if (!hasKitchenRead) {
        logger(`Kitchen read check failed: User ${req.user.email} has role ${role}, assignment ${assignment}`);
        res.status(403).json({ error: 'Kitchen read access required' });
        return;
    }

    logger(`Kitchen read check passed for user ${req.user.email}`);
    next();
};

export const requireKitchenWrite = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        logger('Kitchen write check failed: No user in request');
        res.status(401).json({ error: 'Authentication required' });
        return;
    }

    const { role, assignment } = req.user;
    
    // Check if user has kitchen write access
    const hasKitchenWrite = 
        role === UserRole.ADMIN ||
        role === UserRole.OWNER ||
        role === UserRole.MANAGER ||
        role === UserRole.KITCHEN_STAFF ||
        assignment === KitchenAssignment.KITCHEN_WRITE ||
        assignment === KitchenAssignment.KITCHEN_MANAGER;

    if (!hasKitchenWrite) {
        logger(`Kitchen write check failed: User ${req.user.email} has role ${role}, assignment ${assignment}`);
        res.status(403).json({ error: 'Kitchen write access required' });
        return;
    }

    logger(`Kitchen write check passed for user ${req.user.email}`);
    next();
};

export const requireKitchenManager = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        logger('Kitchen manager check failed: No user in request');
        res.status(401).json({ error: 'Authentication required' });
        return;
    }

    const { role, assignment } = req.user;
    
    // Check if user has kitchen manager access
    const hasKitchenManager = 
        role === UserRole.ADMIN ||
        role === UserRole.OWNER ||
        role === UserRole.MANAGER ||
        assignment === KitchenAssignment.KITCHEN_MANAGER;

    if (!hasKitchenManager) {
        logger(`Kitchen manager check failed: User ${req.user.email} has role ${role}, assignment ${assignment}`);
        res.status(403).json({ error: 'Kitchen manager access required' });
        return;
    }

    logger(`Kitchen manager check passed for user ${req.user.email}`);
    next();
}; 