import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Application-level error class with HTTP status code support.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found handler — must be registered after all routes.
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
}

/**
 * Global error handler middleware.
 * Normalises errors into a consistent JSON response format.
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // Handle body-parser specific errors before generic handling
  if ((err as any).type === 'entity.too.large') {
    res.status(413).json({ error: 'Payload Too Large', message: 'Request body exceeds the 50 KB limit.' });
    return;
  }
  if ((err as any).type === 'entity.parse.failed') {
    res.status(400).json({ error: 'Bad Request', message: 'Request body is not valid JSON.' });
    return;
  }

  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const isOperational = err instanceof AppError ? err.isOperational : false;

  logger.error('Request error', {
    message: err.message,
    statusCode,
    path: req.path,
    method: req.method,
    stack: err.stack,
  });

  // Don't leak stack traces in production
  const response: Record<string, unknown> = {
    error: getErrorTitle(statusCode),
    message: isOperational ? err.message : 'An unexpected error occurred',
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

function getErrorTitle(statusCode: number): string {
  const titles: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
  };
  return titles[statusCode] ?? 'Error';
}
