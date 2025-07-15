# POS Engine API Documentation

## Overview
This document provides comprehensive documentation for the POS Engine API, a Node.js-based point-of-sale system designed for restaurant and retail businesses.

## Base URL
```
http://localhost:3000/api
```

## Authentication
All API endpoints require authentication using JWT Bearer tokens, except for login endpoints.

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Business Types
The API supports two business types:
- `generic`: General retail businesses
- `restaurant`: Restaurant businesses with additional features

## Core Schemas

### Business Schema
```json
{
  "type": "object",
  "properties": {
    "id": { "type": "integer" },
    "name": { "type": "string" },
    "slug": { "type": "string" },
    "description": { "type": "string" },
    "logo": { "type": "string" },
    "primaryColor": { "type": "string" },
    "secondaryColor": { "type": "string" },
    "address": { "type": "string" },
    "phone": { "type": "string" },
    "email": { "type": "string" },
    "website": { "type": "string" },
    "taxRate": { "type": "number" },
    "currency": { "type": "string" },
    "timezone": { "type": "string" },
    "isActive": { "type": "boolean" },
    "type": { "type": "string", "enum": ["generic", "restaurant"] },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" }
  }
}
```

### User Schema
```json
{
  "type": "object",
  "properties": {
    "id": { "type": "integer" },
    "businessId": { "type": "integer" },
    "name": { "type": "string" },
    "email": { "type": "string" },
    "role": { "type": "string", "enum": ["admin", "owner", "manager", "wait_staff", "cashier", "kitchen_staff", "viewer"] },
    "isActive": { "type": "boolean" },
    "assignment": { "type": "string", "enum": ["kitchen_read", "kitchen_write", "kitchen_manager", "none"] },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" }
  }
}
```

### Item Schema
```json
{
  "type": "object",
  "properties": {
    "id": { "type": "integer" },
    "businessId": { "type": "integer" },
    "name": { "type": "string" },
    "description": { "type": "string" },
    "price": { "type": "number" },
    "cost": { "type": "number" },
    "stock": { "type": "integer" },
    "category": { "type": "string" },
    "imageUrl": { "type": "string" },
    "isActive": { "type": "boolean" },
    "sku": { "type": "string" },
    "barcode": { "type": "string" },
    "unit": { "type": "string" },
    "minStock": { "type": "integer" },
    "maxStock": { "type": "integer" },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" }
  }
}
```

### Sale Schema
```json
{
  "type": "object",
  "properties": {
    "id": { "type": "integer" },
    "businessId": { "type": "integer" },
    "userId": { "type": "integer" },
    "saleNumber": { "type": "string" },
    "subtotal": { "type": "number" },
    "taxAmount": { "type": "number" },
    "discountAmount": { "type": "number" },
    "totalAmount": { "type": "number" },
    "paymentMethod": { "type": "string" },
    "status": { "type": "string", "enum": ["pending", "completed", "cancelled", "refunded"] },
    "customerName": { "type": "string" },
    "customerPhone": { "type": "string" },
    "customerEmail": { "type": "string" },
    "customerId": { "type": "integer", "nullable": true },
    "notes": { "type": "string" },
    "payments": { "type": "string" },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" }
  }
}
```

### Table Schema
```json
{
  "type": "object",
  "properties": {
    "id": { "type": "integer" },
    "businessId": { "type": "integer" },
    "tableNumber": { "type": "string" },
    "capacity": { "type": "integer" },
    "partySize": { "type": "integer", "nullable": true },
    "status": { "type": "string", "enum": ["available", "occupied", "reserved", "cleaning", "out_of_service"] },
    "section": { "type": "string" },
    "currentOrderId": { "type": "integer", "nullable": true },
    "serverId": { "type": "integer", "nullable": true },
    "isActive": { "type": "boolean" },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" }
  }
}
```

