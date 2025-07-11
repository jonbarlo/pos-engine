# 💳 Split Billing Examples & Use Cases

## 🎯 Overview

This document provides practical examples of how split billing works with the actual API endpoints, showing different split types and workflows.

---

## 🍽️ Real-World Scenarios

### Scenario 1: Equal Split (Most Common)

**Situation:** 4 friends dining together, want to split the bill equally.

**Order Details:**
- Appetizer: $12
- 4 Main Courses: $80 (4 × $20)
- 4 Drinks: $24 (4 × $6)
- Dessert: $8
- **Total: $124**

**API Call:**
```bash
POST /api/sales/split
```

**Request Body:**
```json
{
  "userId": 1,
  "totalAmount": 124.00,
  "customerName": "Group of 4 Friends",
  "customerPhone": "555-1234",
  "notes": "Equal split between 4 people",
  "items": [
    {
      "itemId": 1,
      "quantity": 1,
      "unitPrice": 12.00
    },
    {
      "itemId": 2,
      "quantity": 4,
      "unitPrice": 20.00
    },
    {
      "itemId": 3,
      "quantity": 4,
      "unitPrice": 6.00
    },
    {
      "itemId": 4,
      "quantity": 1,
      "unitPrice": 8.00
    }
  ],
  "payments": [
    {
      "amount": 31.00,
      "method": "credit_card",
      "customerName": "John Doe",
      "customerPhone": "555-1111",
      "reference": "CC001"
    },
    {
      "amount": 31.00,
      "method": "debit_card",
      "customerName": "Jane Smith",
      "customerPhone": "555-2222",
      "reference": "DC001"
    },
    {
      "amount": 31.00,
      "method": "cash",
      "customerName": "Bob Wilson",
      "customerPhone": "555-3333"
    },
    {
      "amount": 31.00,
      "method": "mobile_payment",
      "customerName": "Alice Johnson",
      "customerPhone": "555-4444",
      "reference": "MP001"
    }
  ]
}
```

**Response:**
```json
{
  "message": "Split sale created successfully",
  "sale": {
    "id": 1,
    "totalAmount": 124.00,
    "status": "completed",
    "payments": [
      {
        "amount": 31.00,
        "method": "credit_card",
        "customerName": "John Doe",
        "customerPhone": "555-1111",
        "reference": "CC001",
        "paidAt": "2025-01-01T12:00:00.000Z"
      }
    ],
    "createdAt": "2025-01-01T12:00:00.000Z"
  }
}
```

---

### Scenario 2: Item-Based Split

**Situation:** Couple dining together, one person had expensive wine, other had basic meal.

**Order Details:**
- Person A: Pasta ($18) + House Wine ($25) = $43
- Person B: Salad ($12) + Water ($2) = $14
- Shared Appetizer: $16 (split equally)
- **Total: $73**

**API Call:**
```bash
POST /api/sales/split
```

**Request Body:**
```json
{
  "userId": 1,
  "totalAmount": 73.00,
  "customerName": "Couple Dining",
  "customerPhone": "555-1234",
  "notes": "Split based on individual orders",
  "items": [
    {
      "itemId": 1,
      "quantity": 1,
      "unitPrice": 18.00
    },
    {
      "itemId": 2,
      "quantity": 1,
      "unitPrice": 25.00
    },
    {
      "itemId": 3,
      "quantity": 1,
      "unitPrice": 12.00
    },
    {
      "itemId": 4,
      "quantity": 1,
      "unitPrice": 2.00
    },
    {
      "itemId": 5,
      "quantity": 1,
      "unitPrice": 16.00
    }
  ],
  "payments": [
    {
      "amount": 51.00,
      "method": "credit_card",
      "customerName": "Person A",
      "customerPhone": "555-1111",
      "reference": "CC002"
    },
    {
      "amount": 22.00,
      "method": "cash",
      "customerName": "Person B",
      "customerPhone": "555-2222"
    }
  ]
}
```

---

### Scenario 3: Partial Payment (Add Payment Later)

**Situation:** Customer wants to pay part now, part later.

**Initial Payment:**
```bash
POST /api/sales/split
```

**Request Body:**
```json
{
  "userId": 1,
  "totalAmount": 100.00,
  "customerName": "Partial Payment Customer",
  "customerPhone": "555-1234",
  "notes": "Will pay remaining amount later",
  "payments": [
    {
      "amount": 60.00,
      "method": "credit_card",
      "customerName": "John Doe",
      "customerPhone": "555-1111",
      "reference": "CC003"
    }
  ]
}
```

