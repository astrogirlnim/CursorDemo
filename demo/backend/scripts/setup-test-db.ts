import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load test environment
dotenv.config({ path: '.env.test' });

console.log('[Test DB Setup] Setting up test database...');
console.log('[Test DB Setup] DATABASE_URL:', process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/taskmanager_test',
});

async function setupTestDatabase() {
  try {
    console.log('[Test DB Setup] Creating test database schema...');

    // Drop existing tables (if any)
    await pool.query('DROP TABLE IF EXISTS team_members CASCADE');
    await pool.query('DROP TABLE IF EXISTS tasks CASCADE');
    await pool.query('DROP TABLE IF EXISTS teams CASCADE');
    await pool.query('DROP TABLE IF EXISTS users CASCADE');
    console.log('[Test DB Setup] Dropped existing tables');

    // Create users table
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('[Test DB Setup] Created users table');

    // Create teams table
    await pool.query(`
      CREATE TABLE teams (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('[Test DB Setup] Created teams table');

    // Create team_members junction table
    await pool.query(`
      CREATE TABLE team_members (
        id SERIAL PRIMARY KEY,
        team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(team_id, user_id)
      )
    `);
    console.log('[Test DB Setup] Created team_members table');

    // Create tasks table
    await pool.query(`
      CREATE TABLE tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'todo',
        priority VARCHAR(50) DEFAULT 'medium',
        assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        creator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('[Test DB Setup] Created tasks table');

    console.log('[Test DB Setup] ✅ Test database schema created successfully!');
  } catch (error) {
    console.error('[Test DB Setup] ❌ Error setting up test database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

setupTestDatabase();
