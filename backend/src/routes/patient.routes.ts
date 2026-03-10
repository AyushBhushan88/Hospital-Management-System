import { Router } from 'express';
import { registerPatient, getAllPatients } from '../controllers/patient.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Only authenticated staff can access patient routes
router.use(authenticate);

router.post('/register', authorize(['ADMIN', 'RECEPTIONIST']), registerPatient);
router.get('/', authorize(['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE']), getAllPatients);

export default router;
