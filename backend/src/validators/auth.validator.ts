import Joi from 'joi';
import { UserRole } from '../constants/enums';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().required().messages({
    'string.empty': 'Name cannot be empty',
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 50 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().trim().lowercase().required().messages({
    'string.empty': 'Email cannot be empty',
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Password cannot be empty',
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
  roles: Joi.array().items(Joi.string().valid(...Object.values(UserRole))).optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required().messages({
    'string.empty': 'Email cannot be empty',
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password cannot be empty',
    'any.required': 'Password is required',
  }),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required().messages({
    'string.empty': 'Email cannot be empty',
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required',
  }),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'string.empty': 'Token cannot be empty',
    'any.required': 'Token is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Password cannot be empty',
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
});
