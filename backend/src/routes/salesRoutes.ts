
import express from "express";
import db from "../config/db";

import {
    authenticateToken,
    adminOnly
} from "../middleware/authMiddleware";

import { ResultSetHeader, RowDataPacket } from "mysql2";
import type { PoolConnection } from "mysql2/promise";

const router = express.Router();

// DATABASE PRODUCT TYPE
interface ProductRow extends RowDataPacket {
    product_id: number;
    product_name: string;
    price: string | number;
    current_stock: number;
    minimum_stock: number;
}

// SALE ITEM TYPE
interface SaleItem {
    product_id: number;
    quantity: number;
    unit_price: number;
    subtotal: number;
    updated_stock: number;
    minimum_stock: number;
    low_stock: boolean;
}

// =========================
// CREATE SALE
// =========================

router.post("/", authenticateToken, async (req, res) => {

    if (!req.user) {
        return res.status(401).json({
            message: "User not authenticated"
        });
    }

    let connection: PoolConnection | undefined;
    let transactionStarted = false;

    try {
        const { items } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "Sale items are required"
            });
        }

        const productQuantities = new Map<number, number>();

        for (const item of items) {

            if (
                !item ||
                !Number.isInteger(Number(item.product_id)) ||
                !Number.isInteger(Number(item.quantity)) ||
                Number(item.product_id) <= 0 ||
                Number(item.quantity) <= 0
            ) {
                return res.status(400).json({
                    message: "product_id and valid quantity are required"
                });
            }

            const productId = Number(item.product_id);
            const quantity = Number(item.quantity);

            productQuantities.set(
                productId,
                (productQuantities.get(productId) || 0) + quantity
            );
        }

        connection = await db.getConnection();

        await connection.beginTransaction();
        transactionStarted = true;

        let totalAmountCents = 0;

        const saleItems: SaleItem[] = [];

        const sortedProducts = [...productQuantities.entries()]
            .sort((a, b) => a[0] - b[0]);

        for (const [productId, quantity] of sortedProducts) {

            const [products] = await connection.execute<ProductRow[]>(
                `SELECT
                    product_id,
                    product_name,
                    price,
                    current_stock,
                    minimum_stock
                 FROM products
                 WHERE product_id = ?
                 FOR UPDATE`,
                [productId]
            );

            if (products.length === 0) {
                await connection.rollback();
                transactionStarted = false;

                return res.status(404).json({
                    message: `Product ${productId} not found`
                });
            }

            const product = products[0];
            const availableStock = Number(product.current_stock);

            if (product.current_stock < quantity) {
                await connection.rollback();
                transactionStarted = false;

                return res.status(400).json({
                    message: `Insufficient stock for ${product.product_name}`,
                    available_stock: product.current_stock,
                    requested_quantity: quantity
                });
            }

            const unitPriceCents = Math.round(
                Number(product.price) * 100
            );

            if (!Number.isFinite(unitPriceCents) || unitPriceCents < 0) {
                throw new Error("Invalid product price");
            }

            const subtotalCents = unitPriceCents * quantity;

            totalAmountCents += subtotalCents;

            // BE-14 and BE-15: Calculate updated stock
            const updatedStock = product.current_stock - quantity;
            const minimumStock = Number(product.minimum_stock);

            saleItems.push({
                product_id: product.product_id,
                quantity,
                unit_price: unitPriceCents / 100,
                subtotal: subtotalCents / 100,
                updated_stock: updatedStock,
                minimum_stock: minimumStock,
                low_stock: updatedStock <= minimumStock
            });
        }

        const totalAmount = totalAmountCents / 100;

        const [saleResult] = await connection.execute<ResultSetHeader>(
            `INSERT INTO sales
             (user_id, total_amount, status)
             VALUES (?, ?, 'completed')`,
            [req.user.id, totalAmount]
        );

        const saleId = saleResult.insertId;

        for (const item of saleItems) {
            // Record sale item
            await connection.execute(
                `INSERT INTO sale_items
                    (sale_id, product_id, quantity, unit_price, subtotal)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    saleId,
                    item.product_id,
                    item.quantity,
                    item.unit_price,
                    item.subtotal
                ]
            );

            const [updateResult] = await connection.execute<ResultSetHeader>(
                `UPDATE products
                 SET current_stock = current_stock - ?
                 WHERE product_id = ?
                 AND current_stock >= ?`,
                [
                    item.quantity,
                    item.product_id,
                    item.quantity
                ]
            );

            if (updateResult.affectedRows !== 1) {
                throw new Error(
                    `Stock update failed for product ${item.product_id}`
                );
            }

            await connection.execute<ResultSetHeader>(
                `INSERT INTO stock_movements
                 (product_id, change_qty, reason, sale_id, user_id)
                 VALUES (?, ?, 'SALE', ?, ?)`,
                [
                    item.product_id,
                    -item.quantity,
                    saleId,
                    req.user.id
                ]
            );
        }

        // Commit all changes together
        await connection.commit();
        transactionStarted = false;

        return res.status(201).json({
            message: "Sale completed successfully",
            sale_id: saleId,
            user_id: req.user.id,
            total_amount: totalAmount.toFixed(2),

            // BE-15: Return updated stock information
            items: saleItems,

            // BE-14: Return products that reached low stock
            low_stock_products: saleItems
                .filter(item => item.low_stock)
                .map(item => ({
                    product_id: item.product_id,
                    updated_stock: item.updated_stock,
                    minimum_stock: item.minimum_stock
                }))
        });

    } catch (error: unknown) {

        if (connection && transactionStarted) {
            await connection.rollback();
        }

        console.error("Sale creation error:", error);

        return res.status(500).json({
            message: "Sale failed"
        });

    } finally {

        connection?.release();
    }
});


// =========================
// GET ALL SALES
// =========================

router.get("/", authenticateToken, async (req, res) => {
    try {

        const [sales] = await db.execute<RowDataPacket[]>(`
            SELECT
                s.sale_id,
                s.user_id,
                s.sale_date_time,
                s.total_amount,
                s.status,
                u.name AS sold_by
             FROM sales s
             LEFT JOIN users u
                ON s.user_id = u.id
            ORDER BY s.sale_id DESC
        `);

        return res.status(200).json(sales);

    } catch (error: unknown) {

        console.error("Get sales error:", error);

        return res.status(500).json({
            message: "Failed to get sales"
        });
    }
});


// =========================
// GET SINGLE SALE
// =========================

router.get("/:id", authenticateToken, async (req, res) => {
    try {
        const saleId = Number(req.params.id);

if (!Number.isSafeInteger(saleId) || saleId <= 0) {
    return res.status(400).json({
        message: "Invalid sale ID"
    });
}

        const [sales] = await db.execute<RowDataPacket[]>(`
            SELECT
                s.sale_id,
                s.user_id,
                s.sale_date_time,
                s.total_amount,
                s.status,
                u.name AS sold_by
             FROM sales s
             LEFT JOIN users u
                ON s.user_id = u.id
            WHERE s.sale_id = ?
        `, [saleId]);

        if (sales.length === 0) {
            return res.status(404).json({
                message: "Sale not found"
            });
        }

        const [items] = await db.execute<RowDataPacket[]>(`
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

        return res.status(200).json({
            sale: sales[0],
            items
        });

    } catch (error: unknown) {

        console.error("Get single sale error:", error);

        return res.status(500).json({
            message: "Failed to get sale"
        });
    }
});


