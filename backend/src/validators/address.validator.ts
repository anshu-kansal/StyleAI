import Joi from 'joi';

export const createAddressSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).trim().required().messages({
    'string.empty': 'Full name cannot be empty',
    'string.min': 'Full name must be at least 2 characters long',
    'any.required': 'Full name is required',
  }),
  addressLine1: Joi.string().min(5).max(200).trim().required().messages({
    'string.empty': 'Address Line 1 cannot be empty',
    'string.min': 'Address Line 1 must be at least 5 characters long',
    'any.required': 'Address Line 1 is required',
  }),
  addressLine2: Joi.string().trim().allow('').max(200).optional(),
  city: Joi.string().min(2).max(100).trim().required().messages({
    'string.empty': 'City cannot be empty',
    'any.required': 'City is required',
  }),
  state: Joi.string().min(2).max(100).trim().required().messages({
    'string.empty': 'State cannot be empty',
    'any.required': 'State is required',
  }),
  postalCode: Joi.string().min(3).max(10).trim().required().messages({
    'string.empty': 'Postal code cannot be empty',
    'any.required': 'Postal code is required',
  }),
  country: Joi.string().min(2).max(100).trim().default('India').optional(),
  phone: Joi.string().min(10).max(15).trim().required().messages({
    'string.empty': 'Phone number cannot be empty',
    'string.min': 'Phone number must be at least 10 digits long',
    'any.required': 'Phone number is required',
  }),
  isDefault: Joi.boolean().optional(),
});

export const updateAddressSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).trim().optional(),
  addressLine1: Joi.string().min(5).max(200).trim().optional(),
  addressLine2: Joi.string().trim().allow('').max(200).optional(),
  city: Joi.string().min(2).max(100).trim().optional(),
  state: Joi.string().min(2).max(100).trim().optional(),
  postalCode: Joi.string().min(3).max(10).trim().optional(),
  country: Joi.string().min(2).max(100).trim().optional(),
  phone: Joi.string().min(10).max(15).trim().optional(),
  isDefault: Joi.boolean().optional(),
});
