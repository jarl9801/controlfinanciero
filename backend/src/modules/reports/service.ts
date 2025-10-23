import prisma from '../../config/database';
import { ReportPeriodInput } from './schemas';

export class ReportService {
  // Balance General (Balance Sheet)
  async getBalanceSheet(date: Date = new Date()) {
    const accounts = await prisma.account.findMany({
      where: {
        type: { in: ['ASSET', 'LIABILITY', 'EQUITY'] },
      },
      include: {
        transactionLines: {
          where: {
            transaction: {
              date: { lte: date },
              status: 'POSTED',
            },
          },
        },
      },
    });

    const balances = accounts.map(account => {
      const totalDebit = account.transactionLines.reduce(
        (sum, line) => sum + Number(line.debit),
        0
      );
      const totalCredit = account.transactionLines.reduce(
        (sum, line) => sum + Number(line.credit),
        0
      );

      let balance = 0;
      if (account.type === 'ASSET') {
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
        balance,
      };
    });

    const assets = balances.filter(b => b.account.type === 'ASSET');
    const liabilities = balances.filter(b => b.account.type === 'LIABILITY');
    const equity = balances.filter(b => b.account.type === 'EQUITY');

    const totalAssets = assets.reduce((sum, b) => sum + b.balance, 0);
    const totalLiabilities = liabilities.reduce((sum, b) => sum + b.balance, 0);
    const totalEquity = equity.reduce((sum, b) => sum + b.balance, 0);

    return {
      date,
      assets: {
        accounts: assets,
        total: totalAssets,
      },
      liabilities: {
        accounts: liabilities,
        total: totalLiabilities,
      },
      equity: {
        accounts: equity,
        total: totalEquity,
      },
      totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
      balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
    };
  }

  // Estado de Resultados (Income Statement / P&L)
  async getIncomeStatement(period: ReportPeriodInput) {
    const { startDate, endDate } = period;

    const accounts = await prisma.account.findMany({
      where: {
        type: { in: ['INCOME', 'EXPENSE'] },
      },
      include: {
        transactionLines: {
          where: {
            transaction: {
              date: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
              status: 'POSTED',
            },
          },
        },
      },
    });

    const balances = accounts.map(account => {
      const totalDebit = account.transactionLines.reduce(
        (sum, line) => sum + Number(line.debit),
        0
      );
      const totalCredit = account.transactionLines.reduce(
        (sum, line) => sum + Number(line.credit),
        0
      );

      let balance = 0;
      if (account.type === 'INCOME') {
        balance = totalCredit - totalDebit;
      } else {
        balance = totalDebit - totalCredit;
      }

      return {
        account: {
          id: account.id,
          code: account.code,
          name: account.name,
          type: account.type,
          category: account.category,
        },
        balance,
      };
    });

    const income = balances.filter(b => b.account.type === 'INCOME');
    const expenses = balances.filter(b => b.account.type === 'EXPENSE');

    const totalIncome = income.reduce((sum, b) => sum + b.balance, 0);
    const totalExpenses = expenses.reduce((sum, b) => sum + b.balance, 0);
    const netIncome = totalIncome - totalExpenses;

    return {
      period: { startDate, endDate },
      income: {
        accounts: income,
        total: totalIncome,
      },
      expenses: {
        accounts: expenses,
        total: totalExpenses,
      },
      netIncome,
    };
  }

  // Balance de Comprobación (Trial Balance)
  async getTrialBalance(date: Date = new Date()) {
    const accounts = await prisma.account.findMany({
      where: {
        allowsTransactions: true,
      },
      include: {
        transactionLines: {
          where: {
            transaction: {
              date: { lte: date },
              status: 'POSTED',
            },
          },
        },
      },
    });

    const balances = accounts.map(account => {
      const totalDebit = account.transactionLines.reduce(
        (sum, line) => sum + Number(line.debit),
        0
      );
      const totalCredit = account.transactionLines.reduce(
        (sum, line) => sum + Number(line.credit),
        0
      );

      return {
        account: {
          id: account.id,
          code: account.code,
          name: account.name,
          type: account.type,
        },
        debit: totalDebit,
        credit: totalCredit,
        balance: totalDebit - totalCredit,
      };
    }).filter(b => b.debit !== 0 || b.credit !== 0);

    const totalDebit = balances.reduce((sum, b) => sum + b.debit, 0);
    const totalCredit = balances.reduce((sum, b) => sum + b.credit, 0);

    return {
      date,
      accounts: balances,
      totals: {
        debit: totalDebit,
        credit: totalCredit,
        balanced: Math.abs(totalDebit - totalCredit) < 0.01,
      },
    };
  }