// =========================
// CANCEL SALE (ADMIN ONLY)
// =========================

router.put("/:id/cancel", authenticateToken, adminOnly, async (req, res) => {

    let connection: PoolConnection | undefined;
    let transactionStarted = false;

    try {

        const saleId = Number(req.params.id);

        if (!Number.isInteger(saleId) || saleId <= 0) {
            return res.status(400).json({
                message: "Invalid sale ID"
            });
        }

        if (!req.user) {
            return res.status(401).json({
                message: "User not authenticated"
            });
        }

        connection = await db.getConnection();

        await connection.beginTransaction();
        transactionStarted = true;

        // LOCK SALE RECORD
        const [sales] = await connection.execute<RowDataPacket[]>(
            `SELECT sale_id, user_id, status
             FROM sales
             WHERE sale_id = ?
             FOR UPDATE`,
            [saleId]
        );

        if (sales.length === 0) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(404).json({
                message: "Sale not found"
            });
        }

        const sale = sales[0];

        if (sale.status === "cancelled") {
            await connection.rollback();
            transactionStarted = false;

            return res.status(400).json({
                message: "Sale is already cancelled"
            });
        }

        // GET ORIGINAL SALE ITEMS
        const [items] = await connection.execute<RowDataPacket[]>(
            `SELECT product_id, quantity
             FROM sale_items
             WHERE sale_id = ?`,
            [saleId]
        );

        if (items.length === 0) {
            throw new Error("No sale items found");
        }

        // RESTORE STOCK AND RECORD CANCEL MOVEMENTS
        const sortedItems = [...items].sort(
            (a, b) => Number(a.product_id) - Number(b.product_id)
        );

        for (const item of sortedItems) {

            const productId = Number(item.product_id);
            const quantity = Number(item.quantity);

            const [products] = await connection.execute<ProductRow[]>(
                `SELECT product_id
                 FROM products
                 WHERE product_id = ?
                 FOR UPDATE`,
                [productId]
            );

            if (products.length === 0) {
                throw new Error(`Product ${productId} not found`);
            }

            await connection.execute<ResultSetHeader>(
                `UPDATE products
                 SET current_stock = current_stock + ?
                 WHERE product_id = ?`,
                [quantity, productId]
            );

            await connection.execute<ResultSetHeader>(
                `INSERT INTO stock_movements
                 (product_id, change_qty, reason, sale_id, user_id)
                 VALUES (?, ?, 'CANCEL', ?, ?)`,
                [
                    productId,
                    quantity,
                    saleId,
                    req.user.id
                ]
            );
        }

        // UPDATE SALE STATUS
        await connection.execute<ResultSetHeader>(
            `UPDATE sales
             SET status = 'cancelled',
                 cancelled_at = CURRENT_TIMESTAMP,
                 cancelled_by = ?
             WHERE sale_id = ?`,
            [req.user.id, saleId]
        );

        await connection.commit();
        transactionStarted = false;

        return res.status(200).json({
            message: "Sale cancelled successfully",
            sale_id: saleId,
            cancelled_by: req.user.id,
            restored_items: items.length
        });

    } catch (error: unknown) {

        if (connection && transactionStarted) {
            await connection.rollback();
        }

        console.error("Cancel sale error:", error);

        return res.status(500).json({
            message: "Failed to cancel sale"
        });

    } finally {

        connection?.release();
    }
});

export default router;
