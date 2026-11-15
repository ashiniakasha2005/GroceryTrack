import { Request, Response } from "express";
import db from "../config/db";
import { isNonNegativeInteger } from "../utils/validators";

// GET /api/products
export const getProducts = async (req: Request, res: Response) => {
    try {
        const [products] = await db.execute<any>(`
            SELECT
                p.product_id AS id,
                p.product_name AS name,
                p.category_id,
                c.category_name AS category,
                p.price,
                p.current_stock AS stock_quantity,
                p.minimum_stock
            FROM products p
            LEFT JOIN categories c
                ON p.category_id = c.category_id
            WHERE p.is_active = 1
            ORDER BY p.product_id DESC
        `);
        res.json(products);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get products",
            error: error.message
        });
    }
};

// GET /api/products/search/:name
export const searchProducts = async (req: Request, res: Response) => {
    try {
        const search = `%${req.params.name}%`;
        const [products] = await db.execute<any>(`
            SELECT
                p.product_id AS id,
                p.product_name AS name,
                c.category_name AS category,
                p.price,
                p.current_stock AS stock_quantity,
                p.minimum_stock
            FROM products p
            LEFT JOIN categories c
                ON p.category_id = c.category_id
            WHERE p.product_name LIKE ?
            AND p.is_active = 1
        `, [search]);
        res.json(products);
    } catch (error) {
        res.status(500).json({
            message: "Search failed",
            error: error.message
        });
    }
};

// GET /api/products/:id
export const getProductById = async (req: Request, res: Response) => {
    try {
        const [products] = await db.execute<any>(`
            SELECT
                p.product_id AS id,
                p.product_name AS name,
                p.category_id,
                c.category_name AS category,
                p.price,
                p.current_stock AS stock_quantity,
                p.minimum_stock
            FROM products p
            LEFT JOIN categories c
                ON p.category_id = c.category_id
            WHERE p.product_id = ?
            AND p.is_active = 1 
        `, [req.params.id]);

        if (products.length === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }
        res.json(products[0]);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get product",
            error: error.message
        });
    }
};

// POST /api/products
export const createProduct = async (req: Request, res: Response) => {
    try {
        const {
            name,
            category_id,
            price,
            stock_quantity,
            minimum_stock
        } = req.body;

        if (!name || category_id === undefined || price === undefined) {
            return res.status(400).json({
                message: "Name, category_id and price are required"
            });
        }

        if (
            (stock_quantity !== undefined && !isNonNegativeInteger(stock_quantity)) ||
            (minimum_stock !== undefined && !isNonNegativeInteger(minimum_stock))
        ) {
            return res.status(400).json({
                message: "stock_quantity and minimum_stock must be non-negative whole numbers"
            });
        }

        const [result] = await db.execute<any>(`
            INSERT INTO products
            (product_name, category_id, price, current_stock, minimum_stock)
            VALUES (?, ?, ?, ?, ?)
        `, [
            name,
            category_id,
            price,
            stock_quantity ?? 0,
            minimum_stock ?? 5
        ]);

        res.status(201).json({
            message: "Product created successfully",
            productId: result.insertId
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create product",
            error: error.message
        });
    }
};

// PUT /api/products/:id
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { name, category_id, price, minimum_stock } = req.body;

        if (!name || category_id === undefined || price === undefined || minimum_stock === undefined) {
            return res.status(400).json({
                message: "Name, category_id, price and minimum_stock are required"
            });
        }

        if (!Number.isInteger(minimum_stock) || minimum_stock < 0) {
            return res.status(400).json({
                message: "minimum_stock must be a non-negative whole number"
            });
        }

        const [result] = await db.execute<any>(`
            UPDATE products
            SET product_name = ?, category_id = ?, price = ?, minimum_stock = ?
            WHERE product_id = ?
        `, [name, category_id, price, minimum_stock, req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.json({ message: "Product updated successfully" });
    } catch (error: any) {
        return res.status(500).json({
            message: "Failed to update product",
            error: error.message
        });
    }
};

// PATCH /api/products/:id/minimum-stock
export const updateMinimumStock = async (req: Request, res: Response) => {
    try {
        const productId = Number(req.params.id);
        const minimumStock = req.body?.minimum_stock;

        if (!Number.isInteger(productId) || productId <= 0) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        if (!Number.isInteger(minimumStock) || minimumStock < 0) {
            return res.status(400).json({ message: "minimum_stock must be a non-negative integer" });
        }

        const [products] = await db.execute<any>(
            `SELECT product_id FROM products WHERE product_id = ?`,
            [productId]
        );

        if (products.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        await db.execute(
            `UPDATE products SET minimum_stock = ? WHERE product_id = ?`,
            [minimumStock, productId]
        );

        return res.status(200).json({
            message: "Minimum stock updated successfully",
            product_id: productId,
            minimum_stock: minimumStock
        });
    } catch (error: unknown) {
        console.error("Update minimum stock error:", error);
        return res.status(500).json({ message: "Failed to update minimum stock" });
    }
};

// DELETE /api/products/:id
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const [result] = await db.execute<any>(
            "UPDATE products SET is_active = 0 WHERE product_id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.json({ message: "Product hidden successfully" });
    } catch (error: any) {
        // Foreign key constraint error එක අල්ලගන්නවා (MySQL Error 1451)
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
            return res.status(409).json({
                message: "Cannot hide this product because it has existing sales records or stock history."
            });
        }

        return res.status(500).json({
            message: "Failed to hide product",
            error: error.message
        });
    }
};

// GET /api/products/count
export const getTotalProductCount = async (req: Request, res: Response) => {
    try {
        const [result] = await db.execute<any>(`
            SELECT COUNT(*) AS total_products FROM products WHERE is_active = 1
        `);

        return res.status(200).json({
            total_products: result[0].total_products
        });
    } catch (error) {
        console.error("Get total product count error:", error);
        return res.status(500).json({ message: "Failed to get total product count" });
    }
};