# Smart Recipe Suggestions & Inventory Management

## Overview

The Smart Recipe Suggestions system provides intelligent recipe recommendations based on inventory management, helping restaurants reduce waste and optimize their ingredient usage. The system tracks item expiration dates, sales velocity, and performance to suggest recipes that use ingredients that are either expiring soon or underperforming.

## Key Features

### 1. Enhanced Inventory Tracking
- **Expiration Date Tracking**: Monitor perishable items with expiration dates
- **Sales Velocity Analysis**: Track average daily sales rate for each item
- **Performance Monitoring**: Identify underperforming items (low sales velocity or stale inventory)
- **Automatic Flag Updates**: Real-time updates of item status flags

### 2. Smart Recipe Suggestions
- **AI-Powered Recommendations**: Suggest recipes based on available ingredients
- **Urgency-Based Prioritization**: High, medium, and low urgency suggestions
- **Confidence Scoring**: Rate suggestions based on ingredient match quality
- **Potential Savings Calculation**: Estimate cost savings from using expiring/underperforming items

### 3. Inventory Health Monitoring
- **Dashboard Summary**: Overview of inventory health metrics
- **Expiring Items Alert**: Items expiring within specified timeframe
- **Underperforming Items Report**: Items with low sales velocity or stale inventory
- **Health Score**: Overall inventory health percentage

## Database Schema Changes

### New Fields Added to Items Table

```sql
-- Expiration tracking
expirationDate DATE NULL COMMENT 'Expiration date for perishable items'
manufacturingDate DATE NULL COMMENT 'Manufacturing date for tracking shelf life'
shelfLifeDays INT NULL COMMENT 'Shelf life in days from manufacturing date'

-- Sales tracking
lastSoldDate DATE NULL COMMENT 'Date when item was last sold'
salesVelocity DECIMAL(10,2) NULL DEFAULT 0.00 COMMENT 'Average daily sales rate (units per day)'
daysSinceLastSale INT NULL DEFAULT 0 COMMENT 'Number of days since last sale'

-- Status flags
isPerishable BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether item has expiration date'
isUnderperforming BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether item is considered underperforming'
isExpiringSoon BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether item is expiring within 7 days'
```

### New Indexes for Performance

```sql
-- Inventory management indexes
CREATE INDEX items_businessId_isPerishable_idx ON items(businessId, isPerishable);
CREATE INDEX items_businessId_isUnderperforming_idx ON items(businessId, isUnderperforming);
CREATE INDEX items_businessId_isExpiringSoon_idx ON items(businessId, isExpiringSoon);
CREATE INDEX items_expirationDate_idx ON items(expirationDate);
CREATE INDEX items_lastSoldDate_idx ON items(lastSoldDate);
CREATE INDEX items_salesVelocity_idx ON items(salesVelocity);
```

## API Endpoints

### Smart Recipe Suggestions

#### GET `/api/smart-recipe-suggestions/smart-suggestions`
Get intelligent recipe suggestions based on inventory management.

**Query Parameters:**
- `includeExpiringItems` (boolean): Include items expiring soon (default: true)
- `includeUnderperformingItems` (boolean): Include underperforming items (default: true)
- `maxDaysToExpiry` (integer): Maximum days to expiry (default: 7)
- `minSalesVelocity` (number): Minimum sales velocity threshold (default: 0.1)
- `maxDaysSinceLastSale` (integer): Maximum days since last sale (default: 30)
- `limit` (integer): Maximum suggestions to return (default: 10)

**Response:**
```json
{
  "success": true,
  "suggestions": [
    {
      "recipeId": 1,
      "recipeName": "Pasta Primavera",
      "recipeDescription": "Fresh vegetable pasta dish",
      "recipeDifficulty": "easy",
      "prepTime": 15,
      "cookTime": 20,
      "imageUrl": "https://example.com/pasta.jpg",
      "suggestedItems": [
        {
          "itemId": 5,
          "itemName": "Fresh Tomatoes",
          "currentStock": 10,
          "expirationDate": "2025-01-15T00:00:00.000Z",
          "daysToExpiry": 2,
          "salesVelocity": 0.05,
          "daysSinceLastSale": 5,
          "reason": "Expires in 2 days"
        }
      ],
      "confidence": 0.85,
      "totalPotentialSavings": 25.50,
      "urgency": "high"
    }
  ],
  "criteria": {
    "businessId": 1,
    "includeExpiringItems": true,
    "includeUnderperformingItems": true,
    "maxDaysToExpiry": 7,
    "minSalesVelocity": 0.1,
    "maxDaysSinceLastSale": 30,
    "limit": 10
  },
  "totalSuggestions": 5
}
```

