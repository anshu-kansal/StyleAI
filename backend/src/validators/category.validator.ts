import Joi from 'joi';

export const createCategorySchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().required().messages({
    'string.empty': 'Category name cannot be empty',
    'string.min': 'Category name must be at least 2 characters long',
    'string.max': 'Category name cannot exceed 50 characters',
    'any.required': 'Category name is required',
  }),
  description: Joi.string().trim().allow('').max(500).optional(),
  isActive: Joi.boolean().optional(),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().optional().messages({
    'string.empty': 'Category name cannot be empty',
    'string.min': 'Category name must be at least 2 characters long',
    'string.max': 'Category name cannot exceed 50 characters',
  }),
  description: Joi.string().trim().allow('').max(500).optional(),
  isActive: Joi.boolean().optional(),
});
