"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mysql2_1 = __importDefault(require("mysql2"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// =========================
// MIDDLEWARE
// =========================
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// =========================
// AIVEN MYSQL CONNECTION
// =========================
const db = mysql2_1.default.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    ssl: {
        ca: fs_1.default.readFileSync(path_1.default.join(__dirname, "../ca.pem")),
        rejectUnauthorized: true
    }
});
// =========================
// CONNECT TO DATABASE
// =========================
db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
        return;
    }
    console.log("Aiven MySQL connected successfully!");
});
// =========================
// HOME
// =========================
app.get("/", (req, res) => {
    res.send("GroceryTrack TypeScript Backend is Running!");
});
// =========================
// GET CATEGORIES
// =========================
app.get("/api/categories", (req, res) => {
    const sql = `
        SELECT
            category_id,
            category_name
        FROM categories
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({
                message: "Database error"
            });
        }
        res.status(200).json(results);
    });
});
// =========================
// SEARCH PRODUCTS BY NAME
// =========================
app.get("/api/products/search", (req, res) => {
    const { name } = req.query;
    if (typeof name !== "string" ||
        !name.trim()) {
        return res.status(400).json({
            message: "Product name is required"
        });
    }
    const sql = `
        SELECT
            p.product_name AS name,
            c.category_name AS category,
            p.price,
            p.current_stock AS stock
        FROM products p
        JOIN categories c
            ON p.category_id = c.category_id
        WHERE p.product_name LIKE ?
    `;
    db.query(sql, [`%${name.trim()}%`], (err, results) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({
                message: "Database error"
            });
        }
        res.status(200).json(results);
    });
});
// =========================
// USER REGISTRATION
// =========================
app.post("/auth/register", async (req, res) => {
    try {
        const { name, email, username, password } = req.body;
        // Check required fields
        if (!name ||
            !email ||
            !username ||
            !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }
        // Check whether email or username exists
        const checkSql = `
            SELECT *
            FROM users
            WHERE email = ? OR username = ?
        `;
        db.query(checkSql, [email, username], async (err, results) => {
            if (err) {
                console.error("Database error:", err.message);
                return res.status(500).json({
                    message: "Database error"
                });
            }
            // User already exists
            if (results.length > 0) {
                return res.status(409).json({
                    message: "Email or username already exists"
                });
            }
            // Hash password
            const passwordHash = await bcrypt_1.default.hash(password, 10);
            // Insert user
            const insertSql = `
                    INSERT INTO users
                    (
                        name,
                        email,
                        username,
                        password_hash
                    )
                    VALUES (?, ?, ?, ?)
                `;
            db.query(insertSql, [
                name,
                email,
                username,
                passwordHash
            ], (err, result) => {
                if (err) {
                    console.error("Registration error:", err.message);
                    return res.status(500).json({
                        message: "Failed to register user"
                    });
                }
                res.status(201).json({
                    message: "User registered successfully",
                    userId: result.insertId
                });
            });
        });
    }
    catch (error) {
        console.error("Server error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});
// =========================
// USER LOGIN
// =========================
app.post("/auth/login", (req, res) => {
    const { username, password } = req.body;
    // Check required fields
    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }
    // Find user
    const sql = `
        SELECT *
        FROM users
        WHERE username = ?
    `;
    db.query(sql, [username], async (err, results) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({
                message: "Database error"
            });
        }
        // User not found
        if (results.length === 0) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }
        const user = results[0];
        // Compare password
        const passwordMatch = await bcrypt_1.default.compare(password, user.password_hash);
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
    });
});
// =========================
// START SERVER
// =========================
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
