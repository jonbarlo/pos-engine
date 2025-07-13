# Staff Messaging System

## Overview

The Staff Messaging System provides internal communication capabilities for restaurant staff, enabling managers to send announcements, promotions, inventory alerts, and other important messages to specific staff roles or all employees.

## Features

- **Role-based messaging**: Send messages to specific staff roles (waitstaff, kitchen, managers, etc.)
- **Message types**: Support for announcements, inventory alerts, promotions, discounts, urgent messages, and general communications
- **Priority levels**: Low, normal, high, and urgent priority settings
- **Read tracking**: Track which staff members have read and acknowledged messages
- **Expiration**: Set expiration dates for time-sensitive messages
- **Metadata support**: Store additional data like discount codes, promotion details, etc.

## Message Types

| Type | Description | Use Case |
|------|-------------|----------|
| `announcement` | General announcements | Staff meetings, policy updates, general info |
| `inventory_alert` | Inventory-related alerts | Low stock warnings, out-of-stock notifications |
| `promotion` | Promotional messages | Happy hour, special offers, seasonal promotions |
| `discount` | Discount information | Employee discounts, customer promotions |
| `urgent` | Urgent communications | Emergency situations, immediate action required |
| `general` | General communications | Default type for miscellaneous messages |

## Recipient Types

| Type | Description | Recipients |
|------|-------------|------------|
| `all` | All staff members | Everyone in the business |
| `waitstaff` | Waitstaff only | Servers, hosts, bartenders |
| `kitchen` | Kitchen staff only | Chefs, cooks, prep staff |
| `managers` | Management only | Managers, supervisors, owners |
| `specific_users` | Specific users | Individual staff members by ID |

## Priority Levels

| Level | Description | Visual Indicator |
|-------|-------------|------------------|
| `low` | Low priority | Standard display |
| `normal` | Normal priority | Standard display |
| `high` | High priority | Highlighted |
| `urgent` | Urgent priority | Bold/red highlighting |

## API Endpoints

### Authentication
All endpoints require Bearer token authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Create Message
```http
POST /api/staff-messages
```

**Request Body:**
```json
{
  "messageType": "announcement",
  "title": "Staff Meeting Tomorrow",
  "content": "Mandatory staff meeting at 2 PM in the dining room.",
  "recipientType": "all",
  "priority": "normal",
  "expiresAt": "2025-07-15T18:00:00Z",
  "metadata": {
    "meetingLocation": "Dining Room",
    "duration": "30 minutes"
  }
}
```

### Get All Messages
```http
GET /api/staff-messages?messageType=announcement&priority=high&page=1&limit=20
```

**Query Parameters:**
- `messageType`: Filter by message type
- `recipientType`: Filter by recipient type
- `status`: Filter by message status
- `priority`: Filter by priority level
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50, max: 100)

### Get Specific Message
```http
GET /api/staff-messages/{id}
```

### Update Message
```http
PUT /api/staff-messages/{id}
```

**Request Body:**
```json
{
  "title": "Updated Staff Meeting",
  "content": "Meeting moved to 3 PM",
  "priority": "high"
}
```

### Delete Message
```http
DELETE /api/staff-messages/{id}
```

### Get User Messages
```http
GET /api/staff-messages/user/me
```
Returns messages relevant to the current user based on their role.

### Mark as Read
```http
POST /api/staff-messages/{id}/read
```

### Mark as Acknowledged
```http
POST /api/staff-messages/{id}/acknowledge
```

### Get Unread Count
```http
GET /api/staff-messages/user/me/unread-count
```

**Response:**
```json
{
  "unreadCount": 5
}
```

### Get Active Messages
```http
GET /api/staff-messages/active
```
Returns non-expired messages for the current user's role.

## Usage Examples

