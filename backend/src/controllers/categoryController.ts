import { Request, Response } from "express";
import db from "../config/db";

// GET /api/categories
export const getCategories = async (req: Request, res: Response) => {
    try {
        const [categories] = await db.execute<any>(
            "SELECT category_id AS id, category_name AS name FROM categories WHERE is_active = 1 ORDER BY category_id DESC"
        );
        res.json(categories);
    } catch (error) {
        console.error("Get categories error:", error);
        res.status(500).json({
            message: "Failed to get categories",
            error: error.message
        });
    }
};

// GET /api/categories/:id
export const getCategoryById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id || id === 'undefined') {
            return res.status(400).json({ message: "Invalid Category ID" });
        }

        const [categories] = await db.execute<any>(
            "SELECT category_id AS id, category_name AS name FROM categories WHERE category_id = ? AND is_active = 1",
            [id]
        );

        if (categories.length === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.json(categories[0]);
    } catch (error) {
        console.error("Get category error:", error);
        res.status(500).json({
            message: "Failed to get category",
            error: error.message
        });
    }
};

// POST /api/categories
export const createCategory = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Category name is required" });
        }

        const [result] = await db.execute<any>(
            "INSERT INTO categories (category_name) VALUES (?)",
            [name]
        );

        res.status(201).json({
            message: "Category created successfully",
            categoryId: result.insertId
        });
    } catch (error) {
        console.error("Create category error:", error);
        res.status(500).json({
            message: "Failed to create category",
            error: error.message
        });
    }
};

// PUT /api/categories/:id
export const updateCategory = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Category name is required" });
        }

        const [result] = await db.execute<any>(
            "UPDATE categories SET category_name = ? WHERE category_id = ?",
            [name, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.json({ message: "Category updated successfully" });
    } catch (error) {
        console.error("Update category error:", error);
        res.status(500).json({
            message: "Failed to update category",
            error: error.message
        });
    }
};

// DELETE /api/categories/:id
export const deleteCategory = async (req: Request, res: Response) => {
    try {
        // Soft delete (is_active = 0)
        const [result] = await db.execute<any>(
            "UPDATE categories SET is_active = 0 WHERE category_id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.json({ message: "Category hidden successfully" });
    } catch (error) {
        console.error("Delete category error:", error);
        res.status(500).json({
            message: "Failed to hide category",
            error: error.message
        });
    }
};