### Order Schema
```json
{
  "type": "object",
  "properties": {
    "id": { "type": "integer" },
    "businessId": { "type": "integer" },
    "serverId": { "type": "integer" },
    "customerId": { "type": "integer", "nullable": true },
    "orderNumber": { "type": "string" },
    "tableId": { "type": "integer", "nullable": true },
    "status": { "type": "string", "enum": ["pending", "confirmed", "in_progress", "ready", "served", "completed", "cancelled"] },
    "orderType": { "type": "string", "enum": ["dine_in", "takeaway", "delivery"] },
    "subtotal": { "type": "number" },
    "totalAmount": { "type": "number" },
    "taxAmount": { "type": "number" },
    "discountAmount": { "type": "number" },
    "tipAmount": { "type": "number" },
    "notes": { "type": "string" },
    "specialInstructions": { "type": "string" },
    "estimatedReadyTime": { "type": "string", "format": "date-time", "nullable": true },
    "actualReadyTime": { "type": "string", "format": "date-time", "nullable": true },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" }
  }
}
```

### Menu Item Schema
```json
{
  "type": "object",
  "properties": {
    "id": { "type": "integer" },
    "businessId": { "type": "integer" },
    "categoryId": { "type": "integer" },
    "itemId": { "type": "integer", "nullable": true },
    "name": { "type": "string" },
    "description": { "type": "string" },
    "price": { "type": "number" },
    "cost": { "type": "number" },
    "sku": { "type": "string" },
    "barcode": { "type": "string" },
    "imageUrl": { "type": "string" },
    "ingredients": { "type": "string" },
    "allergens": { "type": "string" },
    "nutritionalInfo": { "type": "string" },
    "preparationTime": { "type": "integer" },
    "isAvailable": { "type": "boolean" },
    "isVegetarian": { "type": "boolean" },
    "isVegan": { "type": "boolean" },
    "isGlutenFree": { "type": "boolean" },
    "isSpicy": { "type": "boolean" },
    "spiceLevel": { "type": "integer", "nullable": true },
    "calories": { "type": "integer", "nullable": true },
    "tags": { "type": "string" },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" }
  }
}
```

## Authentication Endpoints

### POST /auth/login
Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "manager",
    "businessId": 1
  }
}
```

### POST /auth/register
Register a new user (admin only).

**Request Body:**
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "wait_staff",
  "assignment": "none"
}
```

## Business Endpoints

### GET /businesses
Get all businesses (admin only).

### GET /businesses/:id
Get a specific business.

### POST /businesses
Create a new business.

**Request Body:**
```json
{
  "name": "My Restaurant",
  "slug": "my-restaurant",
  "description": "A great restaurant",
  "type": "restaurant",
  "taxRate": 8.5,
  "currency": "USD"
}
```

### PUT /businesses/:id
Update a business.

### DELETE /businesses/:id
Delete a business.

## User Endpoints

### GET /users
Get all users for the current business.

### GET /users/:id
Get a specific user.

### POST /users
Create a new user.

### PUT /users/:id
Update a user.

### DELETE /users/:id
Delete a user.

## Item Endpoints

### GET /items
Get all items for the current business.

**Query Parameters:**
- `category` (optional): Filter by category
- `isActive` (optional): Filter by active status

### GET /items/:id
Get a specific item.

