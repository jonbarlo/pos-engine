import { Router } from 'express';
import { 
  TableModel, 
  TableStatus 
} from '../models';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { requireRestaurant } from '../middleware/restaurantCheck';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';

const router = Router();

// Apply business type middleware to all table routes
router.use(requireRestaurant);

/**
 * @swagger
 * components:
 *   schemas:
 *     Table:
 *       type: object
 *       required:
 *         - businessId
 *         - name
 *         - capacity
 *         - status
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated table ID
 *         businessId:
 *           type: integer
 *           description: Business ID (must be restaurant type)
 *         name:
 *           type: string
 *           description: Table name/number
 *         capacity:
 *           type: integer
 *           description: Maximum number of guests
 *         status:
 *           type: string
 *           enum: [available, occupied, reserved, maintenance]
 *           description: Current table status
 *         location:
 *           type: string
 *           description: Table location (e.g., "patio", "window", "bar")
 *         notes:
 *           type: string
 *           description: Additional notes about the table
 */

/**
 * @swagger
 * /api/tables:
 *   get:
 *     summary: Get all tables for a restaurant business
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: businessId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant business ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, occupied, reserved, maintenance]
 *         description: Filter by table status
 *     responses:
 *       200:
 *         description: List of tables
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Table'
 *       403:
 *         description: Business is not restaurant type
 *       500:
 *         description: Server error
 */
router.get('/', requireRestaurant, async (req, res) => {
  try {
    const { businessId, status } = req.query;
    
    // Build query conditions
    const whereClause: any = {
      businessId: parseInt(businessId as string)
    };
    
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    
    // Query tables from database
    const tables = await TableModel.findAll({
      where: whereClause,
      order: [['tableNumber', 'ASC']]
    });
    
    logger(`Found ${tables.length} tables for business ${businessId}${status ? ` with status ${status}` : ''}`);
    
    res.status(200).json({
      message: 'Tables retrieved successfully',
      count: tables.length,
      tables: tables.map(table => ({
        id: table.id,
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        status: table.status,
        section: table.section,
        currentOrderId: table.currentOrderId,
        serverId: table.serverId,
        isActive: table.isActive,
        createdAt: table.createdAt,
        updatedAt: table.updatedAt
      }))
    });
  } catch (error) {
    logger(`Error getting tables: ${error}`);
    res.status(500).json({ error: 'Failed to get tables' });
  }
});

/**
 * @swagger
 * /api/tables:
 *   post:
 *     summary: Create a new table for a restaurant business
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessId
 *               - name
 *               - capacity
 *             properties:
 *               businessId:
 *                 type: integer
 *                 description: Restaurant business ID
 *               name:
 *                 type: string
 *                 description: Table name/number
 *               capacity:
 *                 type: integer
 *                 description: Maximum number of guests
 *               location:
 *                 type: string
 *                 description: Table location
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *     responses:
 *       201:
 *         description: Table created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Table'
 *       403:
 *         description: Business is not restaurant type
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
router.post('/', requireRestaurant, async (req, res) => {
  try {
    const { businessId, tableNumber, capacity, section, notes } = req.body;
    
    // Validate required fields
    if (!businessId || !tableNumber || !capacity) {
      res.status(400).json({ 
        error: 'Missing required fields: businessId, tableNumber, and capacity are required' 
      });
      return;
    }
    
    // Check if table number already exists for this business
    const existingTable = await TableModel.findOne({
      where: { businessId: parseInt(businessId), tableNumber }
    });
    
    if (existingTable) {
      res.status(400).json({ 
        error: `Table number ${tableNumber} already exists for this business` 
      });
      return;
    }
    
    // Create new table
    const newTable = await TableModel.create({
      businessId: parseInt(businessId),
      tableNumber,
      capacity: parseInt(capacity),
      section: section || 'Main Floor',
      status: TableStatus.AVAILABLE,
      isActive: true
    });
    
    logger(`Created table ${tableNumber} for business ${businessId} with capacity ${capacity}`);
    
    res.status(201).json({
      message: 'Table created successfully',
      table: {
        id: newTable.id,
        tableNumber: newTable.tableNumber,
        capacity: newTable.capacity,
        status: newTable.status,
        section: newTable.section,
        currentOrderId: newTable.currentOrderId,
        serverId: newTable.serverId,
        isActive: newTable.isActive,
        createdAt: newTable.createdAt,
        updatedAt: newTable.updatedAt
      }
    });
  } catch (error) {
    logger(`Error creating table: ${error}`);
    res.status(500).json({ error: 'Failed to create table' });
  }
});

/**
 * @swagger
 * /api/tables/{id}:
 *   put:
 *     summary: Update a table for a restaurant business
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Table ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tableNumber:
 *                 type: string
 *                 description: Table name/number
 *               capacity:
 *                 type: integer
 *                 description: Maximum number of guests
 *               status:
 *                 type: string
 *                 enum: [available, occupied, reserved, cleaning, out_of_service]
 *                 description: Table status
 *               section:
 *                 type: string
 *                 description: Table section
 *               isActive:
 *                 type: boolean
 *                 description: Whether table is active
 *     responses:
 *       200:
 *         description: Table updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Table'
 *       403:
 *         description: Business is not restaurant type
 *       404:
 *         description: Table not found
 *       500:
 *         description: Server error
 */
