# Swagger/OpenAPI Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <your_jwt_token>
```

## OpenAPI 3.0 Specification

### Authentication Endpoints

#### POST /auth/login
**Summary:** Authenticate user and get access token

**Request Body:**
```json
{
  "email": "maria.esposito@example.com",
  "password": "password123",
  "businessId": 1
}
```

**Required Fields:**
- `email` (string) - Valid email address
- `password` (string) - Minimum 6 characters, must contain at least one letter
- Either `businessId` (integer) OR `businessSlug` (string) - One is required

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "maria.esposito@example.com",
    "businessId": 1
  }
}
```

#### POST /auth/register
**Summary:** Register a new user (admin only)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "businessId": 1,
  "role": "cashier"
}
```

**Required Fields:**
- `name` (string) - 2-100 characters, letters, spaces, hyphens, apostrophes only
- `email` (string) - Valid email address
- `password` (string) - Minimum 8 characters, must contain lowercase, uppercase, number, and special character
- Either `businessId` (integer) OR `businessSlug` (string) - One is required

**Optional Fields:**
- `role` (string) - "admin", "cashier", or "manager"

### Sales Endpoints

#### POST /sales
**Summary:** Create a new sale

**Request Body:**
```json
{
  "userId": 1,
  "businessId": 1,
  "totalAmount": 1193.49,
  "customerId": 1,
  "taxAmount": 93.50,
  "discountAmount": 0,
  "finalAmount": 1193.49,
  "paymentMethod": "card",
  "status": "completed",
  "notes": "Customer requested extra napkins"
}
```

**Required Fields:**
- `userId` (integer) - User ID who created the sale
- `totalAmount` (number) - Total sale amount
- `businessId` (integer) - Business ID (required by database schema)

**Optional Fields:**
- `customerId` (integer)
- `taxAmount` (number)
- `discountAmount` (number)
- `finalAmount` (number)
- `paymentMethod` (string: "cash", "card", "check")
- `status` (string: "pending", "completed", "cancelled", "refunded")
- `notes` (string)

#### POST /sales/with-items
**Summary:** Create a new sale with order items

**Request Body:**
```json
{
  "userId": 1,
  "businessId": 1,
  "customerName": "John Doe",
  "total": 1193.49,
  "orderItems": [
    {
      "itemId": 1,
      "quantity": 2,
      "unitPrice": 599.99
    },
    {
      "itemId": 2,
      "quantity": 1,
      "unitPrice": 299.99
    }
  ]
}
```

**Required Fields:**
- `orderItems` (array) - Array of objects with `itemId`, `quantity`, `unitPrice`
- `businessId` (integer) - Business ID (required by database schema)
- `userId` (integer) - User ID who created the sale (required by database schema)

**Optional Fields:**
- `customerName`, `customerEmail`, `subtotal`, `tax`, `discount`, `total`, `paymentMethod`, `status`

#### GET /sales
**Summary:** Get all sales

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `status` (optional: "pending", "completed", "cancelled")
- `userId` (optional: integer)
- `startDate` (optional: YYYY-MM-DD)
- `endDate` (optional: YYYY-MM-DD)

#### GET /sales/stats
**Summary:** Get sales statistics

#### GET /sales/user/{userId}
**Summary:** Get sales by user ID

**Path Parameters:**
- `userId` (integer, required)

#### GET /sales/{id}
**Summary:** Get sale by ID

**Path Parameters:**
- `id` (integer, required)

#### PUT /sales/{id}
**Summary:** Update a sale

**Path Parameters:**
- `id` (integer, required)

**Request Body:** (all fields optional)
```json
{
  "customerName": "Jane Doe",
  "total": 1299.99,
  "status": "completed"
}
```

#### DELETE /sales/{id}
**Summary:** Delete a sale

**Path Parameters:**
- `id` (integer, required)

### Split Billing Endpoints

#### POST /sales/split
**Summary:** Create a sale with split payments

**Request Body:**
```json
{
  "userId": 1,
  "totalAmount": 100.00,
  "customerName": "Group Order",
  "customerPhone": "555-1234",
  "customerEmail": "group@example.com",
  "notes": "Split between 3 people",
  "items": [
    {
      "itemId": 1,
      "quantity": 2,
      "unitPrice": 25.00
    },
    {
      "itemId": 2,
      "quantity": 1,
      "unitPrice": 50.00
    }
  ],
  "payments": [
    {
      "amount": 40.00,
      "method": "credit_card",
      "customerName": "John Doe",
      "customerPhone": "555-1111",
      "reference": "CC123456"
    },
    {
      "amount": 35.00,
      "method": "cash",
      "customerName": "Jane Smith",
      "customerPhone": "555-2222"
    },
    {
      "amount": 25.00,
      "method": "debit_card",
      "customerName": "Bob Wilson",
      "customerPhone": "555-3333",
      "reference": "DC789012"
    }
  ]
}
```

**Required Fields:**
- `userId` (integer) - User ID who created the sale
- `totalAmount` (number) - Total sale amount
- `payments` (array) - Array of payment objects

**Payment Object Required Fields:**
- `amount` (number) - Payment amount
- `method` (string) - Payment method

#### POST /sales/{saleId}/payments
**Summary:** Add payment to existing sale

**Path Parameters:**
- `saleId` (integer, required)

**Request Body:**
```json
{
  "amount": 25.00,
  "method": "cash",
  "customerName": "Alice Johnson",
  "customerPhone": "555-4444",
  "reference": "CASH001"
}
```

**Required Fields:**
- `amount` (number) - Payment amount
- `method` (string) - Payment method

#### GET /sales/{id}
**Summary:** Get sale with split payment details

**Path Parameters:**
- `id` (integer, required)

#### POST /sales/{saleId}/refund
**Summary:** Refund a split payment

**Path Parameters:**
- `saleId` (integer, required)

**Request Body:**
```json
{
  "paymentIndex": 0,
  "refundAmount": 20.00,
  "reason": "Customer requested partial refund"
}
```

**Required Fields:**
- `paymentIndex` (integer) - Index of the payment to refund (0-based)
- `refundAmount` (number) - Amount to refund

#### GET /sales/split/stats
**Summary:** Get split billing statistics

### Items Endpoints

#### GET /items
**Summary:** Get all items for the current business

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)

#### GET /items/search
**Summary:** Search items by name or description

**Query Parameters:**
- `q` (string, required) - Search term

#### GET /items/category/{category}
**Summary:** Get items by category

**Path Parameters:**
- `category` (string, required)

#### GET /items/{id}
**Summary:** Get item by ID

**Path Parameters:**
- `id` (integer, required)

#### POST /items
**Summary:** Create a new item

**Request Body:**
```json
{
  "name": "Pepperoni Pizza",
  "price": 14.99,
  "stock": 50,
  "category": "Pizza",
  "sku": "PEP001",
  "description": "Spicy pepperoni with cheese",
  "barcode": "1234567890124"
}
```

**Required Fields:**
- `name` (string) - Item name
- `price` (number) - Non-negative price

**Optional Fields:**
- `description` (string) - Item description
- `stock` (integer) - Stock quantity (default: 0)
- `category` (string) - Item category (default: "General")
- `sku` (string) - Auto-generated if not provided
- `barcode` (string) - Auto-generated if not provided

#### PUT /items/{id}
**Summary:** Update an item

**Path Parameters:**
- `id` (integer, required)

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Pizza Name",
  "price": 15.99,
  "stock": 45
}
```

