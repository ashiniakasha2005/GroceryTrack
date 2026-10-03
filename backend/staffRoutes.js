const express = require("express");
const bcrypt = require("bcryptjs");

const db = require("../db");

const {
    authenticateToken,
    adminOnly
} = require("../middleware/auth");

const router = express.Router();


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


        // Validation
        if (!name || !username || !email || !password) {

            return res.status(400).json({
                message: "Name, username, email and password are required"
            });

        }


        // Check duplicate username
        const [existingUsername] = await db.execute(
            "SELECT id FROM users WHERE username = ?",
            [username]
        );


        if (existingUsername.length > 0) {

            return res.status(409).json({
                message: "Username already exists"
            });

        }


        // Check duplicate email
        const [existingEmail] = await db.execute(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );


        if (existingEmail.length > 0) {

            return res.status(409).json({
                message: "Email already exists"
            });

        }


        // Hash password
        const hashedPassword = await bcrypt.hash(
            password,
            10
        );


        // Force role = staff
        const [result] = await db.execute(

            `INSERT INTO users
            (name, username, email, password, role)
            VALUES (?, ?, ?, ?, 'staff')`,

            [
                name,
                username,
                email,
                hashedPassword
            ]

        );


        res.status(201).json({

            message: "Staff created successfully",

            staffId: result.insertId

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Failed to create staff",

            error: error.message

        });

    }

});


// =====================================================
// GET ALL STAFF
// GET /api/staff
// =====================================================

router.get("/", authenticateToken, adminOnly, async (req, res) => {

    try {

        const [staff] = await db.execute(

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

        console.error(error);

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


        const [staff] = await db.execute(

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

        console.error(error);

        res.status(500).json({

            message: "Failed to fetch staff",

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


        // Validation
        if (!name || !username || !email) {

            return res.status(400).json({

                message: "Name, username and email are required"

            });

        }


        // Check staff exists
        const [staff] = await db.execute(

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


        // Check duplicate username
        const [existingUsername] = await db.execute(

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

                message: "Username already exists"

            });

        }


        // Check duplicate email
        const [existingEmail] = await db.execute(

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

                message: "Email already exists"

            });

        }


        // Update with password
        if (password) {

            const hashedPassword =
                await bcrypt.hash(password, 10);


            await db.execute(

                `UPDATE users
                 SET name = ?,
                     username = ?,
                     email = ?,
                     password = ?
                 WHERE id = ?
                 AND role = 'staff'`,

                [
                    name,
                    username,
                    email,
                    hashedPassword,
                    id
                ]

            );

        }

        // Update without password
        else {

            await db.execute(

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


        res.status(200).json({

            message: "Staff updated successfully"

        });


    } catch (error) {

        console.error(error);

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


        // Check staff exists
        const [staff] = await db.execute(

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


        // Delete staff
        await db.execute(

            `DELETE FROM users
             WHERE id = ?
             AND role = 'staff'`,

            [id]

        );


        res.status(200).json({

            message: "Staff deleted successfully"

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Failed to delete staff",

            error: error.message

        });

    }

});


module.exports = router;