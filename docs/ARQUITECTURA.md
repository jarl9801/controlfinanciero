# Arquitectura del Sistema de Gestión Financiera

## Visión General

Sistema empresarial completo para gestión financiera con arquitectura de tres capas:
- **Frontend**: React + TypeScript + Material-UI
- **Backend**: Node.js + Express + TypeScript
- **Base de Datos**: PostgreSQL + Prisma ORM

## Arquitectura del Backend

### Estructura de Carpetas

```
backend/
├── src/
│   ├── config/              # Configuración de la aplicación
│   │   ├── database.ts      # Cliente Prisma
│   │   └── env.ts           # Variables de entorno
│   ├── shared/              # Código compartido
│   │   ├── middleware/      # Middleware personalizados
│   │   ├── types/           # Tipos TypeScript
│   │   └── utils/           # Utilidades
│   ├── modules/             # 8 Módulos funcionales
│   │   ├── accounts/        # Catálogo de cuentas
│   │   ├── transactions/    # Transacciones
│   │   ├── payables/        # Cuentas por pagar
│   │   ├── receivables/     # Cuentas por cobrar
│   │   ├── cost-centers/    # Centros de costo
│   │   ├── projects/        # Proyectos
│   │   ├── cash-flow/       # Flujo de caja
│   │   └── reports/         # Reportes y análisis
│   ├── app.ts              # Configuración Express
│   └── server.ts           # Punto de entrada
└── prisma/
    ├── schema.prisma       # Esquema de base de datos
    └── seed.ts             # Datos iniciales
```

### Patrón de Arquitectura por Módulo

Cada módulo sigue el patrón MVC adaptado:

```
módulo/
├── schemas.ts      # Validación con Zod
├── service.ts      # Lógica de negocio
├── controller.ts   # Handlers de rutas
└── routes.ts       # Definición de endpoints
```

## Los 8 Módulos Funcionales

### 1. Catálogo de Cuentas
**Responsabilidad**: Gestión del plan contable jerárquico

**Características**:
- Estructura jerárquica multinivel
- Clasificación por tipo (Activo, Pasivo, Patrimonio, Ingreso, Gasto)
- Categorización detallada
- Control de saldos en tiempo real
- Consulta de balance por cuenta y período

**Endpoints**:
```
GET    /api/accounts              - Listar cuentas
GET    /api/accounts/:id          - Detalle de cuenta
GET    /api/accounts/hierarchy    - Árbol jerárquico
GET    /api/accounts/:id/balance  - Balance de cuenta
POST   /api/accounts              - Crear cuenta
PUT    /api/accounts/:id          - Actualizar cuenta
DELETE /api/accounts/:id          - Eliminar cuenta
```

### 2. Transacciones
**Responsabilidad**: Registro de operaciones con partida doble

**Características**:
- Partida doble obligatoria (débito = crédito)
- Estados: Borrador, Contabilizado, Anulado
- Asignación multidimensional (cuenta, centro de costo, proyecto)
- Actualización automática de saldos
- Adjuntos y referencias
- Auditoría completa

**Endpoints**:
```
GET    /api/transactions              - Listar transacciones
GET    /api/transactions/:id          - Detalle de transacción
POST   /api/transactions              - Crear transacción
PUT    /api/transactions/:id          - Actualizar transacción
POST   /api/transactions/:id/post     - Contabilizar
POST   /api/transactions/:id/void     - Anular
DELETE /api/transactions/:id          - Eliminar borrador
```

### 3. Cuentas por Pagar
**Responsabilidad**: Gestión de proveedores, facturas de compra y pagos

**Características**:
- Registro de proveedores
- Facturas por pagar con ítems detallados
- Control de pagos parciales y totales
- Reporte de antigüedad de saldos
- Alertas de vencimiento
- Cálculo automático de impuestos

**Endpoints**:
```
# Proveedores
GET    /api/payables/vendors          - Listar proveedores
POST   /api/payables/vendors          - Crear proveedor
PUT    /api/payables/vendors/:id      - Actualizar proveedor

# Facturas
GET    /api/payables/invoices         - Listar facturas
POST   /api/payables/invoices         - Crear factura
PUT    /api/payables/invoices/:id     - Actualizar factura

# Pagos
POST   /api/payables/payments         - Registrar pago

# Reportes
GET    /api/payables/aging            - Antigüedad de saldos
```

### 4. Cuentas por Cobrar
**Responsabilidad**: Gestión de clientes, facturación y cobros

**Características**:
- Registro de clientes
- Facturas por cobrar con ítems
- Control de cobros parciales y totales
- Reporte de antigüedad de saldos
- Seguimiento de morosidad
- Límites de crédito

**Endpoints**:
```
# Clientes
GET    /api/receivables/customers     - Listar clientes
POST   /api/receivables/customers     - Crear cliente
PUT    /api/receivables/customers/:id - Actualizar cliente

# Facturas
GET    /api/receivables/invoices      - Listar facturas
POST   /api/receivables/invoices      - Crear factura
PUT    /api/receivables/invoices/:id  - Actualizar factura

# Cobros
POST   /api/receivables/receipts      - Registrar cobro

# Reportes
GET    /api/receivables/aging         - Antigüedad de saldos
```

### 5. Centros de Costo
**Responsabilidad**: Asignación y control presupuestario

**Características**:
- Estructura jerárquica
- Asignación de transacciones
- Reportes de gastos por centro
- Análisis de variaciones
- Consolidación por jerarquía

