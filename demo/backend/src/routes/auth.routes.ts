import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

/**
 * Authentication Routes
 * Handles user registration, login, and current user retrieval
 */

console.log('[AuthRoutes] Initializing authentication routes...');

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user account
 * 
 * Body:
 * - email: string (required, valid email format)
 * - password: string (required, min 8 characters)
 * - name: string (required)
 * 
 * Returns:
 * - 201: { success: true, data: { token: string, user: UserResponse } }
 * - 400: Invalid input
 * - 409: Email already exists
 */
router.post('/register', AuthController.register);
console.log('[AuthRoutes] Registered: POST /api/auth/register');

/**
 * POST /api/auth/login
 * Login with email and password
 * 
 * Body:
 * - email: string (required)
 * - password: string (required)
 * 
 * Returns:
 * - 200: { success: true, data: { token: string, user: UserResponse } }
 * - 401: Invalid credentials
 * - 400: Missing required fields
 */
router.post('/login', AuthController.login);
console.log('[AuthRoutes] Registered: POST /api/auth/login');

/**
 * GET /api/auth/me
 * Get current authenticated user information
 * Requires valid JWT token in Authorization header
 * 
 * Headers:
 * - Authorization: Bearer <token>
 * 
 * Returns:
 * - 200: { success: true, data: { user: UserResponse } }
 * - 401: Not authenticated or invalid token
 * - 404: User not found
 */
router.get('/me', authenticate, AuthController.getMe);
console.log('[AuthRoutes] Registered: GET /api/auth/me (protected)');

console.log('[AuthRoutes] All authentication routes registered successfully');

export default router;
