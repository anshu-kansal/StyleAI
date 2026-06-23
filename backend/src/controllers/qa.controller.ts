import { Request, Response } from 'express';
import { QaService } from '../services/qa.service';
import { ApiResponse } from '../utils/api-response';
import { HttpStatus } from '../constants/http-status';
import { asyncHandler } from '../middlewares/async-handler.middleware';
import { ApiError } from '../utils/api-error';
import { UserRole } from '../constants/enums';

/**
 * Ask a new question for a product.
 */
export const createQuestion = asyncHandler(async (req: Request, res: Response) => {
  const productId = req.params.productId;
  const userId = req.user!.id;
  const { content } = req.body;

  const question = await QaService.createQuestion(productId, userId, content);

  res.status(HttpStatus.CREATED).json(
    ApiResponse.success(HttpStatus.CREATED, 'Question posted successfully', question)
  );
});

/**
 * Delete a question.
 */
export const deleteQuestion = asyncHandler(async (req: Request, res: Response) => {
  const questionId = req.params.questionId;
  const userId = req.user!.id;
  const userRoles = (req.user!.roles as any) || [];

  await QaService.deleteQuestion(questionId, userId, userRoles);

  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Question and its answers deleted successfully')
  );
});

/**
 * Get all questions for a product.
 */
export const getProductQuestions = asyncHandler(async (req: Request, res: Response) => {
  const productId = req.params.productId;
  const { page, limit, search } = req.query;

  const result = await QaService.getProductQuestions(productId, {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    search: search as string,
  });

  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Questions retrieved successfully', result)
  );
});

/**
 * Post an answer to a question.
 */
export const createAnswer = asyncHandler(async (req: Request, res: Response) => {
  const questionId = req.params.questionId;
  const userId = req.user!.id;
  const { content } = req.body;
  const userRoles = (req.user!.roles as any) || [];

  // Determine user role in system
  let userRole: 'USER' | 'ADMIN' | 'SELLER' = 'USER';
  if (userRoles.includes(UserRole.ADMIN) || userRoles.includes('admin')) {
    userRole = 'ADMIN';
  } else if (userRoles.includes('SELLER') || userRoles.includes('seller')) {
    userRole = 'SELLER';
  }

  const answer = await QaService.createAnswer(questionId, userId, content, userRole);

  res.status(HttpStatus.CREATED).json(
    ApiResponse.success(HttpStatus.CREATED, 'Answer posted successfully', answer)
  );
});

/**
 * Delete an answer.
 */
export const deleteAnswer = asyncHandler(async (req: Request, res: Response) => {
  const answerId = req.params.answerId;
  const userId = req.user!.id;
  const userRoles = (req.user!.roles as any) || [];

  await QaService.deleteAnswer(answerId, userId, userRoles);

  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Answer deleted successfully')
  );
});

/**
 * Get answers for a specific question.
 */
export const getQuestionAnswers = asyncHandler(async (req: Request, res: Response) => {
  const questionId = req.params.questionId;
  const { page, limit } = req.query;

  const result = await QaService.getQuestionAnswers(questionId, {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });

  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Answers retrieved successfully', result)
  );
});

/**
 * Toggle upvote / like on an answer.
 */
export const toggleLikeAnswer = asyncHandler(async (req: Request, res: Response) => {
  const answerId = req.params.answerId;
  const userId = req.user!.id;

  const answer = await QaService.toggleLikeAnswer(answerId, userId);

  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Answer upvote toggled successfully', {
      likesCount: answer.likesCount,
      likes: answer.likes,
    })
  );
});

/**
 * Mark/Unmark an answer as best answer.
 */
export const toggleBestAnswer = asyncHandler(async (req: Request, res: Response) => {
  const answerId = req.params.answerId;
  const userId = req.user!.id;
  const userRoles = (req.user!.roles as any) || [];

  const answer = await QaService.toggleBestAnswer(answerId, userId, userRoles);

  res.status(HttpStatus.OK).json(
    ApiResponse.success(
      HttpStatus.OK,
      answer.isBestAnswer ? 'Answer marked as best answer' : 'Answer unmarked as best answer',
      answer
    )
  );
});

/**
 * Admin: List all questions.
 */
export const listAllQuestions = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status } = req.query;

  const result = await QaService.listAllQuestions({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    status: status as string,
  });

  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'All questions retrieved successfully', result)
  );
});

/**
 * Admin: Moderate a question's status.
 */
export const moderateQuestion = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;
  if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
    throw ApiError.badRequest('Invalid status. Allowed values: PENDING, APPROVED, REJECTED');
  }

  const question = await QaService.moderateQuestion(req.params.questionId, status);

  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, `Question status updated to ${status}`, question)
  );
});

/**
 * Admin: List all answers.
 */
export const listAllAnswers = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status } = req.query;

  const result = await QaService.listAllAnswers({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    status: status as string,
  });

  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'All answers retrieved successfully', result)
  );
});

/**
 * Admin: Moderate an answer's status.
 */
export const moderateAnswer = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;
  if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
    throw ApiError.badRequest('Invalid status. Allowed values: PENDING, APPROVED, REJECTED');
  }

  const answer = await QaService.moderateAnswer(req.params.answerId, status);

  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, `Answer status updated to ${status}`, answer)
  );
});
