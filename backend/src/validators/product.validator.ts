import Joi from 'joi';
import { ProductGender, ProductSize } from '../constants/enums';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const variantValidationSchema = Joi.object({
  sku: Joi.string().trim().required().messages({
    'any.required': 'Variant SKU is required',
    'string.empty': 'Variant SKU cannot be empty',
  }),
  size: Joi.string().valid(...Object.values(ProductSize)).optional(),
  color: Joi.string().trim().optional(),
  price: Joi.number().min(0).required().messages({
    'any.required': 'Variant price is required',
    'number.min': 'Variant price cannot be negative',
  }),
  originalPrice: Joi.number().min(0).optional(),
  stock: Joi.number().integer().min(0).required().messages({
    'any.required': 'Variant stock is required',
    'number.min': 'Variant stock cannot be negative',
  }),
  images: Joi.array().items(Joi.string().uri()).optional(),
});

export const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(150).trim().required().messages({
    'string.empty': 'Product name cannot be empty',
    'string.min': 'Product name must be at least 2 characters long',
    'any.required': 'Product name is required',
  }),
  description: Joi.string().min(10).trim().required().messages({
    'string.empty': 'Product description cannot be empty',
    'string.min': 'Product description must be at least 10 characters long',
    'any.required': 'Product description is required',
  }),
  brand: Joi.string().regex(objectIdRegex).required().messages({
    'string.pattern.base': 'Invalid brand ID format',
    'any.required': 'Product brand is required',
  }),
  category: Joi.string().regex(objectIdRegex).required().messages({
    'string.pattern.base': 'Invalid category ID format',
    'any.required': 'Product category is required',
  }),
  gender: Joi.string().valid(...Object.values(ProductGender)).required().messages({
    'any.required': 'Product gender is required',
  }),
  images: Joi.array().items(Joi.string().uri()).optional(),
  variants: Joi.array().items(variantValidationSchema).min(1).required().messages({
    'any.required': 'At least one product variant is required',
    'array.min': 'At least one product variant is required',
  }),
  isActive: Joi.boolean().optional(),
  isFeatured: Joi.boolean().optional(),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(150).trim().optional(),
  description: Joi.string().min(10).trim().optional(),
  brand: Joi.string().regex(objectIdRegex).optional(),
  category: Joi.string().regex(objectIdRegex).optional(),
  gender: Joi.string().valid(...Object.values(ProductGender)).optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  variants: Joi.array().items(variantValidationSchema).optional(),
  isActive: Joi.boolean().optional(),
  isFeatured: Joi.boolean().optional(),
});
