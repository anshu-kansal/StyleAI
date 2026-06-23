import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { UserRole } from '../constants/enums';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validator';
import * as CategoryController from '../controllers/category.controller';

const router = Router();

// Public routes
router.get('/', CategoryController.listCategories);
router.get('/:slug', CategoryController.getCategoryBySlug);

// Admin-only routes
router.post(
  '/',
  authMiddleware,
  requireRole(UserRole.ADMIN),
  validate({ body: createCategorySchema }),
  CategoryController.createCategory
);

router.patch(
  '/:id',
  authMiddleware,
  requireRole(UserRole.ADMIN),
  validate({ body: updateCategorySchema }),
  CategoryController.updateCategory
);

router.patch(
  '/:id/toggle',
  authMiddleware,
  requireRole(UserRole.ADMIN),
  CategoryController.toggleCategoryActive
);

export default router;
