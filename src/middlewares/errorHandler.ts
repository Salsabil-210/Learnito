import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Global error handler middleware
 * Handles AppError instances and unexpected errors
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error
  logger.error(err.message, {
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle custom AppError instances
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode,
    });
  }

  // Handle unexpected errors
  return res.status(500).json({
    error: 'Internal server error',
    statusCode: 500,
  });
};
