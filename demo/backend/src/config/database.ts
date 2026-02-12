import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

console.log('[Database] Initializing optimized connection pool...');
console.log('[Database] DATABASE_URL:', process.env.DATABASE_URL);

/**
 * Optimized PostgreSQL Connection Pool Configuration
 * 
 * Performance optimizations:
 * - max: 20 connections (sufficient for most applications, prevents resource exhaustion)
 * - idleTimeoutMillis: 30s (reclaim idle connections)
 * - connectionTimeoutMillis: 5s (increased from 2s for better stability)
 * - statement_timeout: 30s (prevent long-running queries from blocking)
 * - query_timeout: 30s (application-level query timeout)
 * - keepAlive: true (maintain connection health)
 * - keepAliveInitialDelayMillis: 10s (start keepalive checks)
 */
const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  
  // Connection pool sizing
  max: 20, // Maximum number of connections in pool
  min: 5,  // Minimum number of connections to maintain
  
  // Timeout settings (optimized for <200ms target)
  idleTimeoutMillis: 30000,           // Close idle connections after 30s
  connectionTimeoutMillis: 5000,       // Wait max 5s for connection from pool
  
  // Statement timeout (PostgreSQL level)
  statement_timeout: 30000,            // Kill queries running longer than 30s
  
  // Query timeout (node-postgres level)
  query_timeout: 30000,                // Timeout individual queries after 30s
  
  // Connection health
  keepAlive: true,                     // Enable TCP keep-alive
  keepAliveInitialDelayMillis: 10000,  // Start keep-alive after 10s
  
  // Application name for monitoring
  application_name: 'team-task-manager',
};

// Create PostgreSQL connection pool
export const pool = new Pool(poolConfig);

// Connection event logging
let connectionCount = 0;

pool.on('connect', (client) => {
  connectionCount++;
  console.log(`[Database] Connection established (total: ${connectionCount})`);
  
  // Set session-level parameters for optimal performance
  client.query('SET statement_timeout = 30000'); // 30s timeout
  client.query('SET lock_timeout = 10000');      // 10s lock timeout
  client.query('SET idle_in_transaction_session_timeout = 60000'); // 60s idle transaction timeout
});

pool.on('acquire', (client) => {
  console.log('[Database] Connection acquired from pool');
});

pool.on('remove', (client) => {
  connectionCount--;
  console.log(`[Database] Connection removed (total: ${connectionCount})`);
});

// Handle connection errors
pool.on('error', (err, client) => {
  console.error('[Database] Unexpected pool error:', err);
  console.error('[Database] Error details:', {
    message: err.message,
    stack: err.stack,
  });
});

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  console.log('[Database] SIGTERM received, closing pool...');
  await pool.end();
  console.log('[Database] Pool closed gracefully');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[Database] SIGINT received, closing pool...');
  await pool.end();
  console.log('[Database] Pool closed gracefully');
  process.exit(0);
});

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('[Database] Connection test successful:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('[Database] Connection test failed:', error);
    return false;
  }
}

/**
 * Get pool statistics for monitoring
 */
export function getPoolStats() {
  return {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
  };
}

// Log pool stats periodically in development
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const stats = getPoolStats();
    console.log('[Database] Pool stats:', stats);
  }, 60000); // Every 60 seconds
}
