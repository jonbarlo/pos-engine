import { Request, Response, NextFunction } from 'express';
import { SplitBillingService, SplitSaleRequest, AddPaymentRequest, RefundRequest } from '../services/splitBillingService';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export class SplitBillingController {
  /**
   * Create a sale with split payments
   */
  public static createSplitSale = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const businessId = req.user!.businessId;
      const splitSaleData: SplitSaleRequest = {
        ...req.body,
        businessId
      };

      // Validate required fields
      if (!splitSaleData.userId || !splitSaleData.totalAmount || 
          !splitSaleData.payments || splitSaleData.payments.length === 0) {
        res.status(400).json({ 
          error: req.t('errors.validation.splitSaleFieldsRequired') 
        });
        return;
      }

      logger(`API endpoint POST /sales/split was called...`);
      const result = await SplitBillingService.createSplitSale(splitSaleData);
      
      res.status(201).json(result);
    } catch (error) {
      logger(`Error creating split sale: ${error}`);
      res.status(500).json({ error: req.t('splitBilling.createSplitSale.error') });
    }
  };

  /**
   * Add payment to existing sale
   */
  public static addPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { saleId } = req.params;
      const businessId = req.user!.businessId;
      const payment = req.body;
      
      if (!saleId) {
        res.status(400).json({ error: req.t('errors.validation.saleIdRequired') });
        return;
      }
      
      const saleIdNum = parseInt(saleId);
      
      if (isNaN(saleIdNum)) {
        res.status(400).json({ error: req.t('errors.validation.invalidSaleId') });
        return;
      }

      if (!payment.amount || !payment.method) {
        res.status(400).json({ error: req.t('errors.validation.paymentAmountAndMethodRequired') });
        return;
      }

      const addPaymentData: AddPaymentRequest = {
        saleId: saleIdNum,
        businessId,
        payment
      };

      logger(`API endpoint POST /sales/${saleId}/payments was called...`);
      const result = await SplitBillingService.addPayment(addPaymentData);
      
      res.json(result);
    } catch (error) {
      logger(`Error adding payment: ${error}`);
      res.status(500).json({ error: req.t('splitBilling.addPayment.error') });
    }
  };

  /**
   * Get sale with split payment details
   */
  public static getSaleWithPayments = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const businessId = req.user!.businessId;
      
      if (!id) {
        res.status(400).json({ error: req.t('errors.validation.saleIdRequired') });
        return;
      }
      
      const saleId = parseInt(id);
      
      if (isNaN(saleId)) {
        res.status(400).json({ error: req.t('errors.validation.invalidSaleId') });
        return;
      }

      logger(`API endpoint GET /sales/${id} was called...`);
      const sale = await SplitBillingService.getSaleWithPayments(saleId, businessId);
      
      if (!sale) {
        res.status(404).json({ error: req.t('errors.server.saleNotFound') });
        return;
      }

      res.json(sale);
    } catch (error) {
      logger(`Error getting sale with payments: ${error}`);
      res.status(500).json({ error: req.t('splitBilling.getSaleWithPayments.error') });
    }
  };

  /**
   * Refund a split payment
   */
  public static refundPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { saleId } = req.params;
      const businessId = req.user!.businessId;
      const { paymentIndex, refundAmount, reason } = req.body;
      
      if (!saleId) {
        res.status(400).json({ error: req.t('errors.validation.saleIdRequired') });
        return;
      }
      
      const saleIdNum = parseInt(saleId);
      
      if (isNaN(saleIdNum)) {
        res.status(400).json({ error: req.t('errors.validation.invalidSaleId') });
        return;
      }

      if (paymentIndex === undefined || !refundAmount) {
        res.status(400).json({ error: req.t('errors.validation.paymentIndexAndRefundAmountRequired') });
        return;
      }

      const refundData: RefundRequest = {
        saleId: saleIdNum,
        businessId,
        paymentIndex,
        refundAmount,
        reason
      };

      logger(`API endpoint POST /sales/${saleId}/refund was called...`);
      const result = await SplitBillingService.refundPayment(refundData);
      
      res.json(result);
    } catch (error) {
      logger(`Error refunding payment: ${error}`);
      res.status(500).json({ error: req.t('splitBilling.refundPayment.error') });
    }
  };

  /**
   * Get split billing statistics
   */
  public static getSplitBillingStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const businessId = req.user!.businessId;

      logger('API endpoint GET /sales/split/stats was called...');
      const stats = await SplitBillingService.getSplitBillingStats(businessId);
      
      res.json(stats);
    } catch (error) {
      logger(`Error getting split billing stats: ${error}`);
      res.status(500).json({ error: req.t('splitBilling.getSplitBillingStats.error') });
    }
  };
} 