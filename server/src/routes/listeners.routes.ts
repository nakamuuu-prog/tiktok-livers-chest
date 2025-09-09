import { Router } from 'express';
import {
  getAllListeners,
  createListener,
  getListenerById,
  updateListener,
  deleteListener,
} from '../controllers/listeners.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Protect all routes in this file
router.use(authenticateToken);

router.route('/').get(getAllListeners).post(createListener);

router
  .route('/:id')
  .get(getListenerById)
  .put(updateListener)
  .delete(deleteListener);

export default router;
