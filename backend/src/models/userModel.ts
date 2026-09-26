import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';

export interface User extends RowDataPacket {
  id: number;
  email: string;
  password_hash: string;
  role: string;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const [rows] = await pool.query<User[]>(
    'SELECT * FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  return rows.length > 0 ? rows[0]! : null;
}