import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../types';

/**
 * Authentication Middleware
 * Verifies JWT token from Authorization header and attaches user info to request
 * 
 * Usage: Add this middleware to routes that require authentication
 * Example: router.get('/api/tasks', authenticate, taskController.getTasks);
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    console.log('[AuthMiddleware] Authenticating request...');
    console.log(`[AuthMiddleware] Path: ${req.method} ${req.path}`);
    
    // Extract token from Authorization header
    // Expected format: "Bearer <token>"
    const authHeader = req.headers.authorization;
    
    console.log('[AuthMiddleware] Authorization header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader) {
      console.log('[AuthMiddleware] Authentication failed: No Authorization header');
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid token.',
        data: null
      } as ApiResponse);
      return;
    }
    
    // Extract token from "Bearer <token>" format
    const token = AuthService.extractTokenFromHeader(authHeader);
    
    if (!token) {
      console.log('[AuthMiddleware] Authentication failed: Invalid Authorization header format');
      res.status(401).json({
        success: false,
        message: 'Invalid authorization header format. Use: Bearer <token>',
        data: null
      } as ApiResponse);
      return;
    }
    
    console.log('[AuthMiddleware] Token extracted, verifying...');
    
    // Verify token and extract user ID
    const payload = AuthService.verifyToken(token);
    
    if (!payload) {
      console.log('[AuthMiddleware] Authentication failed: Invalid or expired token');
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please login again.',
        data: null
      } as ApiResponse);
      return;
    }
    
    // Attach user info to request object
    req.user = {
      userId: payload.userId
    };
    
    console.log(`[AuthMiddleware] Authentication successful for user ${payload.userId}`);
    console.log('[AuthMiddleware] Proceeding to next middleware/handler...');
    
    // Call next middleware/handler
    next();
  } catch (error) {
    console.error('[AuthMiddleware] Unexpected error during authentication:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
      data: null
    } as ApiResponse);
  }
}

/**
 * Optional Authentication Middleware
 * Attempts to authenticate but doesn't fail if token is missing/invalid
 * Useful for endpoints that work differently for authenticated vs anonymous users
 * 
 * If token is valid, attaches user info to req.user
 * If token is missing/invalid, req.user remains undefined
 */
export async function optionalAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    console.log('[OptionalAuthMiddleware] Attempting optional authentication...');
    
    const authHeader = req.headers.authorization;
    
    // If no auth header, just continue without authentication
    if (!authHeader) {
      console.log('[OptionalAuthMiddleware] No authorization header, continuing as anonymous');
      next();
      return;
    }
    
    // Try to extract and verify token
    const token = AuthService.extractTokenFromHeader(authHeader);
    
    if (token) {
      const payload = AuthService.verifyToken(token);
      
      if (payload) {
        req.user = {
          userId: payload.userId
        };
        console.log(`[OptionalAuthMiddleware] User authenticated: ${payload.userId}`);
      } else {
        console.log('[OptionalAuthMiddleware] Invalid token, continuing as anonymous');
      }
    }
    
    next();
  } catch (error) {
    console.error('[OptionalAuthMiddleware] Error during optional authentication:', error);
    // Continue without authentication on error
    next();
  }
}
