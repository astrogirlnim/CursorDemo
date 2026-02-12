import { Socket } from 'socket.io';
import { AuthService } from '../services/auth.service';
import { TeamModel } from '../models/team.model';

/**
 * Extended Socket interface with authenticated user data
 * Allows us to access user info in socket handlers
 */
export interface AuthenticatedSocket extends Socket {
  userId?: number;
}

/**
 * Socket.io Authentication Middleware
 * Verifies JWT token from handshake auth and attaches user ID to socket
 * 
 * Usage: io.use(socketAuthMiddleware);
 * 
 * Client must send token in handshake:
 * socket = io(url, { auth: { token: 'Bearer <jwt>' } })
 */
export async function socketAuthMiddleware(
  socket: AuthenticatedSocket,
  next: (err?: Error) => void
): Promise<void> {
  console.log('[SocketAuth] Authenticating socket connection...');
  console.log('[SocketAuth] Socket ID:', socket.id);
  
  try {
    // Extract token from handshake auth
    const token = socket.handshake.auth?.token;
    
    console.log('[SocketAuth] Token in handshake:', token ? 'Present' : 'Missing');
    
    if (!token) {
      console.log('[SocketAuth] Authentication failed: No token provided');
      return next(new Error('Authentication token required'));
    }
    
    // Extract token from "Bearer <token>" format if needed
    let jwtToken = token;
    if (token.startsWith('Bearer ')) {
      jwtToken = token.substring(7);
      console.log('[SocketAuth] Extracted JWT from Bearer format');
    }
    
    // Verify JWT token
    const payload = AuthService.verifyToken(jwtToken);
    
    if (!payload) {
      console.log('[SocketAuth] Authentication failed: Invalid or expired token');
      return next(new Error('Invalid or expired token'));
    }
    
    // Attach user ID to socket for use in handlers
    socket.userId = payload.userId;
    
    console.log(`[SocketAuth] Socket authenticated successfully for user ${payload.userId}`);
    console.log(`[SocketAuth] Socket ${socket.id} connected for user ${payload.userId}`);
    
    // Continue to connection
    next();
  } catch (error) {
    console.error('[SocketAuth] Unexpected error during authentication:', error);
    next(new Error('Authentication failed'));
  }
}

/**
 * Verify user is a member of a team (for joining team rooms)
 * Call this before allowing socket to join a team room
 * 
 * @param socket - Authenticated socket
 * @param teamId - Team ID to check membership
 * @returns True if user is a member, false otherwise
 */
export async function verifyTeamMembership(
  socket: AuthenticatedSocket,
  teamId: number
): Promise<boolean> {
  console.log(`[SocketAuth] Verifying team membership for user ${socket.userId} in team ${teamId}`);
  
  if (!socket.userId) {
    console.log('[SocketAuth] Cannot verify team membership: Socket not authenticated');
    return false;
  }
  
  try {
    const isMember = await TeamModel.isMember(teamId, socket.userId);
    
    console.log(`[SocketAuth] User ${socket.userId} is${isMember ? '' : ' NOT'} a member of team ${teamId}`);
    
    return isMember;
  } catch (error) {
    console.error('[SocketAuth] Error verifying team membership:', error);
    return false;
  }
}
