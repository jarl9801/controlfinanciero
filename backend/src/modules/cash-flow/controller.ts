import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../shared/types';
import { CashFlowService } from './service';
import {
  createCashFlowProjectionSchema,
  updateCashFlowProjectionSchema,
  cashFlowQuerySchema,
} from './schemas';

const cashFlowService = new CashFlowService();

export class CashFlowController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = cashFlowQuerySchema.parse(req.query);
      const projections = await cashFlowService.getAll(query);
      res.json({ success: true, data: projections });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projection = await cashFlowService.getById(req.params.id);
      res.json({ success: true, data: projection });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createCashFlowProjectionSchema.parse(req.body);
      const projection = await cashFlowService.create(data);
      res.status(201).json({
        success: true,
        data: projection,
        message: 'Cash flow projection created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateCashFlowProjectionSchema.parse(req.body);
      const projection = await cashFlowService.update(req.params.id, data);
      res.json({
        success: true,
        data: projection,
        message: 'Cash flow projection updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await cashFlowService.delete(req.params.id);
      res.json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  async getSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'startDate and endDate are required',
        });
      }

      const summary = await cashFlowService.getSummary(
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  }

  async getForecast(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const months = req.query.months ? parseInt(req.query.months as string) : 12;
      const forecast = await cashFlowService.getMonthlyForecast(months);
      res.json({ success: true, data: forecast });
    } catch (error) {
      next(error);
    }
  }
}
