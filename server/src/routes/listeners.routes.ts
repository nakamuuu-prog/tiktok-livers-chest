import { Router } from 'express';
import {
  getAllListeners,
  createListener,
  getListenerById,
  updateListener,
  deleteListener,
} from '../controllers/listeners.controller';
import { getItemsForListener } from '../controllers/battleItems.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Protect all routes in this file
router.use(authenticateToken);

router.route('/').get(getAllListeners).post(createListener);

// Route for getting items for a specific listener
router.route('/:id/items').get(getItemsForListener);

router
  .route('/:id')
  .get(getListenerById)
  .put(updateListener)
  .delete(deleteListener);

export default router;
