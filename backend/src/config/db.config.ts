import mongoose from 'mongoose';
import { config } from './app.config';
import { logger } from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongoose.uri, config.mongoose.options);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

export default connectDB;
