import { Request, Response } from 'express';
import { TaskModel, CreateTaskDTO, UpdateTaskDTO } from '../models/task.model';
import { TeamModel } from '../models/team.model';
import { ApiResponse } from '../types';
import {
  AppError,
  ValidationError,
  NotFoundError,
  AuthorizationError,
  sendSuccess,
  sendError,
  sendValidationError,
  sendNotFound,
  sendForbidden,
  validateRequired,
  validateId,
  validateTaskStatus,
  validateTaskPriority,
  validatePagination,
  createPaginatedResponse,
  logPaginationQuery,
} from '../utils';
import { emitTaskCreated, emitTaskUpdated, emitTaskDeleted } from '../config/socket';

/**
 * Task Controller - handles HTTP requests for task operations
 */
export class TaskController {
  /**
   * GET /api/tasks
   * Get all tasks with pagination (optionally filtered by team_id, status, or priority)
   * Requires authentication and team membership if team_id is provided
   * Query params: page, limit, status, priority, team_id
   */
  static async getAllTasks(req: Request, res: Response): Promise<void> {
    try {
      console.log('[TaskController] GET /api/tasks - Fetching all tasks');
      
      // Validate and parse pagination parameters
      const { page, limit, offset } = validatePagination(
        req.query.page as string,
        req.query.limit as string
      );
      
      // Check for query parameters for filtering
      const { status, priority, team_id } = req.query;
      const userId = req.user?.userId;
      
      let result;
      let endpoint = '/api/tasks';
      
      // Filter by team_id if provided
      if (team_id) {
        // Handle special "unassigned" value for tasks with no team
        if (team_id === 'unassigned') {
          console.log(`[TaskController] Filtering unassigned tasks for user ${userId}`);
          endpoint += '?team_id=unassigned';
          result = await TaskModel.findUnassigned(userId, limit, offset);
        } else {
          const teamIdNum = validateId(team_id, 'team_id');
          
          // Verify user is a member of the team
          if (userId) {
            const isMember = await TeamModel.isMember(teamIdNum, userId);
            if (!isMember) {
              console.log(`[TaskController] Access denied: User ${userId} is not a member of team ${teamIdNum}`);
              throw new AuthorizationError('You do not have access to this team\'s tasks');
            }
          }
          
          console.log(`[TaskController] Filtering tasks by team_id: ${teamIdNum}`);
          endpoint += `?team_id=${teamIdNum}`;
          result = await TaskModel.findByTeamId(teamIdNum, limit, offset);
        }
      } else if (status && typeof status === 'string') {
        // Filter by status
        const validatedStatus = validateTaskStatus(status);
        endpoint += `?status=${status}`;
        result = await TaskModel.findByStatus(validatedStatus, limit, offset);
      } else if (priority && typeof priority === 'string') {
        // Filter by priority
        const validatedPriority = validateTaskPriority(priority);
        endpoint += `?priority=${priority}`;
        result = await TaskModel.findByPriority(validatedPriority, limit, offset);
      } else {
        // Get all tasks
        result = await TaskModel.findAll(limit, offset);
      }
      
      logPaginationQuery(endpoint, page, limit, offset, result.total);
      console.log(`[TaskController] Successfully fetched ${result.tasks.length} of ${result.total} tasks`);
      
      const response = createPaginatedResponse(
        result.tasks,
        page,
        limit,
        result.total,
        'Tasks retrieved successfully'
      );
      
      res.status(200).json(response);
    } catch (error) {
      console.error('[TaskController] Error fetching tasks:', error);
      
      if (error instanceof AppError) {
        return sendError(res, error.message, error.statusCode, error.details);
      }
      
      sendError(res, 'Failed to fetch tasks', 500);
    }
  }

  /**
   * GET /api/tasks/:id
   * Get a single task by ID
   */
  static async getTaskById(req: Request, res: Response): Promise<void> {
    try {
      const id = validateId(req.params.id, 'task ID');
      
      console.log(`[TaskController] GET /api/tasks/${id} - Fetching task`);
      
      const task = await TaskModel.findById(id);
      
      if (!task) {
        console.log(`[TaskController] Task ${id} not found`);
        throw new NotFoundError('Task');
      }
      
      console.log(`[TaskController] Successfully fetched task ${id}`);
      sendSuccess(res, task, 'Task retrieved successfully');
    } catch (error) {
      console.error('[TaskController] Error fetching task:', error);
      
      if (error instanceof AppError) {
        return sendError(res, error.message, error.statusCode, error.details);
      }
      
      sendError(res, 'Failed to fetch task', 500);
    }
  }

