import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../shared/types';
import { TransactionService } from './service';
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionQuerySchema,
} from './schemas';

const transactionService = new TransactionService();

export class TransactionController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = transactionQuerySchema.parse(req.query);
      const transactions = await transactionService.getAll(query);

      res.json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const transaction = await transactionService.getById(req.params.id);

      res.json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createTransactionSchema.parse(req.body);
      const transaction = await transactionService.create(data, req.user!.id);

      res.status(201).json({
        success: true,
        data: transaction,
        message: 'Transaction created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateTransactionSchema.parse(req.body);
      const transaction = await transactionService.update(req.params.id, data);

      res.json({
        success: true,
        data: transaction,
        message: 'Transaction updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async post(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const transaction = await transactionService.post(req.params.id);

      res.json({
        success: true,
        data: transaction,
        message: 'Transaction posted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async void(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const transaction = await transactionService.void(req.params.id);

      res.json({
        success: true,
        data: transaction,
        message: 'Transaction voided successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await transactionService.delete(req.params.id);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}
