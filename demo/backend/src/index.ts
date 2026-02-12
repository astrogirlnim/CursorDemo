import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ApiResponse } from './types';
import taskRoutes from './routes/task.routes';
import authRoutes from './routes/auth.routes';
import teamRoutes from './routes/team.routes';
import { requestTimeout, performanceMonitor } from './middleware/timeout';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { testConnection, getPoolStats } from './config/database';

// Load environment variables
dotenv.config();

console.log('[Server] Initializing Team Task Manager API...');

// Test database connection
testConnection().then(success => {
  if (!success) {
    console.error('[Server] Failed to connect to database. Exiting...');
    process.exit(1);
  }
});

// Create Express application
const app = express();

// Configure CORS
console.log('[Server] Configuring CORS and JSON parser');
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Add JSON body parser with size limit
app.use(express.json({ limit: '10mb' }));

// Add performance monitoring middleware (logs request duration)
console.log('[Server] Adding performance monitoring middleware');
app.use(performanceMonitor);

// Add request timeout middleware (30s timeout)
console.log('[Server] Adding request timeout middleware (30s)');
app.use(requestTimeout(30000));

// Health check route with database stats
app.get('/health', (req: Request, res: Response) => {
  console.log('[Server] Health check requested');
  const poolStats = getPoolStats();
  res.json({ 
    success: true, 
    message: 'Server is running',
    data: {
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: poolStats,
    }
  } as ApiResponse);
});

// API Routes
console.log('[Server] Registering authentication routes at /api/auth');
app.use('/api/auth', authRoutes);

console.log('[Server] Registering task routes at /api/tasks');
app.use('/api/tasks', taskRoutes);

console.log('[Server] Registering team routes at /api/teams');
app.use('/api/teams', teamRoutes);

// 404 handler (must come after all routes)
console.log('[Server] Registering 404 and error handlers');
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Get port from environment
const PORT = process.env.PORT || 3000;

// Start server
try {
  app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`[Server] Team Task Manager API started successfully`);
    console.log(`[Server] Port: ${PORT}`);
    console.log(`[Server] Health: http://localhost:${PORT}/health`);
    console.log(`[Server] Tasks API: http://localhost:${PORT}/api/tasks`);
    console.log('='.repeat(50));
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}
