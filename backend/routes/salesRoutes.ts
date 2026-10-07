import express from "express";
import db from "../db";

import { authenticateToken } from "../middleware/auth";

interface SaleItem {
    product_id: number;
    quantity: number;
    price: number;
    subtotal: number;
}

const router = express.Router();


// CREATE SALE
router.post("/", authenticateToken, async (req, res) => {

    const connection = await db.getConnection();

    try {

        const { items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "Sale items are required"
            });
        }

        await connection.beginTransaction();

        let totalAmount = 0;

        const saleItems: SaleItem[] = [];

        // CHECK PRODUCTS AND STOCK
        for (const item of items) {

            const {
                product_id,
                quantity
            } = item;

            if (!product_id || !quantity || quantity <= 0) {

                await connection.rollback();

                return res.status(400).json({
                    message:
                        "product_id and valid quantity are required"
                });
            }

            const [products] = await connection.execute<any>(
                `SELECT *
                 FROM products
                 WHERE id = ?
                 FOR UPDATE`,
                [product_id]
            );

            if (products.length === 0) {

                await connection.rollback();

                return res.status(404).json({
                    message:
                        `Product ${product_id} not found`
                });
            }

            const product = products[0];

            if (product.stock_quantity < quantity) {

                await connection.rollback();

                return res.status(400).json({
                    message:
                        `Insufficient stock for ${product.name}`
                });
            }

            const subtotal =
                Number(product.price) * Number(quantity);

            totalAmount += subtotal;

            saleItems.push({
                product_id,
                quantity,
                price: product.price,
                subtotal
            });
        }


        if (!req.user) {
            await connection.rollback();
            return res.status(401).json({
                message: "User not authenticated"
            });
        }

        // CREATE SALE
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


        // CREATE SALE ITEMS + REDUCE STOCK
        for (const item of saleItems) {

            await connection.execute<any>(`
                INSERT INTO sale_items
                (sale_id, product_id, quantity, price, subtotal)
                VALUES (?, ?, ?, ?, ?)
            `, [
                saleId,
                item.product_id,
                item.quantity,
                item.price,
                item.subtotal
            ]);

            await connection.execute<any>(`
                UPDATE products
                SET stock_quantity =
                    stock_quantity - ?
                WHERE id = ?
            `, [
                item.quantity,
                item.product_id
            ]);
        }


        await connection.commit();

        res.status(201).json({
            message: "Sale completed successfully",
            sale_id: saleId,
            total_amount: totalAmount
        });

    } catch (error) {

        await connection.rollback();

        res.status(500).json({
            message: "Sale failed",
            error: error.message
        });

    } finally {

        connection.release();
    }
});


// GET ALL SALES
router.get("/", authenticateToken, async (req, res) => {

    try {

        const [sales] = await db.execute<any>(`
            SELECT
                s.id,
                s.total_amount,
                s.sale_date,
                u.name AS sold_by
            FROM sales s
            LEFT JOIN users u
                ON s.user_id = u.id
            ORDER BY s.id DESC
        `);

        res.json(sales);

    } catch (error) {

        res.status(500).json({
            message: "Failed to get sales",
            error: error.message
        });
    }
});


// GET SINGLE SALE
router.get("/:id", authenticateToken, async (req, res) => {

    try {

        const [sales] = await db.execute<any>(`
            SELECT
                s.id,
                s.total_amount,
                s.sale_date,
                u.name AS sold_by
            FROM sales s
            LEFT JOIN users u
                ON s.user_id = u.id
            WHERE s.id = ?
        `, [req.params.id]);

        if (sales.length === 0) {
            return res.status(404).json({
                message: "Sale not found"
            });
        }

        const [items] = await db.execute<any>(`
            SELECT
                si.product_id,
                p.name AS product_name,
                si.quantity,
                si.price,
                si.subtotal
            FROM sale_items si
            JOIN products p
                ON si.product_id = p.id
            WHERE si.sale_id = ?
        `, [req.params.id]);

        res.json({
            sale: sales[0],
            items
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to get sale",
            error: error.message
        });
    }
});


export default router;