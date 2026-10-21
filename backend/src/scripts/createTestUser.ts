import bcrypt from 'bcrypt';
import { pool } from '../config/db';

async function createTestAdmin() {
  const name = 'Admin User';
  const email = 'admin.test@example.com';
  const username = 'admintest';
  const plainPassword = 'password123';
  const role = 'admin';
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  await pool.query(
    'INSERT INTO users (name, email, username, password_hash, role) VALUES (?, ?, ?, ?, ?)',
    [name, email, username, passwordHash, role]
  );

  console.log('✅ Admin user created successfully:');
  console.log('Email:', email);
  console.log('Username:', username);
  console.log('Password:', plainPassword);
  console.log('Role:', role);
  process.exit(0);
}

createTestAdmin().catch((err) => {
  console.error('❌ Error creating admin user:', err);
  process.exit(1);
});