import { z } from 'zod';

export const reportPeriodSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export const trialBalanceQuerySchema = z.object({
  date: z.string().datetime().optional(),
});

export type ReportPeriodInput = z.infer<typeof reportPeriodSchema>;
export type TrialBalanceQueryInput = z.infer<typeof trialBalanceQuerySchema>;