router.put('/:id', requireRestaurant, async (req, res) => {
  try {
    const { id } = req.params;
    const { tableNumber, capacity, status, section, isActive } = req.body;
    
    // Find the table
    const table = await TableModel.findByPk(id);
    
    if (!table) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }
    
    // Check if table belongs to a restaurant business
    if (req.businessType !== 'restaurant') {
      res.status(403).json({ 
        error: 'Feature not available',
        message: 'This feature is only available for restaurant businesses',
        requiredType: 'restaurant'
      });
      return;
    }
    
    // Update table
    const updateData: any = {};
    if (tableNumber !== undefined) updateData.tableNumber = tableNumber;
    if (capacity !== undefined) updateData.capacity = parseInt(capacity);
    if (status !== undefined) updateData.status = status;
    if (section !== undefined) updateData.section = section;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    await table.update(updateData);
    
    logger(`Updated table ${id} for business ${table.businessId}`);
    
    res.status(200).json({
      message: 'Table updated successfully',
      table: {
        id: table.id,
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        status: table.status,
        section: table.section,
        currentOrderId: table.currentOrderId,
        serverId: table.serverId,
        isActive: table.isActive,
        createdAt: table.createdAt,
        updatedAt: table.updatedAt
      }
    });
  } catch (error) {
    logger(`Error updating table: ${error}`);
    res.status(500).json({ error: 'Failed to update table' });
  }
});

/**
 * @swagger
 * /api/tables/{id}:
 *   delete:
 *     summary: Delete a table for a restaurant business
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Table ID
 *     responses:
 *       200:
 *         description: Table deleted successfully
 *       403:
 *         description: Business is not restaurant type
 *       404:
 *         description: Table not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', requireRestaurant, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the table
    const table = await TableModel.findByPk(id);
    
    if (!table) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }
    
    // Check if table belongs to a restaurant business
    if (req.businessType !== 'restaurant') {
      res.status(403).json({ 
        error: 'Feature not available',
        message: 'This feature is only available for restaurant businesses',
        requiredType: 'restaurant'
      });
      return;
    }
    
    // Delete table
    await table.destroy();
    
    logger(`Deleted table ${id} for business ${table.businessId}`);
    
    res.status(200).json({ message: 'Table deleted successfully' });
  } catch (error) {
    logger(`Error deleting table: ${error}`);
    res.status(500).json({ error: 'Failed to delete table' });
  }
});

export default router;