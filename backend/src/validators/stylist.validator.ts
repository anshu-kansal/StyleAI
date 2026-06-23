import Joi from 'joi';
import { ProductGender } from '../constants/enums';

export const getRecommendationSchema = Joi.object({
  occasion: Joi.string().min(2).max(100).trim().required().messages({
    'string.empty': 'Occasion cannot be empty',
    'string.min': 'Occasion must be at least 2 characters long',
    'any.required': 'Occasion is required',
  }),
  gender: Joi.string()
    .valid(...Object.values(ProductGender), 'all')
    .default('unisex')
    .required(),
  budget: Joi.number().min(0).default(0).required().messages({
    'number.min': 'Budget cannot be a negative number',
  }),
  aesthetic: Joi.string().trim().allow('').max(300).optional(),
});
