import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'POS Engine API',
      version: '1.0.0',
      description: 'A comprehensive Point of Sale (POS) system API with multi-tenant support, business management, and role-based authentication.',
      contact: {
        name: 'API Support',
        email: 'support@posengine.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:3031',
        description: 'Development server'
      },
      {
        url: 'https://your-production-domain.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Business: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Demo Business' },
            slug: { type: 'string', example: 'demo-business' },
            description: { type: 'string', example: 'A demo business for testing' },
            logo: { type: 'string', nullable: true },
            primaryColor: { type: 'string', nullable: true },
            secondaryColor: { type: 'string', nullable: true },
            address: { type: 'string', nullable: true },
            phone: { type: 'string', nullable: true },
            email: { type: 'string', nullable: true },
            website: { type: 'string', nullable: true },
            taxRate: { type: 'number', example: 8.5 },
            currency: { type: 'string', example: 'USD' },
            timezone: { type: 'string', example: 'America/New_York' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            businessId: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Admin User' },
            email: { type: 'string', example: 'admin@demo.com' },
            role: { type: 'string', enum: ['admin', 'cashier'], example: 'admin' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Item: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            businessId: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Laptop' },
            description: { type: 'string', example: 'High-performance laptop' },
            price: { type: 'number', example: 999.99 },
            stock: { type: 'integer', example: 10 },
            category: { type: 'string', example: 'Electronics' },
            sku: { type: 'string', example: 'LAP001' },
            barcode: { type: 'string', nullable: true },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Sale: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            businessId: { type: 'integer', example: 1 },
            userId: { type: 'integer', example: 1 },
            customerName: { type: 'string', example: 'John Doe' },
            customerEmail: { type: 'string', example: 'john@example.com' },
            subtotal: { type: 'number', example: 1099.99 },
            tax: { type: 'number', example: 93.50 },
            discount: { type: 'number', example: 0 },
            total: { type: 'number', example: 1193.49 },
            paymentMethod: { type: 'string', example: 'card' },
            status: { type: 'string', enum: ['pending', 'completed', 'cancelled'], example: 'completed' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password', 'businessSlug'],
          properties: {
            email: { type: 'string', example: 'admin@demo.com' },
            password: { type: 'string', example: 'admin123' },
            businessSlug: { type: 'string', example: 'demo-business' }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Login successful' },
            user: { $ref: '#/components/schemas/User' },
            business: { $ref: '#/components/schemas/Business' },
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Bad Request' },
            message: { type: 'string', example: 'Missing required fields' }
          }
        }
      }
    },
    tags: [
      {
        name: 'Health',
        description: 'Health check and monitoring endpoints'
      },
      {
        name: 'Authentication',
        description: 'User authentication and authorization'
      },
      {
        name: 'Businesses',
        description: 'Business management (admin only)'
      },
      {
        name: 'Users',
        description: 'User management within businesses'
      },
      {
        name: 'Items',
        description: 'Product catalog management'
      },
      {
        name: 'Sales',
        description: 'Sales and transaction management'
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/index.ts']
};

export const specs = swaggerJsdoc(options); 