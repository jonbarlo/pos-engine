# POS Engine API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Test Credentials
- **Email:** maria.esposito@example.com
- **Password:** password123
- **Business ID:** 1

---

## Authentication Endpoints

### Login
**POST** `/auth/login`

**Required Fields:**
- `email` (string)
- `password` (string)

**Request Body:**
```json
{
  "email": "maria.esposito@example.com",
  "password": "password123"
}
```

**Response:**
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

---

## Sales Endpoints

### Create Sale (Simple)
**POST** `/sales`

**Required Fields:**
- `userId` (integer)
- `totalAmount` (number)

**Optional Fields:**
- `customerId` (integer)
- `taxAmount` (number)
- `discountAmount` (number)
- `finalAmount` (number)
- `paymentMethod` (string: "cash", "card", "check")
- `status` (string: "pending", "completed", "cancelled", "refunded")
- `notes` (string)

**Request Body:**
```json
{
  "userId": 1,
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

**Response:**
```json
{
  "message": "Sale created successfully",
  "sale": {
    "id": 1,
    "userId": 1,
    "totalAmount": 1193.49,
    "status": "completed",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Create Sale with Items
**POST** `/sales/with-items`

**Required Fields:**
- `orderItems` (array of objects with `itemId`, `quantity`, `unitPrice`)

**Optional Fields:**
- `customerName`, `customerEmail`, `subtotal`, `tax`, `discount`, `total`, `paymentMethod`, `status`

**Request Body:**
```json
{
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

### Get All Sales
**GET** `/sales`

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `status` (optional: "pending", "completed", "cancelled")
- `userId` (optional: integer)
- `startDate` (optional: YYYY-MM-DD)
- `endDate` (optional: YYYY-MM-DD)

**Response:**
```json
[
  {
    "id": 1,
    "customerName": "John Doe",
    "total": 1193.49,
    "status": "completed",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Sales Statistics
**GET** `/sales/stats`

**Response:**
```json
{
  "totalSales": 15000.50,
  "totalTransactions": 45,
  "averageOrderValue": 333.34,
  "topSellingItems": [
    {
      "itemId": 1,
      "totalQuantity": 25
    }
  ]
}
```

### Get Sales by User
**GET** `/sales/user/{userId}`

**Path Parameters:**
- `userId` (integer, required)

### Get Sale by ID
**GET** `/sales/{id}`

**Path Parameters:**
- `id` (integer, required)

### Update Sale
**PUT** `/sales/{id}`

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

### Delete Sale
**DELETE** `/sales/{id}`

**Path Parameters:**
- `id` (integer, required)

---

## Orders Endpoints (Restaurant/Food Service)

### Create Order
**POST** `/orders`

**Required Fields:**
- `orderType` (string: "dine_in", "takeaway", "delivery")
- `items` (array of objects with `itemId`, `quantity`)

**Optional Fields:**
- `customerId` (number)
- `tableId` (number)
- `notes` (string)

**Request Body:**
```json
{
  "orderType": "dine_in",
  "tableId": 1,
  "items": [
    {
      "itemId": 1,
      "quantity": 2,
      "notes": "Extra spicy"
    },
    {
      "itemId": 2,
      "quantity": 1
    }
  ],
  "notes": "Window seat"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderNumber": "ORD-1704067200000-123",
    "orderType": "dine_in",
    "status": "pending",
    "subtotal": 25.98,
    "taxAmount": 2.60,
    "totalAmount": 28.58,
    "orderItems": [...]
  },
  "message": "Order created successfully"
}
```

---

## Items Endpoints

### Get All Items
**GET** `/items`

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)

**Response:**
```json
[
  {
    "id": 1,
    "name": "Margherita Pizza",
    "price": 12.99,
    "category": "Pizza",
    "description": "Classic tomato and mozzarella",
    "sku": "PIZZA-001",
    "barcode": "1234567890123"
  }
]
```

### Search Items
**GET** `/items/search`

**Query Parameters:**
- `q` (string, required) - Search term

### Get Items by Category
**GET** `/items/category/{category}`

**Path Parameters:**
- `category` (string, required)

### Get Item by ID
**GET** `/items/{id}`

**Path Parameters:**
- `id` (integer, required)

### Create Item
**POST** `/items`

**Required Fields:**
- `name` (string)
- `price` (number)
- `stock` (integer)
- `category` (string)
- `sku` (string)

**Optional Fields:**
- `description` (string)
- `barcode` (string)

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

### Update Item
**PUT** `/items/{id}`

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

### Delete Item
**DELETE** `/items/{id}`

**Path Parameters:**
- `id` (integer, required)

### Update Item Stock
**PUT** `/items/{id}/stock`

**Path Parameters:**
- `id` (integer, required)

---

## Error Responses

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
- `500` - Internal Server Error

---

## Important Notes

1. **For Simple Sales**: Use `POST /sales` with just `customerName` and `total`
2. **For Sales with Items**: Use `POST /sales/with-items` with `orderItems` array (each item needs `itemId`, `quantity`, `unitPrice`)
3. **For Restaurant Orders**: Use `POST /orders` with `orderType` and `items` array (each item needs `itemId`, `quantity`)
4. **Authentication**: Always include `Authorization: Bearer <token>` header
5. **Business Context**: All operations are scoped to the authenticated user's business

---

## Complete Swagger Specification

For the complete OpenAPI 3.0 specification, see `swagger.yaml` in the project root. This file contains the full API documentation that can be imported into Swagger UI, Postman, or other API tools.