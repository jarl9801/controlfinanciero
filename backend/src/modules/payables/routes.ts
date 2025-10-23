import { Router } from 'express';
import { PayableController } from './controller';
import { authenticate } from '../../shared/middleware/auth';

const router = Router();
const controller = new PayableController();

router.use(authenticate);

// Vendors
router.get('/vendors', controller.getAllVendors);
router.get('/vendors/:id', controller.getVendorById);
router.post('/vendors', controller.createVendor);
router.put('/vendors/:id', controller.updateVendor);
router.delete('/vendors/:id', controller.deleteVendor);

// Invoices
router.get('/invoices', controller.getAllInvoices);
router.get('/invoices/:id', controller.getInvoiceById);
router.post('/invoices', controller.createInvoice);
router.put('/invoices/:id', controller.updateInvoice);

// Payments
router.post('/payments', controller.createPayment);

// Reports
router.get('/aging', controller.getAgingSummary);

export default router;
