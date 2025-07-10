# Feature Availability by Business Type

This document outlines which features are available for different business types in the POS Engine.

## Business Types

### 1. Generic Business (`type: 'generic'`)
Default business type for general retail, services, and other non-restaurant businesses.

### 2. Restaurant Business (`type: 'restaurant'`)
Specialized business type for restaurants, cafes, bars, and food service establishments.

## Feature Matrix

| Feature | Generic | Restaurant | Notes |
|---------|---------|------------|-------|
| **Core POS Features** |
| Basic POS Operations | ✅ | ✅ | Sales, payments, receipts |
| Inventory Management | ✅ | ✅ | Stock tracking, items, categories |
| User Management | ✅ | ✅ | Staff accounts, roles, permissions |
| Sales Tracking | ✅ | ✅ | Sales history, reports, analytics |
| Customer Management | ✅ | ✅ | Customer profiles, history |
| **Split Billing** |
| Equal Split | ✅ | ✅ | Split bill equally among customers |
| Item-based Split | ✅ | ✅ | Split based on items ordered |
| Custom Split | ✅ | ✅ | Manual split amounts |
| Percentage Split | ✅ | ✅ | Split by percentage |
| **Restaurant-Specific Features** |
| Table Management | ❌ | ✅ | Table status, capacity, location |
| Order Management | ❌ | ✅ | Restaurant orders, status tracking |
| Kitchen Display System | ❌ | ✅ | Real-time order display for kitchen |
| Menu Management | ❌ | ✅ | Menu categories, items, pricing |
| Reservation System | ❌ | ✅ | Table reservations, scheduling |
| Customer Management | Enhanced | ✅ | Enhanced with table preferences |

## API Endpoints by Business Type

### Available for All Business Types

#### Authentication & Users
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/users` - Get users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

#### Items & Inventory
- `GET /api/items` - Get items
- `POST /api/items` - Create item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

#### Sales
- `GET /api/sales` - Get sales
- `POST /api/sales` - Create sale
- `PUT /api/sales/:id` - Update sale
- `DELETE /api/sales/:id` - Delete sale

#### Businesses
- `GET /api/businesses` - Get businesses
- `POST /api/businesses` - Create business
- `PUT /api/businesses/:id` - Update business
- `DELETE /api/businesses/:id` - Delete business

### Restaurant-Only Endpoints

#### Table Management
- `GET /api/tables` - Get tables (restaurant only)
- `POST /api/tables` - Create table (restaurant only)
- `PUT /api/tables/:id` - Update table (restaurant only)

#### Order Management
- `GET /api/orders` - Get orders (restaurant only)
- `POST /api/orders` - Create order (restaurant only)
- `PUT /api/orders/:id/status` - Update order status (restaurant only)

## Business Type Checking

### Middleware
The application uses middleware to check business types:

```typescript
import { requireRestaurant, addBusinessType } from '../middleware/restaurantCheck';

// Apply to restaurant-only routes
router.use(addBusinessType);
router.get('/', requireRestaurant, async (req, res) => {
  // Route handler
});
```

### Utility Functions
```typescript
import { isRestaurantBusiness, requireRestaurantBusiness } from '../utils/businessTypeCheck';

// Check if business is restaurant type
const isRestaurant = await isRestaurantBusiness(businessId);

// Ensure business is restaurant type (throws error if not)
await requireRestaurantBusiness(businessId);
```

## Error Responses

When a non-restaurant business tries to access restaurant-only features:

```json
{
  "error": "Feature not available",
  "message": "This feature is only available for restaurant businesses",
  "requiredType": "restaurant"
}
```

## Configuration

### Setting Business Type
Business type is set when creating a business:

```json
{
  "name": "My Restaurant",
  "slug": "my-restaurant",
  "type": "restaurant"
}
```

### Default Type
New businesses default to `type: 'generic'` unless specified otherwise.

## Future Business Types

The system is designed to be extensible for future business types:

- `salon` - Hair salons, spas, beauty services
- `retail` - Retail stores, shops
- `service` - Service-based businesses
- `events` - Event venues, ticketing

Each new business type can have its own feature set and API endpoints.

## Migration Notes

- Existing businesses are automatically set to `type: 'generic'`
- Restaurant features are only available after setting `type: 'restaurant'`
- Split billing remains available for all business types
- No data loss occurs when changing business types 