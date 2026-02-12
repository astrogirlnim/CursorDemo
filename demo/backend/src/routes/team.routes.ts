import { Router } from 'express';
import { TeamController } from '../controllers/team.controller';
import { authenticate } from '../middleware/auth';

/**
 * Team Routes
 * Handles team creation, member management, and team operations
 * All routes require authentication
 */

console.log('[TeamRoutes] Initializing team routes...');

const router = Router();

// All team routes require authentication
router.use(authenticate);

/**
 * POST /api/teams
 * Create a new team
 * 
 * Body:
 * - name: string (required)
 * 
 * Returns:
 * - 201: { success: true, data: Team }
 * - 400: Invalid input
 * - 401: Not authenticated
 */
router.post('/', TeamController.createTeam);
console.log('[TeamRoutes] Registered: POST /api/teams (protected)');

/**
 * GET /api/teams
 * Get all teams for authenticated user
 * 
 * Returns:
 * - 200: { success: true, data: Team[] }
 * - 401: Not authenticated
 */
router.get('/', TeamController.getTeams);
console.log('[TeamRoutes] Registered: GET /api/teams (protected)');

/**
 * GET /api/teams/:id
 * Get a single team with members (requires membership)
 * 
 * Returns:
 * - 200: { success: true, data: TeamWithMembers }
 * - 403: Not a team member
 * - 404: Team not found
 * - 401: Not authenticated
 */
router.get('/:id', TeamController.getTeam);
console.log('[TeamRoutes] Registered: GET /api/teams/:id (protected)');

/**
 * POST /api/teams/:id/members
 * Add a member to a team (requires owner permission)
 * 
 * Body:
 * - user_id: number (required)
 * 
 * Returns:
 * - 201: { success: true, data: TeamMember }
 * - 400: Invalid input or user already member
 * - 403: Not team owner
 * - 401: Not authenticated
 */
router.post('/:id/members', TeamController.addMember);
console.log('[TeamRoutes] Registered: POST /api/teams/:id/members (protected)');

/**
 * DELETE /api/teams/:id/members/:userId
 * Remove a member from a team (requires owner permission)
 * 
 * Returns:
 * - 200: { success: true, message: string }
 * - 400: Cannot remove owner
 * - 403: Not team owner
 * - 404: Member not found
 * - 401: Not authenticated
 */
router.delete('/:id/members/:userId', TeamController.removeMember);
console.log('[TeamRoutes] Registered: DELETE /api/teams/:id/members/:userId (protected)');

/**
 * DELETE /api/teams/:id
 * Delete a team (requires owner permission)
 * 
 * Returns:
 * - 200: { success: true, message: string }
 * - 403: Not team owner
 * - 404: Team not found
 * - 401: Not authenticated
 */
router.delete('/:id', TeamController.deleteTeam);
console.log('[TeamRoutes] Registered: DELETE /api/teams/:id (protected)');

console.log('[TeamRoutes] All team routes registered successfully');

export default router;
