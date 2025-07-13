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
- `email` (string) - Valid email address
- `password` (string) - Minimum 6 characters, must contain at least one letter
- Either `businessId` (integer) OR `businessSlug` (string) - One is required

**Request Body:**
```json
{
  "email": "maria.esposito@example.com",
  "password": "password123",
  "businessId": 1
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

### Register
**POST** `/auth/register`

**Required Fields:**
- `name` (string) - 2-100 characters, letters, spaces, hyphens, apostrophes only
- `email` (string) - Valid email address
- `password` (string) - Minimum 8 characters, must contain lowercase, uppercase, number, and special character
- Either `businessId` (integer) OR `businessSlug` (string) - One is required

**Optional Fields:**
- `role` (string) - "admin", "cashier", "manager", or "waitstaff"

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

---

## Sales Endpoints

### Create Sale (Simple)
**POST** `/sales`

**Required Fields:**
- `userId` (integer) - User ID who created the sale
- `totalAmount` (number) - Total sale amount
- `businessId` (integer) - Business ID (required by database schema)

**Optional Fields:**
- `customerName` (string) - Customer name
- `customerEmail` (string) - Customer email
- `customerPhone` (string) - Customer phone
- `subtotal` (number) - Subtotal before tax
- `tax` (number) - Tax amount
- `discount` (number) - Discount amount
- `paymentMethod` (string: "cash", "card", "mobile", "other")
- `status` (string: "pending", "completed", "cancelled", "refunded")
- `notes` (string)

**Request Body:**
```json
{
  "userId": 1,
  "businessId": 1,
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "subtotal": 1099.99,
  "tax": 93.50,
  "discount": 0,
  "totalAmount": 1193.49,
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
    "businessId": 1,
    "totalAmount": 1193.49,
    "status": "completed",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Create Sale with Items
**POST** `/sales/with-items`

**Required Fields:**
- `orderItems` (array) - Array of objects with `itemId`, `quantity`, `unitPrice`
- `businessId` (integer) - Business ID (required by database schema)
- `userId` (integer) - User ID who created the sale (required by database schema)

**Optional Fields:**
- `customerName`, `customerEmail`, `subtotal`, `tax`, `discount`, `totalAmount`, `paymentMethod`, `status`

**Request Body:**
```json
{
  "userId": 1,
  "businessId": 1,
  "customerName": "John Doe",
  "totalAmount": 1193.49,
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

**Response:**
```json
{
  "message": "Sale with items created successfully",
  "sale": {
    "id": 1,
    "userId": 1,
    "businessId": 1,
    "totalAmount": 1193.49,
    "status": "completed",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
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
    "totalAmount": 1193.49,
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
  "totalAmount": 1299.99,
  "status": "completed"
}
```

### Delete Sale
**DELETE** `/sales/{id}`

**Path Parameters:**
- `id` (integer, required)

---

## Split Billing Endpoints

### Create Sale with Split Payments
**POST** `/sales/split`

**Required Fields:**
- `userId` (integer) - User ID who created the sale
- `totalAmount` (number) - Total sale amount
- `payments` (array) - Array of payment objects

**Optional Fields:**
- `customerName` (string) - Customer name
- `customerPhone` (string) - Customer phone
- `customerEmail` (string) - Customer email
- `notes` (string) - Sale notes
- `items` (array) - Array of sale items

**Payment Object Required Fields:**
- `amount` (number) - Payment amount
- `method` (string) - Payment method (cash, credit_card, debit_card, mobile_payment, etc.)

**Payment Object Optional Fields:**
- `customerName` (string) - Customer name for this payment
- `customerPhone` (string) - Customer phone for this payment
- `reference` (string) - Payment reference number

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

**Response:**
```json
{
  "message": "Split sale created successfully",
  "sale": {
    "id": 1,
    "totalAmount": 100.00,
    "status": "completed",
    "payments": [
      {
        "amount": 40.00,
        "method": "credit_card",
        "customerName": "John Doe",
        "customerPhone": "555-1111",
        "reference": "CC123456",
        "paidAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### Add Payment to Existing Sale
**POST** `/sales/{saleId}/payments`

**Path Parameters:**
- `saleId` (integer, required) - Sale ID

**Required Fields:**
- `amount` (number) - Payment amount
- `method` (string) - Payment method

**Optional Fields:**
- `customerName` (string) - Customer name for this payment
- `customerPhone` (string) - Customer phone for this payment
- `reference` (string) - Payment reference number

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

**Response:**
```json
{
  "message": "Payment added successfully",
  "sale": {
    "id": 1,
    "totalAmount": 100.00,
    "status": "completed",
    "payments": [...],
    "totalPaid": 100.00
  }
}
```

### Get Sale with Split Payment Details
**GET** `/sales/{id}`

**Path Parameters:**
- `id` (integer, required) - Sale ID

**Response:**
```json
{
  "id": 1,
  "totalAmount": 100.00,
  "status": "completed",
  "customerName": "Group Order",
  "customerPhone": "555-1234",
  "customerEmail": "group@example.com",
  "notes": "Split between 3 people",
  "payments": [
    {
      "amount": 40.00,
      "method": "credit_card",
      "customerName": "John Doe",
      "customerPhone": "555-1111",
      "reference": "CC123456",
      "paidAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "totalPaid": 100.00,
  "remainingAmount": 0.00,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### Refund a Split Payment
**POST** `/sales/{saleId}/refund`

**Path Parameters:**
- `saleId` (integer, required) - Sale ID

**Required Fields:**
- `paymentIndex` (integer) - Index of the payment to refund (0-based)
- `refundAmount` (number) - Amount to refund

**Optional Fields:**
- `reason` (string) - Reason for refund

**Request Body:**
```json
{
  "paymentIndex": 0,
  "refundAmount": 20.00,
  "reason": "Customer requested partial refund"
}
```

**Response:**
```json
{
  "message": "Refund processed successfully",
  "sale": {
    "id": 1,
    "totalAmount": 100.00,
    "status": "completed",
    "refundAmount": 20.00,
    "totalPaid": 80.00
  }
}
```

### Get Split Billing Statistics
**GET** `/sales/split/stats`

**Response:**
```json
{
  "totalSplitSales": 15,
  "totalAmount": 2500.00,
  "averageSplitAmount": 166.67,
  "averagePaymentsPerSale": 2.8
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
- `name` (string) - Item name
- `price` (number) - Non-negative price

**Optional Fields:**
- `description` (string) - Item description
- `stock` (integer) - Stock quantity (default: 0)
- `category` (string) - Item category (default: "General")
- `sku` (string) - Auto-generated if not provided
- `barcode` (string) - Auto-generated if not provided

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

## Staff Messaging Endpoints

### Get All Staff Messages
**GET** `/staff-messages`

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `messageType` (optional: "announcement", "inventory_alert", "promotion", "discount", "urgent", "general")
- `recipientType` (optional: "all", "waitstaff", "kitchen", "managers", "specific_users")
- `status` (optional: "sent", "read", "acknowledged", "expired")
- `priority` (optional: "low", "normal", "high", "urgent")
- `senderId` (optional: integer)

**Response:**
```json
[
  {
    "id": 1,
    "businessId": 1,
    "senderId": 2,
    "senderName": "Sofia Bianchi",
    "messageType": "announcement",
    "title": "New Menu Items Available",
    "content": "We have added three new pasta dishes to our menu. Please familiarize yourself with the new items.",
    "recipientType": "waitstaff",
    "recipientIds": null,
    "status": "sent",
    "priority": "normal",
    "expiresAt": null,
    "readBy": null,
    "acknowledgedBy": null,
    "metadata": null,
    "createdAt": "2025-01-01T10:00:00.000Z",
    "updatedAt": "2025-01-01T10:00:00.000Z"
  }
]
```

### Get Staff Message by ID
**GET** `/staff-messages/{id}`

**Path Parameters:**
- `id` (integer, required)

**Response:**
```json
{
  "id": 1,
  "businessId": 1,
  "senderId": 2,
  "senderName": "Sofia Bianchi",
  "messageType": "announcement",
  "title": "New Menu Items Available",
  "content": "We have added three new pasta dishes to our menu. Please familiarize yourself with the new items.",
  "recipientType": "waitstaff",
  "recipientIds": null,
  "status": "sent",
  "priority": "normal",
  "expiresAt": null,
  "readBy": null,
  "acknowledgedBy": null,
  "metadata": null,
  "createdAt": "2025-01-01T10:00:00.000Z",
  "updatedAt": "2025-01-01T10:00:00.000Z"
}
```

### Create Staff Message
**POST** `/staff-messages`

**Required Fields:**
- `title` (string) - Message title (max 200 characters)
- `content` (string) - Message content
- `messageType` (string) - "announcement", "inventory_alert", "promotion", "discount", "urgent", "general"
- `recipientType` (string) - "all", "waitstaff", "kitchen", "managers", "specific_users"

**Optional Fields:**
- `recipientIds` (array of integers) - Required if recipientType is "specific_users"
- `priority` (string) - "low", "normal", "high", "urgent" (default: "normal")
- `expiresAt` (string) - ISO 8601 datetime string
- `metadata` (object) - Additional data as JSON

**Request Body:**
```json
{
  "title": "New Menu Items Available",
  "content": "We have added three new pasta dishes to our menu. Please familiarize yourself with the new items.",
  "messageType": "announcement",
  "recipientType": "waitstaff",
  "priority": "normal",
  "expiresAt": "2025-01-02T10:00:00.000Z",
  "metadata": {
    "menuItems": ["Pasta Carbonara", "Pasta Bolognese", "Pasta Alfredo"]
  }
}
```

**Response:**
```json
{
  "message": "Staff message created successfully",
  "staffMessage": {
    "id": 1,
    "businessId": 1,
    "senderId": 2,
    "senderName": "Sofia Bianchi",
    "messageType": "announcement",
    "title": "New Menu Items Available",
    "content": "We have added three new pasta dishes to our menu. Please familiarize yourself with the new items.",
    "recipientType": "waitstaff",
    "status": "sent",
    "priority": "normal",
    "createdAt": "2025-01-01T10:00:00.000Z"
  }
}
```

### Update Staff Message
**PUT** `/staff-messages/{id}`

**Path Parameters:**
- `id` (integer, required)

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Menu Items Available",
  "content": "Updated content about new menu items.",
  "priority": "high",
  "expiresAt": "2025-01-03T10:00:00.000Z"
}
```

**Response:**
```json
{
  "message": "Staff message updated successfully",
  "staffMessage": {
    "id": 1,
    "title": "Updated Menu Items Available",
    "content": "Updated content about new menu items.",
    "priority": "high",
    "updatedAt": "2025-01-01T11:00:00.000Z"
  }
}
```

### Delete Staff Message
**DELETE** `/staff-messages/{id}`

**Path Parameters:**
- `id` (integer, required)

**Response:**
```json
{
  "message": "Staff message deleted successfully"
}
```

### Mark Message as Read
**POST** `/staff-messages/{id}/read`

**Path Parameters:**
- `id` (integer, required)

**Response:**
```json
{
  "message": "Message marked as read",
  "staffMessage": {
    "id": 1,
    "status": "read",
    "readBy": "[{\"userId\": 3, \"readAt\": \"2025-01-01T10:30:00.000Z\"}]",
    "updatedAt": "2025-01-01T10:30:00.000Z"
  }
}
```

### Acknowledge Message
**POST** `/staff-messages/{id}/acknowledge`

**Path Parameters:**
- `id` (integer, required)

**Response:**
```json
{
  "message": "Message acknowledged",
  "staffMessage": {
    "id": 1,
    "status": "acknowledged",
    "acknowledgedBy": "[{\"userId\": 3, \"acknowledgedAt\": \"2025-01-01T10:35:00.000Z\"}]",
    "updatedAt": "2025-01-01T10:35:00.000Z"
  }
}
```

### Get Messages for Current User
**GET** `/staff-messages/my-messages`

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `status` (optional: "sent", "read", "acknowledged", "expired")
- `unreadOnly` (optional: boolean) - Return only unread messages

**Response:**
```json
[
  {
    "id": 1,
    "senderName": "Sofia Bianchi",
    "messageType": "announcement",
    "title": "New Menu Items Available",
    "content": "We have added three new pasta dishes to our menu.",
    "recipientType": "waitstaff",
    "status": "sent",
    "priority": "normal",
    "createdAt": "2025-01-01T10:00:00.000Z",
    "isRead": false,
    "isAcknowledged": false
  }
]
```

### Get Unread Message Count
**GET** `/staff-messages/unread-count`

**Response:**
```json
{
  "unreadCount": 5,
  "urgentCount": 2,
  "highPriorityCount": 1
}
```

### Get Staff Message Statistics
**GET** `/staff-messages/stats`

**Response:**
```json
{
  "totalMessages": 25,
  "readMessages": 20,
  "acknowledgedMessages": 15,
  "expiredMessages": 3,
  "messagesByType": {
    "announcement": 10,
    "inventory_alert": 5,
    "promotion": 3,
    "urgent": 2,
    "general": 5
  },
  "messagesByPriority": {
    "low": 5,
    "normal": 15,
    "high": 3,
    "urgent": 2
  }
}
```

### Send Message to Specific Users
**POST** `/staff-messages/send-to-users`

**Required Fields:**
- `title` (string) - Message title
- `content` (string) - Message content
- `recipientIds` (array of integers) - Array of user IDs to send message to
- `messageType` (string) - Message type

**Optional Fields:**
- `priority` (string) - Message priority
- `expiresAt` (string) - Expiration date

**Request Body:**
```json
{
  "title": "Kitchen Staff Meeting",
  "content": "Mandatory kitchen staff meeting at 3 PM today.",
  "recipientIds": [5, 6, 7, 8],
  "messageType": "urgent",
  "priority": "high",
  "expiresAt": "2025-01-01T15:00:00.000Z"
}
```

**Response:**
```json
{
  "message": "Message sent to 4 users successfully",
  "staffMessage": {
    "id": 2,
    "recipientType": "specific_users",
    "recipientIds": "[5,6,7,8]",
    "status": "sent"
  }
}
```

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
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., duplicate SKU/barcode)
- `500` - Internal Server Error

---

## Important Notes

1. **Authentication**: All endpoints (except health checks) require Bearer token authentication
2. **Business Scoping**: All data is scoped to the authenticated user's business
3. **Validation**: Input validation is enforced at the controller level
4. **Auto-generation**: SKU and barcode are auto-generated if not provided for items
5. **Split Billing**: Total payment amounts must equal the sale total amount
6. **User ID**: Most endpoints require or expect userId in the payload for proper tracking
7. **Staff Messaging**: 
   - Messages are automatically scoped to the user's business
   - Sender information is automatically populated from the authenticated user
   - Read/acknowledge status is tracked per user
   - Expired messages are automatically marked as expired
   - Recipient types: "all", "waitstaff", "kitchen", "managers", "specific_users"
   - Message types: "announcement", "inventory_alert", "promotion", "discount", "urgent", "general"
   - Priorities: "low", "normal", "high", "urgent" 