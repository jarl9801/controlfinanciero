import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../shared/types';
import { PayableService } from './service';
import {
  createVendorSchema,
  updateVendorSchema,
  createPayableInvoiceSchema,
  updatePayableInvoiceSchema,
  createPaymentSchema,
  payableQuerySchema,
} from './schemas';

const payableService = new PayableService();

export class PayableController {
  // ========== VENDORS ==========
  async getAllVendors(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const vendors = await payableService.getAllVendors();
      res.json({ success: true, data: vendors });
    } catch (error) {
      next(error);
    }
  }

  async getVendorById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const vendor = await payableService.getVendorById(req.params.id);
      res.json({ success: true, data: vendor });
    } catch (error) {
      next(error);
    }
  }

  async createVendor(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createVendorSchema.parse(req.body);
      const vendor = await payableService.createVendor(data);
      res.status(201).json({
        success: true,
        data: vendor,
        message: 'Vendor created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateVendor(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateVendorSchema.parse(req.body);
      const vendor = await payableService.updateVendor(req.params.id, data);
      res.json({
        success: true,
        data: vendor,
        message: 'Vendor updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteVendor(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await payableService.deleteVendor(req.params.id);
      res.json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  // ========== INVOICES ==========
  async getAllInvoices(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = payableQuerySchema.parse(req.query);
      const invoices = await payableService.getAllInvoices(query);
      res.json({ success: true, data: invoices });
    } catch (error) {
      next(error);
    }
  }

  async getInvoiceById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const invoice = await payableService.getInvoiceById(req.params.id);
      res.json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  }

  async createInvoice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createPayableInvoiceSchema.parse(req.body);
      const invoice = await payableService.createInvoice(data);
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
      const data = updatePayableInvoiceSchema.parse(req.body);
      const invoice = await payableService.updateInvoice(req.params.id, data);
      res.json({
        success: true,
        data: invoice,
        message: 'Invoice updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // ========== PAYMENTS ==========
  async createPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createPaymentSchema.parse(req.body);
      const payment = await payableService.createPayment(data, req.user!.id);
      res.status(201).json({
        success: true,
        data: payment,
        message: 'Payment created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getAgingSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const summary = await payableService.getAgingSummary();
      res.json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  }
}
