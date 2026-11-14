import express from "express";
import db from "../config/db";

import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();


// SALES REPORT (completed sales only)
router.get("/sales", authenticateToken, async (req, res) => {

    try {

        const [report] = await db.execute<any>(`
            SELECT
                DATE(sale_date_time) AS sale_date,
                COUNT(*) AS total_transactions,
                SUM(total_amount) AS total_sales
            FROM sales
            WHERE status = 'completed'
            GROUP BY DATE(sale_date_time)
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
                p.product_id AS id,
                p.product_name AS name,
                c.category_name AS category,
                p.current_stock AS stock_quantity,
                p.minimum_stock,
                p.price,
                CASE
                    WHEN p.current_stock <= p.minimum_stock
                    THEN 'LOW STOCK'
                    ELSE 'OK'
                END AS status
            FROM products p
            LEFT JOIN categories c
                ON p.category_id = c.category_id
            ORDER BY p.current_stock ASC
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