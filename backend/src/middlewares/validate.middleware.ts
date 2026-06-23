import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiError } from '../utils/api-error';

export interface ValidationSchema {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}

export const validate = (schema: ValidationSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parts: Array<'body' | 'query' | 'params'> = ['body', 'query', 'params'];
    const errors: string[] = [];

    for (const part of parts) {
      const partSchema = schema[part];
      if (partSchema) {
        const { error, value } = partSchema.validate(req[part], {
          abortEarly: false,
          stripUnknown: true,
        });

        if (error) {
          errors.push(...error.details.map((detail) => detail.message));
        } else {
          req[part] = value;
        }
      }
    }

    if (errors.length > 0) {
      throw ApiError.badRequest('Validation Error', errors);
    }

    next();
  };
};

export default validate;
