/**
 * Base API Error class
 */
export class ApiError extends Error {
    public statusCode: number;
    public isOperational: boolean;
    public code?: string;

    constructor(
        message: string,
        statusCode: number = 500,
        isOperational: boolean = true,
        code?: string
    ) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        if (code) {
            this.code = code;
        }

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }

        // Set the prototype explicitly
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

/**
 * Validation Error - 400 Bad Request
 */
export class ValidationError extends ApiError {
    constructor(message: string, code?: string) {
        super(message, 400, true, code || 'VALIDATION_ERROR');
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

/**
 * Authentication Error - 401 Unauthorized
 */
export class AuthenticationError extends ApiError {
    constructor(message: string = 'Authentication required', code?: string) {
        super(message, 401, true, code || 'AUTHENTICATION_ERROR');
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}

/**
 * Authorization Error - 403 Forbidden
 */
export class AuthorizationError extends ApiError {
    constructor(message: string = 'Access denied', code?: string) {
        super(message, 403, true, code || 'AUTHORIZATION_ERROR');
        Object.setPrototypeOf(this, AuthorizationError.prototype);
    }
}

/**
 * Not Found Error - 404 Not Found
 */
export class NotFoundError extends ApiError {
    constructor(message: string, code?: string) {
        super(message, 404, true, code || 'NOT_FOUND_ERROR');
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

/**
 * Conflict Error - 409 Conflict
 */
export class ConflictError extends ApiError {
    constructor(message: string, code?: string) {
        super(message, 409, true, code || 'CONFLICT_ERROR');
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}

/**
 * Rate Limit Error - 429 Too Many Requests
 */
export class RateLimitError extends ApiError {
    constructor(message: string = 'Too many requests', code?: string) {
        super(message, 429, true, code || 'RATE_LIMIT_ERROR');
        Object.setPrototypeOf(this, RateLimitError.prototype);
    }
}

/**
 * Database Error - 500 Internal Server Error
 */
export class DatabaseError extends ApiError {
    constructor(message: string = 'Database operation failed', code?: string) {
        super(message, 500, true, code || 'DATABASE_ERROR');
        Object.setPrototypeOf(this, DatabaseError.prototype);
    }
}

/**
 * Service Error - 500 Internal Server Error
 */
export class ServiceError extends ApiError {
    constructor(message: string = 'Service operation failed', code?: string) {
        super(message, 500, true, code || 'SERVICE_ERROR');
        Object.setPrototypeOf(this, ServiceError.prototype);
    }
}

/**
 * External Service Error - 502 Bad Gateway
 */
export class ExternalServiceError extends ApiError {
    constructor(message: string = 'External service unavailable', code?: string) {
        super(message, 502, true, code || 'EXTERNAL_SERVICE_ERROR');
        Object.setPrototypeOf(this, ExternalServiceError.prototype);
    }
}

/**
 * Error response interface
 */
export interface ErrorResponse {
    success: false;
    error: {
        message: string;
        code?: string;
        statusCode: number;
        timestamp: string;
        path?: string;
        method?: string;
    };
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
    error: ApiError,
    req?: any
): ErrorResponse {
    const errorResponse: ErrorResponse = {
        success: false,
        error: {
            message: error.message,
            statusCode: error.statusCode,
            timestamp: new Date().toISOString()
        }
    };

    if (error.code) {
        errorResponse.error.code = error.code;
    }

    if (req?.path) {
        errorResponse.error.path = req.path;
    }

    if (req?.method) {
        errorResponse.error.method = req.method;
    }

    return errorResponse;
}

/**
 * Check if error is an ApiError
 */
export function isApiError(error: any): error is ApiError {
    return error instanceof ApiError;
}

/**
 * Check if error is operational (expected error)
 */
export function isOperationalError(error: any): boolean {
    if (isApiError(error)) {
        return error.isOperational;
    }
    return false;
} 