import { z } from 'zod';
import { CashFlowCategory, CashFlowType, CashFlowStatus } from '@prisma/client';

export const createCashFlowProjectionSchema = z.object({
  date: z.string().datetime().or(z.date()),
  category: z.nativeEnum(CashFlowCategory),
  description: z.string().min(1),
  amount: z.number(),
  type: z.nativeEnum(CashFlowType),
  status: z.nativeEnum(CashFlowStatus).default('PROJECTED'),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export const updateCashFlowProjectionSchema = z.object({
  date: z.string().datetime().or(z.date()).optional(),
  description: z.string().min(1).optional(),
  amount: z.number().optional(),
  status: z.nativeEnum(CashFlowStatus).optional(),
  notes: z.string().optional(),
});

export const cashFlowQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  category: z.nativeEnum(CashFlowCategory).optional(),
  type: z.nativeEnum(CashFlowType).optional(),
  status: z.nativeEnum(CashFlowStatus).optional(),
});

export type CreateCashFlowProjectionInput = z.infer<typeof createCashFlowProjectionSchema>;
export type UpdateCashFlowProjectionInput = z.infer<typeof updateCashFlowProjectionSchema>;
export type CashFlowQueryInput = z.infer<typeof cashFlowQuerySchema>;
