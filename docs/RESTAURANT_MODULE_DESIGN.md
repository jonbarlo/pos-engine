# 🍽️ Restaurant Module Design

## 🎯 Overview

This document outlines the restaurant-specific features that would extend the POS Engine to support restaurant operations, including table management, split billing, and restaurant-specific workflows.

---

## 🏗️ Core Restaurant Features

### 1. Table Management System

#### Table Model
```typescript
interface Table {
  id: number;
  businessId: number;
  tableNumber: string;        // "A1", "B3", "VIP1"
  capacity: number;           // Max seats
  status: TableStatus;        // available, occupied, reserved, cleaning
  currentOrderId?: number;    // Active order
  serverId?: number;          // Assigned server
  section: string;            // "Bar", "Patio", "Main Floor"
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  CLEANING = 'cleaning',
  OUT_OF_SERVICE = 'out_of_service'
}
```

#### Table Operations
- **Assign/Unassign** tables to servers
- **Reserve tables** for specific times
- **Transfer tables** between servers
- **Merge tables** for large parties
- **Split tables** for separate bills
- **Table status tracking** (available, occupied, cleaning)

### 2. Order Management

#### Restaurant Order Model
```typescript
interface RestaurantOrder {
  id: number;
  businessId: number;
  tableId: number;
  serverId: number;
  orderNumber: string;        // "ORD-001", "TBL-A1-001"
  status: OrderStatus;
  orderType: OrderType;       // dine_in, takeout, delivery
  partySize: number;
  specialInstructions: string;
  estimatedReadyTime?: Date;
  actualReadyTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  READY = 'ready',
  SERVED = 'served',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

enum OrderType {
  DINE_IN = 'dine_in',
  TAKEOUT = 'takeout',
  DELIVERY = 'delivery'
}
```

#### Order Items with Modifications
```typescript
interface OrderItem {
  id: number;
  orderId: number;
  itemId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions: string;
  modifications: OrderModification[];
  status: OrderItemStatus;
}

interface OrderModification {
  id: number;
  orderItemId: number;
  modificationType: 'add' | 'remove' | 'substitute';
  itemName: string;
  price: number;
  description: string;
}

enum OrderItemStatus {
  PENDING = 'pending',
  PREPARING = 'preparing',
  READY = 'ready',
  SERVED = 'served',
  CANCELLED = 'cancelled'
}
```

### 3. Split Billing System

#### Split Bill Model
```typescript
interface SplitBill {
  id: number;
  orderId: number;
  originalBillId: number;
  splitType: SplitType;
  numberOfSplits: number;
  splitAmount: number;
  remainingAmount: number;
  status: SplitStatus;
  createdAt: Date;
}

enum SplitType {
  EQUAL = 'equal',           // Split equally
  ITEM_BASED = 'item_based', // Split by items
  CUSTOM = 'custom',         // Custom amounts
  PERCENTAGE = 'percentage'  // Split by percentage
}

enum SplitStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  COMPLETED = 'completed'
}
```

#### Split Bill Item
```typescript
interface SplitBillItem {
  id: number;
  splitBillId: number;
  orderItemId: number;
  customerId: number;        // Which customer gets this item
  amount: number;
  percentage: number;
}
```

### 4. Customer Management

#### Customer Model
```typescript
interface Customer {
  id: number;
  businessId: number;
  name: string;
  phone: string;
  email: string;
  loyaltyPoints: number;
  preferences: CustomerPreferences;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CustomerPreferences {
  dietaryRestrictions: string[];
  favoriteItems: number[];
  seatingPreference: string;
  specialInstructions: string;
}
```

---

## 🍽️ Restaurant-Specific Features

### 1. Menu Management

#### Menu Categories
```typescript
interface MenuCategory {
  id: number;
  businessId: number;
  name: string;              // "Appetizers", "Main Course", "Desserts"
  displayOrder: number;
  isActive: boolean;
  availableTimes: TimeRange[];
}

interface TimeRange {
  startTime: string;         // "11:00"
  endTime: string;           // "22:00"
  daysOfWeek: number[];      // [1,2,3,4,5,6,7] for Mon-Sun
}
```

#### Menu Items with Restaurant Features
```typescript
interface MenuItem {
  id: number;
  businessId: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  preparationTime: number;   // Minutes
  allergens: string[];
  nutritionalInfo: NutritionalInfo;
  customizationOptions: CustomizationOption[];
  isAvailable: boolean;
  isPopular: boolean;
  imageUrl: string;
}

interface CustomizationOption {
  id: number;
  menuItemId: number;
  name: string;              // "Size", "Toppings", "Cooking Style"
  type: 'single' | 'multiple' | 'quantity';
  options: CustomizationChoice[];
  required: boolean;
}

interface CustomizationChoice {
  id: number;
  name: string;
  price: number;
  isAvailable: boolean;
}
```

### 2. Kitchen Display System (KDS)

#### Kitchen Order Display
```typescript
interface KitchenOrder {
  id: number;
  orderId: number;
  tableNumber: string;
  orderNumber: string;
  items: KitchenOrderItem[];
  priority: 'normal' | 'rush' | 'vip';
  estimatedReadyTime: Date;
  specialInstructions: string;
  status: KitchenOrderStatus;
}

interface KitchenOrderItem {
  id: number;
  itemName: string;
  quantity: number;
  modifications: string[];
  preparationTime: number;
  status: KitchenItemStatus;
  assignedTo?: number;       // Kitchen staff ID
}
```

### 3. Reservation System

#### Reservation Model
```typescript
interface Reservation {
  id: number;
  businessId: number;
  customerId: number;
  tableId?: number;
  partySize: number;
  reservationDate: Date;
  reservationTime: string;
  duration: number;          // Minutes
  status: ReservationStatus;
  specialRequests: string;
  contactPhone: string;
  contactEmail: string;
  createdAt: Date;
}

enum ReservationStatus {
  CONFIRMED = 'confirmed',
  SEATED = 'seated',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}
```

