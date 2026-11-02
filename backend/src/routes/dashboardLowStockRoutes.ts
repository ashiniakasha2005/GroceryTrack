// src/routes/dashboardLowStockRoutes.ts
// US-011 task #86 - endpoint returning the current low-stock product count.
//
// Kept in its own file so it does not clash (in git) with the other dashboard
// endpoints that Winson, Prathikshan and Anjula are adding to dashboardRoutes.ts.
//
// Mount in src/app.ts (next to the other routes):
//     import dashboardLowStockRoutes from "./routes/dashboardLowStockRoutes";
//     app.use("/api/dashboard", dashboardLowStockRoutes);
//
// Needs migration 002 (products.is_low_stock). Low stock = current_stock <= minimum_stock.

import express from "express";
import db from "../config/db";
import { authenticateToken, adminOnly } from "../middleware/authMiddleware";

const router = express.Router();

// GET /api/dashboard/low-stock-count   (admin only)
router.get("/low-stock-count", authenticateToken, adminOnly, async (req, res) => {

    try {

        const [rows] = await db.execute<any>(`
            SELECT COUNT(*) AS low_stock_count
            FROM products
            WHERE is_low_stock = 1
        `);

        return res.status(200).json({
            low_stock_count: Number(rows[0].low_stock_count)
        });

    } catch (error: any) {

        console.error("Low-stock count error:", error);

        return res.status(500).json({
            message: "Failed to get low-stock count"
        });
    }
});

export default router;