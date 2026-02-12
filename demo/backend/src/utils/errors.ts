/**
 * Custom Error Classes for Team Task Manager
 * Provides consistent error handling and user-friendly messages
 */

/**
 * Base Application Error
 * All custom errors extend this class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, string>;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: Record<string, string>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error (400)
 * Used when client provides invalid input
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, string>) {
    super(message, 400, true, details);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication Error (401)
 * Used when authentication fails or token is invalid
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, true);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error (403)
 * Used when user lacks permission for the requested resource
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, true);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not Found Error (404)
 * Used when requested resource doesn't exist
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, true);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict Error (409)
 * Used for duplicate entries or constraint violations
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, string>) {
    super(message, 409, true, details);
    this.name = 'ConflictError';
  }
}

/**
 * Database Error (500)
 * Used for database-related errors with safe messages for clients
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', originalError?: Error) {
    super(message, 500, true);
    this.name = 'DatabaseError';
    
    // Log original error for debugging but don't expose to client
    if (originalError) {
      console.error('[DatabaseError] Original error:', originalError);
    }
  }
}

/**
 * Handle PostgreSQL Database Errors
 * Converts raw PostgreSQL errors to user-friendly error classes
 */
export function handleDatabaseError(error: any): AppError {
  console.error('[handleDatabaseError] Database error occurred:', {
    code: error.code,
    message: error.message,
    detail: error.detail,
    constraint: error.constraint,
  });

  // PostgreSQL error codes
  // Reference: https://www.postgresql.org/docs/current/errcodes-appendix.html
  
  switch (error.code) {
    // Unique constraint violation (23505)
    case '23505':
      if (error.constraint?.includes('email')) {
        return new ConflictError('Email already exists', { email: 'This email is already registered' });
      }
      if (error.constraint?.includes('team_members')) {
        return new ConflictError('User is already a member of this team');
      }
      return new ConflictError('Duplicate entry detected');

    // Foreign key constraint violation (23503)
    case '23503':
      if (error.constraint?.includes('team_id')) {
        return new NotFoundError('Team');
      }
      if (error.constraint?.includes('user_id')) {
        return new NotFoundError('User');
      }
      if (error.constraint?.includes('assignee_id')) {
        return new NotFoundError('Assignee');
      }
      return new ValidationError('Referenced resource does not exist');

    // Not null constraint violation (23502)
    case '23502':
      const column = error.column || 'field';
      return new ValidationError(`${column} is required`, { [column]: 'This field is required' });

    // Check constraint violation (23514)
    case '23514':
      if (error.constraint?.includes('status')) {
        return new ValidationError('Invalid status value. Must be: todo, in_progress, or done');
      }
      if (error.constraint?.includes('priority')) {
        return new ValidationError('Invalid priority value. Must be: low, medium, or high');
      }
      if (error.constraint?.includes('role')) {
        return new ValidationError('Invalid role value. Must be: owner or member');
      }
      return new ValidationError('Invalid value for field');

    // Connection errors
    case 'ECONNREFUSED':
    case 'ETIMEDOUT':
      console.error('[handleDatabaseError] Database connection error');
      return new DatabaseError('Database connection failed. Please try again later.');

    // Default: Generic database error
    default:
      console.error('[handleDatabaseError] Unhandled database error code:', error.code);
      return new DatabaseError('Database operation failed. Please try again later.');
  }
}

/**
 * Check if error is an operational error that should be reported to client
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}