#### DELETE /items/{id}
**Summary:** Delete an item

**Path Parameters:**
- `id` (integer, required)

#### PUT /items/{id}/stock
**Summary:** Update item stock

**Path Parameters:**
- `id` (integer, required)

### Error Responses

All endpoints return errors in this format:
```json
{
  "error": "Error message description"
}
```

Common HTTP Status Codes:
- `400` - Bad Request (missing required fields)
- `401` - Unauthorized (invalid or missing token)
- `404` - Not Found
- `409` - Conflict (e.g., duplicate SKU/barcode)
- `500` - Internal Server Error

### Schemas

#### Sale Schema
```json
{
  "type": "object",
  "properties": {
    "id": { "type": "integer" },
    "userId": { "type": "integer" },
    "totalAmount": { "type": "number" },
    "status": { "type": "string", "enum": ["pending", "completed", "cancelled", "refunded"] },
    "createdAt": { "type": "string", "format": "date-time" }
  }
}
```

#### Item Schema
```json
{
  "type": "object",
  "properties": {
    "id": { "type": "integer" },
    "name": { "type": "string" },
    "price": { "type": "number" },
    "category": { "type": "string" },
    "description": { "type": "string" },
    "sku": { "type": "string" },
    "barcode": { "type": "string" }
  }
}
```

#### Error Schema
```json
{
  "type": "object",
  "properties": {
    "error": { "type": "string" }
  }
}
```

## Important Notes

1. **Authentication**: All endpoints (except health checks) require Bearer token authentication
2. **Business Scoping**: All data is scoped to the authenticated user's business
3. **Validation**: Input validation is enforced at the controller level
4. **Auto-generation**: SKU and barcode are auto-generated if not provided for items
5. **Split Billing**: Total payment amounts must equal the sale total amount
6. **User ID**: Most endpoints require or expect userId in the payload for proper tracking 