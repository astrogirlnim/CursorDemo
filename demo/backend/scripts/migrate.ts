import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import dotenv from 'dotenv';
import { pool } from '../src/config/database';

// Load environment variables
dotenv.config();

console.log('[Migration] DATABASE_URL:', process.env.DATABASE_URL);

async function runMigrations() {
  try {
    console.log('Starting database migrations...');
    
    // Read migration file - navigate from scripts/ to src/migrations/
    const migrationPath = join(__dirname, '../src/migrations/001_create_tasks_table.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    console.log('Running migration: 001_create_tasks_table.sql');
    
    // Execute migration
    await pool.query(migrationSQL);
    
    console.log('✓ Migration completed successfully');
    
    // Verify tasks table
    const result = await pool.query('SELECT COUNT(*) FROM tasks');
    console.log(`✓ Tasks table has ${result.rows[0].count} records`);
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
