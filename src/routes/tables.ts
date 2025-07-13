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

// Apply authentication and business type middleware to all table routes
router.use(authenticateToken);
router.use(requireRestaurant);

/**
 * @swagger
 * components:
 *   schemas:
 *     Table:
 *       type: object
 *       required:
 *         - businessId
 *         - tableNumber
 *         - capacity
 *         - status
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated table ID
 *         businessId:
 *           type: integer
 *           description: Business ID (must be restaurant type)
 *         tableNumber:
 *           type: string
 *           description: Table number/name
 *         capacity:
 *           type: integer
 *           description: Maximum number of guests
 *         status:
 *           type: string
 *           enum: [available, occupied, reserved, cleaning, out_of_service]
 *           description: Current table status
 *         section:
 *           type: string
 *           description: Table section (e.g., "patio", "window", "bar")
 *         currentOrderId:
 *           type: integer
 *           nullable: true
 *           description: Current order ID if table is occupied
 *         serverId:
 *           type: integer
 *           nullable: true
 *           description: Assigned waiter/server ID
 *         isActive:
 *           type: boolean
 *           description: Whether table is active
 */

/**
 * @swagger
 * /api/tables:
 *   get:
 *     summary: Get all tables for the business
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, occupied, reserved, cleaning, out_of_service]
 *         description: Filter by table status
 *       - in: query
 *         name: assignedWaiterId
 *         schema:
 *           type: integer
 *         description: Filter by assigned waiter
 *     responses:
 *       200:
 *         description: List of tables
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Table'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Business is not restaurant type
 *       500:
 *         description: Server error
 */
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { status, assignedWaiterId } = req.query;
    const businessId = req.user!.businessId;
    
    // Build query conditions
    const whereClause: any = {
      businessId,
      isActive: true
    };
    
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    
    if (assignedWaiterId) {
      whereClause.serverId = parseInt(assignedWaiterId as string);
    }
    
    // Query tables from database
    const tables = await TableModel.findAll({
      where: whereClause,
      order: [['tableNumber', 'ASC']]
    });
    
    logger(`Found ${tables.length} tables for business ${businessId}${status ? ` with status ${status}` : ''}${assignedWaiterId ? ` assigned to waiter ${assignedWaiterId}` : ''}`);
    
    res.status(200).json({
      data: tables.map(table => ({
        id: table.id,
        businessId: table.businessId,
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
 * /api/tables/{id}:
 *   get:
 *     summary: Get specific table details
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
 *         description: Table details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Table'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Business is not restaurant type
 *       404:
 *         description: Table not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const businessId = req.user!.businessId;
    
    if (!id || isNaN(parseInt(id))) {
      res.status(400).json({ error: 'Invalid table ID' });
      return;
    }
    
    const table = await TableModel.findOne({
      where: { id: parseInt(id), businessId, isActive: true }
    });
    
    if (!table) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }
    
    res.status(200).json({
      data: {
        id: table.id,
        businessId: table.businessId,
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
    logger(`Error getting table: ${error}`);
    res.status(500).json({ error: 'Failed to get table' });
  }
});

/**
 * @swagger
 * /api/tables/{id}/status:
 *   put:
 *     summary: Update table status
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [available, occupied, reserved, cleaning, out_of_service]
 *                 description: New table status
 *     responses:
 *       200:
 *         description: Table status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Table'
 *       400:
 *         description: Invalid status value
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Business is not restaurant type
 *       404:
 *         description: Table not found
 *       500:
 *         description: Server error
 */
router.put('/:id/status', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const businessId = req.user!.businessId;
    
    if (!id || isNaN(parseInt(id))) {
      res.status(400).json({ error: 'Invalid table ID' });
      return;
    }
    
    // Validate status
    if (!status || !Object.values(TableStatus).includes(status)) {
      res.status(400).json({ 
        error: 'Invalid status value',
        validStatuses: Object.values(TableStatus)
      });
      return;
    }
    
    const table = await TableModel.findOne({
      where: { id: parseInt(id), businessId, isActive: true }
    });
    
    if (!table) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }
    
    // Update table status
    await table.update({ status });
    
    logger(`Updated table ${id} status to ${status} for business ${businessId}`);
    
    res.status(200).json({
      data: {
        id: table.id,
        businessId: table.businessId,
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
    logger(`Error updating table status: ${error}`);
    res.status(500).json({ error: 'Failed to update table status' });
  }
});

/**
 * @swagger
 * /api/tables/{id}/assign:
 *   put:
 *     summary: Assign table to waiter
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
 *             required:
 *               - waiterId
 *             properties:
 *               waiterId:
 *                 type: integer
 *                 description: Waiter/Server ID to assign to table
 *     responses:
 *       200:
 *         description: Table assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Table'
 *       400:
 *         description: Invalid waiter ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Business is not restaurant type
 *       404:
 *         description: Table not found
 *       500:
 *         description: Server error
 */
router.put('/:id/assign', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { waiterId } = req.body;
    const businessId = req.user!.businessId;
    
    if (!id || isNaN(parseInt(id))) {
      res.status(400).json({ error: 'Invalid table ID' });
      return;
    }
    
    // Validate waiter ID
    if (!waiterId || isNaN(parseInt(waiterId))) {
      res.status(400).json({ error: 'Valid waiter ID is required' });
      return;
    }
    
    const table = await TableModel.findOne({
      where: { id: parseInt(id), businessId, isActive: true }
    });
    
    if (!table) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }
    
    // Update table assignment
    await table.update({ serverId: parseInt(waiterId) });
    
    logger(`Assigned table ${id} to waiter ${waiterId} for business ${businessId}`);
    
    res.status(200).json({
      data: {
        id: table.id,
        businessId: table.businessId,
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
    logger(`Error assigning table: ${error}`);
    res.status(500).json({ error: 'Failed to assign table' });
  }
});

/**
 * @swagger
 * /api/tables/{id}/clear:
 *   post:
 *     summary: Clear table (reset status, remove orders, etc.)
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
 *         description: Table cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Table'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Business is not restaurant type
 *       404:
 *         description: Table not found
 *       500:
 *         description: Server error
 */
router.post('/:id/clear', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const businessId = req.user!.businessId;
    
    if (!id || isNaN(parseInt(id))) {
      res.status(400).json({ error: 'Invalid table ID' });
      return;
    }
    
    const table = await TableModel.findOne({
      where: { id: parseInt(id), businessId, isActive: true }
    });
    
    if (!table) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }
    
    // Clear table - reset status to available, remove order and server assignment
    await table.update({
      status: TableStatus.AVAILABLE,
      currentOrderId: null,
      serverId: null
    });
    
    logger(`Cleared table ${id} for business ${businessId}`);
    
    res.status(200).json({
      data: {
        id: table.id,
        businessId: table.businessId,
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
    logger(`Error clearing table: ${error}`);
    res.status(500).json({ error: 'Failed to clear table' });
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
 *               - tableNumber
 *               - capacity
 *             properties:
 *               tableNumber:
 *                 type: string
 *                 description: Table number/name
 *               capacity:
 *                 type: integer
 *                 description: Maximum number of guests
 *               section:
 *                 type: string
 *                 description: Table section
 *     responses:
 *       201:
 *         description: Table created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Table'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Business is not restaurant type
 *       500:
 *         description: Server error
 */
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { tableNumber, capacity, section } = req.body;
    const businessId = req.user!.businessId;
    
    // Validate required fields
    if (!tableNumber || !capacity) {
      res.status(400).json({ 
        error: 'Missing required fields: tableNumber and capacity are required' 
      });
      return;
    }
    
    // Check if table number already exists for this business
    const existingTable = await TableModel.findOne({
      where: { businessId, tableNumber }
    });
    
    if (existingTable) {
      res.status(400).json({ 
        error: `Table number ${tableNumber} already exists for this business` 
      });
      return;
    }
    
    // Create new table
    const newTable = await TableModel.create({
      businessId,
      tableNumber,
      capacity: parseInt(capacity),
      section: section || 'Main Floor',
      status: TableStatus.AVAILABLE,
      isActive: true
    });
    
    logger(`Created table ${tableNumber} for business ${businessId} with capacity ${capacity}`);
    
    res.status(201).json({
      data: {
        id: newTable.id,
        businessId: newTable.businessId,
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
 *                 description: Table number/name
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
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Table'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Business is not restaurant type
 *       404:
 *         description: Table not found
 *       500:
 *         description: Server error
 */
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { tableNumber, capacity, status, section, isActive } = req.body;
    const businessId = req.user!.businessId;
    
    if (!id || isNaN(parseInt(id))) {
      res.status(400).json({ error: 'Invalid table ID' });
      return;
    }
    
    // Find the table
    const table = await TableModel.findOne({
      where: { id: parseInt(id), businessId }
    });
    
    if (!table) {
      res.status(404).json({ error: 'Table not found' });
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
    
    logger(`Updated table ${id} for business ${businessId}`);
    
    res.status(200).json({
      data: {
        id: table.id,
        businessId: table.businessId,
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Business is not restaurant type
 *       404:
 *         description: Table not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const businessId = req.user!.businessId;
    
    if (!id || isNaN(parseInt(id))) {
      res.status(400).json({ error: 'Invalid table ID' });
      return;
    }
    
    // Find the table
    const table = await TableModel.findOne({
      where: { id: parseInt(id), businessId }
    });
    
    if (!table) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }
    
    // Delete table
    await table.destroy();
    
    logger(`Deleted table ${id} for business ${businessId}`);
    
    res.status(200).json({ message: 'Table deleted successfully' });
  } catch (error) {
    logger(`Error deleting table: ${error}`);
    res.status(500).json({ error: 'Failed to delete table' });
  }
});

export default router;