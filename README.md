# Sistema Integral de Gestión Financiera

Sistema empresarial completo para el registro, clasificación y control de operaciones financieras, con capacidad de asignación multidimensional por centros de costos y proyectos.

## Características Principales

- **Gestión Completa de Transacciones**: Registro y control de operaciones financieras diarias
- **Asignación Multidimensional**: Por centros de costo, proyectos y departamentos
- **Cuentas por Pagar y Cobrar**: Control completo de obligaciones y derechos
- **Proyecciones de Flujo de Caja**: Planificación financiera avanzada
- **Reportes y Análisis**: Dashboards interactivos y reportes personalizables

## Arquitectura del Sistema

### 8 Módulos Funcionales Principales

1. **Catálogo de Cuentas**: Plan contable jerárquico y flexible
2. **Transacciones**: Registro de operaciones con partida doble
3. **Cuentas por Pagar**: Gestión de proveedores, facturas y pagos
4. **Cuentas por Cobrar**: Gestión de clientes, facturación y cobros
5. **Centros de Costo**: Asignación y control presupuestario
6. **Proyectos**: Gestión financiera por proyecto
7. **Flujo de Caja**: Proyecciones y control de tesorería
8. **Reportes y Análisis**: Balance, P&L, flujos y KPIs

## Estructura del Proyecto

```
controlfinanciero/
├── backend/               # API REST - Node.js + Express + TypeScript
│   ├── src/
│   │   ├── modules/      # 8 módulos funcionales
│   │   ├── shared/       # Utilidades compartidas
│   │   └── prisma/       # Esquema de base de datos
│   └── tests/
├── frontend/             # SPA - React + TypeScript
│   ├── src/
│   │   ├── modules/      # Componentes por módulo
│   │   ├── shared/       # Componentes compartidos
│   │   └── services/     # API clients
│   └── public/
└── docs/                 # Documentación técnica
```

## Stack Tecnológico

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Lenguaje**: TypeScript
- **ORM**: Prisma
- **Base de Datos**: PostgreSQL 14+
- **Autenticación**: JWT
- **Validación**: Zod

### Frontend
- **Framework**: React 18+
- **Lenguaje**: TypeScript
- **UI Library**: Material-UI (MUI)
- **State Management**: Zustand
- **Forms**: React Hook Form
- **Charts**: Recharts
- **HTTP Client**: Axios

## Instalación

### Prerrequisitos
- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Configurar DATABASE_URL en .env
npm run prisma:migrate
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

## Variables de Entorno

### Backend (.env)
```
DATABASE_URL="postgresql://user:password@localhost:5432/controlfinanciero"
JWT_SECRET="tu-secreto-seguro"
PORT=3001
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3001/api
```

## Desarrollo

### Comandos Útiles

Backend:
```bash
npm run dev           # Servidor de desarrollo
npm run build         # Compilar TypeScript
npm run prisma:studio # GUI de base de datos
npm test             # Ejecutar tests
```

Frontend:
```bash
npm start            # Servidor de desarrollo
npm run build        # Build de producción
npm test            # Ejecutar tests
```

## Modelo de Datos

El sistema utiliza un modelo relacional con las siguientes entidades principales:

- **Account**: Catálogo de cuentas contable
- **Transaction**: Transacciones financieras
- **TransactionLine**: Líneas de detalle (partida doble)
- **Vendor**: Proveedores
- **Customer**: Clientes
- **Invoice**: Facturas (por pagar/cobrar)
- **Payment**: Pagos/Cobros
- **CostCenter**: Centros de costo
- **Project**: Proyectos
- **Budget**: Presupuestos
- **CashFlowProjection**: Proyecciones de flujo

## API Endpoints

Cada módulo expone endpoints REST:

- `/api/accounts` - Catálogo de cuentas
- `/api/transactions` - Transacciones
- `/api/payables` - Cuentas por pagar
- `/api/receivables` - Cuentas por cobrar
- `/api/cost-centers` - Centros de costo
- `/api/projects` - Proyectos
- `/api/cash-flow` - Flujo de caja
- `/api/reports` - Reportes

## Características de Seguridad

- Autenticación basada en JWT
- Roles y permisos granulares
- Auditoría de cambios
- Validación de datos en backend
- Protección CSRF
- Rate limiting

## Licencia

Propietario - Todos los derechos reservados

## Soporte

Para soporte técnico, contactar al equipo de desarrollo.
