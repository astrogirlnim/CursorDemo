import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

/**
 * JWT Payload interface
 * Contains the user ID that will be encoded in the token
 */
interface JWTPayload {
  userId: number;
  iat?: number; // Issued at timestamp (added by jwt.sign)
  exp?: number; // Expiration timestamp (added by jwt.sign)
}

/**
 * Auth Service - handles JWT token generation/verification and password operations
 * Uses HS256 algorithm for JWT signing
 */
export class AuthService {
  /**
   * Generate a JWT token for a user
   * Token expires in 7 days
   * @param userId - User ID to encode in the token
   * @returns Signed JWT token string
   * @throws Error if JWT_SECRET is not configured
   */
  static generateToken(userId: number): string {
    console.log(`[AuthService] Generating JWT token for user ${userId}`);
    
    // Ensure JWT_SECRET is configured
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('[AuthService] JWT_SECRET is not configured in environment variables');
      throw new Error('JWT_SECRET is not configured');
    }
    
    // Create payload with user ID
    const payload: JWTPayload = {
      userId,
    };
    
    // Sign token with HS256 algorithm, expires in 7 days
    const token = jwt.sign(
      payload,
      secret,
      {
        algorithm: 'HS256',
        expiresIn: '7d', // Token valid for 7 days
      }
    );
    
    console.log(`[AuthService] Token generated successfully for user ${userId} (expires in 7 days)`);
    return token;
  }

  /**
   * Verify a JWT token and extract the user ID
   * @param token - JWT token string to verify
   * @returns Decoded payload with userId, or null if invalid
   */
  static verifyToken(token: string): { userId: number } | null {
    console.log('[AuthService] Verifying JWT token...');
    
    try {
      // Ensure JWT_SECRET is configured
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        console.error('[AuthService] JWT_SECRET is not configured in environment variables');
        return null;
      }
      
      // Verify and decode token
      const decoded = jwt.verify(token, secret, {
        algorithms: ['HS256'], // Only accept HS256 algorithm
      }) as JWTPayload;
      
      console.log(`[AuthService] Token verified successfully for user ${decoded.userId}`);
      
      return {
        userId: decoded.userId,
      };
    } catch (error) {
      // Handle specific JWT errors
      if (error instanceof jwt.TokenExpiredError) {
        console.log('[AuthService] Token verification failed: Token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        console.log('[AuthService] Token verification failed: Invalid token');
      } else if (error instanceof jwt.NotBeforeError) {
        console.log('[AuthService] Token verification failed: Token not yet active');
      } else {
        console.error('[AuthService] Token verification failed with unexpected error:', error);
      }
      
      return null;
    }
  }

  /**
   * Hash a plain text password using bcrypt
   * Uses 10 salt rounds for strong security
   * @param password - Plain text password to hash
   * @returns Hashed password string
   */
  static async hashPassword(password: string): Promise<string> {
    console.log('[AuthService] Hashing password with bcrypt (10 salt rounds)...');
    
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    
    console.log('[AuthService] Password hashed successfully');
    return hash;
  }

  /**
   * Compare a plain text password with a bcrypt hash
   * Used during login to verify user credentials
   * @param password - Plain text password from login form
   * @param hash - Bcrypt hash from database
   * @returns True if password matches hash, false otherwise
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    console.log('[AuthService] Comparing password with hash...');
    
    const isMatch = await bcrypt.compare(password, hash);
    
    console.log(`[AuthService] Password comparison result: ${isMatch ? 'MATCH' : 'NO MATCH'}`);
    return isMatch;
  }

  /**
   * Extract token from Authorization header
   * Expected format: "Bearer <token>"
   * @param authHeader - Authorization header value
   * @returns Token string or null if invalid format
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    console.log('[AuthService] Extracting token from Authorization header...');
    
    if (!authHeader) {
      console.log('[AuthService] No Authorization header provided');
      return null;
    }
    
    // Check if header starts with "Bearer "
    if (!authHeader.startsWith('Bearer ')) {
      console.log('[AuthService] Authorization header does not start with "Bearer "');
      return null;
    }
    
    // Extract token (remove "Bearer " prefix)
    const token = authHeader.substring(7);
    
    if (!token) {
      console.log('[AuthService] Token is empty after "Bearer " prefix');
      return null;
    }
    
    console.log('[AuthService] Token extracted successfully from header');
    return token;
  }
}
