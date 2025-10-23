import { Router } from 'express';
import { ProjectController } from './controller';
import { authenticate } from '../../shared/middleware/auth';

const router = Router();
const controller = new ProjectController();

router.use(authenticate);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.get('/:id/summary', controller.getFinancialSummary);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
