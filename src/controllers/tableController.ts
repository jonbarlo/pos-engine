import { Request, Response, NextFunction } from 'express';
import { TableService } from '../services/tableService';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';
import { TableStatus } from '../models/TableModel';

export class TableController {
  /**
   * Get all tables with their orders
   */
  public static getTablesWithOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) {
        res.status(401).json({ success: false, message: req.t('errors.server.unauthorized') });
        return;
      }

      logger(`API endpoint GET /tables/with-orders was called`);
      
      const tables = await TableService.getTablesWithOrders(businessId);
      
      res.json({
        success: true,
        data: tables,
        message: req.t('table.getTablesWithOrders.success', { count: tables.length })
      });
    } catch (error) {
      logger(`Error getting tables with orders: ${error}`);
      res.status(500).json({ 
        success: false, 
        message: req.t('table.getTablesWithOrders.error') 
      });
    }
  };

  /**
   * Get a specific table with its orders
   */
  public static getTableWithOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) {
        res.status(401).json({ success: false, message: req.t('errors.server.unauthorized') });
        return;
      }

      const { tableId } = req.params;
      if (!tableId) {
        res.status(400).json({ success: false, message: req.t('errors.validation.tableIdRequired') });
        return;
      }

      const tableIdNum = parseInt(tableId);
      if (isNaN(tableIdNum)) {
        res.status(400).json({ success: false, message: req.t('errors.validation.invalidTableId') });
        return;
      }

      logger(`API endpoint GET /tables/${tableId}/with-orders was called`);
      
      const table = await TableService.getTableWithOrders(tableIdNum, businessId);
      
      if (!table) {
        res.status(404).json({ success: false, message: req.t('errors.server.tableNotFound') });
        return;
      }

      res.json({
        success: true,
        data: table,
        message: req.t('table.getTableWithOrders.success', { tableNumber: table.tableNumber })
      });
    } catch (error) {
      logger(`Error getting table with orders: ${error}`);
      res.status(500).json({ 
        success: false, 
        message: req.t('table.getTableWithOrders.error') 
      });
    }
  };

  /**
   * Update table status
   */
  public static updateTableStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) {
        res.status(401).json({ success: false, message: req.t('errors.server.unauthorized') });
        return;
      }

      const { tableId } = req.params;
      if (!tableId) {
        res.status(400).json({ success: false, message: req.t('errors.validation.tableIdRequired') });
        return;
      }

      const tableIdNum = parseInt(tableId);
      if (isNaN(tableIdNum)) {
        res.status(400).json({ success: false, message: req.t('errors.validation.invalidTableId') });
        return;
      }

      const { status, serverId } = req.body;
      if (!status || !Object.values(TableStatus).includes(status)) {
        res.status(400).json({ success: false, message: req.t('errors.validation.validStatusRequired') });
        return;
      }

      logger(`API endpoint PUT /tables/${tableId}/status was called`);
      
      const table = await TableService.updateTableStatus(tableIdNum, businessId, status, serverId);
      
      res.json({
        success: true,
        data: table,
        message: req.t('table.updateTableStatus.success', { status })
      });
    } catch (error) {
      logger(`Error updating table status: ${error}`);
      res.status(500).json({ 
        success: false, 
        message: req.t('table.updateTableStatus.error') 
      });
    }
  };

  /**
   * Assign table to a server
   */
  public static assignTable = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) {
        res.status(401).json({ success: false, message: req.t('errors.server.unauthorized') });
        return;
      }

      const { tableId } = req.params;
      if (!tableId) {
        res.status(400).json({ success: false, message: req.t('errors.validation.tableIdRequired') });
        return;
      }

      const tableIdNum = parseInt(tableId);
      if (isNaN(tableIdNum)) {
        res.status(400).json({ success: false, message: req.t('errors.validation.invalidTableId') });
        return;
      }

      const { serverId } = req.body;
      if (!serverId) {
        res.status(400).json({ success: false, message: req.t('errors.validation.serverIdRequired') });
        return;
      }

      const serverIdNum = parseInt(serverId);
      if (isNaN(serverIdNum)) {
        res.status(400).json({ success: false, message: req.t('errors.validation.invalidServerId') });
        return;
      }

      logger(`API endpoint PUT /tables/${tableId}/assign was called`);
      
      const table = await TableService.assignTable(tableIdNum, businessId, serverIdNum);
      
      res.json({
        success: true,
        data: table,
        message: req.t('table.assignTable.success', { serverId })
      });
    } catch (error) {
      logger(`Error assigning table: ${error}`);
      res.status(500).json({ 
        success: false, 
        message: req.t('table.assignTable.error') 
      });
    }
  };

  /**
   * Get table statistics
   */
  public static getTableStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) {
        res.status(401).json({ success: false, message: req.t('errors.server.unauthorized') });
        return;
      }

      logger(`API endpoint GET /tables/stats was called`);
      
      const stats = await TableService.getTableStats(businessId);
      
      res.json({
        success: true,
        data: stats,
        message: req.t('table.getTableStats.success')
      });
    } catch (error) {
      logger(`Error getting table stats: ${error}`);
      res.status(500).json({ 
        success: false, 
        message: req.t('table.getTableStats.error') 
      });
    }
  };

  /**
   * Get tables that need attention
   */
  public static getTablesNeedingAttention = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) {
        res.status(401).json({ success: false, message: req.t('errors.server.unauthorized') });
        return;
      }

      logger(`API endpoint GET /tables/needing-attention was called`);
      
      const tables = await TableService.getTablesNeedingAttention(businessId);
      
      res.json({
        success: true,
        data: tables,
        message: req.t('table.getTablesNeedingAttention.success', { count: tables.length })
      });
    } catch (error) {
      logger(`Error getting tables needing attention: ${error}`);
      res.status(500).json({ 
        success: false, 
        message: req.t('table.getTablesNeedingAttention.error') 
      });
    }
  };

  /**
   * Seat customers at a table
   */
  public static seatTable = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) {
        res.status(401).json({ success: false, message: req.t('errors.server.unauthorized') });
        return;
      }

      const { tableId } = req.params;
      if (!tableId) {
        res.status(400).json({ success: false, message: req.t('errors.validation.tableIdRequired') });
        return;
      }

      const tableIdNum = parseInt(tableId);
      if (isNaN(tableIdNum)) {
        res.status(400).json({ success: false, message: req.t('errors.validation.invalidTableId') });
        return;
      }

      const { customerName, customerPhone, customerEmail, partySize, serverId, notes } = req.body;
      
      if (!partySize || partySize < 1) {
        res.status(400).json({ success: false, message: req.t('errors.validation.partySizeRequired') });
        return;
      }

      logger(`API endpoint POST /tables/${tableId}/seat was called`);
      logger(`🔍 DEBUG: Request body: ${JSON.stringify(req.body, null, 2)}`);
      logger(`🔍 DEBUG: Table ID: ${tableIdNum}, Business ID: ${businessId}`);
      
      const result = await TableService.seatTable(tableIdNum, businessId, {
        customerName,
        customerPhone,
        customerEmail,
        partySize,
        serverId,
        notes
      });
      
      res.json({
        success: true,
        data: result,
        message: req.t('table.seatTable.success', { tableNumber: result.table.tableNumber, partySize })
      });
    } catch (error) {
      logger(`Error seating customers at table: ${error}`);
      logger(`🔍 DEBUG: Full error object: ${JSON.stringify(error, null, 2)}`);
      if (error && typeof error === 'object' && 'parent' in error) {
        logger(`🔍 DEBUG: Parent error: ${JSON.stringify((error as any).parent, null, 2)}`);
      }
      res.status(500).json({ 
        success: false, 
        message: req.t('table.seatTable.error') 
      });
    }
  };
} 