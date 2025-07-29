# POS Engine API Documentation

## Base URL
```
http://localhost:3031/api
```

## Authentication
All endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### User Roles & Permissions
- **admin**: Full system access
- **owner**: Business owner with full access
- **manager**: Can manage users, items, and view reports
- **wait_staff**: Can create orders and view basic data
- **cashier**: Can process sales and view basic reports
- **kitchen_staff**: Base kitchen job function
- **viewer**: Read-only access to reports and data

### Kitchen Profiles (Extra Permissions)
- **kitchen_read**: Extra read-only kitchen access
- **kitchen_write**: Extra write permissions for kitchen orders
- **kitchen_manager**: Extra manager permissions (assign orders, override statuses)
- **none**: No extra kitchen permissions (default)

## Authentication Endpoints

### Login
**POST** `/auth/login`

**Required Fields:**
- `email` (string) - Valid email address
- `password` (string) - Minimum 6 characters
- Either `businessId` (integer) OR `businessSlug` (string) - One is required

**Request Body:**
```json
{
  "email": "marco@italiandelight.com",
  "password": "Password123",
  "businessSlug": "italian-delight"
}
```

**Response:**
```json
{
  "token": "<jwt>",
  "user": {
    "id": 1,
    "email": "marco@italiandelight.com",
    "businessId": 4,
    "role": "owner"
  }
}
```

### Register
**POST** `/auth/register`

**Required Fields:**
- `name` (string)
- `email` (string)
- `password` (string)
- Either `businessId` (integer) OR `businessSlug` (string)
- `role` (string, optional, default: cashier)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "businessSlug": "italian-delight",
  "role": "cashier"
}
```

**Response:**
```json
{
  "id": 2,
  "name": "John Doe",
  "email": "john@example.com",
  "businessId": 4,
  "role": "cashier"
}
```

### Get Profile
**GET** `/auth/profile`

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 1,
  "name": "Marco Rossi",
  "email": "marco@italiandelight.com",
  "businessId": 4,
  "role": "owner"
}
```

---

## User Endpoints

### Get All Users
**GET** `/users`

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Marco Rossi",
    "email": "marco@italiandelight.com",
    "role": "owner",
    "businessId": 4,
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### Get User by ID
**GET** `/users/{id}`

**Path Parameters:**
- `id` (integer, required) - User ID

**Response:**
```json
{
  "id": 1,
  "name": "Marco Rossi",
  "email": "marco@italiandelight.com",
  "role": "owner",
  "businessId": 4,
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### Create User
**POST** `/users`

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "Password123",
  "role": "manager"
}
```

