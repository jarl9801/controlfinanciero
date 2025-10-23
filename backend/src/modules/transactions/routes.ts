import { Router } from 'express';
import { TransactionController } from './controller';
import { authenticate } from '../../shared/middleware/auth';

const router = Router();
const controller = new TransactionController();

router.use(authenticate);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.post('/:id/post', controller.post);
router.post('/:id/void', controller.void);
router.delete('/:id', controller.delete);

export default router;
