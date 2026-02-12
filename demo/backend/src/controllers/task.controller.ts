import { Request, Response } from 'express';
import { TaskModel, CreateTaskDTO, UpdateTaskDTO } from '../models/task.model';
import { ApiResponse } from '../types';

/**
 * Task Controller - handles HTTP requests for task operations
 */
export class TaskController {
  /**
   * GET /api/tasks
   * Get all tasks
   */
  static async getAllTasks(req: Request, res: Response): Promise<void> {
    try {
      console.log('[TaskController] GET /api/tasks - Fetching all tasks');
      
      // Check for query parameters for filtering
      const { status, priority } = req.query;
      
      let tasks;
      
      if (status && typeof status === 'string') {
        // Filter by status
        if (!['todo', 'in_progress', 'done'].includes(status)) {
          console.log(`[TaskController] Invalid status filter: ${status}`);
          res.status(400).json({
            success: false,
            message: 'Invalid status. Must be: todo, in_progress, or done',
            data: null
          } as ApiResponse);
          return;
        }
        tasks = await TaskModel.findByStatus(status as 'todo' | 'in_progress' | 'done');
      } else if (priority && typeof priority === 'string') {
        // Filter by priority
        if (!['low', 'medium', 'high'].includes(priority)) {
          console.log(`[TaskController] Invalid priority filter: ${priority}`);
          res.status(400).json({
            success: false,
            message: 'Invalid priority. Must be: low, medium, or high',
            data: null
          } as ApiResponse);
          return;
        }
        tasks = await TaskModel.findByPriority(priority as 'low' | 'medium' | 'high');
      } else {
        // Get all tasks
        tasks = await TaskModel.findAll();
      }
      
      console.log(`[TaskController] Successfully fetched ${tasks.length} tasks`);
      
      res.status(200).json({
        success: true,
        message: 'Tasks retrieved successfully',
        data: tasks
      } as ApiResponse);
    } catch (error) {
      console.error('[TaskController] Error fetching tasks:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch tasks',
        data: null
      } as ApiResponse);
    }
  }

  /**
   * GET /api/tasks/:id
   * Get a single task by ID
   */
  static async getTaskById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      console.log(`[TaskController] GET /api/tasks/${id} - Fetching task`);
      
      // Validate ID
      if (isNaN(id)) {
        console.log(`[TaskController] Invalid task ID: ${req.params.id}`);
        res.status(400).json({
          success: false,
          message: 'Invalid task ID',
          data: null
        } as ApiResponse);
        return;
      }
      
      const task = await TaskModel.findById(id);
      
      if (!task) {
        console.log(`[TaskController] Task ${id} not found`);
        res.status(404).json({
          success: false,
          message: 'Task not found',
          data: null
        } as ApiResponse);
        return;
      }
      
      console.log(`[TaskController] Successfully fetched task ${id}`);
      
      res.status(200).json({
        success: true,
        message: 'Task retrieved successfully',
        data: task
      } as ApiResponse);
    } catch (error) {
      console.error('[TaskController] Error fetching task:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch task',
        data: null
      } as ApiResponse);
    }
  }

  /**
   * POST /api/tasks
   * Create a new task
   */
  static async createTask(req: Request, res: Response): Promise<void> {
    try {
      console.log('[TaskController] POST /api/tasks - Creating task');
      console.log('[TaskController] Request body:', req.body);
      
      const taskData: CreateTaskDTO = req.body;
      
      // Validate required fields
      if (!taskData.title || taskData.title.trim() === '') {
        console.log('[TaskController] Validation failed: title is required');
        res.status(400).json({
          success: false,
          message: 'Title is required',
          data: null
        } as ApiResponse);
        return;
      }
      
      // Validate status if provided
      if (taskData.status && !['todo', 'in_progress', 'done'].includes(taskData.status)) {
        console.log(`[TaskController] Validation failed: invalid status ${taskData.status}`);
        res.status(400).json({
          success: false,
          message: 'Invalid status. Must be: todo, in_progress, or done',
          data: null
        } as ApiResponse);
        return;
      }
      
      // Validate priority if provided
      if (taskData.priority && !['low', 'medium', 'high'].includes(taskData.priority)) {
        console.log(`[TaskController] Validation failed: invalid priority ${taskData.priority}`);
        res.status(400).json({
          success: false,
          message: 'Invalid priority. Must be: low, medium, or high',
          data: null
        } as ApiResponse);
        return;
      }
      
      const newTask = await TaskModel.create(taskData);
      
      console.log(`[TaskController] Successfully created task ${newTask.id}`);
      
      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: newTask
      } as ApiResponse);
    } catch (error) {
      console.error('[TaskController] Error creating task:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create task',
        data: null
      } as ApiResponse);
    }
  }

  /**
   * PUT /api/tasks/:id
   * Update an existing task
   */
  static async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      console.log(`[TaskController] PUT /api/tasks/${id} - Updating task`);
      console.log('[TaskController] Request body:', req.body);
      
      // Validate ID
      if (isNaN(id)) {
        console.log(`[TaskController] Invalid task ID: ${req.params.id}`);
        res.status(400).json({
          success: false,
          message: 'Invalid task ID',
          data: null
        } as ApiResponse);
        return;
      }
      
      const taskData: UpdateTaskDTO = req.body;
      
      // Validate status if provided
      if (taskData.status && !['todo', 'in_progress', 'done'].includes(taskData.status)) {
        console.log(`[TaskController] Validation failed: invalid status ${taskData.status}`);
        res.status(400).json({
          success: false,
          message: 'Invalid status. Must be: todo, in_progress, or done',
          data: null
        } as ApiResponse);
        return;
      }
      
      // Validate priority if provided
      if (taskData.priority && !['low', 'medium', 'high'].includes(taskData.priority)) {
        console.log(`[TaskController] Validation failed: invalid priority ${taskData.priority}`);
        res.status(400).json({
          success: false,
          message: 'Invalid priority. Must be: low, medium, or high',
          data: null
        } as ApiResponse);
        return;
      }
      
      const updatedTask = await TaskModel.update(id, taskData);
      
      if (!updatedTask) {
        console.log(`[TaskController] Task ${id} not found for update`);
        res.status(404).json({
          success: false,
          message: 'Task not found',
          data: null
        } as ApiResponse);
        return;
      }
      
      console.log(`[TaskController] Successfully updated task ${id}`);
      
      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: updatedTask
      } as ApiResponse);
    } catch (error) {
      console.error('[TaskController] Error updating task:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update task',
        data: null
      } as ApiResponse);
    }
  }

  /**
   * DELETE /api/tasks/:id
   * Delete a task
   */
  static async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      console.log(`[TaskController] DELETE /api/tasks/${id} - Deleting task`);
      
      // Validate ID
      if (isNaN(id)) {
        console.log(`[TaskController] Invalid task ID: ${req.params.id}`);
        res.status(400).json({
          success: false,
          message: 'Invalid task ID',
          data: null
        } as ApiResponse);
        return;
      }
      
      const deleted = await TaskModel.delete(id);
      
      if (!deleted) {
        console.log(`[TaskController] Task ${id} not found for deletion`);
        res.status(404).json({
          success: false,
          message: 'Task not found',
          data: null
        } as ApiResponse);
        return;
      }
      
      console.log(`[TaskController] Successfully deleted task ${id}`);
      
      res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
        data: null
      } as ApiResponse);
    } catch (error) {
      console.error('[TaskController] Error deleting task:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete task',
        data: null
      } as ApiResponse);
    }
  }
}
