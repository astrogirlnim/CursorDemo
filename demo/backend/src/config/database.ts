import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

console.log('[Database] Initializing connection pool...');
console.log('[Database] DATABASE_URL:', process.env.DATABASE_URL);

// Create PostgreSQL connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Log successful connection
pool.on('connect', () => {
  console.log('[Database] Connected successfully');
});

// Handle connection errors
pool.on('error', (err) => {
  console.error('[Database] Unexpected error:', err);
  process.exit(-1);
});
