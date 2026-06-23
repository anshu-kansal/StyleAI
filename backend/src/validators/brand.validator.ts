import Joi from 'joi';

export const createBrandSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().required().messages({
    'string.empty': 'Brand name cannot be empty',
    'string.min': 'Brand name must be at least 2 characters long',
    'string.max': 'Brand name cannot exceed 50 characters',
    'any.required': 'Brand name is required',
  }),
  description: Joi.string().trim().allow('').max(500).optional(),
  logoUrl: Joi.string().uri().trim().allow('').optional().messages({
    'string.uri': 'Please provide a valid URL for the brand logo',
  }),
  isActive: Joi.boolean().optional(),
});

export const updateBrandSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().optional().messages({
    'string.empty': 'Brand name cannot be empty',
    'string.min': 'Brand name must be at least 2 characters long',
    'string.max': 'Brand name cannot exceed 50 characters',
  }),
  description: Joi.string().trim().allow('').max(500).optional(),
  logoUrl: Joi.string().uri().trim().allow('').optional().messages({
    'string.uri': 'Please provide a valid URL for the brand logo',
  }),
  isActive: Joi.boolean().optional(),
});
