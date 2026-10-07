import express from "express";
import db from "../db";

import { authenticateToken, adminOnly } from "../middleware/auth";

const router = express.Router();


// GET ALL CATEGORIES
router.get("/", authenticateToken, async (req, res) => {

    try {

        const [categories] = await db.execute<any>(
            "SELECT * FROM categories ORDER BY id DESC"
        );

        res.json(categories);

    } catch (error) {

        res.status(500).json({
            message: "Failed to get categories",
            error: error.message
        });
    }
});


// GET CATEGORY
router.get("/:id", authenticateToken, async (req, res) => {

    try {

        const [categories] = await db.execute<any>(
            "SELECT * FROM categories WHERE id = ?",
            [req.params.id]
        );

        if (categories.length === 0) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        res.json(categories[0]);

    } catch (error) {

        res.status(500).json({
            message: "Failed to get category",
            error: error.message
        });
    }
});


// ADD CATEGORY
router.post("/", authenticateToken, adminOnly, async (req, res) => {

    try {

        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        const [result] = await db.execute<any>(
            "INSERT INTO categories (name) VALUES (?)",
            [name]
        );

        res.status(201).json({
            message: "Category created successfully",
            categoryId: result.insertId
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to create category",
            error: error.message
        });
    }
});


// UPDATE CATEGORY
router.put("/:id", authenticateToken, adminOnly, async (req, res) => {

    try {

        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        const [result] = await db.execute<any>(
            "UPDATE categories SET name = ? WHERE id = ?",
            [name, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        res.json({
            message: "Category updated successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to update category",
            error: error.message
        });
    }
});


// DELETE CATEGORY
router.delete("/:id", authenticateToken, adminOnly, async (req, res) => {

    try {

        const [result] = await db.execute<any>(
            "DELETE FROM categories WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        res.json({
            message: "Category deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to delete category",
            error: error.message
        });
    }
});


export default router;