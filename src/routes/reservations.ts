import { Router } from 'express';
import { 
  ReservationModel, 
  TableModel, 
  CustomerModel 
} from '../models';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';

const router = Router();

/**
 * @swagger
 * /api/reservations:
 *   get:
 *     summary: Get all reservations for the current business
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
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
 *         description: Filter by table ID
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: integer
 *         description: Filter by customer ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by customer name, phone, or email
 *     responses:
 *       200:
 *         description: List of reservations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reservation'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *               - customerPhone
 *               - partySize
 *               - reservationDate
 *               - reservationTime
 *             properties:
 *               tableId:
 *                 type: integer
 *                 description: Table ID (optional)
 *               customerId:
 *                 type: integer
 *                 description: Customer ID (optional)
 *               customerName:
 *                 type: string
 *                 example: John Doe
 *               customerEmail:
 *                 type: string
 *                 example: john@example.com
 *               customerPhone:
 *                 type: string
 *                 example: +1234567890
 *               partySize:
 *                 type: integer
 *                 example: 4
 *               reservationDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-07-10
 *               reservationTime:
 *                 type: string
 *                 example: 19:00
 *               duration:
 *                 type: integer
 *                 example: 90
 *               specialRequests:
 *                 type: string
 *                 example: Window seat
 *               notes:
 *                 type: string
 *                 example: Anniversary dinner
 *               source:
 *                 type: string
 *                 enum: [phone, online, walk_in]
 *                 example: phone
 *     responses:
 *       201:
 *         description: Reservation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Reservation'
 *                 message:
 *                   type: string
 *                   example: Reservation created successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * /api/reservations/{id}:
 *   get:
 *     summary: Get a specific reservation by ID
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
 *         description: Reservation retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Reservation'
 *       404:
 *         description: Reservation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// Get all reservations for a business
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const businessId = req.user?.businessId;
    const { 
      page = 1, 
      limit = 20, 
      date, 
      status, 
      tableId, 
      customerId,
      search 
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const whereClause: any = { businessId };

    // Filter by date
    if (date) {
      whereClause.reservationDate = date;
    }

    // Filter by status
    if (status) {
      whereClause.status = status;
    }

    // Filter by table
    if (tableId) {
      whereClause.tableId = tableId;
    }

    // Filter by customer
    if (customerId) {
      whereClause.customerId = customerId;
    }

    // Search by customer name or phone
    if (search) {
      whereClause[Op.or] = [
        { customerName: { [Op.like]: `%${search}%` } },
        { customerPhone: { [Op.like]: `%${search}%` } },
        { customerEmail: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: reservations } = await ReservationModel.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: TableModel,
          as: 'table',
          attributes: ['id', 'tableNumber', 'capacity', 'section']
        },
        {
          model: CustomerModel,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ],
      order: [
        ['reservationDate', 'ASC'],
        ['reservationTime', 'ASC']
      ],
      limit: Number(limit),
      offset
    });

    logger(`Found ${reservations.length} reservations for business ${businessId}`);

    res.json({
      success: true,
      data: reservations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil(count / Number(limit))
      }
    });
  } catch (error) {
    logger(`Error getting reservations: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get reservations'
    });
  }
});

// Get a specific reservation
router.get('/:id', authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { id } = req.params;

    const reservation = await ReservationModel.findOne({
      where: { id, businessId },
      include: [
        {
          model: TableModel,
          as: 'table',
          attributes: ['id', 'tableNumber', 'capacity', 'section']
        },
        {
          model: CustomerModel,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ]
    });

    if (!reservation) {
      res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
      return;
    }

    res.json({
      success: true,
      data: reservation
    });
  } catch (error) {
    logger(`Error getting reservation: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get reservation'
    });
  }
});

// Create a new reservation
router.post('/', authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const {
      tableId,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      partySize,
      reservationDate,
      reservationTime,
      duration = 90,
      specialRequests,
      notes,
      source = 'phone'
    } = req.body;

    // Validate required fields
    if (!customerName || !customerPhone || !partySize || !reservationDate || !reservationTime) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: customerName, customerPhone, partySize, reservationDate, reservationTime'
      });
      return;
    }

    // Check for overlapping reservations if table is specified
    if (tableId) {
      const existingReservations = await ReservationModel.findAll({
        where: {
          businessId,
          tableId,
          reservationDate,
          status: ['pending', 'confirmed', 'seated']
        }
      });

      // Check for overlaps with any existing reservation
      for (const existingReservation of existingReservations) {
        const [hours, minutes] = reservationTime.split(':').map(Number);
        const newReservationTime = new Date(reservationDate);
        newReservationTime.setHours(hours, minutes, 0, 0);

        const [existingHours, existingMinutes] = existingReservation.reservationTime.split(':').map(Number);
        const existingReservationTime = new Date(existingReservation.reservationDate);
        existingReservationTime.setHours(existingHours || 0, existingMinutes || 0, 0, 0);

        const newEndTime = new Date(newReservationTime);
        newEndTime.setMinutes(newEndTime.getMinutes() + duration);

        const existingEndTime = new Date(existingReservationTime);
        existingEndTime.setMinutes(existingEndTime.getMinutes() + existingReservation.duration);

        if (newReservationTime < existingEndTime && newEndTime > existingReservationTime) {
          res.status(409).json({
            success: false,
            message: 'Table is already reserved for this time period'
          });
          return;
        }
      }
    }

    const reservation = await ReservationModel.create({
      businessId,
      tableId,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      partySize,
      reservationDate,
      reservationTime,
      duration,
      specialRequests,
      notes,
      source
    });

    logger(`Created reservation ${reservation.id} for business ${businessId}`);

    res.status(201).json({
      success: true,
      data: reservation,
      message: 'Reservation created successfully'
    });
  } catch (error) {
    logger(`Error creating reservation: ${error}`);
    res.status(400).json({
      success: false,
      message: 'Failed to create reservation'
    });
  }
});

// Update a reservation
router.put('/:id', authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { id } = req.params;
    const updateData = req.body;

    const reservation = await ReservationModel.findOne({
      where: { id, businessId }
    });

    if (!reservation) {
      res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
      return;
    }

    // Check for overlapping reservations if table is being changed
    if (updateData.tableId && updateData.tableId !== reservation.tableId) {
      const overlappingReservation = await ReservationModel.findOne({
        where: {
          businessId,
          tableId: updateData.tableId,
          reservationDate: updateData.reservationDate || reservation.reservationDate,
          status: ['pending', 'confirmed', 'seated'],
          id: { [Op.ne]: id }
        }
      });

      if (overlappingReservation) {
        res.status(409).json({
          success: false,
          message: 'Table is already reserved for this time period'
        });
        return;
      }
    }

    await reservation.update(updateData);

    logger(`Updated reservation ${id} for business ${businessId}`);

    res.json({
      success: true,
      data: reservation,
      message: 'Reservation updated successfully'
    });
  } catch (error) {
    logger(`Error updating reservation: ${error}`);
    res.status(400).json({
      success: false,
      message: 'Failed to update reservation'
    });
  }
});

// Update reservation status
router.patch('/:id/status', authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { id } = req.params;
    const { status, notes } = req.body;

    const reservation = await ReservationModel.findOne({
      where: { id, businessId }
    });

    if (!reservation) {
      res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
      return;
    }

    // Update status using model methods
    switch (status) {
      case 'confirmed':
        reservation.confirm();
        break;
      case 'seated':
        reservation.seat();
        break;
      case 'completed':
        reservation.complete();
        break;
      case 'cancelled':
        reservation.cancel(notes, req.user?.userId);
        break;
      case 'no_show':
        reservation.markNoShow();
        break;
      default:
        reservation.status = status;
    }

    await reservation.save();

    logger(`Updated reservation ${id} status to ${status} for business ${businessId}`);

    res.json({
      success: true,
      data: reservation,
      message: `Reservation ${status} successfully`
    });
  } catch (error) {
    logger(`Error updating reservation status: ${error}`);
    res.status(400).json({
      success: false,
      message: 'Failed to update reservation status'
    });
  }
});

// Delete a reservation
router.delete('/:id', authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { id } = req.params;

    const reservation = await ReservationModel.findOne({
      where: { id, businessId }
    });

    if (!reservation) {
      res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
      return;
    }

    await reservation.destroy();

    logger(`Deleted reservation ${id} for business ${businessId}`);

    res.json({
      success: true,
      message: 'Reservation deleted successfully'
    });
  } catch (error) {
    logger(`Error deleting reservation: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to delete reservation'
    });
  }
});

// Get reservations for today
router.get('/today', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const businessId = req.user?.businessId;
    const today = new Date().toISOString().split('T')[0];

    const reservations = await ReservationModel.findAll({
      where: {
        businessId,
        reservationDate: today
      },
      include: [
        {
          model: TableModel,
          as: 'table',
          attributes: ['id', 'tableNumber', 'capacity', 'section']
        },
        {
          model: CustomerModel,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ],
      order: [
        ['reservationTime', 'ASC']
      ]
    });

    logger(`Found ${reservations.length} reservations for today in business ${businessId}`);

    res.json({
      success: true,
      data: reservations
    });
  } catch (error) {
    logger(`Error getting today's reservations: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get today\'s reservations'
    });
  }
});

// Get reservations for a specific date
router.get('/date/:date', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const businessId = req.user?.businessId;
    const { date } = req.params;

    const reservations = await ReservationModel.findAll({
      where: {
        businessId,
        reservationDate: date
      },
      include: [
        {
          model: TableModel,
          as: 'table',
          attributes: ['id', 'tableNumber', 'capacity', 'section']
        },
        {
          model: CustomerModel,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ],
      order: [
        ['reservationTime', 'ASC']
      ]
    });

    logger(`Found ${reservations.length} reservations for date ${date} in business ${businessId}`);

    res.json({
      success: true,
      data: reservations
    });
  } catch (error) {
    logger(`Error getting reservations for date: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get reservations for date'
    });
  }
});

// Get reservation statistics
router.get('/stats/overview', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const businessId = req.user?.businessId;
    const { startDate, endDate } = req.query;

    const whereClause: any = { businessId };

    if (startDate && endDate) {
      whereClause.reservationDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    const totalReservations = await ReservationModel.count({ where: whereClause });
    const confirmedReservations = await ReservationModel.count({ 
      where: { ...whereClause, status: 'confirmed' } 
    });
    const seatedReservations = await ReservationModel.count({ 
      where: { ...whereClause, status: 'seated' } 
    });
    const completedReservations = await ReservationModel.count({ 
      where: { ...whereClause, status: 'completed' } 
    });
    const cancelledReservations = await ReservationModel.count({ 
      where: { ...whereClause, status: 'cancelled' } 
    });
    const noShowReservations = await ReservationModel.count({ 
      where: { ...whereClause, status: 'no_show' } 
    });

    const stats = {
      total: totalReservations,
      confirmed: confirmedReservations,
      seated: seatedReservations,
      completed: completedReservations,
      cancelled: cancelledReservations,
      noShow: noShowReservations,
      completionRate: totalReservations > 0 ? (completedReservations / totalReservations * 100).toFixed(1) : 0,
      cancellationRate: totalReservations > 0 ? (cancelledReservations / totalReservations * 100).toFixed(1) : 0,
      noShowRate: totalReservations > 0 ? (noShowReservations / totalReservations * 100).toFixed(1) : 0
    };

    logger(`Generated reservation stats for business ${businessId}`);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger(`Error getting reservation stats: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get reservation statistics'
    });
  }
});

export default router; 