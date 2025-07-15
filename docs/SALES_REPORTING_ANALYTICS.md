# 📊 Sales Reporting & Analytics API

## Overview

The POS Engine now includes comprehensive sales reporting and analytics endpoints designed for managers and owners to track business performance, identify trends, and make data-driven decisions.

## 🔐 Authentication & Authorization

All analytics endpoints require:
- **Authentication**: Valid JWT token
- **Authorization**: Business-scoped access (users can only access their business data)
- **Roles**: Recommended for `MANAGER`, `OWNER`, and `ADMIN` roles

## 📈 Analytics Endpoints

### 1. Item Performance Analytics

**Endpoint:** `GET /api/sales/analytics/items`

**Purpose:** Track which items are selling well and which are underperforming

**Query Parameters:**
- `startDate` (optional): Start date for analysis (YYYY-MM-DD)
- `endDate` (optional): End date for analysis (YYYY-MM-DD)  
- `limit` (optional): Number of top items to return (default: 10)

**Response:**
```json
{
  "topSellers": [
    {
      "itemId": 1,
      "itemName": "Margherita Pizza",
      "totalQuantity": 45,
      "totalRevenue": 855.55,
      "averagePrice": 19.01,
      "profitMargin": 52.3
    }
  ],
  "worstSellers": [
    {
      "itemId": 15,
      "itemName": "Chocolate Croissant",
      "totalQuantity": 2,
      "totalRevenue": 8.98,
      "lastSoldDate": "2024-01-10T15:30:00Z",
      "daysSinceLastSale": 5
    }
  ],
  "summary": {
    "totalItemsSold": 25,
    "totalRevenue": 2500.75,
    "averageOrderValue": 45.47,
    "mostProfitableItem": "Espresso",
    "leastProfitableItem": "Chocolate Croissant"
  }
}
```

**Use Cases:**
- Identify best-selling products for inventory planning
- Find underperforming items for menu optimization
- Calculate profit margins for pricing decisions
- Track item popularity trends

---

### 2. Revenue Analytics & Trends

**Endpoint:** `GET /api/sales/analytics/revenue`

**Purpose:** Analyze revenue patterns and business growth

**Query Parameters:**
- `period` (optional): Time period grouping (`daily`, `weekly`, `monthly`, `yearly`) - default: `monthly`
- `startDate` (optional): Start date for analysis (YYYY-MM-DD)
- `endDate` (optional): End date for analysis (YYYY-MM-DD)

**Response:**
```json
{
  "periodData": [
    {
      "period": "2024-01",
      "revenue": 12500.75,
      "transactions": 275,
      "averageOrderValue": 45.47,
      "growthRate": 12.5
    }
  ],
  "summary": {
    "totalRevenue": 12500.75,
    "totalTransactions": 275,
    "averageOrderValue": 45.47,
    "revenueGrowth": 12.5,
    "bestDay": "Saturday",
    "bestHour": 19
  }
}
```

**Use Cases:**
- Track revenue growth over time
- Identify peak business hours and days
- Monitor average order values
- Plan staffing based on busy periods

---

### 3. Staff Performance Analytics

**Endpoint:** `GET /api/sales/analytics/staff`

**Purpose:** Evaluate staff performance and productivity

**Query Parameters:**
- `startDate` (optional): Start date for analysis (YYYY-MM-DD)
- `endDate` (optional): End date for analysis (YYYY-MM-DD)

**Response:**
```json
{
  "staffPerformance": [
    {
      "userId": 3,
      "userName": "Giuseppe Verdi",
      "totalSales": 4500.25,
      "totalTransactions": 98,
      "averageOrderValue": 45.92,
      "performanceRank": 1
    }
  ],
  "summary": {
    "topPerformer": "Giuseppe Verdi",
    "totalStaff": 5,
    "averageSalesPerStaff": 2500.15
  }
}
```

**Use Cases:**
- Identify top-performing staff members
- Track individual sales performance
- Plan training and incentives
- Optimize staff scheduling

---

### 4. Customer Analytics

**Endpoint:** `GET /api/sales/analytics/customers`

**Purpose:** Understand customer behavior and loyalty

**Query Parameters:**
- `startDate` (optional): Start date for analysis (YYYY-MM-DD)
- `endDate` (optional): End date for analysis (YYYY-MM-DD)
- `limit` (optional): Number of top customers to return (default: 10)

**Response:**
```json
{
  "topCustomers": [
    {
      "customerId": 1,
      "customerName": "John Smith",
      "totalSpent": 1250.75,
      "totalOrders": 28,
      "averageOrderValue": 44.67,
      "lastVisit": "2024-01-15T18:30:00Z",
      "favoriteItems": ["Margherita Pizza", "Espresso"]
    }
  ],
  "summary": {
    "totalCustomers": 150,
    "repeatCustomers": 85,
    "averageCustomerValue": 45.25,
    "customerRetentionRate": 56.7
  }
}
```