**Endpoints**:
```
GET    /api/cost-centers              - Listar centros de costo
GET    /api/cost-centers/:id          - Detalle de centro
GET    /api/cost-centers/:id/report   - Reporte de gastos
POST   /api/cost-centers              - Crear centro
PUT    /api/cost-centers/:id          - Actualizar centro
DELETE /api/cost-centers/:id          - Eliminar centro
```

### 6. Proyectos
**Responsabilidad**: Gestión financiera por proyecto

**Características**:
- Tracking de ingresos y gastos
- Control presupuestario
- Estados del proyecto
- Análisis de rentabilidad
- Proyecciones financieras

**Endpoints**:
```
GET    /api/projects                  - Listar proyectos
GET    /api/projects/:id              - Detalle de proyecto
GET    /api/projects/:id/summary      - Resumen financiero
POST   /api/projects                  - Crear proyecto
PUT    /api/projects/:id              - Actualizar proyecto
DELETE /api/projects/:id              - Eliminar proyecto
```

### 7. Flujo de Caja
**Responsabilidad**: Proyecciones y control de tesorería

**Características**:
- Proyecciones de ingresos/egresos
- Clasificación por actividad (operación, inversión, financiamiento)
- Estados: Proyectado, Confirmado, Realizado
- Pronóstico mensual
- Alertas de liquidez

**Endpoints**:
```
GET    /api/cash-flow                 - Listar proyecciones
GET    /api/cash-flow/summary         - Resumen por período
GET    /api/cash-flow/forecast        - Pronóstico mensual
POST   /api/cash-flow                 - Crear proyección
PUT    /api/cash-flow/:id             - Actualizar proyección
DELETE /api/cash-flow/:id             - Eliminar proyección
```

### 8. Reportes y Análisis
**Responsabilidad**: Informes financieros y KPIs

**Características**:
- Balance General
- Estado de Resultados (P&L)
- Balance de Comprobación
- Dashboard ejecutivo
- Análisis por centro de costo
- Análisis por proyecto
- Exportación a Excel/PDF

**Endpoints**:
```
GET    /api/reports/dashboard          - Dashboard ejecutivo
GET    /api/reports/balance-sheet      - Balance General
GET    /api/reports/income-statement   - Estado de Resultados
GET    /api/reports/trial-balance      - Balance de Comprobación
GET    /api/reports/cost-center-analysis - Análisis por CC
GET    /api/reports/project-analysis   - Análisis por proyecto
```

## Modelo de Datos

### Entidades Principales

**User** - Usuarios del sistema
**Account** - Catálogo de cuentas
**Transaction** - Transacciones contables
**TransactionLine** - Líneas de detalle (partida doble)
**Vendor** - Proveedores
**Customer** - Clientes
**Invoice** - Facturas (pagar/cobrar)
**InvoiceItem** - Ítems de factura
**Payment** - Pagos/Cobros
**CostCenter** - Centros de costo
**Project** - Proyectos
**Budget** - Presupuestos
**CashFlowProjection** - Proyecciones de flujo
**Attachment** - Archivos adjuntos
**AuditLog** - Registro de auditoría

## Características Técnicas

### Seguridad
- Autenticación JWT
- Roles y permisos
- Validación de datos (Zod)
- Protección CSRF
- Rate limiting
- Auditoría de cambios

### Validaciones de Negocio
- Partida doble (débito = crédito)
- Saldos no negativos en activos
- Fechas de vencimiento
- Límites de crédito
- Integridad referencial

### Performance
- Índices de base de datos
- Consultas optimizadas
- Paginación
- Caching estratégico

## Flujo de Datos

### Flujo de una Transacción

1. Usuario crea transacción en estado DRAFT
2. Sistema valida partida doble
3. Usuario puede editar mientras esté en DRAFT
4. Al contabilizar (POST):
   - Cambia a estado POSTED
   - Actualiza saldos de cuentas
   - Genera asientos automáticos
   - Registra auditoría
5. Si se anula (VOID):
   - Revierte saldos
   - Mantiene histórico

### Flujo de Factura y Pago

1. Crear factura (proveedor/cliente)
2. Calcular totales e impuestos
3. Estado inicial: PENDING
4. Registrar pago:
   - Actualiza balance de factura
   - Cambia estado a PARTIAL o PAID
   - Actualiza saldo del proveedor/cliente
5. Genera transacción contable automática

## Arquitectura del Frontend

### Stack Tecnológico
- React 18+ con TypeScript
- Material-UI para componentes
- React Router para navegación
- Zustand para state management
- React Hook Form para formularios
- Recharts para gráficos
- Axios para HTTP

### Estructura de Componentes
```
src/
├── components/         # Componentes reutilizables
├── pages/             # Páginas por módulo
├── services/          # API clients
├── hooks/             # Custom hooks
├── stores/            # Zustand stores
└── utils/             # Utilidades
```

## Despliegue

### Requisitos
- Node.js 18+
- PostgreSQL 14+
- 2GB RAM mínimo
- 10GB espacio en disco

### Variables de Entorno

**Backend**:
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
PORT=3001
NODE_ENV=production
```

**Frontend**:
```
VITE_API_URL=https://api.ejemplo.com
```

### Comandos de Despliegue

```bash
# Backend
cd backend
npm install
npm run prisma:migrate
npm run prisma:seed
npm run build
npm start

# Frontend
cd frontend
npm install
npm run build
# Servir dist/ con nginx o similar
```

## Mantenimiento

### Backups
- Backup diario de base de datos
- Retención de 30 días
- Backup de archivos adjuntos

### Monitoreo
- Logs de aplicación
- Métricas de performance
- Alertas de errores
- Uso de recursos

### Actualizaciones
- Migraciones de Prisma
- Versionado semántico
- Testing antes de deploy
- Rollback plan
