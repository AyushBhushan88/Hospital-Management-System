import { Router } from 'express';
import { addDoctor, getAllDoctors } from '../controllers/doctor.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Only authenticated staff can access doctor routes
router.use(authenticate);

// Only admins can add new doctors
router.post('/add', authorize(['ADMIN']), addDoctor);

// Doctors and other staff can view the list of doctors
router.get('/', authorize(['ADMIN', 'RECEPTIONIST', 'NURSE', 'DOCTOR']), getAllDoctors);

export default router;
