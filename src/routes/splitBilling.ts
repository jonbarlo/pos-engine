import { Router } from 'express';
import { SplitBillingController } from '../controllers/splitBillingController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     SplitPayment:
 *       type: object
 *       required:
 *         - amount
 *         - method
 *       properties:
 *         amount:
 *           type: number
 *           format: decimal
 *           description: Payment amount
 *         method:
 *           type: string
 *           description: Payment method (cash, credit_card, etc.)
 *         customerName:
 *           type: string
 *           description: Customer name for this payment
 *         customerPhone:
 *           type: string
 *           description: Customer phone for this payment
 *         reference:
 *           type: string
 *           description: Payment reference number
 *     SplitSaleRequest:
 *       type: object
 *       required:
 *         - userId
 *         - totalAmount
 *         - payments
 *       properties:
 *         userId:
 *           type: integer
 *           description: User ID who created the sale
 *         totalAmount:
 *           type: number
 *           format: decimal
 *           description: Total sale amount
 *         customerName:
 *           type: string
 *           description: Customer name
 *         customerPhone:
 *           type: string
 *           description: Customer phone
 *         customerEmail:
 *           type: string
 *           description: Customer email
 *         notes:
 *           type: string
 *           description: Sale notes
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               itemId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               unitPrice:
 *                 type: number
 *           description: Sale items
 *         payments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SplitPayment'
 *           description: Split payments
 */

/**
 * @swagger
 * /sales/split:
 *   post:
 *     summary: Create a sale with split payments
 *     tags: [Split Billing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SplitSaleRequest'
 *     responses:
 *       201:
 *         description: Split sale created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 sale:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     totalAmount:
 *                       type: number
 *                     status:
 *                       type: string
 *                     payments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SplitPayment'
 *       400:
 *         description: Bad request - missing required fields
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/split', authenticateToken, SplitBillingController.createSplitSale);

/**
 * @swagger
 * /sales/{saleId}/payments:
 *   post:
 *     summary: Add payment to existing sale
 *     tags: [Split Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: saleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sale ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SplitPayment'
 *     responses:
 *       200:
 *         description: Payment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 sale:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     totalAmount:
 *                       type: number
 *                     status:
 *                       type: string
 *                     payments:
 *                       type: array
 *                     totalPaid:
 *                       type: number
 *       400:
 *         description: Bad request - missing payment details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Sale not found
 *       500:
 *         description: Internal server error
 */
router.post('/:saleId/payments', authenticateToken, SplitBillingController.addPayment);

/**
 * @swagger
 * /sales/{id}:
 *   get:
 *     summary: Get sale with split payment details
 *     tags: [Split Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sale ID
 *     responses:
 *       200:
 *         description: Sale details with payments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 totalAmount:
 *                   type: number
 *                 status:
 *                   type: string
 *                 customerName:
 *                   type: string
 *                 customerPhone:
 *                   type: string
 *                 customerEmail:
 *                   type: string
 *                 notes:
 *                   type: string
 *                 payments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SplitPayment'
 *                 totalPaid:
 *                   type: number
 *                 remainingAmount:
 *                   type: number
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request - invalid sale ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Sale not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticateToken, SplitBillingController.getSaleWithPayments);

/**
 * @swagger
 * /sales/{saleId}/refund:
 *   post:
 *     summary: Refund a split payment
 *     tags: [Split Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: saleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sale ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentIndex
 *               - refundAmount
 *             properties:
 *               paymentIndex:
 *                 type: integer
 *                 description: Index of the payment to refund
 *               refundAmount:
 *                 type: number
 *                 format: decimal
 *                 description: Amount to refund
 *               reason:
 *                 type: string
 *                 description: Reason for refund
 *     responses:
 *       200:
 *         description: Refund processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 sale:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     totalAmount:
 *                       type: number
 *                     status:
 *                       type: string
 *                     refundAmount:
 *                       type: number
 *                     totalPaid:
 *                       type: number
 *       400:
 *         description: Bad request - missing refund details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Sale not found
 *       500:
 *         description: Internal server error
 */
router.post('/:saleId/refund', authenticateToken, SplitBillingController.refundPayment);

/**
 * @swagger
 * /sales/split/stats:
 *   get:
 *     summary: Get split billing statistics
 *     tags: [Split Billing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Split billing statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalSplitSales:
 *                   type: integer
 *                   description: Total number of split sales
 *                 totalAmount:
 *                   type: number
 *                   format: decimal
 *                   description: Total amount across all split sales
 *                 averageSplitAmount:
 *                   type: number
 *                   format: decimal
 *                   description: Average split sale amount
 *                 averagePaymentsPerSale:
 *                   type: number
 *                   format: decimal
 *                   description: Average number of payments per split sale
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/split/stats', authenticateToken, SplitBillingController.getSplitBillingStats);

export default router; 