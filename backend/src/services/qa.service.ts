import Question from '../models/question.model';
import Answer from '../models/answer.model';
import Product from '../models/product.model';
import { ApiError } from '../utils/api-error';
import mongoose from 'mongoose';

export class QaService {
  /**
   * Recalculate answersCount for a question.
   */
  static async updateQuestionAnswersCount(questionId: string) {
    const count = await Answer.countDocuments({ question: questionId, status: 'APPROVED' });
    await Question.findByIdAndUpdate(questionId, { answersCount: count });
  }

  /**
   * Submit a new question for a product.
   */
  static async createQuestion(productId: string, userId: string, content: string) {
    const productExists = await Product.exists({ _id: productId });
    if (!productExists) {
      throw ApiError.notFound('Product not found');
    }

    const question = new Question({
      product: productId,
      user: userId,
      content,
      status: 'APPROVED', // approved by default, moderation available
      answersCount: 0,
    });

    await question.save();
    return await Question.findById(question._id).populate('user', 'name email');
  }

  /**
   * Delete a question (author or admin only).
   * Cascades delete to all answers.
   */
  static async deleteQuestion(questionId: string, userId: string, userRoles: string[]) {
    const question = await Question.findById(questionId);
    if (!question) {
      throw ApiError.notFound('Question not found');
    }

    const isAdmin = userRoles.includes('ADMIN') || userRoles.includes('admin');
    if (question.user.toString() !== userId && !isAdmin) {
      throw ApiError.forbidden('You are not authorized to delete this question');
    }

    // Delete question
    await Question.findByIdAndDelete(questionId);

    // Delete all answers associated with this question
    await Answer.deleteMany({ question: questionId });

    return { success: true };
  }

  /**
   * Submit an answer to a question.
   */
  static async createAnswer(
    questionId: string,
    userId: string,
    content: string,
    userRole: 'USER' | 'ADMIN' | 'SELLER' = 'USER'
  ) {
    const question = await Question.findOne({ _id: questionId, status: 'APPROVED' });
    if (!question) {
      throw ApiError.notFound('Active question not found');
    }

    const answer = new Answer({
      question: questionId,
      user: userId,
      content,
      status: 'APPROVED', // approved by default, moderation available
      isBestAnswer: false,
      likes: [],
      likesCount: 0,
      userRole,
    });

    await answer.save();
    await this.updateQuestionAnswersCount(questionId);

    return await Answer.findById(answer._id).populate('user', 'name email');
  }

  /**
   * Delete an answer (author or admin only).
   */
  static async deleteAnswer(answerId: string, userId: string, userRoles: string[]) {
    const answer = await Answer.findById(answerId);
    if (!answer) {
      throw ApiError.notFound('Answer not found');
    }

    const isAdmin = userRoles.includes('ADMIN') || userRoles.includes('admin');
    if (answer.user.toString() !== userId && !isAdmin) {
      throw ApiError.forbidden('You are not authorized to delete this answer');
    }

    await Answer.findByIdAndDelete(answerId);
    await this.updateQuestionAnswersCount(answer.question.toString());

    return { success: true };
  }

  /**
   * Toggle a helpful upvote on an answer.
   */
  static async toggleLikeAnswer(answerId: string, userId: string) {
    const answer = await Answer.findById(answerId);
    if (!answer) {
      throw ApiError.notFound('Answer not found');
    }

    const userIdObj = new mongoose.Types.ObjectId(userId);
    const likeIndex = answer.likes.findIndex((id) => id.toString() === userId);

    if (likeIndex > -1) {
      answer.likes.splice(likeIndex, 1);
    } else {
      answer.likes.push(userIdObj);
    }

    answer.likesCount = answer.likes.length;
    await answer.save();

    return answer;
  }

