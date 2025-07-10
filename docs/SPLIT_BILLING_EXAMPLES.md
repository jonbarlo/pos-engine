# 💳 Split Billing Examples & Use Cases

## 🎯 Overview

This document provides practical examples of how split billing would work in real restaurant scenarios, showing different split types and workflows.

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

**Split Billing Process:**
```typescript
// Equal split request
{
  "orderId": 123,
  "splitType": "equal",
  "numberOfSplits": 4
}

// Result: Each person pays $31 (124 ÷ 4)
```

**Customer Experience:**
- Server selects "Equal Split" option
- System automatically divides total by 4
- Each customer gets their own bill for $31
- Can pay separately with different payment methods

---

### Scenario 2: Item-Based Split

**Situation:** Couple dining together, one person had expensive wine, other had basic meal.

**Order Details:**
- Person A: Pasta ($18) + House Wine ($25) = $43
- Person B: Salad ($12) + Water ($2) = $14
- Shared Appetizer: $16 (split equally)
- **Total: $73**

**Split Billing Process:**
```typescript
// Item-based split request
{
  "orderId": 124,
  "splitType": "item_based",
  "splits": [
    {
      "customerId": 1,
      "items": [1, 2, 5], // Pasta, Wine, half of appetizer
      "amount": 51 // 43 + 8 (half of appetizer)
    },
    {
      "customerId": 2,
      "items": [3, 4, 5], // Salad, Water, half of appetizer
      "amount": 22 // 14 + 8 (half of appetizer)
    }
  ]
}
```

**Customer Experience:**
- Server assigns items to each person
- Person A pays $51 (their items + half appetizer)
- Person B pays $22 (their items + half appetizer)

---

### Scenario 3: Custom Amount Split

**Situation:** Business lunch where company pays 80%, employee pays 20%.

**Order Details:**
- Business Lunch: $60
- **Total: $60**

**Split Billing Process:**
```typescript
// Custom amount split request
{
  "orderId": 125,
  "splitType": "custom",
  "splits": [
    {
      "customerId": 1, // Company
      "amount": 48,    // 80% of $60
      "description": "Company expense"
    },
    {
      "customerId": 2, // Employee
      "amount": 12,    // 20% of $60
      "description": "Employee contribution"
    }
  ]
}
```

---

### Scenario 4: Complex Group Split

**Situation:** 8-person birthday party with mixed orders and shared items.

**Order Details:**
- 8 Individual Meals: $160 (8 × $20)
- 2 Shared Appetizers: $30 (2 × $15)
- 1 Birthday Cake: $25
- 8 Drinks: $40 (8 × $5)
- **Total: $255**

**Split Options:**

#### Option A: Equal Split
```typescript
{
  "orderId": 126,
  "splitType": "equal",
  "numberOfSplits": 8
}
// Each person pays $31.88
```

#### Option B: Birthday Person Pays for Cake
```typescript
{
  "orderId": 126,
  "splitType": "custom",
  "splits": [
    {
      "customerId": 1, // Birthday person
      "amount": 56.88, // Their meal + drinks + cake + share of appetizers
      "description": "Birthday person (includes cake)"
    },
    {
      "customerId": 2,
      "amount": 28.44, // Their meal + drinks + share of appetizers
      "description": "Guest 1"
    },
    // ... 6 more guests at $28.44 each
  ]
}
```

---

## 🔧 Technical Implementation Examples

### 1. Split Bill Creation API

```typescript
// POST /api/orders/{id}/split
interface CreateSplitBillRequest {
  orderId: number;
  splitType: 'equal' | 'item_based' | 'custom' | 'percentage';
  numberOfSplits?: number;
  splits?: SplitDetail[];
  percentage?: number;
}

interface SplitDetail {
  customerId: number;
  amount: number;
  items?: number[];
  description?: string;
}

// Response
interface SplitBillResponse {
  id: number;
  orderId: number;
  splitType: string;
  splits: SplitBillDetail[];
  totalAmount: number;
  status: 'pending' | 'partial' | 'completed';
}

interface SplitBillDetail {
  id: number;
  customerId: number;
  amount: number;
  items: OrderItem[];
  paymentStatus: 'pending' | 'paid';
}
```

### 2. Split Bill Payment Processing

```typescript
// POST /api/splits/{id}/pay
interface ProcessSplitPaymentRequest {
  splitId: number;
  customerId: number;
  paymentMethod: 'cash' | 'credit_card' | 'debit_card' | 'mobile';
  amount: number;
  tipAmount?: number;
  tipPercentage?: number;
}

// Response
interface SplitPaymentResponse {
  paymentId: number;
  amount: number;
  tipAmount: number;
  totalAmount: number;
  paymentMethod: string;
  transactionId: string;
  status: 'completed' | 'pending' | 'failed';
}
```

---

## 📱 User Interface Examples

### 1. Server Interface for Split Billing

