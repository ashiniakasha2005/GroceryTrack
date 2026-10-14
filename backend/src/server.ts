import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql, {
    RowDataPacket,
    ResultSetHeader
} from "mysql2/promise";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();

// =========================
// MIDDLEWARE
// =========================

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "*"
    })
);
app.use(express.json());

// =========================
// AIVEN MYSQL CONNECTION POOL
// =========================

const caPath = process.env.DB_CA_PATH
    ? path.resolve(process.env.DB_CA_PATH)
    : path.join(__dirname, "../ca.pem");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    ssl: {
        ca: fs.readFileSync(caPath),
        rejectUnauthorized: true
    }
});

// Check database connection at startup
pool.query("SELECT 1")
    .then(() => {
        console.log("Aiven MySQL connected successfully!");
    })
    .catch((err: Error) => {
        console.error("Database connection failed:", err.message);
    });

// =========================
// HELPERS
// =========================

// Escape % and _ so user input is not treated as LIKE wildcards
const escapeLike = (text: string): string =>
    text.replace(/[\\%_]/g, "\\$&");

const isValidEmail = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// =========================
// HOME
// =========================

app.get("/", (req, res) => {
    res.send("GroceryTrack TypeScript Backend is Running!");
});

// =========================
// GET CATEGORIES  (US-005)
// =========================

app.get("/api/categories", async (req, res) => {

    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT
                category_id,
                category_name
             FROM categories
             ORDER BY category_name ASC`
        );

        res.status(200).json(rows);

    } catch (err: any) {
        console.error("Database error:", err.message);

        res.status(500).json({
            message: "Database error"
        });
    }
});

// =========================
// SEARCH PRODUCTS BY NAME  (US-006)
// Query params:
//   name         (required)  -> product name (partial match)
//   category_id  (optional)  -> filter by category
//   page         (optional)  -> default 1
//   limit        (optional)  -> default 20, max 100
// =========================

app.get("/api/products/search", async (req, res) => {

    const name =
        typeof req.query.name === "string"
            ? req.query.name.trim()
            : "";

    if (!name) {
        return res.status(400).json({
            message: "Product name is required"
        });
    }

    const categoryId = Number(req.query.category_id);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const offset = (page - 1) * limit;

    let sql = `
        SELECT
            p.product_id,
            p.product_name AS name,
            c.category_name AS category,
            p.price,
            p.current_stock AS stock
        FROM products p
        JOIN categories c
            ON p.category_id = c.category_id
        WHERE p.product_name LIKE ?
    `;

    const params: (string | number)[] = [
        `%${escapeLike(name)}%`
    ];

    if (Number.isInteger(categoryId) && categoryId > 0) {
        sql += " AND p.category_id = ?";
        params.push(categoryId);
    }

    sql += " ORDER BY p.product_name ASC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    try {
        const [rows] = await pool.query<RowDataPacket[]>(sql, params);

        res.status(200).json(rows);

    } catch (err: any) {
        console.error("Database error:", err.message);

        res.status(500).json({
            message: "Database error"
        });
    }
});

// =========================
// USER REGISTRATION
// =========================

app.post("/auth/register", async (req, res) => {

    try {

        const {
            name,
            email,
            username,
            password
        } = req.body;

        // Check required fields
        if (!name || !email || !username || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof username !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                message: "Invalid input"
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                message: "Invalid email format"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters"
            });
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanUsername = username.trim();

        // Check whether email or username exists
        const [existing] = await pool.query<RowDataPacket[]>(
            `SELECT id
             FROM users
             WHERE email = ? OR username = ?`,
            [cleanEmail, cleanUsername]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                message: "Email or username already exists"
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO users
                (name, email, username, password_hash)
             VALUES (?, ?, ?, ?)`,
            [name.trim(), cleanEmail, cleanUsername, passwordHash]
        );

        res.status(201).json({
            message: "User registered successfully",
            userId: result.insertId
        });

    } catch (err: any) {

        // Duplicate caught by UNIQUE index (race condition safety)
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Email or username already exists"
            });
        }

        console.error("Registration error:", err.message);

        res.status(500).json({
            message: "Failed to register user"
        });
    }
});

// =========================
// USER LOGIN
// =========================

app.post("/auth/login", async (req, res) => {

    try {

        const { username, password } = req.body;

        // Check required fields
        if (
            !username ||
            !password ||
            typeof username !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                message: "Username and password are required"
            });
        }

        // Find user
        const [results] = await pool.query<RowDataPacket[]>(
            `SELECT
                id,
                name,
                email,
                username,
                role,
                password_hash
             FROM users
             WHERE username = ?`,
            [username.trim()]
        );

        // User not found
        if (results.length === 0) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }

        const user = results[0];

        // Compare password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        // Wrong password
        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }

        // Login successful
        res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username,
                role: user.role
            }
        });

    } catch (err: any) {
        console.error("Login error:", err.message);

        res.status(500).json({
            message: "Server error"
        });
    }
});

// =========================
// START SERVER
// =========================

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});