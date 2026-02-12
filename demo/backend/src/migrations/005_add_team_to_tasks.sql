-- Migration: Add team_id column to tasks table
-- This enables team-based task filtering and access control

-- Add team_id foreign key column to tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE;

-- Add creator_id column if not exists
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS creator_id INTEGER;

-- Create index on team_id for efficient team-based task filtering
CREATE INDEX IF NOT EXISTS idx_tasks_team_id ON tasks(team_id);

-- Add foreign key constraint for creator_id if column exists and constraint doesn't
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'creator_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'tasks_creator_id_fkey' AND table_name = 'tasks'
  ) THEN
    ALTER TABLE tasks ADD CONSTRAINT tasks_creator_id_fkey 
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added creator_id foreign key constraint';
  END IF;
END $$;

-- Add foreign key constraint for assignee_id if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'tasks_assignee_id_fkey' AND table_name = 'tasks'
  ) THEN
    ALTER TABLE tasks ADD CONSTRAINT tasks_assignee_id_fkey 
    FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added assignee_id foreign key constraint';
  END IF;
END $$;

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Tasks table updated with team_id column and foreign key constraints';
END $$;
