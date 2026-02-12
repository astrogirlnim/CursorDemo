import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useTeam } from './TeamContext';
import { Task } from '../types/task.types';

/**
 * Socket Context Type Definition
 * Provides Socket.io connection and event subscription methods
 */
interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  onTaskCreated: (callback: (task: Task) => void) => () => void;
  onTaskUpdated: (callback: (task: Task) => void) => () => void;
  onTaskDeleted: (callback: (data: { id: number; team_id: number }) => void) => () => void;
}

/**
 * Socket Context - manages Socket.io connection and events
 */
const SocketContext = createContext<SocketContextType | undefined>(undefined);

/**
 * API URL from environment variable
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Socket Provider Component
 * Manages Socket.io connection lifecycle and team room joining
 */
export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const { token, user } = useAuth();
  const { currentTeam } = useTeam();

  console.log('[SocketContext] State:', { 
    hasSocket: !!socket, 
    connected, 
    hasToken: !!token,
    hasUser: !!user,
    currentTeam: currentTeam?.name 
  });

  /**
   * Initialize Socket.io connection when user is authenticated
   */
  useEffect(() => {
    // Only connect if user is authenticated with a token
    if (!token || !user) {
      console.log('[SocketContext] No token or user, skipping socket connection');
      
      // Disconnect existing socket if user logs out
      if (socket) {
        console.log('[SocketContext] User logged out, disconnecting socket...');
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      
      return;
    }

    console.log('[SocketContext] User authenticated, initializing socket connection...');
    console.log('[SocketContext] Connecting to:', API_URL);

    // Create socket connection with JWT token in auth handshake
    const newSocket = io(API_URL, {
      auth: {
        token: `Bearer ${token}`, // Send JWT token for authentication
      },
      // Reconnection settings
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      // Connection settings
      transports: ['websocket', 'polling'], // Try WebSocket first, fallback to polling
    });

    console.log('[SocketContext] Socket instance created, waiting for connection...');

    // Handle successful connection
    newSocket.on('connect', () => {
      console.log('='.repeat(60));
      console.log('[SocketContext] Socket.io connected successfully!');
      console.log('[SocketContext] Socket ID:', newSocket.id);
      console.log('[SocketContext] User ID:', user.id);
      console.log('='.repeat(60));
      setConnected(true);
    });

    // Handle welcome message from server
    newSocket.on('connected', (data: any) => {
      console.log('[SocketContext] Received welcome message from server:', data);
    });

    // Handle connection error
    newSocket.on('connect_error', (error: Error) => {
      console.error('[SocketContext] Connection error:', error.message);
      console.error('[SocketContext] This usually means authentication failed or server is down');
      setConnected(false);
    });

    // Handle disconnection
    newSocket.on('disconnect', (reason: string) => {
      console.log('='.repeat(60));
      console.log('[SocketContext] Socket.io disconnected');
      console.log('[SocketContext] Reason:', reason);
      console.log('='.repeat(60));
      setConnected(false);
      
      // Log reconnection info
      if (reason === 'io server disconnect') {
        console.log('[SocketContext] Server disconnected the socket, manual reconnect needed');
      } else {
        console.log('[SocketContext] Will attempt to reconnect automatically...');
      }
    });

    // Handle reconnection attempt
    newSocket.on('reconnect_attempt', (attemptNumber: number) => {
      console.log(`[SocketContext] Reconnection attempt ${attemptNumber}...`);
    });

    // Handle successful reconnection
    newSocket.on('reconnect', (attemptNumber: number) => {
      console.log(`[SocketContext] Reconnected successfully after ${attemptNumber} attempts`);
      setConnected(true);
    });

    // Handle reconnection error
    newSocket.on('reconnect_error', (error: Error) => {
      console.error('[SocketContext] Reconnection error:', error.message);
    });

    // Handle reconnection failure
    newSocket.on('reconnect_failed', () => {
      console.error('[SocketContext] Reconnection failed after all attempts');
      console.error('[SocketContext] Please refresh the page to reconnect');
    });

    // Set socket instance
    setSocket(newSocket);

    // Cleanup on unmount or when dependencies change
    return () => {
      console.log('[SocketContext] Cleaning up socket connection...');
      newSocket.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [token, user]); // Reconnect if token or user changes

  /**
   * Join/leave team rooms when current team changes
   */
  useEffect(() => {
    if (!socket || !connected || !currentTeam) {
      console.log('[SocketContext] Not ready to join team room:', { 
        hasSocket: !!socket, 
        connected, 
        hasTeam: !!currentTeam 
      });
      return;
    }

    console.log(`[SocketContext] Current team changed, joining room for team: ${currentTeam.name} (ID: ${currentTeam.id})`);

    // Join the team room
    socket.emit('team:join', currentTeam.id);

    // Listen for join success
    socket.on('team:join:success', (data: any) => {
      console.log('[SocketContext] Successfully joined team room:', data);
    });

    // Listen for join error
    socket.on('team:join:error', (data: any) => {
      console.error('[SocketContext] Failed to join team room:', data);
    });

    // Leave the team room when component unmounts or team changes
    return () => {
      console.log(`[SocketContext] Leaving team room for: ${currentTeam.name} (ID: ${currentTeam.id})`);
      socket.emit('team:leave', currentTeam.id);
      
      // Remove listeners
      socket.off('team:join:success');
      socket.off('team:join:error');
    };
  }, [socket, connected, currentTeam]); // Re-run when socket, connection, or team changes

  /**
   * Subscribe to task:created events
   * Returns cleanup function to unsubscribe
   */
  const onTaskCreated = useCallback((callback: (task: Task) => void): (() => void) => {
    if (!socket) {
      console.log('[SocketContext] Cannot subscribe to task:created - no socket connection');
      return () => {};
    }

    console.log('[SocketContext] Subscribing to task:created events');

    const handler = (task: Task) => {
      console.log('[SocketContext] Received task:created event:', task);
      callback(task);
    };

    socket.on('task:created', handler);

    // Return cleanup function
    return () => {
      console.log('[SocketContext] Unsubscribing from task:created events');
      socket.off('task:created', handler);
    };
  }, [socket]);

  /**
   * Subscribe to task:updated events
   * Returns cleanup function to unsubscribe
   */
  const onTaskUpdated = useCallback((callback: (task: Task) => void): (() => void) => {
    if (!socket) {
      console.log('[SocketContext] Cannot subscribe to task:updated - no socket connection');
      return () => {};
    }

    console.log('[SocketContext] Subscribing to task:updated events');

    const handler = (task: Task) => {
      console.log('[SocketContext] Received task:updated event:', task);
      callback(task);
    };

    socket.on('task:updated', handler);

    // Return cleanup function
    return () => {
      console.log('[SocketContext] Unsubscribing from task:updated events');
      socket.off('task:updated', handler);
    };
  }, [socket]);

  /**
   * Subscribe to task:deleted events
   * Returns cleanup function to unsubscribe
   */
  const onTaskDeleted = useCallback((callback: (data: { id: number; team_id: number }) => void): (() => void) => {
    if (!socket) {
      console.log('[SocketContext] Cannot subscribe to task:deleted - no socket connection');
      return () => {};
    }

    console.log('[SocketContext] Subscribing to task:deleted events');

    const handler = (data: { id: number; team_id: number }) => {
      console.log('[SocketContext] Received task:deleted event:', data);
      callback(data);
    };

    socket.on('task:deleted', handler);

    // Return cleanup function
    return () => {
      console.log('[SocketContext] Unsubscribing from task:deleted events');
      socket.off('task:deleted', handler);
    };
  }, [socket]);

  /**
   * Context value provided to consumers
   */
  const value: SocketContextType = {
    socket,
    connected,
    onTaskCreated,
    onTaskUpdated,
    onTaskDeleted,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

/**
 * useSocket Hook
 * Custom hook to access socket context
 * @returns SocketContextType
 * @throws Error if used outside SocketProvider
 */
export function useSocket(): SocketContextType {
  const context = useContext(SocketContext);
  
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  
  return context;
}
