import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';

/**
 * Task Routes
 * Defines all endpoints for task CRUD operations
 */
const router = Router();

console.log('[TaskRoutes] Initializing task routes');

/**
 * GET /api/tasks
 * Get all tasks (supports ?status=todo&priority=high query params)
 */
router.get('/', TaskController.getAllTasks);

/**
 * GET /api/tasks/:id
 * Get a single task by ID
 */
router.get('/:id', TaskController.getTaskById);

/**
 * POST /api/tasks
 * Create a new task
 * Body: { title, description?, status?, priority?, assignee_id? }
 */
router.post('/', TaskController.createTask);

/**
 * PUT /api/tasks/:id
 * Update an existing task
 * Body: { title?, description?, status?, priority?, assignee_id? }
 */
router.put('/:id', TaskController.updateTask);

/**
 * DELETE /api/tasks/:id
 * Delete a task
 */
router.delete('/:id', TaskController.deleteTask);

console.log('[TaskRoutes] Task routes configured successfully');

export default router;