#### GET `/api/smart-recipe-suggestions/inventory-summary`
Get inventory health summary for dashboard.

**Response:**
```json
{
  "success": true,
  "summary": {
    "expiringItems": 5,
    "underperformingItems": 12,
    "lowStockItems": 3,
    "totalItems": 150,
    "expiringPercentage": 3.33,
    "underperformingPercentage": 8.0
  }
}
```

#### POST `/api/smart-recipe-suggestions/update-tracking`
Update item tracking data (sales velocity, days since last sale, flags).

**Response:**
```json
{
  "success": true,
  "message": "Inventory tracking data updated successfully"
}
```

#### GET `/api/smart-recipe-suggestions/expiring-items`
Get items that are expiring soon.

**Query Parameters:**
- `days` (integer): Number of days to look ahead (default: 7)

**Response:**
```json
{
  "success": true,
  "items": [
    {
      "id": 5,
      "name": "Fresh Tomatoes",
      "stock": 10,
      "expirationDate": "2025-01-15T00:00:00.000Z",
      "daysToExpiry": 2,
      "cost": 2.50,
      "potentialLoss": 25.00
    }
  ]
}
```

#### GET `/api/smart-recipe-suggestions/underperforming-items`
Get underperforming items.

**Response:**
```json
{
  "success": true,
  "items": [
    {
      "id": 8,
      "name": "Specialty Cheese",
      "stock": 15,
      "salesVelocity": 0.05,
      "daysSinceLastSale": 45,
      "lastSoldDate": "2024-12-01T00:00:00.000Z",
      "cost": 8.00,
      "potentialLoss": 120.00
    }
  ]
}
```

## Services

### SmartRecipeSuggestionService

Main service for generating intelligent recipe suggestions.

**Key Methods:**
- `getSmartSuggestions(criteria)`: Generate recipe suggestions based on inventory
- `getInventorySummary(businessId)`: Get inventory health summary
- `updateItemTracking(businessId)`: Update tracking data for all items

### ItemTrackingService

Service for managing item tracking data and automatic updates.

**Key Methods:**
- `updateItemTrackingOnSale(saleId)`: Update tracking when sale occurs
- `setItemPerishable(itemId, expirationDate)`: Mark item as perishable
- `getItemsNeedingAttention(businessId)`: Get items requiring attention
- `getInventoryHealthScore(businessId)`: Calculate overall inventory health

## Usage Examples

### Setting Up Perishable Items

```typescript
// Mark an item as perishable with expiration date
await ItemTrackingService.setItemPerishable(
  itemId,
  new Date('2025-01-20'),
  new Date('2025-01-10'),
  10 // shelf life in days
);
```

### Getting Smart Suggestions

```typescript
// Get suggestions for expiring items only
const suggestions = await SmartRecipeSuggestionService.getSmartSuggestions({
  businessId: 1,
  includeExpiringItems: true,
  includeUnderperformingItems: false,
  maxDaysToExpiry: 3,
  limit: 5
});
```

### Monitoring Inventory Health

```typescript
// Get overall inventory health score
const health = await ItemTrackingService.getInventoryHealthScore(businessId);
console.log(`Inventory Health: ${health.score}%`);
console.log(`Issues: ${health.issues.expiringItems} expiring, ${health.issues.underperformingItems} underperforming`);
```

## Automatic Updates

### Sales-Based Tracking

The system automatically updates item tracking data when sales occur:

1. **Last Sold Date**: Updated to current sale date
2. **Sales Velocity**: Recalculated based on last 30 days of sales
3. **Days Since Last Sale**: Updated automatically
4. **Status Flags**: Updated based on new data

### Scheduled Updates

