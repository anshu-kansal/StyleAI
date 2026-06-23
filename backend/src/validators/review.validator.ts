import Joi from 'joi';

export const createReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).integer().required().messages({
    'number.base': 'Rating must be a number',
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating cannot be more than 5',
    'any.required': 'Rating is required',
  }),
  comment: Joi.string().min(3).max(1000).trim().required().messages({
    'string.empty': 'Comment cannot be empty',
    'string.min': 'Comment must be at least 3 characters long',
    'string.max': 'Comment cannot exceed 1000 characters',
    'any.required': 'Comment is required',
  }),
  images: Joi.array().items(Joi.string().uri()).optional(),
});