### Sending a Promotion Announcement
```javascript
const promotionMessage = {
  messageType: 'promotion',
  title: 'Happy Hour Special',
  content: 'All drinks 50% off from 4-6 PM today!',
  recipientType: 'waitstaff',
  priority: 'high',
  expiresAt: '2025-07-12T18:00:00Z',
  metadata: {
    discountPercentage: 50,
    validHours: '4-6 PM',
    validDate: '2025-07-12'
  }
};

await fetch('/api/staff-messages', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(promotionMessage)
});
```

### Inventory Alert
```javascript
const inventoryAlert = {
  messageType: 'inventory_alert',
  title: 'Low Stock Alert',
  content: 'Chicken breast is running low. Please update inventory.',
  recipientType: 'kitchen',
  priority: 'urgent',
  metadata: {
    itemName: 'Chicken Breast',
    currentStock: 5,
    reorderPoint: 10
  }
};
```

### Staff Meeting Announcement
```javascript
const meetingAnnouncement = {
  messageType: 'announcement',
  title: 'Monthly Staff Meeting',
  content: 'Monthly staff meeting this Friday at 2 PM. Attendance required.',
  recipientType: 'all',
  priority: 'normal',
  expiresAt: '2025-07-18T14:00:00Z'
};
```

## Database Schema

### staff_messages Table
```sql
CREATE TABLE staff_messages (
  id INTEGER IDENTITY(1,1) PRIMARY KEY,
  businessId INTEGER NOT NULL,
  senderId INTEGER NOT NULL,
  senderName NVARCHAR(100) NOT NULL,
  messageType VARCHAR(255) NOT NULL,
  title NVARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  recipientType VARCHAR(255) NOT NULL,
  recipientIds JSON NULL,
  status VARCHAR(255) NOT NULL DEFAULT 'sent',
  priority VARCHAR(255) NOT NULL DEFAULT 'normal',
  expiresAt DATETIME NULL,
  readBy JSON NULL DEFAULT '[]',
  acknowledgedBy JSON NULL DEFAULT '[]',
  metadata JSON NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (businessId) REFERENCES businesses(id),
  FOREIGN KEY (senderId) REFERENCES users(id)
);
```

## Implementation Notes

### Role-based Filtering
Messages are filtered based on user roles:
- **Waitstaff**: Receives messages for `waitstaff`, `all`, and specific user messages
- **Kitchen**: Receives messages for `kitchen`, `all`, and specific user messages  
- **Managers**: Receives messages for `managers`, `all`, and specific user messages
- **All users**: Receive messages marked for `all` and specific user messages

### Message Expiration
Messages with `expiresAt` dates are automatically marked as expired when the date passes. The system includes a background job to handle message expiration.

### Read/Acknowledged Tracking
- `readBy`: Array of user IDs who have read the message
- `acknowledgedBy`: Array of user IDs who have acknowledged the message
- Status automatically updates based on read/acknowledged status

### Security
- All endpoints require authentication
- Users can only access messages for their business
- Users can only modify messages they created (for update/delete operations)

## Error Handling

### Common Error Responses

**400 Bad Request**
```json
{
  "error": "Missing required fields: messageType, title, content, recipientType"
}
```

**401 Unauthorized**
```json
{
  "error": "Authentication required"
}
```

**404 Not Found**
```json
{
  "error": "Message not found"
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal server error"
}
```

## Testing

Run the test suite:
```bash
npm test -- --testPathPattern=staffMessages
```

The test suite covers:
- Service layer unit tests
- Controller integration tests
- API endpoint tests
- Authentication and authorization
- Error handling scenarios

## Future Enhancements

- **Push notifications**: Real-time notifications for urgent messages
- **Message templates**: Predefined templates for common message types
- **Scheduled messages**: Send messages at specific times
- **Message categories**: Additional categorization for better organization
- **Rich content**: Support for images, links, and formatted text
- **Message reactions**: Allow staff to react to messages (like, thumbs up, etc.)
- **Message threading**: Support for message replies and conversations 