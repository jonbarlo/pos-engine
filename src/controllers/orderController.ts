import { Request, Response, NextFunction } from 'express';
import { OrderService, OrderCompletionData } from '../services/orderService';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export class OrderController {
  /**
   * Complete an order and create a sale
   */
  public static completeOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

      const completionData: OrderCompletionData = req.body;
      if (!completionData.paymentMethod) {
        res.status(400).json({ success: false, message: 'Payment method is required' });
        return;
      }

      logger(`API endpoint PUT /orders/${id}/complete was called`);
      
      const result = await OrderService.completeOrder(orderId, businessId, completionData);
      
      res.json({
        success: true,
        data: result,
        message: 'Order completed successfully'
      });
    } catch (error) {
      logger(`Error completing order: ${error}`);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  };

  /**
   * Clear a table and complete all pending orders
   */
  public static clearTable = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { tableId } = req.params;
      if (!tableId) {
        res.status(400).json({ success: false, message: 'Table ID is required' });
        return;
      }

      const tableIdNum = parseInt(tableId);
      if (isNaN(tableIdNum)) {
        res.status(400).json({ success: false, message: 'Invalid table ID' });
        return;
      }

      logger(`API endpoint PUT /tables/${tableId}/clear was called`);
      
      const result = await OrderService.clearTable(tableIdNum, businessId);
      
      res.json({
        success: true,
        data: result,
        message: `Table cleared successfully. Completed ${result.ordersCompleted} orders, created ${result.salesCreated} sales`
      });
    } catch (error) {
      logger(`Error clearing table: ${error}`);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  };

  /**
   * Get orders by table
   */
  public static getOrdersByTable = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { tableId } = req.params;
      if (!tableId) {
        res.status(400).json({ success: false, message: 'Table ID is required' });
        return;
      }

      const tableIdNum = parseInt(tableId);
      if (isNaN(tableIdNum)) {
        res.status(400).json({ success: false, message: 'Invalid table ID' });
        return;
      }

      logger(`API endpoint GET /tables/${tableId}/orders was called`);
      
      const orders = await OrderService.getOrdersByTable(tableIdNum, businessId);
      
      res.json({
        success: true,
        data: orders,
        message: `Found ${orders.length} orders for table ${tableId}`
      });
    } catch (error) {
      logger(`Error getting orders by table: ${error}`);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  };

  /**
   * Get pending orders for the business
   */
  public static getPendingOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      logger(`API endpoint GET /orders/pending was called`);
      
      const orders = await OrderService.getPendingOrders(businessId);
      
      res.json({
        success: true,
        data: orders,
        message: `Found ${orders.length} pending orders`
      });
    } catch (error) {
      logger(`Error getting pending orders: ${error}`);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  };

  /**
   * Get completed orders for the business
   */
  public static getCompletedOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { startDate, endDate } = req.query;
      let start: Date | undefined;
      let end: Date | undefined;

      if (startDate) {
        start = new Date(startDate as string);
        if (isNaN(start.getTime())) {
          res.status(400).json({ success: false, message: 'Invalid start date format' });
          return;
        }
      }

      if (endDate) {
        end = new Date(endDate as string);
        if (isNaN(end.getTime())) {
          res.status(400).json({ success: false, message: 'Invalid end date format' });
          return;
        }
      }

      logger(`API endpoint GET /orders/completed was called`);
      
      const orders = await OrderService.getCompletedOrders(businessId, start, end);
      
      res.json({
        success: true,
        data: orders,
        message: `Found ${orders.length} completed orders`
      });
    } catch (error) {
      logger(`Error getting completed orders: ${error}`);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  };

  /**
   * Get order statistics
   */
  public static getOrderStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { startDate, endDate } = req.query;
      let start: Date | undefined;
      let end: Date | undefined;

      if (startDate) {
        start = new Date(startDate as string);
        if (isNaN(start.getTime())) {
          res.status(400).json({ success: false, message: 'Invalid start date format' });
          return;
        }
      }

      if (endDate) {
        end = new Date(endDate as string);
        if (isNaN(end.getTime())) {
          res.status(400).json({ success: false, message: 'Invalid end date format' });
          return;
        }
      }

      logger(`API endpoint GET /orders/stats was called`);
      
      const completedOrders = await OrderService.getCompletedOrders(businessId, start, end);
      const pendingOrders = await OrderService.getPendingOrders(businessId);

      const totalRevenue = completedOrders.reduce((sum, order) => {
        return sum + (order.totalAmount || 0);
      }, 0);

      const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

      const stats = {
        totalCompletedOrders: completedOrders.length,
        totalPendingOrders: pendingOrders.length,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
        ordersByStatus: {
          pending: pendingOrders.filter(o => o.status === 'pending').length,
          confirmed: pendingOrders.filter(o => o.status === 'confirmed').length,
          in_progress: pendingOrders.filter(o => o.status === 'in_progress').length,
          ready: pendingOrders.filter(o => o.status === 'ready').length,
          served: pendingOrders.filter(o => o.status === 'served').length
        }
      };
      
      res.json({
        success: true,
        data: stats,
        message: 'Order statistics retrieved successfully'
      });
    } catch (error) {
      logger(`Error getting order stats: ${error}`);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  };
} 