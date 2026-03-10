import { Router } from 'express';
import { getDashboardStats, getAdminAnalytics } from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// General dashboard stats (Any role)
router.get('/stats', getDashboardStats);

// Admin-only financial analytics
router.get('/analytics', authorize(['ADMIN']), getAdminAnalytics);

export default router;
