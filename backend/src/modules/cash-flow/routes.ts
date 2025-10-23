import { Router } from 'express';
import { CashFlowController } from './controller';
import { authenticate } from '../../shared/middleware/auth';

const router = Router();
const controller = new CashFlowController();

router.use(authenticate);

router.get('/', controller.getAll);
router.get('/summary', controller.getSummary);
router.get('/forecast', controller.getForecast);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
