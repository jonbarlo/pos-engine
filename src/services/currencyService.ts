import { CurrencyModel, ExchangeRateModel, BusinessModel, ItemModel, SaleModel, OrderModel, SaleItemModel, OrderItemModel } from '../models';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';

export interface CurrencyAttributes {
  id: number;
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExchangeRateAttributes {
  id: number;
  fromCurrencyId: number;
  toCurrencyId: number;
  rate: number;
  effectiveDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CurrencyConversionRequest {
  fromCurrencyId: number;
  toCurrencyId: number;
  amount: number;
}

export interface CurrencyConversionResponse {
  originalAmount: number;
  convertedAmount: number;
  fromCurrency: CurrencyAttributes;
  toCurrency: CurrencyAttributes;
  rate: number;
  effectiveDate: Date;
}

export class CurrencyService {
  /**
   * Get all active currencies
   */
  static async getAllCurrencies(): Promise<CurrencyAttributes[]> {
    try {
      logger('Getting all active currencies');
      const currencies = await CurrencyModel.findAll({
        where: { isActive: true },
        order: [['code', 'ASC']]
      });
      return currencies.map(currency => currency.toJSON());
    } catch (error) {
      logger(`Error getting currencies: ${error}`);
      throw error;
    }
  }

  /**
   * Get currency by ID
   */
  static async getCurrencyById(id: number): Promise<CurrencyAttributes | null> {
    try {
      logger(`Getting currency by ID: ${id}`);
      const currency = await CurrencyModel.findByPk(id);
      return currency ? currency.toJSON() : null;
    } catch (error) {
      logger(`Error getting currency by ID: ${error}`);
      throw error;
    }
  }

  /**
   * Get currency by code
   */
  static async getCurrencyByCode(code: string): Promise<CurrencyAttributes | null> {
    try {
      logger(`Getting currency by code: ${code}`);
      const currency = await CurrencyModel.findOne({
        where: { code: code.toUpperCase(), isActive: true }
      });
      return currency ? currency.toJSON() : null;
    } catch (error) {
      logger(`Error getting currency by code: ${error}`);
      throw error;
    }
  }

  /**
   * Get default currency
   */
  static async getDefaultCurrency(): Promise<CurrencyAttributes | null> {
    try {
      logger('Getting default currency');
      const currency = await CurrencyModel.findOne({
        where: { isDefault: true, isActive: true }
      });
      return currency ? currency.toJSON() : null;
    } catch (error) {
      logger(`Error getting default currency: ${error}`);
      throw error;
    }
  }

  /**
   * Create new currency
   */
  static async createCurrency(currencyData: Omit<CurrencyAttributes, 'id' | 'createdAt' | 'updatedAt'>): Promise<CurrencyAttributes> {
    try {
      logger(`Creating new currency: ${currencyData.code}`);
      
      // Validate currency code format
      if (!/^[A-Z]{3}$/.test(currencyData.code)) {
        throw new Error('Currency code must be 3 uppercase letters (ISO 4217 format)');
      }

      // Check if currency code already exists
      const existingCurrency = await CurrencyModel.findOne({
        where: { code: currencyData.code }
      });

      if (existingCurrency) {
        throw new Error(`Currency with code ${currencyData.code} already exists`);
      }

      // If this is the first currency, make it default
      const currencyCount = await CurrencyModel.count();
      if (currencyCount === 0) {
        currencyData.isDefault = true;
      }

      const currency = await CurrencyModel.create(currencyData);
      return currency.toJSON();
    } catch (error) {
      logger(`Error creating currency: ${error}`);
      throw error;
    }
  }

  /**
   * Update currency
   */
  static async updateCurrency(id: number, currencyData: Partial<CurrencyAttributes>): Promise<CurrencyAttributes | null> {
    try {
      logger(`Updating currency ID: ${id}`);
      
      const currency = await CurrencyModel.findByPk(id);
      if (!currency) {
        return null;
      }

      // Validate currency code format if provided
      if (currencyData.code && !/^[A-Z]{3}$/.test(currencyData.code)) {
        throw new Error('Currency code must be 3 uppercase letters (ISO 4217 format)');
      }

      // Check if new code conflicts with existing currency
      if (currencyData.code && currencyData.code !== currency.code) {
        const existingCurrency = await CurrencyModel.findOne({
          where: { code: currencyData.code }
        });

        if (existingCurrency) {
          throw new Error(`Currency with code ${currencyData.code} already exists`);
        }
      }

      await currency.update(currencyData);
      return currency.toJSON();
    } catch (error) {
      logger(`Error updating currency: ${error}`);
      throw error;
    }
  }

  /**
   * Delete currency
   */
  static async deleteCurrency(id: number): Promise<boolean> {
    try {
      logger(`Deleting currency ID: ${id}`);
      
      const currency = await CurrencyModel.findByPk(id);
      if (!currency) {
        return false;
      }

      // Check if currency is in use
      const usageCount = await this.getCurrencyUsageCount(id);
      if (usageCount > 0) {
        throw new Error(`Cannot delete currency that is in use by ${usageCount} records`);
      }

      // Deactivate instead of deleting for data integrity
      await currency.update({ isActive: false });
      return true;
    } catch (error) {
      logger(`Error deleting currency: ${error}`);
      throw error;
    }
  }

  /**
   * Get currency usage count
   */
  static async getCurrencyUsageCount(currencyId: number): Promise<number> {
    try {
      const [businesses, items, sales, orders, saleItems, orderItems] = await Promise.all([
        BusinessModel.count({ where: { currencyId } }),
        ItemModel.count({ where: { currencyId } }),
        SaleModel.count({ where: { currencyId } }),
        OrderModel.count({ where: { currencyId } }),
        SaleItemModel.count({ where: { currencyId } }),
        OrderItemModel.count({ where: { currencyId } })
      ]);

      return businesses + items + sales + orders + saleItems + orderItems;
    } catch (error) {
      logger(`Error getting currency usage count: ${error}`);
      throw error;
    }
  }

  /**
   * Convert amount between currencies
   */
  static async convertCurrency(request: CurrencyConversionRequest): Promise<CurrencyConversionResponse> {
    try {
      logger(`Converting ${request.amount} from currency ${request.fromCurrencyId} to ${request.toCurrencyId}`);

      // Get currencies
      const [fromCurrency, toCurrency] = await Promise.all([
        CurrencyModel.findByPk(request.fromCurrencyId),
        CurrencyModel.findByPk(request.toCurrencyId)
      ]);

      if (!fromCurrency || !toCurrency) {
        throw new Error('One or both currencies not found');
      }

      // If same currency, return original amount
      if (request.fromCurrencyId === request.toCurrencyId) {
        return {
          originalAmount: request.amount,
          convertedAmount: request.amount,
          fromCurrency: fromCurrency.toJSON(),
          toCurrency: toCurrency.toJSON(),
          rate: 1,
          effectiveDate: new Date()
        };
      }

      // Get exchange rate
      const exchangeRate = await ExchangeRateModel.findOne({
        where: {
          fromCurrencyId: request.fromCurrencyId,
          toCurrencyId: request.toCurrencyId,
          isActive: true
        },
        order: [['effectiveDate', 'DESC']]
      });

      if (!exchangeRate) {
        throw new Error(`No exchange rate found for conversion from ${fromCurrency.code} to ${toCurrency.code}`);
      }

      const convertedAmount = request.amount * exchangeRate.rate;

      return {
        originalAmount: request.amount,
        convertedAmount: Number(convertedAmount.toFixed(toCurrency.decimalPlaces)),
        fromCurrency: fromCurrency.toJSON(),
        toCurrency: toCurrency.toJSON(),
        rate: exchangeRate.rate,
        effectiveDate: exchangeRate.effectiveDate
      };
    } catch (error) {
      logger(`Error converting currency: ${error}`);
      throw error;
    }
  }

  /**
   * Get all exchange rates for a currency
   */
  static async getCurrencyExchangeRates(currencyId: number): Promise<ExchangeRateAttributes[]> {
    try {
      logger(`Getting all exchange rates for currency ID: ${currencyId}`);

      const exchangeRates = await ExchangeRateModel.findAll({
        where: {
          [Op.or]: [
            { fromCurrencyId: currencyId },
            { toCurrencyId: currencyId }
          ],
          isActive: true
        },
        order: [['effectiveDate', 'DESC']]
      });

      return exchangeRates.map(rate => rate.toJSON());
    } catch (error) {
      logger(`Error getting exchange rates for currency: ${error}`);
      throw error;
    }
  }

  /**
   * Get current exchange rate
   */
  static async getExchangeRate(fromCurrencyId: number, toCurrencyId: number): Promise<ExchangeRateAttributes | null> {
    try {
      logger(`Getting exchange rate from ${fromCurrencyId} to ${toCurrencyId}`);

      const exchangeRate = await ExchangeRateModel.findOne({
        where: {
          fromCurrencyId,
          toCurrencyId,
          isActive: true
        },
        order: [['effectiveDate', 'DESC']]
      });

      return exchangeRate ? exchangeRate.toJSON() : null;
    } catch (error) {
      logger(`Error getting exchange rate: ${error}`);
      throw error;
    }
  }

  /**
   * Update exchange rate
   */
  static async updateExchangeRate(
    fromCurrencyId: number, 
    toCurrencyId: number, 
    rate: number, 
    effectiveDate: Date = new Date()
  ): Promise<ExchangeRateAttributes> {
    try {
      logger(`Updating exchange rate from ${fromCurrencyId} to ${toCurrencyId}: ${rate}`);

      // Validate currencies exist
      const [fromCurrency, toCurrency] = await Promise.all([
        CurrencyModel.findByPk(fromCurrencyId),
        CurrencyModel.findByPk(toCurrencyId)
      ]);

      if (!fromCurrency || !toCurrency) {
        throw new Error('One or both currencies not found');
      }

      // Validate rate is positive
      if (rate <= 0) {
        throw new Error('Exchange rate must be positive');
      }

      // Create or update exchange rate
      const [exchangeRate, created] = await ExchangeRateModel.findOrCreate({
        where: {
          fromCurrencyId,
          toCurrencyId,
          effectiveDate
        },
        defaults: {
          fromCurrencyId,
          toCurrencyId,
          rate,
          effectiveDate,
          isActive: true
        }
      });

      if (!created) {
        await exchangeRate.update({ rate });
      }

      return exchangeRate.toJSON();
    } catch (error) {
      logger(`Error updating exchange rate: ${error}`);
      throw error;
    }
  }

  /**
   * Format amount with currency symbol
   */
  static formatAmount(amount: number, currency: CurrencyAttributes): string {
    const formattedAmount = amount.toFixed(currency.decimalPlaces);
    return `${currency.symbol}${formattedAmount}`;
  }

  /**
   * Validate currency code format
   */
  static validateCurrencyCode(code: string): boolean {
    return /^[A-Z]{3}$/.test(code);
  }
} 