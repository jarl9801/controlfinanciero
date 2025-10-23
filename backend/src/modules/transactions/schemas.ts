import { z } from 'zod';
import { TransactionType, TransactionStatus } from '@prisma/client';

const transactionLineSchema = z.object({
  accountId: z.string().uuid(),
  description: z.string().optional(),
  debit: z.number().min(0).default(0),
  credit: z.number().min(0).default(0),
  costCenterId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
});

export const createTransactionSchema = z.object({
  date: z.string().datetime().or(z.date()),
  description: z.string().min(1),
  type: z.nativeEnum(TransactionType),
  reference: z.string().optional(),
  lines: z.array(transactionLineSchema).min(2),
}).refine(
  (data) => {
    // Validar que cada línea tenga débito O crédito, no ambos
    return data.lines.every(line =>
      (line.debit > 0 && line.credit === 0) ||
      (line.credit > 0 && line.debit === 0)
    );
  },
  { message: 'Each line must have either debit or credit, not both' }
).refine(
  (data) => {
    // Validar partida doble: suma de débitos = suma de créditos
    const totalDebit = data.lines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredit = data.lines.reduce((sum, line) => sum + line.credit, 0);
    return Math.abs(totalDebit - totalCredit) < 0.01; // Permitir diferencia mínima por decimales
  },
  { message: 'Total debits must equal total credits (double-entry bookkeeping)' }
);

export const updateTransactionSchema = z.object({
  date: z.string().datetime().or(z.date()).optional(),
  description: z.string().min(1).optional(),
  reference: z.string().optional(),
});

export const postTransactionSchema = z.object({
  id: z.string().uuid(),
});

export const voidTransactionSchema = z.object({
  id: z.string().uuid(),
});

export const transactionQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  type: z.nativeEnum(TransactionType).optional(),
  status: z.nativeEnum(TransactionStatus).optional(),
  accountId: z.string().uuid().optional(),
  costCenterId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  search: z.string().optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionQueryInput = z.infer<typeof transactionQuerySchema>;
export type TransactionLineInput = z.infer<typeof transactionLineSchema>;
