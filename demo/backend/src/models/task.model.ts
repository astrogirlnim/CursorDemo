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

  /**
   * OPTIMIZATION: Batch create multiple tasks
   * Reduces round trips to database by inserting multiple tasks in one query
   * 
   * @param tasksData - Array of task data to create
   * @returns Array of created tasks
   */
  static async batchCreate(tasksData: CreateTaskDTO[]): Promise<Task[]> {
    console.log(`[TaskModel] Batch creating ${tasksData.length} tasks`);
    
    if (tasksData.length === 0) {
      return [];
    }
    
    try {
      // Build VALUES clauses for batch insert
      const values: any[] = [];
      const valuePlaceholders: string[] = [];
      let paramCount = 1;
      
      for (const taskData of tasksData) {
        const { title, description, status = 'todo', priority = 'medium', assignee_id, creator_id, team_id } = taskData;
        
        valuePlaceholders.push(
          `($${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++})`
        );
        
        values.push(title, description, status, priority, assignee_id, creator_id, team_id);
      }
      
      const query = `
        INSERT INTO tasks (title, description, status, priority, assignee_id, creator_id, team_id)
        VALUES ${valuePlaceholders.join(', ')}
        RETURNING *
      `;
      
      const result = await pool.query(query, values);
      
      console.log(`[TaskModel] Batch created ${result.rows.length} tasks successfully`);
      return result.rows;
    } catch (error) {
      console.error('[TaskModel] Error batch creating tasks:', error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * OPTIMIZATION: Batch update task status
   * Useful for bulk operations like "mark all as done"
   * 
   * @param ids - Array of task IDs to update
   * @param status - New status for all tasks
   * @returns Number of tasks updated
   */
  static async batchUpdateStatus(
    ids: number[],
    status: 'todo' | 'in_progress' | 'done'
  ): Promise<number> {
    console.log(`[TaskModel] Batch updating status to "${status}" for ${ids.length} tasks`);
    
    if (ids.length === 0) {
      return 0;
    }
    
    try {
      const result = await pool.query(
        `UPDATE tasks 
         SET status = $1, updated_at = NOW()
         WHERE id = ANY($2)
         RETURNING id`,
        [status, ids]
      );
      
      console.log(`[TaskModel] Batch updated ${result.rows.length} tasks to status "${status}"`);
      return result.rows.length;
    } catch (error) {
      console.error('[TaskModel] Error batch updating task status:', error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * OPTIMIZATION: Batch delete tasks
   * Useful for cleaning up or bulk deletions
   * 
   * @param ids - Array of task IDs to delete
   * @returns Number of tasks deleted
   */
  static async batchDelete(ids: number[]): Promise<number> {
    console.log(`[TaskModel] Batch deleting ${ids.length} tasks`);
    
    if (ids.length === 0) {
      return 0;
    }
    
    try {
      const result = await pool.query(
        'DELETE FROM tasks WHERE id = ANY($1) RETURNING id',
        [ids]
      );
      
      console.log(`[TaskModel] Batch deleted ${result.rows.length} tasks successfully`);
      return result.rows.length;
    } catch (error) {
      console.error('[TaskModel] Error batch deleting tasks:', error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * OPTIMIZATION: Get tasks by multiple IDs in one query
   * Avoids N+1 queries when fetching multiple tasks
   * 
   * @param ids - Array of task IDs
   * @returns Array of tasks (may be fewer than requested if some IDs don't exist)
   */
  static async findByIds(ids: number[]): Promise<Task[]> {
    console.log(`[TaskModel] Fetching ${ids.length} tasks by IDs`);
    
    if (ids.length === 0) {
      return [];
    }
    
    try {
      const result = await pool.query(
        'SELECT * FROM tasks WHERE id = ANY($1) ORDER BY created_at DESC',
        [ids]
      );
      
      console.log(`[TaskModel] Found ${result.rows.length} tasks out of ${ids.length} requested`);
      return result.rows;
    } catch (error) {
      console.error('[TaskModel] Error fetching tasks by IDs:', error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * OPTIMIZATION: Get task counts grouped by status
   * Useful for dashboard statistics without multiple queries
   * 
   * @param team_id - Optional team ID to filter by
   * @returns Object with counts by status
   */
  static async getStatusCounts(team_id?: number): Promise<Record<string, number>> {
    console.log(`[TaskModel] Getting status counts${team_id ? ` for team ${team_id}` : ''}`);
    
    try {
      const query = team_id
        ? 'SELECT status, COUNT(*) as count FROM tasks WHERE team_id = $1 GROUP BY status'
        : 'SELECT status, COUNT(*) as count FROM tasks GROUP BY status';
      
      const params = team_id ? [team_id] : [];
      const result = await pool.query(query, params);
      
      // Convert to object
      const counts: Record<string, number> = {
        todo: 0,
        in_progress: 0,
        done: 0,
      };
      
      for (const row of result.rows) {
        counts[row.status] = parseInt(row.count);
      }
      
      console.log('[TaskModel] Status counts:', counts);
      return counts;
    } catch (error) {
      console.error('[TaskModel] Error getting status counts:', error);
      throw handleDatabaseError(error);
    }
  }
}
