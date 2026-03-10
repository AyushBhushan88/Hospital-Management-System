import { Router } from 'express';
import { 
  requestTest, 
  updateLabStatus, 
  reportResult, 
  getPendingTests 
} from '../controllers/lab.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/request', authorize(['DOCTOR', 'ADMIN']), requestTest);
router.get('/pending', authorize(['LAB_TECH', 'ADMIN']), getPendingTests);
router.patch('/:id/status', authorize(['LAB_TECH', 'ADMIN']), updateLabStatus);
router.post('/report', authorize(['LAB_TECH', 'ADMIN']), reportResult);

export default router;
