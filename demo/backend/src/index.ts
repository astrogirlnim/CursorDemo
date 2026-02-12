import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ApiResponse } from './types';
import taskRoutes from './routes/task.routes';

// Load environment variables
dotenv.config();

console.log('[Server] Initializing Team Task Manager API...');

// Create Express application
const app = express();

// Configure CORS
console.log('[Server] Configuring CORS and JSON parser');
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Add JSON body parser
app.use(express.json());

// Health check route
app.get('/health', (req: Request, res: Response) => {
  console.log('[Server] Health check requested');
  res.json({ 
    success: true, 
    message: 'Server is running',
    data: null
  } as ApiResponse);
});

// API Routes
console.log('[Server] Registering task routes at /api/tasks');
app.use('/api/tasks', taskRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  console.log(`[Server] 404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    data: null
  } as ApiResponse);
});

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