---

## 💳 Advanced Billing Features

### 1. Split Billing Workflows

#### Equal Split
```typescript
interface EqualSplitRequest {
  orderId: number;
  numberOfSplits: number;
  splitType: 'equal';
}

// Example: $100 bill split 4 ways = $25 each
```

#### Item-Based Split
```typescript
interface ItemBasedSplitRequest {
  orderId: number;
  splitType: 'item_based';
  splits: ItemSplit[];
}

interface ItemSplit {
  customerId: number;
  items: number[];           // Order item IDs
  amount: number;
}
```

#### Custom Amount Split
```typescript
interface CustomSplitRequest {
  orderId: number;
  splitType: 'custom';
  splits: CustomSplit[];
}

interface CustomSplit {
  customerId: number;
  amount: number;
  items?: number[];          // Optional item assignment
}
```

### 2. Payment Processing

#### Payment Model
```typescript
interface Payment {
  id: number;
  orderId: number;
  customerId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  tipAmount: number;
  taxAmount: number;
  subtotal: number;
  total: number;
  transactionId: string;
  processedAt: Date;
}

enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  MOBILE_PAYMENT = 'mobile_payment',
  GIFT_CARD = 'gift_card',
  SPLIT_PAYMENT = 'split_payment'
}
```

### 3. Tip Management

#### Tip Distribution
```typescript
interface TipDistribution {
  id: number;
  paymentId: number;
  serverId: number;
  amount: number;
  percentage: number;
  distributionType: 'equal' | 'percentage' | 'custom';
}
```

---

## 📊 Restaurant Analytics

### 1. Table Analytics
```typescript
interface TableAnalytics {
  tableId: number;
  averageTurnoverTime: number;
  averagePartySize: number;
  averageBillAmount: number;
  peakHours: TimeRange[];
  utilizationRate: number;
}
```

### 2. Server Performance
```typescript
interface ServerPerformance {
  serverId: number;
  totalSales: number;
  averageTipPercentage: number;
  tablesServed: number;
  averageTableTurnover: number;
  customerSatisfaction: number;
}
```

### 3. Menu Analytics
```typescript
interface MenuAnalytics {
  itemId: number;
  totalOrders: number;
  totalRevenue: number;
  averagePreparationTime: number;
  popularityRank: number;
  profitMargin: number;
}
```

---

## 🔧 API Endpoints

### Table Management
```
GET    /api/tables                    # List all tables
POST   /api/tables                    # Create new table
GET    /api/tables/{id}               # Get table details
PUT    /api/tables/{id}               # Update table
DELETE /api/tables/{id}               # Delete table
PUT    /api/tables/{id}/status        # Update table status
POST   /api/tables/{id}/assign        # Assign table to server
POST   /api/tables/{id}/reserve       # Reserve table
```

### Order Management
```
GET    /api/orders                    # List orders
POST   /api/orders                    # Create new order
GET    /api/orders/{id}               # Get order details
PUT    /api/orders/{id}               # Update order
PUT    /api/orders/{id}/status        # Update order status
POST   /api/orders/{id}/items         # Add items to order
PUT    /api/orders/{id}/items/{itemId} # Update order item
DELETE /api/orders/{id}/items/{itemId} # Remove order item
```

### Split Billing
```
POST   /api/orders/{id}/split         # Create split bill
GET    /api/orders/{id}/splits        # Get split bills
PUT    /api/splits/{id}               # Update split bill
POST   /api/splits/{id}/pay           # Process split payment
GET    /api/splits/{id}/items         # Get split bill items
```

### Kitchen Display
```
GET    /api/kitchen/orders            # Get kitchen orders
PUT    /api/kitchen/orders/{id}       # Update kitchen order
PUT    /api/kitchen/items/{id}        # Update item status
POST   /api/kitchen/orders/{id}/ready # Mark order as ready
```

### Reservations
```
GET    /api/reservations              # List reservations
POST   /api/reservations              # Create reservation
GET    /api/reservations/{id}         # Get reservation
PUT    /api/reservations/{id}         # Update reservation
DELETE /api/reservations/{id}         # Cancel reservation
```

---

## 🎯 Implementation Priority

### Phase 1: Core Restaurant Features
1. **Table Management** - Basic table CRUD and status tracking
2. **Restaurant Orders** - Order creation with table assignment
3. **Basic Split Billing** - Equal splits only

### Phase 2: Advanced Features
1. **Item-Based Split Billing** - Split by specific items
2. **Kitchen Display System** - Order management for kitchen
3. **Reservation System** - Table reservations

### Phase 3: Analytics & Optimization
1. **Restaurant Analytics** - Performance metrics
2. **Advanced Menu Management** - Categories and customization
3. **Customer Management** - Loyalty and preferences

---

## 💡 Key Benefits

### For Restaurants
- **Efficient Table Management** - Track table status and assignments
- **Flexible Billing** - Multiple split options for any party size
- **Kitchen Integration** - Streamlined order processing
- **Customer Experience** - Reservations and preferences

### For Staff
- **Easy Split Billing** - Handle complex bill splits quickly
- **Table Transfers** - Move customers between tables seamlessly
- **Order Tracking** - Real-time order status updates
- **Performance Metrics** - Track server and table performance

### For Customers
- **Convenient Reservations** - Easy booking system
- **Flexible Payment** - Split bills however they prefer
- **Special Requests** - Dietary restrictions and preferences
- **Loyalty Program** - Points and rewards system

This restaurant module would transform your POS system into a comprehensive restaurant management solution! 