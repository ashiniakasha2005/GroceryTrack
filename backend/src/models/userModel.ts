import { pool } from "../config/db";
import { RowDataPacket } from "mysql2";

export interface User extends RowDataPacket {
    id: number;
    name: string;
    email: string;
    username: string;
    password_hash: string;
    role: "admin" | "staff";
}

export async function findUserByIdentifier(identifier: string): Promise<User | null> {
    const [rows] = await pool.query<User[]>(
        "SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1",
        [identifier, identifier]
    );
    return rows.length > 0 ? rows[0] ?? null : null;
}