  /**
   * Toggle Best Answer status.
   * Only the author of the question or an admin can mark/unmark a best answer.
   */
  static async toggleBestAnswer(answerId: string, userId: string, userRoles: string[]) {
    const answer = await Answer.findById(answerId);
    if (!answer) {
      throw ApiError.notFound('Answer not found');
    }

    const question = await Question.findById(answer.question);
    if (!question) {
      throw ApiError.notFound('Question not found');
    }

    const isAdmin = userRoles.includes('ADMIN') || userRoles.includes('admin');
    if (question.user.toString() !== userId && !isAdmin) {
      throw ApiError.forbidden('Only the question author or an administrator can mark the best answer');
    }

    const newBestStatus = !answer.isBestAnswer;

    if (newBestStatus) {
      // Unmark any other best answers for this question
      await Answer.updateMany(
        { question: answer.question, isBestAnswer: true },
        { $set: { isBestAnswer: false } }
      );
    }

    answer.isBestAnswer = newBestStatus;
    await answer.save();

    return answer;
  }

  /**
   * Fetch questions for a product with pagination, optional keyword search, and the top answer pre-populated.
   */
  static async getProductQuestions(
    productId: string,
    query: { page?: number; limit?: number; search?: string } = {}
  ) {
    const productExists = await Product.exists({ _id: productId });
    if (!productExists) {
      throw ApiError.notFound('Product not found');
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 10);
    const skip = (page - 1) * limit;

    const filter: any = { product: productId, status: 'APPROVED' };
    if (query.search) {
      filter.content = { $regex: query.search, $options: 'i' };
    }

    const questions = await Question.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean to edit output inline

    const total = await Question.countDocuments(filter);

    // Hydrate each question with its top approved answer
    const questionsWithTopAnswer = await Promise.all(
      questions.map(async (q) => {
        const topAnswer = await Answer.findOne({ question: q._id, status: 'APPROVED' })
          .populate('user', 'name email')
          .sort({ isBestAnswer: -1, likesCount: -1, createdAt: -1 })
          .lean();
        return {
          ...q,
          topAnswer: topAnswer || null,
        };
      })
    );

    return {
      questions: questionsWithTopAnswer,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        total,
      },
    };
  }

  /**
   * Fetch all answers for a question with pagination (best answers first, then upvotes).
   */
  static async getQuestionAnswers(
    questionId: string,
    query: { page?: number; limit?: number } = {}
  ) {
    const questionExists = await Question.exists({ _id: questionId, status: 'APPROVED' });
    if (!questionExists) {
      throw ApiError.notFound('Question not found');
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 10);
    const skip = (page - 1) * limit;

    const filter = { question: questionId, status: 'APPROVED' };

    const answers = await Answer.find(filter)
      .populate('user', 'name email')
      .sort({ isBestAnswer: -1, likesCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Answer.countDocuments(filter);

    return {
      answers,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        total,
      },
    };
  }

  /**
   * Admin: List all questions across the platform.
   */
  static async listAllQuestions(query: { page?: number; limit?: number; status?: string } = {}) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 20);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.status) {
      filter.status = query.status;
    }

    const questions = await Question.find(filter)
      .populate('product', 'name slug images')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Question.countDocuments(filter);

    return {
      questions,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        total,
      },
    };
  }

  /**
   * Admin: Moderate a question's status (Approve or Reject).
   */
  static async moderateQuestion(questionId: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') {
    const question = await Question.findById(questionId);
    if (!question) {
      throw ApiError.notFound('Question not found');
    }

    question.status = status;
    await question.save();

    return question;
  }

  /**
   * Admin: List all answers across the platform.
   */
  static async listAllAnswers(query: { page?: number; limit?: number; status?: string } = {}) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 20);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.status) {
      filter.status = query.status;
    }

    const answers = await Answer.find(filter)
      .populate({
        path: 'question',
        select: 'content product',
        populate: { path: 'product', select: 'name slug' },
      })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Answer.countDocuments(filter);

    return {
      answers,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        total,
      },
    };
  }

  /**
   * Admin: Moderate an answer's status (Approve or Reject).
   */
  static async moderateAnswer(answerId: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') {
    const answer = await Answer.findById(answerId);
    if (!answer) {
      throw ApiError.notFound('Answer not found');
    }

    answer.status = status;
    await answer.save();

    // Recalculate count on parent question
    await this.updateQuestionAnswersCount(answer.question.toString());

    return answer;
  }
}

export default QaService;
