import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';
import { errorHandler } from './shared/middleware/errorHandler';

// Importar rutas de módulos
import accountRoutes from './modules/accounts/routes';
import transactionRoutes from './modules/transactions/routes';
import payableRoutes from './modules/payables/routes';
import receivableRoutes from './modules/receivables/routes';
import costCenterRoutes from './modules/cost-centers/routes';
import projectRoutes from './modules/projects/routes';
import cashFlowRoutes from './modules/cash-flow/routes';
import reportRoutes from './modules/reports/routes';

const app: Application = express();

// Middleware de seguridad y utilidades
app.use(helmet());
app.use(cors({ origin: config.cors.origin }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rutas de la API - 8 módulos principales
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/payables', payableRoutes);
app.use('/api/receivables', receivableRoutes);
app.use('/api/cost-centers', costCenterRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/cash-flow', cashFlowRoutes);
app.use('/api/reports', reportRoutes);

// Manejo de errores
app.use(errorHandler);

export default app;
