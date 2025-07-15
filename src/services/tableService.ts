import { TableModel, OrderModel } from '../models';
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
}

export class TableService {
  /**
   * Get all tables for a business with their current orders
   */
  static async getTablesWithOrders(businessId: number): Promise<TableWithOrders[]> {
    try {
      const tables = await TableModel.findAll({
        where: { businessId },
        order: [['tableNumber', 'ASC']]
      });

      const tablesWithOrders: TableWithOrders[] = [];

      for (const table of tables) {
        // Get pending orders for this table
        const orders = await OrderModel.findAll({
          where: {
            tableId: table.id,
            businessId,
            status: {
              [Op.notIn]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED]
            }
          },
          order: [['createdAt', 'ASC']]
        });

        // Calculate total pending amount
        const totalPendingAmount = orders.reduce((sum, order) => {
          return sum + (order.totalAmount || 0);
        }, 0);

        tablesWithOrders.push({
          id: table.id,
          tableNumber: table.tableNumber,
          capacity: table.capacity,
          status: table.status,
          currentOrderId: table.currentOrderId || undefined,
          serverId: table.serverId || undefined,
          businessId: table.businessId,
          orders: orders.map(order => order.toJSON()),
          totalPendingAmount: parseFloat(totalPendingAmount.toFixed(2))
        });
      }

      return tablesWithOrders;
    } catch (error) {
      logger(`Error getting tables with orders for business ${businessId}: ${error}`);
      throw error;
    }
  }

  /**
   * Get a specific table with its orders
   */
  static async getTableWithOrders(tableId: number, businessId: number): Promise<TableWithOrders | null> {
    try {
      const table = await TableModel.findOne({
        where: { id: tableId, businessId }
      });

      if (!table) {
        return null;
      }

      // Get all orders for this table
      const orders = await OrderModel.findAll({
        where: {
          tableId: table.id,
          businessId
        },
        order: [['createdAt', 'DESC']]
      });

      // Calculate total pending amount
      const totalPendingAmount = orders
        .filter(order => ![OrderStatus.COMPLETED, OrderStatus.CANCELLED].includes(order.status))
        .reduce((sum, order) => {
          return sum + (order.totalAmount || 0);
        }, 0);

      return {
        id: table.id,
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        status: table.status,
        currentOrderId: table.currentOrderId || undefined,
        serverId: table.serverId || undefined,
        businessId: table.businessId,
        orders: orders.map(order => order.toJSON()),
        totalPendingAmount: parseFloat(totalPendingAmount.toFixed(2))
      };
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
} 