### POST /items
Create a new item.

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 19.99,
  "cost": 10.00,
  "stock": 100,
  "category": "Electronics",
  "sku": "PROD-001",
  "barcode": "1234567890123"
}
```

### PUT /items/:id
Update an item.

### DELETE /items/:id
Delete an item.

## Sale Endpoints

### GET /sales
Get all sales for the current business.

**Query Parameters:**
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date
- `status` (optional): Filter by status

### GET /sales/:id
Get a specific sale.

### POST /sales
Create a new sale.

**Request Body:**
```json
{
  "items": [
    {
      "itemId": 1,
      "quantity": 2,
      "unitPrice": 19.99
    }
  ],
  "paymentMethod": "credit_card",
  "customerName": "John Doe",
  "customerEmail": "john@example.com"
}
```

### PUT /sales/:id
Update a sale.

### DELETE /sales/:id
Delete a sale.

## Table Endpoints (Restaurant Only)

### GET /tables
Get all tables for the current business.

**Query Parameters:**
- `status` (optional): Filter by status
- `section` (optional): Filter by section

### GET /tables/:id
Get a specific table.

### POST /tables
Create a new table.

**Request Body:**
```json
{
  "tableNumber": "A1",
  "capacity": 4,
  "section": "Main Floor"
}
```

### PUT /tables/:id
Update a table.

### DELETE /tables/:id
Delete a table.

### POST /tables/:id/seat
Seat customers at a table.

**Request Body:**
```json
{
  "partySize": 4,
  "serverId": 3,
  "notes": "Window seat preferred"
}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "businessId": 1,
    "tableNumber": "A1",
    "capacity": 4,
    "partySize": 4,
    "status": "occupied",
    "section": "Main Floor",
    "currentOrderId": null,
    "serverId": 3,
    "isActive": true,
    "createdAt": "2024-01-14T22:11:29.847Z",
    "updatedAt": "2024-01-14T22:11:29.847Z"
  },
  "message": "Successfully seated party of 4 at table A1"
}
```

### POST /tables/:id/clear
Clear a table (reset status, remove orders, etc.).

**Response:**
```json
{
  "data": {
    "id": 1,
    "businessId": 1,
    "tableNumber": "A1",
    "capacity": 4,
    "partySize": null,
    "status": "available",
    "section": "Main Floor",
    "currentOrderId": null,
    "serverId": null,
    "isActive": true,
    "createdAt": "2024-01-14T22:11:29.847Z",
    "updatedAt": "2024-01-14T22:11:29.847Z"
  }
}
```

### GET /tables/:id/orders
Get orders for a specific table.

## Order Endpoints (Restaurant Only)

### GET /orders
Get all orders for the current business.

**Query Parameters:**
- `status` (optional): Filter by status
- `tableId` (optional): Filter by table
- `orderType` (optional): Filter by order type

### GET /orders/:id
Get a specific order.

### POST /orders
Create a new order.

**Request Body:**
```json
{
  "tableId": 1,
  "orderType": "dine_in",
  "items": [
    {
      "itemId": 1,
      "quantity": 2,
      "specialInstructions": "Extra cheese"
    }
  ],
  "notes": "Window seat"
}
```

### PUT /orders/:id
Update an order.

### DELETE /orders/:id
Delete an order.

## Menu Endpoints (Restaurant Only)

### GET /menu/categories
Get all menu categories for the current business.

### GET /menu/items
Get all menu items for the current business.

**Query Parameters:**
- `categoryId` (optional): Filter by category
- `isAvailable` (optional): Filter by availability

### GET /menu/items/:id
Get a specific menu item.

### POST /menu/items
Create a new menu item.

**Request Body:**
```json
{
  "categoryId": 1,
  "itemId": 1,
  "name": "Margherita Pizza",
  "description": "Fresh mozzarella, tomato sauce, basil",
  "price": 18.99,
  "cost": 8.50,
  "sku": "PIZ-001",
  "imageUrl": "https://example.com/pizza.jpg",
  "preparationTime": 15,
  "isAvailable": true
}
```

### PUT /menu/items/:id
Update a menu item.

### DELETE /menu/items/:id
Delete a menu item.

## Customer Endpoints

### GET /customers
Get all customers for the current business.

**Query Parameters:**
- `search` (optional): Search by name, email, or phone

### GET /customers/:id
Get a specific customer.

### POST /customers
Create a new customer.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1-555-0123",
  "address": "123 Main St",
  "dateOfBirth": "1990-01-01"
}
```

