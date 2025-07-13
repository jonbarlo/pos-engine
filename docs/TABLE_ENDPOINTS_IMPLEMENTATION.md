# Table Endpoints Implementation for Flutter App

## Overview

This document describes the implementation of table management endpoints that are required by the Flutter app's waiter feature. All endpoints have been implemented to match the exact specifications provided by the Flutter app.

## Implemented Endpoints

### 1. GET /api/tables
**Purpose:** Get all tables for the business

**Query Parameters:**
- `status` (optional): Filter by table status
- `assignedWaiterId` (optional): Filter by assigned waiter

**Response Format:**
```json
{
  "data": [
    {
      "id": 1,
      "businessId": 1,
      "tableNumber": "Table 1",
      "capacity": 4,
      "status": "available",
      "section": "Main Floor",
      "currentOrderId": null,
      "serverId": null,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Example Usage:**
```bash
GET /api/tables
GET /api/tables?status=occupied
GET /api/tables?assignedWaiterId=1
```

### 2. GET /api/tables/{id}
**Purpose:** Get specific table details

**Response Format:**
```json
{
  "data": {
    "id": 1,
    "businessId": 1,
    "tableNumber": "Table 1",
    "capacity": 4,
    "status": "available",
    "section": "Main Floor",
    "currentOrderId": null,
    "serverId": null,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Example Usage:**
```bash
GET /api/tables/1
```

### 3. PUT /api/tables/{id}/status
**Purpose:** Update table status

**Request Body:**
```json
{
  "status": "available|occupied|reserved|cleaning|out_of_service"
}
```

**Response Format:**
```json
{
  "data": {
    "id": 1,
    "businessId": 1,
    "tableNumber": "Table 1",
    "capacity": 4,
    "status": "occupied",
    "section": "Main Floor",
    "currentOrderId": null,
    "serverId": null,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Example Usage:**
```bash
PUT /api/tables/1/status
Content-Type: application/json

{
  "status": "occupied"
}
```

### 4. PUT /api/tables/{id}/assign
**Purpose:** Assign table to waiter

**Request Body:**
```json
{
  "waiterId": 123
}
```

**Response Format:**
```json
{
  "data": {
    "id": 1,
    "businessId": 1,
    "tableNumber": "Table 1",
    "capacity": 4,
    "status": "available",
    "section": "Main Floor",
    "currentOrderId": null,
    "serverId": 123,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Example Usage:**
```bash
PUT /api/tables/1/assign
Content-Type: application/json

{
  "waiterId": 123
}
```

### 5. POST /api/tables/{id}/clear
**Purpose:** Clear table (reset status, remove orders, etc.)

**Response Format:**
```json
{
  "data": {
    "id": 1,
    "businessId": 1,
    "tableNumber": "Table 1",
    "capacity": 4,
    "status": "available",
    "section": "Main Floor",
    "currentOrderId": null,
    "serverId": null,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Example Usage:**
```bash
POST /api/tables/1/clear
```

## Table Status Values

The following status values are supported:

- **"available"** - Table is free
- **"occupied"** - Table has customers/orders
- **"reserved"** - Table is reserved
- **"cleaning"** - Table is being cleaned
- **"out_of_service"** - Table is out of service

## Table Object Structure

Each table object contains the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique table identifier |
| `businessId` | integer | Business ID the table belongs to |
| `tableNumber` | string | Table number/name |
| `capacity` | integer | Maximum number of guests |
| `status` | string | Current table status |
| `section` | string | Table section (e.g., "Main Floor", "Patio") |
| `currentOrderId` | integer/null | Current order ID if table is occupied |
| `serverId` | integer/null | Assigned waiter/server ID |
| `isActive` | boolean | Whether table is active |
| `createdAt` | datetime | Creation timestamp |
| `updatedAt` | datetime | Last update timestamp |

## Authentication & Authorization

All table endpoints require:

1. **Authentication:** Valid JWT token in Authorization header
2. **Authorization:** User must belong to a restaurant business
3. **Business Scope:** Users can only access tables from their own business

**Example Authentication:**
```bash
Authorization: Bearer <your-jwt-token>
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid status value",
  "validStatuses": ["available", "occupied", "reserved", "cleaning", "out_of_service"]
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
  "error": "Business is not restaurant type"
}
```

### 404 Not Found
```json
{
  "error": "Table not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to get tables"
}
```

## Additional Endpoints

### POST /api/tables
**Purpose:** Create a new table

**Request Body:**
```json
{
  "tableNumber": "Table 5",
  "capacity": 6,
  "section": "Patio"
}
```

### PUT /api/tables/{id}
**Purpose:** Update table details

**Request Body:**
```json
{
  "tableNumber": "Table 5",
  "capacity": 6,
  "status": "available",
  "section": "Patio",
  "isActive": true
}
```

### DELETE /api/tables/{id}
**Purpose:** Delete a table

## Testing

Comprehensive tests have been created in `src/routes/__tests__/tables.test.ts` to verify:

- Response format matches Flutter app expectations
- Filtering by status and assigned waiter works correctly
- Status updates are validated properly
- Table assignment works correctly
- Table clearing resets all relevant fields
- Error handling for invalid inputs

## Implementation Notes

1. **Response Format:** All endpoints return data wrapped in a `data` property to match Flutter app expectations
2. **Business Isolation:** All queries are scoped to the authenticated user's business
3. **Status Validation:** Status values are validated against the `TableStatus` enum
4. **Type Safety:** All endpoints include proper TypeScript typing and validation
5. **Logging:** Comprehensive logging for debugging and monitoring
6. **Documentation:** Full Swagger/OpenAPI documentation for all endpoints

## Migration from Previous Implementation

The previous table routes have been updated to:

1. Use the `data` wrapper in responses
2. Remove the `businessId` query parameter requirement (now uses authenticated user's business)
3. Add proper authentication middleware
4. Include all required fields in responses
5. Match the exact Flutter app specifications

## Next Steps

With these endpoints implemented, the Flutter app's waiter feature should work seamlessly. The 404 errors will be resolved, and waitstaff users will see the proper table management interface.

To test the implementation:

1. Ensure the database has tables for your restaurant business
2. Use the authentication token from a restaurant business user
3. Test each endpoint with the Flutter app or API testing tools
4. Verify that the response format matches the expected structure 