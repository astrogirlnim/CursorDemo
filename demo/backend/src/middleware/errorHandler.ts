/**
 * Global Error Handler Middleware
 * Catches all errors and provides consistent error responses
 */

import { Request, Response, NextFunction } from 'express';
import { AppError, isOperationalError } from '../utils/errors';

/**
 * Global error handling middleware
 * Should be added after all routes
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('[ErrorHandler] Error caught:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });
  
  // Handle operational errors (expected errors)
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      data: null,
      ...(error.details && { details: error.details }),
    });
    return;
  }
  
  // Handle unexpected errors
  console.error('[ErrorHandler] Unexpected error:', error);
  
  // Don't expose internal error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred. Please try again later.',
    data: null,
    ...(isDevelopment && { error: error.message, stack: error.stack }),
  });
}

/**
 * 404 Not Found handler
 * Should be added before error handler but after all routes
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.log(`[NotFoundHandler] Route not found: ${req.method} ${req.path}`);
  
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
    data: null,
  });
}

/**
 * Async route handler wrapper
 * Automatically catches async errors and passes to error handler
 * 
 * Usage:
 * router.get('/path', asyncHandler(async (req, res) => {
 *   // async code here
 * }));
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
