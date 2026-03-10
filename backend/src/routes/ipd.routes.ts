import { Router } from 'express';
import { 
  createWard, 
  getAllWards, 
  admitPatient, 
  dischargePatient, 
  createNursingLog, 
  getAdmissionDetails 
} from '../controllers/ipd.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Ward Management
router.post('/wards', authorize(['ADMIN']), createWard);
router.get('/wards', authorize(['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE']), getAllWards);

// Admissions
router.post('/admissions', authorize(['ADMIN', 'RECEPTIONIST']), admitPatient);
router.get('/admissions/:id', authorize(['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE']), getAdmissionDetails);
router.patch('/admissions/:admissionId/discharge', authorize(['ADMIN', 'RECEPTIONIST', 'DOCTOR']), dischargePatient);

// Nursing Logs
router.post('/nursing-logs', authorize(['NURSE', 'ADMIN']), createNursingLog);

export default router;
