import { Pool } from 'pg';

console.log('[Create Test DB] Creating test database...');

// Connect to default postgres database to create test database
const pool = new Pool({
  user: 'nmm',
  host: 'localhost',
  database: 'postgres', // Connect to default database
  port: 5432,
});

async function createTestDatabase() {
  try {
    // Check if database exists
    const checkResult = await pool.query(
      "SELECT 1 FROM pg_database WHERE datname = 'taskmanager_test'"
    );

    if (checkResult.rows.length > 0) {
      console.log('[Create Test DB] Database taskmanager_test already exists');
    } else {
      // Create the test database
      await pool.query('CREATE DATABASE taskmanager_test');
      console.log('[Create Test DB] ✅ Database taskmanager_test created successfully!');
    }
  } catch (error) {
    console.error('[Create Test DB] ❌ Error creating database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

createTestDatabase();
