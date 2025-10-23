import prisma from '../../config/database';
import { AppError } from '../../shared/middleware/errorHandler';
import {
  CreateVendorInput,
  UpdateVendorInput,
  CreatePayableInvoiceInput,
  UpdatePayableInvoiceInput,
  CreatePaymentInput,
  PayableQueryInput,
} from './schemas';
import { Prisma } from '@prisma/client';

export class PayableService {
  // ========== VENDORS ==========
  async getAllVendors() {
    return prisma.vendor.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getVendorById(id: string) {
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        invoices: {
          orderBy: { issueDate: 'desc' },
          take: 10,
        },
      },
    });

    if (!vendor) {
      throw new AppError(404, 'Vendor not found');
    }

    return vendor;
  }

  async createVendor(data: CreateVendorInput) {
    const existing = await prisma.vendor.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new AppError(400, 'Vendor code already exists');
    }

    return prisma.vendor.create({ data });
  }

  async updateVendor(id: string, data: UpdateVendorInput) {
    const vendor = await prisma.vendor.findUnique({ where: { id } });

    if (!vendor) {
      throw new AppError(404, 'Vendor not found');
    }

    return prisma.vendor.update({
      where: { id },
      data,
    });
  }

  async deleteVendor(id: string) {
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: { invoices: true },
    });

    if (!vendor) {
      throw new AppError(404, 'Vendor not found');
    }

    if (vendor.invoices.length > 0) {
      throw new AppError(400, 'Cannot delete vendor with invoices');
    }

    await prisma.vendor.delete({ where: { id } });

    return { message: 'Vendor deleted successfully' };
  }

  // ========== INVOICES ==========
  async getAllInvoices(query: PayableQueryInput) {
    const { vendorId, status, startDate, endDate, overdue, search } = query;

    const where: any = { type: 'PAYABLE' };

    if (vendorId) where.vendorId = vendorId;
    if (status) where.status = status;
    if (startDate) where.issueDate = { gte: new Date(startDate) };
    if (endDate) where.issueDate = { ...where.issueDate, lte: new Date(endDate) };
    if (overdue) {
      where.dueDate = { lt: new Date() };
      where.status = { in: ['PENDING', 'PARTIAL'] };
    }
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    return prisma.invoice.findMany({
      where,
      include: {
        vendor: {
          select: { id: true, code: true, name: true },
        },
        items: true,
      },
      orderBy: { issueDate: 'desc' },
    });
  }

  async getInvoiceById(id: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        vendor: true,
        items: true,
        payments: true,
        attachments: true,
      },
    });

    if (!invoice || invoice.type !== 'PAYABLE') {
      throw new AppError(404, 'Invoice not found');
    }

    return invoice;
  }

  async createInvoice(data: CreatePayableInvoiceInput) {
    const vendor = await prisma.vendor.findUnique({
      where: { id: data.vendorId },
    });

    if (!vendor) {
      throw new AppError(404, 'Vendor not found');
    }

    // Calcular totales
    const items = data.items.map(item => {
      const subtotal = item.quantity * item.unitPrice;
      const tax = subtotal * (item.taxRate / 100);
      const total = subtotal + tax;
      return { ...item, total };
    });

    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      return sum + (itemSubtotal * (item.taxRate / 100));
    }, 0);
    const total = subtotal + taxAmount;

    return prisma.invoice.create({
      data: {
        invoiceNumber: data.invoiceNumber,
        type: 'PAYABLE',
        vendorId: data.vendorId,
        issueDate: new Date(data.issueDate),
        dueDate: new Date(data.dueDate),
        description: data.description,
        subtotal: new Prisma.Decimal(subtotal),
        taxAmount: new Prisma.Decimal(taxAmount),
        total: new Prisma.Decimal(total),
        balance: new Prisma.Decimal(total),
        currency: data.currency,
        reference: data.reference,
        notes: data.notes,
        status: 'PENDING',
        items: {
          create: items.map(item => ({
            description: item.description,
            quantity: new Prisma.Decimal(item.quantity),
            unitPrice: new Prisma.Decimal(item.unitPrice),
            taxRate: new Prisma.Decimal(item.taxRate),
            total: new Prisma.Decimal(item.total),
            accountId: item.accountId,
            costCenterId: item.costCenterId,
            projectId: item.projectId,
          })),
        },
      },
      include: {
        vendor: true,
        items: true,
      },
    });
  }

  async updateInvoice(id: string, data: UpdatePayableInvoiceInput) {
    const invoice = await prisma.invoice.findUnique({ where: { id } });

    if (!invoice || invoice.type !== 'PAYABLE') {
      throw new AppError(404, 'Invoice not found');
    }

    if (invoice.status === 'PAID') {
      throw new AppError(400, 'Cannot update paid invoice');
    }

    return prisma.invoice.update({
      where: { id },
      data: {
        ...(data.description !== undefined && { description: data.description }),
        ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.status && { status: data.status }),
      },
      include: {
        vendor: true,
        items: true,
      },
    });
  }

  // ========== PAYMENTS ==========
  async createPayment(data: CreatePaymentInput, userId: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: data.invoiceId },
    });

    if (!invoice || invoice.type !== 'PAYABLE') {
      throw new AppError(404, 'Invoice not found');
    }

    if (invoice.status === 'PAID') {
      throw new AppError(400, 'Invoice already paid');
    }

    if (invoice.status === 'CANCELLED') {
      throw new AppError(400, 'Cannot pay cancelled invoice');
    }

    if (data.amount > Number(invoice.balance)) {
      throw new AppError(400, 'Payment amount exceeds invoice balance');
    }

    // Generar número de pago
    const count = await prisma.payment.count({ where: { type: 'OUTGOING' } });
    const paymentNumber = `PAY-${String(count + 1).padStart(6, '0')}`;

    const newBalance = Number(invoice.balance) - data.amount;
    const newStatus = newBalance === 0 ? 'PAID' : 'PARTIAL';

    // Crear pago y actualizar factura
    const payment = await prisma.$transaction(async (tx) => {
      const pmt = await tx.payment.create({
        data: {
          paymentNumber,
          type: 'OUTGOING',
          invoiceId: data.invoiceId,
          date: new Date(data.date),
          amount: new Prisma.Decimal(data.amount),
          method: data.method,
          reference: data.reference,
          description: data.description,
          userId,
          status: 'COMPLETED',
        },
      });

      await tx.invoice.update({
        where: { id: data.invoiceId },
        data: {
          paidAmount: { increment: new Prisma.Decimal(data.amount) },
          balance: new Prisma.Decimal(newBalance),
          status: newStatus,
        },
      });

      return pmt;
    });

    return payment;
  }

  async getAgingSummary() {
    const invoices = await prisma.invoice.findMany({
      where: {
        type: 'PAYABLE',
        status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] },
      },
      include: {
        vendor: {
          select: { name: true },
        },
      },
    });

    const now = new Date();
    const aging = {
      current: 0,
      days30: 0,
      days60: 0,
      days90: 0,
      over90: 0,
    };

    invoices.forEach(invoice => {
      const daysPastDue = Math.floor(
        (now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const balance = Number(invoice.balance);

      if (daysPastDue <= 0) {
        aging.current += balance;
      } else if (daysPastDue <= 30) {
        aging.days30 += balance;
      } else if (daysPastDue <= 60) {
        aging.days60 += balance;
      } else if (daysPastDue <= 90) {
        aging.days90 += balance;
      } else {
        aging.over90 += balance;
      }
    });

    return {
      aging,
      total: Object.values(aging).reduce((sum, val) => sum + val, 0),
      invoiceCount: invoices.length,
    };
  }
}
