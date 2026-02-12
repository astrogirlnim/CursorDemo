/**
 * Task interface matching backend schema
 */
export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee_id?: number;
  created_at: string;
  updated_at: string;
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
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
}

/**
 * Task status display configuration
 */
export const TASK_STATUS_CONFIG = {
  todo: {
    label: 'To Do',
    color: 'bg-gray-100 text-gray-800',
    badgeColor: 'bg-gray-500'
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-blue-100 text-blue-800',
    badgeColor: 'bg-blue-500'
  },
  done: {
    label: 'Done',
    color: 'bg-green-100 text-green-800',
    badgeColor: 'bg-green-500'
  }
} as const;

/**
 * Task priority display configuration
 */
export const TASK_PRIORITY_CONFIG = {
  low: {
    label: 'Low',
    color: 'text-gray-500',
    icon: '⬇️'
  },
  medium: {
    label: 'Medium',
    color: 'text-yellow-500',
    icon: '➡️'
  },
  high: {
    label: 'High',
    color: 'text-red-500',
    icon: '⬆️'
  }
} as const;
