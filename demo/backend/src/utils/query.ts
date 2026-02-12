/**
 * Query Optimization Utilities
 * Reusable patterns for efficient database queries
 */

import { Pool, PoolClient } from 'pg';

/**
 * Execute multiple queries in parallel for better performance
 * Use when queries are independent of each other
 * 
 * @param pool - Database pool
 * @param queries - Array of queries with their parameters
 * @returns Array of results in same order as queries
 */
export async function executeParallel<T = any>(
  pool: Pool,
  queries: Array<{ text: string; values?: any[] }>
): Promise<T[]> {
  console.log(`[QueryUtil] Executing ${queries.length} queries in parallel`);
  const startTime = Date.now();
  
  const promises = queries.map(q => pool.query(q.text, q.values));
  const results = await Promise.all(promises);
  
  const elapsed = Date.now() - startTime;
  console.log(`[QueryUtil] Parallel queries completed in ${elapsed}ms`);
  
  return results.map(r => r.rows) as T[];
}

/**
 * Execute queries within a transaction
 * Ensures all queries succeed or all fail together
 * 
 * @param pool - Database pool
 * @param callback - Function that receives client and executes queries
 * @returns Result from callback
 */
export async function executeTransaction<T>(
  pool: Pool,
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  console.log('[QueryUtil] Transaction started');
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    console.log('[QueryUtil] Transaction committed');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[QueryUtil] Transaction rolled back:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Build dynamic WHERE clause from filters
 * Helps avoid SQL injection while building dynamic queries
 * 
 * @param filters - Object with filter key-value pairs
 * @returns Object with WHERE clause and values array
 */
export function buildWhereClause(
  filters: Record<string, any>
): { whereClause: string; values: any[]; paramCount: number } {
  const conditions: string[] = [];
  const values: any[] = [];
  let paramCount = 1;
  
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      conditions.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  }
  
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  return { whereClause, values, paramCount };
}

/**
 * Build dynamic UPDATE SET clause
 * Helps build UPDATE queries with only fields that need updating
 * 
 * @param updates - Object with field-value pairs to update
 * @param startParamCount - Starting parameter count (default: 1)
 * @returns Object with SET clause and values array
 */
export function buildSetClause(
  updates: Record<string, any>,
  startParamCount: number = 1
): { setClause: string; values: any[]; paramCount: number } {
  const setClauses: string[] = [];
  const values: any[] = [];
  let paramCount = startParamCount;
  
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      setClauses.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  }
  
  // Always update updated_at
  setClauses.push('updated_at = NOW()');
  
  const setClause = setClauses.join(', ');
  
  return { setClause, values, paramCount };
}

/**
 * Execute query with automatic retry on deadlock
 * Useful for high-concurrency scenarios
 * 
 * @param pool - Database pool
 * @param query - Query text
 * @param values - Query parameters
 * @param maxRetries - Maximum retry attempts (default: 3)
 * @returns Query result
 */
export async function queryWithRetry<T = any>(
  pool: Pool,
  query: string,
  values?: any[],
  maxRetries: number = 3
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await pool.query(query, values);
      return result.rows as T;
    } catch (error: any) {
      lastError = error;
      
      // Retry on deadlock (PostgreSQL error code 40P01)
      if (error.code === '40P01' && attempt < maxRetries) {
        console.warn(`[QueryUtil] Deadlock detected, retrying (attempt ${attempt}/${maxRetries})`);
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
}

/**
 * Format query result with optional transformation
 * Useful for converting database rows to application models
 * 
 * @param rows - Database rows
 * @param transform - Optional transformation function
 * @returns Transformed results
 */
export function formatResults<T, R = T>(
  rows: T[],
  transform?: (row: T) => R
): R[] {
  if (!transform) {
    return rows as unknown as R[];
  }
  
  return rows.map(transform);
}

/**
 * Check if query result is empty
 * Helper for cleaner code
 * 
 * @param result - Query result
 * @returns True if empty
 */
export function isQueryResultEmpty(result: any): boolean {
  return !result || !result.rows || result.rows.length === 0;
}

/**
 * Get first row from result or null
 * Helper for single-row queries
 * 
 * @param result - Query result
 * @returns First row or null
 */
export function firstOrNull<T>(result: any): T | null {
  if (isQueryResultEmpty(result)) {
    return null;
  }
  return result.rows[0] as T;
}

/**
 * Build LIMIT/OFFSET clause for pagination
 * 
 * @param limit - Number of records to return
 * @param offset - Number of records to skip
 * @returns SQL clause
 */
export function buildPaginationClause(limit: number, offset: number): string {
  return `LIMIT ${limit} OFFSET ${offset}`;
}

/**
 * Build ORDER BY clause safely
 * Prevents SQL injection in dynamic ordering
 * 
 * @param column - Column to order by
 * @param direction - Sort direction (ASC or DESC)
 * @param allowedColumns - Whitelist of allowed columns
 * @returns SQL clause
 */
export function buildOrderByClause(
  column: string,
  direction: 'ASC' | 'DESC' = 'DESC',
  allowedColumns: string[]
): string {
  // Validate column is in whitelist
  if (!allowedColumns.includes(column)) {
    throw new Error(`Invalid sort column: ${column}`);
  }
  
  // Validate direction
  if (direction !== 'ASC' && direction !== 'DESC') {
    throw new Error(`Invalid sort direction: ${direction}`);
  }
  
  return `ORDER BY ${column} ${direction}`;
}
