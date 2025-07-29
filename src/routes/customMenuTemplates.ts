import { Router } from 'express';
import { CustomMenuTemplateController } from '../controllers/customMenuTemplateController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CustomMenuTemplate:
 *       type: object
 *       required:
 *         - businessId
 *         - name
 *         - css
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the template
 *         businessId:
 *           type: integer
 *           description: ID of the business this template belongs to
 *         name:
 *           type: string
 *           maxLength: 100
 *           description: Template name
 *         description:
 *           type: string
 *           description: Template description
 *         css:
 *           type: string
 *           description: CSS styles for the template
 *         html:
 *           type: string
 *           description: Optional HTML structure for the template
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether the template is active
 *         isDefault:
 *           type: boolean
 *           default: false
 *           description: Whether this is the default template for the business
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

/**
 * @swagger
 * /api/menu/templates/{businessId}/custom:
 *   get:
 *     summary: Get custom menu templates for a business
 *     tags: [Custom Menu Templates]
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
 *         description: List of custom templates
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
 *                     $ref: '#/components/schemas/CustomMenuTemplate'
 *       400:
 *         description: Invalid business ID
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/:businessId/custom', authenticateToken, (req, res) => {
  console.log(`GET /api/menu/templates/${req.params.businessId}/custom called`);
  try {
    CustomMenuTemplateController.getCustomTemplates(req, res);
  } catch (error) {
    console.error('Error in custom templates route:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/menu/templates/{businessId}/custom:
 *   post:
 *     summary: Create a custom menu template
 *     tags: [Custom Menu Templates]
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - css
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 description: Template name
 *               description:
 *                 type: string
 *                 description: Template description
 *               css:
 *                 type: string
 *                 description: CSS styles for the template
 *               html:
 *                 type: string
 *                 description: Optional HTML structure for the template
 *               isDefault:
 *                 type: boolean
 *                 default: false
 *                 description: Whether this should be the default template
 *     responses:
 *       201:
 *         description: Template created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CustomMenuTemplate'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/:businessId/custom', authenticateToken, CustomMenuTemplateController.createCustomTemplate);

/**
 * @swagger
 * /api/menu/templates/{businessId}/custom/{templateId}:
 *   put:
 *     summary: Update a custom menu template
 *     tags: [Custom Menu Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Business ID
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Template ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 description: Template name
 *               description:
 *                 type: string
 *                 description: Template description
 *               css:
 *                 type: string
 *                 description: CSS styles for the template
 *               html:
 *                 type: string
 *                 description: Optional HTML structure for the template
 *               isActive:
 *                 type: boolean
 *                 description: Whether the template is active
 *               isDefault:
 *                 type: boolean
 *                 description: Whether this should be the default template
 *     responses:
 *       200:
 *         description: Template updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CustomMenuTemplate'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Template not found
 *       500:
 *         description: Internal server error
 */
router.put('/:businessId/custom/:templateId', authenticateToken, CustomMenuTemplateController.updateCustomTemplate);

/**
 * @swagger
 * /api/menu/templates/{businessId}/custom/{templateId}:
 *   delete:
 *     summary: Delete a custom menu template
 *     tags: [Custom Menu Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Business ID
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Template not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:businessId/custom/:templateId', authenticateToken, CustomMenuTemplateController.deleteCustomTemplate);

export default router;