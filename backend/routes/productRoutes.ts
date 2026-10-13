import express from "express";
import db from "../db";

import { authenticateToken, adminOnly } from "../middleware/auth";

const router = express.Router();


// GET ALL PRODUCTS
router.get("/", authenticateToken, async (req, res) => {

    try {

        const [products] = await db.execute<any>(`
            SELECT
                p.id,
                p.name,
                p.category_id,
                c.name AS category,
                p.price,
                p.stock_quantity,
                p.minimum_stock,
                p.created_at
            FROM products p
            LEFT JOIN categories c
                ON p.category_id = c.id
            ORDER BY p.id DESC
        `);

        res.json(products);

    } catch (error) {

        res.status(500).json({
            message: "Failed to get products",
            error: error.message
        });
    }
});


// SEARCH PRODUCTS
router.get("/search/:name", authenticateToken, async (req, res) => {

    try {

        const search = `%${req.params.name}%`;

        const [products] = await db.execute<any>(`
            SELECT
                p.id,
                p.name,
                c.name AS category,
                p.price,
                p.stock_quantity,
                p.minimum_stock
            FROM products p
            LEFT JOIN categories c
                ON p.category_id = c.id
            WHERE p.name LIKE ?
        `, [search]);

        res.json(products);

    } catch (error) {

        res.status(500).json({
            message: "Search failed",
            error: error.message
        });
    }
});


// GET PRODUCT
router.get("/:id", authenticateToken, async (req, res) => {

    try {

        const [products] = await db.execute<any>(`
            SELECT
                p.*,
                c.name AS category
            FROM products p
            LEFT JOIN categories c
                ON p.category_id = c.id
            WHERE p.id = ?
        `, [req.params.id]);

        if (products.length === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json(products[0]);

    } catch (error) {

        res.status(500).json({
            message: "Failed to get product",
            error: error.message
        });
    }
});


// ADD PRODUCT
router.post("/", authenticateToken, async (req, res) => {

    try {

        const {
            name,
            category_id,
            price,
            stock_quantity,
            minimum_stock
        } = req.body;

        if (
            !name ||
            category_id === undefined ||
            price === undefined
        ) {
            return res.status(400).json({
                message: "Name, category_id and price are required"
            });
        }

        const [result] = await db.execute<any>(`
            INSERT INTO products
            (name, category_id, price, stock_quantity, minimum_stock)
            VALUES (?, ?, ?, ?, ?)
        `, [
            name,
            category_id,
            price,
            stock_quantity || 0,
            minimum_stock || 5
        ]);

        res.status(201).json({
            message: "Product created successfully",
            productId: result.insertId
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to create product",
            error: error.message
        });
    }
});


// UPDATE PRODUCT
router.put("/:id", authenticateToken, async (req, res) => {

    try {

        const {
            name,
            category_id,
            price,
            minimum_stock
        } = req.body;

        if (
            !name ||
            category_id === undefined ||
            price === undefined ||
            minimum_stock === undefined
        ) {
            return res.status(400).json({
                message:
                    "Name, category_id, price and minimum_stock are required"
            });
        }

        const [result] = await db.execute<any>(`
            UPDATE products
            SET
                name = ?,
                category_id = ?,
                price = ?,
                minimum_stock = ?
            WHERE id = ?
        `, [
            name,
            category_id,
            price,
            minimum_stock,
            req.params.id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            message: "Product updated successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to update product",
            error: error.message
        });
    }
});


// DELETE PRODUCT
router.delete("/:id", authenticateToken, async (req, res) => {

    try {

        const [result] = await db.execute<any>(
            "DELETE FROM products WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            message: "Product deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to delete product",
            error: error.message
        });
    }
});


export default router;