**Response:**
```json
{
  "id": 3,
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "manager",
  "businessId": 4,
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### Update User
**PUT** `/users/{id}`

**Path Parameters:**
- `id` (integer, required) - User ID

**Request Body:**
```json
{
  "name": "Jane Smith",
  "role": "manager",
  "isActive": false
}
```

**Response:**
```json
{
  "id": 3,
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "manager",
  "businessId": 4,
  "isActive": false,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### Delete User
**DELETE** `/users/{id}`

**Path Parameters:**
- `id` (integer, required) - User ID

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

---

## Business Endpoints

### Get All Businesses
**GET** `/businesses`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Bella Vista Italian Restaurant",
    "slug": "bella-vista-italian",
    "type": "restaurant",
    "taxRate": 8.5,
    "currency": "USD",
    "timezone": "America/New_York",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### Get Business by ID
**GET** `/businesses/{id}`

**Path Parameters:**
- `id` (integer, required) - Business ID

### Get Business by Slug
**GET** `/businesses/slug/{slug}`

**Path Parameters:**
- `slug` (string, required) - Business slug

### Create Business
**POST** `/businesses`

**Required Fields:**
- `name` (string) - Business name
- `type` (string) - Business type
- `taxRate` (number) - Tax rate percentage
- `currency` (string) - Currency code
- `timezone` (string) - Timezone

**Request Body:**
```json
{
  "name": "New Restaurant",
  "type": "restaurant",
  "taxRate": 8.5,
  "currency": "USD",
  "timezone": "America/New_York"
}
```

### Update Business
**PUT** `/businesses/{id}`

**Path Parameters:**
- `id` (integer, required) - Business ID

### Delete Business
**DELETE** `/businesses/{id}`

**Path Parameters:**
- `id` (integer, required) - Business ID

---

## Item Endpoints

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
    "barcode": "1234567890123",
    "stock": 50,
    "businessId": 1,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
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
- `category` (string, required) - Category name

### Get Item by ID
**GET** `/items/{id}`

**Path Parameters:**
- `id` (integer, required) - Item ID

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
- `id` (integer, required) - Item ID

### Delete Item
**DELETE** `/items/{id}`

**Path Parameters:**
- `id` (integer, required) - Item ID

### Update Item Stock
**PUT** `/items/{id}/stock`

**Path Parameters:**
- `id` (integer, required) - Item ID

**Request Body:**
```json
{
  "stock": 45
}
```

---

## Sales Endpoints

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
    "userId": 1,
    "businessId": 1,
    "customerName": "John Doe",
    "totalAmount": 1193.49,
    "status": "completed",
    "paymentMethod": "card",
    "createdAt": "2025-01-01T00:00:00.000Z"
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

### Get Sale by ID
**GET** `/sales/{id}`

**Path Parameters:**
- `id` (integer, required) - Sale ID

### Create Sale
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
- `existingOrderId` (integer) - **NEW**: Optional order ID to link this sale to an existing order. If provided, the order status will be updated to 'completed' and table will be freed up.

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
  "notes": "Customer requested extra napkins",
  "existingOrderId": 13
}
```

### Create Sale with Items
**POST** `/sales/with-items`

**Required Fields:**
- `orderItems` (array) - Array of objects with `itemId`, `quantity`, `unitPrice`
- `businessId` (integer) - Business ID (required by database schema)
- `userId` (integer) - User ID who created the sale (required by database schema)

**Order Item Required Fields:**
- `itemId` (integer) - Menu item ID (will be converted to inventory item ID)
- `quantity` (integer) - Quantity ordered
- `unitPrice` (number) - Unit price (REQUIRED - this was missing!)

**Optional Fields:**
- `customerName`, `customerEmail`, `subtotal`, `tax`, `discount`, `totalAmount`, `paymentMethod`, `status`
- `existingOrderId` (integer) - **NEW**: Optional order ID to link this sale to an existing order. If provided, the order status will be updated to 'completed' and table will be freed up.

**Request Body:**
```json
{
  "userId": 1,
  "businessId": 1,
  "customerName": "John Doe",
  "totalAmount": 1193.49,
  "existingOrderId": 13,
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
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### Update Sale
**PUT** `/sales/{id}`

**Path Parameters:**
- `id` (integer, required) - Sale ID

### Delete Sale
**DELETE** `/sales/{id}`

**Path Parameters:**
- `id` (integer, required) - Sale ID

---

## Order Endpoints

### Get All Orders
**GET** `/orders`

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `status` (optional: "pending", "preparing", "ready", "completed", "cancelled")
- `orderType` (optional: "dine_in", "takeaway", "delivery")
- `tableId` (optional: integer)
- `customerId` (optional: integer)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "orderNumber": "ORD-001",
      "customerId": 1,
      "tableId": 5,
      "orderType": "dine_in",
      "status": "pending",
      "subtotal": 25.98,
      "taxAmount": 2.21,
      "totalAmount": 28.19,
      "notes": "Extra cheese please",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### Get Order by ID
**GET** `/orders/{id}`

**Path Parameters:**
- `id` (integer, required) - Order ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderNumber": "ORD-001",
    "businessId": 1,
    "serverId": 1,
    "customerId": 1,
    "tableId": 5,
    "orderType": "dine_in",
    "status": "pending",
    "subtotal": 25.98,
    "taxAmount": 2.21,
    "totalAmount": 28.19,
    "notes": "Extra cheese please",
    "customer": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "table": {
      "id": 5,
      "tableNumber": "Table 5",
      "capacity": 4,
      "section": "Main Dining"
    },
    "orderItems": [
      {
        "id": 1,
        "itemId": 1,
        "itemName": "Margherita Pizza",
        "quantity": 2,
        "unitPrice": 12.99,
        "totalPrice": 25.98,
        "notes": "Extra cheese please",
        "menuItem": {
          "id": 1,
          "name": "Margherita Pizza",
          "description": "Classic tomato and mozzarella",
          "price": 12.99
        }
      }
    ],
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### Create Order
**POST** `/orders`

**Required Fields:**
- `items` (array) - Array of order items
- `orderType` (string) - "dine_in", "takeaway", "delivery"

**Optional Fields:**
- `customerId` (integer) - Customer ID
- `tableId` (integer) - Table ID (for dine_in orders)
- `notes` (string) - Order notes

**Request Body:**
```json
{
  "customerId": 1,
  "tableId": 5,
  "orderType": "dine_in",
  "items": [
    {
      "itemId": 1,
      "quantity": 2,
      "notes": "Extra cheese please"
    }
  ],
  "notes": "General order notes"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderNumber": "ORD-1704067200000-123",
    "businessId": 1,
    "serverId": 1,
    "customerId": 1,
    "tableId": 5,
    "orderType": "dine_in",
    "status": "pending",
    "subtotal": 25.98,
    "taxAmount": 2.21,
    "totalAmount": 28.19,
    "notes": "General order notes",
    "orderItems": [
      {
        "id": 1,
        "itemId": 1,
        "itemName": "Margherita Pizza",
        "quantity": 2,
        "unitPrice": 12.99,
        "totalPrice": 25.98,
        "notes": "Extra cheese please"
      }
    ],
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "message": "Order created successfully"
}
```

### Create Table Order
**POST** `/orders/table`

**Required Fields:**
- `tableId` (integer) - Table ID
- `items` (array) - Array of order items

**Optional Fields:**
- `customerId` (integer) - Customer ID
- `notes` (string) - Order notes

**Item Object Required Fields:**
- `itemId` (integer) - Menu item ID
- `quantity` (integer) - Quantity ordered

**Item Object Optional Fields:**
- `notes` (string) - Item-specific notes

**Request Body:**
```json
{
  "tableId": 5,
  "customerId": 1,
  "items": [
    {
      "itemId": 1,
      "quantity": 2,
      "notes": "Extra cheese please"
    }
  ],
  "notes": "Table order notes"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderNumber": "ORD-1704067200000-123",
    "businessId": 1,
    "serverId": 1,
    "customerId": 1,
    "tableId": 5,
    "orderType": "dine_in",
    "status": "pending",
    "subtotal": 25.98,
    "taxAmount": 2.21,
    "totalAmount": 28.19,
    "notes": "Table order notes",
    "orderItems": [
      {
        "id": 1,
        "itemId": 1,
        "itemName": "Margherita Pizza",
        "quantity": 2,
        "unitPrice": 12.99,
        "totalPrice": 25.98,
        "notes": "Extra cheese please"
      }
    ],
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "message": "Order created successfully"
}
```

### Update Order
**PUT** `/orders/{id}`

**Path Parameters:**
- `id` (integer, required) - Order ID

### Add Items to Order
**POST** `/orders/{id}/items`

**Path Parameters:**
- `id` (integer, required) - Order ID

**Required Fields:**
- `items` (array) - Array of items to add

**Item Object Required Fields:**
- `itemId` (integer) - Menu item ID
- `quantity` (integer) - Quantity ordered

**Item Object Optional Fields:**
- `notes` (string) - Item-specific notes

**Request Body:**
```json
{
  "items": [
    {
      "itemId": 1,
      "quantity": 2,
      "notes": "Extra cheese please"
    },
    {
      "itemId": 3,
      "quantity": 1,
      "notes": "No onions"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderNumber": "ORD-1704067200000-123",
    "businessId": 1,
    "serverId": 1,
    "customerId": 1,
    "tableId": 5,
    "orderType": "dine_in",
    "status": "pending",
    "subtotal": 51.96,
    "taxAmount": 4.42,
    "totalAmount": 56.38,
    "notes": "General order notes",
    "orderItems": [
      {
        "id": 1,
        "itemId": 1,
        "itemName": "Margherita Pizza",
        "quantity": 2,
        "unitPrice": 12.99,
        "totalPrice": 25.98,
        "notes": "Extra cheese please"
      },
      {
        "id": 2,
        "itemId": 3,
        "itemName": "Spaghetti Carbonara",
        "quantity": 1,
        "unitPrice": 16.99,
        "totalPrice": 16.99,
        "notes": "No onions"
      }
    ],
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "message": "Items added to order successfully"
}
```

**Error Responses:**
- `400` - Invalid items array, missing required fields, or invalid menu items
- `404` - Order not found
- `400` - Cannot add items to completed or cancelled order

### Delete Order
**DELETE** `/orders/{id}`

**Path Parameters:**
- `id` (integer, required) - Order ID

### Complete Order
**POST** `/orders/{id}/complete`

**Path Parameters:**
- `id` (integer, required) - Order ID

**Response:**
```json
{
  "success": true,
  "message": "Order completed successfully",
  "order": {
    "id": 1,
    "status": "completed",
    "completedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### Get Orders by Table
**GET** `/orders/table/{tableId}`

**Path Parameters:**
- `tableId` (integer, required) - Table ID

### Get Orders by Customer
**GET** `/orders/customer/{customerId}`

**Path Parameters:**
- `customerId` (integer, required) - Customer ID

---

## Customer Endpoints

### Get All Customers
**GET** `/customers`

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `search` (optional: string) - Search by name, email, or phone

**Response:**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "businessId": 1,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### Get Customer by ID
**GET** `/customers/{id}`

**Path Parameters:**
- `id` (integer, required) - Customer ID

### Create Customer
**POST** `/customers`

**Required Fields:**
- `name` (string) - Customer name
- `email` (string) - Valid email address

**Optional Fields:**
- `phone` (string) - Phone number
- `address` (string) - Street address
- `city` (string) - City
- `state` (string) - State/province
- `zipCode` (string) - ZIP/postal code

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001"
}
```

### Update Customer
**PUT** `/customers/{id}`

**Path Parameters:**
- `id` (integer, required) - Customer ID

### Delete Customer
**DELETE** `/customers/{id}`

**Path Parameters:**
- `id` (integer, required) - Customer ID

### Search Customers
**GET** `/customers/search`

**Query Parameters:**
- `q` (string, required) - Search term

---

## Table Endpoints

### Get All Tables
**GET** `/tables`

**Query Parameters:**
- `status` (optional: "available", "occupied", "reserved", "cleaning", "out_of_service")
- `section` (optional: string) - Filter by section
- `capacity` (optional: integer) - Filter by capacity

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "businessId": 1,
      "tableNumber": "A1",
      "capacity": 4,
      "partySize": null,
      "status": "reserved",
      "section": "Main Floor",
      "currentOrderId": null,
      "serverId": null,
      "isActive": true,
      "reservation": {
        "customerName": "John Smith",
        "customerPhone": "+1-555-0101",
        "partySize": 4,
        "reservationDate": "2024-01-15",
        "reservationTime": "19:00:00",
        "notes": "Window seat preferred"
      },
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

**Note:** Reservation data is only included when:
- Table status is "reserved"
- Table has active reservations (status: pending or confirmed)
- Reservation date matches today's date

### Get Table by ID
**GET** `/tables/{id}`

**Path Parameters:**
- `id` (integer, required) - Table ID

**Response:** Same format as above, with reservation data if applicable

### Create Table
**POST** `/tables`

**Required Fields:**
- `tableNumber` (string) - Table number/name
- `capacity` (integer) - Number of seats

**Optional Fields:**
- `section` (string) - Table section (default: "Main Floor")
- `status` (string) - "available", "occupied", "reserved", "cleaning", "out_of_service"

**Request Body:**
```json
{
  "tableNumber": "A1",
  "capacity": 4,
  "section": "Main Floor",
  "status": "available"
}
```

### Update Table
**PUT** `/tables/{id}`

**Path Parameters:**
- `id` (integer, required) - Table ID

### Delete Table
**DELETE** `/tables/{id}`

**Path Parameters:**
- `id` (integer, required) - Table ID

### Update Table Status
**PUT** `/tables/{id}/status`

**Path Parameters:**
- `id` (integer, required) - Table ID

**Request Body:**
```json
{
  "status": "occupied"
}
```

### Assign Waiter to Table
**PUT** `/tables/{id}/assign`

**Path Parameters:**
- `id` (integer, required) - Table ID

**Request Body:**
```json
{
  "serverId": 2
}
```

**Required Fields:**
- `serverId` (integer) - Waiter/server ID

### Clear Table
**POST** `/tables/{id}/clear`

**Path Parameters:**
- `id` (integer, required) - Table ID

**Description:** Marks table as available, clears any assigned waiter, and resets party size

**Response:**
```json
{
  "data": {
    "id": 1,
    "businessId": 1,
    "tableNumber": "A1",
    "capacity": 6,
    "partySize": null,
    "status": "available",
    "section": "Main Floor",
    "currentOrderId": null,
    "serverId": null,
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T12:00:00.000Z"
  }
}
```

### Get Orders by Table
**GET** `/tables/{id}/orders`

**Path Parameters:**
- `id` (integer, required) - Table ID

**Query Parameters:**
- `status` (optional) - Filter by order status
- `orderType` (optional) - Filter by order type

**Response:**
```json
[
  {
    "id": 1,
    "businessId": 1,
    "serverId": 3,
    "customerId": null,
    "orderNumber": "IT-2024-001",
    "tableId": 1,
    "status": "in_progress",
    "orderType": "dine_in",
    "subtotal": 35.98,
    "totalAmount": 39.17,
    "taxAmount": 3.19,
    "discountAmount": 0,
    "tipAmount": 0,
    "notes": "Window seat",
    "specialInstructions": null,
    "estimatedReadyTime": null,
    "actualReadyTime": null,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### Seat Customers at Table
**POST** `/tables/{id}/seat`

**Path Parameters:**
- `id` (integer, required) - Table ID

**Request Body:**
```json
{
  "customerName": "John Smith",
  "customerPhone": "+1-555-0101",
  "customerEmail": "john@example.com",
  "partySize": 4,
  "serverId": 2,
  "notes": "Window seat preferred"
}
```

**Required Fields:**
- `partySize` (integer) - Number of customers being seated

**Optional Fields:**
- `customerName` (string) - Customer name for walk-in customers
- `customerPhone` (string) - Customer phone number
- `customerEmail` (string) - Customer email address (used to link to existing customer record)
- `serverId` (integer) - ID of the waiter/server assigned
- `notes` (string) - Additional notes about the seating

**Response:**
```json
{
  "table": {
    "id": 1,
    "businessId": 1,
    "tableNumber": "A1",
    "capacity": 6,
    "partySize": 4,
    "status": "occupied",
    "section": "Main Floor",
    "currentOrderId": 123,
    "serverId": 2,
    "customerName": "John Smith",
    "notes": "Window seat preferred",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T12:00:00.000Z"
  },
  "order": {
    "id": 123,
    "orderNumber": "ORDER-1704067200000-1",
    "orderType": "dine_in",
    "status": "pending",
    "totalAmount": 0,
    "customerId": 456,
    "notes": "Window seat preferred"
  },
  "customer": {
    "id": 456,
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "+1-555-0101",
    "loyaltyPoints": 0,
    "totalSpent": "0.00",
    "visitCount": 1
  }
}
```

**Business Logic:**
- If `customerEmail` is provided and matches an existing customer, the system links to that customer record
- If no matching customer is found, a new customer record is created
- Customer information is stored both in the customer record (for loyalty/reporting) and on the table (for immediate reference)
- An order is automatically created for the seated customers

---

## Reservation Endpoints

### Get All Reservations
**GET** `/reservations`

**Query Parameters:**
- `date` (optional) - Filter by reservation date (YYYY-MM-DD)
- `status` (optional) - Filter by reservation status
- `tableId` (optional) - Filter by assigned table

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "businessId": 1,
      "tableId": 1,
      "customerId": null,
      "customerName": "John Smith",
      "customerPhone": "+1-555-0101",
      "customerEmail": "john@example.com",
      "partySize": 4,
      "reservationDate": "2024-01-15",
      "reservationTime": "19:00:00",
      "status": "confirmed",
      "specialRequests": "Window seat preferred",
      "table": {
        "id": 1,
        "tableNumber": "A1",
        "capacity": 4,
        "section": "Main Floor"
      },
      "createdAt": "2024-01-10T10:00:00Z",
      "updatedAt": "2024-01-10T10:00:00Z"
    }
  ]
}
```

### Get Specific Reservation
**GET** `/reservations/{id}`

**Path Parameters:**
- `id` (integer, required) - Reservation ID

**Response:**
```json
{
  "data": {
    "id": 1,
    "businessId": 1,
    "tableId": 1,
    "customerId": null,
    "customerName": "John Smith",
    "customerPhone": "+1-555-0101",
    "customerEmail": "john@example.com",
    "partySize": 4,
    "reservationDate": "2024-01-15",
    "reservationTime": "19:00:00",
    "status": "confirmed",
    "specialRequests": "Window seat preferred",
    "table": {
      "id": 1,
      "tableNumber": "A1",
      "capacity": 4,
      "section": "Main Floor"
    },
    "createdAt": "2024-01-10T10:00:00Z",
    "updatedAt": "2024-01-10T10:00:00Z"
  }
}
```

### Create Reservation
**POST** `/reservations`

**Required Fields:**
- `customerName` (string) - Customer name
- `partySize` (integer) - Number of guests (1-20)
- `reservationDate` (string) - Date in YYYY-MM-DD format
- `reservationTime` (string) - Time in HH:MM:SS format

**Optional Fields:**
- `tableId` (integer) - Assigned table ID
- `customerId` (integer) - Customer ID if customer exists in system
- `customerPhone` (string) - Customer phone number
- `customerEmail` (string) - Customer email address
- `status` (string) - Reservation status (default: "pending")
- `specialRequests` (string) - Special requests or notes

**Request Body:**
```json
{
  "tableId": 1,
  "customerName": "John Smith",
  "customerPhone": "+1-555-0101",
  "customerEmail": "john@example.com",
  "partySize": 4,
  "reservationDate": "2024-01-15",
  "reservationTime": "19:00:00",
  "status": "pending",
  "specialRequests": "Window seat preferred"
}
```

**Validation Rules:**
- Party size must be between 1 and 20
- Date must be in YYYY-MM-DD format
- Time must be in HH:MM:SS format
- Table ID must exist and belong to the business

### Update Reservation
**PUT** `/reservations/{id}`

**Path Parameters:**
- `id` (integer, required) - Reservation ID

**Request Body:** Same as create, but all fields are optional

### Delete Reservation
**DELETE** `/reservations/{id}`

**Path Parameters:**
- `id` (integer, required) - Reservation ID

**Response:**
```json
{
  "message": "Reservation deleted successfully"
}
```

---

## Floor Plan Endpoints

### Get All Floor Plans
**GET** `/floor-plans`

**Response:**
```json
[
  {
    "id": 1,
    "businessId": 1,
    "name": "Main Dining Room",
    "width": 1200,
    "height": 800,
    "backgroundImage": "https://example.com/floor-plan.jpg",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### Get Floor Plan by ID
**GET** `/floor-plans/{id}`

**Path Parameters:**
- `id` (integer, required) - Floor plan ID

### Get Floor Plan with Tables
**GET** `/floor-plans/{id}/tables`

**Path Parameters:**
- `id` (integer, required) - Floor plan ID

**Response:**
```json
{
  "id": 1,
  "name": "Main Dining Room",
  "width": 1200,
  "height": 800,
  "backgroundImage": "https://example.com/floor-plan.jpg",
  "tablePositions": [
    {
      "id": 1,
      "tableId": 1,
      "tableNumber": "A1",
      "tableStatus": "reserved",
      "x": 150,
      "y": 200,
      "rotation": 0,
      "width": 80,
      "height": 60,
      "reservation": {
        "customerName": "John Smith",
        "customerPhone": "+1-555-0101",
        "partySize": 4,
        "reservationDate": "2024-01-15",
        "reservationTime": "19:00:00",
        "notes": "Window seat preferred"
      }
    }
  ]
}
```

**Note:** Reservation data is only included when:
- Table status is "reserved"
- Table has active reservations (status: pending or confirmed)
- Reservation date matches today's date

### Create Floor Plan
**POST** `/floor-plans`

**Required Fields:**
- `name` (string) - Floor plan name

**Optional Fields:**
- `width` (integer) - Width in pixels (default: 800)
- `height` (integer) - Height in pixels (default: 600)
- `backgroundImage` (string) - Background image URL

**Request Body:**
```json
{
  "name": "Main Dining Room",
  "width": 1200,
  "height": 800,
  "backgroundImage": "https://example.com/floor-plan.jpg"
}
```

### Update Floor Plan
**PUT** `/floor-plans/{id}`

**Path Parameters:**
- `id` (integer, required) - Floor plan ID

### Delete Floor Plan
**DELETE** `/floor-plans/{id}`

**Path Parameters:**
- `id` (integer, required) - Floor plan ID

### Update Table Position
**PUT** `/floor-plans/{floorPlanId}/tables/{tableId}/position`

**Path Parameters:**
- `floorPlanId` (integer, required) - Floor plan ID
- `tableId` (integer, required) - Table ID

**Request Body:**
```json
{
  "x": 150,
  "y": 200,
  "rotation": 0,
  "width": 80,
  "height": 60
}
```

### Remove Table from Floor Plan
**DELETE** `/floor-plans/{floorPlanId}/tables/{tableId}`

**Path Parameters:**
- `floorPlanId` (integer, required) - Floor plan ID
- `tableId` (integer, required) - Table ID

### Get Available Tables for Floor Plan
**GET** `/floor-plans/{id}/available-tables`

**Path Parameters:**
- `id` (integer, required) - Floor plan ID

**Response:**
```json
[
  {
    "id": 1,
    "tableNumber": "A1",
    "capacity": 4,
    "status": "available",
    "section": "Main Floor"
  }
]
```

---

## Delivery Endpoints

### Get All Deliveries
**GET** `/deliveries`

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `status` (optional: "pending", "preparing", "out_for_delivery", "delivered", "cancelled")

**Response:**
```json
[
  {
    "id": 1,
    "orderId": 1,
    "customerId": 1,
    "deliveryAddress": "123 Main St",
    "deliveryCity": "New York",
    "deliveryState": "NY",
    "deliveryZipCode": "10001",
    "deliveryInstructions": "Ring doorbell twice",
    "estimatedDeliveryTime": "2025-01-01T20:00:00.000Z",
    "actualDeliveryTime": null,
    "status": "pending",
    "businessId": 1,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### Get Delivery by ID
**GET** `/deliveries/{id}`

**Path Parameters:**
- `id` (integer, required) - Delivery ID

### Create Delivery
**POST** `/deliveries`

**Required Fields:**
- `orderId` (integer) - Order ID
- `customerId` (integer) - Customer ID
- `deliveryAddress` (string) - Delivery address

**Optional Fields:**
- `deliveryCity` (string) - City
- `deliveryState` (string) - State/province
- `deliveryZipCode` (string) - ZIP/postal code
- `deliveryInstructions` (string) - Special instructions
- `estimatedDeliveryTime` (string) - ISO 8601 datetime

**Request Body:**
```json
{
  "orderId": 1,
  "customerId": 1,
  "deliveryAddress": "123 Main St",
  "deliveryCity": "New York",
  "deliveryState": "NY",
  "deliveryZipCode": "10001",
  "deliveryInstructions": "Ring doorbell twice",
  "estimatedDeliveryTime": "2025-01-01T20:00:00.000Z"
}
```

### Update Delivery
**PUT** `/deliveries/{id}`

**Path Parameters:**
- `id` (integer, required) - Delivery ID

### Delete Delivery
**DELETE** `/deliveries/{id}`

**Path Parameters:**
- `id` (integer, required) - Delivery ID

### Update Delivery Status
**PUT** `/deliveries/{id}/status`

**Path Parameters:**
- `id` (integer, required) - Delivery ID

**Request Body:**
```json
{
  "status": "out_for_delivery"
}
```

---

## Kitchen Endpoints

**Access Requirements:**
- **Read Access**: `kitchen_staff` role OR `kitchen_read` profile OR `admin`/`owner`/`manager` role
- **Write Access**: `kitchen_staff` role OR `kitchen_write` profile OR `admin`/`owner`/`manager` role  
- **Manager Access**: `kitchen_manager` profile OR `admin`/`owner`/`manager` role

**Authentication:** Uses standard Bearer token authentication with role/profile-based permissions

### Get Kitchen Orders
**GET** `/kitchen/orders`

**Access:** Kitchen Read Required

**Query Parameters:**
- `status` (optional: "pending", "preparing", "ready", "served", "cancelled")
- `priority` (optional: "low", "normal", "high", "urgent")
- `station` (optional: string) - Kitchen station filter
- `assignedTo` (optional: integer) - User ID filter
- `orderType` (optional: "dine_in", "takeaway", "delivery")

**Response:**
```json
[
  {
    "id": 1,
    "orderId": 1,
    "orderNumber": "ORD-001",
    "tableName": "Table 5",
    "customerName": "John Doe",
    "items": [
      {
        "itemName": "Margherita Pizza",
        "quantity": 2,
        "notes": "Extra cheese please"
      }
    ],
    "priority": "normal",
    "status": "pending",
    "assignedTo": null,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### Get Kitchen Order by ID
**GET** `/kitchen/orders/{id}`

**Access:** Kitchen Read Required

**Path Parameters:**
- `id` (integer, required) - Kitchen order ID

### Update Kitchen Order
**PUT** `/kitchen/orders/{id}`

**Access:** Kitchen Write Required

**Path Parameters:**
- `id` (integer, required) - Kitchen order ID

**Request Body:**
```json
{
  "status": "preparing",
  "priority": "high",
  "notes": "Customer in a hurry"
}
```

### Start Preparing Order
**PUT** `/kitchen/orders/{id}/start-preparing`

**Access:** Kitchen Write Required

**Path Parameters:**
- `id` (integer, required) - Kitchen order ID

**Request Body:**
```json
{
  "assignedTo": 5
}
```

### Mark Order as Ready
**PUT** `/kitchen/orders/{id}/ready`

**Access:** Kitchen Write Required

**Path Parameters:**
- `id` (integer, required) - Kitchen order ID

### Mark Order as Served
**PUT** `/kitchen/orders/{id}/served`

**Access:** Kitchen Write Required

**Path Parameters:**
- `id` (integer, required) - Kitchen order ID

### Update Item Status
**PUT** `/kitchen/orders/{orderId}/items/{itemId}/status`

**Access:** Kitchen Write Required

**Path Parameters:**
- `orderId` (integer, required) - Kitchen order ID
- `itemId` (integer, required) - Item ID within the order

**Request Body:**
```json
{
  "status": "ready",
  "assignedTo": 5
}
```

### Assign Order
**PUT** `/kitchen/orders/{id}/assign`

**Access:** Kitchen Manager Required

**Path Parameters:**
- `id` (integer, required) - Kitchen order ID

**Request Body:**
```json
{
  "assignedTo": 5
}
```

### Get Kitchen Statistics
**GET** `/kitchen/stats`

**Access:** Kitchen Read Required

**Response:**
```json
{
  "pendingOrders": 5,
  "preparingOrders": 3,
  "readyOrders": 2,
  "servedOrders": 10,
  "averagePrepTime": 15.5,
  "totalOrders": 20
}
```

---

## Staff Messages Endpoints

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
    "content": "We have added three new pasta dishes to our menu.",
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

### Get Active Staff Messages
**GET** `/staff-messages/active`

**Response:**
```json
[
  {
    "id": 1,
    "title": "Active Announcement",
    "content": "Active content",
    "messageType": "announcement",
    "priority": "normal",
    "createdAt": "2025-01-01T10:00:00.000Z"
  }
]
```

### Get Staff Message by ID
**GET** `/staff-messages/{id}`

**Path Parameters:**
- `id` (integer, required) - Message ID

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

**Auto-Set Fields (from authenticated user):**
- `businessId` - Automatically set from user's business
- `senderId` - Automatically set to current user ID
- `senderName` - Automatically set to user's email
- `status` - Automatically set to "sent"

**Request Body:**
```json
{
  "title": "New Menu Items Available",
  "content": "We have added three new pasta dishes to our menu.",
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
  "id": 1,
  "businessId": 1,
  "senderId": 2,
  "senderName": "maria@example.com",
  "messageType": "announcement",
  "title": "New Menu Items Available",
  "content": "We have added three new pasta dishes to our menu.",
  "recipientType": "waitstaff",
  "recipientIds": null,
  "status": "sent",
  "priority": "normal",
  "expiresAt": "2025-01-02T10:00:00.000Z",
  "readBy": null,
  "acknowledgedBy": null,
  "metadata": {
    "menuItems": ["Pasta Carbonara", "Pasta Bolognese", "Pasta Alfredo"]
  },
  "createdAt": "2025-01-01T10:00:00.000Z",
  "updatedAt": "2025-01-01T10:00:00.000Z"
}
```

### Update Staff Message
**PUT** `/staff-messages/{id}`

**Path Parameters:**
- `id` (integer, required) - Message ID

### Delete Staff Message
**DELETE** `/staff-messages/{id}`

**Path Parameters:**
- `id` (integer, required) - Message ID

### Mark Message as Read
**POST** `/staff-messages/{id}/read`

**Path Parameters:**
- `id` (integer, required) - Message ID

### Acknowledge Message
**POST** `/staff-messages/{id}/acknowledge`

**Path Parameters:**
- `id` (integer, required) - Message ID

### Get Messages for Current User
**GET** `/staff-messages/my-messages`

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `status` (optional: "sent", "read", "acknowledged", "expired")
- `unreadOnly` (optional: boolean) - Return only unread messages

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

---

## Mobile App Compatibility Endpoints

### Get Messages (Alias)
**GET** `/messages`

**Description:** Alias for `/staff-messages` - returns the same data and supports all the same operations.

### Get Promotions
**GET** `/promotions`

**Description:** Returns only promotional staff messages.

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)

**Response:**
```json
[
  {
    "id": 1,
    "title": "Happy Hour Special",
    "content": "50% off all drinks from 4-6 PM",
    "messageType": "promotion",
    "priority": "normal",
    "createdAt": "2025-01-01T10:00:00.000Z"
  }
]
```

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

## Sales Analytics Endpoints

### Get Item Performance Analytics
**GET** `/sales/analytics/items`

**Query Parameters:**
- `startDate` (optional) - Start date in YYYY-MM-DD format
- `endDate` (optional) - End date in YYYY-MM-DD format
- `category` (optional) - Filter by item category
- `limit` (optional, default: 10) - Number of items to return

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2025-01-01",
      "endDate": "2025-01-31"
    },
    "items": [
      {
        "itemId": 1,
        "itemName": "Margherita Pizza",
        "category": "Pizza",
        "totalQuantity": 45,
        "totalRevenue": 854.55,
        "totalCost": 382.50,
        "profitMargin": 55.2,
        "averageOrderValue": 18.99,
        "growthRate": 12.5,
        "rank": 1
      }
    ],
    "summary": {
      "totalItems": 25,
      "totalRevenue": 12500.00,
      "totalCost": 5625.00,
      "averageProfitMargin": 55.0
    }
  }
}
```

### Get Revenue Trends Analytics
**GET** `/sales/analytics/revenue`

**Query Parameters:**
- `startDate` (optional) - Start date in YYYY-MM-DD format
- `endDate` (optional) - End date in YYYY-MM-DD format
- `groupBy` (optional, default: "day") - Grouping: "day", "week", "month"
- `includeProjections` (optional, default: false) - Include future projections

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2025-01-01",
      "endDate": "2025-01-31"
    },
    "trends": [
      {
        "date": "2025-01-01",
        "revenue": 1250.00,
        "orders": 45,
        "averageOrderValue": 27.78,
        "growthRate": 0.0
      }
    ],
    "summary": {
      "totalRevenue": 37500.00,
      "totalOrders": 1350,
      "averageOrderValue": 27.78,
      "growthRate": 15.2,
      "projectedRevenue": 43200.00
    }
  }
}
```

### Get Staff Performance Analytics
**GET** `/sales/analytics/staff`

**Query Parameters:**
- `startDate` (optional) - Start date in YYYY-MM-DD format
- `endDate` (optional) - End date in YYYY-MM-DD format
- `role` (optional) - Filter by staff role

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2025-01-01",
      "endDate": "2025-01-31"
    },
    "staff": [
      {
        "userId": 1,
        "userName": "Maria Esposito",
        "role": "cashier",
        "totalSales": 12500.00,
        "totalOrders": 450,
        "averageOrderValue": 27.78,
        "customerSatisfaction": 4.8,
        "efficiency": 95.2
      }
    ],
    "summary": {
      "totalStaff": 8,
      "totalRevenue": 37500.00,
      "averageEfficiency": 92.5
    }
  }
}
```

