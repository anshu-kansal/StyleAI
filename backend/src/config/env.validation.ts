import Joi from 'joi';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(5000),
  MONGO_URI: Joi.string().required().description('MongoDB connection URI'),
  JWT_SECRET: Joi.string().required().description('JWT access token secret key'),
  JWT_EXP: Joi.string().default('15m').description('JWT access token expiration time'),
  REFRESH_TOKEN_EXP: Joi.string().default('7d').description('JWT refresh token expiration time'),
  CLOUDINARY_CLOUD_NAME: Joi.string().required().description('Cloudinary cloud name'),
  CLOUDINARY_API_KEY: Joi.string().required().description('Cloudinary API key'),
  CLOUDINARY_API_SECRET: Joi.string().required().description('Cloudinary API secret'),
  RAZORPAY_KEY_ID: Joi.string().required().description('Razorpay Key ID'),
  RAZORPAY_KEY_SECRET: Joi.string().required().description('Razorpay Key Secret'),
  RAZORPAY_WEBHOOK_SECRET: Joi.string().allow('').optional().description('Razorpay Webhook Secret'),
  OPENAI_API_KEY: Joi.string().required().description('OpenAI API Key'),
})
  .unknown()
  .required();

const { error, value: envVars } = envVarsSchema.validate(process.env, {
  abortEarly: false,
});

if (error) {
  throw new Error(`Environment validation failed: ${error.message}`);
}

export const validatedEnv = envVars;
