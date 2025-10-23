import { z } from 'zod';
import { InvoiceStatus, PaymentMethod } from '@prisma/client';

// Vendor schemas
export const createVendorSchema = z.object({
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

export const updateVendorSchema = createVendorSchema.partial();

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

export const createPayableInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1),
  vendorId: z.string().uuid(),
  issueDate: z.string().datetime().or(z.date()),
  dueDate: z.string().datetime().or(z.date()),
  description: z.string().optional(),
  currency: z.string().default('USD'),
  reference: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1),
});

export const updatePayableInvoiceSchema = z.object({
  description: z.string().optional(),
  dueDate: z.string().datetime().or(z.date()).optional(),
  notes: z.string().optional(),
  status: z.nativeEnum(InvoiceStatus).optional(),
});

// Payment schemas
export const createPaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  date: z.string().datetime().or(z.date()),
  amount: z.number().min(0.01),
  method: z.nativeEnum(PaymentMethod),
  reference: z.string().optional(),
  description: z.string().optional(),
});

export const payableQuerySchema = z.object({
  vendorId: z.string().uuid().optional(),
  status: z.nativeEnum(InvoiceStatus).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  overdue: z.boolean().optional(),
  search: z.string().optional(),
});

export type CreateVendorInput = z.infer<typeof createVendorSchema>;
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;
export type CreatePayableInvoiceInput = z.infer<typeof createPayableInvoiceSchema>;
export type UpdatePayableInvoiceInput = z.infer<typeof updatePayableInvoiceSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type PayableQueryInput = z.infer<typeof payableQuerySchema>;
