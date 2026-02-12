import { Request, Response } from 'express';
import { UserModel, CreateUserDTO } from '../models/user.model';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../types';

/**
 * Auth Controller - handles HTTP requests for authentication operations
 * Includes user registration, login, and current user retrieval
 */
export class AuthController {
  /**
   * POST /api/auth/register
   * Register a new user account
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      console.log('[AuthController] POST /api/auth/register - Registering new user');
      console.log('[AuthController] Request body:', { ...req.body, password: '[REDACTED]' });
      
      const { email, password, name } = req.body as CreateUserDTO;
      
      // Validate required fields
      if (!email || email.trim() === '') {
        console.log('[AuthController] Validation failed: email is required');
        res.status(400).json({
          success: false,
          message: 'Email is required',
          data: null
        } as ApiResponse);
        return;
      }
      
      if (!password || password.trim() === '') {
        console.log('[AuthController] Validation failed: password is required');
        res.status(400).json({
          success: false,
          message: 'Password is required',
          data: null
        } as ApiResponse);
        return;
      }
      
      if (!name || name.trim() === '') {
        console.log('[AuthController] Validation failed: name is required');
        res.status(400).json({
          success: false,
          message: 'Name is required',
          data: null
        } as ApiResponse);
        return;
      }
      
      // Validate email format using regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log('[AuthController] Validation failed: invalid email format');
        res.status(400).json({
          success: false,
          message: 'Invalid email format',
          data: null
        } as ApiResponse);
        return;
      }
      
      // Validate password length (minimum 8 characters)
      if (password.length < 8) {
        console.log('[AuthController] Validation failed: password too short');
        res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long',
          data: null
        } as ApiResponse);
        return;
      }
      
      // Check if email already exists
      console.log('[AuthController] Checking if email already exists...');
      const existingUser = await UserModel.findByEmail(email);
      
      if (existingUser) {
        console.log('[AuthController] Registration failed: email already exists');
        res.status(409).json({
          success: false,
          message: 'Email already exists',
          data: null
        } as ApiResponse);
        return;
      }
      
      // Create new user (password will be hashed in the model)
      console.log('[AuthController] Creating new user...');
      const newUser = await UserModel.createUser({ email, password, name });
      
      // Generate JWT token
      console.log('[AuthController] Generating JWT token...');
      const token = AuthService.generateToken(newUser.id);
      
      // Convert user to safe response (remove password_hash)
      const userResponse = UserModel.toResponse(newUser);
      
      console.log(`[AuthController] User registered successfully: ${newUser.email} (id: ${newUser.id})`);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          token,
          user: userResponse
        }
      } as ApiResponse);
    } catch (error) {
      console.error('[AuthController] Error during registration:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to register user',
        data: null
      } as ApiResponse);
    }
  }

  /**
   * POST /api/auth/login
   * Login with email and password
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      console.log('[AuthController] POST /api/auth/login - User login attempt');
      console.log('[AuthController] Request body:', { ...req.body, password: '[REDACTED]' });
      
      const { email, password } = req.body;
      
      // Validate required fields
      if (!email || email.trim() === '') {
        console.log('[AuthController] Validation failed: email is required');
        res.status(400).json({
          success: false,
          message: 'Email is required',
          data: null
        } as ApiResponse);
        return;
      }
      
      if (!password || password.trim() === '') {
        console.log('[AuthController] Validation failed: password is required');
        res.status(400).json({
          success: false,
          message: 'Password is required',
          data: null
        } as ApiResponse);
        return;
      }
      
      // Find user by email
      console.log('[AuthController] Looking up user by email...');
      const user = await UserModel.findByEmail(email);
      
      if (!user) {
        console.log('[AuthController] Login failed: user not found');
        // Use generic message to prevent email enumeration
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          data: null
        } as ApiResponse);
        return;
      }
      
      // Verify password
      console.log('[AuthController] Verifying password...');
      const isPasswordValid = await UserModel.verifyPassword(password, user.password_hash);
      
      if (!isPasswordValid) {
        console.log('[AuthController] Login failed: invalid password');
        // Use generic message to prevent user enumeration
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          data: null
        } as ApiResponse);
        return;
      }
      
      // Generate JWT token
      console.log('[AuthController] Password verified, generating JWT token...');
      const token = AuthService.generateToken(user.id);
      
      // Convert user to safe response (remove password_hash)
      const userResponse = UserModel.toResponse(user);
      
      console.log(`[AuthController] User logged in successfully: ${user.email} (id: ${user.id})`);
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: userResponse
        }
      } as ApiResponse);
    } catch (error) {
      console.error('[AuthController] Error during login:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to login',
        data: null
      } as ApiResponse);
    }
  }

  /**
   * GET /api/auth/me
   * Get current authenticated user
   * Requires authentication middleware to set req.user
   */
  static async getMe(req: Request, res: Response): Promise<void> {
    try {
      console.log('[AuthController] GET /api/auth/me - Getting current user');
      
      // Get user ID from req.user (set by authenticate middleware)
      const userId = req.user?.userId;
      
      if (!userId) {
        console.log('[AuthController] Error: userId not found in request (middleware not applied?)');
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          data: null
        } as ApiResponse);
        return;
      }
      
      console.log(`[AuthController] Looking up user with id: ${userId}`);
      
      // Find user by ID
      const user = await UserModel.findById(userId);
      
      if (!user) {
        console.log('[AuthController] User not found in database');
        res.status(404).json({
          success: false,
          message: 'User not found',
          data: null
        } as ApiResponse);
        return;
      }
      
      // Convert user to safe response (remove password_hash)
      const userResponse = UserModel.toResponse(user);
      
      console.log(`[AuthController] Current user retrieved: ${user.email} (id: ${user.id})`);
      
      res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: {
          user: userResponse
        }
      } as ApiResponse);
    } catch (error) {
      console.error('[AuthController] Error getting current user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user',
        data: null
      } as ApiResponse);
    }
  }
}
