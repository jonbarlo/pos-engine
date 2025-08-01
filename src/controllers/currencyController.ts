import { Request, Response } from 'express';
import { CurrencyService, CurrencyConversionRequest } from '../services/currencyService';
import { logger } from '../utils/logger';

export class CurrencyController {
  /**
   * Get all currencies
   * GET /api/currencies
   */
  static async getAllCurrencies(req: Request, res: Response): Promise<void> {
    try {
      logger('Getting all currencies');
      const currencies = await CurrencyService.getAllCurrencies();
      
      res.status(200).json({
        success: true,
        data: currencies,
        message: 'Currencies retrieved successfully'
      });
    } catch (error) {
      logger(`Error getting currencies: ${error}`);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve currencies',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get currency by ID
   * GET /api/currencies/:id
   */
  static async getCurrencyById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '0');
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid currency ID'
        });
        return;
      }

      logger(`Getting currency by ID: ${id}`);
      const currency = await CurrencyService.getCurrencyById(id);
      
      if (!currency) {
        res.status(404).json({
          success: false,
          message: 'Currency not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: currency,
        message: 'Currency retrieved successfully'
      });
    } catch (error) {
      logger(`Error getting currency by ID: ${error}`);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve currency',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get currency by code
   * GET /api/currencies/code/:code
   */
  static async getCurrencyByCode(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;
      
      if (!code || code.length !== 3) {
        res.status(400).json({
          success: false,
          message: 'Invalid currency code'
        });
        return;
      }

      logger(`Getting currency by code: ${code}`);
      const currency = await CurrencyService.getCurrencyByCode(code);
      
      if (!currency) {
        res.status(404).json({
          success: false,
          message: 'Currency not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: currency,
        message: 'Currency retrieved successfully'
      });
    } catch (error) {
      logger(`Error getting currency by code: ${error}`);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve currency',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get default currency
   * GET /api/currencies/default
   */
  static async getDefaultCurrency(req: Request, res: Response): Promise<void> {
    try {
      logger('Getting default currency');
      const currency = await CurrencyService.getDefaultCurrency();
      
      if (!currency) {
        res.status(404).json({
          success: false,
          message: 'No default currency found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: currency,
        message: 'Default currency retrieved successfully'
      });
    } catch (error) {
      logger(`Error getting default currency: ${error}`);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve default currency',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create new currency
   * POST /api/currencies
   */
  static async createCurrency(req: Request, res: Response): Promise<void> {
    try {
      const { code, name, symbol, decimalPlaces, isActive, isDefault } = req.body;

      // Validate required fields
      if (!code || !name || !symbol) {
        res.status(400).json({
          success: false,
          message: 'Code, name, and symbol are required'
        });
        return;
      }

      // Validate currency code format
      if (!CurrencyService.validateCurrencyCode(code)) {
        res.status(400).json({
          success: false,
          message: 'Currency code must be 3 uppercase letters (ISO 4217 format)'
        });
        return;
      }

      logger(`Creating new currency: ${code}`);
      const currency = await CurrencyService.createCurrency({
        code: code.toUpperCase(),
        name,
        symbol,
        decimalPlaces: decimalPlaces || 2,
        isActive: isActive !== undefined ? isActive : true,
        isDefault: isDefault !== undefined ? isDefault : false
      });

      res.status(201).json({
        success: true,
        data: currency,
        message: 'Currency created successfully'
      });
    } catch (error) {
      logger(`Error creating currency: ${error}`);
      res.status(500).json({
        success: false,
        message: 'Failed to create currency',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update currency
   * PUT /api/currencies/:id
   */
  static async updateCurrency(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '0');
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid currency ID'
        });
        return;
      }

      const { code, name, symbol, decimalPlaces, isActive, isDefault } = req.body;

      // Validate currency code format if provided
      if (code && !CurrencyService.validateCurrencyCode(code)) {
        res.status(400).json({
          success: false,
          message: 'Currency code must be 3 uppercase letters (ISO 4217 format)'
        });
        return;
      }

      logger(`Updating currency ID: ${id}`);
      const currency = await CurrencyService.updateCurrency(id, {
        ...(code && { code: code.toUpperCase() }),
        ...(name && { name }),
        ...(symbol && { symbol }),
        ...(decimalPlaces !== undefined && { decimalPlaces }),
        ...(isActive !== undefined && { isActive }),
        ...(isDefault !== undefined && { isDefault })
      });

      if (!currency) {
        res.status(404).json({
          success: false,
          message: 'Currency not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: currency,
        message: 'Currency updated successfully'
      });
    } catch (error) {
      logger(`Error updating currency: ${error}`);
      res.status(500).json({
        success: false,
        message: 'Failed to update currency',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete currency
   * DELETE /api/currencies/:id
   */
  static async deleteCurrency(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '0');
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid currency ID'
        });
        return;
      }

      logger(`Deleting currency ID: ${id}`);
      const deleted = await CurrencyService.deleteCurrency(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Currency not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Currency deleted successfully'
      });
    } catch (error) {
      logger(`Error deleting currency: ${error}`);
      res.status(500).json({
        success: false,
        message: 'Failed to delete currency',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Convert currency
   * POST /api/currencies/convert
   */
  static async convertCurrency(req: Request, res: Response): Promise<void> {
    try {
      const { fromCurrencyId, toCurrencyId, amount } = req.body;

      // Validate required fields
      if (!fromCurrencyId || !toCurrencyId || amount === undefined) {
        res.status(400).json({
          success: false,
          message: 'fromCurrencyId, toCurrencyId, and amount are required'
        });
        return;
      }

      // Validate amount is positive
      if (amount < 0) {
        res.status(400).json({
          success: false,
          message: 'Amount must be positive'
        });
        return;
      }

      const conversionRequest: CurrencyConversionRequest = {
        fromCurrencyId: parseInt(fromCurrencyId),
        toCurrencyId: parseInt(toCurrencyId),
        amount: parseFloat(amount)
      };

      logger(`Converting currency: ${JSON.stringify(conversionRequest)}`);
      const result = await CurrencyService.convertCurrency(conversionRequest);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Currency converted successfully'
      });
    } catch (error) {
      logger(`Error converting currency: ${error}`);
      res.status(500).json({
        success: false,
        message: 'Failed to convert currency',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get all exchange rates for a currency
   * GET /api/currencies/:id/exchange-rates
   */
  static async getCurrencyExchangeRates(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '0');

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid currency ID'
        });
        return;
      }

      logger(`Getting exchange rates for currency ID: ${id}`);
      const exchangeRates = await CurrencyService.getCurrencyExchangeRates(id);

      res.status(200).json({
        success: true,
        data: exchangeRates,
        message: 'Exchange rates retrieved successfully'
      });
    } catch (error) {
      logger(`Error getting exchange rates for currency: ${error}`);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve exchange rates',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get exchange rate
   * GET /api/currencies/exchange-rate/:fromCurrencyId/:toCurrencyId
   */
  static async getExchangeRate(req: Request, res: Response): Promise<void> {
    try {
      const fromCurrencyId = parseInt(req.params.fromCurrencyId || '0');
      const toCurrencyId = parseInt(req.params.toCurrencyId || '0');

      if (isNaN(fromCurrencyId) || isNaN(toCurrencyId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid currency IDs'
        });
        return;
      }

      logger(`Getting exchange rate from ${fromCurrencyId} to ${toCurrencyId}`);
      const exchangeRate = await CurrencyService.getExchangeRate(fromCurrencyId, toCurrencyId);

      if (!exchangeRate) {
        res.status(404).json({
          success: false,
          message: 'Exchange rate not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: exchangeRate,
        message: 'Exchange rate retrieved successfully'
      });
    } catch (error) {
      logger(`Error getting exchange rate: ${error}`);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve exchange rate',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update exchange rate
   * POST /api/currencies/exchange-rate
   */
  static async updateExchangeRate(req: Request, res: Response): Promise<void> {
    try {
      const { fromCurrencyId, toCurrencyId, rate, effectiveDate } = req.body;

      // Validate required fields
      if (!fromCurrencyId || !toCurrencyId || rate === undefined) {
        res.status(400).json({
          success: false,
          message: 'fromCurrencyId, toCurrencyId, and rate are required'
        });
        return;
      }

      // Validate rate is positive
      if (rate <= 0) {
        res.status(400).json({
          success: false,
          message: 'Exchange rate must be positive'
        });
        return;
      }

      logger(`Updating exchange rate from ${fromCurrencyId} to ${toCurrencyId}: ${rate}`);
      const exchangeRate = await CurrencyService.updateExchangeRate(
        parseInt(fromCurrencyId),
        parseInt(toCurrencyId),
        parseFloat(rate),
        effectiveDate ? new Date(effectiveDate) : new Date()
      );

      res.status(200).json({
        success: true,
        data: exchangeRate,
        message: 'Exchange rate updated successfully'
      });
    } catch (error) {
      logger(`Error updating exchange rate: ${error}`);
      res.status(500).json({
        success: false,
        message: 'Failed to update exchange rate',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
} 