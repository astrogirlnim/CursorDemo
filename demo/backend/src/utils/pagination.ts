/**
 * Pagination Utilities for Team Task Manager
 * Provides consistent pagination support across list endpoints
 */

import { ApiResponse } from '../types';

/**
 * Paginated response metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Calculate pagination metadata
 */
export function calculatePaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message: string = 'Data retrieved successfully'
): PaginatedResponse<T> {
  const pagination = calculatePaginationMeta(page, limit, total);
  
  return {
    success: true,
    message,
    data,
    pagination,
  };
}

/**
 * Generate pagination SQL clauses
 */
export function getPaginationSQL(limit: number, offset: number): string {
  return `LIMIT ${limit} OFFSET ${offset}`;
}

/**
 * Build paginated query with count
 * Returns both the data query and count query
 */
export function buildPaginatedQueries(
  baseQuery: string,
  orderBy: string,
  limit: number,
  offset: number
): { dataQuery: string; countQuery: string } {
  // Remove trailing semicolon if present
  const cleanBaseQuery = baseQuery.trim().replace(/;$/, '');
  
  // Build data query with pagination
  const dataQuery = `
    ${cleanBaseQuery}
    ${orderBy}
    LIMIT ${limit} OFFSET ${offset}
  `;
  
  // Build count query (extract FROM ... WHERE portion)
  // This is a simple implementation - for complex queries, might need adjustment
  const countQuery = `
    SELECT COUNT(*) as total
    ${cleanBaseQuery.substring(cleanBaseQuery.toLowerCase().indexOf('from'))}
  `;
  
  return { dataQuery, countQuery };
}

/**
 * Log pagination query for debugging
 */
export function logPaginationQuery(
  endpoint: string,
  page: number,
  limit: number,
  offset: number,
  total?: number
): void {
  console.log(`[Pagination] ${endpoint} - Page: ${page}, Limit: ${limit}, Offset: ${offset}${total !== undefined ? `, Total: ${total}` : ''}`);
}
