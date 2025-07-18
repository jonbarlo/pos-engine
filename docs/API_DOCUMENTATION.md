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

### Create Sale with Items
**POST** `/sales/with-items`

**Required Fields:**
- `orderItems` (array) - Array of objects with `itemId`, `quantity`, `unitPrice`
- `businessId` (integer) - Business ID (required by database schema)
- `userId` (integer) - User ID who created the sale (required by database schema)

**Order Item Required Fields:**
- `itemId` (integer) - Menu item ID
- `quantity` (integer) - Quantity ordered
- `unitPrice` (number) - Unit price (REQUIRED - this was missing!)

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
  "partySize": 4,
  "serverId": 2,
  "notes": "Window seat preferred"
}
```

**Required Fields:**
- `partySize` (integer) - Number of customers being seated

**Optional Fields:**
- `serverId` (integer) - ID of the waiter/server assigned
- `notes` (string) - Additional notes about the seating

**Response:**
```json
{
  "data": {
    "id": 1,
    "businessId": 1,
    "tableNumber": "A1",
    "capacity": 6,
    "partySize": 4,
    "status": "occupied",
    "section": "Main Floor",
    "currentOrderId": null,
    "serverId": 2,
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T12:00:00.000Z"
  }
}
```

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
      "tableCount": 12,
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
8. **Table Management**:
   - Table status automatically updates when orders are created/completed
   - Available → Occupied (when first order is placed)
   - Occupied → Available (when order is completed)
   - Tables can be marked as "reserved" for reservations
   - Reservation data is automatically included in table responses when applicable
9. **Reservation System**:
   - Reservations can be created with or without table assignment
   - Reservation data is automatically included in table responses when:
     - Table status is "reserved"
     - Table has active reservations (status: pending or confirmed)
     - Reservation date matches today's date
   - Reservation statuses: pending, confirmed, seated, completed, cancelled, no_show
   - Party size validation: 1-20 guests
   - Date format: YYYY-MM-DD, Time format: HH:MM:SS
10. **Order Management**:
    - Orders can be created for tables, takeaway, or delivery
    - Kitchen orders are automatically generated for dine-in orders
    - Order status flows: pending → preparing → ready → completed
11. **Mobile App Compatibility**:
    - `/api/messages` is an alias for `/api/staff-messages`
    - `/api/promotions` returns filtered promotional messages
    - All mobile app endpoints require authentication
    - Table endpoints automatically include reservation data for mobile display
    - Floor plan endpoints include table positions with reservation data
12. **Response Format**: All endpoints return consistent response format:
    - Success responses: `{success: true, data: {...}, message: "..."}`
    - List responses include pagination: `{success: true, data: [...], pagination: {...}}`
    - Error responses: `{error: "error message"}`
13. **Required Fields**: 
    - Sales endpoints require `userId` and `businessId` (not `customerName`)
    - Sales with items require `unitPrice` for each item
    - All timestamps include both `createdAt` and `updatedAt`
    - Reservations require `customerName`, `partySize`, `reservationDate`, `reservationTime`
14. **Sales Analytics**:
    - All analytics endpoints support date filtering with `startDate` and `endDate` parameters
    - Date format: YYYY-MM-DD
    - Analytics are business-scoped and require appropriate permissions
    - Item performance includes profit margins, growth rates, and rankings
    - Revenue trends support daily, weekly, and monthly grouping
    - Staff performance includes efficiency metrics and customer satisfaction
    - Customer analytics categorize customers as new, returning, or loyal
    - Inventory analytics provide stock alerts and reorder recommendations
15. **Sales with Items**:
    - `/sales/{id}/with-items` returns complete sale details including all items
    - Includes item SKU, barcode, category, and pricing information
    - Perfect for mobile apps requiring detailed sale information
    - Business-scoped for security
16. **Floor Plan Management**:
    - Floor plans have dimensions (width/height) for visual representation
    - Table positions include x/y coordinates, rotation, and size
    - Background images can be set for visual floor plan representation
    - Tables can be positioned on multiple floor plans
    - Floor plans are business-scoped
    - Table positions include reservation data when tables are reserved
17. **Table Management**:
    - Tables have status tracking (available, occupied, reserved, cleaning, out_of_service)
    - Tables can be assigned to sections (Main Floor, Patio, etc.)
    - Table positions are managed separately from table definitions
    - Table status updates automatically with order lifecycle
    - Reservation data is automatically included in table responses when applicable