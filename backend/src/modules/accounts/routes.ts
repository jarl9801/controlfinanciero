import { Router } from 'express';
import { AccountController } from './controller';
import { authenticate } from '../../shared/middleware/auth';

const router = Router();
const controller = new AccountController();

// Todas las rutas requieren autenticación
router.use(authenticate);

router.get('/', controller.getAll);
router.get('/hierarchy', controller.getHierarchy);
router.get('/:id', controller.getById);
router.get('/:id/balance', controller.getBalance);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
