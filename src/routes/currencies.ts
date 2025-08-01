import { Router } from 'express';
const currencyRouter = Router();
import { CurrencyController } from "../controllers/currencyController";
import { authenticateToken } from '../middleware/auth';

/**
 * @swagger
 * /api/currencies:
 *   get:
 *     summary: Get all currencies
 *     tags: [Currencies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all currencies
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
 *                     $ref: '#/components/schemas/Currency'
 *                 message:
 *                   type: string
 *                   example: "Currencies retrieved successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
currencyRouter.get('/', authenticateToken, CurrencyController.getAllCurrencies);

/**
 * @swagger
 * /api/currencies/{id}:
 *   get:
 *     summary: Get currency by ID
 *     tags: [Currencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Currency ID
 *     responses:
 *       200:
 *         description: Currency details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Currency'
 *                 message:
 *                   type: string
 *                   example: "Currency retrieved successfully"
 *       400:
 *         description: Invalid currency ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Currency not found
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /api/currencies/default:
 *   get:
 *     summary: Get default currency
 *     tags: [Currencies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Default currency details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Currency'
 *                 message:
 *                   type: string
 *                   example: "Default currency retrieved successfully"
 *       404:
 *         description: No default currency found
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
currencyRouter.get('/default', authenticateToken, CurrencyController.getDefaultCurrency);

currencyRouter.get('/:id', authenticateToken, CurrencyController.getCurrencyById);

/**
 * @swagger
 * /api/currencies/code/{code}:
 *   get:
 *     summary: Get currency by code
 *     tags: [Currencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[A-Z]{3}$'
 *         description: Currency code (3 uppercase letters)
 *         example: "USD"
 *     responses:
 *       200:
 *         description: Currency details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Currency'
 *                 message:
 *                   type: string
 *                   example: "Currency retrieved successfully"
 *       400:
 *         description: Invalid currency code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Currency not found
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
currencyRouter.get('/code/:code', authenticateToken, CurrencyController.getCurrencyByCode);

/**
 * @swagger
 * /api/currencies/{id}/exchange-rates:
 *   get:
 *     summary: Get all exchange rates for a currency
 *     tags: [Currencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Currency ID
 *     responses:
 *       200:
 *         description: List of exchange rates for the currency
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
 *                     $ref: '#/components/schemas/ExchangeRate'
 *                 message:
 *                   type: string
 *                   example: "Exchange rates retrieved successfully"
 *       400:
 *         description: Invalid currency ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Currency not found
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
currencyRouter.get('/:id/exchange-rates', authenticateToken, CurrencyController.getCurrencyExchangeRates);

/**
 * @swagger
 * /api/currencies/default:
 *   get:
 *     summary: Get default currency
 *     tags: [Currencies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Default currency details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Currency'
 *                 message:
 *                   type: string
 *                   example: "Default currency retrieved successfully"
 *       404:
 *         description: No default currency found
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /api/currencies:
 *   post:
 *     summary: Create a new currency
 *     tags: [Currencies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, name, symbol]
 *             properties:
 *               code:
 *                 type: string
 *                 pattern: '^[A-Z]{3}$'
 *                 description: Currency code (ISO 4217 format)
 *                 example: "EUR"
 *               name:
 *                 type: string
 *                 description: Currency name
 *                 example: "Euro"
 *               symbol:
 *                 type: string
 *                 description: Currency symbol
 *                 example: "€"
 *               decimalPlaces:
 *                 type: integer
 *                 default: 2
 *                 description: Number of decimal places
 *                 example: 2
 *               isActive:
 *                 type: boolean
 *                 default: true
 *                 description: Whether the currency is active
 *                 example: true
 *               isDefault:
 *                 type: boolean
 *                 default: false
 *                 description: Whether this is the default currency
 *                 example: false
 *     responses:
 *       201:
 *         description: Currency created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Currency'
 *                 message:
 *                   type: string
 *                   example: "Currency created successfully"
 *       400:
 *         description: Invalid input data
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
currencyRouter.post('/', authenticateToken, CurrencyController.createCurrency);

/**
 * @swagger
 * /api/currencies/{id}:
 *   put:
 *     summary: Update currency
 *     tags: [Currencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Currency ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 pattern: '^[A-Z]{3}$'
 *                 description: Currency code (ISO 4217 format)
 *                 example: "EUR"
 *               name:
 *                 type: string
 *                 description: Currency name
 *                 example: "Euro"
 *               symbol:
 *                 type: string
 *                 description: Currency symbol
 *                 example: "€"
 *               decimalPlaces:
 *                 type: integer
 *                 description: Number of decimal places
 *                 example: 2
 *               isActive:
 *                 type: boolean
 *                 description: Whether the currency is active
 *                 example: true
 *               isDefault:
 *                 type: boolean
 *                 description: Whether this is the default currency
 *                 example: false
 *     responses:
 *       200:
 *         description: Currency updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Currency'
 *                 message:
 *                   type: string
 *                   example: "Currency updated successfully"
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Currency not found
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
currencyRouter.put('/:id', authenticateToken, CurrencyController.updateCurrency);

/**
 * @swagger
 * /api/currencies/{id}:
 *   delete:
 *     summary: Delete currency
 *     tags: [Currencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Currency ID
 *     responses:
 *       200:
 *         description: Currency deleted successfully
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
 *                   example: "Currency deleted successfully"
 *       400:
 *         description: Invalid currency ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Currency not found
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
currencyRouter.delete('/:id', authenticateToken, CurrencyController.deleteCurrency);

/**
 * @swagger
 * /api/currencies/convert:
 *   post:
 *     summary: Convert currency
 *     tags: [Currencies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fromCurrencyId, toCurrencyId, amount]
 *             properties:
 *               fromCurrencyId:
 *                 type: integer
 *                 description: Source currency ID
 *                 example: 2
 *               toCurrencyId:
 *                 type: integer
 *                 description: Target currency ID
 *                 example: 1
 *               amount:
 *                 type: number
 *                 minimum: 0
 *                 description: Amount to convert
 *                 example: 25.99
 *     responses:
 *       200:
 *         description: Currency converted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CurrencyConversion'
 *                 message:
 *                   type: string
 *                   example: "Currency converted successfully"
 *       400:
 *         description: Invalid input data
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
currencyRouter.post('/convert', authenticateToken, CurrencyController.convertCurrency);

/**
 * @swagger
 * /api/currencies/exchange-rate/{fromCurrencyId}/{toCurrencyId}:
 *   get:
 *     summary: Get exchange rate between currencies
 *     tags: [Currencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fromCurrencyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Source currency ID
 *         example: 2
 *       - in: path
 *         name: toCurrencyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Target currency ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Exchange rate retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ExchangeRate'
 *                 message:
 *                   type: string
 *                   example: "Exchange rate retrieved successfully"
 *       400:
 *         description: Invalid currency IDs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Exchange rate not found
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
currencyRouter.get('/exchange-rate/:fromCurrencyId/:toCurrencyId', authenticateToken, CurrencyController.getExchangeRate);

/**
 * @swagger
 * /api/currencies/exchange-rate:
 *   post:
 *     summary: Update exchange rate
 *     tags: [Currencies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fromCurrencyId, toCurrencyId, rate]
 *             properties:
 *               fromCurrencyId:
 *                 type: integer
 *                 description: Source currency ID
 *                 example: 2
 *               toCurrencyId:
 *                 type: integer
 *                 description: Target currency ID
 *                 example: 1
 *               rate:
 *                 type: number
 *                 minimum: 0
 *                 description: Exchange rate
 *                 example: 0.001923
 *               effectiveDate:
 *                 type: string
 *                 format: date-time
 *                 description: Effective date for the exchange rate
 *                 example: "2025-01-01T00:00:00.000Z"
 *     responses:
 *       200:
 *         description: Exchange rate updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ExchangeRate'
 *                 message:
 *                   type: string
 *                   example: "Exchange rate updated successfully"
 *       400:
 *         description: Invalid input data
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
currencyRouter.post('/exchange-rate', authenticateToken, CurrencyController.updateExchangeRate);

export default currencyRouter; 