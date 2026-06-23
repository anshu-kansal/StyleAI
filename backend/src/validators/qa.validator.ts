import Joi from 'joi';

export const createQuestionSchema = Joi.object({
  content: Joi.string().min(10).max(500).trim().required().messages({
    'string.empty': 'Question content cannot be empty',
    'string.min': 'Question must be at least 10 characters long',
    'string.max': 'Question cannot exceed 500 characters',
    'any.required': 'Question content is required',
  }),
});

export const createAnswerSchema = Joi.object({
  content: Joi.string().min(10).max(1000).trim().required().messages({
    'string.empty': 'Answer content cannot be empty',
    'string.min': 'Answer must be at least 10 characters long',
    'string.max': 'Answer cannot exceed 1000 characters',
    'any.required': 'Answer content is required',
  }),
});
