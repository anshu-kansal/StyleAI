import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { UserRole } from '../constants/enums';
import * as ReviewController from '../controllers/review.controller';

const router = Router();

// Helpfulness upvote (like) review - authenticated users
router.post('/:id/like', authMiddleware, ReviewController.toggleReviewLike);

// Delete review - owner or admin
router.delete('/:id', authMiddleware, ReviewController.deleteReview);

// Admin-only reviews management
router.get('/', authMiddleware, requireRole(UserRole.ADMIN), ReviewController.listAllReviews);
router.patch('/:id/status', authMiddleware, requireRole(UserRole.ADMIN), ReviewController.moderateReview);

export default router;
