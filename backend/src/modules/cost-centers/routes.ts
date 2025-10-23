import { Router } from 'express';
import { CostCenterController } from './controller';
import { authenticate } from '../../shared/middleware/auth';

const router = Router();
const controller = new CostCenterController();

router.use(authenticate);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.get('/:id/report', controller.getExpenseReport);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
