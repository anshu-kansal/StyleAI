import { validatedEnv } from './env.validation';

export const config = {
  env: validatedEnv.NODE_ENV,
  port: validatedEnv.PORT,
  mongoose: {
    uri: validatedEnv.MONGO_URI,
    options: {
      autoIndex: true,
    },
  },
  jwt: {
    secret: validatedEnv.JWT_SECRET,
    accessExpiration: validatedEnv.JWT_EXP,
    refreshExpiration: validatedEnv.REFRESH_TOKEN_EXP,
  },
  cloudinary: {
    cloudName: validatedEnv.CLOUDINARY_CLOUD_NAME,
    apiKey: validatedEnv.CLOUDINARY_API_KEY,
    apiSecret: validatedEnv.CLOUDINARY_API_SECRET,
  },
  razorpay: {
    keyId: validatedEnv.RAZORPAY_KEY_ID,
    keySecret: validatedEnv.RAZORPAY_KEY_SECRET,
    webhookSecret: validatedEnv.RAZORPAY_WEBHOOK_SECRET,
  },
  openai: {
    apiKey: validatedEnv.OPENAI_API_KEY,
  },
};
