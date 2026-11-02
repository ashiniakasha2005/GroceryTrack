// src/routes/saleCancelRoutes.ts
// US-008 / US-009 - cancel a completed sale and put its stock back.
//
// Kept in its own file (not inside salesRoutes.ts) so it does not clash with
// Prathikshan's sales-creation work in git.
//
// Mount in src/app.ts (one extra line, next to the existing sales routes):
//     import saleCancelRoutes from "./routes/saleCancelRoutes";
//     app.use("/api/sales", saleCancelRoutes);

import express from "express";
import db from "../config/db";
import { authenticateToken, adminOnly } from "../middleware/authMiddleware";
import { restoreStock, StockError } from "../services/stockService";

const router = express.Router();

// PUT /api/sales/:id/cancel   (admin only)
router.put("/:id/cancel", authenticateToken, adminOnly, async (req, res) => {

    const saleId = Number(req.params.id);

    if (!Number.isInteger(saleId) || saleId <= 0) {
        return res.status(400).json({
            message: "Invalid sale id"
        });
    }

    if (!req.user) {
        return res.status(401).json({
            message: "User not authenticated"
        });
    }

    const connection = await db.getConnection();

    try {

        await connection.beginTransaction();

        const result = await restoreStock(connection, saleId, req.user.id);

        await connection.commit();

        return res.status(200).json({
            message: "Sale cancelled and stock restored",
            sale_id: result.sale_id,
            restored_items: result.restored,
            stock_status: result.stock_status
        });

    } catch (error: any) {

        await connection.rollback();

        if (error instanceof StockError) {
            return res.status(error.status).json({
                message: error.message
            });
        }

        console.error("Cancel sale error:", error);

        return res.status(500).json({
            message: "Failed to cancel sale"
        });

    } finally {

        connection.release();
    }
});

export default router;