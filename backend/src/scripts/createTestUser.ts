import bcrypt from 'bcrypt';
import { pool } from '../config/db';

async function createTestUser() {
  const name = 'Test User';
  const email = 'test@example.com';
  const username = 'testuser';
  const plainPassword = 'password123';
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  await pool.query(
    'INSERT INTO users (name, email, username, password_hash) VALUES (?, ?, ?, ?)',
    [name, email, username, passwordHash]
  );

  console.log('Test user created:');
  console.log('Email:', email);
  console.log('Username:', username);
  console.log('Password:', plainPassword);
  process.exit(0);
}

createTestUser().catch((err) => {
  console.error(err);
  process.exit(1);
});