#!/bin/bash
# Script para configurar el mock de Prisma Client cuando los binarios no están disponibles

echo "🔧 Configurando mock de Prisma Client..."

# Crear directorios
mkdir -p node_modules/@prisma/client
mkdir -p node_modules/.prisma/client

# Crear index.js
cat > node_modules/@prisma/client/index.js << 'EOF'
// Mock de Prisma Client para desarrollo sin binarios
class PrismaClient {
  constructor(options) {
    this.options = options;
    this._connected = false;

    // Mock de todos los modelos
    this.user = this._createModel('User');
    this.account = this._createModel('Account');
    this.transaction = this._createModel('Transaction');
    this.transactionLine = this._createModel('TransactionLine');
    this.vendor = this._createModel('Vendor');
    this.customer = this._createModel('Customer');
    this.invoice = this._createModel('Invoice');
    this.invoiceItem = this._createModel('InvoiceItem');
    this.payment = this._createModel('Payment');
    this.costCenter = this._createModel('CostCenter');
    this.project = this._createModel('Project');
    this.budget = this._createModel('Budget');
    this.cashFlowProjection = this._createModel('CashFlowProjection');
    this.attachment = this._createModel('Attachment');
    this.auditLog = this._createModel('AuditLog');
  }

  _createModel(modelName) {
    return {
      findMany: async (args) => [],
      findUnique: async (args) => null,
      findFirst: async (args) => null,
      create: async (args) => ({ id: 'mock-id', ...args.data }),
      update: async (args) => ({ id: args.where.id, ...args.data }),
      delete: async (args) => ({ id: args.where.id }),
      deleteMany: async (args) => ({ count: 0 }),
      updateMany: async (args) => ({ count: 0 }),
      count: async (args) => 0,
      aggregate: async (args) => ({}),
      groupBy: async (args) => []
    };
  }

  async $connect() {
    this._connected = true;
    if (this.options && this.options.log) {
      console.log('✅ Mock Prisma Client connected (no real database)');
    }
    return Promise.resolve();
  }

  async $disconnect() {
    this._connected = false;
    return Promise.resolve();
  }

  $on(event, callback) {}
  $use(middleware) {}

  async $queryRaw(query) {
    return [];
  }

  async $executeRaw(query) {
    return 0;
  }

  async $transaction(operations) {
    if (Array.isArray(operations)) {
      return await Promise.all(operations);
    }
    return await operations(this);
  }
}

module.exports = { PrismaClient };
EOF

# Crear index.d.ts
cat > node_modules/@prisma/client/index.d.ts << 'EOF'
// Mock TypeScript definitions for Prisma Client

export type PrismaClientOptions = {
  log?: Array<'query' | 'info' | 'warn' | 'error'>;
};

export class PrismaClient {
  constructor(options?: PrismaClientOptions);

  user: any;
  account: any;
  transaction: any;
  transactionLine: any;
  vendor: any;
  customer: any;
  invoice: any;
  invoiceItem: any;
  payment: any;
  costCenter: any;
  project: any;
  budget: any;
  cashFlowProjection: any;
  attachment: any;
  auditLog: any;

  $connect(): Promise<void>;
  $disconnect(): Promise<void>;
  $on(event: string, callback: Function): void;
  $use(middleware: Function): void;
  $queryRaw(query: any): Promise<any>;
  $executeRaw(query: any): Promise<any>;
  $transaction(operations: any): Promise<any>;
}
EOF

# Crear package.json
cat > node_modules/@prisma/client/package.json << 'EOF'
{
  "name": "@prisma/client",
  "version": "5.22.0",
  "main": "index.js",
  "types": "index.d.ts",
  "description": "Mock Prisma Client for development"
}
EOF

# Crear enlaces simbólicos
ln -sf ../../@prisma/client/index.js node_modules/.prisma/client/index.js
ln -sf ../../@prisma/client/index.d.ts node_modules/.prisma/client/index.d.ts

echo "✅ Mock de Prisma Client configurado correctamente"
echo "⚠️  NOTA: Este es un mock que devuelve datos vacíos. Para producción necesitas configurar una base de datos real."