  /**
   * POST /api/tasks
   * Create a new task
   * Validates team membership if team_id is provided
   */
  static async createTask(req: Request, res: Response): Promise<void> {
    try {
      console.log('[TaskController] POST /api/tasks - Creating task');
      console.log('[TaskController] Request body:', req.body);
      
      const taskData: CreateTaskDTO = req.body;
      const userId = req.user?.userId;
      
      // Validate required fields
      taskData.title = validateRequired(taskData.title, 'title');
      
      // Validate team membership if team_id is provided
      if (taskData.team_id && userId) {
        const isMember = await TeamModel.isMember(taskData.team_id, userId);
        if (!isMember) {
          console.log(`[TaskController] Access denied: User ${userId} is not a member of team ${taskData.team_id}`);
          throw new AuthorizationError('You must be a member of the team to create tasks');
        }
      }
      
      // Validate status if provided
      if (taskData.status) {
        taskData.status = validateTaskStatus(taskData.status);
      }
      
      // Validate priority if provided
      if (taskData.priority) {
        taskData.priority = validateTaskPriority(taskData.priority);
      }
      
      // Add creator_id from authenticated user
      if (userId) {
        taskData.creator_id = userId;
      }
      
      const newTask = await TaskModel.create(taskData);
      
      console.log(`[TaskController] Successfully created task ${newTask.id}`);
      
      // Emit Socket.io event for real-time updates
      console.log(`[TaskController] Emitting real-time task:created event for task ${newTask.id}`);
      emitTaskCreated(newTask);
      
      sendSuccess(res, newTask, 'Task created successfully', 201);
    } catch (error) {
      console.error('[TaskController] Error creating task:', error);
      
      if (error instanceof AppError) {
        return sendError(res, error.message, error.statusCode, error.details);
      }
      
      sendError(res, 'Failed to create task', 500);
    }
  }

  /**
   * PUT /api/tasks/:id
   * Update an existing task
   */
  static async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const id = validateId(req.params.id, 'task ID');
      
      console.log(`[TaskController] PUT /api/tasks/${id} - Updating task`);
      console.log('[TaskController] Request body:', req.body);
      
      const taskData: UpdateTaskDTO = req.body;
      
      // Validate status if provided
      if (taskData.status) {
        taskData.status = validateTaskStatus(taskData.status);
      }
      
      // Validate priority if provided
      if (taskData.priority) {
        taskData.priority = validateTaskPriority(taskData.priority);
      }
      
      const updatedTask = await TaskModel.update(id, taskData);
      
      if (!updatedTask) {
        console.log(`[TaskController] Task ${id} not found for update`);
        throw new NotFoundError('Task');
      }
      
      console.log(`[TaskController] Successfully updated task ${id}`);
      
      // Emit Socket.io event for real-time updates
      console.log(`[TaskController] Emitting real-time task:updated event for task ${id}`);
      emitTaskUpdated(updatedTask);
      
      sendSuccess(res, updatedTask, 'Task updated successfully');
    } catch (error) {
      console.error('[TaskController] Error updating task:', error);
      
      if (error instanceof AppError) {
        return sendError(res, error.message, error.statusCode, error.details);
      }
      
      sendError(res, 'Failed to update task', 500);
    }
  }

  /**
   * DELETE /api/tasks/:id
   * Delete a task
   */
  static async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      const id = validateId(req.params.id, 'task ID');
      
      console.log(`[TaskController] DELETE /api/tasks/${id} - Deleting task`);
      
      // Get task before deleting (to get team_id for Socket.io event)
      console.log(`[TaskController] Fetching task ${id} to get team_id before deletion`);
      const task = await TaskModel.findById(id);
      
      if (!task) {
        console.log(`[TaskController] Task ${id} not found for deletion`);
        throw new NotFoundError('Task');
      }
      
      // Delete the task
      const deleted = await TaskModel.delete(id);
      
      if (!deleted) {
        console.log(`[TaskController] Task ${id} deletion failed`);
        throw new NotFoundError('Task');
      }
      
      console.log(`[TaskController] Successfully deleted task ${id}`);
      
      // Emit Socket.io event for real-time updates
      console.log(`[TaskController] Emitting real-time task:deleted event for task ${id}`);
      emitTaskDeleted(id, task.team_id ?? null);
      
      sendSuccess(res, null, 'Task deleted successfully');
    } catch (error) {
      console.error('[TaskController] Error deleting task:', error);
      
      if (error instanceof AppError) {
        return sendError(res, error.message, error.statusCode, error.details);
      }
      
      sendError(res, 'Failed to delete task', 500);
    }
  }
}
