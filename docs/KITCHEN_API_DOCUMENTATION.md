# 🍳 Kitchen Order Management API Documentation

This document provides comprehensive documentation for the Kitchen Order Management API endpoints.

## 📋 Table of Contents

- [Authentication](#authentication)
- [Base URL](#base-url)
- [Endpoints Overview](#endpoints-overview)
- [Detailed Endpoint Documentation](#detailed-endpoint-documentation)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Examples](#examples)

## 🔐 Authentication

All kitchen endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🌐 Base URL

```
http://localhost:3000/api/kitchen
```

## 📊 Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders` | Get all kitchen orders with filtering |
| GET | `/orders/:id` | Get specific kitchen order by ID |
| PUT | `/orders/:id` | Update kitchen order details |
| PUT | `/orders/:id/start-preparing` | Start preparing an order |
| PUT | `/orders/:id/ready` | Mark order as ready |
| PUT | `/orders/:id/served` | Mark order as served |
| PUT | `/orders/:orderId/items/:itemId/status` | Update individual item status |
| PUT | `/orders/:id/assign` | Assign order to chef/staff |
| GET | `/stats` | Get kitchen statistics |

## 📖 Detailed Endpoint Documentation

### 1. Get All Kitchen Orders

**Endpoint:** `GET /api/kitchen/orders`

**Description:** Retrieve all kitchen orders for the authenticated user's business with optional filtering.

**Query Parameters:**
- `status` (optional): Filter by order status
  - Values: `pending`, `confirmed`, `preparing`, `ready`, `served`, `cancelled`
- `priority` (optional): Filter by priority level
  - Values: `low`, `normal`, `high`, `urgent`
- `station` (optional): Filter by kitchen station
- `assignedTo` (optional): Filter by assigned user ID
- `orderType` (optional): Filter by order type
  - Values: `dine_in`, `takeaway`, `delivery`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "businessId": 1,
      "orderId": 123,
      "orderNumber": "ORD-1703123456789-1234-123",
      "customerName": "John Doe",
      "orderType": "dine_in",
      "priority": "normal",
      "status": "pending",
      "estimatedPrepTime": 15,
      "actualPrepTime": null,
      "startTime": null,
      "readyTime": null,
      "servedTime": null,
      "items": [
        {
          "id": 1,
          "itemName": "Classic Burger",
          "quantity": 2,
          "status": "pending",
          "preparationTime": 10,
          "specialInstructions": "No onions"
        }
      ],
      "totalItems": 1,
      "completedItems": 0,
      "assignedTo": null,
      "assignedToName": null,
      "station": null,
      "notes": null,
      "createdAt": "2025-01-01T12:00:00.000Z",
      "updatedAt": "2025-01-01T12:00:00.000Z"
    }
  ]
}
```

### 2. Get Kitchen Order by ID

**Endpoint:** `GET /api/kitchen/orders/:id`

**Description:** Retrieve a specific kitchen order by its ID.

**Path Parameters:**
- `id` (required): Kitchen order ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "businessId": 1,
    "orderId": 123,
    "orderNumber": "ORD-1703123456789-1234-123",
    "customerName": "John Doe",
    "orderType": "dine_in",
    "priority": "normal",
    "status": "pending",
    "estimatedPrepTime": 15,
    "actualPrepTime": null,
    "startTime": null,
    "readyTime": null,
    "servedTime": null,
    "items": [...],
    "totalItems": 1,
    "completedItems": 0,
    "assignedTo": null,
    "assignedToName": null,
    "station": null,
    "notes": null,
    "createdAt": "2025-01-01T12:00:00.000Z",
    "updatedAt": "2025-01-01T12:00:00.000Z"
  }
}
```

### 3. Update Kitchen Order

**Endpoint:** `PUT /api/kitchen/orders/:id`

**Description:** Update kitchen order details including status, priority, notes, etc.

**Path Parameters:**
- `id` (required): Kitchen order ID

**Request Body:**
```json
{
  "status": "confirmed",
  "priority": "high",
  "notes": "Customer is in a hurry",
  "station": "grill"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "confirmed",
    "priority": "high",
    "notes": "Customer is in a hurry",
    "station": "grill",
    "updatedAt": "2025-01-01T12:05:00.000Z"
  },
  "message": "Kitchen order updated successfully"
}
```

### 4. Start Preparing Order

**Endpoint:** `PUT /api/kitchen/orders/:id/start-preparing`

**Description:** Mark an order as being prepared and optionally assign it to a chef.

**Path Parameters:**
- `id` (required): Kitchen order ID

**Request Body:**
```json
{
  "assignedTo": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "preparing",
    "assignedTo": 5,
    "assignedToName": "Chef John",
    "startTime": "2025-01-01T12:10:00.000Z"
  },
  "message": "Kitchen order started preparing"
}
```

### 5. Mark Order as Ready

**Endpoint:** `PUT /api/kitchen/orders/:id/ready`

**Description:** Mark an order as ready for pickup/serving.

**Path Parameters:**
- `id` (required): Kitchen order ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "ready",
    "readyTime": "2025-01-01T12:25:00.000Z",
    "actualPrepTime": 15
  },
  "message": "Kitchen order marked as ready"
}
```

### 6. Mark Order as Served

**Endpoint:** `PUT /api/kitchen/orders/:id/served`

**Description:** Mark an order as served to the customer.

**Path Parameters:**
- `id` (required): Kitchen order ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "served",
    "servedTime": "2025-01-01T12:30:00.000Z"
  },
  "message": "Kitchen order marked as served"
}
```

