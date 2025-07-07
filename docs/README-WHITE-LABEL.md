# White-Label Multi-Tenant POS System

## Overview

This POS system has been transformed into a powerful white-label multi-tenant platform that supports multiple businesses, each with their own branding, settings, and data isolation. Perfect for SaaS providers, franchise operations, or any business that needs to serve multiple clients with a single codebase.

## 🚀 Key Features

### Multi-Tenant Architecture
- **Complete Data Isolation**: Each business has its own users, items, sales, and settings
- **Business-Specific Branding**: Custom logos, colors, and styling per business
- **Role-Based Access Control**: Owner, Manager, Cashier, and Viewer roles
- **Business Statistics**: Per-business analytics and reporting

### White-Label Capabilities
- **Custom Branding**: Primary/secondary colors, logos, business names
- **Business Configuration**: Tax rates, currency, timezone settings
- **Slug-Based Access**: Each business gets a unique URL slug
- **Independent Settings**: Each business can have different configurations

### Enhanced Security
- **JWT with Business Context**: Tokens include business ID and user role
- **Business Access Control**: Users can only access their assigned business
- **Role-Based Permissions**: Different access levels for different user types
- **Soft Deletes**: Data is preserved but marked as inactive

## 🏗️ Architecture

### Database Schema
```
businesses (new)
├── id, name, slug, description
├── logo, primaryColor, secondaryColor
├── address, phone, email, website
├── taxRate, currency, timezone
└── isActive, createdAt, updatedAt

users (updated)
├── businessId (FK to businesses)
├── name, email, password
├── role (owner|manager|cashier|viewer)
└── isActive

items (updated)
├── businessId (FK to businesses)
├── name, description, price, stock
├── category, sku, barcode
└── isActive

sales (updated)
├── businessId (FK to businesses)
├── userId, customer info
├── subtotal, tax, discount, total
└── paymentMethod, status

order_items (updated)
├── businessId (FK to businesses)
├── saleId, itemId
├── quantity, unitPrice, totalPrice
└── timestamps
```

### API Structure
```
/api/auth
├── POST /register (with businessId/businessSlug)
├── POST /login (with businessId/businessSlug)
└── GET /profile

/api/businesses
├── GET / (list all businesses)
├── GET /:id (get business by ID)
├── GET /slug/:slug (get business by slug)
├── POST / (create business)
├── PUT /:id (update business)
├── DELETE /:id (soft delete)
├── GET /:id/stats (business statistics)
├── GET /search?q=query (search businesses)
├── GET /timezone/:timezone (filter by timezone)
└── GET /currency/:currency (filter by currency)

/api/users (business-scoped)
├── GET / (users in current business)
├── GET /:id (user in current business)
├── POST / (create user in current business)
├── PUT /:id (update user in current business)
├── DELETE /:id (soft delete user)
├── GET /role/:role (users by role)
└── GET /search?q=query (search users)

/api/items (business-scoped)
├── GET / (items in current business)
├── GET /:id (item in current business)
├── POST / (create item in current business)
├── PUT /:id (update item in current business)
├── DELETE /:id (soft delete item)
├── GET /category/:category (items by category)
├── GET /search?q=query (search items)
└── PUT /:id/stock (update stock)

/api/sales (business-scoped)
├── GET / (sales in current business)
├── GET /:id (sale in current business)
├── POST / (create sale in current business)
├── PUT /:id (update sale in current business)
├── DELETE /:id (soft delete sale)
├── GET /stats (sales statistics)
└── GET /top-items (top selling items)
```

## 🔧 Setup & Configuration

### 1. Database Migration
Run the migration to create the businesses table and update existing tables:

```bash
npm run migrate
```

### 2. Create Your First Business
```bash
curl -X POST http://localhost:3031/api/businesses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "My Store",
    "slug": "my-store",
    "description": "A great retail store",
    "primaryColor": "#007bff",
    "secondaryColor": "#6c757d",
    "taxRate": 8.5,
    "currency": "USD",
    "timezone": "America/New_York"
  }'
```

### 3. Register Users for the Business
```bash
curl -X POST http://localhost:3031/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Store Manager",
    "email": "manager@mystore.com",
    "password": "securepassword",
    "businessId": 1
  }'
```

### 4. Login with Business Context
```bash
curl -X POST http://localhost:3031/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@mystore.com",
    "password": "securepassword",
    "businessId": 1
  }'
```

## 🎨 White-Label Configuration

### Business Branding
Each business can customize:
- **Business Name**: Display name for the business
- **Slug**: URL-friendly identifier (e.g., "my-store")
- **Logo**: URL to business logo image
- **Primary Color**: Main brand color (hex format)
- **Secondary Color**: Accent brand color (hex format)
- **Description**: Business description

