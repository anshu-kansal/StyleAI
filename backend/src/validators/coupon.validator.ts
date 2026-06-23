import Joi from 'joi';

export const createCouponSchema = Joi.object({
  code: Joi.string().min(3).max(20).trim().uppercase().required().messages({
    'string.empty': 'Coupon code cannot be empty',
    'string.min': 'Coupon code must be at least 3 characters',
    'any.required': 'Coupon code is required',
  }),
  discountType: Joi.string().valid('PERCENTAGE', 'FIXED').required().messages({
    'any.only': 'Discount type must be PERCENTAGE or FIXED',
    'any.required': 'Discount type is required',
  }),
  discountValue: Joi.number().min(1).required().messages({
    'number.min': 'Discount value must be at least 1',
    'any.required': 'Discount value is required',
  }),
  minOrderAmount: Joi.number().min(0).default(0),
  maxDiscount: Joi.number().min(0).default(0),
  validFrom: Joi.date().iso().required().messages({
    'any.required': 'Valid from date is required',
  }),
  validUntil: Joi.date().iso().greater(Joi.ref('validFrom')).required().messages({
    'date.greater': 'Valid until must be after valid from date',
    'any.required': 'Valid until date is required',
  }),
  isActive: Joi.boolean().default(true),
  usageLimit: Joi.number().integer().min(0).default(0),
  applicableCategories: Joi.array().items(Joi.string().hex().length(24)).optional().default([]),
  applicableProducts: Joi.array().items(Joi.string().hex().length(24)).optional().default([]),
  firstTimeOnly: Joi.boolean().optional().default(false),
  usageLimitPerUser: Joi.number().integer().min(0).optional().default(0),
  userRestrictions: Joi.array().items(Joi.string().hex().length(24)).optional().default([]),
});

export const updateCouponSchema = Joi.object({
  code: Joi.string().min(3).max(20).trim().uppercase(),
  discountType: Joi.string().valid('PERCENTAGE', 'FIXED'),
  discountValue: Joi.number().min(1),
  minOrderAmount: Joi.number().min(0),
  maxDiscount: Joi.number().min(0),
  validFrom: Joi.date().iso(),
  validUntil: Joi.date().iso(),
  isActive: Joi.boolean(),
  usageLimit: Joi.number().integer().min(0),
  applicableCategories: Joi.array().items(Joi.string().hex().length(24)).optional(),
  applicableProducts: Joi.array().items(Joi.string().hex().length(24)).optional(),
  firstTimeOnly: Joi.boolean().optional(),
  usageLimitPerUser: Joi.number().integer().min(0).optional(),
  userRestrictions: Joi.array().items(Joi.string().hex().length(24)).optional(),
}).min(1);

export const validateCouponSchema = Joi.object({
  code: Joi.string().trim().uppercase().required().messages({
    'any.required': 'Coupon code is required',
  }),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().hex().length(24).required().messages({
          'any.required': 'Product ID is required',
          'string.hex': 'Invalid Product ID format',
        }),
        sku: Joi.string().required().messages({
          'any.required': 'SKU is required',
        }),
        price: Joi.number().min(0).required().messages({
          'any.required': 'Price is required',
        }),
        quantity: Joi.number().integer().min(1).required().messages({
          'any.required': 'Quantity is required',
        }),
      })
    )
    .required()
    .messages({
      'any.required': 'Items are required',
    }),
});
