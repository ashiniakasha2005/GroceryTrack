
import bcrypt from 'bcrypt';
import { pool } from '../config/db';

async function createStaffTestUser() {
  const name = 'Staff Test User';
  const email = 'staff.test@grocerytrack.local';
  const username = 'stafftest';
  const plainPassword = 'StaffTest@12345';

  try {
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    await pool.query(
      `INSERT INTO users
       (name, email, username, password_hash, role)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, username, passwordHash, 'staff']
    );

    console.log('Staff test account created successfully.');
    console.log('Email:', email);
    console.log('Username:', username);
    console.log('Password:', plainPassword);
  } catch (error) {
    console.error('Could not create Staff test account:', error);
  } finally {
    await pool.end();
  }
}

createStaffTestUser();
