import { Router } from 'express';
import { 
  CustomerModel, 
  BusinessModel 
} from '../models';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';
// import sequelize from '../config/sequelize'; // Not needed
// import { validateBusinessAccess } from '../middleware/businessAccess'; // Not implemented yet

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Get all customers for the current business
 *     tags: [Customers]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for name, email, or phone
 *       - in: query
 *         name: loyaltyTier
 *         schema:
 *           type: string
 *           enum: [bronze, silver, gold, platinum]
 *         description: Filter by loyalty tier
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of customers retrieved successfully
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
 *                     $ref: '#/components/schemas/Customer'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/customers/stats/overview:
 *   get:
 *     summary: Get customer statistics overview
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCustomers:
 *                       type: integer
 *                       example: 150
 *                     activeCustomers:
 *                       type: integer
 *                       example: 120
 *                     totalLoyaltyPoints:
 *                       type: integer
 *                       example: 15000
 *                     totalSpent:
 *                       type: number
 *                       example: 25000.75
 *                     avgSpentPerCustomer:
 *                       type: number
 *                       example: 166.67
 *                     topCustomers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           totalSpent:
 *                             type: number
 *                           visitCount:
 *                             type: integer
 *                           loyaltyPoints:
 *                             type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Get a specific customer by ID
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found
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

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Create a new customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *                 minLength: 2
 *                 maxLength: 100
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               phone:
 *                 type: string
 *                 example: +1234567890
 *                 minLength: 10
 *                 maxLength: 20
 *               preferences:
 *                 type: object
 *                 description: Restaurant-specific preferences
 *                 properties:
 *                   favoriteDishes:
 *                     type: array
 *                     items:
 *                       type: string
 *                   seatingPreference:
 *                     type: string
 *                     enum: [window, bar, quiet, outdoor]
 *               dietaryRestrictions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: [vegetarian, gluten-free]
 *               allergies:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: [nuts, shellfish]
 *     responses:
 *       201:
 *         description: Customer created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Customer'
 *                 message:
 *                   type: string
 *                   example: Customer created successfully
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
 */

/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: Update a customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Customer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *                 minLength: 2
 *                 maxLength: 100
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               phone:
 *                 type: string
 *                 example: +1234567890
 *                 minLength: 10
 *                 maxLength: 20
 *               preferences:
 *                 type: object
 *                 description: Restaurant-specific preferences
 *               dietaryRestrictions:
 *                 type: array
 *                 items:
 *                   type: string
 *               allergies:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Customer'
 *                 message:
 *                   type: string
 *                   example: Customer updated successfully
 *       404:
 *         description: Customer not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     summary: Delete a customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Customer deleted successfully
 *       404:
 *         description: Customer not found
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

