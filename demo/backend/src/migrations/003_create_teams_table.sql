-- Migration: Create teams table for team collaboration
-- This table stores teams with owner information for access control

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on owner_id for faster team lookups by user
CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON teams(owner_id);

-- Create trigger to call update function before any update on teams table
-- Drop trigger first if it exists to ensure clean state
DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at 
BEFORE UPDATE ON teams
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Teams table created successfully with owner_id index and updated_at trigger';
END $$;
