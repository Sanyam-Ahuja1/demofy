import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { errorResponse } from '../utils/response';
import { logger } from '../utils/logger';
import { env } from '../config/env';

/**
 * Global error handler middleware
 * Catches all errors and formats them consistently
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Log error
  logger.error('Error caught by error handler:', {
    message: err.message,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Handle custom AppError instances
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      errorResponse(err.code, err.message, err.details)
    );
  }

  // Handle unexpected errors
  const statusCode = 500;
  const code = 'INTERNAL_ERROR';
  const message =
    env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message;

  return res.status(statusCode).json(errorResponse(code, message));
};

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json(
    errorResponse('NOT_FOUND', `Route ${req.method} ${req.path} not found`)
  );
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
