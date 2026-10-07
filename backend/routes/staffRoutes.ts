import express from "express";
import bcrypt from "bcryptjs";

import db from "../db";

import { authenticateToken, adminOnly } from "../middleware/auth";

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
                created_at
             FROM users
             WHERE role = 'staff'
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
             WHERE id = ?
             AND role = 'staff'`,
            [id]
        );

        if (staff.length === 0) {

            return res.status(404).json({
                message: "Staff not found"
            });
        }

        res.status(200).json(staff[0]);

    } catch (error) {

        console.error("Get one staff error:", error);

        res.status(500).json({
            message: "Failed to fetch staff",
            error: error.message
        });
    }
});


// =====================================================
// CREATE STAFF
// POST /api/staff
// =====================================================

router.post("/", authenticateToken, adminOnly, async (req, res) => {

    try {

        const {
            name,
            username,
            email,
            password
        } = req.body;


        // ---------------------------------------------
        // REQUIRED FIELD VALIDATION
        // ---------------------------------------------

        if (!name || !username || !email || !password) {

            return res.status(400).json({
                message: "Name, username, email and password are required"
            });
        }


        // ---------------------------------------------
        // USERNAME VALIDATION
        // 4 - 20 characters
        // ---------------------------------------------

        if (username.length < 4 || username.length > 20) {

            return res.status(400).json({
                message: "Username must be between 4 and 20 characters"
            });
        }


        // ---------------------------------------------
        // EMAIL VALIDATION
        // ---------------------------------------------

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {

            return res.status(400).json({
                message: "Invalid email format"
            });
        }


        // ---------------------------------------------
        // PASSWORD VALIDATION
        // Minimum 8 characters
        // Must contain at least one number
        // ---------------------------------------------

        if (
            password.length < 8 ||
            !/\d/.test(password)
        ) {

            return res.status(400).json({
                message:
                    "Password must be at least 8 characters and contain a number"
            });
        }


        // ---------------------------------------------
        // CHECK DUPLICATE USERNAME
        // ---------------------------------------------

        const [existingUsername] = await db.execute<any>(
            "SELECT id FROM users WHERE username = ?",
            [username]
        );

        if (existingUsername.length > 0) {

            return res.status(409).json({
                message: "Username already in use"
            });
        }


        // ---------------------------------------------
        // CHECK DUPLICATE EMAIL
        // ---------------------------------------------

        const [existingEmail] = await db.execute<any>(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingEmail.length > 0) {

            return res.status(409).json({
                message: "Email already in use"
            });
        }


        // ---------------------------------------------
        // HASH PASSWORD
        // ---------------------------------------------

        const passwordHash =
            await bcrypt.hash(password, 10);


        // ---------------------------------------------
        // INSERT STAFF
        //
        // IMPORTANT:
        // Database column = password_hash
        // ---------------------------------------------

        const [result] = await db.execute<any>(
            `INSERT INTO users
            (name, username, email, password_hash, role)
            VALUES (?, ?, ?, ?, 'staff')`,
            [
                name,
                username,
                email,
                passwordHash
            ]
        );


        // ---------------------------------------------
        // SUCCESS
        // ---------------------------------------------

        res.status(201).json({
            message: "Staff account created",
            staffId: result.insertId
        });


    } catch (error) {

        console.error("Create staff error:", error);

        // MySQL duplicate protection
        if (error.code === "ER_DUP_ENTRY") {

            return res.status(409).json({
                message: "Username or email already in use"
            });
        }

        res.status(500).json({
            message: "Failed to create staff",
            error: error.message
        });
    }
});


// =====================================================
// UPDATE STAFF
// PUT /api/staff/:id
// =====================================================

router.put("/:id", authenticateToken, adminOnly, async (req, res) => {

    try {

        const { id } = req.params;

        const {
            name,
            username,
            email,
            password
        } = req.body;


        // ---------------------------------------------
        // REQUIRED FIELD VALIDATION
        // ---------------------------------------------

        if (!name || !username || !email) {

            return res.status(400).json({
                message: "Name, username and email are required"
            });
        }


        // ---------------------------------------------
        // USERNAME VALIDATION
        // ---------------------------------------------

        if (username.length < 4 || username.length > 20) {

            return res.status(400).json({
                message: "Username must be between 4 and 20 characters"
            });
        }


        // ---------------------------------------------
        // EMAIL VALIDATION
        // ---------------------------------------------

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {

            return res.status(400).json({
                message: "Invalid email format"
            });
        }


        // ---------------------------------------------
        // CHECK STAFF EXISTS
        // ---------------------------------------------

        const [staff] = await db.execute<any>(
            `SELECT id
             FROM users
             WHERE id = ?
             AND role = 'staff'`,
            [id]
        );

        if (staff.length === 0) {

            return res.status(404).json({
                message: "Staff not found"
            });
        }


        // ---------------------------------------------
        // CHECK DUPLICATE USERNAME
        // Ignore current staff
        // ---------------------------------------------

        const [existingUsername] = await db.execute<any>(
            `SELECT id
             FROM users
             WHERE username = ?
             AND id != ?`,
            [
                username,
                id
            ]
        );

        if (existingUsername.length > 0) {

            return res.status(409).json({
                message: "Username already in use"
            });
        }


        // ---------------------------------------------
        // CHECK DUPLICATE EMAIL
        // Ignore current staff
        // ---------------------------------------------

        const [existingEmail] = await db.execute<any>(
            `SELECT id
             FROM users
             WHERE email = ?
             AND id != ?`,
            [
                email,
                id
            ]
        );

        if (existingEmail.length > 0) {

            return res.status(409).json({
                message: "Email already in use"
            });
        }


        // ---------------------------------------------
        // UPDATE WITH NEW PASSWORD
        // ---------------------------------------------

        if (password) {

            // Password validation
            if (
                password.length < 8 ||
                !/\d/.test(password)
            ) {

                return res.status(400).json({
                    message:
                        "Password must be at least 8 characters and contain a number"
                });
            }


            const passwordHash =
                await bcrypt.hash(password, 10);


            await db.execute<any>(
                `UPDATE users
                 SET name = ?,
                     username = ?,
                     email = ?,
                     password_hash = ?
                 WHERE id = ?
                 AND role = 'staff'`,
                [
                    name,
                    username,
                    email,
                    passwordHash,
                    id
                ]
            );

        }


        // ---------------------------------------------
        // UPDATE WITHOUT PASSWORD
        // ---------------------------------------------

        else {

            await db.execute<any>(
                `UPDATE users
                 SET name = ?,
                     username = ?,
                     email = ?
                 WHERE id = ?
                 AND role = 'staff'`,
                [
                    name,
                    username,
                    email,
                    id
                ]
            );
        }


        // ---------------------------------------------
        // SUCCESS
        // ---------------------------------------------

        res.status(200).json({
            message: "Staff updated successfully"
        });


    } catch (error) {

        console.error("Update staff error:", error);

        if (error.code === "ER_DUP_ENTRY") {

            return res.status(409).json({
                message: "Username or email already in use"
            });
        }

        res.status(500).json({
            message: "Failed to update staff",
            error: error.message
        });
    }
});


// =====================================================
// DELETE / DEACTIVATE STAFF
// DELETE /api/staff/:id
// =====================================================

router.delete("/:id", authenticateToken, adminOnly, async (req, res) => {

    try {

        const { id } = req.params;


        // ---------------------------------------------
        // CHECK STAFF EXISTS
        // ---------------------------------------------

        const [staff] = await db.execute<any>(
            `SELECT id
             FROM users
             WHERE id = ?
             AND role = 'staff'`,
            [id]
        );

        if (staff.length === 0) {

            return res.status(404).json({
                message: "Staff not found"
            });
        }


        // ---------------------------------------------
        // DELETE STAFF
        // ---------------------------------------------

        await db.execute<any>(
            `DELETE FROM users
             WHERE id = ?
             AND role = 'staff'`,
            [id]
        );


        res.status(200).json({
            message: "Staff deleted successfully"
        });


    } catch (error) {

        console.error("Delete staff error:", error);

        res.status(500).json({
            message: "Failed to delete staff",
            error: error.message
        });
    }
});


export default router;