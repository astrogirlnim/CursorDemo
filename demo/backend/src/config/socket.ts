import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { socketAuthMiddleware, verifyTeamMembership, AuthenticatedSocket } from '../middleware/socketAuth';

/**
 * Socket.io server instance (exported for use in controllers)
 */
export let io: SocketIOServer;

/**
 * Task event types for real-time updates
 */
export enum TaskEvent {
  TASK_CREATED = 'task:created',
  TASK_UPDATED = 'task:updated',
  TASK_DELETED = 'task:deleted',
}

/**
 * Initialize Socket.io server with authentication and event handlers
 * Must be called after Express server is created
 * 
 * @param httpServer - HTTP server instance from Express
 * @returns Configured Socket.io server instance
 */
export function initializeSocketIO(httpServer: HTTPServer): SocketIOServer {
  console.log('[Socket.io] Initializing Socket.io server...');
  
  // Create Socket.io server with CORS configuration
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
    // Connection options
    pingTimeout: 60000, // 60 seconds
    pingInterval: 25000, // 25 seconds
  });
  
  console.log('[Socket.io] CORS configured for:', process.env.FRONTEND_URL || 'http://localhost:5173');
  
  // Apply authentication middleware to all connections
  io.use(socketAuthMiddleware);
  console.log('[Socket.io] Authentication middleware registered');
  
  // Handle client connections
  io.on('connection', handleConnection);
  
  console.log('[Socket.io] Server initialized successfully');
  console.log('[Socket.io] Listening for client connections...');
  
  return io;
}

/**
 * Handle new socket connection
 * Called after authentication middleware succeeds
 * 
 * @param socket - Authenticated socket connection
 */
async function handleConnection(socket: AuthenticatedSocket): Promise<void> {
  console.log('='.repeat(60));
  console.log(`[Socket.io] New client connected`);
  console.log(`[Socket.io] Socket ID: ${socket.id}`);
  console.log(`[Socket.io] User ID: ${socket.userId}`);
  console.log('='.repeat(60));
  
  // Handle client requesting to join a team room
  socket.on('team:join', async (teamId: number) => {
    console.log(`[Socket.io] User ${socket.userId} requesting to join team ${teamId} room`);
    
    // Verify user is a member of the team
    const isMember = await verifyTeamMembership(socket, teamId);
    
    if (!isMember) {
      console.log(`[Socket.io] Access denied: User ${socket.userId} is not a member of team ${teamId}`);
      socket.emit('team:join:error', {
        message: 'You are not a member of this team',
        teamId,
      });
      return;
    }
    
    // Join the team room
    const roomName = `team:${teamId}`;
    socket.join(roomName);
    
    console.log(`[Socket.io] User ${socket.userId} joined room: ${roomName}`);
    console.log(`[Socket.io] Current rooms for socket ${socket.id}:`, Array.from(socket.rooms));
    
    // Confirm join success
    socket.emit('team:join:success', {
      message: 'Successfully joined team room',
      teamId,
    });
  });
  
  // Handle client requesting to leave a team room
  socket.on('team:leave', (teamId: number) => {
    console.log(`[Socket.io] User ${socket.userId} leaving team ${teamId} room`);
    
    const roomName = `team:${teamId}`;
    socket.leave(roomName);
    
    console.log(`[Socket.io] User ${socket.userId} left room: ${roomName}`);
    console.log(`[Socket.io] Current rooms for socket ${socket.id}:`, Array.from(socket.rooms));
    
    // Confirm leave success
    socket.emit('team:leave:success', {
      message: 'Successfully left team room',
      teamId,
    });
  });
  
  // Handle disconnection
  socket.on('disconnect', (reason: string) => {
    console.log('='.repeat(60));
    console.log(`[Socket.io] Client disconnected`);
    console.log(`[Socket.io] Socket ID: ${socket.id}`);
    console.log(`[Socket.io] User ID: ${socket.userId}`);
    console.log(`[Socket.io] Reason: ${reason}`);
    console.log('='.repeat(60));
  });
  
  // Handle connection errors
  socket.on('error', (error: Error) => {
    console.error(`[Socket.io] Socket error for user ${socket.userId}:`, error);
  });
  
  // Send welcome message
  socket.emit('connected', {
    message: 'Connected to Task Manager real-time server',
    userId: socket.userId,
    socketId: socket.id,
  });
}

