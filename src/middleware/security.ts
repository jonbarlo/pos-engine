import { Request, Response, NextFunction } from 'express';
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import Joi from 'joi';
import { logger } from '../utils/logger';

// Rate limiting configurations
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 100 : 20, // More lenient in development
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  handler: (req: any, res) => {
    logger(`Rate limit exceeded for auth endpoint from IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many login attempts',
      message: 'Please wait 15 minutes before trying again',
      retryAfter: 900 // 15 minutes in seconds
    });
  }
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 500 : 200, // More lenient in development
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req: any, res) => {
    logger(`Rate limit exceeded for API endpoint from IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests',
      message: 'Please wait 15 minutes before trying again',
      retryAfter: 900 // 15 minutes in seconds
    });
  }
});

export const analyticsLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 requests per window per IP
  message: 'Too many analytics requests',
  standardHeaders: true,
  legacyHeaders: false
});

// CORS configuration
export const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all localhost origins
    if (process.env.NODE_ENV === 'development') {
      if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
        return callback(null, true);
      }
    }
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8080',
      'http://localhost:53451', // Add the port that's being blocked
      'https://yourdomain.com', // Replace with your actual domain
      'https://www.yourdomain.com'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

// Security headers configuration
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

// Request validation middleware
export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      }));

      logger(`Validation error: ${JSON.stringify(errorDetails)}`);
      
      res.status(400).json({
        error: 'Validation failed',
        details: errorDetails
      });
      return;
    }

    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
};

// Common validation schemas
export const validationSchemas = {
  // User registration
  userRegistration: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
    role: Joi.string().valid('OWNER', 'ADMIN', 'MANAGER', 'WAIT_STAFF', 'CASHIER', 'VIEWER').required(),
    businessId: Joi.number().integer().positive().required()
  }),

  // User login
  userLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    businessId: Joi.number().integer().positive().optional(),
    businessSlug: Joi.string().optional()
  }).or('businessId', 'businessSlug'),

  // Create sale
  createSale: Joi.object({
    customerId: Joi.number().integer().positive().optional(),
    customerName: Joi.string().max(100).optional(),
    customerEmail: Joi.string().email().optional(),
    items: Joi.array().items(Joi.object({
      itemId: Joi.number().integer().positive().required(),
      quantity: Joi.number().integer().positive().required(),
      unitPrice: Joi.number().positive().required(),
      notes: Joi.string().max(500).optional()
    })).min(1).required(),
    paymentMethod: Joi.string().valid('cash', 'credit_card', 'debit_card', 'mobile_payment').required(),
    discountAmount: Joi.number().min(0).default(0),
    notes: Joi.string().max(1000).optional()
  }),

  // Create order
  createOrder: Joi.object({
    tableId: Joi.number().integer().positive().optional(),
    customerId: Joi.number().integer().positive().optional(),
    items: Joi.array().items(Joi.object({
      itemId: Joi.number().integer().positive().required(),
      quantity: Joi.number().integer().positive().required(),
      specialInstructions: Joi.string().max(500).optional()
    })).min(1).required(),
    orderType: Joi.string().valid('DINE_IN', 'TAKEAWAY', 'DELIVERY').required(),
    notes: Joi.string().max(1000).optional(),
    specialInstructions: Joi.string().max(1000).optional()
  }),

  // Analytics filters
  analyticsFilters: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
    period: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly').optional(),
    limit: Joi.number().integer().min(1).max(100).optional()
  }),

  // Floor plan creation
  createFloorPlan: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    width: Joi.number().integer().positive().required(),
    height: Joi.number().integer().positive().required(),
    backgroundImage: Joi.string().uri().optional(),
    isActive: Joi.boolean().default(true)
  }),

  // Table position update
  updateTablePosition: Joi.object({
    x: Joi.number().min(0).required(),
    y: Joi.number().min(0).required(),
    rotation: Joi.number().min(0).max(360).default(0),
    width: Joi.number().positive().required(),
    height: Joi.number().positive().required()
  })
};

// Request sanitization middleware
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize common fields
  if (req.body) {
    // Remove potential XSS vectors
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      }
    });
  }

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key]?.toString()
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      }
    });
  }

  next();
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      businessId: (req as any).user?.businessId || 'unauthenticated'
    };
    
    if (res.statusCode >= 400) {
      logger(`Request failed: ${JSON.stringify(logData)}`);
    } else {
      logger(`Request completed: ${JSON.stringify(logData)}`);
    }
  });

  next();
};

// Error handling for security middleware
export const securityErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.message === 'Not allowed by CORS') {
    logger(`CORS error: ${req.ip} - ${req.originalUrl}`);
    return res.status(403).json({
      error: 'CORS policy violation',
      message: 'Request not allowed from this origin'
    });
  }

  if (err.type === 'entity.too.large') {
    logger(`Request too large: ${req.ip} - ${req.originalUrl}`);
    return res.status(413).json({
      error: 'Request too large',
      message: 'Request body exceeds maximum allowed size'
    });
  }

  // Pass to next error handler
  return next(err);
}; 