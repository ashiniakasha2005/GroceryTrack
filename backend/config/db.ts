
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const sslCaPath = process.env.DB_SSL_CA || './ca.pem';

const sslCert = fs.existsSync(sslCaPath)
  ? fs.readFileSync(path.resolve(sslCaPath))
  : undefined;

const poolOptions: mysql.PoolOptions = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'grocerytrack',
  port: Number(process.env.DB_PORT) || 3306,

  ...(sslCert
    ? {
        ssl: {
          ca: sslCert,
          rejectUnauthorized: true,
        },
      }
    : {}),

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

export const pool = mysql.createPool(poolOptions);
