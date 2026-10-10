import bcrypt from 'bcrypt';
import { RowDataPacket } from 'mysql2';
import { pool } from '../config/db';

const accounts = [
  { name: 'Admin User', email: 'admin@example.com', username: 'admin1', password: 'admin123', role: 'admin' },
  { name: 'Staff User', email: 'staff@example.com', username: 'staff1', password: 'staff123', role: 'staff' },
];

async function main() {
  for (const a of accounts) {
    const hash = await bcrypt.hash(a.password, 10);
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE username = ? LIMIT 1',
      [a.username]
    );

    if (rows.length > 0) {
      await pool.query(
        'UPDATE users SET password_hash = ?, role = ? WHERE id = ?',
        [hash, a.role, rows[0]!.id]
      );
      console.log(`updated ${a.username} (${a.role})`);
    } else {
      await pool.query(
        'INSERT INTO users (name, email, username, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        [a.name, a.email, a.username, hash, a.role]
      );
      console.log(`created ${a.username} (${a.role})`);
    }
  }

  const [users] = await pool.query('SELECT id, username, email, role FROM users');
  console.table(users);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});