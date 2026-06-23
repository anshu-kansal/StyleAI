import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { UserRole } from '../constants/enums';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';
import { createReviewSchema } from '../validators/review.validator';
import * as ProductController from '../controllers/product.controller';
import * as ReviewController from '../controllers/review.controller';
import { upload } from '../middlewares/upload.middleware';
import { cacheMiddleware, clearCacheMiddleware } from '../middlewares/cache.middleware';

const router = Router();

// Public routes
router.get('/', cacheMiddleware(300), ProductController.listProducts);
router.get('/:slug', cacheMiddleware(300), ProductController.getProductBySlug);
router.get('/:id/related', cacheMiddleware(300), ProductController.getRelatedProducts);

// Admin-only routes
router.post(
  '/',
  authMiddleware,
  requireRole(UserRole.ADMIN),
  validate({ body: createProductSchema }),
  clearCacheMiddleware('/products'),
  ProductController.createProduct
);

router.patch(
  '/:id',
  authMiddleware,
  requireRole(UserRole.ADMIN),
  validate({ body: updateProductSchema }),
  clearCacheMiddleware('/products'),
  ProductController.updateProduct
);

router.patch(
  '/:id/toggle',
  authMiddleware,
  requireRole(UserRole.ADMIN),
  clearCacheMiddleware('/products'),
  ProductController.toggleProductActive
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole(UserRole.ADMIN),
  clearCacheMiddleware('/products'),
  ProductController.deleteProduct
);

// Review routes
router.post(
  '/:id/reviews',
  authMiddleware,
  upload.array('images', 5),
  validate({ body: createReviewSchema }),
  clearCacheMiddleware('/products'),
  ReviewController.createOrUpdateProductReview
);

router.get('/:id/reviews', ReviewController.getProductReviews);
router.get('/:id/reviews/summary', ProductController.getProductReviewsSummary);

export default router;

