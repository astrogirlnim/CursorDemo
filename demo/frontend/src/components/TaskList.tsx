import { useEffect, useState } from 'react';
import { Task, TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG } from '../types/task.types';
import { TaskService } from '../services/task.service';
import { useTeam } from '../contexts/TeamContext';
import { useSocket } from '../contexts/SocketContext';

interface TaskListProps {
  onEdit: (task: Task) => void;
  refreshTrigger?: number;
}

/**
 * TaskList Component
 * Displays all tasks with filtering, status updates, and delete functionality
 * Now filters tasks by current team and updates in real-time via Socket.io
 */
export function TaskList({ onEdit, refreshTrigger }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const { currentTeam } = useTeam();
  const { connected, onTaskCreated, onTaskUpdated, onTaskDeleted } = useSocket();

  // Fetch tasks on mount and when filters, team, or refreshTrigger change
  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter, refreshTrigger, currentTeam]);

  /**
   * Subscribe to real-time task events via Socket.io
   * Updates local state when tasks are created/updated/deleted
   */
  useEffect(() => {
    console.log('[TaskList] Setting up real-time Socket.io event listeners...');
    console.log('[TaskList] Socket connected:', connected);
    console.log('[TaskList] Current team:', currentTeam?.name);

    if (!connected || !currentTeam) {
      console.log('[TaskList] Not ready for real-time updates');
      return;
    }

    // Subscribe to task:created events
    const unsubscribeCreated = onTaskCreated((task: Task) => {
      console.log('[TaskList] Real-time task created:', task);
      
      // Only add task if it belongs to current team and matches filters
      if (task.team_id === currentTeam.id || (currentTeam.id === -1 && !task.team_id)) {
        const matchesFilters = 
          (statusFilter === 'all' || task.status === statusFilter) &&
          (priorityFilter === 'all' || task.priority === priorityFilter);
        
        if (matchesFilters) {
          console.log('[TaskList] Adding new task to list');
          setTasks(prevTasks => [task, ...prevTasks]);
        } else {
          console.log('[TaskList] New task does not match current filters, not adding to list');
        }
      } else {
        console.log('[TaskList] Task belongs to different team, ignoring');
      }
    });

    // Subscribe to task:updated events
    const unsubscribeUpdated = onTaskUpdated((task: Task) => {
      console.log('[TaskList] Real-time task updated:', task);
      
      // Update task if it belongs to current team
      if (task.team_id === currentTeam.id || (currentTeam.id === -1 && !task.team_id)) {
        const matchesFilters = 
          (statusFilter === 'all' || task.status === statusFilter) &&
          (priorityFilter === 'all' || task.priority === priorityFilter);
        
        if (matchesFilters) {
          console.log('[TaskList] Updating task in list');
          setTasks(prevTasks => 
            prevTasks.map(t => t.id === task.id ? task : t)
          );
        } else {
          console.log('[TaskList] Updated task no longer matches filters, removing from list');
          setTasks(prevTasks => prevTasks.filter(t => t.id !== task.id));
        }
      } else {
        console.log('[TaskList] Task belongs to different team, ignoring');
      }
    });

    // Subscribe to task:deleted events
    const unsubscribeDeleted = onTaskDeleted((data: { id: number; team_id: number }) => {
      console.log('[TaskList] Real-time task deleted:', data);
      
      // Remove task if it belongs to current team
      if (data.team_id === currentTeam.id || (currentTeam.id === -1 && !data.team_id)) {
        console.log('[TaskList] Removing task from list');
        setTasks(prevTasks => prevTasks.filter(t => t.id !== data.id));
      } else {
        console.log('[TaskList] Task belongs to different team, ignoring');
      }
    });

    console.log('[TaskList] Real-time event listeners registered');

    // Cleanup subscriptions on unmount or when dependencies change
    return () => {
      console.log('[TaskList] Cleaning up real-time event listeners');
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeDeleted();
    };
  }, [connected, currentTeam, statusFilter, priorityFilter, onTaskCreated, onTaskUpdated, onTaskDeleted]);

  /**
   * Fetch tasks from API with current filters and team
   */
  const fetchTasks = async () => {
    try {
      console.log('[TaskList] Fetching tasks for team:', currentTeam?.name);
      setLoading(true);
      setError(null);
      
      // If no team selected, don't fetch tasks
      if (!currentTeam) {
        console.log('[TaskList] No team selected, clearing tasks');
        setTasks([]);
        setLoading(false);
        return;
      }
      
      // Handle special unassigned tasks (id: -1)
      const filters: any = { 
        team_id: currentTeam.id === -1 ? 'unassigned' : currentTeam.id 
      };
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (priorityFilter !== 'all') filters.priority = priorityFilter;
      
      const data = await TaskService.getAllTasks(filters);
      console.log(`[TaskList] Loaded ${data.length} tasks for team ${currentTeam.name}`);
      setTasks(data);
    } catch (err) {
      console.error('[TaskList] Error fetching tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update task status
   */
  const handleStatusChange = async (taskId: number, newStatus: Task['status']) => {
    try {
      console.log(`[TaskList] Updating task ${taskId} status to ${newStatus}`);
      await TaskService.updateTask(taskId, { status: newStatus });
      
      // Update local state
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (err) {
      console.error('[TaskList] Error updating task status:', err);
      alert('Failed to update task status');
    }
  };

  /**
   * Delete a task
   */
  const handleDelete = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      console.log(`[TaskList] Deleting task ${taskId}`);
      await TaskService.deleteTask(taskId);
      
      // Remove from local state
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('[TaskList] Error deleting task:', err);
      alert('Failed to delete task');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-semibold">Error loading tasks</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchTasks}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  // Show message if no team is selected
  if (!currentTeam) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-yellow-800">
        <p className="font-semibold text-lg mb-2">No Team Selected</p>
        <p className="text-sm">Please select a team from the dropdown above to view and manage tasks.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Connection status indicator */}
      {connected && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-xs text-green-700">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          Real-time updates active
        </div>
      )}
      
      {!connected && currentTeam && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-xs text-yellow-700">
          <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
          Connecting to real-time server...
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={fetchTasks}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Task count */}
      <div className="text-sm text-gray-600">
        Showing {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
      </div>

      {/* Tasks list */}
      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No tasks found</p>
          <p className="text-sm text-gray-400 mt-1">Create a new task to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Title and priority */}
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    <span className={`text-xs ${TASK_PRIORITY_CONFIG[task.priority].color}`}>
                      {TASK_PRIORITY_CONFIG[task.priority].icon} {TASK_PRIORITY_CONFIG[task.priority].label}
                    </span>
                  </div>

                  {/* Description */}
                  {task.description && (
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>ID: {task.id}</span>
                    <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 ml-4">
                  {/* Status selector */}
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                    className={`text-xs px-2 py-1 rounded-full border-0 font-medium ${TASK_STATUS_CONFIG[task.status].color}`}
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>

                  {/* Edit button */}
                  <button
                    onClick={() => onEdit(task)}
                    className="text-xs px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
                  >
                    Edit
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-xs px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
