import { TableModel, OrderModel, ReservationModel, CustomerModel } from '../models';
import { TableStatus } from '../models/TableModel';
import { OrderStatus, OrderType } from '../models/OrderModel';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';

export interface TableWithOrders {
  id: number;
  tableNumber: string;
  capacity: number;
  status: TableStatus;
  currentOrderId?: number | undefined;
  serverId?: number | undefined;
  businessId: number;
  orders: any[];
  totalPendingAmount: number;
  reservation?: {
    customerName: string;
    customerPhone: string;
    partySize: number;
    reservationDate: string;
    reservationTime: string;
    notes?: string;
  };
  customer?: {
    id: number;
    name: string;
    phone: string;
    email?: string;
    notes?: string;
  };
}

export class TableService {
  /**
   * Get all tables for a business with their current orders and reservations
   */
  static async getTablesWithOrders(businessId: number): Promise<TableWithOrders[]> {
    try {
      const tables = await TableModel.findAll({
        where: { businessId },
        include: [
          {
            model: ReservationModel,
            as: 'reservations',
            where: { 
              status: ['pending', 'confirmed'],
              reservationDate: new Date().toISOString().split('T')[0] // Today's date
            },
            required: false,
            attributes: ['id', 'customerName', 'customerPhone', 'partySize', 'reservationDate', 'reservationTime', 'notes', 'status'],
            order: [['reservationTime', 'ASC']],
            limit: 1 // Get the most relevant reservation
          }
        ],
        order: [['tableNumber', 'ASC']]
      });

      const tablesWithOrders: TableWithOrders[] = [];

      for (const table of tables) {
        // Get pending orders for this table with customer data
        const orders = await OrderModel.findAll({
          where: {
            tableId: table.id,
            businessId,
            status: {
              [Op.notIn]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED]
            }
          },
          include: [
            {
              model: CustomerModel,
              as: 'customer',
              attributes: ['id', 'name', 'phone', 'email', 'notes']
            }
          ],
          order: [['createdAt', 'ASC']]
        });

        // Calculate total pending amount
        const totalPendingAmount = orders.reduce((sum, order) => {
          return sum + (order.totalAmount || 0);
        }, 0);

        let customerInfo = null;
        let currentOrder = null;
        if (table.currentOrderId) {
          currentOrder = await OrderModel.findOne({
            where: { id: table.currentOrderId, businessId },
            include: [{ model: CustomerModel, as: 'customer', attributes: ['id', 'name', 'phone', 'email', 'notes'] }]
          });
          if (currentOrder && (currentOrder as any).customer) {
            customerInfo = (currentOrder as any).customer;
          }
        }
        const tableData: TableWithOrders = {
          id: table.id,
          tableNumber: table.tableNumber,
          capacity: table.capacity,
          status: table.status,
          currentOrderId: table.currentOrderId || undefined,
          serverId: table.serverId || undefined,
          businessId: table.businessId,
          orders: orders.map(order => order.toJSON()),
          totalPendingAmount: parseFloat(totalPendingAmount.toFixed(2)),
          customer: customerInfo || undefined
        };

        // Add reservation data if table is reserved and has active reservations
        if (table.status === 'reserved' && table.reservations && table.reservations.length > 0) {
          const reservation = table.reservations[0];
          tableData.reservation = {
            customerName: reservation.customerName,
            customerPhone: reservation.customerPhone,
            partySize: reservation.partySize,
            reservationDate: reservation.reservationDate,
            reservationTime: reservation.reservationTime,
            notes: reservation.notes
          };
        }

        // Add customer data from the first order if available (for occupied tables)
        if (orders.length > 0 && (orders[0] as any).customer) {
          const customer = (orders[0] as any).customer;
          tableData.customer = {
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            notes: customer.notes
          };
        }

        tablesWithOrders.push(tableData);
      }

      return tablesWithOrders;
    } catch (error) {
      logger(`Error getting tables with orders for business ${businessId}: ${error}`);
      throw error;
    }
  }

  /**
   * Get a specific table with its orders and reservations
   */
  static async getTableWithOrders(tableId: number, businessId: number): Promise<TableWithOrders | null> {
    try {
      const table = await TableModel.findOne({
        where: { id: tableId, businessId },
        include: [
          {
            model: ReservationModel,
            as: 'reservations',
            where: { 
              status: ['pending', 'confirmed'],
              reservationDate: new Date().toISOString().split('T')[0] // Today's date
            },
            required: false,
            attributes: ['id', 'customerName', 'customerPhone', 'partySize', 'reservationDate', 'reservationTime', 'notes', 'status'],
            order: [['reservationTime', 'ASC']],
            limit: 1 // Get the most relevant reservation
          }
        ]
      });

      if (!table) {
        return null;
      }

      // Get all orders for this table with customer data
      const orders = await OrderModel.findAll({
        where: {
          tableId: table.id,
          businessId
        },
        include: [
          {
            model: CustomerModel,
            as: 'customer',
            attributes: ['id', 'name', 'phone', 'email', 'notes']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      // Calculate total pending amount
      const totalPendingAmount = orders
        .filter(order => ![OrderStatus.COMPLETED, OrderStatus.CANCELLED].includes(order.status))
        .reduce((sum, order) => {
          return sum + (order.totalAmount || 0);
        }, 0);

      let customerInfo = null;
      let currentOrder = null;
      if (table.currentOrderId) {
        currentOrder = await OrderModel.findOne({
          where: { id: table.currentOrderId, businessId },
          include: [{ model: CustomerModel, as: 'customer', attributes: ['id', 'name', 'phone', 'email', 'notes'] }]
        });
        if (currentOrder && (currentOrder as any).customer) {
          customerInfo = (currentOrder as any).customer;
        }
      }
      const tableData: TableWithOrders = {
        id: table.id,
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        status: table.status,
        currentOrderId: table.currentOrderId || undefined,
        serverId: table.serverId || undefined,
        businessId: table.businessId,
        orders: orders.map(order => order.toJSON()),
        totalPendingAmount: parseFloat(totalPendingAmount.toFixed(2)),
        customer: customerInfo || undefined
      };

      // Add reservation data if table is reserved and has active reservations
      if (table.status === 'reserved' && table.reservations && table.reservations.length > 0) {
        const reservation = table.reservations[0];
        tableData.reservation = {
          customerName: reservation.customerName,
          customerPhone: reservation.customerPhone,
          partySize: reservation.partySize,
          reservationDate: reservation.reservationDate,
          reservationTime: reservation.reservationTime,
          notes: reservation.notes
        };
      }

      // Add customer data from the first order if available (for occupied tables)
      if (orders.length > 0 && (orders[0] as any).customer) {
        const customer = (orders[0] as any).customer;
        tableData.customer = {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          notes: customer.notes
        };
      }

      return tableData;
    } catch (error) {
      logger(`Error getting table ${tableId} with orders: ${error}`);
      throw error;
    }
  }

  /**
   * Update table status
   */
  static async updateTableStatus(tableId: number, businessId: number, status: TableStatus, serverId?: number): Promise<any> {
    try {
      const table = await TableModel.findOne({
        where: { id: tableId, businessId }
      });

      if (!table) {
        throw new Error('Table not found');
      }

      const updateData: any = { status };
      
      if (serverId !== undefined) {
        updateData.serverId = serverId;
      }

      // If setting to available, clear current order
      if (status === TableStatus.AVAILABLE) {
        updateData.currentOrderId = null;
        updateData.serverId = null;
      }

      await table.update(updateData);

      logger(`Table ${tableId} status updated to ${status}`);

      return table.toJSON();
    } catch (error) {
      logger(`Error updating table ${tableId} status: ${error}`);
      throw error;
    }
  }

  /**
   * Assign table to a server
   */
  static async assignTable(tableId: number, businessId: number, serverId: number): Promise<any> {
    try {
      const table = await TableModel.findOne({
        where: { id: tableId, businessId }
      });

      if (!table) {
        throw new Error('Table not found');
      }

      if (table.status !== TableStatus.AVAILABLE) {
        throw new Error('Table is not available for assignment');
      }

      await table.update({
        status: TableStatus.OCCUPIED,
        serverId
      });

      logger(`Table ${tableId} assigned to server ${serverId}`);

      return table.toJSON();
    } catch (error) {
      logger(`Error assigning table ${tableId} to server ${serverId}: ${error}`);
      throw error;
    }
  }

  /**
   * Get table statistics
   */
  static async getTableStats(businessId: number): Promise<any> {
    try {
      const tables = await TableModel.findAll({
        where: { businessId }
      });

      const totalTables = tables.length;
      const availableTables = tables.filter(t => t.status === TableStatus.AVAILABLE).length;
      const occupiedTables = tables.filter(t => t.status === TableStatus.OCCUPIED).length;
      const reservedTables = tables.filter(t => t.status === TableStatus.RESERVED).length;
      const outOfServiceTables = tables.filter(t => t.status === TableStatus.OUT_OF_SERVICE).length;

      // Get total capacity
      const totalCapacity = tables.reduce((sum, table) => sum + table.capacity, 0);

      // Get tables with pending orders
      const tablesWithPendingOrders = await Promise.all(
        tables.map(async (table) => {
          const pendingOrders = await OrderModel.count({
            where: {
              tableId: table.id,
              businessId,
              status: {
                [Op.notIn]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED]
              }
            }
          });

          return {
            tableId: table.id,
            tableNumber: table.tableNumber,
            pendingOrders
          };
        })
      );

      const tablesWithOrders = tablesWithPendingOrders.filter(t => t.pendingOrders > 0);

      return {
        totalTables,
        availableTables,
        occupiedTables,
        reservedTables,
        outOfServiceTables,
        totalCapacity,
        tablesWithPendingOrders: tablesWithOrders.length,
        utilizationRate: totalTables > 0 ? ((occupiedTables + reservedTables) / totalTables * 100).toFixed(1) : '0',
        averageCapacity: totalTables > 0 ? Math.round(totalCapacity / totalTables) : 0
      };
    } catch (error) {
      logger(`Error getting table stats for business ${businessId}: ${error}`);
      throw error;
    }
  }

  /**
   * Get tables that need attention (have pending orders)
   */
  static async getTablesNeedingAttention(businessId: number): Promise<any[]> {
    try {
      const tables = await TableModel.findAll({
        where: { businessId },
        order: [['tableNumber', 'ASC']]
      });

      const tablesNeedingAttention = [];

      for (const table of tables) {
        // Get pending orders for this table
        const pendingOrders = await OrderModel.findAll({
          where: {
            tableId: table.id,
            businessId,
            status: {
              [Op.notIn]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED]
            }
          },
          order: [['createdAt', 'ASC']]
        });

        if (pendingOrders.length > 0) {
          // Find the oldest order to calculate wait time
          const oldestOrder = pendingOrders[0];
          if (oldestOrder) {
            const orderAge = Date.now() - new Date(oldestOrder.createdAt).getTime();
            const waitTimeMinutes = Math.floor(orderAge / (1000 * 60));

            tablesNeedingAttention.push({
              tableId: table.id,
              tableNumber: table.tableNumber,
              status: table.status,
              pendingOrders: pendingOrders.length,
              oldestOrderId: oldestOrder.id,
              oldestOrderAge: waitTimeMinutes,
              totalPendingAmount: pendingOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
              needsAttention: waitTimeMinutes > 30 // Flag if waiting more than 30 minutes
            });
          }
        }
      }

      // Sort by attention priority (oldest orders first)
      return tablesNeedingAttention.sort((a, b) => b.oldestOrderAge - a.oldestOrderAge);
    } catch (error) {
      logger(`Error getting tables needing attention for business ${businessId}: ${error}`);
      throw error;
    }
  }

  /**
   * Seat customers at a table
   */
  static async seatTable(tableId: number, businessId: number, seatingData: {
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    partySize: number;
    serverId?: number;
    notes?: string;
  }): Promise<any> {
    try {
      logger(`🔍 DEBUG: Starting seatTable for tableId: ${tableId}, businessId: ${businessId}`);
      logger(`🔍 DEBUG: Seating data: ${JSON.stringify(seatingData, null, 2)}`);
      
      const { customerName, customerPhone, customerEmail, partySize, serverId, notes } = seatingData;

      // Find the table
      logger(`🔍 DEBUG: Looking for table with id: ${tableId}, businessId: ${businessId}`);
      const table = await TableModel.findOne({
        where: { id: tableId, businessId }
      });

      if (!table) {
        logger(`🔍 DEBUG: Table not found for id: ${tableId}, businessId: ${businessId}`);
        throw new Error('Table not found');
      }

      logger(`🔍 DEBUG: Found table: ${JSON.stringify(table.toJSON(), null, 2)}`);

      if (table.status !== 'available') {
        logger(`🔍 DEBUG: Table status is not available: ${table.status}`);
        throw new Error(`Table is not available. Current status: ${table.status}`);
      }

      // Create or find customer
      logger(`🔍 DEBUG: Starting customer creation/finding logic`);
      let customer = null;
      if (customerEmail) {
        logger(`🔍 DEBUG: Looking for existing customer with email: ${customerEmail}`);
        customer = await CustomerModel.findOne({
          where: { email: customerEmail, businessId }
        });
        if (customer) {
          logger(`🔍 DEBUG: Found existing customer: ${JSON.stringify(customer.toJSON(), null, 2)}`);
        } else {
          logger(`🔍 DEBUG: No existing customer found with email: ${customerEmail}`);
        }
      }

      if (!customer && (customerName || customerPhone)) {
        logger(`🔍 DEBUG: Creating new customer with data: customerName=${customerName}, customerPhone=${customerPhone}, customerEmail=${customerEmail}`);
        const customerData: any = {
          businessId,
          name: customerName || 'Walk-in Customer',
          loyaltyPoints: 0,
          totalSpent: '0.00',
          visitCount: 1,
          isActive: true
        };
        
        if (customerEmail) customerData.email = customerEmail;
        if (customerPhone) customerData.phone = customerPhone;
        
        logger(`🔍 DEBUG: Customer data to create: ${JSON.stringify(customerData, null, 2)}`);
        
        try {
          customer = await CustomerModel.create(customerData);
          logger(`🔍 DEBUG: Customer created successfully: ${JSON.stringify(customer.toJSON(), null, 2)}`);
        } catch (customerError) {
          logger(`🔍 DEBUG: Customer creation failed: ${customerError}`);
          logger(`🔍 DEBUG: Customer error details: ${JSON.stringify(customerError, null, 2)}`);
          throw customerError;
        }
      }

      // Create an order for the seated customers
      logger(`🔍 DEBUG: Starting order creation`);
      const orderData: any = {
        businessId,
        tableId,
        orderNumber: `ORDER-${Date.now()}-${tableId}`,
        orderType: OrderType.DINE_IN,
        status: OrderStatus.PENDING,
        totalAmount: 0
      };
      
      if (customer?.id) orderData.customerId = customer.id;
      if (notes) orderData.notes = notes;
      if (serverId) orderData.serverId = serverId;
      
      logger(`🔍 DEBUG: Order data to create: ${JSON.stringify(orderData, null, 2)}`);
      
      let order;
      try {
        order = await OrderModel.create(orderData);
        logger(`🔍 DEBUG: Order created successfully: ${JSON.stringify(order.toJSON(), null, 2)}`);
      } catch (orderError) {
        logger(`🔍 DEBUG: Order creation failed: ${orderError}`);
        logger(`🔍 DEBUG: Order error details: ${JSON.stringify(orderError, null, 2)}`);
        throw orderError;
      }

      // Update table status
      logger(`🔍 DEBUG: Starting table update`);
      const updateData: any = {
        status: TableStatus.OCCUPIED,
        partySize,
        currentOrderId: order.id
      };
      
      if (serverId) updateData.serverId = serverId;
      if (customerName) updateData.customerName = customerName;
      if (notes) updateData.notes = notes;
      
      logger(`🔍 DEBUG: Table update data: ${JSON.stringify(updateData, null, 2)}`);
      
      try {
        await table.update(updateData);
        logger(`🔍 DEBUG: Table updated successfully`);
      } catch (tableError) {
        logger(`🔍 DEBUG: Table update failed: ${tableError}`);
        logger(`🔍 DEBUG: Table error details: ${JSON.stringify(tableError, null, 2)}`);
        throw tableError;
      }

      return {
        table: table.toJSON(),
        order: order.toJSON(),
        customer: customer?.toJSON()
      };
    } catch (error) {
      logger(`Error seating customers at table ${tableId}: ${error}`);
      logger(`Error details: ${JSON.stringify(error, null, 2)}`);
      throw error;
    }
  }
} 