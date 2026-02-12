import { useState, useEffect } from 'react';
import { Task, CreateTaskDTO } from '../types/task.types';
import { TaskService } from '../services/task.service';

interface TaskFormProps {
  editingTask?: Task | null;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * TaskForm Component
 * Form for creating and editing tasks
 */
export function TaskForm({ editingTask, onSuccess, onCancel }: TaskFormProps) {
  const [formData, setFormData] = useState<CreateTaskDTO>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form when editing
  useEffect(() => {
    if (editingTask) {
      console.log('[TaskForm] Editing task:', editingTask);
      setFormData({
        title: editingTask.title,
        description: editingTask.description || '',
        status: editingTask.status,
        priority: editingTask.priority,
      });
    } else {
      console.log('[TaskForm] Creating new task');
      resetForm();
    }
  }, [editingTask]);

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
    });
    setError(null);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      console.log('[TaskForm] Submitting form:', formData);
      setLoading(true);
      setError(null);

      if (editingTask) {
        // Update existing task
        console.log(`[TaskForm] Updating task ${editingTask.id}`);
        await TaskService.updateTask(editingTask.id, formData);
      } else {
        // Create new task
        console.log('[TaskForm] Creating new task');
        await TaskService.createTask(formData);
      }

      console.log('[TaskForm] Operation successful');
      resetForm();
      onSuccess();
    } catch (err) {
      console.error('[TaskForm] Error submitting form:', err);
      setError(err instanceof Error ? err.message : 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    console.log('[TaskForm] Canceling form');
    resetForm();
    onCancel();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {editingTask ? 'Edit Task' : 'Create New Task'}
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter task title"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter task description (optional)"
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            disabled={loading}
          />
        </div>

        {/* Status and Priority */}
        <div className="grid grid-cols-2 gap-4">
          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
          </button>
          
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
