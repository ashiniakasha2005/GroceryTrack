import express from "express";
import db from "../db";

import { authenticateToken } from "../middleware/auth";

const router = express.Router();


// DASHBOARD
router.get("/", authenticateToken, async (req, res) => {

    try {

        const [todaySales] = await db.execute<any>(`
            SELECT
                COALESCE(SUM(total_amount), 0) AS today_sales
            FROM sales
            WHERE DATE(sale_date) = CURDATE()
        `);

        const [productCount] = await db.execute<any>(`
            SELECT COUNT(*) AS total_products
            FROM products
        `);

        const [salesCount] = await db.execute<any>(`
            SELECT COUNT(*) AS total_sales
            FROM sales
        `);

        const [lowStock] = await db.execute<any>(`
            SELECT COUNT(*) AS low_stock_products
            FROM products
            WHERE stock_quantity <= minimum_stock
        `);

        res.json({
            today_sales: todaySales[0].today_sales,
            total_products: productCount[0].total_products,
            total_sales: salesCount[0].total_sales,
            low_stock_products:
                lowStock[0].low_stock_products
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to load dashboard",
            error: error.message
        });
    }
});


export default router;