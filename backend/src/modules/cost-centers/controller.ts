import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../shared/types';
import { CostCenterService } from './service';
import { createCostCenterSchema, updateCostCenterSchema } from './schemas';

const costCenterService = new CostCenterService();

export class CostCenterController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const costCenters = await costCenterService.getAll();
      res.json({ success: true, data: costCenters });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const costCenter = await costCenterService.getById(req.params.id);
      res.json({ success: true, data: costCenter });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createCostCenterSchema.parse(req.body);
      const costCenter = await costCenterService.create(data);
      res.status(201).json({
        success: true,
        data: costCenter,
        message: 'Cost center created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateCostCenterSchema.parse(req.body);
      const costCenter = await costCenterService.update(req.params.id, data);
      res.json({
        success: true,
        data: costCenter,
        message: 'Cost center updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await costCenterService.delete(req.params.id);
      res.json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  async getExpenseReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const report = await costCenterService.getExpenseReport(
        req.params.id,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }
}
