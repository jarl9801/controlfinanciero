import { z } from 'zod';
import { InvoiceStatus, PaymentMethod } from '@prisma/client';

// Customer schemas
export const createCustomerSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  taxId: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  paymentTerms: z.number().int().min(0).default(30),
  creditLimit: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

// Invoice schemas
const invoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().min(0),
  unitPrice: z.number().min(0),
  taxRate: z.number().min(0).max(100).default(0),
  accountId: z.string().uuid().optional(),
  costCenterId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
});

export const createReceivableInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1),
  customerId: z.string().uuid(),
  issueDate: z.string().datetime().or(z.date()),
  dueDate: z.string().datetime().or(z.date()),
  description: z.string().optional(),
  currency: z.string().default('USD'),
  reference: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1),
});

export const updateReceivableInvoiceSchema = z.object({
  description: z.string().optional(),
  dueDate: z.string().datetime().or(z.date()).optional(),
  notes: z.string().optional(),
  status: z.nativeEnum(InvoiceStatus).optional(),
});

// Receipt (cobro) schemas
export const createReceiptSchema = z.object({
  invoiceId: z.string().uuid(),
  date: z.string().datetime().or(z.date()),
  amount: z.number().min(0.01),
  method: z.nativeEnum(PaymentMethod),
  reference: z.string().optional(),
  description: z.string().optional(),
});

export const receivableQuerySchema = z.object({
  customerId: z.string().uuid().optional(),
  status: z.nativeEnum(InvoiceStatus).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  overdue: z.boolean().optional(),
  search: z.string().optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CreateReceivableInvoiceInput = z.infer<typeof createReceivableInvoiceSchema>;
export type UpdateReceivableInvoiceInput = z.infer<typeof updateReceivableInvoiceSchema>;
export type CreateReceiptInput = z.infer<typeof createReceiptSchema>;
export type ReceivableQueryInput = z.infer<typeof receivableQuerySchema>;
