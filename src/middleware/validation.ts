import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult, ValidationChain } from 'express-validator';
import { ValidationError } from '../utils/errors';

/**
 * Middleware to handle validation results
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.type === 'field' ? error.path : 'unknown',
            message: error.msg,
            value: error.type === 'field' ? error.value : undefined
        }));
        
        throw new ValidationError('Validation failed', errorMessages);
    }
    next();
};

/**
 * Generic validation middleware that combines validation chains with error handling
 */
export const validate = (validations: ValidationChain[]) => {
    return [...validations, handleValidationErrors];
};

// ============================================================================
// AUTHENTICATION VALIDATION SCHEMAS
// ============================================================================

/**
 * Login validation schema
 */
export const loginValidation = validate([
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage('Email must be less than 255 characters'),
    
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .isLength({ max: 128 })
        .withMessage('Password must be less than 128 characters')
        .matches(/^(?=.*[a-zA-Z])/)
        .withMessage('Password must contain at least one letter'),
    
    body('businessId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Business ID must be a positive integer'),
    
    body('businessSlug')
        .optional()
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Business slug must be between 3 and 50 characters')
        .matches(/^[a-z0-9-]+$/)
        .withMessage('Business slug can only contain lowercase letters, numbers, and hyphens')
        .custom((value) => {
            if (value && value.startsWith('-')) {
                throw new Error('Business slug cannot start with a hyphen');
            }
            if (value && value.endsWith('-')) {
                throw new Error('Business slug cannot end with a hyphen');
            }
            return true;
        }),
    
    // Ensure either businessId or businessSlug is provided
    body()
        .custom((value) => {
            if (!value.businessId && !value.businessSlug) {
                throw new Error('Either businessId or businessSlug is required');
            }
            return true;
        })
]);

/**
 * Register validation schema
 */
export const registerValidation = validate([
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
    
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage('Email must be less than 255 characters'),
    
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .isLength({ max: 128 })
        .withMessage('Password must be less than 128 characters')
        .matches(/^(?=.*[a-z])/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/^(?=.*[A-Z])/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/^(?=.*\d)/)
        .withMessage('Password must contain at least one number')
        .matches(/^(?=.*[@$!%*?&])/)
        .withMessage('Password must contain at least one special character (@$!%*?&)'),
    
    body('businessId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Business ID must be a positive integer'),
    
    body('businessSlug')
        .optional()
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Business slug must be between 3 and 50 characters')
        .matches(/^[a-z0-9-]+$/)
        .withMessage('Business slug can only contain lowercase letters, numbers, and hyphens')
        .custom((value) => {
            if (value && value.startsWith('-')) {
                throw new Error('Business slug cannot start with a hyphen');
            }
            if (value && value.endsWith('-')) {
                throw new Error('Business slug cannot end with a hyphen');
            }
            return true;
        }),
    
    body('role')
        .optional()
        .isIn(['admin', 'cashier', 'manager'])
        .withMessage('Role must be one of: admin, cashier, manager'),
    
    // Ensure either businessId or businessSlug is provided
    body()
        .custom((value) => {
            if (!value.businessId && !value.businessSlug) {
                throw new Error('Either businessId or businessSlug is required');
            }
            return true;
        })
]);

// ============================================================================
// BUSINESS VALIDATION SCHEMAS
// ============================================================================

/**
 * Business creation validation schema
 */
