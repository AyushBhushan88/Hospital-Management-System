import { Router } from 'express';
import { 
  createInvoice, 
  getInvoices, 
  getInvoiceById, 
  recordPayment,
  downloadReceipt 
} from '../controllers/invoice.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// List all invoices (Admin/Receptionist/Doctor)
router.get('/', authorize(['ADMIN', 'RECEPTIONIST', 'DOCTOR']), getInvoices);

// Create manual invoice (Admin/Receptionist)
router.post('/', authorize(['ADMIN', 'RECEPTIONIST']), createInvoice);

// Get single invoice details
router.get('/:id', authorize(['ADMIN', 'RECEPTIONIST', 'DOCTOR']), getInvoiceById);

// Record payment (Receptionist/Admin)
router.post('/payment', authorize(['ADMIN', 'RECEPTIONIST']), recordPayment);

// Download PDF receipt
router.get('/:id/download', authorize(['ADMIN', 'RECEPTIONIST', 'DOCTOR']), downloadReceipt);

export default router;
