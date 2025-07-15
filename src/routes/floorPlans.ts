import { Router } from 'express';
import { FloorPlanController } from '../controllers/floorPlanController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all floor plan routes
router.use(authenticateToken);

/**
 * @swagger
 * /api/floor-plans:
 *   get:
 *     summary: Get all floor plans for the current business
 *     tags: [Floor Plans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of floor plans
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   width:
 *                     type: integer
 *                   height:
 *                     type: integer
 *                   backgroundImage:
 *                     type: string
 *                   isActive:
 *                     type: boolean
 *       401:
 *         description: Unauthorized
 */
router.get('/', FloorPlanController.getFloorPlans);

/**
 * @swagger
 * /api/floor-plans:
 *   post:
 *     summary: Create a new floor plan
 *     tags: [Floor Plans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Main Floor"
 *               width:
 *                 type: integer
 *                 example: 800
 *               height:
 *                 type: integer
 *                 example: 600
 *               backgroundImage:
 *                 type: string
 *                 example: "https://example.com/floor-plan-bg.jpg"
 *     responses:
 *       201:
 *         description: Floor plan created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/', FloorPlanController.createFloorPlan);

/**
 * @swagger
 * /api/floor-plans/{id}:
 *   get:
 *     summary: Get floor plan by ID
 *     tags: [Floor Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Floor plan details
 *       404:
 *         description: Floor plan not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', FloorPlanController.getFloorPlanById);

/**
 * @swagger
 * /api/floor-plans/{id}/tables:
 *   get:
 *     summary: Get floor plan with table positions
 *     tags: [Floor Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Floor plan with table positions
 *       404:
 *         description: Floor plan not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id/tables', FloorPlanController.getFloorPlanWithTables);

/**
 * @swagger
 * /api/floor-plans/{id}/available-tables:
 *   get:
 *     summary: Get available tables for floor plan
 *     tags: [Floor Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Available tables
 *       401:
 *         description: Unauthorized
 */
router.get('/:id/available-tables', FloorPlanController.getAvailableTables);

/**
 * @swagger
 * /api/floor-plans/{id}:
 *   put:
 *     summary: Update floor plan
 *     tags: [Floor Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               width:
 *                 type: integer
 *               height:
 *                 type: integer
 *               backgroundImage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Floor plan updated successfully
 *       404:
 *         description: Floor plan not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', FloorPlanController.updateFloorPlan);

/**
 * @swagger
 * /api/floor-plans/{id}:
 *   delete:
 *     summary: Delete floor plan
 *     tags: [Floor Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Floor plan deleted successfully
 *       404:
 *         description: Floor plan not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', FloorPlanController.deleteFloorPlan);

/**
 * @swagger
 * /api/floor-plans/{floorPlanId}/tables/{tableId}/position:
 *   put:
 *     summary: Update table position on floor plan
 *     tags: [Floor Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: floorPlanId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: tableId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               x:
 *                 type: integer
 *                 example: 100
 *               y:
 *                 type: integer
 *                 example: 150
 *               rotation:
 *                 type: integer
 *                 example: 0
 *               width:
 *                 type: integer
 *                 example: 80
 *               height:
 *                 type: integer
 *                 example: 60
 *     responses:
 *       200:
 *         description: Table position updated successfully
 *       404:
 *         description: Floor plan or table not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:floorPlanId/tables/:tableId/position', FloorPlanController.updateTablePosition);

/**
 * @swagger
 * /api/floor-plans/{floorPlanId}/tables/{tableId}:
 *   delete:
 *     summary: Remove table from floor plan
 *     tags: [Floor Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: floorPlanId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: tableId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Table removed from floor plan successfully
 *       404:
 *         description: Table position not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:floorPlanId/tables/:tableId', FloorPlanController.removeTableFromFloorPlan);

export default router; 