export const createBusinessValidation = validate([
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Business name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z0-9\s&'-]+$/)
        .withMessage('Business name can only contain letters, numbers, spaces, ampersands, hyphens, and apostrophes'),
    
    body('slug')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Business slug must be between 3 and 50 characters')
        .matches(/^[a-z0-9-]+$/)
        .withMessage('Business slug can only contain lowercase letters, numbers, and hyphens')
        .custom((value) => {
            if (value && value.startsWith('-')) {
                throw new Error('Business slug cannot start with a hyphen');
            }
            if (value && value.endsWith('-')) {
                throw new Error('Business slug cannot end with a hyphen');
            }
            return true;
        }),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must be less than 500 characters'),
    
    body('primaryColor')
        .optional()
        .matches(/^#[0-9A-Fa-f]{6}$/)
        .withMessage('Primary color must be a valid hex color (e.g., #007bff)'),
    
    body('secondaryColor')
        .optional()
        .matches(/^#[0-9A-Fa-f]{6}$/)
        .withMessage('Secondary color must be a valid hex color (e.g., #6c757d)'),
    
    body('taxRate')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Tax rate must be between 0 and 100'),
    
    body('currency')
        .optional()
        .isLength({ min: 3, max: 3 })
        .withMessage('Currency must be a 3-letter code (e.g., USD)')
        .isUppercase()
        .withMessage('Currency must be uppercase'),
    
    body('timezone')
        .optional()
        .isLength({ min: 3, max: 50 })
        .withMessage('Timezone must be between 3 and 50 characters')
]);

// ============================================================================
// USER VALIDATION SCHEMAS
// ============================================================================

/**
 * User update validation schema
 */
export const updateUserValidation = validate([
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
    
    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage('Email must be less than 255 characters'),
    
    body('role')
        .optional()
        .isIn(['admin', 'cashier', 'manager'])
        .withMessage('Role must be one of: admin, cashier, manager'),
    
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be a boolean value')
]);

// ============================================================================
// ITEM VALIDATION SCHEMAS
// ============================================================================

/**
 * Item creation/update validation schema
 */
export const itemValidation = validate([
    body('name')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Item name must be between 1 and 100 characters'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must be less than 500 characters'),
    
    body('price')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    
    body('categoryId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Category ID must be a positive integer'),
    
    body('isAvailable')
        .optional()
        .isBoolean()
        .withMessage('isAvailable must be a boolean value'),
    
    body('imageUrl')
        .optional()
        .isURL()
        .withMessage('Image URL must be a valid URL')
        .isLength({ max: 500 })
        .withMessage('Image URL must be less than 500 characters')
]);

// ============================================================================
// SALE VALIDATION SCHEMAS
// ============================================================================

/**
 * Sale creation validation schema
 */
export const saleValidation = validate([
    body('totalAmount')
        .isFloat({ min: 0 })
        .withMessage('Total amount must be a positive number'),
    
    body('paymentMethod')
        .isIn(['cash', 'card', 'mobile', 'other'])
        .withMessage('Payment method must be one of: cash, card, mobile, other'),
    
    body('items')
        .isArray({ min: 1 })
        .withMessage('At least one item is required'),
    
    body('items.*.itemId')
        .isInt({ min: 1 })
        .withMessage('Item ID must be a positive integer'),
    
    body('items.*.quantity')
        .isInt({ min: 1 })
        .withMessage('Quantity must be a positive integer'),
    
    body('items.*.price')
        .isFloat({ min: 0 })
        .withMessage('Item price must be a positive number'),
    
    body('customerId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Customer ID must be a positive integer'),
    
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Notes must be less than 500 characters')
]);

// ============================================================================
// PARAMETER VALIDATION SCHEMAS
// ============================================================================

/**
 * ID parameter validation
 */
export const idParamValidation = validate([
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID must be a positive integer')
]);

/**
 * Business ID parameter validation
 */
export const businessIdParamValidation = validate([
    param('businessId')
        .isInt({ min: 1 })
        .withMessage('Business ID must be a positive integer')
]);

// ============================================================================
// QUERY VALIDATION SCHEMAS
// ============================================================================

/**
 * Pagination query validation
 */
export const paginationValidation = validate([
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    
    query('sortBy')
        .optional()
        .isIn(['createdAt', 'updatedAt', 'name', 'id'])
        .withMessage('Sort by must be one of: createdAt, updatedAt, name, id'),
    
    query('sortOrder')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Sort order must be either asc or desc')
]);

// ============================================================================
// CUSTOM VALIDATION FUNCTIONS
// ============================================================================

/**
 * Custom validation for business slug uniqueness
 * This would typically check against the database
 */
export const validateBusinessSlugUniqueness = (value: string) => {
    // This is a placeholder - in a real implementation, you'd check the database
    // For now, we'll just validate the format
    if (!value) return true;
    
    if (!/^[a-z0-9-]+$/.test(value)) {
        throw new Error('Business slug can only contain lowercase letters, numbers, and hyphens');
    }
    
    if (value.startsWith('-') || value.endsWith('-')) {
        throw new Error('Business slug cannot start or end with a hyphen');
    }
    
    return true;
};

/**
 * Custom validation for password strength
 */
export const validatePasswordStrength = (password: string) => {
    if (!password) return true;
    
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);
    
    if (password.length < minLength) {
        throw new Error(`Password must be at least ${minLength} characters long`);
    }
    
    if (!hasUpperCase) {
        throw new Error('Password must contain at least one uppercase letter');
    }
    
    if (!hasLowerCase) {
        throw new Error('Password must contain at least one lowercase letter');
    }
    
    if (!hasNumbers) {
        throw new Error('Password must contain at least one number');
    }
    
    if (!hasSpecialChar) {
        throw new Error('Password must contain at least one special character (@$!%*?&)');
    }
    
    return true;
}; 