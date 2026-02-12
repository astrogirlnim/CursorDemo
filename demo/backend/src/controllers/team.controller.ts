import { Request, Response } from 'express';
import { TeamModel } from '../models/team.model';
import { ApiResponse } from '../types';

/**
 * Team Controller - handles HTTP requests for team operations
 * All endpoints require authentication via JWT middleware
 */
export class TeamController {
  /**
   * Create a new team
   * POST /api/teams
   * Body: { name: string }
   * Returns: Created team
   */
  static async createTeam(req: Request, res: Response): Promise<void> {
    console.log('[TeamController] Creating team...');
    
    try {
      const { name } = req.body;
      const userId = req.user!.userId;
      
      // Validate input
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        console.log('[TeamController] Validation failed: Invalid team name');
        res.status(400).json({
          success: false,
          error: 'Team name is required and must be a non-empty string',
        } as ApiResponse);
        return;
      }
      
      console.log(`[TeamController] User ${userId} creating team: "${name}"`);
      
      // Create team (automatically adds creator as owner member)
      const team = await TeamModel.create(name.trim(), userId);
      
      console.log(`[TeamController] Team created successfully with id: ${team.id}`);
      res.status(201).json({
        success: true,
        message: 'Team created successfully',
        data: team,
      } as ApiResponse);
      
    } catch (error) {
      console.error('[TeamController] Error creating team:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create team',
      } as ApiResponse);
    }
  }

  /**
   * Get all teams for the authenticated user
   * GET /api/teams
   * Returns: Array of teams the user is a member of
   */
  static async getTeams(req: Request, res: Response): Promise<void> {
    console.log('[TeamController] Fetching user teams...');
    
    try {
      const userId = req.user!.userId;
      
      console.log(`[TeamController] Fetching teams for user ${userId}`);
      const teams = await TeamModel.findByUserId(userId);
      
      console.log(`[TeamController] Found ${teams.length} teams for user ${userId}`);
      res.json({
        success: true,
        data: teams,
      } as ApiResponse);
      
    } catch (error) {
      console.error('[TeamController] Error fetching teams:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch teams',
      } as ApiResponse);
    }
  }

  /**
   * Get a single team with members (requires membership)
   * GET /api/teams/:id
   * Returns: Team with members array
   */
  static async getTeam(req: Request, res: Response): Promise<void> {
    console.log('[TeamController] Fetching team details...');
    
    try {
      const teamId = parseInt(req.params.id);
      const userId = req.user!.userId;
      
      if (isNaN(teamId)) {
        console.log('[TeamController] Validation failed: Invalid team ID');
        res.status(400).json({
          success: false,
          error: 'Invalid team ID',
        } as ApiResponse);
        return;
      }
      
      console.log(`[TeamController] User ${userId} requesting team ${teamId}`);
      
      // Check if user is a member of the team
      const isMember = await TeamModel.isMember(teamId, userId);
      if (!isMember) {
        console.log(`[TeamController] Access denied: User ${userId} is not a member of team ${teamId}`);
        res.status(403).json({
          success: false,
          error: 'You do not have access to this team',
        } as ApiResponse);
        return;
      }
      
      // Fetch team details
      const team = await TeamModel.findById(teamId);
      if (!team) {
        console.log(`[TeamController] Team ${teamId} not found`);
        res.status(404).json({
          success: false,
          error: 'Team not found',
        } as ApiResponse);
        return;
      }
      
      // Fetch team members
      const members = await TeamModel.getMembers(teamId);
      
      console.log(`[TeamController] Team ${teamId} fetched with ${members.length} members`);
      res.json({
        success: true,
        data: {
          ...team,
          members,
        },
      } as ApiResponse);
      
    } catch (error) {
      console.error('[TeamController] Error fetching team:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch team',
      } as ApiResponse);
    }
  }

  /**
   * Add a member to a team (requires owner permission)
   * POST /api/teams/:id/members
   * Body: { user_id: number }
   * Returns: Created team member record
   */
  static async addMember(req: Request, res: Response): Promise<void> {
    console.log('[TeamController] Adding team member...');
    
    try {
      const teamId = parseInt(req.params.id);
      const { user_id } = req.body;
      const userId = req.user!.userId;
      
      // Validate inputs
      if (isNaN(teamId)) {
        console.log('[TeamController] Validation failed: Invalid team ID');
        res.status(400).json({
          success: false,
          error: 'Invalid team ID',
        } as ApiResponse);
        return;
      }
      
      if (!user_id || isNaN(parseInt(user_id))) {
        console.log('[TeamController] Validation failed: Invalid user ID');
        res.status(400).json({
          success: false,
          error: 'Valid user_id is required',
        } as ApiResponse);
        return;
      }
      
      console.log(`[TeamController] User ${userId} adding user ${user_id} to team ${teamId}`);
      
      // Check if requesting user is the team owner
      const isOwner = await TeamModel.isOwner(teamId, userId);
      if (!isOwner) {
        console.log(`[TeamController] Access denied: User ${userId} is not owner of team ${teamId}`);
        res.status(403).json({
          success: false,
          error: 'Only team owner can add members',
        } as ApiResponse);
        return;
      }
      
      // Check if user is already a member
      const alreadyMember = await TeamModel.isMember(teamId, user_id);
      if (alreadyMember) {
        console.log(`[TeamController] User ${user_id} is already a member of team ${teamId}`);
        res.status(400).json({
          success: false,
          error: 'User is already a member of this team',
        } as ApiResponse);
        return;
      }
      
      // Add member
      const member = await TeamModel.addMember(teamId, user_id);
      
      console.log(`[TeamController] User ${user_id} added to team ${teamId} successfully`);
      res.status(201).json({
        success: true,
        message: 'Member added successfully',
        data: member,
      } as ApiResponse);
      
    } catch (error) {
      console.error('[TeamController] Error adding member:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add member',
      } as ApiResponse);
    }
  }

  /**
   * Remove a member from a team (requires owner permission)
   * DELETE /api/teams/:id/members/:userId
   * Returns: Success message
   */
  static async removeMember(req: Request, res: Response): Promise<void> {
    console.log('[TeamController] Removing team member...');
    
    try {
      const teamId = parseInt(req.params.id);
      const memberUserId = parseInt(req.params.userId);
      const userId = req.user!.userId;
      
      // Validate inputs
      if (isNaN(teamId) || isNaN(memberUserId)) {
        console.log('[TeamController] Validation failed: Invalid IDs');
        res.status(400).json({
          success: false,
          error: 'Invalid team ID or user ID',
        } as ApiResponse);
        return;
      }
      
      console.log(`[TeamController] User ${userId} removing user ${memberUserId} from team ${teamId}`);
      
      // Check if requesting user is the team owner
      const isOwner = await TeamModel.isOwner(teamId, userId);
      if (!isOwner) {
        console.log(`[TeamController] Access denied: User ${userId} is not owner of team ${teamId}`);
        res.status(403).json({
          success: false,
          error: 'Only team owner can remove members',
        } as ApiResponse);
        return;
      }
      
      // Prevent owner from removing themselves
      if (memberUserId === userId) {
        console.log(`[TeamController] Validation failed: Owner cannot remove themselves`);
        res.status(400).json({
          success: false,
          error: 'Team owner cannot remove themselves. Delete the team instead.',
        } as ApiResponse);
        return;
      }
      
      // Remove member
      const removed = await TeamModel.removeMember(teamId, memberUserId);
      
      if (!removed) {
        console.log(`[TeamController] User ${memberUserId} not found in team ${teamId}`);
        res.status(404).json({
          success: false,
          error: 'Member not found in team',
        } as ApiResponse);
        return;
      }
      
      console.log(`[TeamController] User ${memberUserId} removed from team ${teamId} successfully`);
      res.json({
        success: true,
        message: 'Member removed successfully',
      } as ApiResponse);
      
    } catch (error) {
      console.error('[TeamController] Error removing member:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to remove member',
      } as ApiResponse);
    }
  }

  /**
   * Delete a team (requires owner permission)
   * DELETE /api/teams/:id
   * Returns: Success message
   */
  static async deleteTeam(req: Request, res: Response): Promise<void> {
    console.log('[TeamController] Deleting team...');
    
    try {
      const teamId = parseInt(req.params.id);
      const userId = req.user!.userId;
      
      if (isNaN(teamId)) {
        console.log('[TeamController] Validation failed: Invalid team ID');
        res.status(400).json({
          success: false,
          error: 'Invalid team ID',
        } as ApiResponse);
        return;
      }
      
      console.log(`[TeamController] User ${userId} attempting to delete team ${teamId}`);
      
      // Check if requesting user is the team owner
      const isOwner = await TeamModel.isOwner(teamId, userId);
      if (!isOwner) {
        console.log(`[TeamController] Access denied: User ${userId} is not owner of team ${teamId}`);
        res.status(403).json({
          success: false,
          error: 'Only team owner can delete the team',
        } as ApiResponse);
        return;
      }
      
      // Delete team (CASCADE will handle members and tasks)
      const deleted = await TeamModel.delete(teamId);
      
      if (!deleted) {
        console.log(`[TeamController] Team ${teamId} not found`);
        res.status(404).json({
          success: false,
          error: 'Team not found',
        } as ApiResponse);
        return;
      }
      
      console.log(`[TeamController] Team ${teamId} deleted successfully`);
      res.json({
        success: true,
        message: 'Team deleted successfully',
      } as ApiResponse);
      
    } catch (error) {
      console.error('[TeamController] Error deleting team:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete team',
      } as ApiResponse);
    }
  }
}
