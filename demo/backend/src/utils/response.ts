/**
 * Response Utilities for Team Task Manager
 * Provides consistent API response formatting
 */

import { Response } from 'express';
import { ApiResponse } from '../types';

/**
 * Send success response with data
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): void {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  } as ApiResponse<T>);
}

/**
 * Send error response with message
 */
export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500,
  details?: Record<string, string>
): void {
  const response: ApiResponse = {
    success: false,
    message,
    data: null,
  };

  if (details) {
    response.details = details;
  }

  res.status(statusCode).json(response);
}

/**
 * Send not found error response
 */
export function sendNotFound(
  res: Response,
  resource: string = 'Resource'
): void {
  sendError(res, `${resource} not found`, 404);
}

/**
 * Send validation error response with field details
 */
export function sendValidationError(
  res: Response,
  message: string,
  details?: Record<string, string>
): void {
  sendError(res, message, 400, details);
}

/**
 * Send unauthorized error response
 */
export function sendUnauthorized(
  res: Response,
  message: string = 'Authentication required'
): void {
  sendError(res, message, 401);
}

/**
 * Send forbidden error response
 */
export function sendForbidden(
  res: Response,
  message: string = 'Access denied'
): void {
  sendError(res, message, 403);
}
