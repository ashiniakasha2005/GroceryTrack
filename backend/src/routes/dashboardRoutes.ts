import express from "express";
import db from "../config/db";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

// DASHBOARD (US-011)
router.get("/", authenticateToken, async (req, res) => {
    try {
        // BE-01: Today's total sales amount (Only completed sales)
        const [todaySales] = await db.execute<any>(`
            SELECT 
                COALESCE(SUM(total_amount), 0) AS today_sales
            FROM sales
            WHERE DATE(sale_date_time) = CURDATE()
              AND status = 'completed'
        `);

        // Total number of products (FR-DASH-02)
        const [productCount] = await db.execute<any>(`
            SELECT COUNT(*) AS total_products
            FROM products
        `);

        // BE-02: Total recorded sales transactions (Only completed sales)
        const [salesCount] = await db.execute<any>(`
            SELECT COUNT(*) AS total_sales
            FROM sales
            WHERE status = 'completed'
        `);
        const [lowStock] = await db.execute<any>(`
            SELECT COUNT(*) AS low_stock_products
            FROM products
            WHERE current_stock <= minimum_stock
        `);

        res.json({
            today_sales: todaySales[0].today_sales,
            total_products: productCount[0].total_products,
            total_sales: salesCount[0].total_sales,
            low_stock_products: lowStock[0].low_stock_products
        });

    } catch (error: any) {
        console.error("Dashboard error:", error);
        res.status(500).json({
            message: "Failed to load dashboard",
            error: error.message
        });
    }
});


export default router;