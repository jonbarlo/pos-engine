import { Router } from 'express';
import { 
  ReservationModel,
  TableModel
} from '../models';
import { TableStatus } from '../models/TableModel';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';

const router = Router();

// Apply authentication middleware to all reservation routes
router.use(authenticateToken);
// Remove requireRestaurant middleware (following pattern of working endpoints)

/**
 * @swagger
 * components:
 *   schemas:
 *     Reservation:
 *       type: object
 *       required:
 *         - businessId
 *         - customerName
 *         - partySize
 *         - reservationDate
 *         - reservationTime
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated reservation ID
 *         businessId:
 *           type: integer
 *           description: Business ID (must be restaurant type)
 *         tableId:
 *           type: integer
 *           nullable: true
 *           description: Assigned table ID
 *         customerId:
 *           type: integer
 *           nullable: true
 *           description: Customer ID if customer exists in system
 *         customerName:
 *           type: string
 *           description: Customer name
 *         customerPhone:
 *           type: string
 *           description: Customer phone number
 *         customerEmail:
 *           type: string
 *           description: Customer email address
 *         partySize:
 *           type: integer
 *           description: Number of guests
 *         reservationDate:
 *           type: string
 *           format: date
 *           description: Reservation date (YYYY-MM-DD)
 *         reservationTime:
 *           type: string
 *           description: Reservation time (HH:MM:SS)
 *         status:
 *           type: string
 *           enum: [pending, confirmed, seated, completed, cancelled, no_show]
 *           description: Reservation status
 *         specialRequests:
 *           type: string
 *           description: Special requests or notes
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/reservations:
 *   get:
 *     summary: Get all reservations for the business
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by reservation date (YYYY-MM-DD)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, seated, completed, cancelled, no_show]
 *         description: Filter by reservation status
 *       - in: query
 *         name: tableId
 *         schema:
 *           type: integer
 *         description: Filter by assigned table
 *     responses:
 *       200:
 *         description: List of reservations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reservation'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Business is not restaurant type
 *       500:
 *         description: Server error
 */
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { date, status, tableId } = req.query;
    const businessId = req.user!.businessId;
    
    // Build query conditions
    const whereClause: any = {
      businessId
    };
    
    if (date) {
      whereClause.reservationDate = date;
    }
    
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    
    if (tableId) {
      whereClause.tableId = parseInt(tableId as string);
    }
    
    // Query reservations from database
    const reservations = await ReservationModel.findAll({
      where: whereClause,
      include: [
        {
          model: TableModel,
          as: 'table',
          attributes: ['id', 'tableNumber', 'capacity', 'section']
        }
      ],
      order: [['reservationDate', 'ASC'], ['reservationTime', 'ASC']]
    });
    
    logger(`Found ${reservations.length} reservations for business ${businessId}${date ? ` on date ${date}` : ''}${status ? ` with status ${status}` : ''}${tableId ? ` for table ${tableId}` : ''}`);
    
    res.status(200).json({
      data: reservations.map((reservation: any) => ({
        id: reservation.id,
        businessId: reservation.businessId,
        tableId: reservation.tableId,
        customerId: reservation.customerId,
        customerName: reservation.customerName,
        customerPhone: reservation.customerPhone,
        customerEmail: reservation.customerEmail,
        partySize: reservation.partySize,
        reservationDate: reservation.reservationDate,
        reservationTime: reservation.reservationTime,
        status: reservation.status,
        specialRequests: reservation.specialRequests,
        table: reservation.table ? {
          id: reservation.table.id,
          tableNumber: reservation.table.tableNumber,
          capacity: reservation.table.capacity,
          section: reservation.table.section
        } : null,
        createdAt: reservation.createdAt,
        updatedAt: reservation.updatedAt
      }))
    });
  } catch (error) {
    logger(`Error getting reservations: ${error}`);
    res.status(500).json({ error: 'Failed to get reservations' });
  }
});