### Get Customer Analytics
**GET** `/sales/analytics/customers`

**Query Parameters:**
- `startDate` (optional) - Start date in YYYY-MM-DD format
- `endDate` (optional) - End date in YYYY-MM-DD format
- `customerType` (optional) - Filter by customer type: "new", "returning", "loyal"

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2025-01-01",
      "endDate": "2025-01-31"
    },
    "customers": [
      {
        "customerId": 1,
        "customerName": "John Smith",
        "totalSpent": 1250.00,
        "totalOrders": 25,
        "averageOrderValue": 50.00,
        "lastVisit": "2025-01-30",
        "loyaltyPoints": 1250,
        "customerType": "loyal"
      }
    ],
    "summary": {
      "totalCustomers": 150,
      "newCustomers": 25,
      "returningCustomers": 100,
      "loyalCustomers": 25,
      "averageCustomerValue": 250.00
    }
  }
}
```

### Get Inventory Performance Analytics
**GET** `/sales/analytics/inventory`

**Query Parameters:**
- `category` (optional) - Filter by item category
- `stockLevel` (optional) - Filter by stock level: "low", "normal", "high"

**Response:**
```json
{
  "success": true,
  "data": {
    "inventory": [
      {
        "itemId": 1,
        "itemName": "Margherita Pizza Base",
        "category": "Pizza",
        "currentStock": 15,
        "minStock": 10,
        "maxStock": 100,
        "stockLevel": "normal",
        "turnoverRate": 3.2,
        "daysUntilStockout": 12,
        "reorderRecommendation": "order_soon"
      }
    ],
    "alerts": [
      {
        "type": "low_stock",
        "itemId": 5,
        "itemName": "Pepperoni",
        "currentStock": 3,
        "minStock": 10
      }
    ],
    "summary": {
      "totalItems": 50,
      "lowStockItems": 5,
      "outOfStockItems": 0,
      "averageTurnoverRate": 2.8
    }
  }
}
```

---

## Sales with Items Endpoint

### Get Sale with Complete Item Details
**GET** `/sales/{id}/with-items`

**Path Parameters:**
- `id` (integer, required) - Sale ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "saleNumber": "SALE-2024-001",
    "status": "completed",
    "totalAmount": 39.17,
    "paymentMethod": "credit_card",
    "customerName": "John Smith",
    "customerEmail": "john.smith@email.com",
    "notes": "Table A2 - Window seat",
    "payments": [
      {
        "amount": 39.17,
        "method": "credit_card",
        "customerName": "John Smith",
        "customerEmail": "john.smith@email.com",
        "paidAt": "2025-01-01T12:00:00.000Z"
      }
    ],
    "items": [
      {
        "id": 1,
        "itemId": 1,
        "itemName": "Margherita Pizza",
        "itemSku": "IT-PIZ-001",
        "itemBarcode": "123456789001",
        "itemCategory": "Pizza",
        "quantity": 1,
        "unitPrice": 18.99,
        "totalPrice": 18.99,
        "discountAmount": 0.00,
        "finalPrice": 18.99,
        "notes": "Extra cheese"
      }
    ],
    "createdAt": "2025-01-01T12:00:00.000Z",
    "updatedAt": "2025-01-01T12:00:00.000Z"
  }
}
```

