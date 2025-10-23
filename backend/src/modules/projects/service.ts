import prisma from '../../config/database';
import { AppError } from '../../shared/middleware/errorHandler';
import { CreateProjectInput, UpdateProjectInput } from './schemas';

export class ProjectService {
  async getAll() {
    return prisma.project.findMany({
      orderBy: { startDate: 'desc' },
    });
  }

  async getById(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        transactionLines: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            transaction: {
              select: { id: true, transactionNumber: true, date: true, description: true },
            },
            account: {
              select: { id: true, code: true, name: true, type: true },
            },
          },
        },
        budgets: true,
      },
    });

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    return project;
  }

  async create(data: CreateProjectInput) {
    const existing = await prisma.project.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new AppError(400, 'Project code already exists');
    }

    return prisma.project.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
  }

  async update(id: string, data: UpdateProjectInput) {
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    return prisma.project.update({
      where: { id },
      data: {
        ...data,
        ...(data.endDate && { endDate: new Date(data.endDate) }),
      },
    });
  }

  async delete(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { transactionLines: true },
    });

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    if (project.transactionLines.length > 0) {
      throw new AppError(400, 'Cannot delete project with transactions');
    }

    await prisma.project.delete({ where: { id } });
    return { message: 'Project deleted successfully' };
  }

  async getFinancialSummary(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        transactionLines: {
          include: {
            account: true,
          },
        },
      },
    });

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    const revenue = project.transactionLines
      .filter(line => line.account.type === 'INCOME')
      .reduce((sum, line) => sum + Number(line.credit) - Number(line.debit), 0);

    const expenses = project.transactionLines
      .filter(line => line.account.type === 'EXPENSE')
      .reduce((sum, line) => sum + Number(line.debit) - Number(line.credit), 0);

    const profit = revenue - expenses;
    const budgetUsed = Number(project.budget) > 0 ? (expenses / Number(project.budget)) * 100 : 0;

    return {
      project: {
        id: project.id,
        code: project.code,
        name: project.name,
        status: project.status,
        budget: Number(project.budget),
      },
      revenue,
      expenses,
      profit,
      budgetUsed: parseFloat(budgetUsed.toFixed(2)),
      transactionCount: project.transactionLines.length,
    };
  }
}
