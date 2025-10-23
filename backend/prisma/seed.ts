import { PrismaClient, AccountType, AccountCategory, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // 1. Crear usuario administrador
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@controlfinanciero.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Sistema',
      role: UserRole.ADMIN,
    },
  });
  console.log('✅ Usuario administrador creado');

  // 2. Crear plan de cuentas básico
  // ACTIVOS
  const activos = await prisma.account.create({
    data: {
      code: '1',
      name: 'ACTIVOS',
      type: AccountType.ASSET,
      category: 'CURRENT_ASSET' as AccountCategory,
      level: 1,
      allowsTransactions: false,
    },
  });

  await prisma.account.createMany({
    data: [
      {
        code: '1.1',
        name: 'ACTIVO CORRIENTE',
        type: AccountType.ASSET,
        category: 'CURRENT_ASSET' as AccountCategory,
        parentId: activos.id,
        level: 2,
        allowsTransactions: false,
      },
      {
        code: '1.1.1',
        name: 'Caja',
        type: AccountType.ASSET,
        category: 'CURRENT_ASSET' as AccountCategory,
        parentId: activos.id,
        level: 3,
        allowsTransactions: true,
      },
      {
        code: '1.1.2',
        name: 'Bancos',
        type: AccountType.ASSET,
        category: 'CURRENT_ASSET' as AccountCategory,
        parentId: activos.id,
        level: 3,
        allowsTransactions: true,
      },
      {
        code: '1.1.3',
        name: 'Cuentas por Cobrar',
        type: AccountType.ASSET,
        category: 'CURRENT_ASSET' as AccountCategory,
        parentId: activos.id,
        level: 3,
        allowsTransactions: true,
      },
      {
        code: '1.1.4',
        name: 'Inventario',
        type: AccountType.ASSET,
        category: 'CURRENT_ASSET' as AccountCategory,
        parentId: activos.id,
        level: 3,
        allowsTransactions: true,
      },
    ],
  });

  // PASIVOS
  const pasivos = await prisma.account.create({
    data: {
      code: '2',
      name: 'PASIVOS',
      type: AccountType.LIABILITY,
      category: 'CURRENT_LIABILITY' as AccountCategory,
      level: 1,
      allowsTransactions: false,
    },
  });

  await prisma.account.createMany({
    data: [
      {
        code: '2.1',
        name: 'PASIVO CORRIENTE',
        type: AccountType.LIABILITY,
        category: 'CURRENT_LIABILITY' as AccountCategory,
        parentId: pasivos.id,
        level: 2,
        allowsTransactions: false,
      },
      {
        code: '2.1.1',
        name: 'Cuentas por Pagar',
        type: AccountType.LIABILITY,
        category: 'CURRENT_LIABILITY' as AccountCategory,
        parentId: pasivos.id,
        level: 3,
        allowsTransactions: true,
      },
      {
        code: '2.1.2',
        name: 'Impuestos por Pagar',
        type: AccountType.LIABILITY,
        category: 'CURRENT_LIABILITY' as AccountCategory,
        parentId: pasivos.id,
        level: 3,
        allowsTransactions: true,
      },
    ],
  });

  // PATRIMONIO
  const patrimonio = await prisma.account.create({
    data: {
      code: '3',
      name: 'PATRIMONIO',
      type: AccountType.EQUITY,
      category: 'CAPITAL' as AccountCategory,
      level: 1,
      allowsTransactions: false,
    },
  });

  await prisma.account.createMany({
    data: [
      {
        code: '3.1',
        name: 'Capital Social',
        type: AccountType.EQUITY,
        category: 'CAPITAL' as AccountCategory,
        parentId: patrimonio.id,
        level: 2,
        allowsTransactions: true,
      },
      {
        code: '3.2',
        name: 'Resultados Acumulados',
        type: AccountType.EQUITY,
        category: 'RETAINED_EARNINGS' as AccountCategory,
        parentId: patrimonio.id,
        level: 2,
        allowsTransactions: true,
      },
    ],
  });

  // INGRESOS
  const ingresos = await prisma.account.create({
    data: {
      code: '4',
      name: 'INGRESOS',
      type: AccountType.INCOME,
      category: 'OPERATING_INCOME' as AccountCategory,
      level: 1,
      allowsTransactions: false,
    },
  });

  await prisma.account.createMany({
    data: [
      {
        code: '4.1',
        name: 'Ventas',
        type: AccountType.INCOME,
        category: 'OPERATING_INCOME' as AccountCategory,
        parentId: ingresos.id,
        level: 2,
        allowsTransactions: true,
      },
      {
        code: '4.2',
        name: 'Servicios',
        type: AccountType.INCOME,
        category: 'OPERATING_INCOME' as AccountCategory,
        parentId: ingresos.id,
        level: 2,
        allowsTransactions: true,
      },
    ],
  });

  // GASTOS
  const gastos = await prisma.account.create({
    data: {
      code: '5',
      name: 'GASTOS',
      type: AccountType.EXPENSE,
      category: 'OPERATING_EXPENSE' as AccountCategory,
      level: 1,
      allowsTransactions: false,
    },
  });

  await prisma.account.createMany({
    data: [
      {
        code: '5.1',
        name: 'Gastos Operativos',
        type: AccountType.EXPENSE,
        category: 'OPERATING_EXPENSE' as AccountCategory,
        parentId: gastos.id,
        level: 2,
        allowsTransactions: false,
      },
      {
        code: '5.1.1',
        name: 'Salarios',
        type: AccountType.EXPENSE,
        category: 'OPERATING_EXPENSE' as AccountCategory,
        parentId: gastos.id,
        level: 3,
        allowsTransactions: true,
      },
      {
        code: '5.1.2',
        name: 'Alquiler',
        type: AccountType.EXPENSE,
        category: 'OPERATING_EXPENSE' as AccountCategory,
        parentId: gastos.id,
        level: 3,
        allowsTransactions: true,
      },
      {
        code: '5.1.3',
        name: 'Servicios',
        type: AccountType.EXPENSE,
        category: 'OPERATING_EXPENSE' as AccountCategory,
        parentId: gastos.id,
        level: 3,
        allowsTransactions: true,
      },
    ],
  });

  console.log('✅ Plan de cuentas creado');

  // 3. Crear centros de costo
  await prisma.costCenter.createMany({
    data: [
      { code: 'ADM', name: 'Administración' },
      { code: 'VEN', name: 'Ventas' },
      { code: 'PRD', name: 'Producción' },
      { code: 'LOG', name: 'Logística' },
      { code: 'TEC', name: 'Tecnología' },
    ],
  });
  console.log('✅ Centros de costo creados');

  // 4. Crear proyectos de ejemplo
  await prisma.project.createMany({
    data: [
      {
        code: 'PRJ-001',
        name: 'Proyecto Alpha',
        description: 'Proyecto de ejemplo 1',
        status: 'ACTIVE',
        startDate: new Date('2024-01-01'),
        budget: 100000,
      },
      {
        code: 'PRJ-002',
        name: 'Proyecto Beta',
        description: 'Proyecto de ejemplo 2',
        status: 'PLANNING',
        startDate: new Date('2024-03-01'),
        budget: 50000,
      },
    ],
  });
  console.log('✅ Proyectos creados');

  console.log('🎉 Seed completado exitosamente');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
