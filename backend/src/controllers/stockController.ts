
import { Request, Response } from 'express';
import { pool } from '../config/db';

// Update stock to a specific quantity.
export async function updateStock(req: Request, res: Response) {
  const productId = Number(req.params.productId);
  const { quantity } = req.body;

  if (!Number.isSafeInteger(productId) || productId <= 0) {
    return res.status(400).json({
      message: 'Invalid product ID',
    });
  }

  if (!Number.isSafeInteger(quantity) || quantity < 0) {
    return res.status(400).json({
      message: 'Quantity must be a non-negative integer',
    });
  }

  try {
    const [result] = await pool.execute(
      'UPDATE products SET current_stock = ? WHERE product_id = ?',
      [quantity, productId]
    );

    if ((result as { affectedRows: number }).affectedRows === 0) {
      const [rows] = await pool.execute(
        'SELECT product_id FROM products WHERE product_id = ?',
        [productId]
      );

      if ((rows as unknown[]).length === 0) {
        return res.status(404).json({
          message: 'Product not found',
        });
      }
    }

    const [rows] = await pool.execute(
      `SELECT product_id, product_name, current_stock, minimum_stock
       FROM products WHERE product_id = ?`,
      [productId]
    );

    return res.status(200).json({
      message: 'Stock quantity updated successfully',
      product: (rows as unknown[])[0],
    });
  } catch (error) {
    console.error('Update stock error:', error);

    return res.status(500).json({
      message: 'Failed to update stock',
    });
  }
}

// Add a quantity to the existing stock.
export async function restockStock(req: Request, res: Response) {
  const productId = Number(req.params.productId);
  const { quantity } = req.body;

  if (!Number.isSafeInteger(productId) || productId <= 0) {
    return res.status(400).json({
      message: 'Invalid product ID',
    });
  }

  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    return res.status(400).json({
      message: 'Restock quantity must be a positive integer',
    });
  }

  try {
    const [result] = await pool.execute(
      `UPDATE products
       SET current_stock = current_stock + ?
       WHERE product_id = ?`,
      [quantity, productId]
    );

    if ((result as { affectedRows: number }).affectedRows === 0) {
      const [rows] = await pool.execute(
        'SELECT product_id FROM products WHERE product_id = ?',
        [productId]
      );

      if ((rows as unknown[]).length === 0) {
        return res.status(404).json({
          message: 'Product not found',
        });
      }
    }

    const [rows] = await pool.execute(
      `SELECT product_id, product_name, current_stock, minimum_stock
       FROM products WHERE product_id = ?`,
      [productId]
    );

    return res.status(200).json({
      message: 'Stock restocked successfully',
      product: (rows as unknown[])[0],
    });
  } catch (error) {
    console.error('Restock stock error:', error);

    return res.status(500).json({
      message: 'Failed to restock stock',
    });
  }
}
