import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';
import { ApiResponse } from '../utils/api-response';
import { logger } from '../utils/logger';
import { HttpStatus, HttpStatusType } from '../constants/http-status';

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = err;

  // If the error is not a custom ApiError, try parsing it
  if (!(error instanceof ApiError)) {
    let statusCode: HttpStatusType = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = err.message || 'Internal Server Error';
    let errors: string[] = [];

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
      statusCode = HttpStatus.BAD_REQUEST;
      message = 'Validation Error';
      errors = Object.values(err.errors).map((el: any) => el.message);
      error = new ApiError(statusCode, message, errors, true, err.stack);
    }
    // Mongoose Duplicate Key Error
    else if (err.code === 11000) {
      statusCode = HttpStatus.CONFLICT;
      const field = Object.keys(err.keyValue)[0];
      message = `Duplicate field value entered: ${field}`;
      errors = [`Field '${field}' must be unique.`];
      error = new ApiError(statusCode, message, errors, true, err.stack);
    }
    // Mongoose CastError (e.g. invalid ObjectId)
    else if (err.name === 'CastError') {
      statusCode = HttpStatus.BAD_REQUEST;
      message = `Resource not found with id of ${err.value}`;
      errors = [`Invalid format for field '${err.path}'.`];
      error = new ApiError(statusCode, message, errors, true, err.stack);
    }
    // JWT Errors
    else if (err.name === 'JsonWebTokenError') {
      statusCode = HttpStatus.UNAUTHORIZED;
      message = 'Invalid token. Please log in again.';
      error = new ApiError(statusCode, message, [], true, err.stack);
    } else if (err.name === 'TokenExpiredError') {
      statusCode = HttpStatus.UNAUTHORIZED;
      message = 'Your token has expired. Please log in again.';
      error = new ApiError(statusCode, message, [], true, err.stack);
    }
    // General runtime errors
    else {
      const isOperational = false;
      error = new ApiError(statusCode, message, [], isOperational, err.stack);
    }
  }

  // Log error using logger (only log stack trace if it is not operational / general developer error)
  if (error.isOperational) {
    logger.warn(`${req.method} ${req.path} - ${error.statusCode} - ${error.message}`, error.errors);
  } else {
    logger.error(`${req.method} ${req.path} - Unhandled Exception`, error.stack || error);
  }

  const responseMessage = error.message || 'An unexpected error occurred';
  const responseErrors = error.errors && error.errors.length > 0 ? error.errors : undefined;

  res.status(error.statusCode).json(
    ApiResponse.error(
      error.statusCode,
      responseMessage,
      responseErrors
    )
  );
};

export default errorMiddleware;
