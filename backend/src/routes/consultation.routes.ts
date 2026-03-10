import { Router } from 'express';
import { 
  createConsultation, 
  getPatientHistory, 
  getConsultationById 
} from '../controllers/consultation.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Only doctors and nurses can record clinical data
router.post('/record', authorize(['DOCTOR', 'NURSE']), createConsultation);

// Doctors, Nurses, and the Patients themselves can view history
router.get('/patient/:patientId', authorize(['DOCTOR', 'NURSE', 'PATIENT', 'ADMIN']), getPatientHistory);
router.get('/:id', authorize(['DOCTOR', 'NURSE', 'PATIENT', 'ADMIN']), getConsultationById);

export default router;
