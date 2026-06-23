import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/app.config';
import { connectDB } from './config/db.config';
import { logger } from './utils/logger';
import { errorMiddleware } from './middlewares/error.middleware';
import apiRouter from './routes';
import { ApiError } from './utils/api-error';

const app = express();

// Set up security headers
app.use(helmet());

// Configure CORS
app.use(
  cors({
    origin: true, // In production, replace with actual allowed domain
    credentials: true,
  })
);

// Body parsers & cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// HTTP request logging connected to our custom logger
app.use(
  morgan('dev', {
    stream: {
      write: (message: string) => logger.debug(message.trim()),
    },
  })
);

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api', globalLimiter);

// Mount API routes under /api/v1
app.use('/api/v1', apiRouter);

// Handle unknown API routes (404)
app.use('*', (req, _res, next) => {
  next(ApiError.notFound(`Route ${req.originalUrl} not found`));
});

// Global error handler middleware (must be registered last)
app.use(errorMiddleware);

// Start server
const startServer = async () => {
  // Connect to database
  await connectDB();

  const server = app.listen(config.port, () => {
    logger.info(`Server running in ${config.env} mode on port ${config.port}`);
  });

  // Handle graceful shutdowns
  const gracefulShutdown = async () => {
    logger.info('Shutting down server gracefully...');
    server.close(() => {
      logger.info('HTTP server closed.');
      mongoose.connection.close().then(() => {
        logger.info('MongoDB connection closed.');
        process.exit(0);
      });
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
};

export { app };

if (process.env.NODE_ENV !== 'test') {
  startServer().catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });
}
