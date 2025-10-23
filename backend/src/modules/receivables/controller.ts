import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../shared/types';
import { ReceivableService } from './service';
import {
  createCustomerSchema,
  updateCustomerSchema,
  createReceivableInvoiceSchema,
  updateReceivableInvoiceSchema,
  createReceiptSchema,
  receivableQuerySchema,
} from './schemas';

const receivableService = new ReceivableService();

export class ReceivableController {
  // ========== CUSTOMERS ==========
  async getAllCustomers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customers = await receivableService.getAllCustomers();
      res.json({ success: true, data: customers });
    } catch (error) {
      next(error);
    }
  }

  async getCustomerById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customer = await receivableService.getCustomerById(req.params.id);
      res.json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  }

  async createCustomer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createCustomerSchema.parse(req.body);
      const customer = await receivableService.createCustomer(data);
      res.status(201).json({
        success: true,
        data: customer,
        message: 'Customer created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCustomer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateCustomerSchema.parse(req.body);
      const customer = await receivableService.updateCustomer(req.params.id, data);
      res.json({
        success: true,
        data: customer,
        message: 'Customer updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCustomer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await receivableService.deleteCustomer(req.params.id);
      res.json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  // ========== INVOICES ==========
  async getAllInvoices(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = receivableQuerySchema.parse(req.query);
      const invoices = await receivableService.getAllInvoices(query);
      res.json({ success: true, data: invoices });
    } catch (error) {
      next(error);
    }
  }

  async getInvoiceById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const invoice = await receivableService.getInvoiceById(req.params.id);
      res.json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  }

  async createInvoice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createReceivableInvoiceSchema.parse(req.body);
      const invoice = await receivableService.createInvoice(data);
      res.status(201).json({
        success: true,
        data: invoice,
        message: 'Invoice created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateInvoice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateReceivableInvoiceSchema.parse(req.body);
      const invoice = await receivableService.updateInvoice(req.params.id, data);
      res.json({
        success: true,
        data: invoice,
        message: 'Invoice updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // ========== RECEIPTS ==========
  async createReceipt(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createReceiptSchema.parse(req.body);
      const receipt = await receivableService.createReceipt(data, req.user!.id);
      res.status(201).json({
        success: true,
        data: receipt,
        message: 'Receipt created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getAgingSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const summary = await receivableService.getAgingSummary();
      res.json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  }
}
