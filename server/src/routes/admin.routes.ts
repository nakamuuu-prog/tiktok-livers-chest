import { Router } from 'express';
import {
  preRegisterUser,
  getPreRegisteredUsers,
  deletePreRegisteredUser,
  getAllUsers,
  toggleUserActive,
  toggleUserAdmin,
} from '../controllers/admin.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';

const router = Router();

// Protect all routes
router.use(authenticateToken, isAdmin);

router.route('/pre-register').post(preRegisterUser);

router
  .route('/pre-registered-users')
  .get(getPreRegisteredUsers);

router.route('/pre-registered-users/:id').delete(deletePreRegisteredUser);

router.route('/users').get(getAllUsers);

router.route('/users/:id/toggle-active').patch(toggleUserActive);

router.route('/users/:id/toggle-admin').patch(toggleUserAdmin);

export default router;