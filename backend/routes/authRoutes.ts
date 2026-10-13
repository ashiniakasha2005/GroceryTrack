import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import db from "../db";

const router = express.Router();


// REGISTER
router.post("/register", async (req, res) => {

    try {

        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        const [existingUser] = await db.execute<any>(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userRole =
            role === "admin" ? "admin" : "staff";

        const [result] = await db.execute<any>(
            `INSERT INTO users
            (name, email, password_hash, role)
            VALUES (?, ?, ?, ?)`,
            [
                name,
                email,
                hashedPassword,
                userRole
            ]
        );

        res.status(201).json({
            message: "User registered successfully",
            userId: result.insertId
        });

    } catch (error) {

        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
});


// LOGIN
// LOGIN
router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const [users] = await db.execute<any>(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        // IMPORTANT:
        // Database column is password_hash
        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            return res.status(500).json({
                message: "JWT_SECRET is not configured"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            jwtSecret,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {

        console.error("Login error:", error);

        res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
});

export default router;