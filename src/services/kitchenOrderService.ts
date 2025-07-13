import { KitchenOrderModel, KitchenOrderAttributes, KitchenOrderCreationAttributes } from '../models/KitchenOrderModel';
import { OrderModel } from '../models/OrderModel';
import { UserModel } from '../models/UserModel';
import { logger } from '../utils/logger';

export interface KitchenOrderFilters {
  status?: string;
  priority?: string;
  station?: string;
  assignedTo?: number | undefined;
  orderType?: string;
  businessId: number;
}



export class KitchenOrderService {
  /**
   * Get all kitchen orders for a business with optional filtering
   */
  static async getKitchenOrders(filters: KitchenOrderFilters): Promise<KitchenOrderAttributes[]> {
    try {
      const { businessId, status, priority, station, assignedTo, orderType } = filters;
      
      const whereClause: any = { businessId };
      
      if (status) whereClause.status = status;
      if (priority) whereClause.priority = priority;
      if (station) whereClause.station = station;
      if (assignedTo) whereClause.assignedTo = assignedTo;
      if (orderType) whereClause.orderType = orderType;

      const orders = await KitchenOrderModel.findAll({
        where: whereClause,
        order: [
          ['priority', 'DESC'], // Urgent orders first
          ['createdAt', 'ASC']  // Then by creation time
        ],
        include: [
          {
            model: OrderModel,
            as: 'order',
            include: [
              {
                model: UserModel,
                as: 'server'
              }
            ]
          }
        ]
      });

      return orders.map(order => order.toJSON());
    } catch (error) {
      logger(`Error getting kitchen orders: ${error}`);
      throw error;
    }
  }

  /**
   * Get a specific kitchen order by ID
   */
  static async getKitchenOrderById(id: number, businessId: number): Promise<KitchenOrderAttributes | null> {
    try {
      const order = await KitchenOrderModel.findOne({
        where: { id, businessId },
        include: [
          {
            model: OrderModel,
            as: 'order',
            include: [
              {
                model: UserModel,
                as: 'server'
              }
            ]
          }
        ]
      });

      return order ? order.toJSON() : null;
    } catch (error) {
      logger(`Error getting kitchen order by ID: ${error}`);
      throw error;
    }
  }

  /**
   * Update kitchen order status and related fields
   */
  static async updateKitchenOrder(
    id: number, 
    businessId: number, 
    updateData: Partial<KitchenOrderAttributes>
  ): Promise<KitchenOrderAttributes | null> {
    try {
      const order = await KitchenOrderModel.findOne({
        where: { id, businessId }
      });

      if (!order) {
        return null;
      }

      // Handle status-specific logic
      if (updateData.status) {
        switch (updateData.status) {
          case 'preparing':
            if (!order.startTime) {
              updateData.startTime = new Date();
            }
            break;
          case 'ready':
            updateData.readyTime = new Date();
            if (order.startTime) {
              const prepTime = Math.floor((Date.now() - order.startTime.getTime()) / 1000 / 60);
              updateData.actualPrepTime = prepTime;
            }
            break;
          case 'served':
            updateData.servedTime = new Date();
            break;
        }
      }

      // Update the order
      await order.update(updateData);
      
      logger(`Kitchen order ${id} updated: ${JSON.stringify(updateData)}`);
      
      return order.toJSON();
    } catch (error) {
      logger(`Error updating kitchen order: ${error}`);
      throw error;
    }
  }

  /**
   * Start preparing a kitchen order
   */
  static async startPreparing(id: number, businessId: number, assignedTo?: number): Promise<KitchenOrderAttributes | null> {
    try {
      const order = await KitchenOrderModel.findOne({
        where: { id, businessId }
      });

      if (!order) {
        return null;
      }

      const updateData: Partial<KitchenOrderAttributes> = {
        status: 'preparing',
        startTime: new Date()
      };

      if (assignedTo) {
        const user = await UserModel.findByPk(assignedTo);
        updateData.assignedTo = assignedTo;
        updateData.assignedToName = user?.name || 'Unknown';
      }

      // Use the model's built-in method to update all items
      order.startPreparation(assignedTo, updateData.assignedToName);

      await order.update(updateData);
      
      logger(`Kitchen order ${id} started preparing`);
      
      return order.toJSON();
    } catch (error) {
      logger(`Error starting preparation for kitchen order: ${error}`);
      throw error;
    }
  }

