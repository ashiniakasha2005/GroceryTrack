import dotenv from "dotenv";
dotenv.config();

import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

const requiredEnv = [
    "DB_HOST",
    "DB_USER",
    "DB_PASSWORD",
    "DB_NAME",
    "DB_SSL_CA"
] as const;

for (const key of requiredEnv) {
    if (!process.env[key]) {
        throw new Error(`Missing environment variable: ${key}`);
    }
}

const dbSslCa = process.env.DB_SSL_CA;
if (!dbSslCa) {
    throw new Error("DB_SSL_CA is missing in .env");
}

const sslCaPath = path.resolve(process.cwd(), dbSslCa);

if (!fs.existsSync(sslCaPath)) {
    throw new Error(`SSL certificate not found: ${sslCaPath}`);
}

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        ca: fs.readFileSync(sslCaPath)
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection()
    .then((connection) => {
        console.log("MySQL connected successfully");
        connection.release();
    })
    .catch((error: Error) => {
        console.error("MySQL connection failed:", error.message);
    });

export default pool;
