import prisma from '../../config/database';
import { AppError } from '../../shared/middleware/errorHandler';
import { CreateAccountInput, UpdateAccountInput, AccountQueryInput } from './schemas';

export class AccountService {
  async getAll(query: AccountQueryInput) {
    const { type, isActive, parentId, search } = query;

    const where: any = {};

    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive;
    if (parentId) where.parentId = parentId;
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    return prisma.account.findMany({
      where,
      include: {
        parent: {
          select: { id: true, code: true, name: true },
        },
        children: {
          select: { id: true, code: true, name: true },
        },
      },
      orderBy: { code: 'asc' },
    });
  }

  async getById(id: string) {
    const account = await prisma.account.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        transactionLines: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            transaction: {
              select: {
                id: true,
                transactionNumber: true,
                date: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!account) {
      throw new AppError(404, 'Account not found');
    }

    return account;
  }

  async create(data: CreateAccountInput) {
    // Verificar que el código no exista
    const existing = await prisma.account.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new AppError(400, 'Account code already exists');
    }

    // Si tiene padre, verificar que exista
    if (data.parentId) {
      const parent = await prisma.account.findUnique({
        where: { id: data.parentId },
      });

      if (!parent) {
        throw new AppError(404, 'Parent account not found');
      }
    }

    return prisma.account.create({
      data,
      include: {
        parent: true,
      },
    });
  }

  async update(id: string, data: UpdateAccountInput) {
    const account = await prisma.account.findUnique({ where: { id } });

    if (!account) {
      throw new AppError(404, 'Account not found');
    }

    return prisma.account.update({
      where: { id },
      data,
      include: {
        parent: true,
      },
    });
  }

  async delete(id: string) {
    const account = await prisma.account.findUnique({
      where: { id },
      include: {
        children: true,
        transactionLines: true,
      },
    });

    if (!account) {
      throw new AppError(404, 'Account not found');
    }

    if (account.children.length > 0) {
      throw new AppError(400, 'Cannot delete account with child accounts');
    }

    if (account.transactionLines.length > 0) {
      throw new AppError(400, 'Cannot delete account with transactions');
    }

    await prisma.account.delete({ where: { id } });

    return { message: 'Account deleted successfully' };
  }

  async getHierarchy() {
    const accounts = await prisma.account.findMany({
      where: { level: 1 },
      include: {
        children: {
          include: {
            children: {
              include: {
                children: true,
              },
            },
          },
        },
      },
      orderBy: { code: 'asc' },
    });

    return accounts;
  }

  async getBalance(id: string, startDate?: Date, endDate?: Date) {
    const account = await prisma.account.findUnique({ where: { id } });

    if (!account) {
      throw new AppError(404, 'Account not found');
    }

    const where: any = { accountId: id };

    if (startDate || endDate) {
      where.transaction = {};
      if (startDate) where.transaction.date = { gte: startDate };
      if (endDate) where.transaction.date = { ...where.transaction.date, lte: endDate };
    }

    const lines = await prisma.transactionLine.findMany({
      where,
      include: {
        transaction: true,
      },
    });

    const totalDebit = lines.reduce((sum, line) => sum + Number(line.debit), 0);
    const totalCredit = lines.reduce((sum, line) => sum + Number(line.credit), 0);

    let balance = 0;
    if (account.type === 'ASSET' || account.type === 'EXPENSE') {
      balance = totalDebit - totalCredit;
    } else {
      balance = totalCredit - totalDebit;
    }

    return {
      account: {
        id: account.id,
        code: account.code,
        name: account.name,
        type: account.type,
      },
      totalDebit,
      totalCredit,
      balance,
      transactionCount: lines.length,
    };
  }
}
