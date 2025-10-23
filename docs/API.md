# Documentación de API

## Autenticación

Todas las rutas requieren autenticación mediante JWT en el header:
```
Authorization: Bearer <token>
```

## Formato de Respuesta

Todas las respuestas siguen el formato:

**Éxito**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operación exitosa"
}
```

**Error**:
```json
{
  "success": false,
  "error": "Descripción del error"
}
```

## Endpoints por Módulo

### 1. Cuentas (Accounts)

#### GET /api/accounts
Lista todas las cuentas del plan contable

**Query Parameters**:
- `type` (opcional): ASSET | LIABILITY | EQUITY | INCOME | EXPENSE
- `isActive` (opcional): boolean
- `search` (opcional): string

**Respuesta**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "code": "1.1.1",
      "name": "Caja",
      "type": "ASSET",
      "balance": 1000.00
    }
  ]
}
```

#### POST /api/accounts
Crea una nueva cuenta

**Body**:
```json
{
  "code": "1.1.5",
  "name": "Inversiones Temporales",
  "type": "ASSET",
  "category": "CURRENT_ASSET",
  "parentId": "uuid-opcional"
}
```

### 2. Transacciones (Transactions)

#### POST /api/transactions
Crea una nueva transacción

**Body**:
```json
{
  "date": "2024-01-15T00:00:00Z",
  "description": "Compra de mercadería",
  "type": "JOURNAL_ENTRY",
  "lines": [
    {
      "accountId": "uuid",
      "debit": 1000.00,
      "credit": 0,
      "costCenterId": "uuid-opcional",
      "projectId": "uuid-opcional"
    },
    {
      "accountId": "uuid",
      "debit": 0,
      "credit": 1000.00
    }
  ]
}
```

**Validaciones**:
- Suma de débitos debe igualar suma de créditos
- Cada línea debe tener débito O crédito (no ambos)
- Mínimo 2 líneas

#### POST /api/transactions/:id/post
Contabiliza una transacción (cambia de DRAFT a POSTED)

#### POST /api/transactions/:id/void
Anula una transacción

### 3. Cuentas por Pagar (Payables)

#### POST /api/payables/invoices
Crea una factura de proveedor

**Body**:
```json
{
  "invoiceNumber": "FAC-001",
  "vendorId": "uuid",
  "issueDate": "2024-01-15",
  "dueDate": "2024-02-15",
  "items": [
    {
      "description": "Producto X",
      "quantity": 10,
      "unitPrice": 100,
      "taxRate": 13
    }
  ]
}
```

#### POST /api/payables/payments
Registra un pago

**Body**:
```json
{
  "invoiceId": "uuid",
  "date": "2024-01-15",
  "amount": 500.00,
  "method": "BANK_TRANSFER",
  "reference": "TRF-12345"
}
```

### 4. Reportes (Reports)

#### GET /api/reports/dashboard
Dashboard ejecutivo

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "monthlyRevenue": 50000,
      "monthlyExpenses": 30000,
      "monthlyProfit": 20000,
      "totalAssets": 100000
    },
    "receivables": {
      "total": 15000,
      "count": 10,
      "overdue": 2
    },
    "payables": {
      "total": 8000,
      "count": 5,
      "overdue": 1
    }
  }
}
```

#### GET /api/reports/balance-sheet
Balance General

**Query Parameters**:
- `date` (opcional): Fecha del balance (default: hoy)

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "date": "2024-01-15",
    "assets": {
      "accounts": [...],
      "total": 100000
    },
    "liabilities": {
      "accounts": [...],
      "total": 40000
    },
    "equity": {
      "accounts": [...],
      "total": 60000
    }
  }
}
```

#### GET /api/reports/income-statement
Estado de Resultados

**Query Parameters** (requeridos):
- `startDate`: Fecha inicio
- `endDate`: Fecha fin

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    },
    "income": {
      "accounts": [...],
      "total": 50000
    },
    "expenses": {
      "accounts": [...],
      "total": 30000
    },
    "netIncome": 20000
  }
}
```

## Códigos de Estado HTTP

- `200` - OK
- `201` - Created
- `400` - Bad Request (validación fallida)
- `401` - Unauthorized (no autenticado)
- `403` - Forbidden (sin permisos)
- `404` - Not Found
- `500` - Internal Server Error

## Límites y Paginación

Para endpoints que retornan listas:
- Límite por defecto: 100 registros
- Máximo: 1000 registros

**Query Parameters**:
```
?page=1&limit=50&sortBy=date&sortOrder=desc
```

## Rate Limiting

- 100 requests por minuto por IP
- 1000 requests por hora por usuario

## Ejemplos de Uso

### Crear una Transacción Completa

```javascript
const transaction = await fetch('/api/transactions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    date: new Date().toISOString(),
    description: 'Venta de productos',
    type: 'JOURNAL_ENTRY',
    lines: [
      {
        accountId: 'cuenta-caja-id',
        debit: 1130,
        credit: 0,
        description: 'Cobro en efectivo'
      },
      {
        accountId: 'cuenta-ventas-id',
        debit: 0,
        credit: 1000,
        description: 'Venta de productos'
      },
      {
        accountId: 'cuenta-impuestos-id',
        debit: 0,
        credit: 130,
        description: 'IVA cobrado'
      }
    ]
  })
});

const result = await transaction.json();
console.log(result);
```

### Obtener Dashboard

```javascript
const dashboard = await fetch('/api/reports/dashboard', {
  headers: {
    'Authorization': 'Bearer <token>'
  }
});

const data = await dashboard.json();
console.log('Ingresos del mes:', data.summary.monthlyRevenue);
```
