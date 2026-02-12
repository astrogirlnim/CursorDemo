import { Pool } from 'pg';

// Create PostgreSQL connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Log successful connection
pool.on('connect', () => {
  console.log('Database connected successfully');
});

// Handle connection errors
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});
