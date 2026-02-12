import { Pool } from 'pg';
import { User } from '../../src/models/user.model';
import { Task } from '../../src/models/task.model';
import { Team, TeamMember } from '../../src/models/team.model';
import bcrypt from 'bcryptjs';

/**
 * Test Database Utilities
 * Helper functions for creating test data
 */

/**
 * Create a test user directly in the database
 * @param pool - Database pool
 * @param email - User email
 * @param password - Plain text password (will be hashed)
 * @param name - User name
 * @returns Created user
 */
export async function createTestUser(
  pool: Pool,
  email: string = 'test@example.com',
  password: string = 'password123',
  name: string = 'Test User'
): Promise<User> {
  console.log(`[TestDB] Creating test user: ${email}`);
  
  const password_hash = await bcrypt.hash(password, 10);
  
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, name)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [email, password_hash, name]
  );
  
  console.log(`[TestDB] Test user created with id: ${result.rows[0].id}`);
  return result.rows[0];
}

/**
 * Create a test team directly in the database
 * @param pool - Database pool
 * @param name - Team name
 * @param owner_id - User ID of the team owner
 * @returns Created team
 */
export async function createTestTeam(
  pool: Pool,
  name: string = 'Test Team',
  owner_id: number
): Promise<Team> {
  console.log(`[TestDB] Creating test team: ${name}`);
  
  // Start transaction
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Create team
    const teamResult = await client.query(
      `INSERT INTO teams (name, owner_id)
       VALUES ($1, $2)
       RETURNING *`,
      [name, owner_id]
    );
    const team = teamResult.rows[0];
    
    // Add owner as team member
    await client.query(
      `INSERT INTO team_members (team_id, user_id, role)
       VALUES ($1, $2, $3)`,
      [team.id, owner_id, 'owner']
    );
    
    await client.query('COMMIT');
    console.log(`[TestDB] Test team created with id: ${team.id}`);
    
    return team;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Add a member to a team
 * @param pool - Database pool
 * @param team_id - Team ID
 * @param user_id - User ID to add
 * @param role - Member role (default: 'member')
 * @returns Created team member record
 */
export async function addTeamMember(
  pool: Pool,
  team_id: number,
  user_id: number,
  role: 'owner' | 'member' = 'member'
): Promise<TeamMember> {
  console.log(`[TestDB] Adding user ${user_id} to team ${team_id}`);
  
  const result = await pool.query(
    `INSERT INTO team_members (team_id, user_id, role)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [team_id, user_id, role]
  );
  
  console.log(`[TestDB] Team member added successfully`);
  return result.rows[0];
}

/**
 * Create a test task directly in the database
 * @param pool - Database pool
 * @param data - Task data
 * @returns Created task
 */
export async function createTestTask(
  pool: Pool,
  data: {
    title: string;
    description?: string;
    status?: 'todo' | 'in_progress' | 'done';
    priority?: 'low' | 'medium' | 'high';
    assignee_id?: number;
    creator_id?: number;
    team_id?: number;
  }
): Promise<Task> {
  console.log(`[TestDB] Creating test task: ${data.title}`);
  
  const {
    title,
    description = null,
    status = 'todo',
    priority = 'medium',
    assignee_id = null,
    creator_id = null,
    team_id = null,
  } = data;
  
  const result = await pool.query(
    `INSERT INTO tasks (title, description, status, priority, assignee_id, creator_id, team_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [title, description, status, priority, assignee_id, creator_id, team_id]
  );
  
  console.log(`[TestDB] Test task created with id: ${result.rows[0].id}`);
  return result.rows[0];
}
