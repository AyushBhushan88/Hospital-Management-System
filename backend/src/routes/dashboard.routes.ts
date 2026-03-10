import { Router } from 'express';
import { getDashboardStats, getAdminAnalytics } from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/analytics', authorize(['ADMIN']), getAdminAnalytics);

export default router;
