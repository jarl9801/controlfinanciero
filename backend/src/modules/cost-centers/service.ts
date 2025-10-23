import prisma from '../../config/database';
import { AppError } from '../../shared/middleware/errorHandler';
import { CreateCostCenterInput, UpdateCostCenterInput } from './schemas';

export class CostCenterService {
  async getAll() {
    return prisma.costCenter.findMany({
      include: {
        parent: { select: { id: true, code: true, name: true } },
        children: { select: { id: true, code: true, name: true } },
      },
      orderBy: { code: 'asc' },
    });
  }

  async getById(id: string) {
    const costCenter = await prisma.costCenter.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        transactionLines: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            transaction: {
              select: { id: true, transactionNumber: true, date: true, description: true },
            },
            account: {
              select: { id: true, code: true, name: true },
            },
          },
        },
      },
    });

    if (!costCenter) {
      throw new AppError(404, 'Cost center not found');
    }

    return costCenter;
  }

  async create(data: CreateCostCenterInput) {
    const existing = await prisma.costCenter.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new AppError(400, 'Cost center code already exists');
    }

    return prisma.costCenter.create({ data });
  }

  async update(id: string, data: UpdateCostCenterInput) {
    const costCenter = await prisma.costCenter.findUnique({ where: { id } });

    if (!costCenter) {
      throw new AppError(404, 'Cost center not found');
    }

    return prisma.costCenter.update({ where: { id }, data });
  }

  async delete(id: string) {
    const costCenter = await prisma.costCenter.findUnique({
      where: { id },
      include: { transactionLines: true, children: true },
    });

    if (!costCenter) {
      throw new AppError(404, 'Cost center not found');
    }

    if (costCenter.children.length > 0) {
      throw new AppError(400, 'Cannot delete cost center with children');
    }

    if (costCenter.transactionLines.length > 0) {
      throw new AppError(400, 'Cannot delete cost center with transactions');
    }

    await prisma.costCenter.delete({ where: { id } });
    return { message: 'Cost center deleted successfully' };
  }

  async getExpenseReport(id: string, startDate?: Date, endDate?: Date) {
    const where: any = { costCenterId: id };

    if (startDate || endDate) {
      where.transaction = {};
      if (startDate) where.transaction.date = { gte: startDate };
      if (endDate) where.transaction.date = { ...where.transaction.date, lte: endDate };
    }

    const lines = await prisma.transactionLine.findMany({
      where,
      include: {
        account: true,
        transaction: true,
      },
    });

    const totalDebit = lines.reduce((sum, line) => sum + Number(line.debit), 0);
    const totalCredit = lines.reduce((sum, line) => sum + Number(line.credit), 0);

    return {
      costCenterId: id,
      totalDebit,
      totalCredit,
      netExpense: totalDebit - totalCredit,
      transactionCount: lines.length,
      lines: lines.slice(0, 50),
    };
  }
}
