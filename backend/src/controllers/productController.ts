import { Request, Response } from 'express';
import { pool } from '../config/db';

export const createProduct = async (req: Request, res: Response) => {
    try {
        const { product_name, category_id, price, min_stock_level, current_stock } = req.body;

        // Input Validation
        if (!product_name || typeof product_name !== 'string' || product_name.trim() === '') {
            return res.status(400).json({ message: 'Product name is required.' });
        }

        if (!category_id || isNaN(Number(category_id))) {
            return res.status(400).json({ message: 'A valid category_id is required.' });
        }

        if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
            return res.status(400).json({ message: 'Price must be a valid non-negative number.' });
        }

        const minStock = min_stock_level !== undefined ? Number(min_stock_level) : 0;
        const currentStock = current_stock !== undefined ? Number(current_stock) : 0;

        if (minStock < 0 || currentStock < 0) {
            return res.status(400).json({ message: 'Stock levels cannot be negative numbers.' });
        }

        // Database Query with updated column name: minimum_stock
        const query = `
            INSERT INTO products (product_name, category_id, price, minimum_stock, current_stock)
            VALUES (?, ?, ?, ?, ?)
        `;

        const [result]: any = await pool.execute(query, [
            product_name.trim(),
            category_id,
            price,
            minStock,
            currentStock
        ]);

        return res.status(201).json({
            message: 'Product created successfully.',
            product: {
                product_id: result.insertId,
                product_name: product_name.trim(),
                category_id,
                price,
                minimum_stock: minStock,
                current_stock: currentStock
            }
        });

    } catch (error: any) {
        console.error('Error creating product:', error);
        return res.status(500).json({
            message: 'An internal server error occurred.',
            error: error.message
        });
    }
};