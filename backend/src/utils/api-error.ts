import { HttpStatus, HttpStatusType } from '../constants/http-status';

export class ApiError extends Error {
  public readonly statusCode: HttpStatusType;
  public readonly errors: string[];
  public readonly isOperational: boolean;

  constructor(
    statusCode: HttpStatusType,
    message: string,
    errors: string[] = [],
    isOperational = true,
    stack = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message: string, errors: string[] = []): ApiError {
    return new ApiError(HttpStatus.BAD_REQUEST, message, errors);
  }

  static unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError(HttpStatus.UNAUTHORIZED, message);
  }

  static forbidden(message = 'Forbidden'): ApiError {
    return new ApiError(HttpStatus.FORBIDDEN, message);
  }

  static notFound(message = 'Not Found'): ApiError {
    return new ApiError(HttpStatus.NOT_FOUND, message);
  }

  static conflict(message: string): ApiError {
    return new ApiError(HttpStatus.CONFLICT, message);
  }

  static internal(message = 'Internal Server Error', errors: string[] = []): ApiError {
    return new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, message, errors, false);
  }
}

export default ApiError;
