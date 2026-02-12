-- Create tasks table for Team Task Manager
-- Module 2: CRUD Operations

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assignee_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on created_at for efficient sorting
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);

-- Insert sample tasks for testing (only if table is empty)
INSERT INTO tasks (title, description, status, priority)
SELECT * FROM (VALUES
  ('Setup development environment', 'Install Node.js, PostgreSQL, and Cursor IDE', 'done', 'high'),
  ('Create database schema', 'Design and implement tasks table', 'in_progress', 'high'),
  ('Build REST API', 'Implement CRUD endpoints for tasks', 'todo', 'medium'),
  ('Design UI components', 'Create TaskList and TaskForm components', 'todo', 'medium'),
  ('Write documentation', 'Document API endpoints and usage', 'todo', 'low')
) AS sample_data
WHERE NOT EXISTS (SELECT 1 FROM tasks);

-- Log success
DO $$
BEGIN
  RAISE NOTICE 'Tasks table created successfully with % sample tasks', (SELECT COUNT(*) FROM tasks);
END $$;