/**
 * Emit task created event to team room
 * Call this from task controller after creating a task
 * 
 * @param task - Created task object
 */
export function emitTaskCreated(task: any): void {
  if (!io) {
    console.error('[Socket.io] Cannot emit task:created - Socket.io not initialized');
    return;
  }
  
  // Only emit to team room if task has a team_id
  if (task.team_id) {
    const roomName = `team:${task.team_id}`;
    
    console.log(`[Socket.io] Emitting ${TaskEvent.TASK_CREATED} to room: ${roomName}`);
    console.log(`[Socket.io] Task ID: ${task.id}, Title: "${task.title}"`);
    
    io.to(roomName).emit(TaskEvent.TASK_CREATED, task);
    
    console.log(`[Socket.io] Event emitted successfully to ${io.sockets.adapter.rooms.get(roomName)?.size || 0} clients`);
  } else {
    console.log(`[Socket.io] Task ${task.id} has no team_id, not emitting to any room`);
  }
}

/**
 * Emit task updated event to team room
 * Call this from task controller after updating a task
 * 
 * @param task - Updated task object
 */
export function emitTaskUpdated(task: any): void {
  if (!io) {
    console.error('[Socket.io] Cannot emit task:updated - Socket.io not initialized');
    return;
  }
  
  // Only emit to team room if task has a team_id
  if (task.team_id) {
    const roomName = `team:${task.team_id}`;
    
    console.log(`[Socket.io] Emitting ${TaskEvent.TASK_UPDATED} to room: ${roomName}`);
    console.log(`[Socket.io] Task ID: ${task.id}, Title: "${task.title}"`);
    
    io.to(roomName).emit(TaskEvent.TASK_UPDATED, task);
    
    console.log(`[Socket.io] Event emitted successfully to ${io.sockets.adapter.rooms.get(roomName)?.size || 0} clients`);
  } else {
    console.log(`[Socket.io] Task ${task.id} has no team_id, not emitting to any room`);
  }
}

/**
 * Emit task deleted event to team room
 * Call this from task controller after deleting a task
 * 
 * @param taskId - Deleted task ID
 * @param teamId - Team ID the task belonged to
 */
export function emitTaskDeleted(taskId: number, teamId: number | null): void {
  if (!io) {
    console.error('[Socket.io] Cannot emit task:deleted - Socket.io not initialized');
    return;
  }
  
  // Only emit to team room if task had a team_id
  if (teamId) {
    const roomName = `team:${teamId}`;
    
    console.log(`[Socket.io] Emitting ${TaskEvent.TASK_DELETED} to room: ${roomName}`);
    console.log(`[Socket.io] Task ID: ${taskId}`);
    
    io.to(roomName).emit(TaskEvent.TASK_DELETED, { id: taskId, team_id: teamId });
    
    console.log(`[Socket.io] Event emitted successfully to ${io.sockets.adapter.rooms.get(roomName)?.size || 0} clients`);
  } else {
    console.log(`[Socket.io] Task ${taskId} had no team_id, not emitting to any room`);
  }
}

/**
 * Get connection statistics
 * Useful for monitoring and debugging
 */
export function getSocketStats(): {
  totalConnections: number;
  rooms: string[];
} {
  if (!io) {
    return { totalConnections: 0, rooms: [] };
  }
  
  const rooms = Array.from(io.sockets.adapter.rooms.keys())
    .filter(room => !io.sockets.sockets.has(room)); // Filter out socket IDs (they're also in rooms)
  
  return {
    totalConnections: io.sockets.sockets.size,
    rooms,
  };
}
