/**
 * Validation Utilities for Team Task Manager
 * Provides reusable validation functions with consistent error messages
 */

import { ValidationError } from './errors';

/**
 * Validate required string field
 */
export function validateRequired(value: any, fieldName: string): string {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    throw new ValidationError(`${fieldName} is required`, {
      [fieldName]: 'This field is required',
    });
  }
  return typeof value === 'string' ? value.trim() : value;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format', {
      email: 'Please provide a valid email address',
    });
  }
  return email.toLowerCase().trim();
}

/**
 * Validate password strength
 */
export function validatePassword(password: string, minLength: number = 8): void {
  if (password.length < minLength) {
    throw new ValidationError(
      `Password must be at least ${minLength} characters long`,
      { password: `Minimum ${minLength} characters required` }
    );
  }
}

/**
 * Validate integer ID parameter
 */
export function validateId(value: any, fieldName: string = 'ID'): number {
  const id = parseInt(value);
  if (isNaN(id) || id <= 0) {
    throw new ValidationError(`Invalid ${fieldName}`, {
      [fieldName.toLowerCase()]: 'Must be a valid positive integer',
    });
  }
  return id;
}

/**
 * Validate task status enum
 */
export function validateTaskStatus(status: string): 'todo' | 'in_progress' | 'done' {
  const validStatuses = ['todo', 'in_progress', 'done'];
  if (!validStatuses.includes(status)) {
    throw new ValidationError(
      'Invalid status. Must be: todo, in_progress, or done',
      { status: 'Invalid status value' }
    );
  }
  return status as 'todo' | 'in_progress' | 'done';
}

/**
 * Validate task priority enum
 */
export function validateTaskPriority(priority: string): 'low' | 'medium' | 'high' {
  const validPriorities = ['low', 'medium', 'high'];
  if (!validPriorities.includes(priority)) {
    throw new ValidationError(
      'Invalid priority. Must be: low, medium, or high',
      { priority: 'Invalid priority value' }
    );
  }
  return priority as 'low' | 'medium' | 'high';
}

/**
 * Validate pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export function validatePagination(
  page?: string | number,
  limit?: string | number,
  maxLimit: number = 100
): PaginationParams {
  // Parse and validate page number
  let pageNum = 1;
  if (page !== undefined) {
    pageNum = typeof page === 'string' ? parseInt(page) : page;
    if (isNaN(pageNum) || pageNum < 1) {
      throw new ValidationError('Invalid page number', {
        page: 'Page must be a positive integer',
      });
    }
  }

  // Parse and validate limit
  let limitNum = 10; // default limit
  if (limit !== undefined) {
    limitNum = typeof limit === 'string' ? parseInt(limit) : limit;
    if (isNaN(limitNum) || limitNum < 1) {
      throw new ValidationError('Invalid limit', {
        limit: 'Limit must be a positive integer',
      });
    }
    if (limitNum > maxLimit) {
      throw new ValidationError(`Limit cannot exceed ${maxLimit}`, {
        limit: `Maximum limit is ${maxLimit}`,
      });
    }
  }

  // Calculate offset
  const offset = (pageNum - 1) * limitNum;

  return { page: pageNum, limit: limitNum, offset };
}

/**
 * Generic enum validator
 */
export function validateEnum<T extends string>(
  value: string,
  validValues: T[],
  fieldName: string
): T {
  if (!validValues.includes(value as T)) {
    throw new ValidationError(
      `Invalid ${fieldName}. Must be one of: ${validValues.join(', ')}`,
      { [fieldName]: `Valid values are: ${validValues.join(', ')}` }
    );
  }
  return value as T;
}
