// src/routes/salesRoutes.ts
// Sales create / list / detail, wired to stockService (US-008, US-009).
//
// Uses the REAL database column names:
//   products(product_id, product_name, price, current_stock, minimum_stock)
//   sales(sale_id, user_id, sale_date_time, total_amount, status, ...)
//   sale_items(sale_item_id, sale_id, product_id, quantity, unit_price, subtotal)
//
// NOTE: the users table was not checked yet. The joins below use users.id
// (as in the old code). Run `DESCRIBE users;` - if the primary key is
// `user_id`, change `u.id` to `u.user_id` in the two queries marked CHECK.

import express from "express";
import db from "../config/db";

import { authenticateToken } from "../middleware/authMiddleware";
import {
    deductStock,
    logSaleMovements,
    StockError
} from "../services/stockService";

const router = express.Router();


// CREATE SALE
// POST /api/sales
// body: { "items": [ { "product_id": 1, "quantity": 2 }, ... ] }
router.post("/", authenticateToken, async (req, res) => {

    if (!req.user) {
        return res.status(401).json({
            message: "User not authenticated"
        });
    }

    const connection = await db.getConnection();

    try {

        await connection.beginTransaction();

        // 1) Validate items, lock products, check stock, reduce stock,
        //    read prices from the DB (never trust prices sent by the client)
        const { lines, totalAmount, lowStock } =
            await deductStock(connection, req.body.items);

        // 2) Save the sale
        const [saleResult] = await connection.execute<any>(
            `INSERT INTO sales
             (user_id, total_amount)
             VALUES (?, ?)`,
            [
                req.user.id,
                totalAmount
            ]
        );

        const saleId = saleResult.insertId;

        // 3) Save the sale items
        for (const line of lines) {

            await connection.execute<any>(
                `INSERT INTO sale_items
                 (sale_id, product_id, quantity, unit_price, subtotal)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    saleId,
                    line.product_id,
                    line.quantity,
                    line.unit_price,
                    line.subtotal
                ]
            );
        }

        // 4) Log the stock movements (audit trail)
        await logSaleMovements(connection, saleId, lines, req.user.id);

        await connection.commit();

        return res.status(201).json({
            message: "Sale completed successfully",
            sale_id: saleId,
            total_amount: totalAmount,
            items: lines,
            low_stock: lowStock
        });

    } catch (error: any) {

        await connection.rollback();

        if (error instanceof StockError) {
            return res.status(error.status).json({
                message: error.message
            });
        }

        console.error("Sale error:", error);

        return res.status(500).json({
            message: "Sale failed"
        });

    } finally {

        connection.release();
    }
});


// GET ALL SALES
// GET /api/sales
router.get("/", authenticateToken, async (req, res) => {

    try {

        const [sales] = await db.execute<any>(`
            SELECT
                s.sale_id,
                s.total_amount,
                s.sale_date_time,
                s.status,
                u.name AS sold_by
            FROM sales s
            LEFT JOIN users u
                ON s.user_id = u.id          -- CHECK: users primary key name
            ORDER BY s.sale_id DESC
        `);

        res.json(sales);

    } catch (error: any) {

        console.error("Get sales error:", error);

        res.status(500).json({
            message: "Failed to get sales"
        });
    }
});


// GET SINGLE SALE
// GET /api/sales/:id
router.get("/:id", authenticateToken, async (req, res) => {

    try {

        const saleId = Number(req.params.id);

        if (!Number.isInteger(saleId) || saleId <= 0) {
            return res.status(400).json({
                message: "Invalid sale id"
            });
        }

        const [sales] = await db.execute<any>(`
            SELECT
                s.sale_id,
                s.total_amount,
                s.sale_date_time,
                s.status,
                u.name AS sold_by
            FROM sales s
            LEFT JOIN users u
                ON s.user_id = u.id          -- CHECK: users primary key name
            WHERE s.sale_id = ?
        `, [saleId]);

        if (sales.length === 0) {
            return res.status(404).json({
                message: "Sale not found"
            });
        }

        const [items] = await db.execute<any>(`
            SELECT
                si.product_id,
                p.product_name,
                si.quantity,
                si.unit_price,
                si.subtotal
            FROM sale_items si
            JOIN products p
                ON si.product_id = p.product_id
            WHERE si.sale_id = ?
        `, [saleId]);

        res.json({
            sale: sales[0],
            items
        });

    } catch (error: any) {

        console.error("Get sale error:", error);

        res.status(500).json({
            message: "Failed to get sale"
        });
    }
});


export default router;