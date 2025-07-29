import { Router } from 'express';
import { MenuPdfController } from '../controllers/menuPdfController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     MenuPdfOptions:
 *       type: object
 *       properties:
 *         template:
 *           type: string
 *           enum: [elegant, modern, classic, minimal]
 *           default: elegant
 *           description: PDF template style
 *         includePrices:
 *           type: boolean
 *           default: true
 *           description: Include item prices in PDF
 *         includeDescriptions:
 *           type: boolean
 *           default: true
 *           description: Include item descriptions in PDF
 *         includeAllergens:
 *           type: boolean
 *           default: true
 *           description: Include allergen information in PDF
 *         includeCalories:
 *           type: boolean
 *           default: true
 *           description: Include calorie information in PDF
 *         orientation:
 *           type: string
 *           enum: [portrait, landscape]
 *           default: portrait
 *           description: PDF page orientation
 *         fontSize:
 *           type: string
 *           enum: [small, medium, large]
 *           default: medium
 *           description: Font size for PDF
 *         colorScheme:
 *           type: string
 *           enum: [dark, light, auto]
 *           default: light
 *           description: Color scheme for PDF
 *     
 *     PdfTemplate:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Template identifier
 *         name:
 *           type: string
 *           description: Template display name
 *         description:
 *           type: string
 *           description: Template description
 */

/**
 * @swagger
 * /api/menu/pdf/templates:
 *   get:
 *     summary: Get available PDF menu templates
 *     tags: [Menu PDF]
 *     responses:
 *       200:
 *         description: List of available templates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PdfTemplate'
 *       500:
 *         description: Internal server error
 */
router.get('/templates', MenuPdfController.getTemplates);

/**
 * @swagger
 * /api/menu/{businessId}/preview:
 *   get:
 *     summary: Preview menu data for a business
 *     tags: [Menu PDF]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Business ID
 *     responses:
 *       200:
 *         description: Menu preview data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     business:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                         logo:
 *                           type: string
 *                         address:
 *                           type: string
 *                         phone:
 *                           type: string
 *                         website:
 *                           type: string
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                           colorCode:
 *                             type: string
 *                           itemCount:
 *                             type: integer
 *                           items:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                 name:
 *                                   type: string
 *                                 description:
 *                                   type: string
 *                                 price:
 *                                   type: number
 *                                 isVegetarian:
 *                                   type: boolean
 *                                 isVegan:
 *                                   type: boolean
 *                                 isGlutenFree:
 *                                   type: boolean
 *                                 isSpicy:
 *                                   type: boolean
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Access denied
 *       404:
 *         description: Business not found
 *       500:
 *         description: Internal server error
 */
router.get('/:businessId/preview', authenticateToken, MenuPdfController.previewMenu);

/**
 * @swagger
 * /api/menu/{businessId}/pdf:
 *   post:
 *     summary: Generate and download PDF menu for a business
 *     tags: [Menu PDF]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Business ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MenuPdfOptions'
 *     responses:
 *       200:
 *         description: PDF file generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Access denied or not a restaurant business
 *       404:
 *         description: Business not found
 *       500:
 *         description: Internal server error
 */
router.post('/:businessId/pdf', authenticateToken, MenuPdfController.generatePdf);

export default router; 