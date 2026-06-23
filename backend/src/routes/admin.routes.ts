import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { UserRole } from '../constants/enums';
import * as AdminController from '../controllers/admin.controller';

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(authMiddleware, requireRole(UserRole.ADMIN));

router.get('/stats', AdminController.getDashboardStats);
router.get('/users', AdminController.getAllUsers);
router.patch('/users/:id/role', AdminController.updateUserRole);

export default router;
