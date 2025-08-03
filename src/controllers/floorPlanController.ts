import { Request, Response, RequestHandler } from 'express';
import { AuthRequest } from '../middleware/auth';
import { FloorPlanService } from '../services/floorPlanService';
import { logger } from '../utils/logger';

export class FloorPlanController {
  // Get all floor plans for the current business
  public static getFloorPlans: RequestHandler = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user?.businessId) {
        res.status(401).json({ error: req.t('errors.server.unauthorized') });
        return;
      }

      logger(`API endpoint GET /floor-plans was called for business: ${req.user.businessId}`);
      const floorPlans = await FloorPlanService.getFloorPlans(req.user.businessId);
      res.json(floorPlans);
    } catch (error) {
      logger(`Error getting floor plans: ${error}`);
      res.status(500).json({ error: req.t('floorPlan.getFloorPlans.error') });
    }
  };

  // Get floor plan by ID
  public static getFloorPlanById: RequestHandler = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: req.t('errors.validation.floorPlanIdRequired') });
        return;
      }
      
      if (!req.user?.businessId) {
        res.status(401).json({ error: req.t('errors.server.unauthorized') });
        return;
      }
      
      const floorPlanId = parseInt(id);
      
      if (isNaN(floorPlanId)) {
        res.status(400).json({ error: req.t('errors.validation.invalidFloorPlanId') });
        return;
      }

      logger(`API endpoint GET /floor-plans/${id} was called`);
      const floorPlan = await FloorPlanService.getFloorPlanById(floorPlanId, req.user.businessId);
      
      if (!floorPlan) {
        res.status(404).json({ error: req.t('errors.server.floorPlanNotFound') });
        return;
      }

      res.json(floorPlan);
    } catch (error) {
      logger(`Error getting floor plan: ${error}`);
      res.status(500).json({ error: req.t('floorPlan.getFloorPlanById.error') });
    }
  };

  // Get floor plan with table positions
  public static getFloorPlanWithTables: RequestHandler = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: req.t('errors.validation.floorPlanIdRequired') });
        return;
      }
      
      if (!req.user?.businessId) {
        res.status(401).json({ error: req.t('errors.server.unauthorized') });
        return;
      }
      
      const floorPlanId = parseInt(id);
      
      if (isNaN(floorPlanId)) {
        res.status(400).json({ error: req.t('errors.validation.invalidFloorPlanId') });
        return;
      }

      logger(`API endpoint GET /floor-plans/${id}/tables was called`);
      const floorPlan = await FloorPlanService.getFloorPlanWithTables(floorPlanId, req.user.businessId);
      
      if (!floorPlan) {
        res.status(404).json({ error: req.t('errors.server.floorPlanNotFound') });
        return;
      }

      res.json(floorPlan);
    } catch (error) {
      logger(`Error getting floor plan with tables: ${error}`);
      res.status(500).json({ error: req.t('floorPlan.getFloorPlanWithTables.error') });
    }
  };

  // Create new floor plan
  public static createFloorPlan: RequestHandler = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user?.businessId) {
        res.status(401).json({ error: req.t('errors.server.unauthorized') });
        return;
      }

      const { name, width, height, backgroundImage } = req.body;

      if (!name) {
        res.status(400).json({ error: req.t('errors.validation.floorPlanNameRequired') });
        return;
      }

      if (width && (width < 100 || width > 2000)) {
        res.status(400).json({ error: req.t('errors.validation.widthRange') });
        return;
      }

      if (height && (height < 100 || height > 2000)) {
        res.status(400).json({ error: req.t('errors.validation.heightRange') });
        return;
      }

      logger(`API endpoint POST /floor-plans was called`);
      const floorPlan = await FloorPlanService.createFloorPlan(req.user.businessId, {
        name,
        width: width || 800,
        height: height || 600,
        backgroundImage,
        isActive: true,
        businessId: req.user.businessId
      });
      
      res.status(201).json(floorPlan);
    } catch (error) {
      logger(`Error creating floor plan: ${error}`);
      res.status(500).json({ error: req.t('floorPlan.createFloorPlan.error') });
    }
  };

  // Update floor plan
  public static updateFloorPlan: RequestHandler = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: req.t('errors.validation.floorPlanIdRequired') });
        return;
      }
      
      if (!req.user?.businessId) {
        res.status(401).json({ error: req.t('errors.server.unauthorized') });
        return;
      }
      
      const floorPlanId = parseInt(id);
      
      if (isNaN(floorPlanId)) {
        res.status(400).json({ error: req.t('errors.validation.invalidFloorPlanId') });
        return;
      }

      const { name, width, height, backgroundImage } = req.body;
      const updateData: any = {};
      
      if (name !== undefined) updateData.name = name;
      if (width !== undefined) {
        if (width < 100 || width > 2000) {
          res.status(400).json({ error: req.t('errors.validation.widthRange') });
          return;
        }
        updateData.width = width;
      }
      if (height !== undefined) {
        if (height < 100 || height > 2000) {
          res.status(400).json({ error: req.t('errors.validation.heightRange') });
          return;
        }
        updateData.height = height;
      }
      if (backgroundImage !== undefined) updateData.backgroundImage = backgroundImage;

      if (Object.keys(updateData).length === 0) {
        res.status(400).json({ error: req.t('errors.validation.noFieldsToUpdate') });
        return;
      }

      logger(`API endpoint PUT /floor-plans/${id} was called`);
      const floorPlan = await FloorPlanService.updateFloorPlan(floorPlanId, req.user.businessId, updateData);
      
      if (!floorPlan) {
        res.status(404).json({ error: req.t('errors.server.floorPlanNotFound') });
        return;
      }

      res.json(floorPlan);
    } catch (error) {
      logger(`Error updating floor plan: ${error}`);
      res.status(500).json({ error: req.t('floorPlan.updateFloorPlan.error') });
    }
  };

  // Delete floor plan
  public static deleteFloorPlan: RequestHandler = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: req.t('errors.validation.floorPlanIdRequired') });
        return;
      }
      
      if (!req.user?.businessId) {
        res.status(401).json({ error: req.t('errors.server.unauthorized') });
        return;
      }
      
      const floorPlanId = parseInt(id);
      
      if (isNaN(floorPlanId)) {
        res.status(400).json({ error: req.t('errors.validation.invalidFloorPlanId') });
        return;
      }

      logger(`API endpoint DELETE /floor-plans/${id} was called`);
      const deleted = await FloorPlanService.deleteFloorPlan(floorPlanId, req.user.businessId);
      
      if (!deleted) {
        res.status(404).json({ error: req.t('errors.server.floorPlanNotFound') });
        return;
      }

      res.json({ message: req.t('floorPlan.deleteFloorPlan.success') });
    } catch (error) {
      logger(`Error deleting floor plan: ${error}`);
      res.status(500).json({ error: req.t('floorPlan.deleteFloorPlan.error') });
    }
  };

  // Update table position
  public static updateTablePosition: RequestHandler = async (req: AuthRequest, res: Response) => {
    try {
      const { floorPlanId, tableId } = req.params;
      
      if (!floorPlanId || !tableId) {
        res.status(400).json({ error: req.t('errors.validation.floorPlanAndTableIdRequired') });
        return;
      }
      
      if (!req.user?.businessId) {
        res.status(401).json({ error: req.t('errors.server.unauthorized') });
        return;
      }
      
      const fpId = parseInt(floorPlanId);
      const tId = parseInt(tableId);
      
      if (isNaN(fpId) || isNaN(tId)) {
        res.status(400).json({ error: req.t('errors.validation.invalidFloorPlanOrTableId') });
        return;
      }

      const { x, y, rotation, width, height } = req.body;
      const positionData: any = {};
      
      if (x !== undefined) {
        if (x < 0) {
          res.status(400).json({ error: req.t('errors.validation.xCoordinateNonNegative') });
          return;
        }
        positionData.x = x;
      }
      if (y !== undefined) {
        if (y < 0) {
          res.status(400).json({ error: req.t('errors.validation.yCoordinateNonNegative') });
          return;
        }
        positionData.y = y;
      }
      if (rotation !== undefined) {
        if (rotation < 0 || rotation > 360) {
          res.status(400).json({ error: req.t('errors.validation.rotationRange') });
          return;
        }
        positionData.rotation = rotation;
      }
      if (width !== undefined) {
        if (width < 20 || width > 200) {
          res.status(400).json({ error: req.t('errors.validation.tableWidthRange') });
          return;
        }
        positionData.width = width;
      }
      if (height !== undefined) {
        if (height < 20 || height > 200) {
          res.status(400).json({ error: req.t('errors.validation.tableHeightRange') });
          return;
        }
        positionData.height = height;
      }

      logger(`API endpoint PUT /floor-plans/${floorPlanId}/tables/${tableId}/position was called`);
      const tablePosition = await FloorPlanService.updateTablePosition(fpId, tId, positionData);
      
      if (!tablePosition) {
        res.status(404).json({ error: req.t('errors.server.floorPlanOrTableNotFound') });
        return;
      }

      res.json(tablePosition);
    } catch (error) {
      logger(`Error updating table position: ${error}`);
      res.status(500).json({ error: req.t('floorPlan.updateTablePosition.error') });
    }
  };

  // Remove table from floor plan
  public static removeTableFromFloorPlan: RequestHandler = async (req: AuthRequest, res: Response) => {
    try {
      const { floorPlanId, tableId } = req.params;
      
      if (!floorPlanId || !tableId) {
        res.status(400).json({ error: req.t('errors.validation.floorPlanAndTableIdRequired') });
        return;
      }
      
      if (!req.user?.businessId) {
        res.status(401).json({ error: req.t('errors.server.unauthorized') });
        return;
      }
      
      const fpId = parseInt(floorPlanId);
      const tId = parseInt(tableId);
      
      if (isNaN(fpId) || isNaN(tId)) {
        res.status(400).json({ error: req.t('errors.validation.invalidFloorPlanOrTableId') });
        return;
      }

      logger(`API endpoint DELETE /floor-plans/${floorPlanId}/tables/${tableId} was called`);
      const removed = await FloorPlanService.removeTableFromFloorPlan(fpId, tId);
      
      if (!removed) {
        res.status(404).json({ error: req.t('errors.server.tablePositionNotFound') });
        return;
      }

      res.json({ message: req.t('floorPlan.removeTableFromFloorPlan.success') });
    } catch (error) {
      logger(`Error removing table from floor plan: ${error}`);
      res.status(500).json({ error: req.t('floorPlan.removeTableFromFloorPlan.error') });
    }
  };

  // Get available tables for floor plan
  public static getAvailableTables: RequestHandler = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: req.t('errors.validation.floorPlanIdRequired') });
        return;
      }
      
      if (!req.user?.businessId) {
        res.status(401).json({ error: req.t('errors.server.unauthorized') });
        return;
      }
      
      const fpId = parseInt(id);
      
      if (isNaN(fpId)) {
        res.status(400).json({ error: req.t('errors.validation.invalidFloorPlanId') });
        return;
      }

      logger(`API endpoint GET /floor-plans/${id}/available-tables was called`);
      const availableTables = await FloorPlanService.getAvailableTables(req.user.businessId, fpId);
      res.json(availableTables);
    } catch (error) {
      logger(`Error getting available tables: ${error}`);
      res.status(500).json({ error: req.t('floorPlan.getAvailableTables.error') });
    }
  };
} 