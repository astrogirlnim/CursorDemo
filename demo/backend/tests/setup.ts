import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

console.log('[Test Setup] Initializing test environment...');
console.log('[Test Setup] DATABASE_URL:', process.env.DATABASE_URL);

// Global test database pool - created immediately
export const testPool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://nmm@localhost:5432/taskmanager_test',
});

console.log('[Test Setup] Test database pool created');

/**
 * Clean up test database after all tests
 */
afterAll(async () => {
  console.log('[Test Setup] Cleaning up test database connection...');
  
  if (testPool) {
    await testPool.end();
    console.log('[Test Setup] Test database pool closed');
  }
});

/**
 * Clear all tables before each test for isolation
 */
export async function clearDatabase() {
  console.log('[Test Setup] Clearing all tables...');
  
  try {
    // Disable foreign key checks temporarily
    await testPool.query('SET session_replication_role = replica;');
    
    // Delete from tables in correct order to respect foreign keys
    await testPool.query('DELETE FROM team_members');
    await testPool.query('DELETE FROM tasks');
    await testPool.query('DELETE FROM teams');
    await testPool.query('DELETE FROM users');
    
    // Re-enable foreign key checks
    await testPool.query('SET session_replication_role = DEFAULT;');
    
    console.log('[Test Setup] All tables cleared successfully');
  } catch (error) {
    console.error('[Test Setup] Error clearing database:', error);
    throw error;
  }
}
