import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { UserRole } from '../constants/enums';
import {
  createCouponSchema,
  updateCouponSchema,
  validateCouponSchema,
} from '../validators/coupon.validator';
import * as CouponController from '../controllers/coupon.controller';

const router = Router();

// Public: validate coupon (authenticated users only)
router.post(
  '/validate',
  authMiddleware,
  validate({ body: validateCouponSchema }),
  CouponController.validateCoupon
);

// Public storefront coupons listing (authenticated users only)
router.get(
  '/storefront',
  authMiddleware,
  CouponController.getStorefrontCoupons
);

// Admin-only CRUD
router.get('/', authMiddleware, requireRole(UserRole.ADMIN), CouponController.listCoupons);
router.get('/:id', authMiddleware, requireRole(UserRole.ADMIN), CouponController.getCouponById);

router.post(
  '/',
  authMiddleware,
  requireRole(UserRole.ADMIN),
  validate({ body: createCouponSchema }),
  CouponController.createCoupon
);

router.patch(
  '/:id',
  authMiddleware,
  requireRole(UserRole.ADMIN),
  validate({ body: updateCouponSchema }),
  CouponController.updateCoupon
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole(UserRole.ADMIN),
  CouponController.deleteCoupon
);

export default router;