---

## Floor Plan Management Endpoints

### Get All Floor Plans
**GET** `/floor-plans`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Main Dining Room",
      "width": 1200,
      "height": 800,
      "backgroundImage": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=800&fit=crop",
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Floor Plan by ID
**GET** `/floor-plans/{id}`

**Path Parameters:**
- `id` (integer, required) - Floor plan ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Main Dining Room",
    "width": 1200,
    "height": 800,
    "backgroundImage": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=800&fit=crop",
    "isActive": true,
    "tables": [
      {
        "id": 1,
        "tableNumber": "A1",
        "capacity": 4,
        "status": "available",
        "section": "Main Floor",
        "position": {
          "x": 150,
          "y": 200,
          "rotation": 0,
          "width": 80,
          "height": 60
        }
      }
    ],
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### Create Floor Plan
**POST** `/floor-plans`

**Required Fields:**
- `name` (string) - Floor plan name
- `width` (integer) - Floor plan width in pixels
- `height` (integer) - Floor plan height in pixels

**Optional Fields:**
- `backgroundImage` (string) - Background image URL
- `isActive` (boolean) - Whether floor plan is active

**Request Body:**
```json
{
  "name": "New Floor Plan",
  "width": 1000,
  "height": 700,
  "backgroundImage": "https://example.com/background.jpg",
  "isActive": true
}
```

