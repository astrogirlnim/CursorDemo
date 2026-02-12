/**
 * Team interface matching backend schema
 */
export interface Team {
  id: number;
  name: string;
  owner_id: number;
  created_at: string;
  updated_at: string;
}

/**
 * TeamMember interface matching backend team_members junction table
 */
export interface TeamMember {
  id: number;
  team_id: number;
  user_id: number;
  role: 'owner' | 'member';
  joined_at: string;
}

/**
 * Team with member details for detailed views
 */
export interface TeamWithMembers extends Team {
  members: TeamMember[];
}

/**
 * DTO for creating a new team
 */
export interface CreateTeamDTO {
  name: string;
}

/**
 * DTO for adding a member to a team
 */
export interface AddMemberDTO {
  user_id: number;
}

/**
 * API Response wrapper for team operations
 */
export interface TeamApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