**Response:**
```json
{
  "message": "Split sale created successfully",
  "sale": {
    "id": 2,
    "totalAmount": 100.00,
    "status": "pending",
    "totalPaid": 60.00,
    "remainingAmount": 40.00
  }
}
```

**Later Payment:**
```bash
POST /api/sales/2/payments
```

**Request Body:**
```json
{
  "amount": 40.00,
  "method": "cash",
  "customerName": "John Doe",
  "customerPhone": "555-1111"
}
```

**Response:**
```json
{
  "message": "Payment added successfully",
  "sale": {
    "id": 2,
    "totalAmount": 100.00,
    "status": "completed",
    "totalPaid": 100.00,
    "remainingAmount": 0.00
  }
}
```

---

### Scenario 4: Refund Processing

**Situation:** Customer wants to return an item and get a partial refund.

**Original Sale:**
- Total: $100
- Payment: $100 via credit card

**Refund Request:**
```bash
POST /api/sales/1/refund
```

**Request Body:**
```json
{
  "paymentIndex": 0,
  "refundAmount": 25.00,
  "reason": "Customer returned one item"
}
```

**Response:**
```json
{
  "message": "Refund processed successfully",
  "sale": {
    "id": 1,
    "totalAmount": 100.00,
    "status": "completed",
    "refundAmount": 25.00,
    "totalPaid": 75.00
  }
}
```

---

## 🔧 Technical Implementation Examples

### 1. Create Split Sale

```typescript
// POST /api/sales/split
interface CreateSplitSaleRequest {
  userId: number;
  totalAmount: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  notes?: string;
  items?: SaleItem[];
  payments: Payment[];
}

interface SaleItem {
  itemId: number;
  quantity: number;
  unitPrice: number;
}

interface Payment {
  amount: number;
  method: string;
  customerName?: string;
  customerPhone?: string;
  reference?: string;
}

// Response
interface SplitSaleResponse {
  message: string;
  sale: {
    id: number;
    totalAmount: number;
    status: string;
    payments: PaymentDetail[];
    totalPaid?: number;
    remainingAmount?: number;
    createdAt: string;
  };
}

interface PaymentDetail {
  amount: number;
  method: string;
  customerName?: string;
  customerPhone?: string;
  reference?: string;
  paidAt: string;
}
```

### 2. Add Payment to Existing Sale

```typescript
// POST /api/sales/{saleId}/payments
interface AddPaymentRequest {
  amount: number;
  method: string;
  customerName?: string;
  customerPhone?: string;
  reference?: string;
}

// Response
interface AddPaymentResponse {
  message: string;
  sale: {
    id: number;
    totalAmount: number;
    status: string;
    totalPaid: number;
  };
}
```

### 3. Get Sale with Payment Details

```typescript
// GET /api/sales/{id}
interface SaleWithPayments {
  id: number;
  totalAmount: number;
  status: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  notes?: string;
  payments: PaymentDetail[];
  totalPaid: number;
  remainingAmount: number;
  createdAt: string;
  updatedAt: string;
}
```

### 4. Process Refund

```typescript
// POST /api/sales/{saleId}/refund
interface RefundRequest {
  paymentIndex: number;
  refundAmount: number;
  reason?: string;
}

// Response
interface RefundResponse {
  message: string;
  sale: {
    id: number;
    totalAmount: number;
    status: string;
    refundAmount: number;
    totalPaid: number;
  };
}
```

---

## 🎯 Business Logic Rules

### Payment Validation
- Total of all payment amounts must equal the totalAmount for completed sales
- Sale status is "pending" if totalPaid < totalAmount
- Sale status is "completed" if totalPaid >= totalAmount
- Sale status is "refunded" if totalPaid < 0

### Refund Rules
- refundAmount cannot exceed the original payment amount
- Refunds are added as negative payments to the payments array
- Sale status updates based on new totalPaid amount

### Payment Methods Supported
- `cash` - Cash payment
- `credit_card` - Credit card payment
- `debit_card` - Debit card payment
- `mobile_payment` - Mobile payment (Apple Pay, Google Pay, etc.)
- `check` - Check payment
- `gift_card` - Gift card payment
- `voucher` - Voucher or coupon payment

---

## 📊 Analytics and Reporting

### Get Split Billing Statistics
```bash
GET /api/sales/split/stats
```

**Response:**
```json
{
  "totalSplitSales": 15,
  "totalAmount": 2500.00,
  "averageSplitAmount": 166.67,
  "averagePaymentsPerSale": 2.8,
  "mostCommonPaymentMethod": "credit_card",
  "splitSalesPercentage": 12.5
}
```

### Business Insights
- Track split billing usage patterns
- Identify popular payment method combinations
- Monitor average split amounts
- Analyze customer behavior for group orders 