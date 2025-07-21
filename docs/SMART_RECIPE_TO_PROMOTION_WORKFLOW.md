# Smart Recipe to Promotion Workflow

## Overview
AI-powered workflow that converts recipe suggestions into automatic promotions to reduce waste and optimize inventory.

## Business Value
- **Waste Reduction**: 20-30% reduction in food waste
- **Automated Promotions**: Zero manual work for special creation
- **Inventory Optimization**: Real-time consumption tracking
- **Competitive Advantage**: First-to-market intelligent workflow

## Architecture Principles
- **Repository Pattern**: Maintain existing architecture
- **Service Layer**: Business logic separation
- **Transaction Safety**: ACID compliance for inventory operations
- **Performance**: Optimized queries, proper indexing
- **Scalability**: Handle multiple concurrent cooks
- **Maintainability**: Clear separation of concerns

## Phase 1: Recipe Cooking Workflow

### Database Schema Changes
```sql
-- Add to promotions table
ALTER TABLE promotions ADD sourceRecipeId INT;
ALTER TABLE promotions ADD cookingDate DATETIME;
ALTER TABLE promotions ADD promotionType VARCHAR(50);

-- New table for cooking history
CREATE TABLE recipe_cooking_history (
  id INT PRIMARY KEY IDENTITY(1,1),
  recipeId INT NOT NULL,
  businessId INT NOT NULL,
  cookedAt DATETIME NOT NULL DEFAULT GETDATE(),
  quantity INT NOT NULL DEFAULT 1,
  consumedItems NVARCHAR(MAX), -- JSON array
  createdPromotionId INT,
  wasteReduction DECIMAL(10,2) DEFAULT 0,
  costSavings DECIMAL(10,2) DEFAULT 0,
  createdAt DATETIME NOT NULL DEFAULT GETDATE(),
  updatedAt DATETIME NOT NULL DEFAULT GETDATE()
);

-- Indexes for performance
CREATE INDEX idx_recipe_cooking_business ON recipe_cooking_history(businessId);
CREATE INDEX idx_recipe_cooking_recipe ON recipe_cooking_history(recipeId);
CREATE INDEX idx_recipe_cooking_date ON recipe_cooking_history(cookedAt);
```

### New Models

#### RecipeCookingHistoryModel
```typescript
// src/models/RecipeCookingHistoryModel.ts
export interface RecipeCookingHistoryAttributes {
  id?: number;
  recipeId: number;
  businessId: number;
  cookedAt: Date;
  quantity: number;
  consumedItems: string; // JSON string
  createdPromotionId?: number;
  wasteReduction: number;
  costSavings: number;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### New Services

#### RecipeCookingService
```typescript
// src/services/recipeCookingService.ts
export class RecipeCookingService {
  static async cookRecipe(
    recipeId: number, 
    quantity: number, 
    businessId: number
  ): Promise<CookingResult> {
    // 1. Validate recipe and get suggested items
    // 2. Check stock availability
    // 3. Consume items in transaction
    // 4. Create cooking history record
    // 5. Generate promotion
    // 6. Return results
  }

  private static async validateStockAvailability(
    items: SuggestedItem[], 
    quantity: number
  ): Promise<boolean> {
    // Check if all items have sufficient stock
  }

  private static async consumeItems(
    items: SuggestedItem[], 
    quantity: number, 
    businessId: number,
    transaction: Transaction
  ): Promise<ConsumedItem[]> {
    // Update item stock levels atomically
  }
}
```

### New Endpoints

#### Cook Recipe
```
POST /api/smart/cook-recipe
Content-Type: application/json
Authorization: Bearer <token>

Request:
{
  "recipeId": 4,
  "quantity": 1
}

