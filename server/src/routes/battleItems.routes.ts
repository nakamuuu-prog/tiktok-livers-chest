import { Router } from 'express';
import {
  createBattleItem,
  getBattleItemById,
  updateBattleItem,
  deleteBattleItem,
} from '../controllers/battleItems.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Protect all routes
router.use(authenticateToken);

router.route('/').post(createBattleItem);

router
  .route('/:id')
  .get(getBattleItemById)
  .put(updateBattleItem)
  .delete(deleteBattleItem);

export default router;
