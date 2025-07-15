import { getSequelize } from './sequelize';
import { initializeBusinessModel } from './BusinessModel';
import { initializeUserModel } from './UserModel';
import { initializeItemModel } from './ItemModel';
import { initializeSaleModel } from './SaleModel';
import { initializeSaleItemModel } from './SaleItemModel';
import { initializeReservationModel } from './ReservationModel';
import { initializeTableModel } from './TableModel';
import { initializeOrderModel } from './OrderModel';
import { initializeOrderItemModel } from './OrderItemModel';
import { initializeCustomerModel } from './CustomerModel';
import { initializeMenuItemModel } from './MenuItemModel';
import { initializeMenuCategoryModel } from './MenuCategoryModel';
import { initializeDeliveryModel } from './DeliveryModel';
import { initializeKitchenOrderModel } from './KitchenOrderModel';
import { FloorPlanModel } from './FloorPlanModel';
import { TablePositionModel } from './TablePositionModel';

// Import models for associations
import { BusinessModel } from './BusinessModel';
import { UserModel } from './UserModel';
import { ItemModel } from './ItemModel';
import { SaleModel } from './SaleModel';
import { SaleItemModel } from './SaleItemModel';
import { ReservationModel } from './ReservationModel';
import { TableModel } from './TableModel';
import { OrderModel } from './OrderModel';
import { OrderItemModel } from './OrderItemModel';
import { CustomerModel } from './CustomerModel';
import { MenuItemModel } from './MenuItemModel';
import { MenuCategoryModel } from './MenuCategoryModel';
import { DeliveryModel } from './DeliveryModel';
import { KitchenOrderModel } from './KitchenOrderModel';
import { StaffMessageModel } from './StaffMessageModel';

export const initializeAllModels = (): void => {
  const sequelize = getSequelize();
  initializeBusinessModel(sequelize);
  initializeUserModel(sequelize);
  initializeItemModel(sequelize);
  initializeSaleModel(sequelize);
  initializeSaleItemModel(sequelize);
  initializeReservationModel(sequelize);
  initializeTableModel(sequelize);
  initializeOrderModel(sequelize);
  initializeOrderItemModel(sequelize);
  initializeCustomerModel(sequelize);
  initializeMenuItemModel(sequelize);
  initializeMenuCategoryModel(sequelize);
  initializeDeliveryModel(sequelize);
  initializeKitchenOrderModel(sequelize);
  
  // Floor plan models are already initialized via default export
  // StaffMessageModel is already initialized via default export
  
  // Associations are set up separately for integration tests
  // and skipped for unit tests to avoid import issues
};

let associationsSetup = false;

