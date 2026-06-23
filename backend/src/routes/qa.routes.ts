import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { UserRole } from '../constants/enums';
import { createQuestionSchema, createAnswerSchema } from '../validators/qa.validator';
import * as QaController from '../controllers/qa.controller';

const router = Router();

// --- Product specific Questions ---
router.get('/products/:productId/questions', QaController.getProductQuestions);
router.post(
  '/products/:productId/questions',
  authMiddleware,
  validate({ body: createQuestionSchema }),
  QaController.createQuestion
);

// --- Question specific Answers ---
router.get('/questions/:questionId/answers', QaController.getQuestionAnswers);
router.post(
  '/questions/:questionId/answers',
  authMiddleware,
  validate({ body: createAnswerSchema }),
  QaController.createAnswer
);

// --- General Question Actions ---
router.delete('/questions/:questionId', authMiddleware, QaController.deleteQuestion);

// --- General Answer Actions ---
router.delete('/answers/:answerId', authMiddleware, QaController.deleteAnswer);
router.post('/answers/:answerId/like', authMiddleware, QaController.toggleLikeAnswer);
router.patch('/answers/:answerId/best', authMiddleware, QaController.toggleBestAnswer);

// --- Admin Controls ---
router.get('/admin/questions', authMiddleware, requireRole(UserRole.ADMIN), QaController.listAllQuestions);
router.patch('/admin/questions/:questionId/status', authMiddleware, requireRole(UserRole.ADMIN), QaController.moderateQuestion);
router.get('/admin/answers', authMiddleware, requireRole(UserRole.ADMIN), QaController.listAllAnswers);
router.patch('/admin/answers/:answerId/status', authMiddleware, requireRole(UserRole.ADMIN), QaController.moderateAnswer);

export default router;
