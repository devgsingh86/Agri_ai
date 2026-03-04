import { Request, Response, NextFunction, RequestHandler } from 'express';
import Joi from 'joi';
import { AppError } from './error.middleware';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Creates an Express middleware that validates req[target] against a Joi schema.
 * Returns 422 Unprocessable Entity with detailed field errors on failure.
 *
 * @param schema - Joi validation schema
 * @param target - Which part of the request to validate (default: 'body')
 */
export function validate(
  schema: Joi.ObjectSchema,
  target: ValidationTarget = 'body'
): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      return next(
        new AppError(
          `Validation failed: ${details.map((d) => d.message).join(', ')}`,
          422
        )
      );
    }

    // Replace with validated & sanitised values
    (req as unknown as Record<string, unknown>)[target] = value;
    next();
  };
}
