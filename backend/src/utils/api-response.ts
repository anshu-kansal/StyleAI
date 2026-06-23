import { ApiResponseType } from '../types/common.types';

export class ApiResponse {
  static success<T = any>(
    statusCode: number,
    message: string,
    data?: T,
    meta?: ApiResponseType['meta']
  ): ApiResponseType<T> {
    return {
      success: true,
      statusCode,
      message,
      data,
      meta,
    };
  }

  static error(
    statusCode: number,
    message: string,
    errors: string[] = []
  ): ApiResponseType {
    return {
      success: false,
      statusCode,
      message,
      errors,
    };
  }
}

export default ApiResponse;
