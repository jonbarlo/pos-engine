import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'POS Engine API',
      version: '1.0.0',
      description: 'A comprehensive Point of Sale (POS) system API with multi-tenant support, business management, role-based authentication, order management, reservations, kitchen display system, delivery management, and split billing.',
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
            name: { type: 'string', example: 'Demo Restaurant' },
            slug: { type: 'string', example: 'demo-restaurant' },
            type: { type: 'string', enum: ['restaurant', 'retail', 'service'], example: 'restaurant' },
            description: { type: 'string', example: 'A demo restaurant for testing' },
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
            role: { type: 'string', enum: ['admin', 'manager', 'cashier', 'kitchen'], example: 'admin' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Customer: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            businessId: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            phone: { type: 'string', example: '+1234567890' },
            loyaltyPoints: { type: 'integer', example: 150 },
            totalSpent: { type: 'number', example: 1250.75 },
            visitCount: { type: 'integer', example: 12 },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        MenuCategory: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            businessId: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Main Course' },
            description: { type: 'string', example: 'Main dishes' },
            sortOrder: { type: 'integer', example: 1 },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        MenuItem: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            businessId: { type: 'integer', example: 1 },
            categoryId: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Grilled Salmon' },
            description: { type: 'string', example: 'Fresh grilled salmon with herbs' },
            price: { type: 'number', example: 24.99 },
            cost: { type: 'number', example: 12.50 },
            image: { type: 'string', nullable: true },
            allergens: { type: 'array', items: { type: 'string' }, example: ['fish', 'dairy'] },
            nutritionalInfo: { type: 'object', example: { calories: 350, protein: 25, carbs: 5 } },
            preparationTime: { type: 'integer', example: 15 },
            isAvailable: { type: 'boolean', example: true },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Table: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            businessId: { type: 'integer', example: 1 },
            tableNumber: { type: 'string', example: 'A1' },
            capacity: { type: 'integer', example: 4 },
            status: { type: 'string', enum: ['available', 'occupied', 'reserved', 'cleaning'], example: 'available' },
            section: { type: 'string', example: 'Main Floor' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            businessId: { type: 'integer', example: 1 },
            customerId: { type: 'integer', nullable: true },
            tableId: { type: 'integer', nullable: true },
            orderNumber: { type: 'string', example: 'ORD-1234567890-123' },
            type: { type: 'string', enum: ['dine_in', 'takeaway', 'delivery'], example: 'dine_in' },
            status: { type: 'string', enum: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'], example: 'pending' },
            subtotal: { type: 'number', example: 45.99 },
            tax: { type: 'number', example: 3.91 },
            discount: { type: 'number', example: 0 },
            total: { type: 'number', example: 49.90 },
            notes: { type: 'string', nullable: true },
            estimatedReadyTime: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        OrderItem: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            orderId: { type: 'integer', example: 1 },
            menuItemId: { type: 'integer', example: 1 },
            quantity: { type: 'integer', example: 2 },
            unitPrice: { type: 'number', example: 24.99 },
            totalPrice: { type: 'number', example: 49.98 },
            notes: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['pending', 'preparing', 'ready', 'served'], example: 'pending' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Reservation: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            businessId: { type: 'integer', example: 1 },
            tableId: { type: 'integer', nullable: true },
            customerId: { type: 'integer', nullable: true },
            customerName: { type: 'string', example: 'John Doe' },
            customerEmail: { type: 'string', example: 'john@example.com' },
            customerPhone: { type: 'string', example: '+1234567890' },
            partySize: { type: 'integer', example: 4 },
            reservationDate: { type: 'string', format: 'date', example: '2025-07-10' },
            reservationTime: { type: 'string', example: '19:00' },
            duration: { type: 'integer', example: 90 },
            status: { type: 'string', enum: ['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'], example: 'confirmed' },
            specialRequests: { type: 'string', nullable: true },
            notes: { type: 'string', nullable: true },
            source: { type: 'string', enum: ['phone', 'online', 'walk_in'], example: 'phone' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        KitchenOrder: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            orderId: { type: 'integer', example: 1 },
            businessId: { type: 'integer', example: 1 },
            status: { type: 'string', enum: ['pending', 'preparing', 'ready', 'served'], example: 'pending' },
            priority: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'], example: 'normal' },
            assignedTo: { type: 'integer', nullable: true },
            estimatedReadyTime: { type: 'string', format: 'date-time', nullable: true },
            startedAt: { type: 'string', format: 'date-time', nullable: true },
            completedAt: { type: 'string', format: 'date-time', nullable: true },
            notes: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Delivery: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            orderId: { type: 'integer', example: 1 },
            businessId: { type: 'integer', example: 1 },
            customerName: { type: 'string', example: 'Jane Smith' },
            customerPhone: { type: 'string', example: '+1234567890' },
            customerAddress: { type: 'string', example: '123 Main St, City, State 12345' },
            driverId: { type: 'integer', nullable: true },
            status: { type: 'string', enum: ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'], example: 'pending' },
            estimatedDeliveryTime: { type: 'string', format: 'date-time', nullable: true },
            actualDeliveryTime: { type: 'string', format: 'date-time', nullable: true },
            deliveryFee: { type: 'number', example: 5.99 },
            notes: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        SplitBilling: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            orderId: { type: 'integer', example: 1 },
            businessId: { type: 'integer', example: 1 },
            totalAmount: { type: 'number', example: 89.97 },
            splitCount: { type: 'integer', example: 3 },
            status: { type: 'string', enum: ['active', 'completed', 'cancelled'], example: 'active' },
            notes: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        SplitBillingDetail: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            splitBillingId: { type: 'integer', example: 1 },
            customerName: { type: 'string', example: 'John Doe' },
            customerPhone: { type: 'string', example: '+1234567890' },
            splitAmount: { type: 'number', example: 29.99 },
            splitPercentage: { type: 'number', example: 33.33 },
            status: { type: 'string', enum: ['pending', 'paid', 'cancelled'], example: 'pending' },
            paymentMethod: { type: 'string', nullable: true },
            paymentReference: { type: 'string', nullable: true },
            paidAt: { type: 'string', format: 'date-time', nullable: true },
            notes: { type: 'string', nullable: true },
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
        LoginRequest: {
          type: 'object',
          required: ['email', 'password', 'businessSlug'],
          properties: {
            email: { type: 'string', example: 'admin@demo.com' },
            password: { type: 'string', example: 'admin123' },
            businessSlug: { type: 'string', example: 'demo-restaurant' }
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
        PaginationResponse: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            total: { type: 'integer', example: 100 },
            pages: { type: 'integer', example: 10 }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'An error occurred' },
            error: { type: 'string', example: 'Bad Request' }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation completed successfully' },
            data: { type: 'object' }
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
        name: 'Customers',
        description: 'Customer management and loyalty system'
      },
      {
        name: 'Menu',
        description: 'Menu categories and items management'
      },
      {
        name: 'Tables',
        description: 'Table management and status tracking'
      },
      {
        name: 'Orders',
        description: 'Order management and processing'
      },
      {
        name: 'Reservations',
        description: 'Table reservation system'
      },
      {
        name: 'Kitchen',
        description: 'Kitchen Display System (KDS) for order preparation'
      },
      {
        name: 'Deliveries',
        description: 'Delivery management and tracking'
      },
      {
        name: 'Split Billing',
        description: 'Split bill management for group orders'
      },
      {
        name: 'Sales',
        description: 'Sales and transaction management'
      },
      {
        name: 'Items',
        description: 'Product catalog management (legacy)'
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/index.ts']
};

export const specs = swaggerJsdoc(options); 