### Update Floor Plan
**PUT** `/floor-plans/{id}`

**Path Parameters:**
- `id` (integer, required) - Floor plan ID

### Delete Floor Plan
**DELETE** `/floor-plans/{id}`

**Path Parameters:**
- `id` (integer, required) - Floor plan ID

---

## Table Position Management Endpoints

### Get Table Positions for Floor Plan
**GET** `/floor-plans/{floorPlanId}/table-positions`

**Path Parameters:**
- `floorPlanId` (integer, required) - Floor plan ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tableId": 1,
      "tableNumber": "A1",
      "tableCapacity": 4,
      "tableStatus": "available",
      "tableSection": "Main Floor",
      "x": 150,
      "y": 200,
      "rotation": 0,
      "width": 80,
      "height": 60,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### Create Table Position
**POST** `/floor-plans/{floorPlanId}/table-positions`

**Path Parameters:**
- `floorPlanId` (integer, required) - Floor plan ID

**Required Fields:**
- `tableId` (integer) - Table ID
- `x` (integer) - X coordinate
- `y` (integer) - Y coordinate

**Optional Fields:**
- `rotation` (integer, default: 0) - Rotation in degrees
- `width` (integer, default: 80) - Width in pixels
- `height` (integer, default: 60) - Height in pixels

