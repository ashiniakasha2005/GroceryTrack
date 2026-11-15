import express from "express";
import bcrypt from "bcryptjs";

import db from "../config/db";

import { authenticateToken, adminOnly } from "../middleware/authMiddleware";

const router = express.Router();


// =====================================================
// GET ALL STAFF
// GET /api/staff
// =====================================================

router.get("/", authenticateToken, adminOnly, async (req, res) => {
    try {
        const [staff] = await db.execute<any>(
            `SELECT
                id,
                name,
                username,
                email,
                role,
                is_active,
                created_at
             FROM users
             WHERE role = 'staff' OR role = 'admin'
             ORDER BY id DESC`
        );

        res.status(200).json(staff);
    } catch (error) {
        console.error("Get staff error:", error);
        res.status(500).json({
            message: "Failed to fetch staff",
            error: error.message
        });
    }
});


// =====================================================
// GET ONE STAFF
// GET /api/staff/:id
// =====================================================

router.get("/:id", authenticateToken, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;

        const [staff] = await db.execute<any>(
            `SELECT
                id,
                name,
                username,
                email,
                role,
                created_at
             FROM users
             WHERE id = ?`,
            [id]
        );

        if (staff.length === 0) {
            return res.status(404).json({
                message: "Account not found"
            });
        }

        res.status(200).json(staff[0]);
    } catch (error) {
        console.error("Get one staff error:", error);
        res.status(500).json({
            message: "Failed to fetch account",
            error: error.message
        });
    }
});


// =====================================================
// CREATE STAFF (OR ADMIN)
// POST /api/staff
// =====================================================

router.post("/", authenticateToken, adminOnly, async (req, res) => {
    try {
        const {
            name,
            username,
            email,
            password,
            role
        } = req.body;

        if (!name || !username || !email || !password) {
            return res.status(400).json({
                message: "Name, username, email and password are required"
            });
        }

        const normalizedRole = role === undefined ? "staff" : String(role).toLowerCase();

        if (normalizedRole !== "admin" && normalizedRole !== "staff") {
            return res.status(400).json({
                message: "Role must be either 'admin' or 'staff'"
            });
        }

        if (username.length < 4 || username.length > 20) {
            return res.status(400).json({
                message: "Username must be between 4 and 20 characters"
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Invalid email format"
            });
        }

        if (password.length < 8 || !/\d/.test(password)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters and contain a number"
            });
        }

        const [existingUsername] = await db.execute<any>(
            "SELECT id FROM users WHERE username = ?",
            [username]
        );
        if (existingUsername.length > 0) {
            return res.status(409).json({ message: "Username already in use" });
        }

        const [existingEmail] = await db.execute<any>(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );
        if (existingEmail.length > 0) {
            return res.status(409).json({ message: "Email already in use" });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const [result] = await db.execute<any>(
            `INSERT INTO users
            (name, username, email, password_hash, role)
            VALUES (?, ?, ?, ?, ?)`,
            [name, username, email, passwordHash, normalizedRole]
        );

        res.status(201).json({
            message: "Account created",
            staffId: result.insertId
        });
    } catch (error) {
        console.error("Create staff error:", error);
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Username or email already in use"
            });
        }
        res.status(500).json({
            message: "Failed to create account",
            error: error.message
        });
    }
});


// =====================================================
// UPDATE STAFF (OR ADMIN)
// PUT /api/staff/:id
// =====================================================

router.put("/:id", authenticateToken, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, username, email, password, role } = req.body;

        if (!name || !username || !email) {
            return res.status(400).json({
                message: "Name, username and email are required"
            });
        }

        const normalizedRole = role === undefined ? undefined : String(role).toLowerCase();

        if (normalizedRole !== undefined && normalizedRole !== "admin" && normalizedRole !== "staff") {
            return res.status(400).json({
                message: "Role must be either 'admin' or 'staff'"
            });
        }

        if (username.length < 4 || username.length > 20) {
            return res.status(400).json({
                message: "Username must be between 4 and 20 characters"
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Check exists (Removed AND role = 'staff')
        const [staff] = await db.execute<any>(
            `SELECT id FROM users WHERE id = ?`,
            [id]
        );

        if (staff.length === 0) {
            return res.status(404).json({ message: "Account not found" });
        }

        const [existingUsername] = await db.execute<any>(
            `SELECT id FROM users WHERE username = ? AND id != ?`,
            [username, id]
        );
        if (existingUsername.length > 0) {
            return res.status(409).json({ message: "Username already in use" });
        }

        const [existingEmail] = await db.execute<any>(
            `SELECT id FROM users WHERE email = ? AND id != ?`,
            [email, id]
        );
        if (existingEmail.length > 0) {
            return res.status(409).json({ message: "Email already in use" });
        }

        if (password) {
            if (password.length < 8 || !/\d/.test(password)) {
                return res.status(400).json({
                    message: "Password must be at least 8 characters and contain a number"
                });
            }

            const passwordHash = await bcrypt.hash(password, 10);

            await db.execute<any>(
                `UPDATE users
                 SET name = ?, username = ?, email = ?, password_hash = ?, role = COALESCE(?, role)
                 WHERE id = ?`,
                [name, username, email, passwordHash, normalizedRole ?? null, id]
            );
        } else {
            await db.execute<any>(
                `UPDATE users
                 SET name = ?, username = ?, email = ?, role = COALESCE(?, role)
                 WHERE id = ?`,
                [name, username, email, normalizedRole ?? null, id]
            );
        }

        res.status(200).json({ message: "Account updated successfully" });
    } catch (error) {
        console.error("Update staff error:", error);
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "Username or email already in use" });
        }
        res.status(500).json({ message: "Failed to update account", error: error.message });
    }
});


// =====================================================
// DELETE / DEACTIVATE STAFF (OR ADMIN)
// DELETE /api/staff/:id
// =====================================================

router.delete("/:id", authenticateToken, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;

        // Check exists (Removed AND role = 'staff')
        const [staff] = await db.execute<any>(
            `SELECT id FROM users WHERE id = ?`,
            [id]
        );

        if (staff.length === 0) {
            return res.status(404).json({ message: "Account not found" });
        }

        await db.execute<any>(
            `UPDATE users SET is_active = 0 WHERE id = ?`,
            [id]
        );

        res.status(200).json({ message: "Account deactivated successfully" });
    } catch (error) {
        console.error("Delete staff error:", error);
        res.status(500).json({ message: "Failed to deactivate account", error: error.message });
    }
});


// =====================================================
// ACTIVATE STAFF (OR ADMIN)
// PATCH /api/staff/:id/activate
// =====================================================

router.patch("/:id/activate", authenticateToken, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;

        // Removed AND role = 'staff'
        const [result] = await db.execute<any>(
            `UPDATE users SET is_active = 1 WHERE id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Account not found" });
        }

        res.status(200).json({ message: "Account activated successfully" });
    } catch (error) {
        console.error("Activate staff error:", error);
        res.status(500).json({ message: "Failed to activate account" });
    }
});

export default router;