  /**
   * Mark kitchen order as ready
   */
  static async markReady(id: number, businessId: number): Promise<KitchenOrderAttributes | null> {
    try {
      const order = await KitchenOrderModel.findOne({
        where: { id, businessId }
      });

      if (!order) {
        return null;
      }

      // Use the model's built-in method
      order.markReady();

      await order.save();
      
      logger(`Kitchen order ${id} marked as ready`);
      
      return order.toJSON();
    } catch (error) {
      logger(`Error marking kitchen order as ready: ${error}`);
      throw error;
    }
  }

  /**
   * Mark kitchen order as served
   */
  static async markServed(id: number, businessId: number): Promise<KitchenOrderAttributes | null> {
    try {
      const order = await KitchenOrderModel.findOne({
        where: { id, businessId }
      });

      if (!order) {
        return null;
      }

      // Use the model's built-in method
      order.markServed();

      await order.save();
      
      logger(`Kitchen order ${id} marked as served`);
      
      return order.toJSON();
    } catch (error) {
      logger(`Error marking kitchen order as served: ${error}`);
      throw error;
    }
  }

  /**
   * Update individual item status within a kitchen order
   */
  static async updateItemStatus(
    orderId: number, 
    businessId: number, 
    itemId: number, 
    status: 'pending' | 'preparing' | 'ready' | 'served',
    assignedTo?: number
  ): Promise<KitchenOrderAttributes | null> {
    try {
      const order = await KitchenOrderModel.findOne({
        where: { id: orderId, businessId }
      });

      if (!order) {
        return null;
      }

      // Use the model's built-in method
      order.updateItemStatus(itemId, status);

      if (assignedTo) {
        const user = await UserModel.findByPk(assignedTo);
        order.assignItemTo(itemId, assignedTo, user?.name || 'Unknown');
      }

      await order.save();
      await order.reload();
      logger(`Item ${itemId} in kitchen order ${orderId} updated to status: ${status}`);
      return order.toJSON();
    } catch (error) {
      logger(`Error updating item status: ${error}`);
      throw error;
    }
  }

  /**
   * Assign kitchen order to a chef/staff member
   */
  static async assignOrder(
    orderId: number, 
    businessId: number, 
    assignedTo: number
  ): Promise<KitchenOrderAttributes | null> {
    try {
      const order = await KitchenOrderModel.findOne({
        where: { id: orderId, businessId }
      });

      if (!order) {
        return null;
      }

      const user = await UserModel.findByPk(assignedTo);
      if (!user) {
        throw new Error('User not found');
      }

      // Use the model's built-in method
      order.assignTo(assignedTo, user.name);

      await order.save();
      
      logger(`Kitchen order ${orderId} assigned to ${user.name}`);
      
      return order.toJSON();
    } catch (error) {
      logger(`Error assigning kitchen order: ${error}`);
      throw error;
    }
  }

  /**
   * Get kitchen order statistics
   */
  static async getKitchenStats(businessId: number): Promise<{
    totalOrders: number;
    pendingOrders: number;
    preparingOrders: number;
    readyOrders: number;
    averagePrepTime: number;
  }> {
    try {
      const orders = await KitchenOrderModel.findAll({
        where: { businessId },
        attributes: ['status', 'actualPrepTime', 'startTime', 'readyTime']
      });

      const totalOrders = orders.length;
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      const preparingOrders = orders.filter(o => o.status === 'preparing').length;
      const readyOrders = orders.filter(o => o.status === 'ready').length;

      const completedOrders = orders.filter(o => o.actualPrepTime !== null);
      const averagePrepTime = completedOrders.length > 0
        ? completedOrders.reduce((sum, order) => sum + (order.actualPrepTime || 0), 0) / completedOrders.length
        : 0;

      return {
        totalOrders,
        pendingOrders,
        preparingOrders,
        readyOrders,
        averagePrepTime: Math.round(averagePrepTime)
      };
    } catch (error) {
      logger(`Error getting kitchen stats: ${error}`);
      throw error;
    }
  }
} 