**Request Body:**
```json
{
  "tableId": 1,
  "x": 150,
  "y": 200,
  "rotation": 0,
  "width": 80,
  "height": 60
}
```

### Update Table Position
**PUT** `/floor-plans/{floorPlanId}/table-positions/{positionId}`

**Path Parameters:**
- `floorPlanId` (integer, required) - Floor plan ID
- `positionId` (integer, required) - Table position ID

### Delete Table Position
**DELETE** `/floor-plans/{floorPlanId}/table-positions/{positionId}`

**Path Parameters:**
- `floorPlanId` (integer, required) - Floor plan ID
- `positionId` (integer, required) - Table position ID

---

## Table Management Endpoints

### Get All Tables
**GET** `/tables`

**Query Parameters:**
- `status` (optional) - Filter by table status
- `section` (optional) - Filter by table section
- `capacity` (optional) - Filter by minimum capacity

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tableNumber": "A1",
      "capacity": 4,
      "status": "available",
      "section": "Main Floor",
      "isActive": true,
      "currentOrder": null,
      "server": null,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Table by ID
**GET** `/tables/{id}`

**Path Parameters:**
- `id` (integer, required) - Table ID

### Get Table Reservations (Mobile App Endpoint)
**GET** `/tables/{tableId}/reservations`

**Purpose:** Get reservations for a specific table (Mobile App Compatible)

**Path Parameters:**
- `tableId` (integer, required) - Table ID

**Query Parameters:**
- `date` (optional) - Filter by date (YYYY-MM-DD format, defaults to today)
- `status` (optional) - Filter by reservation status (pending, confirmed, seated, completed, cancelled, no_show)

**Request:**
```bash
curl -X GET "http://localhost:3031/api/tables/1/reservations?date=2024-01-15&status=confirmed" \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "customerName": "John Smith",
      "customerPhone": "+1-555-0101",
      "customerEmail": "john@example.com",
      "partySize": 4,
      "reservationDate": "2024-01-15",
      "reservationTime": "19:00:00",
      "status": "confirmed",
      "notes": "Window seat preferred",
      "createdAt": "2024-01-10T10:00:00Z",
      "updatedAt": "2024-01-10T10:00:00Z"
    }
  ],
  "message": "Found 1 reservation for table 1"
}
```

**Status:** ✅ Working (Mobile App Compatible)

### Create Table
**POST** `/tables`

**Required Fields:**
- `tableNumber` (string) - Table number/identifier
- `capacity` (integer) - Table capacity
- `section` (string) - Table section

**Optional Fields:**
- `status` (string) - Table status
- `isActive` (boolean) - Whether table is active

**Request Body:**
```json
{
  "tableNumber": "B1",
  "capacity": 6,
  "section": "Patio",
  "status": "available",
  "isActive": true
}
```

### Update Table
**PUT** `/tables/{id}`

**Path Parameters:**
- `id` (integer, required) - Table ID

### Delete Table
**DELETE** `/tables/{id}`

**Path Parameters:**
- `id` (integer, required) - Table ID

### Update Table Status
**PATCH** `/tables/{id}/status`

**Path Parameters:**
- `id` (integer, required) - Table ID

**Required Fields:**
- `status` (string) - New table status

**Request Body:**
```json
{
  "status": "occupied"
}
```

---

## Smart Recipe Suggestions Endpoints

### Get Smart Recipe Suggestions
**GET** `/smart/smart-suggestions`

**Purpose:** Get AI-powered recipe suggestions based on inventory management

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `includeExpiringItems` (boolean, optional, default: false) - Include items that are expiring soon
- `includeUnderperformingItems` (boolean, optional, default: false) - Include items with low sales velocity
- `maxDaysToExpiry` (integer, optional, default: 7) - Maximum days to expiry for items to consider
- `minSalesVelocity` (number, optional, default: 0.1) - Minimum sales velocity threshold
- `maxDaysSinceLastSale` (integer, optional, default: 30) - Maximum days since last sale
- `limit` (integer, optional, default: 10) - Maximum number of suggestions to return

