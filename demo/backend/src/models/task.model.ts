import { pool } from '../config/database';
import { handleDatabaseError } from '../utils/errors';

/**
 * Task interface matching database schema
 */
export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee_id?: number;
  creator_id?: number;
  team_id?: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Paginated task results
 */
export interface PaginatedTasks {
  tasks: Task[];
  total: number;
}

/**
 * DTO for creating a new task
 */
export interface CreateTaskDTO {
  title: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  assignee_id?: number;
  creator_id?: number;
  team_id?: number;
}

/**
 * DTO for updating an existing task
 */
export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  assignee_id?: number;
  team_id?: number;
}

/**
 * Task Model - handles all database operations for tasks
 */
export class TaskModel {
  /**
   * Get all tasks from the database with pagination
   * Sorted by created_at descending (newest first)
   * @param limit - Number of tasks to return
   * @param offset - Number of tasks to skip
   * @returns Paginated tasks and total count
   */
  static async findAll(limit?: number, offset?: number): Promise<PaginatedTasks> {
    console.log('[TaskModel] Fetching all tasks...', { limit, offset });
    
    try {
      // Use pagination if provided, otherwise return all tasks
      const isPaginated = limit !== undefined && offset !== undefined;
      
      if (isPaginated) {
        // Execute count and data queries in parallel for better performance
        const [countResult, dataResult] = await Promise.all([
          pool.query('SELECT COUNT(*) FROM tasks'),
          pool.query(
            'SELECT * FROM tasks ORDER BY created_at DESC LIMIT $1 OFFSET $2',
            [limit, offset]
          ),
        ]);
        
        const total = parseInt(countResult.rows[0].count);
        console.log(`[TaskModel] Found ${dataResult.rows.length} of ${total} tasks (page)`);
        
        return {
          tasks: dataResult.rows,
          total,
        };
      } else {
        // No pagination - return all tasks
        const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
        console.log(`[TaskModel] Found ${result.rows.length} tasks (all)`);
        
        return {
          tasks: result.rows,
          total: result.rows.length,
        };
      }
    } catch (error) {
      console.error('[TaskModel] Error fetching tasks:', error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * Get a single task by ID
   * @param id - Task ID
   * @returns Task or null if not found
   */
  static async findById(id: number): Promise<Task | null> {
    console.log(`[TaskModel] Fetching task with id: ${id}`);
    
    try {
      const result = await pool.query(
        'SELECT * FROM tasks WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        console.log(`[TaskModel] Task with id ${id} not found`);
        return null;
      }
      
      console.log(`[TaskModel] Found task: ${result.rows[0].title}`);
      return result.rows[0];
    } catch (error) {
      console.error('[TaskModel] Error fetching task by ID:', error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * Create a new task
   * @param taskData - Data for the new task
   * @returns Newly created task
   */
  static async create(taskData: CreateTaskDTO): Promise<Task> {
    console.log('[TaskModel] Creating new task:', taskData.title);
    
    try {
      const { title, description, status = 'todo', priority = 'medium', assignee_id, creator_id, team_id } = taskData;
      
      const result = await pool.query(
        `INSERT INTO tasks (title, description, status, priority, assignee_id, creator_id, team_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [title, description, status, priority, assignee_id, creator_id, team_id]
      );
      
      console.log(`[TaskModel] Created task with id: ${result.rows[0].id}`);
      return result.rows[0];
    } catch (error) {
      console.error('[TaskModel] Error creating task:', error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * Update an existing task
   * @param id - Task ID
   * @param taskData - Updated task data
   * @returns Updated task or null if not found
   */
  static async update(id: number, taskData: UpdateTaskDTO): Promise<Task | null> {
    console.log(`[TaskModel] Updating task ${id}:`, taskData);
    
    try {
      // Build dynamic update query based on provided fields
      const fields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (taskData.title !== undefined) {
        fields.push(`title = $${paramCount++}`);
        values.push(taskData.title);
      }
      if (taskData.description !== undefined) {
        fields.push(`description = $${paramCount++}`);
        values.push(taskData.description);
      }
      if (taskData.status !== undefined) {
        fields.push(`status = $${paramCount++}`);
        values.push(taskData.status);
      }
      if (taskData.priority !== undefined) {
        fields.push(`priority = $${paramCount++}`);
        values.push(taskData.priority);
      }
      if (taskData.assignee_id !== undefined) {
        fields.push(`assignee_id = $${paramCount++}`);
        values.push(taskData.assignee_id);
      }
      if (taskData.team_id !== undefined) {
        fields.push(`team_id = $${paramCount++}`);
        values.push(taskData.team_id);
      }

      // Always update updated_at
      fields.push(`updated_at = NOW()`);
      
      // Add id to values
      values.push(id);

      if (fields.length === 1) {
        // Only updated_at would be updated, return existing task
        console.log('[TaskModel] No fields to update');
        return this.findById(id);
      }

      const query = `
        UPDATE tasks
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        console.log(`[TaskModel] Task with id ${id} not found for update`);
        return null;
      }

      console.log(`[TaskModel] Updated task ${id} successfully`);
      return result.rows[0];
    } catch (error) {
      console.error('[TaskModel] Error updating task:', error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * Delete a task
   * @param id - Task ID
   * @returns True if deleted, false if not found
   */
  static async delete(id: number): Promise<boolean> {
    console.log(`[TaskModel] Deleting task ${id}`);
    
    try {
      const result = await pool.query(
        'DELETE FROM tasks WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        console.log(`[TaskModel] Task with id ${id} not found for deletion`);
        return false;
      }

      console.log(`[TaskModel] Deleted task ${id} successfully`);
      return true;
    } catch (error) {
      console.error('[TaskModel] Error deleting task:', error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * Get tasks by status with pagination
   * @param status - Task status filter
   * @param limit - Number of tasks to return
   * @param offset - Number of tasks to skip
   * @returns Paginated tasks and total count
   */
  static async findByStatus(
    status: 'todo' | 'in_progress' | 'done',
    limit?: number,
    offset?: number
  ): Promise<PaginatedTasks> {
    console.log(`[TaskModel] Fetching tasks with status: ${status}`, { limit, offset });
    
    try {
      const isPaginated = limit !== undefined && offset !== undefined;
      
      if (isPaginated) {
        const [countResult, dataResult] = await Promise.all([
          pool.query('SELECT COUNT(*) FROM tasks WHERE status = $1', [status]),
          pool.query(
            'SELECT * FROM tasks WHERE status = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
            [status, limit, offset]
          ),
        ]);
        
        const total = parseInt(countResult.rows[0].count);
        console.log(`[TaskModel] Found ${dataResult.rows.length} of ${total} tasks with status ${status}`);
        
        return { tasks: dataResult.rows, total };
      } else {
        const result = await pool.query(
          'SELECT * FROM tasks WHERE status = $1 ORDER BY created_at DESC',
          [status]
        );
        console.log(`[TaskModel] Found ${result.rows.length} tasks with status ${status}`);
        return { tasks: result.rows, total: result.rows.length };
      }
    } catch (error) {
      console.error('[TaskModel] Error fetching tasks by status:', error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * Get tasks by priority with pagination
   * @param priority - Task priority filter
   * @param limit - Number of tasks to return
   * @param offset - Number of tasks to skip
   * @returns Paginated tasks and total count
   */
  static async findByPriority(
    priority: 'low' | 'medium' | 'high',
    limit?: number,
    offset?: number
  ): Promise<PaginatedTasks> {
    console.log(`[TaskModel] Fetching tasks with priority: ${priority}`, { limit, offset });
    
    try {
      const isPaginated = limit !== undefined && offset !== undefined;
      
      if (isPaginated) {
        const [countResult, dataResult] = await Promise.all([
          pool.query('SELECT COUNT(*) FROM tasks WHERE priority = $1', [priority]),
          pool.query(
            'SELECT * FROM tasks WHERE priority = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
            [priority, limit, offset]
          ),
        ]);
        
        const total = parseInt(countResult.rows[0].count);
        console.log(`[TaskModel] Found ${dataResult.rows.length} of ${total} tasks with priority ${priority}`);
        
        return { tasks: dataResult.rows, total };
      } else {
        const result = await pool.query(
          'SELECT * FROM tasks WHERE priority = $1 ORDER BY created_at DESC',
          [priority]
        );
        console.log(`[TaskModel] Found ${result.rows.length} tasks with priority ${priority}`);
        return { tasks: result.rows, total: result.rows.length };
      }
    } catch (error) {
      console.error('[TaskModel] Error fetching tasks by priority:', error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * Get tasks by team_id with pagination
   * @param team_id - Team ID to filter tasks
   * @param limit - Number of tasks to return
   * @param offset - Number of tasks to skip
   * @returns Paginated tasks and total count
   */
  static async findByTeamId(
    team_id: number,
    limit?: number,
    offset?: number
  ): Promise<PaginatedTasks> {
    console.log(`[TaskModel] Fetching tasks for team ${team_id}`, { limit, offset });
    
    try {
      const isPaginated = limit !== undefined && offset !== undefined;
      
      if (isPaginated) {
        const [countResult, dataResult] = await Promise.all([
          pool.query('SELECT COUNT(*) FROM tasks WHERE team_id = $1', [team_id]),
          pool.query(
            'SELECT * FROM tasks WHERE team_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
            [team_id, limit, offset]
          ),
        ]);
        
        const total = parseInt(countResult.rows[0].count);
        console.log(`[TaskModel] Found ${dataResult.rows.length} of ${total} tasks for team ${team_id}`);
        
        return { tasks: dataResult.rows, total };
      } else {
        const result = await pool.query(
          'SELECT * FROM tasks WHERE team_id = $1 ORDER BY created_at DESC',
          [team_id]
        );
        console.log(`[TaskModel] Found ${result.rows.length} tasks for team ${team_id}`);
        return { tasks: result.rows, total: result.rows.length };
      }
    } catch (error) {
      console.error('[TaskModel] Error fetching tasks by team:', error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * Get unassigned tasks (team_id IS NULL) for a specific user with pagination
   * Shows tasks where creator_id matches user OR creator_id is NULL (legacy tasks)
   * @param user_id - User ID who created the tasks
   * @param limit - Number of tasks to return
   * @param offset - Number of tasks to skip
   * @returns Paginated tasks and total count
   */
  static async findUnassigned(
    user_id?: number,
    limit?: number,
    offset?: number
  ): Promise<PaginatedTasks> {
    console.log(`[TaskModel] Fetching unassigned tasks for user ${user_id}`, { limit, offset });
    
    try {
      const isPaginated = limit !== undefined && offset !== undefined;
      
      if (isPaginated) {
        const [countResult, dataResult] = await Promise.all([
          pool.query(
            'SELECT COUNT(*) FROM tasks WHERE team_id IS NULL AND (creator_id = $1 OR creator_id IS NULL)',
            [user_id]
          ),
          pool.query(
            'SELECT * FROM tasks WHERE team_id IS NULL AND (creator_id = $1 OR creator_id IS NULL) ORDER BY created_at DESC LIMIT $2 OFFSET $3',
            [user_id, limit, offset]
          ),
        ]);
        
        const total = parseInt(countResult.rows[0].count);
        console.log(`[TaskModel] Found ${dataResult.rows.length} of ${total} unassigned tasks`);
        
        return { tasks: dataResult.rows, total };
      } else {
        const result = await pool.query(
          'SELECT * FROM tasks WHERE team_id IS NULL AND (creator_id = $1 OR creator_id IS NULL) ORDER BY created_at DESC',
          [user_id]
        );
        console.log(`[TaskModel] Found ${result.rows.length} unassigned tasks`);
        return { tasks: result.rows, total: result.rows.length };
      }
    } catch (error) {
      console.error('[TaskModel] Error fetching unassigned tasks:', error);
      throw handleDatabaseError(error);
    }
  }
}
