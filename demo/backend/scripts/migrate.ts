import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import dotenv from 'dotenv';
import { pool } from '../src/config/database';

// Load environment variables
dotenv.config();

console.log('[Migration] DATABASE_URL:', process.env.DATABASE_URL);

async function runMigrations() {
  try {
    console.log('='.repeat(50));
    console.log('[Migration] Starting database migrations...');
    console.log('='.repeat(50));
    
    // Get migrations directory path
    const migrationsDir = join(__dirname, '../src/migrations');
    console.log(`[Migration] Migrations directory: ${migrationsDir}`);
    
    // Read all SQL files from migrations directory
    const files = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure migrations run in order (001, 002, etc.)
    
    console.log(`[Migration] Found ${files.length} migration files`);
    
    // Run each migration in order
    for (const file of files) {
      console.log(`\n[Migration] Running: ${file}`);
      
      const migrationPath = join(migrationsDir, file);
      const migrationSQL = readFileSync(migrationPath, 'utf-8');
      
      // Execute migration
      await pool.query(migrationSQL);
      
      console.log(`[Migration] ✓ ${file} completed successfully`);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('[Migration] All migrations completed successfully');
    console.log('='.repeat(50));
    
    // Verify tables exist
    console.log('\n[Migration] Verifying database tables...');
    
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('[Migration] Tables in database:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Count records in each table
    if (tablesResult.rows.some(row => row.table_name === 'tasks')) {
      const tasksCount = await pool.query('SELECT COUNT(*) FROM tasks');
      console.log(`[Migration] Tasks table: ${tasksCount.rows[0].count} records`);
    }
    
    if (tablesResult.rows.some(row => row.table_name === 'users')) {
      const usersCount = await pool.query('SELECT COUNT(*) FROM users');
      console.log(`[Migration] Users table: ${usersCount.rows[0].count} records`);
    }
    
    console.log('\n[Migration] Database is ready!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n[Migration] ❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
