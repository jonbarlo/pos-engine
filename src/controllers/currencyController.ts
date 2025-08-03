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
        message: req.t('currencies.getAll.success')
      });
    } catch (error) {
      logger(`Error getting currencies: ${error}`);
      res.status(500).json({
        success: false,
        message: req.t('currencies.getAll.error'),
        error: req.t('errors.server.internal')
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
          message: req.t('errors.validation.invalidCurrencyId')
        });
        return;
      }

      logger(`Getting currency by ID: ${id}`);
      const currency = await CurrencyService.getCurrencyById(id);
      
      if (!currency) {
        res.status(404).json({
          success: false,
          message: req.t('errors.server.currencyNotFound')
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: currency,
        message: req.t('currencies.getById.success')
      });
    } catch (error) {
      logger(`Error getting currency by ID: ${error}`);
      res.status(500).json({
        success: false,
        message: req.t('currencies.getById.error'),
        error: req.t('errors.server.internal')
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
          message: req.t('errors.validation.invalidCurrencyCode')
        });
        return;
      }

      logger(`Getting currency by code: ${code}`);
      const currency = await CurrencyService.getCurrencyByCode(code);
      
      if (!currency) {
        res.status(404).json({
          success: false,
          message: req.t('errors.server.currencyNotFound')
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: currency,
        message: req.t('currencies.getByCode.success')
      });
    } catch (error) {
      logger(`Error getting currency by code: ${error}`);
      res.status(500).json({
        success: false,
        message: req.t('currencies.getByCode.error'),
        error: req.t('errors.server.internal')
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
          message: req.t('errors.server.currencyNotFound')
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: currency,
        message: req.t('currencies.getDefault.success')
      });
    } catch (error) {
      logger(`Error getting default currency: ${error}`);
      res.status(500).json({
        success: false,
        message: req.t('currencies.getDefault.error'),
        error: req.t('errors.server.internal')
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
          message: req.t('errors.validation.currencyFieldsRequired')
        });
        return;
      }

      // Validate currency code format
      if (!CurrencyService.validateCurrencyCode(code)) {
        res.status(400).json({
          success: false,
          message: req.t('errors.validation.currencyCodeFormat')
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
        message: req.t('currencies.create.success')
      });
    } catch (error) {
      logger(`Error creating currency: ${error}`);
      res.status(500).json({
        success: false,
        message: req.t('currencies.create.error'),
        error: req.t('errors.server.internal')
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
          message: req.t('errors.validation.invalidCurrencyId')
        });
        return;
      }

      const { code, name, symbol, decimalPlaces, isActive, isDefault } = req.body;

      // Validate currency code format if provided
      if (code && !CurrencyService.validateCurrencyCode(code)) {
        res.status(400).json({
          success: false,
          message: req.t('errors.validation.currencyCodeFormat')
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
          message: req.t('errors.server.currencyNotFound')
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: currency,
        message: req.t('currencies.update.success')
      });
    } catch (error) {
      logger(`Error updating currency: ${error}`);
      res.status(500).json({
        success: false,
        message: req.t('currencies.update.error'),
        error: req.t('errors.server.internal')
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
          message: req.t('errors.validation.invalidCurrencyId')
        });
        return;
      }

      logger(`Deleting currency ID: ${id}`);
      const deleted = await CurrencyService.deleteCurrency(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: req.t('errors.server.currencyNotFound')
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: req.t('currencies.delete.success')
      });
    } catch (error) {
      logger(`Error deleting currency: ${error}`);
      res.status(500).json({
        success: false,
        message: req.t('currencies.delete.error'),
        error: req.t('errors.server.internal')
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
          message: req.t('errors.validation.currencyConversionFieldsRequired')
        });
        return;
      }

      // Validate amount is positive
      if (amount < 0) {
        res.status(400).json({
          success: false,
          message: req.t('errors.validation.amountMustBePositive')
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
        message: req.t('currencies.convert.success')
      });
    } catch (error) {
      logger(`Error converting currency: ${error}`);
      res.status(500).json({
        success: false,
        message: req.t('currencies.convert.error'),
        error: req.t('errors.server.internal')
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
          message: req.t('errors.validation.invalidCurrencyId')
        });
        return;
      }

      logger(`Getting exchange rates for currency ID: ${id}`);
      const exchangeRates = await CurrencyService.getCurrencyExchangeRates(id);

      res.status(200).json({
        success: true,
        data: exchangeRates,
        message: req.t('currencies.exchangeRates.success')
      });
    } catch (error) {
      logger(`Error getting exchange rates for currency: ${error}`);
      res.status(500).json({
        success: false,
        message: req.t('currencies.exchangeRates.error'),
        error: req.t('errors.server.internal')
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
          message: req.t('errors.validation.invalidCurrencyIds')
        });
        return;
      }

      logger(`Getting exchange rate from ${fromCurrencyId} to ${toCurrencyId}`);
      const exchangeRate = await CurrencyService.getExchangeRate(fromCurrencyId, toCurrencyId);

      if (!exchangeRate) {
        res.status(404).json({
          success: false,
          message: req.t('errors.server.exchangeRateNotFound')
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: exchangeRate,
        message: req.t('currencies.exchangeRate.success')
      });
    } catch (error) {
      logger(`Error getting exchange rate: ${error}`);
      res.status(500).json({
        success: false,
        message: req.t('currencies.exchangeRate.error'),
        error: req.t('errors.server.internal')
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
          message: req.t('errors.validation.exchangeRateFieldsRequired')
        });
        return;
      }

      // Validate rate is positive
      if (rate <= 0) {
        res.status(400).json({
          success: false,
          message: req.t('errors.validation.exchangeRateMustBePositive')
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
        message: req.t('currencies.updateExchangeRate.success')
      });
    } catch (error) {
      logger(`Error updating exchange rate: ${error}`);
      res.status(500).json({
        success: false,
        message: req.t('currencies.updateExchangeRate.error'),
        error: req.t('errors.server.internal')
      });
    }
  }
} 