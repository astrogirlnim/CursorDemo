import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';

/**
 * Task Routes
 * Defines all endpoints for task CRUD operations
 * ALL ROUTES REQUIRE AUTHENTICATION
 */
const router = Router();

console.log('[TaskRoutes] Initializing task routes');

/**
 * GET /api/tasks
 * Get all tasks (supports ?status=todo&priority=high query params)
 * PROTECTED: Requires valid JWT token
 */
router.get('/', authenticate, TaskController.getAllTasks);

/**
 * GET /api/tasks/:id
 * Get a single task by ID
 * PROTECTED: Requires valid JWT token
 */
router.get('/:id', authenticate, TaskController.getTaskById);

/**
 * POST /api/tasks
 * Create a new task
 * Body: { title, description?, status?, priority?, assignee_id? }
 * PROTECTED: Requires valid JWT token
 */
router.post('/', authenticate, TaskController.createTask);

/**
 * PUT /api/tasks/:id
 * Update an existing task
 * Body: { title?, description?, status?, priority?, assignee_id? }
 * PROTECTED: Requires valid JWT token
 */
router.put('/:id', authenticate, TaskController.updateTask);

/**
 * DELETE /api/tasks/:id
 * Delete a task
 * PROTECTED: Requires valid JWT token
 */
router.delete('/:id', authenticate, TaskController.deleteTask);

console.log('[TaskRoutes] Task routes configured successfully (all routes protected)');

export default router;
