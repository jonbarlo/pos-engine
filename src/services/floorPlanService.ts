import { FloorPlanModel, FloorPlanAttributes, FloorPlanCreationAttributes } from '../models/FloorPlanModel';
import { TablePositionModel, TablePositionAttributes } from '../models/TablePositionModel';
import { TableModel } from '../models/TableModel';
import { logger } from '../utils/logger';

export class FloorPlanService {
  // Create a new floor plan
  static async createFloorPlan(businessId: number, floorPlanData: FloorPlanCreationAttributes): Promise<FloorPlanAttributes> {
    try {
      logger(`Creating floor plan for business: ${businessId}`);
      const floorPlan = await FloorPlanModel.create({
        ...floorPlanData,
        businessId
      });
      logger(`Floor plan created successfully with ID: ${floorPlan.id}`);
      return floorPlan;
    } catch (error) {
      logger(`Error creating floor plan: ${error}`);
      throw error;
    }
  }

  // Get all floor plans for a business
  static async getFloorPlans(businessId: number): Promise<FloorPlanAttributes[]> {
    try {
      logger(`Getting floor plans for business: ${businessId}`);
      return await FloorPlanModel.findAll({
        where: { businessId, isActive: true },
        order: [['name', 'ASC']]
      });
    } catch (error) {
      logger(`Error getting floor plans: ${error}`);
      throw error;
    }
  }

  // Get floor plan by ID
  static async getFloorPlanById(id: number, businessId: number): Promise<FloorPlanAttributes | null> {
    try {
      logger(`Getting floor plan ${id} for business: ${businessId}`);
      return await FloorPlanModel.findOne({
        where: { id, businessId, isActive: true }
      });
    } catch (error) {
      logger(`Error getting floor plan: ${error}`);
      throw error;
    }
  }

  // Update floor plan
  static async updateFloorPlan(id: number, businessId: number, updateData: Partial<FloorPlanAttributes>): Promise<FloorPlanAttributes | null> {
    try {
      logger(`Updating floor plan ${id} for business: ${businessId}`);
      const floorPlan = await FloorPlanModel.findOne({
        where: { id, businessId, isActive: true }
      });
      
      if (!floorPlan) {
        return null;
      }
      
      await floorPlan.update(updateData);
      logger(`Floor plan updated successfully: ${id}`);
      return floorPlan;
    } catch (error) {
      logger(`Error updating floor plan: ${error}`);
      throw error;
    }
  }

  // Delete floor plan (soft delete)
  static async deleteFloorPlan(id: number, businessId: number): Promise<boolean> {
    try {
      logger(`Deleting floor plan ${id} for business: ${businessId}`);
      const floorPlan = await FloorPlanModel.findOne({
        where: { id, businessId, isActive: true }
      });
      
      if (!floorPlan) {
        return false;
      }
      
      await floorPlan.update({ isActive: false });
      logger(`Floor plan deleted successfully: ${id}`);
      return true;
    } catch (error) {
      logger(`Error deleting floor plan: ${error}`);
      throw error;
    }
  }

  // Get floor plan with table positions
  static async getFloorPlanWithTables(id: number, businessId: number): Promise<any> {
    try {
      logger(`Getting floor plan ${id} with tables for business: ${businessId}`);
      
      const floorPlan = await FloorPlanModel.findOne({
        where: { id, businessId, isActive: true }
      });

      if (!floorPlan) {
        return null;
      }

      const tablePositions = await TablePositionModel.findAll({
        where: { floorPlanId: id },
        include: [
          {
            model: TableModel,
            as: 'table',
            attributes: ['id', 'tableNumber', 'capacity', 'status', 'section']
          }
        ],
        order: [['table', 'tableNumber', 'ASC']]
      });

      return {
        ...floorPlan.toJSON(),
        tablePositions: tablePositions.map((tp: any) => ({
          id: tp.id,
          x: tp.x,
          y: tp.y,
          rotation: tp.rotation,
          width: tp.width,
          height: tp.height,
          table: tp.table
        }))
      };
    } catch (error) {
      logger(`Error getting floor plan with tables: ${error}`);
      throw error;
    }
  }

  // Update table position
  static async updateTablePosition(
    floorPlanId: number, 
    tableId: number, 
    positionData: Partial<TablePositionAttributes>
  ): Promise<TablePositionAttributes | null> {
    try {
      logger(`Updating table position for table ${tableId} on floor plan ${floorPlanId}`);
      
      const [tablePosition, created] = await TablePositionModel.findOrCreate({
        where: { floorPlanId, tableId },
        defaults: {
          floorPlanId,
          tableId,
          x: 0,
          y: 0,
          rotation: 0,
          width: 80,
          height: 60
        }
      });

      if (!created) {
        await tablePosition.update(positionData);
      } else if (Object.keys(positionData).length > 0) {
        await tablePosition.update(positionData);
      }

      logger(`Table position updated successfully`);
      return tablePosition;
    } catch (error) {
      logger(`Error updating table position: ${error}`);
      throw error;
    }
  }

  // Remove table from floor plan
  static async removeTableFromFloorPlan(floorPlanId: number, tableId: number): Promise<boolean> {
    try {
      logger(`Removing table ${tableId} from floor plan ${floorPlanId}`);
      
      const deleted = await TablePositionModel.destroy({
        where: { floorPlanId, tableId }
      });

      logger(`Table removed from floor plan: ${deleted > 0}`);
      return deleted > 0;
    } catch (error) {
      logger(`Error removing table from floor plan: ${error}`);
      throw error;
    }
  }

  // Get available tables for floor plan
  static async getAvailableTables(businessId: number, floorPlanId: number): Promise<any[]> {
    try {
      logger(`Getting available tables for floor plan ${floorPlanId}`);
      
      const positionedTableIds = await TablePositionModel.findAll({
        where: { floorPlanId },
        attributes: ['tableId']
      });

      const positionedIds = positionedTableIds.map(tp => tp.tableId);

      return await TableModel.findAll({
        where: {
          businessId,
          isActive: true,
          id: {
            [require('sequelize').Op.notIn]: positionedIds
          }
        },
        attributes: ['id', 'tableNumber', 'capacity', 'status', 'section'],
        order: [['tableNumber', 'ASC']]
      });
    } catch (error) {
      logger(`Error getting available tables: ${error}`);
      throw error;
    }
  }
} 