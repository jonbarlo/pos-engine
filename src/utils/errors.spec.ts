import {
    ApiError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    RateLimitError,
    DatabaseError,
    ServiceError,
    ExternalServiceError,
    createErrorResponse,
    isApiError,
    isOperationalError
} from './errors';

describe('Error Classes', () => {
    describe('ApiError', () => {
        it('should create ApiError with default values', () => {
            const error = new ApiError('Test error');
            
            expect(error.message).toBe('Test error');
            expect(error.statusCode).toBe(500);
            expect(error.isOperational).toBe(true);
            expect(error.code).toBeUndefined();
        });

        it('should create ApiError with custom values', () => {
            const error = new ApiError('Test error', 400, false, 'TEST_ERROR');
            
            expect(error.message).toBe('Test error');
            expect(error.statusCode).toBe(400);
            expect(error.isOperational).toBe(false);
            expect(error.code).toBe('TEST_ERROR');
        });

        it('should maintain stack trace', () => {
            const error = new ApiError('Test error');
            expect(error.stack).toBeDefined();
        });
    });

    describe('ValidationError', () => {
        it('should create ValidationError with correct defaults', () => {
            const error = new ValidationError('Invalid input');
            
            expect(error.message).toBe('Invalid input');
            expect(error.statusCode).toBe(400);
            expect(error.code).toBe('VALIDATION_ERROR');
        });

        it('should create ValidationError with custom code', () => {
            const error = new ValidationError('Invalid input', 'CUSTOM_VALIDATION');
            
            expect(error.message).toBe('Invalid input');
            expect(error.statusCode).toBe(400);
            expect(error.code).toBe('CUSTOM_VALIDATION');
        });
    });

    describe('AuthenticationError', () => {
        it('should create AuthenticationError with default message', () => {
            const error = new AuthenticationError();
            
            expect(error.message).toBe('Authentication required');
            expect(error.statusCode).toBe(401);
            expect(error.code).toBe('AUTHENTICATION_ERROR');
        });

        it('should create AuthenticationError with custom message', () => {
            const error = new AuthenticationError('Invalid token');
            
            expect(error.message).toBe('Invalid token');
            expect(error.statusCode).toBe(401);
            expect(error.code).toBe('AUTHENTICATION_ERROR');
        });
    });

    describe('AuthorizationError', () => {
        it('should create AuthorizationError with default message', () => {
            const error = new AuthorizationError();
            
            expect(error.message).toBe('Access denied');
            expect(error.statusCode).toBe(403);
            expect(error.code).toBe('AUTHORIZATION_ERROR');
        });
    });

    describe('NotFoundError', () => {
        it('should create NotFoundError', () => {
            const error = new NotFoundError('Resource not found');
            
            expect(error.message).toBe('Resource not found');
            expect(error.statusCode).toBe(404);
            expect(error.code).toBe('NOT_FOUND_ERROR');
        });
    });

    describe('ConflictError', () => {
        it('should create ConflictError', () => {
            const error = new ConflictError('Resource conflict');
            
            expect(error.message).toBe('Resource conflict');
            expect(error.statusCode).toBe(409);
            expect(error.code).toBe('CONFLICT_ERROR');
        });
    });

    describe('RateLimitError', () => {
        it('should create RateLimitError with default message', () => {
            const error = new RateLimitError();
            
            expect(error.message).toBe('Too many requests');
            expect(error.statusCode).toBe(429);
            expect(error.code).toBe('RATE_LIMIT_ERROR');
        });
    });

    describe('DatabaseError', () => {
        it('should create DatabaseError with default message', () => {
            const error = new DatabaseError();
            
            expect(error.message).toBe('Database operation failed');
            expect(error.statusCode).toBe(500);
            expect(error.code).toBe('DATABASE_ERROR');
        });
    });

    describe('ServiceError', () => {
        it('should create ServiceError with default message', () => {
            const error = new ServiceError();
            
            expect(error.message).toBe('Service operation failed');
            expect(error.statusCode).toBe(500);
            expect(error.code).toBe('SERVICE_ERROR');
        });
    });

    describe('ExternalServiceError', () => {
        it('should create ExternalServiceError with default message', () => {
            const error = new ExternalServiceError();
            
            expect(error.message).toBe('External service unavailable');
            expect(error.statusCode).toBe(502);
            expect(error.code).toBe('EXTERNAL_SERVICE_ERROR');
        });
    });
});

describe('Error Utilities', () => {
    describe('createErrorResponse', () => {
        it('should create error response without request info', () => {
            const error = new ValidationError('Invalid input');
            const response = createErrorResponse(error);
            
            expect(response.success).toBe(false);
            expect(response.error.message).toBe('Invalid input');
            expect(response.error.statusCode).toBe(400);
            expect(response.error.code).toBe('VALIDATION_ERROR');
            expect(response.error.timestamp).toBeDefined();
            expect(response.error.path).toBeUndefined();
            expect(response.error.method).toBeUndefined();
        });

        it('should create error response with request info', () => {
            const error = new NotFoundError('Resource not found');
            const req = { path: '/api/test', method: 'GET' };
            const response = createErrorResponse(error, req);
            
            expect(response.success).toBe(false);
            expect(response.error.message).toBe('Resource not found');
            expect(response.error.statusCode).toBe(404);
            expect(response.error.code).toBe('NOT_FOUND_ERROR');
            expect(response.error.path).toBe('/api/test');
            expect(response.error.method).toBe('GET');
        });

        it('should handle error without code', () => {
            const error = new ApiError('Test error', 500);
            const response = createErrorResponse(error);
            
            expect(response.error.code).toBeUndefined();
        });
    });

    describe('isApiError', () => {
        it('should return true for ApiError instances', () => {
            const error = new ValidationError('Test');
            expect(isApiError(error)).toBe(true);
        });

        it('should return false for regular Error instances', () => {
            const error = new Error('Test');
            expect(isApiError(error)).toBe(false);
        });

        it('should return false for other objects', () => {
            expect(isApiError({ message: 'test' })).toBe(false);
            expect(isApiError(null)).toBe(false);
            expect(isApiError(undefined)).toBe(false);
        });
    });

    describe('isOperationalError', () => {
        it('should return true for operational ApiError', () => {
            const error = new ValidationError('Test');
            expect(isOperationalError(error)).toBe(true);
        });

        it('should return false for non-operational ApiError', () => {
            const error = new ApiError('Test', 500, false);
            expect(isOperationalError(error)).toBe(false);
        });

        it('should return false for non-ApiError', () => {
            const error = new Error('Test');
            expect(isOperationalError(error)).toBe(false);
        });
    });
}); 