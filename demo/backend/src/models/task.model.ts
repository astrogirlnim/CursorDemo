import { pool } from '../config/database';

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
   * Get all tasks from the database
   * Sorted by created_at descending (newest first)
   */
  static async findAll(): Promise<Task[]> {
    console.log('[TaskModel] Fetching all tasks...');
    const result = await pool.query(
      'SELECT * FROM tasks ORDER BY created_at DESC'
    );
    console.log(`[TaskModel] Found ${result.rows.length} tasks`);
    return result.rows;
  }

  /**
   * Get a single task by ID
   * @param id - Task ID
   * @returns Task or null if not found
   */
  static async findById(id: number): Promise<Task | null> {
    console.log(`[TaskModel] Fetching task with id: ${id}`);
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
  }

  /**
   * Create a new task
   * @param taskData - Data for the new task
   * @returns Newly created task
   */
  static async create(taskData: CreateTaskDTO): Promise<Task> {
    console.log('[TaskModel] Creating new task:', taskData.title);
    
    const { title, description, status = 'todo', priority = 'medium', assignee_id, creator_id, team_id } = taskData;
    
    const result = await pool.query(
      `INSERT INTO tasks (title, description, status, priority, assignee_id, creator_id, team_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, description, status, priority, assignee_id, creator_id, team_id]
    );
    
    console.log(`[TaskModel] Created task with id: ${result.rows[0].id}`);
    return result.rows[0];
  }

  /**
   * Update an existing task
   * @param id - Task ID
   * @param taskData - Updated task data
   * @returns Updated task or null if not found
   */
  static async update(id: number, taskData: UpdateTaskDTO): Promise<Task | null> {
    console.log(`[TaskModel] Updating task ${id}:`, taskData);
    
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
  }

  /**
   * Delete a task
   * @param id - Task ID
   * @returns True if deleted, false if not found
   */
  static async delete(id: number): Promise<boolean> {
    console.log(`[TaskModel] Deleting task ${id}`);
    
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
  }

  /**
   * Get tasks by status
   * @param status - Task status filter
   * @returns Array of tasks with the specified status
   */
  static async findByStatus(status: 'todo' | 'in_progress' | 'done'): Promise<Task[]> {
    console.log(`[TaskModel] Fetching tasks with status: ${status}`);
    
    const result = await pool.query(
      'SELECT * FROM tasks WHERE status = $1 ORDER BY created_at DESC',
      [status]
    );
    
    console.log(`[TaskModel] Found ${result.rows.length} tasks with status ${status}`);
    return result.rows;
  }

  /**
   * Get tasks by priority
   * @param priority - Task priority filter
   * @returns Array of tasks with the specified priority
   */
  static async findByPriority(priority: 'low' | 'medium' | 'high'): Promise<Task[]> {
    console.log(`[TaskModel] Fetching tasks with priority: ${priority}`);
    
    const result = await pool.query(
      'SELECT * FROM tasks WHERE priority = $1 ORDER BY created_at DESC',
      [priority]
    );
    
    console.log(`[TaskModel] Found ${result.rows.length} tasks with priority ${priority}`);
    return result.rows;
  }

  /**
   * Get tasks by team_id
   * @param team_id - Team ID to filter tasks
   * @returns Array of tasks belonging to the specified team
   */
  static async findByTeamId(team_id: number): Promise<Task[]> {
    console.log(`[TaskModel] Fetching tasks for team ${team_id}`);
    
    const result = await pool.query(
      'SELECT * FROM tasks WHERE team_id = $1 ORDER BY created_at DESC',
      [team_id]
    );
    
    console.log(`[TaskModel] Found ${result.rows.length} tasks for team ${team_id}`);
    return result.rows;
  }

  /**
   * Get unassigned tasks (team_id IS NULL) for a specific user
   * Shows tasks where creator_id matches user OR creator_id is NULL (legacy tasks)
   * @param user_id - User ID who created the tasks
   * @returns Array of tasks with no team assigned
   */
  static async findUnassigned(user_id?: number): Promise<Task[]> {
    console.log(`[TaskModel] Fetching unassigned tasks for user ${user_id}`);
    
    const result = await pool.query(
      'SELECT * FROM tasks WHERE team_id IS NULL AND (creator_id = $1 OR creator_id IS NULL) ORDER BY created_at DESC',
      [user_id]
    );
    
    console.log(`[TaskModel] Found ${result.rows.length} unassigned tasks`);
    return result.rows;
  }
}
