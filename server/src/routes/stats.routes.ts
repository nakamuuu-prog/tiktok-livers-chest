import { Router } from 'express';
import {
  getDashboardStats,
  getItemsSummary,
} from '../controllers/stats.controller';
import { authenticateToken as authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/dashboard', authMiddleware, getDashboardStats);
router.get('/items-summary', authMiddleware, getItemsSummary);

export default router;
