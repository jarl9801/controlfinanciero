import prisma from '../../config/database';
import { AppError } from '../../shared/middleware/errorHandler';
import {
  CreateCashFlowProjectionInput,
  UpdateCashFlowProjectionInput,
  CashFlowQueryInput,
} from './schemas';

export class CashFlowService {
  async getAll(query: CashFlowQueryInput) {
    const { startDate, endDate, category, type, status } = query;

    const where: any = {};

    if (startDate) where.date = { gte: new Date(startDate) };
    if (endDate) where.date = { ...where.date, lte: new Date(endDate) };
    if (category) where.category = category;
    if (type) where.type = type;
    if (status) where.status = status;

    return prisma.cashFlowProjection.findMany({
      where,
      orderBy: { date: 'asc' },
    });
  }

  async getById(id: string) {
    const projection = await prisma.cashFlowProjection.findUnique({
      where: { id },
    });

    if (!projection) {
      throw new AppError(404, 'Cash flow projection not found');
    }

    return projection;
  }

  async create(data: CreateCashFlowProjectionInput) {
    return prisma.cashFlowProjection.create({
      data: {
        ...data,
        date: new Date(data.date),
      },
    });
  }

  async update(id: string, data: UpdateCashFlowProjectionInput) {
    const projection = await prisma.cashFlowProjection.findUnique({
      where: { id },
    });

    if (!projection) {
      throw new AppError(404, 'Cash flow projection not found');
    }

    return prisma.cashFlowProjection.update({
      where: { id },
      data: {
        ...data,
        ...(data.date && { date: new Date(data.date) }),
      },
    });
  }

  async delete(id: string) {
    const projection = await prisma.cashFlowProjection.findUnique({
      where: { id },
    });

    if (!projection) {
      throw new AppError(404, 'Cash flow projection not found');
    }

    await prisma.cashFlowProjection.delete({ where: { id } });
    return { message: 'Cash flow projection deleted successfully' };
  }

  async getSummary(startDate: Date, endDate: Date) {
    const projections = await prisma.cashFlowProjection.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const summary = {
      operating: { inflow: 0, outflow: 0, net: 0 },
      investing: { inflow: 0, outflow: 0, net: 0 },
      financing: { inflow: 0, outflow: 0, net: 0 },
      total: { inflow: 0, outflow: 0, net: 0 },
    };

    projections.forEach(proj => {
      const amount = Number(proj.amount);
      const category = proj.category.toLowerCase() as 'operating' | 'investing' | 'financing';

      if (proj.type === 'INFLOW') {
        summary[category].inflow += amount;
        summary.total.inflow += amount;
      } else {
        summary[category].outflow += amount;
        summary.total.outflow += amount;
      }
    });

    summary.operating.net = summary.operating.inflow - summary.operating.outflow;
    summary.investing.net = summary.investing.inflow - summary.investing.outflow;
    summary.financing.net = summary.financing.inflow - summary.financing.outflow;
    summary.total.net = summary.total.inflow - summary.total.outflow;

    return summary;
  }

  async getMonthlyForecast(months: number = 12) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    const projections = await prisma.cashFlowProjection.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    const monthlyData: any[] = [];
    let runningBalance = 0;

    for (let i = 0; i < months; i++) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() + i);
      monthStart.setDate(1);

      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0);

      const monthProjections = projections.filter(
        p => p.date >= monthStart && p.date <= monthEnd
      );

      const inflow = monthProjections
        .filter(p => p.type === 'INFLOW')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const outflow = monthProjections
        .filter(p => p.type === 'OUTFLOW')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const net = inflow - outflow;
      runningBalance += net;

      monthlyData.push({
        month: monthStart.toISOString().substring(0, 7),
        inflow,
        outflow,
        net,
        runningBalance,
      });
    }

    return monthlyData;
  }
}
