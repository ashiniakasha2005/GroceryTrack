import { pool } from "../config/db";

async function checkTables() {
    try {
        const [rows] = await pool.query("SHOW TABLES");
        console.log("Tables in database:", rows);

        // Handy: shows the real column names of the products table
        const [columns] = await pool.query("DESCRIBE products");
        console.log("products columns:", columns);
    } catch (error) {
        console.error("Database connection error:", error);
    } finally {
        process.exit(0);
    }
}

checkTables();
