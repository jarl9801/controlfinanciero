import { Router } from 'express';
import { ReportController } from './controller';
import { authenticate } from '../../shared/middleware/auth';

const router = Router();
const controller = new ReportController();

router.use(authenticate);

router.get('/dashboard', controller.getDashboard);
router.get('/balance-sheet', controller.getBalanceSheet);
router.get('/income-statement', controller.getIncomeStatement);
router.get('/trial-balance', controller.getTrialBalance);
router.get('/cost-center-analysis', controller.getCostCenterAnalysis);
router.get('/project-analysis', controller.getProjectAnalysis);

export default router;
