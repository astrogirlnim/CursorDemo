import { useState } from 'react';
import { Task } from './types/task.types';
import { TaskList } from './components/TaskList';
import { TaskForm } from './components/TaskForm';

export default function App() {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  console.log('[App] Rendering - showForm:', showForm, 'editingTask:', editingTask?.id);

  /**
   * Handle task edit
   */
  const handleEdit = (task: Task) => {
    console.log('[App] Editing task:', task.id);
    setEditingTask(task);
    setShowForm(true);
  };

  /**
   * Handle form success (create/update)
   */
  const handleFormSuccess = () => {
    console.log('[App] Form submitted successfully');
    setShowForm(false);
    setEditingTask(null);
    // Trigger refresh by incrementing counter
    setRefreshTrigger(prev => prev + 1);
  };

  /**
   * Handle form cancel
   */
  const handleFormCancel = () => {
    console.log('[App] Form canceled');
    setShowForm(false);
    setEditingTask(null);
  };

  /**
   * Handle create new task button
   */
  const handleCreateNew = () => {
    console.log('[App] Creating new task');
    setEditingTask(null);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Team Task Manager
          </h1>
          <p className="text-gray-600">
            Built with Cursor AI - Module 2: CRUD Operations
          </p>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task Form */}
          <div className="lg:col-span-1">
            {showForm ? (
              <TaskForm
                editingTask={editingTask}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            ) : (
              <button
                onClick={handleCreateNew}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg shadow-md transition-colors"
              >
                + Create New Task
              </button>
            )}
          </div>

          {/* Task List */}
          <div className="lg:col-span-2">
            <TaskList 
              onEdit={handleEdit} 
              refreshTrigger={refreshTrigger}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