### PUT /customers/:id
Update a customer.

### DELETE /customers/:id
Delete a customer.

## Reservation Endpoints (Restaurant Only)

### GET /reservations
Get all reservations for the current business.

**Query Parameters:**
- `date` (optional): Filter by date
- `status` (optional): Filter by status

### GET /reservations/:id
Get a specific reservation.

### POST /reservations
Create a new reservation.

**Request Body:**
```json
{
  "tableId": 1,
  "customerName": "John Doe",
  "customerPhone": "+1-555-0123",
  "customerEmail": "john@example.com",
  "partySize": 4,
  "reservationDate": "2024-01-15",
  "reservationTime": "19:00",
  "specialRequests": "Window seat preferred"
}
```

### PUT /reservations/:id
Update a reservation.

### DELETE /reservations/:id
Delete a reservation.

## Kitchen Order Endpoints (Restaurant Only)

### GET /kitchen/orders
Get all kitchen orders for the current business.

**Query Parameters:**
- `status` (optional): Filter by status
- `priority` (optional): Filter by priority

### GET /kitchen/orders/:id
Get a specific kitchen order.

### POST /kitchen/orders/:id/assign
Assign a kitchen order to a chef.

**Request Body:**
```json
{
  "chefId": 1
}
```

### PUT /kitchen/orders/:id/status
Update kitchen order status.

**Request Body:**
```json
{
  "status": "ready"
}
```

## Staff Message Endpoints

### GET /staff-messages
Get all staff messages for the current business.

**Query Parameters:**
- `messageType` (optional): Filter by message type
- `priority` (optional): Filter by priority
- `isRead` (optional): Filter by read status

### GET /staff-messages/:id
Get a specific staff message.

### POST /staff-messages
Create a new staff message.

**Request Body:**
```json
{
  "messageType": "announcement",
  "title": "Staff Meeting",
  "content": "Reminder: Staff meeting tomorrow at 2 PM",
  "recipientType": "all",
  "priority": "normal"
}
```

### PUT /staff-messages/:id
Update a staff message.

### DELETE /staff-messages/:id
Delete a staff message.

### POST /staff-messages/:id/read
Mark a message as read.

## Delivery Endpoints (Restaurant Only)

### GET /deliveries
Get all deliveries for the current business.

**Query Parameters:**
- `status` (optional): Filter by status
- `driverId` (optional): Filter by driver

### GET /deliveries/:id
Get a specific delivery.

### POST /deliveries
Create a new delivery.

**Request Body:**
```json
{
  "orderId": 1,
  "customerId": 1,
  "driverId": 1,
  "deliveryAddress": "123 Main St",
  "deliveryInstructions": "Ring doorbell twice",
  "deliveryFee": 5.00
}
```

### PUT /deliveries/:id
Update a delivery.

### DELETE /deliveries/:id
Delete a delivery.

## Split Billing Endpoints (Restaurant Only)

### POST /split-billing/split
Split a bill into multiple payments.

**Request Body:**
```json
{
  "orderId": 1,
  "splits": [
    {
      "customerName": "John Doe",
      "items": [1, 2],
      "paymentMethod": "credit_card"
    },
    {
      "customerName": "Jane Smith",
      "items": [3, 4],
      "paymentMethod": "cash"
    }
  ]
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid input data",
  "details": ["Field 'email' is required"]
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting
API requests are rate-limited to prevent abuse. Limits vary by endpoint and user role.

## Pagination
List endpoints support pagination with the following query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response Format:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

## WebSocket Support
Real-time updates are available via WebSocket connections for:
- Kitchen order updates
- Table status changes
- Staff messages
- Order status changes

WebSocket URL: `ws://localhost:3000/ws`

## Testing
The API includes comprehensive test coverage. Run tests with:
```bash
npm test
```

## Development
Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000/api` with Swagger documentation at `http://localhost:3000/api-docs`. 