### 7. Update Item Status

**Endpoint:** `PUT /api/kitchen/orders/:orderId/items/:itemId/status`

**Description:** Update the status of a specific item within a kitchen order.

**Path Parameters:**
- `orderId` (required): Kitchen order ID
- `itemId` (required): Item ID within the order

**Request Body:**
```json
{
  "status": "preparing",
  "assignedTo": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "items": [
      {
        "id": 1,
        "itemName": "Classic Burger",
        "quantity": 2,
        "status": "preparing",
        "assignedTo": 5,
        "assignedToName": "Chef John",
        "startTime": "2025-01-01T12:15:00.000Z"
      }
    ]
  },
  "message": "Item status updated to preparing"
}
```

### 8. Assign Order

**Endpoint:** `PUT /api/kitchen/orders/:id/assign`

**Description:** Assign a kitchen order to a specific chef or staff member.

**Path Parameters:**
- `id` (required): Kitchen order ID

**Request Body:**
```json
{
  "assignedTo": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "assignedTo": 5,
    "assignedToName": "Chef John"
  },
  "message": "Kitchen order assigned successfully"
}
```

### 9. Get Kitchen Statistics

**Endpoint:** `GET /api/kitchen/stats`

**Description:** Get kitchen performance statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 25,
    "pendingOrders": 5,
    "preparingOrders": 8,
    "readyOrders": 3,
    "averagePrepTime": 12
  }
}
```

## 📊 Data Models

### Kitchen Order Status Flow

```
pending → confirmed → preparing → ready → served
    ↓
cancelled
```

### Priority Levels

- `low`: Low priority orders
- `normal`: Standard priority (default)
- `high`: High priority orders
- `urgent`: Emergency/rush orders

### Item Status Flow

```
pending → preparing → ready → served
```

## ⚠️ Error Handling

### Common Error Responses

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Order ID is required"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Kitchen order not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## 💡 Examples

### Complete Order Workflow

1. **Get pending orders:**
```bash
curl -X GET "http://localhost:3000/api/kitchen/orders?status=pending" \
  -H "Authorization: Bearer <token>"
```

2. **Start preparing an order:**
```bash
curl -X PUT "http://localhost:3000/api/kitchen/orders/1/start-preparing" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"assignedTo": 5}'
```

3. **Update item status:**
```bash
curl -X PUT "http://localhost:3000/api/kitchen/orders/1/items/1/status" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "ready"}'
```

4. **Mark order as ready:**
```bash
curl -X PUT "http://localhost:3000/api/kitchen/orders/1/ready" \
  -H "Authorization: Bearer <token>"
```

5. **Mark order as served:**
```bash
curl -X PUT "http://localhost:3000/api/kitchen/orders/1/served" \
  -H "Authorization: Bearer <token>"
```

### Filtering Examples

**Get high priority orders:**
```bash
curl -X GET "http://localhost:3000/api/kitchen/orders?priority=high" \
  -H "Authorization: Bearer <token>"
```

**Get orders assigned to specific chef:**
```bash
curl -X GET "http://localhost:3000/api/kitchen/orders?assignedTo=5" \
  -H "Authorization: Bearer <token>"
```

**Get orders by station:**
```bash
curl -X GET "http://localhost:3000/api/kitchen/orders?station=grill" \
  -H "Authorization: Bearer <token>"
```

## 🔧 Integration Notes

- All timestamps are in ISO 8601 format
- Orders are automatically sorted by priority (urgent first) then by creation time
- Item status updates automatically update the overall order status when all items reach the same status
- The system automatically calculates preparation times when orders are marked as ready
- Kitchen orders are automatically created when sales are completed (if items are present)

## 📱 Mobile App Integration

For mobile kitchen apps, consider implementing:

1. **Real-time updates** using WebSocket connections
2. **Push notifications** for new orders and status changes
3. **Offline capability** for basic order viewing
4. **Sound alerts** for new orders and urgent items
5. **Timer display** for preparation tracking

## 🚀 Performance Considerations

- Use pagination for large order lists
- Implement caching for frequently accessed data
- Consider WebSocket connections for real-time updates
- Optimize database queries with proper indexing
- Use compression for API responses 