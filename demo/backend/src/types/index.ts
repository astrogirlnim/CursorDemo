// Shared TypeScript types for backend
// This file will contain interfaces and types used across the backend

/**
 * Standard API response format
 * Used by all controllers to ensure consistent response structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: Record<string, string>;
}

/**
 * Extend Express Request interface to include authenticated user
 * Set by authenticate middleware after JWT verification
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
      };
    }
  }
}