```
┌─────────────────────────────────────┐
│ Order #123 - Table A1               │
│ Total: $124.00                      │
├─────────────────────────────────────┤
│                                     │
│ Split Options:                      │
│ ○ Equal Split (4 ways) - $31.00 ea │
│ ○ Item-based Split                  │
│ ○ Custom Amounts                    │
│ ○ Percentage Split                  │
│                                     │
│ [Split Bill] [Cancel]               │
└─────────────────────────────────────┘
```

### 2. Item-Based Split Interface

```
┌─────────────────────────────────────┐
│ Item Assignment                     │
├─────────────────────────────────────┤
│ Customer 1: John                    │
│ ├─ Pasta ($18.00)                   │
│ ├─ House Wine ($25.00)              │
│ └─ Half Appetizer ($8.00)           │
│ Total: $51.00                       │
│                                     │
│ Customer 2: Sarah                   │
│ ├─ Salad ($12.00)                   │
│ ├─ Water ($2.00)                    │
│ └─ Half Appetizer ($8.00)           │
│ Total: $22.00                       │
│                                     │
│ [Confirm Split] [Modify]            │
└─────────────────────────────────────┘
```

### 3. Payment Processing Interface

```
┌─────────────────────────────────────┐
│ Split Bill Payment                  │
├─────────────────────────────────────┤
│ Customer 1: John - $51.00           │
│ Payment Method: [Credit Card ▼]     │
│ Tip: [15% ▼] $7.65                  │
│ Total: $58.65                       │
│ [Process Payment]                   │
│                                     │
│ Customer 2: Sarah - $22.00          │
│ Payment Method: [Cash ▼]            │
│ Tip: [20% ▼] $4.40                  │
│ Total: $26.40                       │
│ [Process Payment]                   │
│                                     │
│ [Complete All Payments]             │
└─────────────────────────────────────┘
```

---

## 🎯 Advanced Split Billing Features

### 1. Partial Payments

**Scenario:** Customer wants to pay part now, part later.

```typescript
// Partial payment
{
  "splitId": 456,
  "customerId": 1,
  "amount": 25.00,        // Paying $25 now
  "paymentMethod": "cash",
  "remainingAmount": 26.00 // $26 remaining
}
```

### 2. Split Bill Modifications

**Scenario:** Customer wants to add items after split is created.

```typescript
// Add items to existing split
{
  "splitId": 456,
  "customerId": 1,
  "newItems": [
    {
      "itemId": 15,
      "quantity": 1,
      "price": 8.00
    }
  ]
}
```

### 3. Split Bill Transfers

**Scenario:** Customer wants to transfer their portion to another customer.

```typescript
// Transfer split portion
{
  "splitId": 456,
  "fromCustomerId": 1,
  "toCustomerId": 2,
  "amount": 15.00
}
```

---

## 📊 Split Billing Analytics

### 1. Split Type Usage Statistics

```typescript
interface SplitBillingAnalytics {
  totalSplits: number;
  splitTypeDistribution: {
    equal: number;
    itemBased: number;
    custom: number;
    percentage: number;
  };
  averageSplitAmount: number;
  averagePartySize: number;
  peakSplitHours: TimeRange[];
}
```

### 2. Payment Method Analysis

```typescript
interface SplitPaymentAnalytics {
  paymentMethodDistribution: {
    cash: number;
    creditCard: number;
    debitCard: number;
    mobilePayment: number;
  };
  averageTipPercentage: number;
  averageTransactionTime: number;
}
```

---

## 🔒 Security & Validation

### 1. Split Bill Validation

```typescript
// Validation rules
const splitValidationRules = {
  totalAmount: "Split amounts must equal original order total",
  customerAssignment: "Each item must be assigned to a customer",
  paymentMethods: "Valid payment methods only",
  tipCalculation: "Tip must be calculated correctly",
  taxDistribution: "Tax must be distributed proportionally"
};
```

### 2. Fraud Prevention

```typescript
// Fraud detection
const fraudDetectionRules = {
  multipleSplits: "Flag orders with >3 splits",
  largeAmounts: "Flag splits >$200",
  rapidSplits: "Flag multiple splits in short time",
  paymentMismatch: "Flag payment method mismatches"
};
```

---

## 💡 Best Practices

### 1. User Experience
- **Clear Communication:** Always show split amounts clearly
- **Flexible Options:** Offer multiple split types
- **Easy Modifications:** Allow changes before payment
- **Receipt Clarity:** Separate receipts for each customer

### 2. Technical Implementation
- **Atomic Operations:** Ensure split operations are atomic
- **Audit Trail:** Log all split modifications
- **Backup Options:** Allow manual override if needed
- **Performance:** Optimize for quick split calculations

### 3. Business Rules
- **Tax Distribution:** Distribute tax proportionally
- **Tip Handling:** Allow individual tip amounts
- **Refund Processing:** Handle partial refunds correctly
- **Loyalty Points:** Distribute points appropriately

This comprehensive split billing system would handle any restaurant scenario from simple equal splits to complex multi-party custom arrangements! 