require("dotenv").config();

const bcrypt = require("bcrypt");
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Aiven MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,

    ssl: {
        ca: fs.readFileSync(
            path.join(__dirname, "ca.pem")
        ),
        rejectUnauthorized: true
    }
});

// Connect to Aiven MySQL
db.connect((err) => {
    if (err) {
        console.error("MySQL connection failed:", err.message);
        return;
    }

    console.log("Aiven MySQL connected successfully!");
});


// =========================
// HOME
// =========================

app.get("/", (req, res) => {
    res.send("GroceryTrack Backend is Running!");
});


// =========================
// GET CATEGORIES
// =========================

app.get("/categories", (req, res) => {
    db.query("SELECT * FROM categories", (err, results) => {
        if (err) {
            console.error(err);

            return res.status(500).json({
                error: err.message
            });
        }

        res.json(results);
    });
});


// =========================
// GET PRODUCTS
// =========================

app.get("/products", (req, res) => {
    db.query("SELECT * FROM products", (err, results) => {
        if (err) {
            console.error(err);

            return res.status(500).json({
                error: err.message
            });
        }

        res.json(results);
    });
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


        // Check whether email or username already exists
        const checkSql = `
            SELECT *
            FROM users
            WHERE email = ? OR username = ?
        `;


        db.query(
            checkSql,
            [email, username],
            async (err, results) => {

                if (err) {

                    console.error(err);

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


                // Hash password using bcrypt
                const passwordHash = await bcrypt.hash(
                    password,
                    10
                );


                // Insert user into database
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


                db.query(
                    insertSql,
                    [
                        name,
                        email,
                        username,
                        passwordHash
                    ],
                    (err, result) => {

                        if (err) {

                            console.error(err);

                            return res.status(500).json({
                                message: "Failed to register user"
                            });

                        }


                        // Registration successful
                        res.status(201).json({
                            message: "User registered successfully",
                            userId: result.insertId
                        });

                    }
                );

            }
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });

    }

});


// =========================
// USER LOGIN
// =========================

app.post("/auth/login", (req, res) => {

    const {
        username,
        password
    } = req.body;


    // Check required fields
    if (!username || !password) {

        return res.status(400).json({
            message: "Username and password are required"
        });

    }


    // Find user by username
    const sql = `
        SELECT *
        FROM users
        WHERE username = ?
    `;


    db.query(
        sql,
        [username],
        async (err, results) => {

            if (err) {

                console.error(err);

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


            // Compare entered password
            // with bcrypt hashed password
            const passwordMatch = await bcrypt.compare(
                password,
                user.password_hash
            );


            // Password is incorrect
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

        }
    );

});


// =========================
// START SERVER
// =========================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );

});