**Request:**
```bash
curl -X GET "http://localhost:3031/api/smart/smart-suggestions?includeExpiringItems=true&includeUnderperformingItems=true&limit=5" \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "suggestions": [
    {
      "recipeId": 4,
      "recipeName": "Truffle Pizza",
      "recipeDescription": "Luxury pizza with black truffle, mozzarella, parmesan, and arugula",
      "recipeDifficulty": "medium",
      "prepTime": 25,
      "cookTime": 15,
      "imageUrl": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop&crop=center",
      "suggestedItems": [
        {
          "itemId": 33,
          "itemName": "Fresh Mozzarella (Expiring Soon)",
          "currentStock": 12,
          "expirationDate": "2025-07-22T06:16:04.404Z",
          "daysToExpiry": 2,
          "salesVelocity": 0.08,
          "daysSinceLastSale": 3,
          "reason": "Expires in 2 days"
        },
        {
          "itemId": 36,
          "itemName": "Truffle Oil (Underperforming)",
          "currentStock": 8,
          "expirationDate": null,
          "salesVelocity": 0.03,
          "daysSinceLastSale": 35,
          "reason": "Low sales velocity"
        }
      ],
      "confidence": 0.95,
      "totalPotentialSavings": 228.6,
      "urgency": "high"
    }
  ],
  "criteria": {
    "businessId": 1,
    "includeExpiringItems": true,
    "includeUnderperformingItems": true,
    "maxDaysToExpiry": 7,
    "minSalesVelocity": 0.1,
    "maxDaysSinceLastSale": 30,
    "limit": 5
  },
  "totalSuggestions": 1
}
```

**Status:** ✅ Working

### Cook Recipe
**POST** `/smart/cook-recipe`

**Purpose:** Cook a recipe and consume inventory items

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "recipeId": 4,
  "quantity": 1
}
```

**Response:**
```json
{
  "success": true,
  "cookingResult": {
    "recipeId": 4,
    "recipeName": "Truffle Pizza",
    "quantity": 1,
    "consumedItems": [
      {
        "itemId": 33,
        "itemName": "Fresh Mozzarella",
        "quantityConsumed": 1,
        "remainingStock": 11,
        "originalStock": 12,
        "unitCost": 0
      }
    ],
    "costSavings": 228.6,
    "wasteReduction": 171.45
  },
  "createdPromotion": {
    "id": 15,
    "name": "Chef's Special: Truffle Pizza",
    "discountType": "percentage",
    "discountValue": 15,
    "expiresAt": "2025-07-22T23:59:59Z"
  }
}
```

**Status:** ✅ Working

### Get Cooking History
**GET** `/smart/cooking-history`

**Purpose:** Get cooking history for the business

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `limit` (integer, optional, default: 50) - Maximum number of records to return
- `offset` (integer, optional, default: 0) - Number of records to skip

**Request:**
```bash
curl -X GET "http://localhost:3031/api/smart/cooking-history?limit=10&offset=0" \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "history": [
    {
      "id": 1,
      "recipeId": 4,
      "quantity": 1,
      "cookedAt": "2025-07-20T20:30:00.000Z",
      "wasteReduction": 171.45,
      "costSavings": 228.6,
      "createdPromotionId": 15
    }
  ],
  "total": 1,
  "pagination": {
    "limit": 10,
    "offset": 0,
    "hasMore": false
  }
}
```

**Status:** ✅ Working

### Get Cooking Analytics
**GET** `/smart/cooking-analytics`

**Purpose:** Get cooking analytics for the business

**Headers:**
- `Authorization: Bearer <token>`

**Request:**
```bash
curl -X GET "http://localhost:3031/api/smart/cooking-analytics" \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "analytics": {
    "totalCooked": 5,
    "totalWasteReduction": 857.25,
    "totalCostSavings": 1143.0,
    "averageEfficiency": 75.0
  }
}
```

**Status:** ✅ Working

### Get Inventory Summary
**GET** `/smart/inventory-summary`

**Purpose:** Get inventory summary for dashboard

**Headers:**
- `Authorization: Bearer <token>`

**Request:**
```bash
curl -X GET "http://localhost:3031/api/smart/inventory-summary" \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "totalItems": 27,
  "expiringSoon": 3,
  "underperforming": 3,
  "lowStockItems": 0,
  "expiringPercentage": 11.11,
  "underperformingPercentage": 11.11
}
```

**Status:** ✅ Working

### Get Expiring Items
**GET** `/smart/expiring-items`

**Purpose:** Get items that are expiring soon

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `days` (integer, optional, default: 7) - Number of days to look ahead for expiring items

**Request:**
```bash
curl -X GET "http://localhost:3031/api/smart/expiring-items?days=7" \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "items": [
    {
      "id": 20,
      "name": "Premium Black Truffle Pasta",
      "stock": 5,
      "expirationDate": "2025-07-21T06:15:58.830Z",
      "daysToExpiry": 1,
      "cost": 15,
      "potentialLoss": 75
    },
    {
      "id": 21,
      "name": "Premium Lobster Ravioli",
      "stock": 13,
      "expirationDate": "2025-07-21T06:15:58.830Z",
      "daysToExpiry": 1,
      "cost": 16.5,
      "potentialLoss": 214.5
    }
  ]
}
```

**Status:** ✅ Working

### Get Underperforming Items
**GET** `/smart/underperforming-items`

**Purpose:** Get underperforming items

**Headers:**
- `Authorization: Bearer <token>`

**Request:**
```bash
curl -X GET "http://localhost:3031/api/smart/underperforming-items" \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "items": [
    {
      "id": 35,
      "name": "Premium Saffron (Underperforming)",
      "stock": 5,
      "salesVelocity": 0.02,
      "daysSinceLastSale": 45,
      "lastSoldDate": "2025-06-05T06:16:04.529Z",
      "cost": 25,
      "potentialLoss": 125
    },
    {
      "id": 36,
      "name": "Truffle Oil (Underperforming)",
      "stock": 8,
      "salesVelocity": 0.03,
      "daysSinceLastSale": 35,
      "lastSoldDate": "2025-06-15T06:16:04.529Z",
      "cost": 18,
      "potentialLoss": 144
    }
  ]
}
```

**Status:** ✅ Working

### Update Item Tracking
**POST** `/smart/update-tracking`

**Purpose:** Update item inventory tracking data

**Headers:**
- `Authorization: Bearer <token>`

**Request:**
```bash
curl -X POST "http://localhost:3031/api/smart/update-tracking" \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "message": "Inventory tracking data updated successfully"
}
```

**Status:** ✅ Working

---

## AI Recipe Generation Endpoints

### Generate AI Recipe
**POST** `/ai/generate-recipe`

**Purpose:** Generate a new recipe using Claude API based on available ingredients and preferences

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "expiringItems": [
    {
      "name": "Fresh Basil",
      "quantity": 2,
      "category": "herbs"
    },
    {
      "name": "Cherry Tomatoes",
      "quantity": 1,
      "category": "vegetables"
    },
    {
      "name": "Mozzarella",
      "quantity": 200,
      "category": "dairy"
    }
  ],
  "cuisine": "Italian",
  "difficulty": "medium",
  "servings": 4,
  "dietaryRestrictions": ["vegetarian", "gluten-free"]
}
```

**Response:**
```json
{
  "success": true,
  "recipe": {
    "recipeName": "Fresh Basil Caprese Salad",
    "description": "A refreshing Italian salad using fresh basil and cherry tomatoes",
    "ingredients": [
      {
        "name": "Fresh Basil",
        "quantity": 2,
        "unit": "cups",
        "notes": "Freshly picked"
      },
      {
        "name": "Cherry Tomatoes",
        "quantity": 1,
        "unit": "pint",
        "notes": "Halved"
      },
      {
        "name": "Mozzarella",
        "quantity": 200,
        "unit": "grams",
        "notes": "Fresh, torn into pieces"
      }
    ],
    "instructions": [
      "Wash and dry the fresh basil leaves",
      "Halve the cherry tomatoes",
      "Tear the mozzarella into bite-sized pieces",
      "Combine all ingredients in a large bowl",
      "Drizzle with olive oil and balsamic vinegar",
      "Season with salt and pepper to taste"
    ],
    "prepTime": 15,
    "cookTime": 0,
    "difficulty": "easy",
    "estimatedCost": 12.50,
    "confidence": 0.85
  },
  "validation": {
    "isValid": true,
    "confidence": 0.85,
    "warnings": [],
    "provider": "claude"
  },
  "approvalId": 123,
  "aiProvider": "claude"
}
```