**Use Cases:**
- Identify VIP customers for loyalty programs
- Track customer retention rates
- Analyze customer spending patterns
- Plan targeted marketing campaigns

---

### 5. Inventory Performance Analytics

**Endpoint:** `GET /api/sales/analytics/inventory`

**Purpose:** Monitor inventory levels and optimize stock management

**Response:**
```json
{
  "lowStockItems": [
    {
      "itemId": 5,
      "itemName": "Fresh Salmon",
      "currentStock": 3,
      "minStock": 10,
      "daysUntilStockout": 2
    }
  ],
  "overstockedItems": [
    {
      "itemId": 12,
      "itemName": "Coffee Beans",
      "currentStock": 150,
      "maxStock": 100,
      "daysOfInventory": 45
    }
  ],
  "summary": {
    "totalItems": 50,
    "lowStockCount": 8,
    "overstockedCount": 3,
    "inventoryValue": 12500.75,
    "turnoverRate": 12.5
  }
}
```

**Use Cases:**
- Prevent stockouts with proactive alerts
- Reduce waste by identifying overstocked items
- Calculate inventory value and turnover rates
- Optimize reorder points and quantities

---

## 🎯 Business Intelligence Features

### Key Metrics Tracked

1. **Sales Performance**
   - Total revenue and transaction counts
   - Average order values
   - Revenue growth rates
   - Peak business hours and days

2. **Product Performance**
   - Best and worst selling items
   - Profit margins by item
   - Item popularity trends
   - Days since last sale for slow movers

3. **Staff Performance**
   - Individual sales totals
   - Transaction counts per staff member
   - Performance rankings
   - Average sales per staff member

4. **Customer Insights**
   - Customer spending patterns
   - Repeat customer rates
   - Customer lifetime value
   - Favorite items by customer

5. **Inventory Management**
   - Low stock alerts
   - Overstocked items
   - Inventory value calculations
   - Turnover rates

### Data Filtering Capabilities

All analytics endpoints support:
- **Date Range Filtering**: Analyze specific time periods
- **Business Scoping**: Automatic data isolation by business
- **Configurable Limits**: Control result set sizes
- **Real-time Data**: Based on current sales and inventory data

## 📊 Dashboard Integration

These endpoints are designed to power comprehensive business dashboards:

### Manager Dashboard
- Revenue trends and growth metrics
- Staff performance rankings
- Inventory alerts and stock levels
- Customer retention insights

### Owner Dashboard  
- Overall business performance
- Profit margin analysis
- Strategic planning metrics
- Multi-location comparisons (future)

## 🔧 Technical Implementation

### Database Queries
- Optimized SQL queries using Sequelize
- Business-scoped data isolation
- Efficient aggregation and grouping
- Real-time calculations

### Performance Considerations
- Indexed queries for fast response times
- Pagination support for large datasets
- Caching opportunities for static metrics
- Efficient date range filtering

### Error Handling
- Comprehensive error logging
- Graceful fallbacks for missing data
- Input validation and sanitization
- Business-scoped error responses

## 🚀 Usage Examples

### Basic Item Analytics
```bash
curl -X GET "http://localhost:3031/api/sales/analytics/items?limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Revenue Analysis for Last Month
```bash
curl -X GET "http://localhost:3031/api/sales/analytics/revenue?period=monthly&startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Staff Performance This Week
```bash
curl -X GET "http://localhost:3031/api/sales/analytics/staff?startDate=2024-01-15&endDate=2024-01-21" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📈 Future Enhancements

### Planned Features
1. **Export Capabilities**: PDF/Excel report generation
2. **Scheduled Reports**: Automated email delivery
3. **Custom Dashboards**: User-configurable metrics
4. **Predictive Analytics**: Sales forecasting
5. **Multi-location Support**: Franchise analytics
6. **Real-time Notifications**: Stock alerts and performance milestones

### Advanced Analytics
1. **Seasonal Analysis**: Holiday and seasonal trends
2. **Customer Segmentation**: RFM analysis
3. **Menu Optimization**: Item combination analysis
4. **Staff Scheduling**: AI-powered scheduling recommendations
5. **Inventory Forecasting**: Predictive stock management

---

## 🎯 Summary

The sales reporting and analytics API provides comprehensive business intelligence capabilities that enable:

- **Data-Driven Decisions**: Make informed choices based on real metrics
- **Performance Tracking**: Monitor staff, product, and customer performance
- **Inventory Optimization**: Prevent stockouts and reduce waste
- **Revenue Growth**: Identify opportunities for business expansion
- **Customer Retention**: Build loyalty programs and targeted marketing

These endpoints form the foundation for a complete business intelligence system that scales with your restaurant or retail business needs. 