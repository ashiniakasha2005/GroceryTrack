import express from "express";
import db from "../db";
import { authenticateToken, adminOnly } from "../middleware/auth";

const router = express.Router();

// GET ALL PRODUCTS
router.get("/", authenticateToken, async (_req, res) => {
    try {
        const [products] = await db.execute<any[]>(`
            SELECT
                product_id,
                product_name,
                category_id,
                price,
                current_stock,
                minimum_stock
            FROM products
            ORDER BY product_id DESC
        `);

        res.json(products);
    } catch (error) {
        console.error("Get products error:", error);
        res.status(500).json({ message: "Failed to get products" });
    }
});

// SEARCH PRODUCTS
router.get("/search/:name", authenticateToken, async (req, res) => {
    try {
        const search = `%${req.params.name}%`;
        const [products] = await db.execute<any[]>(`
            SELECT
                product_id,
                product_name,
                category_id,
                price,
                current_stock,
                minimum_stock
            FROM products
            WHERE product_name LIKE ?
            ORDER BY product_name
        `, [search]);

        res.json(products);
    } catch (error) {
        console.error("Search products error:", error);
        res.status(500).json({ message: "Search failed" });
    }
});

// GET PRODUCT BY ID
router.get("/:id", authenticateToken, async (req, res) => {
    try {
        const [products] = await db.execute<any[]>(`
            SELECT
                product_id,
                product_name,
                category_id,
                price,
                current_stock,
                minimum_stock
            FROM products
            WHERE product_id = ?
        `, [req.params.id]);

        if (products.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(products[0]);
    } catch (error) {
        console.error("Get product error:", error);
        res.status(500).json({ message: "Failed to get product" });
    }
});

// ADD PRODUCT
router.post("/", authenticateToken, adminOnly, async (req, res) => {
    try {
        const { product_name, category_id, price, current_stock, minimum_stock } = req.body;

        if (
            typeof product_name !== "string" ||
            !product_name.trim() ||
            category_id === undefined ||
            price === undefined
        ) {
            return res.status(400).json({
                message: "product_name, category_id and price are required"
            });
        }

        const [result] = await db.execute<any>(`
            INSERT INTO products
                (product_name, category_id, price, current_stock, minimum_stock)
            VALUES (?, ?, ?, ?, ?)
        `, [
            product_name.trim(),
            category_id,
            price,
            current_stock ?? 0,
            minimum_stock ?? 5
        ]);

        res.status(201).json({
            message: "Product created successfully",
            productId: result.insertId
        });
    } catch (error) {
        console.error("Create product error:", error);
        res.status(500).json({ message: "Failed to create product" });
    }
});

// UPDATE PRODUCT (US004)
// PUT /api/products/:id — admin only
router.put("/:id", authenticateToken, adminOnly, async (req, res) => {
    try {
        const productId = Number(req.params.id);
        if (!Number.isInteger(productId) || productId <= 0) {
            return res.status(400).json({ message: "Product ID must be a positive integer" });
        }

        const { product_name, category_id, price, minimum_stock } = req.body;

        if (
            typeof product_name !== "string" ||
            !product_name.trim() ||
            !Number.isInteger(Number(category_id)) ||
            Number(category_id) <= 0 ||
            price === undefined ||
            !Number.isFinite(Number(price)) ||
            Number(price) < 0 ||
            minimum_stock === undefined ||
            !Number.isInteger(Number(minimum_stock)) ||
            Number(minimum_stock) < 0
        ) {
            return res.status(400).json({
                message: "Valid product_name, category_id, non-negative price and non-negative integer minimum_stock are required"
            });
        }

        // Validate the category before updating, so TC-15 receives a clear 400 response.
        // Validate category before updating (TC-15)
const [categories] = await db.execute<any[]>(
    "SELECT category_id FROM categories WHERE category_id = ?",
    [Number(category_id)]
);

        if (categories.length === 0) {
            return res.status(400).json({
                message: "Invalid category_id: category does not exist"
            });
        }

        const [existingProducts] = await db.execute<any[]>(
            "SELECT product_id FROM products WHERE product_id = ?",
            [productId]
        );
        if (existingProducts.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        await db.execute(
            `UPDATE products
             SET product_name = ?, category_id = ?, price = ?, minimum_stock = ?
             WHERE product_id = ?`,
            [
                product_name.trim(),
                Number(category_id),
                Number(price),
                Number(minimum_stock),
                productId
            ]
        );

        return res.json({ message: "Product updated successfully" });
    } catch (error) {
        console.error("Update product error:", error);
        return res.status(500).json({ message: "Failed to update product" });
    }
});

// DELETE PRODUCT (US004)
// DELETE /api/products/:id — admin only
router.delete("/:id", authenticateToken, adminOnly, async (req, res) => {
    try {
        const productId = Number(req.params.id);
        if (!Number.isInteger(productId) || productId <= 0) {
            return res.status(400).json({ message: "Product ID must be a positive integer" });
        }

        const [result] = await db.execute<any>(
            "DELETE FROM products WHERE product_id = ?",
            [productId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Delete product error:", error);
        return res.status(500).json({ message: "Failed to delete product" });
    }
});

export default router;
