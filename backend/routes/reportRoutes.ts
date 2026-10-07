import express from "express";
import db from "../db";

import { authenticateToken } from "../middleware/auth";

const router = express.Router();


// SALES REPORT
router.get("/sales", authenticateToken, async (req, res) => {

    try {

        const [report] = await db.execute<any>(`
            SELECT
                DATE(sale_date) AS sale_date,
                COUNT(*) AS total_transactions,
                SUM(total_amount) AS total_sales
            FROM sales
            GROUP BY DATE(sale_date)
            ORDER BY sale_date DESC
        `);

        res.json(report);

    } catch (error) {

        res.status(500).json({
            message: "Failed to generate sales report",
            error: error.message
        });
    }
});


// INVENTORY REPORT
router.get("/inventory", authenticateToken, async (req, res) => {

    try {

        const [report] = await db.execute<any>(`
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
                    ELSE 'OK'
                END AS status
            FROM products p
            LEFT JOIN categories c
                ON p.category_id = c.id
            ORDER BY p.stock_quantity ASC
        `);

        res.json(report);

    } catch (error) {

        res.status(500).json({
            message: "Failed to generate inventory report",
            error: error.message
        });
    }
});


export default router;