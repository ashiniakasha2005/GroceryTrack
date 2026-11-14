import express from "express";
import db from "../config/db";
import { isNonNegativeInteger, isPositiveInteger } from "../utils/validators";

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



// UPDATE STOCK (SET EXACT QUANTITY)
router.put("/:id", authenticateToken, adminOnly, async (req, res) => {
    try {
        const { quantity } = req.body;
        const productId = Number(req.params.id);

        if (!Number.isSafeInteger(productId) || productId <= 0) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        if (!isNonNegativeInteger(quantity)) {
            return res.status(400).json({
                message: "Quantity must be a non-negative whole number"
            });
        }

        const [result] = await db.execute<any>(
            `UPDATE products
             SET current_stock = ?
             WHERE product_id = ?`,
            [quantity, productId]
        );

        if (result.affectedRows === 0) {
            // Check whether the product exists.
            const [existingProduct] = await db.execute<any>(
                `SELECT product_id
         FROM products
         WHERE product_id = ?`,
                [productId]
            );

            if (existingProduct.length === 0) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }
        }

        const [rows] = await db.execute<any>(
            `SELECT
                product_id,
                product_name,
                current_stock AS stock_quantity,
                minimum_stock,
                CASE
                    WHEN current_stock <= minimum_stock
                    THEN 'LOW STOCK'
                    ELSE 'AVAILABLE'
                END AS stock_status
             FROM products
             WHERE product_id = ?`,
            [productId]
        );

        return res.json({
            message: "Stock updated successfully",
            product: rows[0]
        });

    } catch (error: any) {
        return res.status(500).json({
            message: "Failed to update stock",
            error: error.message
        });
    }
});




// RESTOCK PRODUCT (ADD QUANTITY)
router.post("/:id/restock", authenticateToken, adminOnly, async (req, res) => {
    const productId = Number(req.params.id);
    const { quantity } = req.body;

    if (!Number.isSafeInteger(productId) || productId <= 0) {
        return res.status(400).json({
            message: "Invalid product ID"
        });
    }

    if (!isPositiveInteger(quantity)) {
        return res.status(400).json({
            message: "Restock quantity must be a whole number greater than 0"
        });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [result] = await connection.execute<any>(
            `UPDATE products
             SET current_stock = current_stock + ?
             WHERE product_id = ?`,
            [quantity, productId]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({
                message: "Product not found"
            });
        }

        await connection.execute<any>(
            `INSERT INTO stock_movements
             (product_id, change_qty, reason, user_id)
             VALUES (?, ?, 'RESTOCK', ?)`,
            [productId, quantity, req.user?.id ?? null]
        );

        const [rows] = await connection.execute<any>(
            `SELECT
                product_id,
                product_name,
                current_stock AS stock_quantity,
                minimum_stock,
                CASE
                    WHEN current_stock <= minimum_stock
                    THEN 'LOW STOCK'
                    ELSE 'AVAILABLE'
                END AS stock_status
             FROM products
             WHERE product_id = ?`,
            [productId]
        );

        await connection.commit();

        return res.json({
            message: "Stock restocked successfully",
            product: rows[0]
        });

    } catch (error: any) {
        await connection.rollback();

        return res.status(500).json({
            message: "Failed to restock product",
            error: error.message
        });

    } finally {
        connection.release();
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