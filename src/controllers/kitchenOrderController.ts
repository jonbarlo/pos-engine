import { Request, Response, NextFunction } from 'express';
import { KitchenOrderService, KitchenOrderFilters } from '../services/kitchenOrderService';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export class KitchenOrderController {
  /**
   * Get all kitchen orders with optional filtering
   */
  public static getKitchenOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { status, priority, station, assignedTo, orderType } = req.query;

      const filters: KitchenOrderFilters = {
        businessId,
        status: status as string,
        priority: priority as string,
        station: station as string,
        assignedTo: assignedTo ? parseInt(assignedTo as string) : undefined,
        orderType: orderType as string
      };

      logger(`API endpoint GET /kitchen/orders was called with filters: ${JSON.stringify(filters)}`);
      
      const orders = await KitchenOrderService.getKitchenOrders(filters);
      
      res.json({
        success: true,
        data: orders
      });
    } catch (error) {
      logger(`Error getting kitchen orders: ${error}`);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  /**
   * Get a specific kitchen order by ID
   */
  public static getKitchenOrderById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, message: 'Order ID is required' });
        return;
      }

      const orderId = parseInt(id);
      if (isNaN(orderId)) {
        res.status(400).json({ success: false, message: 'Invalid order ID' });
        return;
      }

      logger(`API endpoint GET /kitchen/orders/${id} was called`);
      
      const order = await KitchenOrderService.getKitchenOrderById(orderId, businessId);
      
      if (!order) {
        res.status(404).json({ success: false, message: 'Kitchen order not found' });
        return;
      }

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      logger(`Error getting kitchen order by ID: ${error}`);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  /**
   * Update kitchen order status
   */
  public static updateKitchenOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, message: 'Order ID is required' });
        return;
      }

      const orderId = parseInt(id);
      if (isNaN(orderId)) {
        res.status(400).json({ success: false, message: 'Invalid order ID' });
        return;
      }

      const updateData = req.body;
      if (Object.keys(updateData).length === 0) {
        res.status(400).json({ success: false, message: 'No fields to update' });
        return;
      }

      logger(`API endpoint PUT /kitchen/orders/${id} was called with data: ${JSON.stringify(updateData)}`);
      
      const updatedOrder = await KitchenOrderService.updateKitchenOrder(orderId, businessId, updateData);
      
      if (!updatedOrder) {
        res.status(404).json({ success: false, message: 'Kitchen order not found' });
        return;
      }

      res.json({
        success: true,
        data: updatedOrder,
        message: 'Kitchen order updated successfully'
      });
    } catch (error) {
      logger(`Error updating kitchen order: ${error}`);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  /**
   * Start preparing a kitchen order
   */
  public static startPreparing = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, message: 'Order ID is required' });
        return;
      }

      const orderId = parseInt(id);
      if (isNaN(orderId)) {
        res.status(400).json({ success: false, message: 'Invalid order ID' });
        return;
      }

      const { assignedTo } = req.body;

      logger(`API endpoint PUT /kitchen/orders/${id}/start-preparing was called`);
      
      const updatedOrder = await KitchenOrderService.startPreparing(orderId, businessId, assignedTo);
      
      if (!updatedOrder) {
        res.status(404).json({ success: false, message: 'Kitchen order not found' });
        return;
      }

      res.json({
        success: true,
        data: updatedOrder,
        message: 'Kitchen order started preparing'
      });
    } catch (error) {
      logger(`Error starting preparation: ${error}`);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  /**
   * Mark kitchen order as ready
   */
  public static markReady = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, message: 'Order ID is required' });
        return;
      }

      const orderId = parseInt(id);
      if (isNaN(orderId)) {
        res.status(400).json({ success: false, message: 'Invalid order ID' });
        return;
      }

      logger(`API endpoint PUT /kitchen/orders/${id}/ready was called`);
      
      const updatedOrder = await KitchenOrderService.markReady(orderId, businessId);
      
      if (!updatedOrder) {
        res.status(404).json({ success: false, message: 'Kitchen order not found' });
        return;
      }

      res.json({
        success: true,
        data: updatedOrder,
        message: 'Kitchen order marked as ready'
      });
    } catch (error) {
      logger(`Error marking order as ready: ${error}`);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  /**
   * Mark kitchen order as served
   */
  public static markServed = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, message: 'Order ID is required' });
        return;
      }

      const orderId = parseInt(id);
      if (isNaN(orderId)) {
        res.status(400).json({ success: false, message: 'Invalid order ID' });
        return;
      }

      logger(`API endpoint PUT /kitchen/orders/${id}/served was called`);
      
      const updatedOrder = await KitchenOrderService.markServed(orderId, businessId);
      
      if (!updatedOrder) {
        res.status(404).json({ success: false, message: 'Kitchen order not found' });
        return;
      }

      res.json({
        success: true,
        data: updatedOrder,
        message: 'Kitchen order marked as served'
      });
    } catch (error) {
      logger(`Error marking order as served: ${error}`);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  /**
   * Update individual item status
   */
  public static updateItemStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { orderId, itemId } = req.params;
      if (!orderId || !itemId) {
        res.status(400).json({ success: false, message: 'Order ID and Item ID are required' });
        return;
      }

      const orderIdNum = parseInt(orderId);
      const itemIdNum = parseInt(itemId);
      if (isNaN(orderIdNum) || isNaN(itemIdNum)) {
        res.status(400).json({ success: false, message: 'Invalid order ID or item ID' });
        return;
      }

      const { status, assignedTo } = req.body;
      if (!status) {
        res.status(400).json({ success: false, message: 'Status is required' });
        return;
      }

      logger(`API endpoint PUT /kitchen/orders/${orderId}/items/${itemId}/status was called`);
      
      const updatedItem = await KitchenOrderService.updateItemStatus(orderIdNum, itemIdNum, businessId, status, assignedTo);
      
      if (!updatedItem) {
        res.status(404).json({ success: false, message: 'Kitchen order or item not found' });
        return;
      }

      res.json({
        success: true,
        data: updatedItem,
        message: 'Item status updated successfully'
      });
    } catch (error) {
      logger(`Error updating item status: ${error}`);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  /**
   * Assign kitchen order to a chef/staff member
   */
  public static assignOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, message: 'Order ID is required' });
        return;
      }

      const orderId = parseInt(id);
      if (isNaN(orderId)) {
        res.status(400).json({ success: false, message: 'Invalid order ID' });
        return;
      }

      const { assignedTo } = req.body;
      if (!assignedTo) {
        res.status(400).json({ success: false, message: 'AssignedTo user ID is required' });
        return;
      }

      logger(`API endpoint PUT /kitchen/orders/${id}/assign was called`);
      
      const updatedOrder = await KitchenOrderService.assignOrder(orderId, businessId, assignedTo);
      
      if (!updatedOrder) {
        res.status(404).json({ success: false, message: 'Kitchen order not found' });
        return;
      }

      res.json({
        success: true,
        data: updatedOrder,
        message: 'Kitchen order assigned successfully'
      });
    } catch (error) {
      logger(`Error assigning order: ${error}`);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  /**
   * Get kitchen statistics
   */
  public static getKitchenStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      logger(`API endpoint GET /kitchen/stats was called`);
      
      const stats = await KitchenOrderService.getKitchenStats(businessId);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger(`Error getting kitchen stats: ${error}`);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
} 