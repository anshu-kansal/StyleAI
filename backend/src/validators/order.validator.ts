import Joi from 'joi';

export const createOrderSchema = Joi.object({
  addressId: Joi.string().required().messages({
    'any.required': 'Shipping address ID is required',
    'string.empty': 'Shipping address ID cannot be empty',
  }),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        sku: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'Order must contain at least 1 item',
      'any.required': 'Order items are required',
    }),
});

export const verifyPaymentSchema = Joi.object({
  razorpay_order_id: Joi.string().required().messages({
    'any.required': 'Razorpay order ID is required',
  }),
  razorpay_payment_id: Joi.string().required().messages({
    'any.required': 'Razorpay payment ID is required',
  }),
  razorpay_signature: Joi.string().required().messages({
    'any.required': 'Razorpay signature is required',
  }),
  addressId: Joi.string().required().messages({
    'any.required': 'Shipping address ID is required',
  }),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        sku: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required(),
});

export const updateOrderStatusSchema = Joi.object({
  orderStatus: Joi.string()
    .valid('PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED')
    .required()
    .messages({
      'any.only': 'Invalid order status value',
      'any.required': 'Order status is required',
    }),
});
