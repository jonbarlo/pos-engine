# Mobile App Order Creation Fix

## Issue Description

The mobile app was unable to create orders or update existing orders due to a SQL Server parameter validation error:

```
Error creating table order: SequelizeDatabaseError: Input parameter '9' could not be validated
```

## Root Cause

The issue was caused by floating-point precision problems when passing decimal values to SQL Server. The `totalAmount`, `subtotal`, and `taxAmount` fields were being calculated as floating-point numbers that SQL Server couldn't properly validate.

## Solution Implemented

### 1. Fixed Decimal Precision Issues

Updated `src/routes/orders.ts` to properly handle decimal calculations:

```typescript
// Before (causing SQL Server errors)
const itemTotal = menuItem.price * item.quantity;
const taxAmount = subtotal * (taxRate /100
const totalAmount = subtotal + taxAmount;

// After (fixed for SQL Server)
const itemTotal = Math.round((menuItem.price * item.quantity) *100) / 100
const taxAmount = Math.round((subtotal * (taxRate / 100100/ 100;
const totalAmount = Math.round((subtotal + taxAmount) *100) / 100;
```

###2per Decimal Formatting for Database

Ensured all decimal values are properly formatted before database insertion:

```typescript
// Create order with properly formatted decimal values
const order = await OrderModel.create({
  businessId,
  serverId: req.user?.userId || 1ustomerId,
  tableId,
  orderNumber,
  orderType, // Use the orderType from request body
  status: OrderStatus.PENDING,
  subtotal: parseFloat(subtotal.toFixed(2)), // Ensure proper decimal format
  taxAmount: parseFloat(taxAmount.toFixed(2)), // Ensure proper decimal format
  discountAmount:0totalAmount: parseFloat(totalAmount.toFixed(2)), // Ensure proper decimal format
  notes
});
```

### 3. Fixed Order Type Parameter

Fixed the hardcoded `OrderType.DINE_IN` to use the `orderType` from the request body.

## Mobile App Order Endpoints

The mobile app can now use these endpoints:

### Create Orders
- `POST /api/orders` - Create general order
- `POST /api/orders/table` - Create table-specific order

### Update Orders
- `POST /api/orders/:id/items` - Add items to existing order
- `PATCH /api/orders/:id/status` - Update order status

### Get Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/pending` - Get pending orders
- `GET /api/tables/:id/orders` - Get orders by table

### Complete Orders
- `PUT /api/orders/:id/complete` - Complete order and create sale

## Request Format

### Create Order
```json
[object Object]
  orderType": "DINE_IN",
 tableId": 1,
 items: [
    [object Object]
      itemId": 1
   quantity:2,
   notes": "Extra cheese please"
    }
  ],notes": "Table order for mobile app"
}
```

### Update Order Status
```json
[object Object]status": "CONFIRMED",notes: "Order confirmed via mobile app"
}
```

## Testing

The mobile app should now be able to:
1. Create orders without SQL Server parameter validation errors
2te existing orders
3. Add items to orders
4. Change order status
5omplete orders and create sales

## Next Steps

1. Test order creation from the mobile app
2. Verify order updates work correctly
3. Test order completion and sale creation
4. Monitor logs for any remaining decimal precision issues 