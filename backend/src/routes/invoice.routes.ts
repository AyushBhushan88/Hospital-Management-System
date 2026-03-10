import { Router } from 'express';
import { createInvoice, getInvoices, getInvoiceById, recordPayment } from '../controllers/invoice.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Only Admin and Receptionist can manage billing
router.post('/', authorize(['ADMIN', 'RECEPTIONIST']), createInvoice);
router.get('/', authorize(['ADMIN', 'RECEPTIONIST']), getInvoices);
router.get('/:id', authorize(['ADMIN', 'RECEPTIONIST', 'PATIENT']), getInvoiceById);
router.post('/payment', authorize(['ADMIN', 'RECEPTIONIST']), recordPayment);

export default router;
