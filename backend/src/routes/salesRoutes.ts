
import express from "express";
import db from "../config/db";
import type { PoolConnection } from "mysql2/promise";
import { authenticateToken } from "../middleware/authMiddleware";

interface SaleItem {
    product_id: number;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

const router = express.Router();

// CREATE SALE
router.post("/", authenticateToken, async (req, res) => {
    let connection: PoolConnection | undefined;

    try {
        const { items } = req.body;

        // Validate sale items
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "Sale items are required"
            });
        }

        // Validate authenticated user
        if (!req.user) {
            return res.status(401).json({
                message: "User not authenticated"
            });
        }

        // Validate and combine duplicate product IDs
        const requestedQuantities = new Map<number, number>();

        for (const item of items) {
            const productId = Number(item?.product_id);
            const quantity = Number(item?.quantity);

            if (
                !Number.isSafeInteger(productId) ||
                productId <= 0 ||
                !Number.isSafeInteger(quantity) ||
                quantity <= 0
            ) {
                return res.status(400).json({
                    message:
                        "Valid product_id and positive integer quantity are required"
                });
            }

            requestedQuantities.set(
                productId,
                (requestedQuantities.get(productId) || 0) + quantity
            );
        }

        // Sort product IDs to maintain consistent locking order
        const productIds = Array.from(requestedQuantities.keys()).sort(
            (a, b) => a - b
        );

        connection = await db.getConnection();

        await connection.beginTransaction();

        const saleItems: SaleItem[] = [];
        let totalAmount = 0;

        // Lock products and validate available stock
        for (const productId of productIds) {
            const quantity = requestedQuantities.get(productId)!;

            const [products] = await connection.execute<any>(
                `SELECT
                    product_id,
                    product_name,
                    price,
                    current_stock
                 FROM products
                 WHERE product_id = ?
                 FOR UPDATE`,
                [productId]
            );

            if (products.length === 0) {
                await connection.rollback();

                return res.status(404).json({
                    message: `Product ${productId} not found`
                });
            }

            const product = products[0];
            const availableStock = Number(product.current_stock);

            if (availableStock < quantity) {
                await connection.rollback();

                return res.status(400).json({
                    message: `Insufficient stock for ${product.product_name}`,
                    available_stock: availableStock,
                    requested_quantity: quantity
                });
            }

            const unitPrice = Number(product.price);
            const subtotal = Number((unitPrice * quantity).toFixed(2));

            totalAmount += subtotal;

            saleItems.push({
                product_id: productId,
                quantity,
                unit_price: unitPrice,
                subtotal
            });
        }

        totalAmount = Number(totalAmount.toFixed(2));

        // Create sale record
        const [saleResult] = await connection.execute<any>(
            `INSERT INTO sales
                (user_id, total_amount, status)
             VALUES (?, ?, 'completed')`,
            [req.user.id, totalAmount]
        );

        const saleId = saleResult.insertId;

        // Insert sale items, deduct stock and record movements
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

            // Automatically deduct stock
            const [updateResult] = await connection.execute<any>(
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

            // Ensure stock was successfully deducted
            if (updateResult.affectedRows !== 1) {
                throw new Error(
                    `Stock update failed for product ${item.product_id}`
                );
            }

            // Record stock movement linked to the sale
            await connection.execute(
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

        return res.status(201).json({
            message: "Sale completed successfully",
            sale_id: saleId,
            total_amount: totalAmount,
            items: saleItems
        });

    } catch (error) {
        // Roll back all changes if anything fails
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error("Transaction rollback failed:", rollbackError);
            }
        }

        console.error("Sale creation failed:", error);

        return res.status(500).json({
            message: "Sale failed",
            error: error instanceof Error
                ? error.message
                : "Unknown error"
        });

    } finally {
        connection?.release();
    }
});


// GET ALL SALES
router.get("/", authenticateToken, async (req, res) => {
    try {
        const [sales] = await db.execute<any>(
            `SELECT
                s.sale_id,
                s.total_amount,
                s.sale_date_time,
                s.status,
                u.name AS sold_by
             FROM sales s
             LEFT JOIN users u
                ON s.user_id = u.id
             ORDER BY s.sale_id DESC`
        );

        return res.json(sales);

    } catch (error) {
        console.error("Failed to get sales:", error);

        return res.status(500).json({
            message: "Failed to get sales"
        });
    }
});


// GET SINGLE SALE
router.get("/:id", authenticateToken, async (req, res) => {
    try {
        const saleId = Number(req.params.id);

        if (!Number.isSafeInteger(saleId) || saleId <= 0) {
            return res.status(400).json({
                message: "Invalid sale ID"
            });
        }

        const [sales] = await db.execute<any>(
            `SELECT
                s.sale_id,
                s.total_amount,
                s.sale_date_time,
                s.status,
                u.name AS sold_by
             FROM sales s
             LEFT JOIN users u
                ON s.user_id = u.id
             WHERE s.sale_id = ?`,
            [saleId]
        );

        if (sales.length === 0) {
            return res.status(404).json({
                message: "Sale not found"
            });
        }

        const [items] = await db.execute<any>(
            `SELECT
                si.product_id,
                p.product_name,
                si.quantity,
                si.unit_price,
                si.subtotal
             FROM sale_items si
             JOIN products p
                ON si.product_id = p.product_id
             WHERE si.sale_id = ?`,
            [saleId]
        );

        return res.json({
            sale: sales[0],
            items
        });

    } catch (error) {
        console.error("Failed to get sale:", error);

        return res.status(500).json({
            message: "Failed to get sale"
        });
    }
});

export default router;
