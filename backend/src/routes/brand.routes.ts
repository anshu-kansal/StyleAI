import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { UserRole } from '../constants/enums';
import { createBrandSchema, updateBrandSchema } from '../validators/brand.validator';
import * as BrandController from '../controllers/brand.controller';

const router = Router();

// Public routes
router.get('/', BrandController.listBrands);
router.get('/:slug', BrandController.getBrandBySlug);

// Admin-only routes
router.post(
  '/',
  authMiddleware,
  requireRole(UserRole.ADMIN),
  validate({ body: createBrandSchema }),
  BrandController.createBrand
);

router.patch(
  '/:id',
  authMiddleware,
  requireRole(UserRole.ADMIN),
  validate({ body: updateBrandSchema }),
  BrandController.updateBrand
);

router.patch(
  '/:id/toggle',
  authMiddleware,
  requireRole(UserRole.ADMIN),
  BrandController.toggleBrandActive
);

export default router;
