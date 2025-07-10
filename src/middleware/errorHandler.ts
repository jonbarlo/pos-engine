import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { 
    ApiError, 
    isApiError, 
    isOperationalError, 
    createErrorResponse,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    DatabaseError,
    ServiceError
} from '../utils/errors';

/**
 * Global error handling middleware
 */
export const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    let apiError: ApiError;

    // If it's already an ApiError, use it
    if (isApiError(error)) {
        apiError = error;
    } else {
        // Convert other errors to ApiError
        apiError = new ServiceError(error.message || 'Internal server error');
    }

    // Log the error
    if (isOperationalError(apiError)) {
        logger(`Operational Error: ${apiError.message} - Status: ${apiError.statusCode} - Code: ${apiError.code} - Path: ${req.path} - Method: ${req.method}`);
    } else {
        // Log unexpected errors with full stack trace
        logger(`Unexpected Error: ${apiError.message} - Status: ${apiError.statusCode} - Code: ${apiError.code} - Path: ${req.path} - Method: ${req.method} - Stack: ${apiError.stack}`);
    }

    // Create error response
    const errorResponse = createErrorResponse(apiError, req);

    // Send response
    res.status(apiError.statusCode).json(errorResponse);
};

/**
 * 404 handler for unmatched routes
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
    const error = new NotFoundError(`Route ${req.originalUrl} not found`);
    next(error);
};

/**
 * Async error wrapper to catch async errors
 */
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Validation error handler for specific validation failures
 */
export const handleValidationError = (error: any): ValidationError => {
    if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map((err: any) => err.message).join(', ');
        const details = error.errors.map((err: any) => ({
            field: err.path || 'unknown',
            message: err.message,
            value: err.value
        }));
        return new ValidationError(`Validation failed: ${messages}`, details, 'VALIDATION_ERROR');
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
        const field = error.errors[0]?.path || 'field';
        const details = error.errors.map((err: any) => ({
            field: err.path || 'unknown',
            message: err.message,
            value: err.value
        }));
        return new ValidationError(`${field} already exists`, details, 'UNIQUE_CONSTRAINT_ERROR');
    }

    return new ValidationError(error.message || 'Validation failed');
};

/**
 * Database error handler
 */
export const handleDatabaseError = (error: any): DatabaseError => {
    if (error.name === 'SequelizeConnectionError') {
        return new DatabaseError('Database connection failed', 'CONNECTION_ERROR');
    }
    
    if (error.name === 'SequelizeTimeoutError') {
        return new DatabaseError('Database operation timed out', 'TIMEOUT_ERROR');
    }

    return new DatabaseError(error.message || 'Database operation failed');
}; 