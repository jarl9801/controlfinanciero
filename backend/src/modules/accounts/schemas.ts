import { z } from 'zod';
import { AccountType, AccountCategory } from '@prisma/client';

export const createAccountSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.nativeEnum(AccountType),
  category: z.nativeEnum(AccountCategory),
  parentId: z.string().uuid().optional(),
  level: z.number().int().min(1).default(1),
  allowsTransactions: z.boolean().default(true),
  currency: z.string().default('USD'),
});

export const updateAccountSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  allowsTransactions: z.boolean().optional(),
});

export const accountQuerySchema = z.object({
  type: z.nativeEnum(AccountType).optional(),
  isActive: z.boolean().optional(),
  parentId: z.string().uuid().optional(),
  search: z.string().optional(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type AccountQueryInput = z.infer<typeof accountQuerySchema>;
