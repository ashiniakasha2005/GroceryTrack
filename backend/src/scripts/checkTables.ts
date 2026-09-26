import { pool } from '../config/db';

async function checkTables() {
  try {
    const [rows] = await pool.query('SHOW TABLES');
    console.log('Tables in database:', rows);
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    process.exit(0);
  }
}

checkTables();