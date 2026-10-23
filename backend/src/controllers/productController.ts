import { Request, Response } from "express";
import db from "../config/db";

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

        if (
            !name ||
            category_id === undefined ||
            price === undefined
        ) {
            return res.status(400).json({
                message: "Name, category_id and price are required"
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

        const {
            name,
            category_id,
            price,
            minimum_stock
        } = req.body;

        if (
            !name ||
            category_id === undefined ||
            price === undefined ||
            minimum_stock === undefined
        ) {
            return res.status(400).json({
                message:
                    "Name, category_id, price and minimum_stock are required"
            });
        }

        const [result] = await db.execute<any>(`
            UPDATE products
            SET
                product_name = ?,
                category_id = ?,
                price = ?,
                minimum_stock = ?
            WHERE product_id = ?
        `, [
            name,
            category_id,
            price,
            minimum_stock,
            req.params.id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            message: "Product updated successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to update product",
            error: error.message
        });
    }
};

// DELETE /api/products/:id
export const deleteProduct = async (req: Request, res: Response) => {

    try {

        const [result] = await db.execute<any>(
            "DELETE FROM products WHERE product_id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            message: "Product deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to delete product",
            error: error.message
        });
    }
};