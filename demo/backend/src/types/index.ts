// Shared TypeScript types for backend
// This file will contain interfaces and types used across the backend

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Record<string, string>;
}