  // Dashboard financiero
  async getDashboard() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Resumen mensual
    const monthlyIncome = await this.getIncomeStatement({
      startDate: startOfMonth.toISOString(),
      endDate: now.toISOString(),
    });

    // Resumen anual
    const yearlyIncome = await this.getIncomeStatement({
      startDate: startOfYear.toISOString(),
      endDate: now.toISOString(),
    });

    // Balance actual
    const balanceSheet = await this.getBalanceSheet(now);

    // Cuentas por cobrar
    const receivables = await prisma.invoice.aggregate({
      where: {
        type: 'RECEIVABLE',
        status: { in: ['PENDING', 'PARTIAL'] },
      },
      _sum: { balance: true },
      _count: true,
    });

    // Cuentas por pagar
    const payables = await prisma.invoice.aggregate({
      where: {
        type: 'PAYABLE',
        status: { in: ['PENDING', 'PARTIAL'] },
      },
      _sum: { balance: true },
      _count: true,
    });

    // Facturas vencidas
    const overdueReceivables = await prisma.invoice.count({
      where: {
        type: 'RECEIVABLE',
        status: { in: ['PENDING', 'PARTIAL'] },
        dueDate: { lt: now },
      },
    });

    const overduePayables = await prisma.invoice.count({
      where: {
        type: 'PAYABLE',
        status: { in: ['PENDING', 'PARTIAL'] },
        dueDate: { lt: now },
      },
    });

    return {
      summary: {
        monthlyRevenue: monthlyIncome.income.total,
        monthlyExpenses: monthlyIncome.expenses.total,
        monthlyProfit: monthlyIncome.netIncome,
        yearlyRevenue: yearlyIncome.income.total,
        yearlyExpenses: yearlyIncome.expenses.total,
        yearlyProfit: yearlyIncome.netIncome,
        totalAssets: balanceSheet.assets.total,
        totalLiabilities: balanceSheet.liabilities.total,
        totalEquity: balanceSheet.equity.total,
      },
      receivables: {
        total: Number(receivables._sum.balance || 0),
        count: receivables._count,
        overdue: overdueReceivables,
      },
      payables: {
        total: Number(payables._sum.balance || 0),
        count: payables._count,
        overdue: overduePayables,
      },
    };
  }

  // Análisis por centro de costo
  async getCostCenterAnalysis(period: ReportPeriodInput) {
    const { startDate, endDate } = period;

    const costCenters = await prisma.costCenter.findMany({
      where: { isActive: true },
      include: {
        transactionLines: {
          where: {
            transaction: {
              date: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
              status: 'POSTED',
            },
          },
          include: {
            account: true,
          },
        },
      },
    });

    return costCenters.map(cc => {
      const totalDebit = cc.transactionLines.reduce(
        (sum, line) => sum + Number(line.debit),
        0
      );
      const totalCredit = cc.transactionLines.reduce(
        (sum, line) => sum + Number(line.credit),
        0
      );
      const expenses = cc.transactionLines
        .filter(line => line.account.type === 'EXPENSE')
        .reduce((sum, line) => sum + Number(line.debit) - Number(line.credit), 0);

      return {
        costCenter: {
          id: cc.id,
          code: cc.code,
          name: cc.name,
        },
        totalDebit,
        totalCredit,
        expenses,
        transactionCount: cc.transactionLines.length,
      };
    });
  }

  // Análisis por proyecto
  async getProjectAnalysis(period: ReportPeriodInput) {
    const { startDate, endDate } = period;

    const projects = await prisma.project.findMany({
      where: { isActive: true },
      include: {
        transactionLines: {
          where: {
            transaction: {
              date: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
              status: 'POSTED',
            },
          },
          include: {
            account: true,
          },
        },
      },
    });

    return projects.map(project => {
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
    });
  }
}