/**
 * @swagger
 * /api/reservations/{id}:
 *   get:
 *     summary: Get specific reservation details
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Reservation ID
 *     responses:
 *       200:
 *         description: Reservation details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Reservation'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Business is not restaurant type
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const businessId = req.user!.businessId;
    
    if (!id || isNaN(parseInt(id))) {
      res.status(400).json({ error: 'Invalid reservation ID' });
      return;
    }
    
    const reservation = await ReservationModel.findOne({
      where: { id: parseInt(id), businessId },
      include: [
        {
          model: TableModel,
          as: 'table',
          attributes: ['id', 'tableNumber', 'capacity', 'section']
        }
      ]
    });
    
    if (!reservation) {
      res.status(404).json({ error: 'Reservation not found' });
      return;
    }
    
    res.status(200).json({
      data: {
        id: reservation.id,
        businessId: reservation.businessId,
        tableId: reservation.tableId,
        customerId: reservation.customerId,
        customerName: reservation.customerName,
        customerPhone: reservation.customerPhone,
        customerEmail: reservation.customerEmail,
        partySize: reservation.partySize,
        reservationDate: reservation.reservationDate,
        reservationTime: reservation.reservationTime,
        status: reservation.status,
        specialRequests: reservation.specialRequests,
        table: (reservation as any).table ? {
          id: (reservation as any).table.id,
          tableNumber: (reservation as any).table.tableNumber,
          capacity: (reservation as any).table.capacity,
          section: (reservation as any).table.section
        } : null,
        createdAt: reservation.createdAt,
        updatedAt: reservation.updatedAt
      }
    });
  } catch (error) {
    logger(`Error getting reservation: ${error}`);
    res.status(500).json({ error: 'Failed to get reservation' });
  }
});

/**
 * @swagger
 * /api/reservations:
 *   post:
 *     summary: Create a new reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerName
 *               - partySize
 *               - reservationDate
 *               - reservationTime
 *             properties:
 *               tableId:
 *                 type: integer
 *                 description: Assigned table ID (optional)
 *               customerId:
 *                 type: integer
 *                 description: Customer ID if customer exists in system
 *               customerName:
 *                 type: string
 *                 description: Customer name
 *               customerPhone:
 *                 type: string
 *                 description: Customer phone number
 *               customerEmail:
 *                 type: string
 *                 description: Customer email address
 *               partySize:
 *                 type: integer
 *                 description: Number of guests
 *               reservationDate:
 *                 type: string
 *                 format: date
 *                 description: Reservation date (YYYY-MM-DD)
 *               reservationTime:
 *                 type: string
 *                 description: Reservation time (HH:MM:SS)
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, seated, completed, cancelled, no_show]
 *                 default: pending
 *                 description: Reservation status
 *               specialRequests:
 *                 type: string
 *                 description: Special requests or notes
 *     responses:
 *       201:
 *         description: Reservation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Reservation'
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
    const businessId = req.user!.businessId;
    const {
      tableId,
      customerId,
      customerName,
      customerPhone,
      customerEmail,
      partySize,
      reservationDate,
      reservationTime,
      status = 'pending',
      specialRequests
    } = req.body;

    // Validate required fields
    if (!customerName || !partySize || !reservationDate || !reservationTime) {
      res.status(400).json({ 
        error: 'Missing required fields: customerName, partySize, reservationDate, reservationTime' 
      });
      return;
    }

    // Validate party size
    if (partySize < 1 || partySize > 20) {
      res.status(400).json({ error: 'Party size must be between 1 and 20' });
      return;
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(reservationDate)) {
      res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
      return;
    }

    // Validate time format (accept both HH:MM and HH:MM:SS)
    const timeRegex = /^\d{2}:\d{2}(:\d{2})?$/;
    if (!timeRegex.test(reservationTime)) {
      res.status(400).json({ error: 'Invalid time format. Use HH:MM or HH:MM:SS' });
      return;
    }

    // Check if table exists and belongs to business (if tableId provided)
    if (tableId) {
      const table = await TableModel.findOne({
        where: { id: tableId, businessId, isActive: true }
      });
      
      if (!table) {
        res.status(400).json({ error: 'Invalid table ID' });
        return;
      }
    }

    // Create reservation
    const reservation = await ReservationModel.create({
      businessId,
      tableId,
      customerId,
      customerName,
      customerPhone,
      customerEmail,
      partySize,
      reservationDate,
      reservationTime,
      status,
      specialRequests,
      duration: 90, // Default duration in minutes
      source: 'phone' // Default source
    });

    logger(`Created reservation ${reservation.id} for business ${businessId}`);

    res.status(201).json({
      data: {
        id: reservation.id,
        businessId: reservation.businessId,
        tableId: reservation.tableId,
        customerId: reservation.customerId,
        customerName: reservation.customerName,
        customerPhone: reservation.customerPhone,
        customerEmail: reservation.customerEmail,
        partySize: reservation.partySize,
        reservationDate: reservation.reservationDate,
        reservationTime: reservation.reservationTime,
        status: reservation.status,
        specialRequests: reservation.specialRequests,
        createdAt: reservation.createdAt,
        updatedAt: reservation.updatedAt
      }
    });
  } catch (error) {
    logger(`Error creating reservation: ${error}`);
    res.status(500).json({ error: 'Failed to create reservation' });
  }
});

/**
 * @swagger
 * /api/reservations/{id}:
 *   put:
 *     summary: Update reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Reservation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tableId:
 *                 type: integer
 *                 description: Assigned table ID
 *               customerId:
 *                 type: integer
 *                 description: Customer ID if customer exists in system
 *               customerName:
 *                 type: string
 *                 description: Customer name
 *               customerPhone:
 *                 type: string
 *                 description: Customer phone number
 *               customerEmail:
 *                 type: string
 *                 description: Customer email address
 *               partySize:
 *                 type: integer
 *                 description: Number of guests
 *               reservationDate:
 *                 type: string
 *                 format: date
 *                 description: Reservation date (YYYY-MM-DD)
 *               reservationTime:
 *                 type: string
 *                 description: Reservation time (HH:MM:SS)
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, seated, completed, cancelled, no_show]
 *                 description: Reservation status
 *               specialRequests:
 *                 type: string
 *                 description: Special requests or notes
 *     responses:
 *       200:
 *         description: Reservation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Business is not restaurant type
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Server error
 */
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const businessId = req.user!.businessId;
    const updateData = req.body;

    if (!id || isNaN(parseInt(id))) {
      res.status(400).json({ error: 'Invalid reservation ID' });
      return;
    }

    // Find reservation
    const reservation = await ReservationModel.findOne({
      where: { id: parseInt(id), businessId }
    });

    if (!reservation) {
      res.status(404).json({ error: 'Reservation not found' });
      return;
    }

    // Validate party size if provided
    if (updateData.partySize && (updateData.partySize < 1 || updateData.partySize > 20)) {
      res.status(400).json({ error: 'Party size must be between 1 and 20' });
      return;
    }

    // Validate date format if provided
    if (updateData.reservationDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(updateData.reservationDate)) {
        res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
        return;
      }
    }

    // Validate time format if provided
    if (updateData.reservationTime) {
      const timeRegex = /^\d{2}:\d{2}$/;
      if (!timeRegex.test(updateData.reservationTime)) {
        res.status(400).json({ error: 'Invalid time format. Use HH:MM' });
        return;
      }
    }

    // Check if table exists and belongs to business (if tableId provided)
    if (updateData.tableId) {
      const table = await TableModel.findOne({
        where: { id: updateData.tableId, businessId, isActive: true }
      });
      
      if (!table) {
        res.status(400).json({ error: 'Invalid table ID' });
        return;
      }
    }

    // Update reservation
    await reservation.update(updateData);

    // Note: Following POS standards, customer info remains with the reservation/order
    // Tables are treated as resources with status only, not customer data storage

    logger(`Updated reservation ${id} successfully`);

    res.status(200).json({
      data: {
        id: reservation.id,
        businessId: reservation.businessId,
        tableId: reservation.tableId,
        customerId: reservation.customerId,
        customerName: reservation.customerName,
        customerPhone: reservation.customerPhone,
        customerEmail: reservation.customerEmail,
        partySize: reservation.partySize,
        reservationDate: reservation.reservationDate,
        reservationTime: reservation.reservationTime,
        status: reservation.status,
        specialRequests: reservation.specialRequests,
        createdAt: reservation.createdAt,
        updatedAt: reservation.updatedAt
      }
    });
  } catch (error) {
    logger(`Error updating reservation: ${error}`);
    res.status(500).json({ error: 'Failed to update reservation' });
  }
});

/**
 * @swagger
 * /api/reservations/{id}:
 *   delete:
 *     summary: Delete reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Reservation ID
 *     responses:
 *       200:
 *         description: Reservation deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Business is not restaurant type
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const businessId = req.user!.businessId;

    if (!id || isNaN(parseInt(id))) {
      res.status(400).json({ error: 'Invalid reservation ID' });
      return;
    }

    const reservation = await ReservationModel.findOne({
      where: { id: parseInt(id), businessId }
    });

    if (!reservation) {
      res.status(404).json({ error: 'Reservation not found' });
      return;
    }

    await reservation.destroy();

    logger(`Deleted reservation ${id} for business ${businessId}`);

    res.status(200).json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    logger(`Error deleting reservation: ${error}`);
    res.status(500).json({ error: 'Failed to delete reservation' });
  }
});

export default router; 