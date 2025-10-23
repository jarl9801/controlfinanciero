import { Router } from 'express';
import { ReceivableController } from './controller';
import { authenticate } from '../../shared/middleware/auth';

const router = Router();
const controller = new ReceivableController();

router.use(authenticate);

// Customers
router.get('/customers', controller.getAllCustomers);
router.get('/customers/:id', controller.getCustomerById);
router.post('/customers', controller.createCustomer);
router.put('/customers/:id', controller.updateCustomer);
router.delete('/customers/:id', controller.deleteCustomer);

// Invoices
router.get('/invoices', controller.getAllInvoices);
router.get('/invoices/:id', controller.getInvoiceById);
router.post('/invoices', controller.createInvoice);
router.put('/invoices/:id', controller.updateInvoice);

// Receipts
router.post('/receipts', controller.createReceipt);

// Reports
router.get('/aging', controller.getAgingSummary);

export default router;