For optimal performance, run tracking updates periodically:

```bash
# Update tracking data
curl -X POST http://localhost:3000/api/smart-recipe-suggestions/update-tracking \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Configuration

### Thresholds

The system uses configurable thresholds for identifying issues:

- **Expiring Soon**: Items expiring within 7 days (configurable)
- **Underperforming**: Sales velocity < 0.1 OR days since last sale > 30
- **Low Stock**: Stock below minimum stock level

### Confidence Scoring

Recipe suggestions are scored based on:

- **Ingredient Match Quality**: How well ingredients match recipe requirements
- **Urgency Level**: Higher score for items expiring sooner
- **Stock Availability**: Higher score for items with sufficient stock
- **Historical Performance**: Consider past recipe success rates

## Mobile App Integration

### For Mobile Developers

The smart recipe suggestions can be integrated into mobile apps to:

1. **Show Recipe Recommendations**: Display suggested recipes based on inventory
2. **Highlight Urgent Items**: Show items that need immediate attention
3. **Track Potential Savings**: Display cost savings from using suggested recipes
4. **Inventory Alerts**: Notify staff about expiring or underperforming items

### API Usage in Mobile Apps

```javascript
// Get smart suggestions for mobile app
const response = await fetch('/api/smart-recipe-suggestions/smart-suggestions?limit=10', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const suggestions = await response.json();

// Display suggestions in mobile UI
suggestions.data.suggestions.forEach(suggestion => {
  console.log(`Recipe: ${suggestion.recipeName}`);
  console.log(`Urgency: ${suggestion.urgency}`);
  console.log(`Potential Savings: $${suggestion.totalPotentialSavings}`);
});
```

## Testing

### Automated Tests

Run the comprehensive test suite:

```bash
node test/automated/test-smart-recipe-suggestions.js
```

### Manual Testing

Test the endpoints manually:

```bash
# Get inventory summary
curl -X GET "http://localhost:3000/api/smart-recipe-suggestions/inventory-summary" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get smart suggestions
curl -X GET "http://localhost:3000/api/smart-recipe-suggestions/smart-suggestions?limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Migration

### Running the Migration

The new inventory tracking fields are added via migration:

```bash
# Run the migration (user handles this)
npm run db:migrate
```

### Data Population

After migration, populate the new fields:

```sql
-- Set manufacturing date for existing items (example)
UPDATE items 
SET manufacturingDate = DATEADD(day, -30, GETDATE())
WHERE manufacturingDate IS NULL;

-- Calculate initial sales velocity
-- (This will be done automatically by the tracking service)
```

## Performance Considerations

### Indexes

The system includes optimized indexes for:
- Business-scoped queries
- Expiration date filtering
- Sales velocity analysis
- Status flag filtering

### Caching

Consider implementing caching for:
- Inventory summary data
- Recipe suggestions (with short TTL)
- Health scores

### Batch Processing

For large inventories, consider:
- Batch updates for tracking data
- Scheduled background processing
- Incremental updates

## Troubleshooting

### Common Issues

1. **Migration Failures**: Ensure proper migration order and foreign key constraints
2. **Performance Issues**: Check indexes and query optimization
3. **Data Inconsistencies**: Run tracking updates to sync data
4. **Missing Suggestions**: Verify recipe ingredients match item names

### Debug Endpoints

Use the test endpoints to debug issues:

```bash
# Test expiring items
curl -X GET "http://localhost:3000/api/smart-recipe-suggestions/expiring-items?days=7"

# Test underperforming items
curl -X GET "http://localhost:3000/api/smart-recipe-suggestions/underperforming-items"
```

## Future Enhancements

### Planned Features

1. **Machine Learning Integration**: Improve suggestion accuracy with ML models
2. **Seasonal Adjustments**: Consider seasonal ingredient availability
3. **Supplier Integration**: Track supplier delivery schedules
4. **Cost Optimization**: Suggest recipes based on ingredient costs
5. **Waste Analytics**: Track and analyze food waste patterns

### API Extensions

Future API endpoints may include:
- Recipe popularity tracking
- Ingredient substitution suggestions
- Waste reduction analytics
- Supplier performance metrics 