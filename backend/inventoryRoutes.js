const express = require("express");
const db = require("../db");

const {
    authenticateToken,
    adminOnly
} = require("../middleware/auth");

const router = express.Router();


// VIEW CURRENT INVENTORY
router.get("/", authenticateToken, async (req, res) => {

    try {

        const [inventory] = await db.execute(`
            SELECT
                p.id,
                p.name,
                c.name AS category,
                p.stock_quantity,
                p.minimum_stock,
                p.price,
                CASE
                    WHEN p.stock_quantity <= p.minimum_stock
                    THEN 'LOW STOCK'
                    ELSE 'AVAILABLE'
                END AS stock_status
            FROM products p
            LEFT JOIN categories c
                ON p.category_id = c.id
            ORDER BY p.stock_quantity ASC
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

        const [result] = await db.execute(
            `UPDATE products
             SET stock_quantity = ?
             WHERE id = ?`,
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

        const [products] = await db.execute(`
            SELECT
                p.id,
                p.name,
                p.stock_quantity,
                p.minimum_stock
            FROM products p
            WHERE p.stock_quantity <= p.minimum_stock
            ORDER BY p.stock_quantity ASC
        `);

        res.json(products);

    } catch (error) {

        res.status(500).json({
            message: "Failed to get low-stock products",
            error: error.message
        });
    }
});


module.exports = router;