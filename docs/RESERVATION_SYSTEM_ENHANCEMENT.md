# Reservation System Enhancement

## Overview

The reservation system has been enhanced to provide comprehensive reservation management capabilities and integrate reservation data with table displays. This enhancement allows the mobile app to display reservation details when tables are marked as "reserved."

## Features

### 1. Enhanced Table Responses with Reservation Data

When tables are marked as "reserved" and have active reservations, the API now includes reservation details in the response:

#### Floor Plan Tables Response
```json
{
  "id": 1,
  "name": "Main Dining Room",
  "width": 1200,
  "height": 800,
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

#### Tables List Response
```json
{
  "data": [
    {
      "id": 1,
      "businessId": 1,
      "tableNumber": "A1",
      "capacity": 4,
      "status": "reserved",
      "section": "Main Floor",
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

### 2. Comprehensive Reservation Management

#### Reservation Model Fields
- `id`: Unique reservation identifier
- `businessId`: Associated business
- `tableId`: Assigned table (optional)
- `customerId`: Customer record (optional)
- `customerName`: Customer name
- `customerPhone`: Customer phone number
- `customerEmail`: Customer email address
- `partySize`: Number of guests
- `reservationDate`: Date (YYYY-MM-DD)
- `reservationTime`: Time (HH:MM:SS)
- `status`: Reservation status (pending, confirmed, seated, completed, cancelled, no_show)
- `specialRequests`: Special requests or notes
- `duration`: Reservation duration in minutes (default: 90)
- `source`: Reservation source (phone, online, walk_in)

#### Reservation Statuses
- `pending`: Initial reservation state
- `confirmed`: Reservation confirmed by staff
- `seated`: Guests have been seated
- `completed`: Reservation completed
- `cancelled`: Reservation cancelled
- `no_show`: Guests didn't show up

## API Endpoints

### 1. Get All Reservations
```
GET /api/reservations
```

**Query Parameters:**
- `date`: Filter by reservation date (YYYY-MM-DD)
- `status`: Filter by reservation status
- `tableId`: Filter by assigned table

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "businessId": 1,
      "tableId": 1,
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

### 2. Get Specific Reservation
```
GET /api/reservations/:id
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "businessId": 1,
    "tableId": 1,
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

### 3. Create Reservation
```
POST /api/reservations
```

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

**Required Fields:**
- `customerName`: Customer name
- `partySize`: Number of guests (1-20)
- `reservationDate`: Date in YYYY-MM-DD format
- `reservationTime`: Time in HH:MM:SS format

**Validation Rules:**
- Party size must be between 1 and 20
- Date must be in YYYY-MM-DD format
- Time must be in HH:MM:SS format
- Table ID must exist and belong to the business

### 4. Update Reservation
```
PUT /api/reservations/:id
```

**Request Body:** Same as create, but all fields are optional

### 5. Delete Reservation
```
DELETE /api/reservations/:id
```

## Enhanced Table Endpoints

### 1. Get Tables with Reservation Data
```
GET /api/tables
```

When a table has status "reserved" and active reservations, the response includes reservation details.

### 2. Get Floor Plan with Tables
```
GET /api/floor-plans/:id/tables
```

Table positions include reservation data when tables are reserved.

## Mobile App Integration

### Expected API Response Format

The mobile app should expect the following format when tables are reserved:

```json
{
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

### Key Points for Mobile Development

1. **Reservation Data Availability**: Reservation data is only included when:
   - Table status is "reserved"
   - Table has active reservations (status: pending or confirmed)
   - Reservation date matches today's date

2. **Reservation Object**: The `reservation` object contains:
   - `customerName`: Customer's name
   - `customerPhone`: Customer's phone number
   - `partySize`: Number of guests
   - `reservationDate`: Date of reservation
   - `reservationTime`: Time of reservation
   - `notes`: Special requests or notes

3. **Table Status**: The `tableStatus` field indicates the current state:
   - `available`: Table is free
   - `occupied`: Table has active orders
   - `reserved`: Table has reservations
   - `cleaning`: Table is being cleaned
   - `out_of_service`: Table is not available

## Database Schema

### Reservations Table
```sql
CREATE TABLE reservations (
  id INT PRIMARY KEY IDENTITY(1,1),
  businessId INT NOT NULL,
  tableId INT NULL,
  customerId INT NULL,
  customerName NVARCHAR(255) NOT NULL,
  customerPhone NVARCHAR(50) NULL,
  customerEmail NVARCHAR(255) NULL,
  partySize INT NOT NULL,
  reservationDate DATE NOT NULL,
  reservationTime TIME NOT NULL,
  status NVARCHAR(50) NOT NULL DEFAULT 'pending',
  specialRequests NVARCHAR(MAX) NULL,
  duration INT NOT NULL DEFAULT 90,
  source NVARCHAR(50) NOT NULL DEFAULT 'phone',
  createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
  updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
  FOREIGN KEY (businessId) REFERENCES businesses(id),
  FOREIGN KEY (tableId) REFERENCES restaurant_tables(id),
  FOREIGN KEY (customerId) REFERENCES customers(id)
);
```

## Testing

Comprehensive tests have been created to verify:

1. **Reservation CRUD Operations**
   - Create reservations with validation
   - Read reservations with filtering
   - Update reservations
   - Delete reservations

2. **Table Integration**
   - Tables with reservation data
   - Floor plans with reservation data
   - Proper filtering by date and status

3. **Validation**
   - Required field validation
   - Party size limits (1-20)
   - Date and time format validation
   - Table existence validation

## Usage Examples

### Creating a Reservation
```javascript
const reservation = await fetch('/api/reservations', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    tableId: 1,
    customerName: 'John Smith',
    customerPhone: '+1-555-0101',
    partySize: 4,
    reservationDate: '2024-01-15',
    reservationTime: '19:00:00',
    specialRequests: 'Window seat preferred'
  })
});
```

### Getting Tables with Reservations
```javascript
const tables = await fetch('/api/tables', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Tables with status "reserved" will include reservation data
const reservedTables = tables.data.filter(table => 
  table.status === 'reserved' && table.reservation
);
```

### Getting Floor Plan with Reservations
```javascript
const floorPlan = await fetch('/api/floor-plans/1/tables', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Table positions with reservations will include reservation data
const tablesWithReservations = floorPlan.tablePositions.filter(pos => 
  pos.tableStatus === 'reserved' && pos.reservation
);
```

## Security Considerations

1. **Authentication**: All reservation endpoints require authentication
2. **Authorization**: Users can only access reservations for their business
3. **Input Validation**: All inputs are validated for format and business rules
4. **SQL Injection Protection**: Using parameterized queries
5. **Data Sanitization**: Input data is sanitized before database operations

## Performance Considerations

1. **Indexing**: Database indexes on frequently queried fields
2. **Efficient Queries**: Using includes for related data
3. **Date Filtering**: Optimized date-based queries
4. **Pagination**: Support for large datasets (future enhancement)

## Future Enhancements

1. **Reservation Conflicts**: Prevent overlapping reservations
2. **Email Notifications**: Send confirmation emails
3. **SMS Reminders**: Send text message reminders
4. **Online Booking**: Public reservation booking interface
5. **Waitlist Management**: Handle overflow reservations
6. **Analytics**: Reservation statistics and reporting 