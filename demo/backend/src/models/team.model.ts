import { pool } from '../config/database';

/**
 * Team interface matching database schema
 */
export interface Team {
  id: number;
  name: string;
  owner_id: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * TeamMember interface matching team_members junction table
 */
export interface TeamMember {
  id: number;
  team_id: number;
  user_id: number;
  role: 'owner' | 'member';
  joined_at: Date;
}

/**
 * DTO for creating a new team
 */
export interface CreateTeamDTO {
  name: string;
  owner_id: number;
}

/**
 * Team with member details for API responses
 */
export interface TeamWithMembers extends Team {
  members: TeamMember[];
}

/**
 * Team Model - handles all database operations for teams and team membership
 * Follows Repository Pattern with prepared statements for security
 */
export class TeamModel {
  /**
   * Create a new team and automatically add owner as member
   * @param name - Team name
   * @param owner_id - User ID of the team owner
   * @returns Newly created team
   */
  static async create(name: string, owner_id: number): Promise<Team> {
    console.log(`[TeamModel] Creating new team: "${name}" for user ${owner_id}`);
    
    // Start transaction to ensure team and membership are created together
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      console.log('[TeamModel] Transaction started');
      
      // Create team
      const teamResult = await client.query(
        `INSERT INTO teams (name, owner_id)
         VALUES ($1, $2)
         RETURNING *`,
        [name, owner_id]
      );
      const team = teamResult.rows[0];
      console.log(`[TeamModel] Team created with id: ${team.id}`);
      
      // Add owner as team member with 'owner' role
      await client.query(
        `INSERT INTO team_members (team_id, user_id, role)
         VALUES ($1, $2, $3)`,
        [team.id, owner_id, 'owner']
      );
      console.log(`[TeamModel] Owner added as team member`);
      
      await client.query('COMMIT');
      console.log('[TeamModel] Transaction committed successfully');
      
      return team;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('[TeamModel] Transaction rolled back due to error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all teams for a specific user (where user is a member)
   * @param user_id - User ID to fetch teams for
   * @returns Array of teams the user is a member of
   */
  static async findByUserId(user_id: number): Promise<Team[]> {
    console.log(`[TeamModel] Fetching teams for user ${user_id}`);
    
    const result = await pool.query(
      `SELECT t.* 
       FROM teams t
       INNER JOIN team_members tm ON t.id = tm.team_id
       WHERE tm.user_id = $1
       ORDER BY t.created_at DESC`,
      [user_id]
    );
    
    console.log(`[TeamModel] Found ${result.rows.length} teams for user ${user_id}`);
    return result.rows;
  }

  /**
   * Get a single team by ID
   * @param id - Team ID
   * @returns Team or null if not found
   */
  static async findById(id: number): Promise<Team | null> {
    console.log(`[TeamModel] Fetching team with id: ${id}`);
    
    const result = await pool.query(
      'SELECT * FROM teams WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      console.log(`[TeamModel] Team with id ${id} not found`);
      return null;
    }
    
    console.log(`[TeamModel] Found team: ${result.rows[0].name}`);
    return result.rows[0];
  }

  /**
   * Get all members of a team
   * @param team_id - Team ID
   * @returns Array of team members
   */
  static async getMembers(team_id: number): Promise<TeamMember[]> {
    console.log(`[TeamModel] Fetching members for team ${team_id}`);
    
    const result = await pool.query(
      `SELECT * FROM team_members 
       WHERE team_id = $1 
       ORDER BY joined_at ASC`,
      [team_id]
    );
    
    console.log(`[TeamModel] Found ${result.rows.length} members for team ${team_id}`);
    return result.rows;
  }

  /**
   * Add a user to a team as a member
   * @param team_id - Team ID
   * @param user_id - User ID to add
   * @returns Created team member record
   */
  static async addMember(team_id: number, user_id: number): Promise<TeamMember> {
    console.log(`[TeamModel] Adding user ${user_id} to team ${team_id}`);
    
    const result = await pool.query(
      `INSERT INTO team_members (team_id, user_id, role)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [team_id, user_id, 'member']
    );
    
    console.log(`[TeamModel] User ${user_id} added to team ${team_id} successfully`);
    return result.rows[0];
  }

  /**
   * Remove a user from a team
   * @param team_id - Team ID
   * @param user_id - User ID to remove
   * @returns True if removed, false if not found
   */
  static async removeMember(team_id: number, user_id: number): Promise<boolean> {
    console.log(`[TeamModel] Removing user ${user_id} from team ${team_id}`);
    
    const result = await pool.query(
      'DELETE FROM team_members WHERE team_id = $1 AND user_id = $2 RETURNING id',
      [team_id, user_id]
    );
    
    if (result.rows.length === 0) {
      console.log(`[TeamModel] Membership not found for user ${user_id} in team ${team_id}`);
      return false;
    }
    
    console.log(`[TeamModel] User ${user_id} removed from team ${team_id} successfully`);
    return true;
  }

  /**
   * Check if a user is a member of a team
   * @param team_id - Team ID
   * @param user_id - User ID to check
   * @returns True if user is a member, false otherwise
   */
  static async isMember(team_id: number, user_id: number): Promise<boolean> {
    console.log(`[TeamModel] Checking if user ${user_id} is member of team ${team_id}`);
    
    const result = await pool.query(
      'SELECT COUNT(*) FROM team_members WHERE team_id = $1 AND user_id = $2',
      [team_id, user_id]
    );
    
    const isMember = parseInt(result.rows[0].count) > 0;
    console.log(`[TeamModel] User ${user_id} is${isMember ? '' : ' NOT'} a member of team ${team_id}`);
    
    return isMember;
  }

  /**
   * Check if a user is the owner of a team
   * @param team_id - Team ID
   * @param user_id - User ID to check
   * @returns True if user is the owner, false otherwise
   */
  static async isOwner(team_id: number, user_id: number): Promise<boolean> {
    console.log(`[TeamModel] Checking if user ${user_id} is owner of team ${team_id}`);
    
    const result = await pool.query(
      'SELECT COUNT(*) FROM teams WHERE id = $1 AND owner_id = $2',
      [team_id, user_id]
    );
    
    const isOwner = parseInt(result.rows[0].count) > 0;
    console.log(`[TeamModel] User ${user_id} is${isOwner ? '' : ' NOT'} the owner of team ${team_id}`);
    
    return isOwner;
  }

  /**
   * Delete a team (CASCADE will remove all team_members and update tasks)
   * @param id - Team ID
   * @returns True if deleted, false if not found
   */
  static async delete(id: number): Promise<boolean> {
    console.log(`[TeamModel] Deleting team ${id}`);
    
    const result = await pool.query(
      'DELETE FROM teams WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      console.log(`[TeamModel] Team with id ${id} not found for deletion`);
      return false;
    }
    
    console.log(`[TeamModel] Team ${id} deleted successfully (CASCADE removed members)`);
    return true;
  }
}