Response:
{
  "success": true,
  "cookingResult": {
    "recipeId": 4,
    "recipeName": "Truffle Pizza",
    "quantity": 1,
    "consumedItems": [
      {
        "itemId": 33,
        "itemName": "Fresh Mozzarella",
        "quantityConsumed": 1,
        "remainingStock": 11
      }
    ],
    "costSavings": 228.6,
    "wasteReduction": 75.0
  },
  "createdPromotion": {
    "id": 15,
    "name": "Chef's Special: Truffle Pizza",
    "discountType": "percentage",
    "discountValue": 15,
    "expiresAt": "2025-07-22T23:59:59Z"
  }
}
```

## Phase 2: Smart Promotion Generation

### Promotion Types
- **chef_special**: Based on expiring ingredients
- **inventory_clearance**: Based on underperforming items
- **fresh_today**: Based on newly cooked recipes

### Smart Promotion Service
```typescript
// src/services/smartPromotionService.ts
export class SmartPromotionService {
  static async generatePromotionFromRecipe(
    recipe: Recipe,
    consumedItems: ConsumedItem[],
    businessId: number
  ): Promise<Promotion> {
    // 1. Determine promotion type based on urgency
    // 2. Generate promotion name
    // 3. Calculate optimal pricing
    // 4. Set expiration date
    // 5. Create promotion record
  }

  private static calculateOptimalPricing(
    recipe: Recipe,
    consumedItems: ConsumedItem[]
  ): { discountType: string, discountValue: number } {
    // Calculate pricing based on ingredient costs and urgency
  }
}
```

## Phase 3: Analytics & Optimization

### Analytics Endpoints
```
GET /api/smart/cooking-analytics
GET /api/smart/recipe-effectiveness
GET /api/smart/waste-reduction-stats
```

### Performance Considerations
- **Database Indexing**: Proper indexes on frequently queried fields
- **Caching**: Redis for analytics data
- **Pagination**: Large result sets
- **Connection Pooling**: Optimized database connections
- **Transaction Management**: Proper rollback on failures

## Implementation Timeline

### Week 1: Foundation
- [ ] Database migration
- [ ] RecipeCookingHistoryModel
- [ ] RecipeCookingService (basic cooking)
- [ ] Cook recipe endpoint
- [ ] Unit tests

### Week 2: Promotion Generation
- [ ] SmartPromotionService
- [ ] Auto-promotion creation
- [ ] Integration with existing promotion system
- [ ] End-to-end testing

### Week 3: Analytics & Polish
- [ ] Analytics endpoints
- [ ] Performance optimization
- [ ] Mobile integration
- [ ] Documentation updates

## Testing Strategy

### Unit Tests
- RecipeCookingService methods
- Stock validation logic
- Promotion generation algorithms

### Integration Tests
- End-to-end cooking workflow
- Database transaction safety
- Error handling scenarios

### Performance Tests
- Concurrent cooking operations
- Large dataset handling
- Database query optimization

## Error Handling

### Common Scenarios
- **Insufficient Stock**: Return detailed stock information
- **Recipe Not Found**: Clear error message
- **Database Transaction Failures**: Automatic rollback
- **Promotion Creation Failures**: Log error, continue cooking

### Error Response Format
```json
{
  "success": false,
  "error": "Insufficient stock for Fresh Mozzarella",
  "details": {
    "itemId": 33,
    "required": 1,
    "available": 0
  }
}
```

## Security Considerations

### Authorization
- Only authenticated users can cook recipes
- Business-scoped access control
- Role-based permissions (kitchen staff, managers)

### Data Validation
- Input sanitization for all parameters
- SQL injection prevention
- XSS protection in promotion names

## Monitoring & Logging

### Key Metrics
- Cooking success rate
- Waste reduction percentage
- Promotion effectiveness
- System performance

### Logging Strategy
- Structured logging for all cooking operations
- Error tracking with stack traces
- Performance monitoring for slow operations

## Future Enhancements

### Phase 4: Advanced Features
- **Machine Learning**: Optimize suggestions based on cooking history
- **Predictive Analytics**: Forecast ingredient needs
- **Multi-location Support**: Scale across restaurant chains
- **Integration APIs**: Connect with suppliers for auto-ordering

### Phase 5: Ecosystem Integration
- **Kitchen Display Systems**: Real-time cooking updates
- **Point of Sale**: Automatic promotion application
- **Inventory Management**: Supplier integration
- **Customer Apps**: Show chef's specials in real-time 