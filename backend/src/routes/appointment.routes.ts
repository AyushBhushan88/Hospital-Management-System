import { Router } from 'express';
import { 
  bookAppointment, 
  getAppointments, 
  updateAppointmentStatus 
} from '../controllers/appointment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Staff and patients can view their appointments
router.get('/', getAppointments);

// Only admins and receptionists (or potentially patients themselves) can book
router.post('/book', authorize(['ADMIN', 'RECEPTIONIST', 'PATIENT']), bookAppointment);

// Only medical staff or admins can update status
router.patch('/:id/status', authorize(['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE']), updateAppointmentStatus);

export default router;
