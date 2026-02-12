/// <reference types="vite/client" />

import { Task, CreateTaskDTO, UpdateTaskDTO, ApiResponse } from '../types/task.types';
import { AuthService } from './auth.service';

/**
 * Base API URL from environment variables
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

console.log('[TaskService] API Base URL:', API_BASE_URL);

/**
 * Task Service - handles all API calls for task operations
 * All requests include Authorization header with JWT token
 */
export class TaskService {
  /**
   * Get headers with Authorization token
   * @returns Headers object with Content-Type and Authorization
   */
  private static getHeaders(): HeadersInit {
    const token = AuthService.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('[TaskService] Including Authorization header');
    } else {
      console.warn('[TaskService] No token found, request may fail');
    }
    
    return headers;
  }
  /**
   * Get all tasks
   * @param filters - Optional filters for status/priority
   * @returns Promise with array of tasks
   */
  static async getAllTasks(filters?: { status?: string; priority?: string }): Promise<Task[]> {
    try {
      console.log('[TaskService] Fetching all tasks', filters ? `with filters: ${JSON.stringify(filters)}` : '');
      
      // Build query string
      const queryParams = new URLSearchParams();
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.priority) queryParams.append('priority', filters.priority);
      const queryString = queryParams.toString();
      
      const url = `${API_BASE_URL}/api/tasks${queryString ? `?${queryString}` : ''}`;
      console.log('[TaskService] Request URL:', url);
      
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result: ApiResponse<Task[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      console.log(`[TaskService] Successfully fetched ${result.data?.length || 0} tasks`);
      return result.data || [];
    } catch (error) {
      console.error('[TaskService] Error fetching tasks:', error);
      throw error;
    }
  }

  /**
   * Get a single task by ID
   * @param id - Task ID
   * @returns Promise with task
   */
  static async getTaskById(id: number): Promise<Task> {
    try {
      console.log(`[TaskService] Fetching task ${id}`);
      
      const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result: ApiResponse<Task> = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.message);
      }
      
      console.log(`[TaskService] Successfully fetched task ${id}`);
      return result.data;
    } catch (error) {
      console.error(`[TaskService] Error fetching task ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new task
   * @param taskData - Data for the new task
   * @returns Promise with created task
   */
  static async createTask(taskData: CreateTaskDTO): Promise<Task> {
    try {
      console.log('[TaskService] Creating task:', taskData);
      
      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(taskData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result: ApiResponse<Task> = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.message);
      }
      
      console.log(`[TaskService] Successfully created task ${result.data.id}`);
      return result.data;
    } catch (error) {
      console.error('[TaskService] Error creating task:', error);
      throw error;
    }
  }

  /**
   * Update an existing task
   * @param id - Task ID
   * @param taskData - Updated task data
   * @returns Promise with updated task
   */
  static async updateTask(id: number, taskData: UpdateTaskDTO): Promise<Task> {
    try {
      console.log(`[TaskService] Updating task ${id}:`, taskData);
      
      const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(taskData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result: ApiResponse<Task> = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.message);
      }
      
      console.log(`[TaskService] Successfully updated task ${id}`);
      return result.data;
    } catch (error) {
      console.error(`[TaskService] Error updating task ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a task
   * @param id - Task ID
   * @returns Promise with void
   */
  static async deleteTask(id: number): Promise<void> {
    try {
      console.log(`[TaskService] Deleting task ${id}`);
      
      const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result: ApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      console.log(`[TaskService] Successfully deleted task ${id}`);
    } catch (error) {
      console.error(`[TaskService] Error deleting task ${id}:`, error);
      throw error;
    }
  }
}
