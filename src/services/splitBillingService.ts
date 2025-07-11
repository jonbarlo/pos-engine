import { logger } from '../utils/logger';
import { SaleModel, SaleStatus } from '../models/SaleModel';
import { SaleService } from './saleService';

export interface SplitPayment {
  amount: number;
  method: string;
  customerName?: string;
  customerPhone?: string;
  reference?: string;
}

export interface SplitSaleRequest {
  businessId: number;
  userId: number;
  totalAmount: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  notes?: string;
  items: Array<{
    itemId: number;
    quantity: number;
    unitPrice: number;
  }>;
  payments: SplitPayment[];
}

export interface AddPaymentRequest {
  saleId: number;
  businessId: number;
  payment: SplitPayment;
}

export interface RefundRequest {
  saleId: number;
  businessId: number;
  paymentIndex: number;
  refundAmount: number;
  reason?: string;
}

export class SplitBillingService {
  /**
   * Create a sale with split payments
   */
  static async createSplitSale(data: SplitSaleRequest): Promise<any> {
    try {
      // Validate that total payment amount equals total amount
      const totalPaymentAmount = data.payments.reduce((sum, payment) => sum + payment.amount, 0);
      if (Math.abs(totalPaymentAmount - data.totalAmount) > 0.01) {
        throw new Error('Total payment amount must equal total amount');
      }

      const saleData: any = {
        businessId: data.businessId,
        userId: data.userId,
        totalAmount: data.totalAmount,
        status: SaleStatus.COMPLETED,
        payments: data.payments.map(payment => ({
          ...payment,
          paidAt: new Date()
        }))
      };

      // Only add optional fields if they exist
      if (data.customerName) saleData.customerName = data.customerName;
      if (data.customerPhone) saleData.customerPhone = data.customerPhone;
      if (data.customerEmail) saleData.customerEmail = data.customerEmail;
      if (data.notes) saleData.notes = data.notes;

      const sale = await SaleModel.create(saleData);

      // Create sale items if provided
      if (data.items && data.items.length > 0) {
        await SaleService.createSaleWithItems(saleData, data.items);
      }

      logger(`Created split sale ${sale.id} with ${data.payments.length} payments`);

      return {
        message: 'Split sale created successfully',
        sale: {
          id: sale.id,
          totalAmount: sale.totalAmount,
          status: sale.status,
          payments: sale.payments,
          createdAt: sale.createdAt
        }
      };
    } catch (error) {
      logger(`Error creating split sale: ${error}`);
      throw error;
    }
  }

  /**
   * Add payment to existing sale
   */
  static async addPayment(data: AddPaymentRequest): Promise<any> {
    try {
      const sale = await SaleModel.findOne({
        where: { id: data.saleId, businessId: data.businessId }
      });

      if (!sale) {
        throw new Error('Sale not found');
      }

      // Get current payments
      const currentPayments = sale.payments || [];
      const newPayment = {
        ...data.payment,
        paidAt: new Date()
      };

      // Add new payment
      const updatedPayments = [...currentPayments, newPayment];
      const totalPaid = updatedPayments.reduce((sum, payment) => sum + payment.amount, 0);

      // Update sale
      await sale.update({
        payments: updatedPayments,
        status: totalPaid >= sale.totalAmount ? SaleStatus.COMPLETED : SaleStatus.PENDING
      });

      logger(`Added payment to sale ${data.saleId}`);

      return {
        message: 'Payment added successfully',
        sale: {
          id: sale.id,
          totalAmount: sale.totalAmount,
          status: sale.status,
          payments: sale.payments,
          totalPaid
        }
      };
    } catch (error) {
      logger(`Error adding payment: ${error}`);
      throw error;
    }
  }

  /**
   * Get sale with split payment details
   */
  static async getSaleWithPayments(saleId: number, businessId: number): Promise<any> {
    try {
      const sale = await SaleModel.findOne({
        where: { id: saleId, businessId }
      });

      if (!sale) {
        return null;
      }

      const payments = sale.payments || [];
      const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
      const remainingAmount = sale.totalAmount - totalPaid;

      return {
        id: sale.id,
        totalAmount: sale.totalAmount,
        status: sale.status,
        customerName: sale.customerName,
        customerPhone: sale.customerPhone,
        customerEmail: sale.customerEmail,
        notes: sale.notes,
        payments,
        totalPaid,
        remainingAmount,
        createdAt: sale.createdAt,
        updatedAt: sale.updatedAt
      };
    } catch (error) {
      logger(`Error getting sale with payments: ${error}`);
      throw error;
    }
  }

  /**
   * Refund a split payment
   */
  static async refundPayment(data: RefundRequest): Promise<any> {
    try {
      const sale = await SaleModel.findOne({
        where: { id: data.saleId, businessId: data.businessId }
      });

      if (!sale) {
        throw new Error('Sale not found');
      }

      const payments = sale.payments || [];
      
      if (data.paymentIndex < 0 || data.paymentIndex >= payments.length) {
        throw new Error('Invalid payment index');
      }

      const payment = payments[data.paymentIndex];
      
      if (!payment) {
        throw new Error('Payment not found');
      }
      
      if (data.refundAmount > payment.amount) {
        throw new Error('Refund amount cannot exceed payment amount');
      }

      // Create refund record
      const refund = {
        amount: -data.refundAmount,
        method: payment.method,
        customerName: payment.customerName,
        customerPhone: payment.customerPhone,
        reference: `REFUND-${Date.now()}`,
        paidAt: new Date()
      };

      // Add refund to payments
      const updatedPayments = [...payments, refund];
      
      // Update sale status
      const totalPaid = updatedPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const newStatus = totalPaid >= sale.totalAmount ? SaleStatus.COMPLETED : 
                       totalPaid < 0 ? SaleStatus.REFUNDED : SaleStatus.PENDING;

      await sale.update({
        payments: updatedPayments as any,
        status: newStatus
      });

      logger(`Refunded payment ${data.paymentIndex} from sale ${data.saleId}`);

      return {
        message: 'Refund processed successfully',
        sale: {
          id: sale.id,
          totalAmount: sale.totalAmount,
          status: sale.status,
          refundAmount: data.refundAmount,
          totalPaid
        }
      };
    } catch (error) {
      logger(`Error refunding payment: ${error}`);
      throw error;
    }
  }

  /**
   * Get split billing statistics
   */
  static async getSplitBillingStats(businessId: number): Promise<any> {
    try {
      const sales = await SaleModel.findAll({
        where: { businessId },
        attributes: ['id', 'totalAmount', 'status', 'payments']
      });

      let totalSplitSales = 0;
      let totalAmount = 0;
      let totalPayments = 0;

      sales.forEach(sale => {
        const payments = sale.payments || [];
        if (payments.length > 1) {
          totalSplitSales++;
          totalAmount += sale.totalAmount;
          totalPayments += payments.length;
        }
      });

      return {
        totalSplitSales,
        totalAmount,
        averageSplitAmount: totalSplitSales > 0 ? totalAmount / totalSplitSales : 0,
        averagePaymentsPerSale: totalSplitSales > 0 ? totalPayments / totalSplitSales : 0
      };
    } catch (error) {
      logger(`Error getting split billing stats: ${error}`);
      throw error;
    }
  }
}