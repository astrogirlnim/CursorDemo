import { Team, TeamWithMembers, CreateTeamDTO, AddMemberDTO, TeamApiResponse } from '../types/team.types';
import { AuthService } from './auth.service';

/**
 * API base URL from environment variable
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Team Service - handles team-related API calls
 * Provides methods for team CRUD and member management
 */
export class TeamService {
  /**
   * Get authorization headers with JWT token
   * @returns Headers object with Authorization bearer token
   */
  private static getAuthHeaders(): HeadersInit {
    const token = AuthService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Create a new team
   * @param name - Team name
   * @returns Created team
   */
  static async createTeam(name: string): Promise<Team> {
    console.log('[TeamService] Creating team:', name);
    
    const response = await fetch(`${API_URL}/api/teams`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ name }),
    });

    const result: TeamApiResponse<Team> = await response.json();

    if (!response.ok) {
      console.error('[TeamService] Create team failed:', result.error);
      throw new Error(result.error || 'Failed to create team');
    }

    console.log('[TeamService] Team created successfully:', result.data?.id);
    return result.data!;
  }

  /**
   * Get all teams for the authenticated user
   * @returns Array of teams the user is a member of
   */
  static async getTeams(): Promise<Team[]> {
    console.log('[TeamService] Fetching user teams...');
    
    const response = await fetch(`${API_URL}/api/teams`, {
      headers: this.getAuthHeaders(),
    });

    const result: TeamApiResponse<Team[]> = await response.json();

    if (!response.ok) {
      console.error('[TeamService] Get teams failed:', result.error);
      throw new Error(result.error || 'Failed to fetch teams');
    }

    console.log(`[TeamService] Fetched ${result.data?.length || 0} teams`);
    return result.data || [];
  }

  /**
   * Get a single team with members
   * @param id - Team ID
   * @returns Team with members array
   */
  static async getTeam(id: number): Promise<TeamWithMembers> {
    console.log('[TeamService] Fetching team:', id);
    
    const response = await fetch(`${API_URL}/api/teams/${id}`, {
      headers: this.getAuthHeaders(),
    });

    const result: TeamApiResponse<TeamWithMembers> = await response.json();

    if (!response.ok) {
      console.error('[TeamService] Get team failed:', result.error);
      throw new Error(result.error || 'Failed to fetch team');
    }

    console.log('[TeamService] Team fetched successfully:', result.data?.name);
    return result.data!;
  }

  /**
   * Add a member to a team
   * @param teamId - Team ID
   * @param userId - User ID to add
   */
  static async addMember(teamId: number, userId: number): Promise<void> {
    console.log(`[TeamService] Adding user ${userId} to team ${teamId}`);
    
    const response = await fetch(`${API_URL}/api/teams/${teamId}/members`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ user_id: userId }),
    });

    const result: TeamApiResponse = await response.json();

    if (!response.ok) {
      console.error('[TeamService] Add member failed:', result.error);
      throw new Error(result.error || 'Failed to add member');
    }

    console.log('[TeamService] Member added successfully');
  }

  /**
   * Remove a member from a team
   * @param teamId - Team ID
   * @param userId - User ID to remove
   */
  static async removeMember(teamId: number, userId: number): Promise<void> {
    console.log(`[TeamService] Removing user ${userId} from team ${teamId}`);
    
    const response = await fetch(`${API_URL}/api/teams/${teamId}/members/${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    const result: TeamApiResponse = await response.json();

    if (!response.ok) {
      console.error('[TeamService] Remove member failed:', result.error);
      throw new Error(result.error || 'Failed to remove member');
    }

    console.log('[TeamService] Member removed successfully');
  }

  /**
   * Delete a team
   * @param id - Team ID
   */
  static async deleteTeam(id: number): Promise<void> {
    console.log('[TeamService] Deleting team:', id);
    
    const response = await fetch(`${API_URL}/api/teams/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    const result: TeamApiResponse = await response.json();

    if (!response.ok) {
      console.error('[TeamService] Delete team failed:', result.error);
      throw new Error(result.error || 'Failed to delete team');
    }

    console.log('[TeamService] Team deleted successfully');
  }
}
