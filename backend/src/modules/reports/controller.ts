import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../shared/types';
import { ReportService } from './service';
import { reportPeriodSchema } from './schemas';

const reportService = new ReportService();

export class ReportController {
  async getBalanceSheet(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const date = req.query.date ? new Date(req.query.date as string) : new Date();
      const report = await reportService.getBalanceSheet(date);
      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }

  async getIncomeStatement(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const period = reportPeriodSchema.parse(req.query);
      const report = await reportService.getIncomeStatement(period);
      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }

  async getTrialBalance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const date = req.query.date ? new Date(req.query.date as string) : new Date();
      const report = await reportService.getTrialBalance(date);
      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }

  async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const dashboard = await reportService.getDashboard();
      res.json({ success: true, data: dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getCostCenterAnalysis(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const period = reportPeriodSchema.parse(req.query);
      const analysis = await reportService.getCostCenterAnalysis(period);
      res.json({ success: true, data: analysis });
    } catch (error) {
      next(error);
    }
  }

  async getProjectAnalysis(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const period = reportPeriodSchema.parse(req.query);
      const analysis = await reportService.getProjectAnalysis(period);
      res.json({ success: true, data: analysis });
    } catch (error) {
      next(error);
    }
  }
}
