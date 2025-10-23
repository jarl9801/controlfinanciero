import prisma from '../../config/database';
import { AppError } from '../../shared/middleware/errorHandler';
import { CreateTransactionInput, UpdateTransactionInput, TransactionQueryInput } from './schemas';
import { Prisma } from '@prisma/client';

export class TransactionService {
  async getAll(query: TransactionQueryInput) {
    const { startDate, endDate, type, status, accountId, costCenterId, projectId, search } = query;

    const where: any = {};

    if (startDate) where.date = { gte: new Date(startDate) };
    if (endDate) where.date = { ...where.date, lte: new Date(endDate) };
    if (type) where.type = type;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { transactionNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (accountId || costCenterId || projectId) {
      where.lines = {
        some: {
          ...(accountId && { accountId }),
          ...(costCenterId && { costCenterId }),
          ...(projectId && { projectId }),
        },
      };
    }

    return prisma.transaction.findMany({
      where,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        lines: {
          include: {
            account: {
              select: { id: true, code: true, name: true, type: true },
            },
            costCenter: {
              select: { id: true, code: true, name: true },
            },
            project: {
              select: { id: true, code: true, name: true },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async getById(id: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        lines: {
          include: {
            account: true,
            costCenter: true,
            project: true,
          },
        },
        attachments: true,
      },
    });

    if (!transaction) {
      throw new AppError(404, 'Transaction not found');
    }

    return transaction;
  }

  async create(data: CreateTransactionInput, userId: string) {
    // Generar número de transacción
    const count = await prisma.transaction.count();
    const transactionNumber = `TRX-${String(count + 1).padStart(6, '0')}`;

    // Calcular totales
    const totalDebit = data.lines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredit = data.lines.reduce((sum, line) => sum + line.credit, 0);

    // Crear transacción con líneas
    const transaction = await prisma.transaction.create({
      data: {
        transactionNumber,
        date: new Date(data.date),
        description: data.description,
        type: data.type,
        reference: data.reference,
        totalDebit: new Prisma.Decimal(totalDebit),
        totalCredit: new Prisma.Decimal(totalCredit),
        userId,
        lines: {
          create: data.lines.map(line => ({
            accountId: line.accountId,
            description: line.description,
            debit: new Prisma.Decimal(line.debit),
            credit: new Prisma.Decimal(line.credit),
            costCenterId: line.costCenterId,
            projectId: line.projectId,
          })),
        },
      },
      include: {
        lines: {
          include: {
            account: true,
            costCenter: true,
            project: true,
          },
        },
      },
    });

    return transaction;
  }

  async update(id: string, data: UpdateTransactionInput) {
    const transaction = await prisma.transaction.findUnique({ where: { id } });

    if (!transaction) {
      throw new AppError(404, 'Transaction not found');
    }

    if (transaction.status === 'POSTED') {
      throw new AppError(400, 'Cannot update posted transaction');
    }

    if (transaction.status === 'VOID') {
      throw new AppError(400, 'Cannot update voided transaction');
    }

    return prisma.transaction.update({
      where: { id },
      data: {
        ...(data.date && { date: new Date(data.date) }),
        ...(data.description && { description: data.description }),
        ...(data.reference !== undefined && { reference: data.reference }),
      },
      include: {
        lines: {
          include: {
            account: true,
            costCenter: true,
            project: true,
          },
        },
      },
    });
  }

  async post(id: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { lines: true },
    });

    if (!transaction) {
      throw new AppError(404, 'Transaction not found');
    }

    if (transaction.status === 'POSTED') {
      throw new AppError(400, 'Transaction already posted');
    }

    if (transaction.status === 'VOID') {
      throw new AppError(400, 'Cannot post voided transaction');
    }

    // Actualizar saldos de cuentas
    for (const line of transaction.lines) {
      const account = await prisma.account.findUnique({
        where: { id: line.accountId },
      });

      if (!account) continue;

      let balanceChange = 0;
      if (account.type === 'ASSET' || account.type === 'EXPENSE') {
        balanceChange = Number(line.debit) - Number(line.credit);
      } else {
        balanceChange = Number(line.credit) - Number(line.debit);
      }

      await prisma.account.update({
        where: { id: line.accountId },
        data: {
          balance: {
            increment: new Prisma.Decimal(balanceChange),
          },
        },
      });
    }

    // Marcar como contabilizado
    return prisma.transaction.update({
      where: { id },
      data: { status: 'POSTED' },
      include: {
        lines: {
          include: {
            account: true,
            costCenter: true,
            project: true,
          },
        },
      },
    });
  }

  async void(id: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { lines: true },
    });

    if (!transaction) {
      throw new AppError(404, 'Transaction not found');
    }

    if (transaction.status === 'VOID') {
      throw new AppError(400, 'Transaction already voided');
    }

    // Si estaba contabilizada, revertir saldos
    if (transaction.status === 'POSTED') {
      for (const line of transaction.lines) {
        const account = await prisma.account.findUnique({
          where: { id: line.accountId },
        });

        if (!account) continue;

        let balanceChange = 0;
        if (account.type === 'ASSET' || account.type === 'EXPENSE') {
          balanceChange = Number(line.credit) - Number(line.debit);
        } else {
          balanceChange = Number(line.debit) - Number(line.credit);
        }

        await prisma.account.update({
          where: { id: line.accountId },
          data: {
            balance: {
              increment: new Prisma.Decimal(balanceChange),
            },
          },
        });
      }
    }

    return prisma.transaction.update({
      where: { id },
      data: { status: 'VOID' },
      include: {
        lines: {
          include: {
            account: true,
            costCenter: true,
            project: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    const transaction = await prisma.transaction.findUnique({ where: { id } });

    if (!transaction) {
      throw new AppError(404, 'Transaction not found');
    }

    if (transaction.status === 'POSTED') {
      throw new AppError(400, 'Cannot delete posted transaction. Void it first.');
    }

    await prisma.transaction.delete({ where: { id } });

    return { message: 'Transaction deleted successfully' };
  }
}