/**
 * @swagger
 * /api/customers/{id}/visit:
 *   post:
 *     summary: Record a customer visit
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Customer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 45.99
 *                 description: Amount spent during visit
 *               notes:
 *                 type: string
 *                 example: Great service, will return
 *     responses:
 *       200:
 *         description: Visit recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Customer'
 *                 message:
 *                   type: string
 *                   example: Visit recorded successfully
 *       404:
 *         description: Customer not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/customers/{id}/loyalty:
 *   post:
 *     summary: Add loyalty points to a customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Customer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - points
 *             properties:
 *               points:
 *                 type: integer
 *                 example: 50
 *                 description: Points to add (can be negative)
 *               reason:
 *                 type: string
 *                 example: Birthday bonus
 *                 description: Reason for points adjustment
 *     responses:
 *       200:
 *         description: Loyalty points updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Customer'
 *                 message:
 *                   type: string
 *                   example: Loyalty points updated successfully
 *       404:
 *         description: Customer not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/customers/{id}/loyalty:
 *   get:
 *     summary: Get customer loyalty information
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Loyalty information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     currentPoints:
 *                       type: integer
 *                       example: 150
 *                     tier:
 *                       type: string
 *                       enum: [bronze, silver, gold, platinum]
 *                       example: silver
 *                     nextTierPoints:
 *                       type: integer
 *                       example: 50
 *                     totalSpent:
 *                       type: number
 *                       example: 1250.75
 *                     visitCount:
 *                       type: integer
 *                       example: 12
 *       404:
 *         description: Customer not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// Factory function to create customer routes with dependency injection
export const createCustomerRoutes = (
  CustomerModelInstance: any,
  BusinessModelInstance: any,
  authMiddleware: any // Changed from RequestHandler to any as RequestHandler is removed
) => {
  const router = Router();

  // Apply authentication middleware to all routes (can be overridden in tests)
  router.use(authMiddleware);
  // router.use(validateBusinessAccess); // Not implemented yet

  // GET /api/customers - Get all customers for the business
  const getCustomers = async (req: AuthRequest, res: any) => {
    try {
      const businessId = (req as any).user?.businessId;
      const {
        page = 1,
        limit = 20,
        search,
        loyaltyTier,
        isActive,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      const whereClause: any = { businessId };

      // Add search filter
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
        ];
      }

      // Add loyalty tier filter
      if (loyaltyTier) {
        switch (loyaltyTier) {
          case 'bronze':
            whereClause.totalSpent = { [Op.lt]: 100 };
            break;
          case 'silver':
            whereClause.totalSpent = { [Op.between]: [100, 500] };
            break;
          case 'gold':
            whereClause.totalSpent = { [Op.between]: [500, 1000] };
            break;
          case 'platinum':
            whereClause.totalSpent = { [Op.gte]: 1000 };
            break;
        }
      }

      // Add active status filter
      if (isActive !== undefined) {
        whereClause.isActive = isActive === 'true';
      }

      const { count, rows: customers } = await CustomerModelInstance.findAndCountAll({
        where: whereClause,
        order: [[sortBy as string, sortOrder as string]],
        limit: Number(limit),
        offset,
      });

      res.json({
        success: true,
        data: customers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count,
          totalPages: Math.ceil(count / Number(limit)),
        },
      });
    } catch (error) {
      console.error('Error fetching customers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch customers',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // GET /api/customers/stats/overview - Get customer statistics
  const getCustomerStats = async (req: AuthRequest, res: any) => {
    try {
      const businessId = (req as any).user?.businessId;

      const [
        totalCustomers,
        activeCustomers,
        totalLoyaltyPoints,
        totalSpent,
        avgSpentPerCustomer,
        topCustomers,
      ] = await Promise.all([
        CustomerModelInstance.count({ where: { businessId } }),
        CustomerModelInstance.count({ where: { businessId, isActive: true } }),
        CustomerModelInstance.sum('loyaltyPoints', { where: { businessId } }),
        CustomerModelInstance.sum('totalSpent', { where: { businessId } }),
        CustomerModelInstance.findOne({
          where: { businessId },
          attributes: [
            [CustomerModelInstance.sequelize!.fn('AVG', CustomerModelInstance.sequelize!.col('totalSpent')), 'avgSpent'],
          ],
          raw: true,
        }),
        CustomerModelInstance.findAll({
          where: { businessId },
          order: [['totalSpent', 'DESC']],
          limit: 5,
          attributes: ['id', 'name', 'totalSpent', 'visitCount', 'loyaltyPoints'],
        }),
      ]);

      const stats = {
        totalCustomers: totalCustomers || 0,
        activeCustomers: activeCustomers || 0,
        totalLoyaltyPoints: totalLoyaltyPoints || 0,
        totalSpent: totalSpent || 0,
        avgSpentPerCustomer: avgSpentPerCustomer ? (avgSpentPerCustomer as any)['avgSpent'] || 0 : 0,
        topCustomers: topCustomers || [],
      };

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error fetching customer stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch customer statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // GET /api/customers/:id - Get a specific customer
  const getCustomer = async (req: AuthRequest, res: any) => {
    try {
      const businessId = (req as any).user?.businessId;
      const customerId = req.params.id;

      const customer = await CustomerModelInstance.findOne({
        where: { id: customerId, businessId },
      });

      if (!customer) {
        res.status(404).json({
          success: false,
          message: 'Customer not found',
        });
        return;
      }

      res.json({
        success: true,
        data: customer,
      });
    } catch (error) {
      console.error('Error fetching customer:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch customer',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // POST /api/customers - Create a new customer
  const createCustomer = async (req: AuthRequest, res: any) => {
    try {
      const businessId = (req as any).user?.businessId;
      const customerData = {
        ...req.body,
        businessId,
      };

      // Check if business is restaurant type for restaurant-specific features
      const business = await BusinessModelInstance.findByPk(businessId);
      if (business?.type !== 'restaurant') {
        // Remove restaurant-specific fields for non-restaurant businesses
        delete customerData.preferences;
        delete customerData.dietaryRestrictions;
        delete customerData.allergies;
      }

      const customer = await CustomerModelInstance.create(customerData);

      res.status(201).json({
        success: true,
        message: 'Customer created successfully',
        data: customer,
      });
    } catch (error) {
      console.error('Error creating customer:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to create customer',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // PUT /api/customers/:id - Update a customer
  const updateCustomer = async (req: AuthRequest, res: any) => {
    try {
      const businessId = (req as any).user?.businessId;
      const customerId = req.params.id;
      const updateData = req.body;

      const customer = await CustomerModelInstance.findOne({
        where: { id: customerId, businessId },
      });

      if (!customer) {
        res.status(404).json({
          success: false,
          message: 'Customer not found',
        });
        return;
      }

      // Check if business is restaurant type for restaurant-specific features
      const business = await BusinessModelInstance.findByPk(businessId);
      if (business?.type !== 'restaurant') {
        // Remove restaurant-specific fields for non-restaurant businesses
        delete updateData.preferences;
        delete updateData.dietaryRestrictions;
        delete updateData.allergies;
      }

      await customer.update(updateData);

      res.json({
        success: true,
        message: 'Customer updated successfully',
        data: customer,
      });
    } catch (error) {
      console.error('Error updating customer:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to update customer',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // DELETE /api/customers/:id - Delete a customer
  const deleteCustomer = async (req: AuthRequest, res: any) => {
    try {
      const businessId = (req as any).user?.businessId;
      const customerId = req.params.id;

      const customer = await CustomerModelInstance.findOne({
        where: { id: customerId, businessId },
      });

      if (!customer) {
        res.status(404).json({
          success: false,
          message: 'Customer not found',
        });
        return;
      }

      // Check if customer can be deleted
      if (!customer.canBeDeleted()) {
        res.status(400).json({
          success: false,
          message: 'Cannot delete customer with visit history or spending',
        });
        return;
      }

      await customer.destroy();

      res.json({
        success: true,
        message: 'Customer deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting customer:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete customer',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // POST /api/customers/:id/record-visit - Record a customer visit
  const recordVisit = async (req: AuthRequest, res: any) => {
    try {
      const businessId = (req as any).user?.businessId;
      const customerId = req.params.id;
      const { amount = 0, loyaltyPointsEarned = 0 } = req.body;

      const customer = await CustomerModelInstance.findOne({
        where: { id: customerId, businessId },
      });

      if (!customer) {
        res.status(404).json({
          success: false,
          message: 'Customer not found',
        });
        return;
      }

      // Record the visit
      customer.recordVisit(Number(amount));
      
      // Add loyalty points if provided
      if (loyaltyPointsEarned > 0) {
        customer.addLoyaltyPoints(loyaltyPointsEarned);
      }

      await customer.save();

      res.json({
        success: true,
        message: 'Visit recorded successfully',
        data: customer,
      });
    } catch (error) {
      console.error('Error recording visit:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to record visit',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // POST /api/customers/:id/add-loyalty-points - Add loyalty points
  const addLoyaltyPoints = async (req: AuthRequest, res: any) => {
    try {
      const businessId = (req as any).user?.businessId;
      const customerId = req.params.id;
      const { points } = req.body;

      if (!points || points <= 0) {
        res.status(400).json({
          success: false,
          message: 'Points must be a positive number',
        });
        return;
      }

      const customer = await CustomerModelInstance.findOne({
        where: { id: customerId, businessId },
      });

      if (!customer) {
        res.status(404).json({
          success: false,
          message: 'Customer not found',
        });
        return;
      }

      customer.addLoyaltyPoints(points);
      await customer.save();

      res.json({
        success: true,
        message: 'Loyalty points added successfully',
        data: customer,
      });
    } catch (error) {
      console.error('Error adding loyalty points:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add loyalty points',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // GET /api/customers/:id/loyalty-info - Get customer loyalty information
  const getLoyaltyInfo = async (req: AuthRequest, res: any) => {
    try {
      const businessId = (req as any).user?.businessId;
      const customerId = req.params.id;

      const customer = await CustomerModelInstance.findOne({
        where: { id: customerId, businessId },
      });

      if (!customer) {
        res.status(404).json({
          success: false,
          message: 'Customer not found',
        });
        return;
      }

      const loyaltyInfo = {
        loyaltyPoints: customer.loyaltyPoints,
        totalSpent: customer.totalSpent,
        visitCount: customer.visitCount,
        loyaltyTier: customer.getLoyaltyTier(),
        discountPercentage: customer.getDiscountPercentage(),
        lastVisit: customer.lastVisit,
      };

      res.json({
        success: true,
        data: loyaltyInfo,
      });
    } catch (error) {
      console.error('Error fetching loyalty info:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch loyalty information',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // Register routes
  router.get('/', getCustomers);
  router.get('/stats/overview', getCustomerStats);
  router.get('/:id', getCustomer);
  router.post('/', createCustomer);
  router.put('/:id', updateCustomer);
  router.delete('/:id', deleteCustomer);
  router.post('/:id/record-visit', recordVisit);
  router.post('/:id/add-loyalty-points', addLoyaltyPoints);
  router.get('/:id/loyalty-info', getLoyaltyInfo);

  return router;
};

// Default export for backward compatibility (uses global models)
export default createCustomerRoutes(CustomerModel, BusinessModel, authenticateToken); 