export const setupAssociations = (): void => {
  if (associationsSetup) {
    return; // Prevent duplicate setup
  }
  associationsSetup = true;
  // Business associations
  BusinessModel.hasMany(UserModel, {
    foreignKey: 'businessId',
    as: 'users',
    onDelete: 'CASCADE'
  });
  BusinessModel.hasMany(ItemModel, {
    foreignKey: 'businessId',
    as: 'items',
    onDelete: 'CASCADE'
  });
  BusinessModel.hasMany(SaleModel, {
    foreignKey: 'businessId',
    as: 'sales',
    onDelete: 'CASCADE'
  });
  BusinessModel.hasMany(ReservationModel, {
    foreignKey: 'businessId',
    as: 'reservations',
    onDelete: 'CASCADE'
  });
  BusinessModel.hasMany(TableModel, {
    foreignKey: 'businessId',
    as: 'tables',
    onDelete: 'CASCADE'
  });
  BusinessModel.hasMany(OrderModel, {
    foreignKey: 'businessId',
    as: 'orders',
    onDelete: 'CASCADE'
  });
  BusinessModel.hasMany(CustomerModel, {
    foreignKey: 'businessId',
    as: 'customers',
    onDelete: 'CASCADE'
  });
  // BusinessModel.hasMany(MenuItemModel, {
  //   foreignKey: 'businessId',
  //   as: 'menuItems',
  //   onDelete: 'CASCADE'
  // });
  // BusinessModel.hasMany(MenuCategoryModel, {
  //   foreignKey: 'businessId',
  //   as: 'menuCategories',
  //   onDelete: 'CASCADE'
  // });

  // User associations
  UserModel.belongsTo(BusinessModel, {
    foreignKey: 'businessId',
    as: 'userBusiness'
  });

  // Item associations
  ItemModel.belongsTo(BusinessModel, {
    foreignKey: 'businessId',
    as: 'itemBusiness'
  });

  // Sale associations
  SaleModel.belongsTo(BusinessModel, {
    foreignKey: 'businessId',
    as: 'saleBusiness'
  });
  SaleModel.belongsTo(UserModel, {
    foreignKey: 'userId',
    as: 'user'
  });

  SaleItemModel.belongsTo(SaleModel, {
    foreignKey: 'saleId',
    as: 'sale'
  });
  SaleItemModel.belongsTo(ItemModel, {
    foreignKey: 'itemId',
    as: 'item'
  });

  SaleModel.hasMany(SaleItemModel, {
    foreignKey: 'saleId',
    as: 'saleItems'
  });

  // Order associations
  OrderModel.belongsTo(BusinessModel, {
    foreignKey: 'businessId',
    as: 'orderBusiness'
  });
  OrderModel.belongsTo(UserModel, {
    foreignKey: 'serverId',
    as: 'server'
  });
  OrderModel.belongsTo(CustomerModel, {
    foreignKey: 'customerId',
    as: 'customer'
  });
  OrderModel.belongsTo(TableModel, {
    foreignKey: 'tableId',
    as: 'table'
  });

  OrderItemModel.belongsTo(OrderModel, {
    foreignKey: 'orderId',
    as: 'order'
  });
  OrderItemModel.belongsTo(MenuItemModel, {
    foreignKey: 'itemId',
    as: 'menuItem'
  });

  OrderModel.hasMany(OrderItemModel, {
    foreignKey: 'orderId',
    as: 'orderItems'
  });

  // Customer associations
  CustomerModel.belongsTo(BusinessModel, {
    foreignKey: 'businessId',
    as: 'customerBusiness'
  });

  // Menu associations
  MenuItemModel.belongsTo(BusinessModel, {
    foreignKey: 'businessId',
    as: 'menuItemBusiness'
  });
  MenuItemModel.belongsTo(MenuCategoryModel, {
    foreignKey: 'categoryId',
    as: 'category'
  });

  MenuCategoryModel.belongsTo(BusinessModel, {
    foreignKey: 'businessId',
    as: 'menuCategoryBusiness'
  });
  MenuCategoryModel.hasMany(MenuItemModel, {
    foreignKey: 'categoryId',
    as: 'menuItems'
  });

  // Reservation associations
  ReservationModel.belongsTo(BusinessModel, {
    foreignKey: 'businessId',
    as: 'reservationBusiness'
  });
  ReservationModel.belongsTo(TableModel, {
    foreignKey: 'tableId',
    as: 'table'
  });
  ReservationModel.belongsTo(CustomerModel, {
    foreignKey: 'customerId',
    as: 'customer'
  });

  // Table associations
  TableModel.belongsTo(BusinessModel, {
    foreignKey: 'businessId',
    as: 'tableBusiness'
  });
  TableModel.hasMany(ReservationModel, {
    foreignKey: 'tableId',
    as: 'reservations'
  });

  // Delivery associations
  BusinessModel.hasMany(DeliveryModel, {
    foreignKey: 'businessId',
    as: 'deliveries',
    onDelete: 'CASCADE'
  });

  DeliveryModel.belongsTo(BusinessModel, {
    foreignKey: 'businessId',
    as: 'deliveryBusiness'
  });
  DeliveryModel.belongsTo(OrderModel, {
    foreignKey: 'orderId',
    as: 'order'
  });
  DeliveryModel.belongsTo(CustomerModel, {
    foreignKey: 'customerId',
    as: 'customer'
  });
  DeliveryModel.belongsTo(UserModel, {
    foreignKey: 'driverId',
    as: 'driver'
  });

  // Kitchen order associations
  BusinessModel.hasMany(KitchenOrderModel, {
    foreignKey: 'businessId',
    as: 'kitchenOrders',
    onDelete: 'CASCADE'
  });

  KitchenOrderModel.belongsTo(BusinessModel, {
    foreignKey: 'businessId',
    as: 'kitchenOrderBusiness'
  });
  KitchenOrderModel.belongsTo(OrderModel, {
    foreignKey: 'orderId',
    as: 'order'
  });
  KitchenOrderModel.belongsTo(UserModel, {
    foreignKey: 'assignedTo',
    as: 'assignedToUser'
  });
  KitchenOrderModel.belongsTo(UserModel, {
    foreignKey: 'chefId',
    as: 'chef'
  });

  // Staff message associations
  BusinessModel.hasMany(StaffMessageModel, {
    foreignKey: 'businessId',
    as: 'staffMessages',
    onDelete: 'CASCADE'
  });

  StaffMessageModel.belongsTo(BusinessModel, {
    foreignKey: 'businessId',
    as: 'staffMessageBusiness'
  });
  StaffMessageModel.belongsTo(UserModel, {
    foreignKey: 'senderId',
    as: 'sender'
  });

  // Floor plan associations
  BusinessModel.hasMany(FloorPlanModel, {
    foreignKey: 'businessId',
    as: 'floorPlans',
    onDelete: 'CASCADE'
  });

  FloorPlanModel.belongsTo(BusinessModel, {
    foreignKey: 'businessId',
    as: 'floorPlanBusiness'
  });

  FloorPlanModel.hasMany(TablePositionModel, {
    foreignKey: 'floorPlanId',
    as: 'tablePositions',
    onDelete: 'CASCADE'
  });

  TablePositionModel.belongsTo(FloorPlanModel, {
    foreignKey: 'floorPlanId',
    as: 'floorPlan'
  });

  TablePositionModel.belongsTo(TableModel, {
    foreignKey: 'tableId',
    as: 'table'
  });

  TableModel.hasMany(TablePositionModel, {
    foreignKey: 'tableId',
    as: 'tablePositions'
  });
};

export { getSequelize };

// Export all models for use in routes and services
export {
  BusinessModel,
  UserModel,
  ItemModel,
  SaleModel,
  SaleItemModel,
  ReservationModel,
  TableModel,
  OrderModel,
  OrderItemModel,
  CustomerModel,
  MenuItemModel,
  MenuCategoryModel,
  DeliveryModel,
  KitchenOrderModel,
  StaffMessageModel,
  FloorPlanModel,
  TablePositionModel
};

// Export enums
export { TableStatus } from './TableModel'; 