// src/services/stockService.ts
// US-008 / US-009 - automatic stock deduction + stock/sales consistency.
//
// RULES FOR THIS FILE
//  - Every function receives a PoolConnection that is ALREADY inside a
//    transaction. These functions never begin/commit/rollback themselves;
//    the caller (sales route) owns the transaction. If anything throws,
//    the caller rolls back, so sale + stock always succeed or fail together.
//  - Column names follow the real DB:
//      products(product_id, product_name, category_id, price, current_stock, minimum_stock)
//      sales(sale_id, user_id, sale_date_time, total_amount, status, ...)
//      sale_items(sale_item_id, sale_id, product_id, quantity, unit_price, subtotal)

import { PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise";

// ---------- types ----------

export interface StockItem {
    product_id: number;
    quantity: number;
}

export interface SaleLine {
    product_id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

export interface LowStockProduct {
    product_id: number;
    product_name: string;
    current_stock: number;
    minimum_stock: number;
}

export interface DeductResult {
    lines: SaleLine[];
    totalAmount: number;
    lowStock: LowStockProduct[];
}

// Error with an HTTP status so routes can reply correctly.
export class StockError extends Error {
    status: number;

    constructor(message: string, status = 400) {
        super(message);
        this.name = "StockError";
        this.status = status;
    }
}

// ---------- helpers ----------

const round2 = (n: number) => Math.round(n * 100) / 100;

// Validates items, merges duplicate product_ids (quantities added together)
// and sorts by product_id so every transaction locks rows in the same order
// (prevents deadlocks between two sales that share products).
function mergeItems(items: StockItem[]): StockItem[] {
    if (!Array.isArray(items) || items.length === 0) {
        throw new StockError("Sale items are required", 400);
    }

    const totals = new Map<number, number>();

    for (const item of items) {
        const productId = Number(item?.product_id);
        const quantity = Number(item?.quantity);

        if (
            !Number.isInteger(productId) || productId <= 0 ||
            !Number.isInteger(quantity) || quantity <= 0
        ) {
            throw new StockError(
                "Each item needs a valid product_id and a positive whole-number quantity",
                400
            );
        }

        totals.set(productId, (totals.get(productId) ?? 0) + quantity);
    }

    return [...totals.entries()]
        .map(([product_id, quantity]) => ({ product_id, quantity }))
        .sort((a, b) => a.product_id - b.product_id);
}

// ---------- 1. DEDUCT STOCK ----------
// Call BEFORE inserting the sale row (total_amount is NOT NULL, and we only
// know the total after reading prices under lock).
export async function deductStock(
    connection: PoolConnection,
    items: StockItem[]
): Promise<DeductResult> {
    const merged = mergeItems(items);

    const lines: SaleLine[] = [];
    let totalAmount = 0;

    for (const item of merged) {
        // Lock this product row until the transaction ends.
        const [rows] = await connection.execute<RowDataPacket[]>(
            `SELECT product_id, product_name, price, current_stock
             FROM products
             WHERE product_id = ?
             FOR UPDATE`,
            [item.product_id]
        );

        const product = rows[0];

        if (!product) {
            throw new StockError(`Product ${item.product_id} not found`, 404);
        }

        if (product.current_stock < item.quantity) {
            throw new StockError(
                `Insufficient stock for ${product.product_name}. ` +
                `Available: ${product.current_stock}, requested: ${item.quantity}`,
                400
            );
        }

        // Conditional update: second safety net. If another transaction
        // somehow changed the stock, affectedRows will be 0 and we abort.
        const [result] = await connection.execute<ResultSetHeader>(
            `UPDATE products
             SET current_stock = current_stock - ?
             WHERE product_id = ?
               AND current_stock >= ?`,
            [item.quantity, item.product_id, item.quantity]
        );

        if (result.affectedRows !== 1) {
            throw new StockError(
                `Stock changed while processing ${product.product_name}. Please try again`,
                409
            );
        }

        const unitPrice = Number(product.price);
        const subtotal = round2(unitPrice * item.quantity);

        totalAmount += subtotal;

        lines.push({
            product_id: item.product_id,
            product_name: product.product_name,
            quantity: item.quantity,
            unit_price: unitPrice,
            subtotal
        });
    }

    // Which of these products are now at / below their minimum stock?
    const ids = lines.map((l) => l.product_id);
    const placeholders = ids.map(() => "?").join(",");

    const [lowRows] = await connection.execute<RowDataPacket[]>(
        `SELECT product_id, product_name, current_stock, minimum_stock
         FROM products
         WHERE product_id IN (${placeholders})
           AND current_stock <= minimum_stock`,
        ids
    );

    return {
        lines,
        totalAmount: round2(totalAmount),
        lowStock: lowRows as LowStockProduct[]
    };
}

// ---------- 2. LOG SALE MOVEMENTS ----------
// Call AFTER the sale row exists (needs sale_id).
export async function logSaleMovements(
    connection: PoolConnection,
    saleId: number,
    lines: SaleLine[],
    userId: number
): Promise<void> {
    for (const line of lines) {
        await connection.execute(
            `INSERT INTO stock_movements
                (product_id, change_qty, reason, sale_id, user_id)
             VALUES (?, ?, 'SALE', ?, ?)`,
            [line.product_id, -line.quantity, saleId, userId]
        );
    }
}

// ---------- 3. RESTORE STOCK (cancel / refund) ----------
export async function restoreStock(
    connection: PoolConnection,
    saleId: number,
    userId: number
): Promise<{ sale_id: number; restored: StockItem[] }> {
    // Lock the sale row so two cancel requests cannot both restore stock.
    const [sales] = await connection.execute<RowDataPacket[]>(
        `SELECT sale_id, status
         FROM sales
         WHERE sale_id = ?
         FOR UPDATE`,
        [saleId]
    );

    const sale = sales[0];

    if (!sale) {
        throw new StockError("Sale not found", 404);
    }

    if (sale.status !== "completed") {
        throw new StockError("Sale is already cancelled", 409);
    }

    const [items] = await connection.execute<RowDataPacket[]>(
        `SELECT product_id, quantity
         FROM sale_items
         WHERE sale_id = ?
         ORDER BY product_id`,
        [saleId]
    );

    const restored: StockItem[] = [];

    for (const item of items) {
        const [result] = await connection.execute<ResultSetHeader>(
            `UPDATE products
             SET current_stock = current_stock + ?
             WHERE product_id = ?`,
            [item.quantity, item.product_id]
        );

        if (result.affectedRows !== 1) {
            throw new StockError(`Product ${item.product_id} no longer exists`, 409);
        }

        await connection.execute(
            `INSERT INTO stock_movements
                (product_id, change_qty, reason, sale_id, user_id)
             VALUES (?, ?, 'CANCEL', ?, ?)`,
            [item.product_id, item.quantity, saleId, userId]
        );

        restored.push({ product_id: item.product_id, quantity: item.quantity });
    }

    await connection.execute(
        `UPDATE sales
         SET status = 'cancelled',
             cancelled_at = NOW(),
             cancelled_by = ?
         WHERE sale_id = ?`,
        [userId, saleId]
    );

    return { sale_id: saleId, restored };
}

/* =====================================================================
   HOW THE SALES ROUTE USES THIS  (agree this with Prathikshan)
   =====================================================================

   // POST /api/sales
   const connection = await db.getConnection();
   try {
       await connection.beginTransaction();

       const { lines, totalAmount, lowStock } =
           await deductStock(connection, req.body.items);

       const [saleResult] = await connection.execute<any>(
           "INSERT INTO sales (user_id, total_amount) VALUES (?, ?)",
           [req.user!.id, totalAmount]
       );
       const saleId = saleResult.insertId;

       for (const l of lines) {
           await connection.execute(
               `INSERT INTO sale_items
                   (sale_id, product_id, quantity, unit_price, subtotal)
                VALUES (?, ?, ?, ?, ?)`,
               [saleId, l.product_id, l.quantity, l.unit_price, l.subtotal]
           );
       }

       await logSaleMovements(connection, saleId, lines, req.user!.id);

       await connection.commit();
       return res.status(201).json({
           message: "Sale completed successfully",
           sale_id: saleId,
           total_amount: totalAmount,
           low_stock: lowStock
       });
   } catch (error: any) {
       await connection.rollback();
       if (error instanceof StockError) {
           return res.status(error.status).json({ message: error.message });
       }
       console.error("Sale error:", error);
       return res.status(500).json({ message: "Sale failed" });
   } finally {
       connection.release();
   }

   // PUT /api/sales/:id/cancel   (authenticateToken, adminOnly)
   same pattern: beginTransaction -> restoreStock(connection, Number(req.params.id), req.user!.id)
   -> commit -> 200, with the same StockError handling in catch.
   ===================================================================== */