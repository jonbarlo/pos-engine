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

## Test Credentials
- **Email:** maria.esposito@example.com
- **Password:** password123
- **Business ID:** 1

---

## Health Check Endpoints

### Health Check
**GET** `/health`

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "environment": "development"
}
```

### API Health Check
**GET** `/api/health`

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "environment": "development"
}
```

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
    "businessId": 1,
    "role": "cashier"
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

## User Endpoints

### Get All Users
**GET** `/users`

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)

**Response:**
```json
[
  {
    "id": 1,
    "name": "Maria Esposito",
    "email": "maria@example.com",
    "role": "cashier",
    "businessId": 1,
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

### Create User
**POST** `/users`

**Required Fields:**
- `name` (string) - User name
- `email` (string) - Valid email address
- `password` (string) - Minimum 6 characters
- `role` (string) - "admin", "cashier", "manager", "waitstaff"

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "cashier"
}
```

### Update User
**PUT** `/users/{id}`

**Path Parameters:**
- `id` (integer, required) - User ID

### Delete User
**DELETE** `/users/{id}`

**Path Parameters:**
- `id` (integer, required) - User ID

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
- `status` (optional: "available", "occupied", "reserved", "maintenance")
- `capacity` (optional: integer) - Filter by capacity

**Response:**
```json
[
  {
    "id": 1,
    "name": "Table 1",
    "capacity": 4,
    "status": "available",
    "location": "Main Dining",
    "currentOrderId": null,
    "serverId": null,
    "businessId": 1,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### Get Table by ID
**GET** `/tables/{id}`

**Path Parameters:**
- `id` (integer, required) - Table ID

### Create Table
**POST** `/tables`

**Required Fields:**
- `name` (string) - Table name
- `capacity` (integer) - Number of seats

**Optional Fields:**
- `location` (string) - Table location
- `status` (string) - "available", "occupied", "reserved", "maintenance"

**Request Body:**
```json
{
  "name": "Table 1",
  "capacity": 4,
  "location": "Main Dining",
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

---

## Reservation Endpoints

### Get All Reservations
**GET** `/reservations`

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `status` (optional: "confirmed", "pending", "cancelled", "completed")
- `date` (optional: YYYY-MM-DD) - Filter by date

**Response:**
```json
[
  {
    "id": 1,
    "customerId": 1,
    "tableId": 5,
    "reservationDate": "2025-01-15",
    "reservationTime": "19:00",
    "partySize": 4,
    "status": "confirmed",
    "notes": "Anniversary celebration",
    "businessId": 1,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### Get Reservation by ID
**GET** `/reservations/{id}`

**Path Parameters:**
- `id` (integer, required) - Reservation ID

### Create Reservation
**POST** `/reservations`

**Required Fields:**
- `customerId` (integer) - Customer ID
- `tableId` (integer) - Table ID
- `reservationDate` (string) - Date (YYYY-MM-DD)
- `reservationTime` (string) - Time (HH:MM)
- `partySize` (integer) - Number of guests

**Optional Fields:**
- `notes` (string) - Reservation notes

**Request Body:**
```json
{
  "customerId": 1,
  "tableId": 5,
  "reservationDate": "2025-01-15",
  "reservationTime": "19:00",
  "partySize": 4,
  "notes": "Anniversary celebration"
}
```

### Update Reservation
**PUT** `/reservations/{id}`

**Path Parameters:**
- `id` (integer, required) - Reservation ID

### Delete Reservation
**DELETE** `/reservations/{id}`

**Path Parameters:**
- `id` (integer, required) - Reservation ID

### Get Reservations by Date
**GET** `/reservations/date/{date}`

**Path Parameters:**
- `date` (string, required) - Date (YYYY-MM-DD)

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
9. **Order Management**:
   - Orders can be created for tables, takeaway, or delivery
   - Kitchen orders are automatically generated for dine-in orders
   - Order status flows: pending → preparing → ready → completed
10. **Mobile App Compatibility**:
    - `/api/messages` is an alias for `/api/staff-messages`
    - `/api/promotions` returns filtered promotional messages
    - All mobile app endpoints require authentication
11. **Response Format**: All endpoints return consistent response format:
    - Success responses: `{success: true, data: {...}, message: "..."}`
    - List responses include pagination: `{success: true, data: [...], pagination: {...}}`
    - Error responses: `{error: "error message"}`
12. **Required Fields**: 
    - Sales endpoints require `userId` and `businessId` (not `customerName`)
    - Sales with items require `unitPrice` for each item
    - All timestamps include both `createdAt` and `updatedAt` 