# Mobile Reservation System Integration Guide

## Overview
The reservation system has been enhanced to provide comprehensive reservation management capabilities and integrate reservation data with table displays. This enhancement allows the mobile app to display reservation details when tables are marked as "reserved."

## Key Features for Mobile App

### 1. Enhanced Table Responses with Reservation Data
When tables are marked as "reserved" and have active reservations, the API now includes reservation details in the response.

#### Table Endpoints Enhanced
- **GET** `/api/tables` - Now includes reservation data for reserved tables
- **GET** `/api/tables/{id}` - Now includes reservation data for reserved tables

#### Floor Plan Endpoints Enhanced
- **GET** `/api/floor-plans/{id}/tables` - Now includes reservation data for reserved tables

### 2. New Reservation Management Endpoints
Full CRUD operations for managing reservations:

- **GET** `/api/reservations` - Get all reservations
- **GET** `/api/reservations/{id}` - Get specific reservation
- **POST** `/api/reservations` - Create new reservation
- **PUT** `/api/reservations/{id}` - Update reservation
- **DELETE** `/api/reservations/{id}` - Delete reservation

## API Response Examples

### Table Response with Reservation Data
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

### Floor Plan Response with Reservation Data
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

### Reservation Response
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

## When Reservation Data is Included

Reservation data is only included in table responses when:
- Table status is "reserved"
- Table has active reservations (status: pending or confirmed)
- Reservation date matches today's date

## Creating Reservations

### Required Fields
- `customerName` (string) - Customer name
- `partySize` (integer) - Number of guests (1-20)
- `reservationDate` (string) - Date in YYYY-MM-DD format
- `reservationTime` (string) - Time in HH:MM:SS format

### Optional Fields
- `tableId` (integer) - Assigned table ID
- `customerId` (integer) - Customer ID if customer exists in system
- `customerPhone` (string) - Customer phone number
- `customerEmail` (string) - Customer email address
- `status` (string) - Reservation status (default: "pending")
- `specialRequests` (string) - Special requests or notes

### Example Request
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

## Validation Rules

- Party size must be between 1 and 20
- Date must be in YYYY-MM-DD format
- Time must be in HH:MM:SS format
- Table ID must exist and belong to the business

## Reservation Statuses

- `pending` - Reservation is pending confirmation
- `confirmed` - Reservation is confirmed
- `seated` - Customer has been seated
- `completed` - Reservation is completed
- `cancelled` - Reservation is cancelled
- `no_show` - Customer did not show up

## Mobile App Integration Points

### 1. Table Display
- Check for `reservation` property in table objects
- Display reservation details when available
- Show customer name, party size, time, and notes

### 2. Floor Plan Display
- Check for `reservation` property in table positions
- Display reservation details on floor plan
- Show reservation information in table tooltips/popups

### 3. Reservation Management
- Use reservation endpoints for CRUD operations
- Implement reservation creation/editing forms
- Display reservation list with filtering options

### 4. Status Updates
- Update table status to "reserved" when creating reservations
- Handle reservation status changes
- Update UI when reservations are confirmed/cancelled

## Testing

The API includes comprehensive tests for the reservation system. You can test the endpoints using:

1. **Create a reservation:**
   ```bash
   POST /api/reservations
   ```

2. **Get tables with reservation data:**
   ```bash
   GET /api/tables
   ```

3. **Get floor plan with reservation data:**
   ```bash
   GET /api/floor-plans/{id}/tables
   ```

## Error Handling

The API returns standard error responses:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource not found)
- `500` - Internal Server Error

## Authentication

All reservation endpoints require authentication using Bearer tokens:
```
Authorization: Bearer <your_jwt_token>
```

## Business Scoping

All reservation data is automatically scoped to the authenticated user's business, ensuring data security and isolation.

## Summary

The reservation system is now fully integrated and ready for mobile app use. The key changes are:

1. **Enhanced table responses** include reservation data when applicable
2. **New reservation endpoints** for full CRUD operations
3. **Floor plan integration** shows reservation data on visual layouts
4. **Automatic data inclusion** based on table status and reservation date
5. **Comprehensive validation** ensures data integrity
6. **Business scoping** maintains data security

The mobile app can now display reservation information seamlessly within the existing table and floor plan interfaces. 