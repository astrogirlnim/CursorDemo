import dotenv from 'dotenv';
import { pool } from '../src/config/database';

// Load test environment variables
dotenv.config({ path: '.env.test' });

console.log('[Test Setup] Initializing test environment');
console.log('[Test Setup] DATABASE_URL:', process.env.DATABASE_URL);
console.log('[Test Setup] JWT_SECRET:', process.env.JWT_SECRET ? '[SET]' : '[NOT SET]');

// Global test setup - runs once before all tests
beforeAll(async () => {
  console.log('[Test Setup] Running global beforeAll hook');
  
  try {
    // Verify database connection
    const result = await pool.query('SELECT NOW()');
    console.log('[Test Setup] Database connection verified:', result.rows[0].now);
  } catch (error) {
    console.error('[Test Setup] Failed to connect to test database:', error);
    throw error;
  }
});

// Global test teardown - runs once after all tests
afterAll(async () => {
  console.log('[Test Setup] Running global afterAll hook');
  
  try {
    // Clean up database connections
    await pool.end();
    console.log('[Test Setup] Database connections closed');
  } catch (error) {
    console.error('[Test Setup] Error closing database connections:', error);
  }
});

// Helper to clean up database tables between tests
export async function cleanupDatabase() {
  console.log('[Test Setup] Cleaning up database tables...');
  
  try {
    // Delete in correct order due to foreign key constraints
    await pool.query('DELETE FROM team_members');
    await pool.query('DELETE FROM tasks');
    await pool.query('DELETE FROM teams');
    await pool.query('DELETE FROM users');
    
    console.log('[Test Setup] Database cleanup complete');
  } catch (error) {
    console.error('[Test Setup] Error during database cleanup:', error);
    throw error;
  }
}

// Helper to create test user
export async function createTestUser(email: string, name: string, password: string = 'testpass123') {
  console.log(`[Test Setup] Creating test user: ${email}`);
  
  const bcrypt = require('bcryptjs');
  const passwordHash = await bcrypt.hash(password, 10);
  
  const result = await pool.query(
    'INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING *',
    [email, name, passwordHash]
  );
  
  console.log(`[Test Setup] Test user created with id: ${result.rows[0].id}`);
  return result.rows[0];
}

// Helper to create test team
export async function createTestTeam(name: string, ownerId: number) {
  console.log(`[Test Setup] Creating test team: ${name}`);
  
  const teamResult = await pool.query(
    'INSERT INTO teams (name, owner_id) VALUES ($1, $2) RETURNING *',
    [name, ownerId]
  );
  
  const team = teamResult.rows[0];
  
  // Add owner as member
  await pool.query(
    'INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3)',
    [team.id, ownerId, 'owner']
  );
  
  console.log(`[Test Setup] Test team created with id: ${team.id}`);
  return team;
}

// Helper to create test task
export async function createTestTask(
  title: string,
  creatorId?: number,
  teamId?: number,
  status: string = 'todo',
  priority: string = 'medium'
) {
  console.log(`[Test Setup] Creating test task: ${title}`);
  
  const result = await pool.query(
    'INSERT INTO tasks (title, creator_id, team_id, status, priority) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [title, creatorId, teamId, status, priority]
  );
  
  console.log(`[Test Setup] Test task created with id: ${result.rows[0].id}`);
  return result.rows[0];
}
