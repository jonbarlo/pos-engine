import { Router } from 'express';
import { BusinessController } from '../controllers/businessController';

const router = Router();

/**
 * @swagger
 * /api/public/businesses/slug/{slug}:
 *   get:
 *     summary: Get public business information by slug (no authentication required)
 *     tags: [Public Businesses]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Business slug identifier
 *     responses:
 *       200:
 *         description: Business information retrieved successfully
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
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Italian Delight Restaurant"
 *                     slug:
 *                       type: string
 *                       example: "italian-delight"
 *                     description:
 *                       type: string
 *                       example: "Authentic Italian cuisine in a cozy atmosphere"
 *                     logo:
 *                       type: string
 *                       example: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop&crop=center"
 *                     primaryColor:
 *                       type: string
 *                       example: "#D4AF37"
 *                     secondaryColor:
 *                       type: string
 *                       example: "#8B0000"
 *                     address:
 *                       type: string
 *                       example: "123 Main Street, Downtown, NY 10001"
 *                     phone:
 *                       type: string
 *                       example: "+1-555-0123"
 *                     email:
 *                       type: string
 *                       example: "info@italiandelight.com"
 *                     website:
 *                       type: string
 *                       example: "https://italiandelight.com"
 *                     taxRate:
 *                       type: number
 *                       example: 8.875
 *                     currency:
 *                       type: string
 *                       example: "USD"
 *                     timezone:
 *                       type: string
 *                       example: "America/New_York"
 *                     type:
 *                       type: string
 *                       example: "restaurant"
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *       404:
 *         description: Business not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Business not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get('/slug/:slug', BusinessController.getPublicBusinessBySlug);

export default router; 