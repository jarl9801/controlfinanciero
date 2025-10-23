import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../shared/types';
import { AccountService } from './service';
import { createAccountSchema, updateAccountSchema, accountQuerySchema } from './schemas';

const accountService = new AccountService();

export class AccountController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = accountQuerySchema.parse(req.query);
      const accounts = await accountService.getAll(query);

      res.json({
        success: true,
        data: accounts,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const account = await accountService.getById(req.params.id);

      res.json({
        success: true,
        data: account,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createAccountSchema.parse(req.body);
      const account = await accountService.create(data);

      res.status(201).json({
        success: true,
        data: account,
        message: 'Account created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateAccountSchema.parse(req.body);
      const account = await accountService.update(req.params.id, data);

      res.json({
        success: true,
        data: account,
        message: 'Account updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await accountService.delete(req.params.id);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHierarchy(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const accounts = await accountService.getHierarchy();

      res.json({
        success: true,
        data: accounts,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBalance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const balance = await accountService.getBalance(
        req.params.id,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json({
        success: true,
        data: balance,
      });
    } catch (error) {
      next(error);
    }
  }
}
