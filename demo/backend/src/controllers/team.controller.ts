import { Request, Response } from 'express';
import { TeamModel } from '../models/team.model';
import { ApiResponse } from '../types';
import {
  AppError,
  ValidationError,
  NotFoundError,
  AuthorizationError,
  sendSuccess,
  sendError,
  sendValidationError,
  sendNotFound,
  sendForbidden,
  validateRequired,
  validateId,
  validatePagination,
  createPaginatedResponse,
  logPaginationQuery,
} from '../utils';

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
      const name = validateRequired(req.body.name, 'name');
      const userId = req.user!.userId;
      
      console.log(`[TeamController] User ${userId} creating team: "${name}"`);
      
      // Create team (automatically adds creator as owner member)
      const team = await TeamModel.create(name, userId);
      
      console.log(`[TeamController] Team created successfully with id: ${team.id}`);
      sendSuccess(res, team, 'Team created successfully', 201);
      
    } catch (error) {
      console.error('[TeamController] Error creating team:', error);
      
      if (error instanceof AppError) {
        return sendError(res, error.message, error.statusCode, error.details);
      }
      
      sendError(res, 'Failed to create team', 500);
    }
  }

  /**
   * Get all teams for the authenticated user with pagination
   * GET /api/teams
   * Query params: page, limit
   * Returns: Paginated array of teams the user is a member of
   */
  static async getTeams(req: Request, res: Response): Promise<void> {
    console.log('[TeamController] Fetching user teams...');
    
    try {
      const userId = req.user!.userId;
      
      // Validate and parse pagination parameters
      const { page, limit, offset } = validatePagination(
        req.query.page as string,
        req.query.limit as string
      );
      
      console.log(`[TeamController] Fetching teams for user ${userId}`);
      const result = await TeamModel.findByUserId(userId, limit, offset);
      
      logPaginationQuery('/api/teams', page, limit, offset, result.total);
      console.log(`[TeamController] Found ${result.teams.length} of ${result.total} teams for user ${userId}`);
      
      const response = createPaginatedResponse(
        result.teams,
        page,
        limit,
        result.total,
        'Teams retrieved successfully'
      );
      
      res.json(response);
      
    } catch (error) {
      console.error('[TeamController] Error fetching teams:', error);
      
      if (error instanceof AppError) {
        return sendError(res, error.message, error.statusCode, error.details);
      }
      
      sendError(res, 'Failed to fetch teams', 500);
    }
  }

  /**
   * Get a single team with members (requires membership)
   * GET /api/teams/:id
   * Returns: Team with members array
   * Optimized: Uses single query to fetch team and members (no N+1 problem)
   */
  static async getTeam(req: Request, res: Response): Promise<void> {
    console.log('[TeamController] Fetching team details...');
    
    try {
      const teamId = validateId(req.params.id, 'team ID');
      const userId = req.user!.userId;
      
      console.log(`[TeamController] User ${userId} requesting team ${teamId}`);
      
      // Check if user is a member of the team
      const isMember = await TeamModel.isMember(teamId, userId);
      if (!isMember) {
        console.log(`[TeamController] Access denied: User ${userId} is not a member of team ${teamId}`);
        throw new AuthorizationError('You do not have access to this team');
      }
      
      // Fetch team with members in a single optimized query (solves N+1 problem)
      const teamWithMembers = await TeamModel.findByIdWithMembers(teamId);
      
      if (!teamWithMembers) {
        console.log(`[TeamController] Team ${teamId} not found`);
        throw new NotFoundError('Team');
      }
      
      console.log(`[TeamController] Team ${teamId} fetched with ${teamWithMembers.members.length} members (optimized query)`);
      sendSuccess(res, teamWithMembers, 'Team retrieved successfully');
      
    } catch (error) {
      console.error('[TeamController] Error fetching team:', error);
      
      if (error instanceof AppError) {
        return sendError(res, error.message, error.statusCode, error.details);
      }
      
      sendError(res, 'Failed to fetch team', 500);
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
      const teamId = validateId(req.params.id, 'team ID');
      const memberUserId = validateId(req.body.user_id, 'user_id');
      const userId = req.user!.userId;
      
      console.log(`[TeamController] User ${userId} adding user ${memberUserId} to team ${teamId}`);
      
      // Check if requesting user is the team owner
      const isOwner = await TeamModel.isOwner(teamId, userId);
      if (!isOwner) {
        console.log(`[TeamController] Access denied: User ${userId} is not owner of team ${teamId}`);
        throw new AuthorizationError('Only team owner can add members');
      }
      
      // Check if user is already a member
      const alreadyMember = await TeamModel.isMember(teamId, memberUserId);
      if (alreadyMember) {
        console.log(`[TeamController] User ${memberUserId} is already a member of team ${teamId}`);
        throw new ValidationError('User is already a member of this team');
      }
      
      // Add member
      const member = await TeamModel.addMember(teamId, memberUserId);
      
      console.log(`[TeamController] User ${memberUserId} added to team ${teamId} successfully`);
      sendSuccess(res, member, 'Member added successfully', 201);
      
    } catch (error) {
      console.error('[TeamController] Error adding member:', error);
      
      if (error instanceof AppError) {
        return sendError(res, error.message, error.statusCode, error.details);
      }
      
      sendError(res, 'Failed to add member', 500);
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
      const teamId = validateId(req.params.id, 'team ID');
      const memberUserId = validateId(req.params.userId, 'user ID');
      const userId = req.user!.userId;
      
      console.log(`[TeamController] User ${userId} removing user ${memberUserId} from team ${teamId}`);
      
      // Check if requesting user is the team owner
      const isOwner = await TeamModel.isOwner(teamId, userId);
      if (!isOwner) {
        console.log(`[TeamController] Access denied: User ${userId} is not owner of team ${teamId}`);
        throw new AuthorizationError('Only team owner can remove members');
      }
      
      // Prevent owner from removing themselves
      if (memberUserId === userId) {
        console.log(`[TeamController] Validation failed: Owner cannot remove themselves`);
        throw new ValidationError('Team owner cannot remove themselves. Delete the team instead.');
      }
      
      // Remove member
      const removed = await TeamModel.removeMember(teamId, memberUserId);
      
      if (!removed) {
        console.log(`[TeamController] User ${memberUserId} not found in team ${teamId}`);
        throw new NotFoundError('Member');
      }
      
      console.log(`[TeamController] User ${memberUserId} removed from team ${teamId} successfully`);
      sendSuccess(res, null, 'Member removed successfully');
      
    } catch (error) {
      console.error('[TeamController] Error removing member:', error);
      
      if (error instanceof AppError) {
        return sendError(res, error.message, error.statusCode, error.details);
      }
      
      sendError(res, 'Failed to remove member', 500);
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
      const teamId = validateId(req.params.id, 'team ID');
      const userId = req.user!.userId;
      
      console.log(`[TeamController] User ${userId} attempting to delete team ${teamId}`);
      
      // Check if requesting user is the team owner
      const isOwner = await TeamModel.isOwner(teamId, userId);
      if (!isOwner) {
        console.log(`[TeamController] Access denied: User ${userId} is not owner of team ${teamId}`);
        throw new AuthorizationError('Only team owner can delete the team');
      }
      
      // Delete team (CASCADE will handle members and tasks)
      const deleted = await TeamModel.delete(teamId);
      
      if (!deleted) {
        console.log(`[TeamController] Team ${teamId} not found`);
        throw new NotFoundError('Team');
      }
      
      console.log(`[TeamController] Team ${teamId} deleted successfully`);
      sendSuccess(res, null, 'Team deleted successfully');
      
    } catch (error) {
      console.error('[TeamController] Error deleting team:', error);
      
      if (error instanceof AppError) {
        return sendError(res, error.message, error.statusCode, error.details);
      }
      
      sendError(res, 'Failed to delete team', 500);
    }
  }
}
