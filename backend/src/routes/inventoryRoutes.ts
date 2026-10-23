import express from "express";
import db from "../config/db";

import { authenticateToken, adminOnly } from "../middleware/authMiddleware";

const router = express.Router();


// VIEW CURRENT INVENTORY
router.get("/", authenticateToken, async (req, res) => {

    try {

        const [inventory] = await db.execute<any>(`
            SELECT
                p.product_id AS id,
                p.product_name AS name,
                c.category_name AS category,
                p.current_stock AS stock_quantity,
                p.minimum_stock,
                p.price,
                CASE
                    WHEN p.current_stock <= p.minimum_stock
                    THEN 'LOW STOCK'
                    ELSE 'AVAILABLE'
                END AS stock_status
            FROM products p
            LEFT JOIN categories c
                ON p.category_id = c.category_id
            ORDER BY p.current_stock ASC
        `);

        res.json(inventory);

    } catch (error) {

        res.status(500).json({
            message: "Failed to get inventory",
            error: error.message
        });
    }
});


// UPDATE STOCK
router.put("/:id", authenticateToken, adminOnly, async (req, res) => {

    try {

        const { quantity } = req.body;

        if (quantity === undefined || quantity < 0) {
            return res.status(400).json({
                message: "Valid quantity is required"
            });
        }

        const [result] = await db.execute<any>(
            `UPDATE products
             SET current_stock = ?
             WHERE product_id = ?`,
            [
                quantity,
                req.params.id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            message: "Stock updated successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to update stock",
            error: error.message
        });
    }
});


// LOW STOCK PRODUCTS
router.get("/low-stock/list", authenticateToken, async (req, res) => {

    try {

        const [products] = await db.execute<any>(`
            SELECT
                p.product_id AS id,
                p.product_name AS name,
                p.current_stock AS stock_quantity,
                p.minimum_stock
            FROM products p
            WHERE p.current_stock <= p.minimum_stock
            ORDER BY p.current_stock ASC
        `);

        res.json(products);

    } catch (error) {

        res.status(500).json({
            message: "Failed to get low-stock products",
            error: error.message
        });
    }
});


export default router;