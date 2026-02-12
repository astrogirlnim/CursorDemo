import { pool } from '../config/database';
import { handleDatabaseError } from '../utils/errors';
import { cache, CacheKeys, CacheInvalidation } from '../utils/cache';

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
 * Paginated team results
 */
export interface PaginatedTeams {
  teams: Team[];
  total: number;
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
      throw handleDatabaseError(error);
    } finally {
      client.release();
    }
  }

  /**
   * Get all teams for a specific user (where user is a member) with pagination
   * @param user_id - User ID to fetch teams for
   * @param limit - Number of teams to return
   * @param offset - Number of teams to skip
   * @returns Paginated teams and total count
   */
  static async findByUserId(
    user_id: number,
    limit?: number,
    offset?: number
  ): Promise<PaginatedTeams> {
    console.log(`[TeamModel] Fetching teams for user ${user_id}`, { limit, offset });
    
    try {
      const isPaginated = limit !== undefined && offset !== undefined;
      
      if (isPaginated) {
        const [countResult, dataResult] = await Promise.all([
          pool.query(
            `SELECT COUNT(DISTINCT t.id) 
             FROM teams t
             INNER JOIN team_members tm ON t.id = tm.team_id
             WHERE tm.user_id = $1`,
            [user_id]
          ),
          pool.query(
            `SELECT t.* 
             FROM teams t
             INNER JOIN team_members tm ON t.id = tm.team_id
             WHERE tm.user_id = $1
             ORDER BY t.created_at DESC
             LIMIT $2 OFFSET $3`,
            [user_id, limit, offset]
          ),
        ]);
        
        const total = parseInt(countResult.rows[0].count);
        console.log(`[TeamModel] Found ${dataResult.rows.length} of ${total} teams for user ${user_id}`);
        
        return { teams: dataResult.rows, total };
      } else {
        const result = await pool.query(
          `SELECT t.* 
           FROM teams t
           INNER JOIN team_members tm ON t.id = tm.team_id
           WHERE tm.user_id = $1
           ORDER BY t.created_at DESC`,
          [user_id]
        );
        
        console.log(`[TeamModel] Found ${result.rows.length} teams for user ${user_id}`);
        return { teams: result.rows, total: result.rows.length };
      }
    } catch (error) {
      console.error('[TeamModel] Error fetching teams by user:', error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * Get a single team by ID
   * @param id - Team ID
   * @returns Team or null if not found
   */
  static async findById(id: number): Promise<Team | null> {
    console.log(`[TeamModel] Fetching team with id: ${id}`);
    
    try {
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
    } catch (error) {
      console.error('[TeamModel] Error fetching team by ID:', error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * Get team with members in a single optimized query (solves N+1 problem)
   * @param id - Team ID
   * @returns Team with members array or null if not found
   */
  static async findByIdWithMembers(id: number): Promise<TeamWithMembers | null> {
    console.log(`[TeamModel] Fetching team ${id} with members (optimized query)`);
    
    try {
      // Single query to get team and all members
      // Uses LEFT JOIN to include team even if no members (shouldn't happen, but safe)
      const result = await pool.query(
        `SELECT 
          t.id, t.name, t.owner_id, t.created_at, t.updated_at,
          tm.id as member_id, tm.user_id, tm.role, tm.joined_at
         FROM teams t
         LEFT JOIN team_members tm ON t.id = tm.team_id
         WHERE t.id = $1
         ORDER BY tm.joined_at ASC`,
        [id]
      );
      
      if (result.rows.length === 0) {
        console.log(`[TeamModel] Team with id ${id} not found`);
        return null;
      }
      
      // Build team object from first row
      const firstRow = result.rows[0];
      const team: TeamWithMembers = {
        id: firstRow.id,
        name: firstRow.name,
        owner_id: firstRow.owner_id,
        created_at: firstRow.created_at,
        updated_at: firstRow.updated_at,
        members: [],
      };
      
      // Build members array from all rows
      for (const row of result.rows) {
        if (row.member_id) {
          team.members.push({
            id: row.member_id,
            team_id: row.id,
            user_id: row.user_id,
            role: row.role,
            joined_at: row.joined_at,
          });
        }
      }
      
      console.log(`[TeamModel] Found team "${team.name}" with ${team.members.length} members (1 query)`);
      return team;
    } catch (error) {
      console.error('[TeamModel] Error fetching team with members:', error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * Get all members of a team
   * @param team_id - Team ID
   * @returns Array of team members
   */
  static async getMembers(team_id: number): Promise<TeamMember[]> {
    console.log(`[TeamModel] Fetching members for team ${team_id}`);
    
    try {
      const result = await pool.query(
        `SELECT * FROM team_members 
         WHERE team_id = $1 
         ORDER BY joined_at ASC`,
        [team_id]
      );
      
      console.log(`[TeamModel] Found ${result.rows.length} members for team ${team_id}`);
      return result.rows;
    } catch (error) {
      console.error('[TeamModel] Error fetching team members:', error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * Add a user to a team as a member
   * @param team_id - Team ID
   * @param user_id - User ID to add
   * @returns Created team member record
   */
  static async addMember(team_id: number, user_id: number): Promise<TeamMember> {
    console.log(`[TeamModel] Adding user ${user_id} to team ${team_id}`);
    
    try {
      const result = await pool.query(
        `INSERT INTO team_members (team_id, user_id, role)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [team_id, user_id, 'member']
      );
      
      console.log(`[TeamModel] User ${user_id} added to team ${team_id} successfully`);
      
      // Invalidate relevant caches
      CacheInvalidation.teamMembership(team_id, user_id);
      
      return result.rows[0];
    } catch (error) {
      console.error('[TeamModel] Error adding team member:', error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * Remove a user from a team
   * @param team_id - Team ID
   * @param user_id - User ID to remove
   * @returns True if removed, false if not found
   */
  static async removeMember(team_id: number, user_id: number): Promise<boolean> {
    console.log(`[TeamModel] Removing user ${user_id} from team ${team_id}`);
    
    try {
      const result = await pool.query(
        'DELETE FROM team_members WHERE team_id = $1 AND user_id = $2 RETURNING id',
        [team_id, user_id]
      );
      
      if (result.rows.length === 0) {
        console.log(`[TeamModel] Membership not found for user ${user_id} in team ${team_id}`);
        return false;
      }
      
      console.log(`[TeamModel] User ${user_id} removed from team ${team_id} successfully`);
      
      // Invalidate relevant caches
      CacheInvalidation.teamMembership(team_id, user_id);
      
      return true;
    } catch (error) {
      console.error('[TeamModel] Error removing team member:', error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * Check if a user is a member of a team
   * Uses EXISTS for better performance than COUNT(*)
   * OPTIMIZED: Caches membership checks for 60s to reduce database queries
   * 
   * @param team_id - Team ID
   * @param user_id - User ID to check
   * @returns True if user is a member, false otherwise
   */
  static async isMember(team_id: number, user_id: number): Promise<boolean> {
    console.log(`[TeamModel] Checking if user ${user_id} is member of team ${team_id}`);
    
    try {
      // Try to get from cache first (most accessed query in the app)
      const cacheKey = CacheKeys.teamMember(team_id, user_id);
      
      return await cache.getOrCompute(
        cacheKey,
        async () => {
          const result = await pool.query(
            'SELECT EXISTS(SELECT 1 FROM team_members WHERE team_id = $1 AND user_id = $2) as is_member',
            [team_id, user_id]
          );
          
          const isMember = result.rows[0].is_member;
          console.log(`[TeamModel] User ${user_id} is${isMember ? '' : ' NOT'} a member of team ${team_id} (from DB)`);
          
          return isMember;
        },
        60000 // Cache for 60 seconds
      );
    } catch (error) {
      console.error('[TeamModel] Error checking team membership:', error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * Check if a user is the owner of a team
   * Uses EXISTS for better performance than COUNT(*)
   * OPTIMIZED: Caches ownership checks for 60s to reduce database queries
   * 
   * @param team_id - Team ID
   * @param user_id - User ID to check
   * @returns True if user is the owner, false otherwise
   */
  static async isOwner(team_id: number, user_id: number): Promise<boolean> {
    console.log(`[TeamModel] Checking if user ${user_id} is owner of team ${team_id}`);
    
    try {
      // Try to get from cache first (frequently accessed for authorization)
      const cacheKey = CacheKeys.teamOwner(team_id, user_id);
      
      return await cache.getOrCompute(
        cacheKey,
        async () => {
          const result = await pool.query(
            'SELECT EXISTS(SELECT 1 FROM teams WHERE id = $1 AND owner_id = $2) as is_owner',
            [team_id, user_id]
          );
          
          const isOwner = result.rows[0].is_owner;
          console.log(`[TeamModel] User ${user_id} is${isOwner ? '' : ' NOT'} the owner of team ${team_id} (from DB)`);
          
          return isOwner;
        },
        60000 // Cache for 60 seconds
      );
    } catch (error) {
      console.error('[TeamModel] Error checking team ownership:', error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * Delete a team (CASCADE will remove all team_members and update tasks)
   * @param id - Team ID
   * @returns True if deleted, false if not found
   */
  static async delete(id: number): Promise<boolean> {
    console.log(`[TeamModel] Deleting team ${id}`);
    
    try {
      const result = await pool.query(
        'DELETE FROM teams WHERE id = $1 RETURNING id',
        [id]
      );
      
      if (result.rows.length === 0) {
        console.log(`[TeamModel] Team with id ${id} not found for deletion`);
        return false;
      }
      
      console.log(`[TeamModel] Team ${id} deleted successfully (CASCADE removed members)`);
      
      // Invalidate all team-related caches
      CacheInvalidation.team(id);
      
      return true;
    } catch (error) {
      console.error('[TeamModel] Error deleting team:', error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * OPTIMIZATION: Batch check team membership for multiple users
   * Reduces N+1 queries when checking multiple users at once
   * 
   * @param team_id - Team ID
   * @param user_ids - Array of user IDs to check
   * @returns Map of user_id to boolean (member or not)
   */
  static async batchCheckMembers(
    team_id: number,
    user_ids: number[]
  ): Promise<Map<number, boolean>> {
    console.log(`[TeamModel] Batch checking ${user_ids.length} users for team ${team_id}`);
    
    try {
      if (user_ids.length === 0) {
        return new Map();
      }
      
      // Single query with IN clause
      const result = await pool.query(
        `SELECT user_id 
         FROM team_members 
         WHERE team_id = $1 AND user_id = ANY($2)`,
        [team_id, user_ids]
      );
      
      // Build map of results
      const memberSet = new Set(result.rows.map(row => row.user_id));
      const resultMap = new Map<number, boolean>();
      
      for (const userId of user_ids) {
        resultMap.set(userId, memberSet.has(userId));
      }
      
      console.log(`[TeamModel] Batch check complete: ${result.rows.length}/${user_ids.length} are members`);
      return resultMap;
    } catch (error) {
      console.error('[TeamModel] Error batch checking members:', error);
      throw handleDatabaseError(error);
    }
  }
}