**Status:** 🚧 Not Yet Implemented

### Generate Batch Recipes
**POST** `/ai/generate-batch-recipes`

**Purpose:** Generate multiple recipes using AI for different ingredient combinations

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "requests": [
    {
      "expiringItems": [
        {
          "name": "Fresh Basil",
          "quantity": 2,
          "category": "herbs"
        }
      ],
      "cuisine": "Italian",
      "difficulty": "easy",
      "servings": 2
    },
    {
      "expiringItems": [
        {
          "name": "Cherry Tomatoes",
          "quantity": 1,
          "category": "vegetables"
        }
      ],
      "cuisine": "Mediterranean",
      "difficulty": "medium",
      "servings": 4
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "recipes": [
    {
      "recipeName": "Basil Pesto Pasta",
      "description": "Simple pasta with fresh basil pesto",
      "ingredients": [...],
      "instructions": [...],
      "prepTime": 10,
      "cookTime": 15,
      "difficulty": "easy",
      "estimatedCost": 8.50,
      "confidence": 0.90
    },
    {
      "recipeName": "Mediterranean Tomato Salad",
      "description": "Fresh tomato salad with Mediterranean flavors",
      "ingredients": [...],
      "instructions": [...],
      "prepTime": 20,
      "cookTime": 0,
      "difficulty": "medium",
      "estimatedCost": 15.00,
      "confidence": 0.85
    }
  ],
  "totalGenerated": 2,
  "aiProvider": "claude"
}
```

**Status:** 🚧 Not Yet Implemented

### Approve AI Recipe
**POST** `/ai/approve-recipe/{approvalId}`

**Purpose:** Approve an AI-generated recipe to add it to the menu

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Path Parameters:**
- `approvalId` (integer) - ID of the recipe approval record

**Request Body:**
```json
{
  "approved": true,
  "notes": "Great recipe! Added some extra seasoning.",
  "modifications": {
    "addedIngredients": ["Extra virgin olive oil", "Balsamic vinegar"],
    "modifiedInstructions": "Added step to drizzle with olive oil"
  }
}
```

**Response:**
```json
{
  "success": true,
  "recipeId": 456,
  "status": "approved"
}
```

**Status:** 🚧 Not Yet Implemented

### Get AI Usage Statistics
**GET** `/ai/usage-stats`

**Purpose:** Get statistics about AI recipe generation usage and costs

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `startDate` (string, optional) - Start date for statistics (YYYY-MM-DD)
- `endDate` (string, optional) - End date for statistics (YYYY-MM-DD)
- `provider` (string, optional) - AI provider filter (claude, openai, all)

**Request:**
```bash
curl -X GET "http://localhost:3031/api/ai/usage-stats?startDate=2025-01-01&endDate=2025-01-31&provider=claude" \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalRecipesGenerated": 45,
    "totalCost": 0.89,
    "averageGenerationTime": 2.3,
    "successRate": 0.96,
    "chefApprovalRate": 0.87,
    "popularCuisines": ["Italian", "Asian", "Mediterranean"],
    "costTrends": [
      {
        "date": "2025-01-01",
        "cost": 0.02
      },
      {
        "date": "2025-01-02",
        "cost": 0.03
      }
    ]
  }
}
```

**Status:** 🚧 Not Yet Implemented

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

## 📄 PDF Menu Generation

The API provides comprehensive PDF menu generation capabilities with professional templates and custom theming options.

### Available Templates

The system includes 4 professionally designed templates based on Apple HIG and Material UI principles:

#### 1. **Elegant** - Sophisticated Fine Dining
- **Style**: Premium design with serif fonts and gold accents
- **Best for**: High-end restaurants, fine dining, upscale establishments
- **Features**: Playfair Display serif font, gold gradient accents, elegant typography, sophisticated layout

#### 2. **Modern** - Contemporary Design
- **Style**: Clean and contemporary with sans-serif fonts
- **Best for**: Contemporary restaurants, cafes, modern dining concepts
- **Features**: Inter font, iOS-style colors, clean layout, Material Design principles

#### 3. **Classic** - Traditional Restaurant Style
- **Style**: Traditional restaurant menu with refined typography
- **Best for**: Traditional restaurants, family establishments, classic dining
- **Features**: Crimson Text serif font, traditional layout, elegant borders

#### 4. **Minimal** - Clean and Simple
- **Style**: Minimalist design focusing on content
- **Best for**: Minimalist restaurants, cafes, content-focused menus
- **Features**: Inter font, clean layout, focus on readability, subtle accents

### Built-in Template Endpoints

#### GET /api/menu/pdf/templates
**Purpose**: Get available built-in templates

**Response**:
```json
{
  "templates": [
    {
      "id": "elegant",
      "name": "Elegant",
      "description": "Sophisticated design with serif fonts and gold accents"
    },
    {
      "id": "modern", 
      "name": "Modern",
      "description": "Clean and contemporary design with sans-serif fonts"
    },
    {
      "id": "classic",
      "name": "Classic", 
      "description": "Traditional restaurant menu style"
    },
    {
      "id": "minimal",
      "name": "Minimal",
      "description": "Clean and simple design with focus on content"
    }
  ]
}
```

#### GET /api/menu/pdf/{businessId}/preview
**Purpose**: Preview menu with specific template

**Parameters**:
- `template` (optional): Template name (elegant, modern, classic, minimal)
- `includePrices` (optional): Include prices in preview
- `includeDescriptions` (optional): Include item descriptions
- `includeAllergens` (optional): Include allergen information
- `includeCalories` (optional): Include calorie information

**Example Request**:
```bash
curl -X GET "http://localhost:3031/api/menu/pdf/1/preview?template=elegant&includePrices=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### POST /api/menu/pdf/{businessId}/pdf
**Purpose**: Generate PDF menu with specific template

**Request Body**:
```json
{
  "template": "elegant",
  "includePrices": true,
  "includeDescriptions": true,
  "includeAllergens": true,
  "includeCalories": true,
  "includeImages": true,
  "includeBusinessLogo": true,
  "orientation": "portrait",
  "fontSize": "medium",
  "colorScheme": "light",
  "categoryLayout": "same-page",
  "categoryBackgroundColor": "#f8f9fa",
  "maxItemsPerPage": 8,
  "showCategoryTitles": true
}
```

**Category Layout Options**:
- `categoryLayout`: How to organize categories in the PDF
  - `"same-page"` (default): Category title + items on same page
  - `"separate-page"`: Dedicated category title page + items pages without category headers
- `categoryBackgroundColor`: Background color for category sections (default: "#f8f9fa")
- `maxItemsPerPage`: Maximum number of items per page (default: 8)
- `showCategoryTitles`: Whether to show category titles (default: true)

**Response**: PDF file (binary)

**Example Request**:
```bash
curl -X POST "http://localhost:3031/api/menu/pdf/1/pdf" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "template": "modern",
    "includePrices": true,
    "includeDescriptions": true,
    "categoryLayout": "separate-page",
    "categoryBackgroundColor": "#e3f2fd",
    "maxItemsPerPage": 6
  }' \
  --output menu.pdf
```

**Category Layout Examples**:

1. **Same Page Layout** (Default):
```json
{
  "categoryLayout": "same-page",
  "categoryBackgroundColor": "#f8f9fa"
}
```

2. **Separate Page Layout**:
```json
{
  "categoryLayout": "separate-page",
  "categoryBackgroundColor": "#e3f2fd",
  "maxItemsPerPage": 6
}
```

3. **Title Only Layout**:
```json
{
  "categoryLayout": "title-only",
  "categoryBackgroundColor": "#fff3e0"
}
```