### Business Settings
- **Tax Rate**: Percentage for sales tax calculation
- **Currency**: 3-letter currency code (USD, EUR, etc.)
- **Timezone**: Business timezone for date/time display
- **Contact Info**: Address, phone, email, website

### User Roles
- **Owner**: Full access to all features and business settings
- **Manager**: Can manage users, items, and view all reports
- **Cashier**: Can process sales and view basic reports
- **Viewer**: Read-only access to reports and data

## 🔒 Security Features

### Authentication Flow
1. User provides email, password, and business context
2. System validates credentials within the specified business
3. JWT token includes business ID and user role
4. All subsequent requests are scoped to the user's business

### Access Control
- **Business Isolation**: Users can only access data from their assigned business
- **Role-Based Permissions**: Different API endpoints require specific roles
- **Token Validation**: All requests validate business context in JWT

### Data Protection
- **Soft Deletes**: Records are marked inactive rather than deleted
- **Audit Trail**: All changes are timestamped
- **Input Validation**: Comprehensive validation for all inputs

## 📊 Business Analytics

### Business Statistics
Each business gets access to:
- **User Count**: Total and active users
- **Item Count**: Total and active inventory items
- **Sales Metrics**: Total sales, completed sales, revenue
- **Business Settings**: Currency, tax rate, timezone

### Sales Analytics
- **Revenue Tracking**: Total revenue with business currency
- **Top Items**: Best-selling products
- **Sales Trends**: Time-based sales analysis
- **Customer Data**: Customer information and purchase history

## 🚀 Deployment

### Environment Variables
```env
# Database
DB_HOST=localhost
DB_PORT=1433
DB_NAME=pos_engine_dev
DB_USERNAME=sa
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_key

# App
NODE_ENV=production
PORT=3031
```

### Production Considerations
- **Database Indexing**: Proper indexes for business-scoped queries
- **Connection Pooling**: Optimized for multi-tenant workloads
- **Caching**: Consider Redis for business-specific caching
- **Monitoring**: Track per-business usage and performance

## 🔄 Migration from Single-Tenant

The system automatically handles migration from the previous single-tenant version:

1. **Default Business**: A "Default Business" is created with ID 1
2. **Data Migration**: All existing data is assigned to the default business
3. **Backward Compatibility**: Existing tokens continue to work
4. **Gradual Migration**: Businesses can be created and migrated incrementally

## 📱 Flutter Integration

The white-label system works perfectly with Flutter:

### Business Context in Flutter
```dart
class BusinessContext {
  final int businessId;
  final String businessName;
  final String slug;
  final String primaryColor;
  final String secondaryColor;
  final String logo;
  final String currency;
  final double taxRate;
  final String timezone;
}

class UserContext {
  final int userId;
  final int businessId;
  final String email;
  final String role;
}
```

### API Calls with Business Context
```dart
// Login with business context
final response = await http.post(
  Uri.parse('$apiUrl/auth/login'),
  headers: {'Content-Type': 'application/json'},
  body: jsonEncode({
    'email': email,
    'password': password,
    'businessId': businessId, // or 'businessSlug': 'my-store'
  }),
);

// All subsequent calls include business context in JWT
final token = jsonDecode(response.body)['token'];
```

### White-Label UI
```dart
// Apply business branding
ThemeData(
  primaryColor: Color(int.parse(businessContext.primaryColor.replaceAll('#', '0xFF'))),
  colorScheme: ColorScheme.fromSeed(
    seedColor: Color(int.parse(businessContext.primaryColor.replaceAll('#', '0xFF'))),
  ),
)

// Business logo
Image.network(businessContext.logo)
```

## 🎯 Use Cases

### SaaS Provider
- Host multiple businesses on a single platform
- Each business gets their own branded experience
- Centralized management and billing
- Scalable infrastructure

### Franchise Operations
- Consistent POS system across all locations
- Location-specific branding and settings
- Centralized reporting and analytics
- Role-based access for franchisees

### Multi-Location Business
- Single system for multiple store locations
- Location-specific inventory and sales tracking
- Centralized management with local control
- Unified reporting across all locations

## 🔮 Future Enhancements

### Planned Features
- **Business Templates**: Pre-configured business setups
- **Advanced Analytics**: Business comparison and benchmarking
- **API Rate Limiting**: Per-business API usage limits
- **Business Groups**: Hierarchical business organization
- **Custom Fields**: Business-specific data fields
- **Integration APIs**: Third-party system integrations

### Scalability Improvements
- **Database Sharding**: Horizontal scaling for large deployments
- **Microservices**: Service-based architecture
- **Event Sourcing**: Audit trail and business event tracking
- **Real-time Updates**: WebSocket support for live data

## 📞 Support

For questions or support with the white-label system:
- Check the API documentation
- Review the migration guide
- Test with the provided examples
- Monitor business-specific logs

---

**Transform your POS system into a powerful white-label platform that can serve multiple businesses with complete data isolation and custom branding!** 