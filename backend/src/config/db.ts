import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Read SSL Certificate securely
const sslCaPath = process.env.DB_SSL_CA || './ca.pem';
const resolvedCaPath = path.resolve(__dirname, '../../', sslCaPath);
const sslCert = fs.existsSync(resolvedCaPath) 
  ? fs.readFileSync(resolvedCaPath) 
  : undefined;

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'grocerytrack',
  port: Number(process.env.DB_PORT) || 3306,
  ssl: sslCert ? { ca: sslCert, rejectUnauthorized: true } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
} as mysql.PoolOptions);