import express from "express";
import { adminOnly, authenticateToken } from "../middleware/authMiddleware";
import {
    getProducts,
    searchProducts,
    getProductById,
    createProduct,
    updateProduct,
    updateMinimumStock,
    deleteProduct,
    getTotalProductCount
} from "../controllers/productController";

const router = express.Router();

router.get("/", authenticateToken, getProducts);
router.get("/search/:name", authenticateToken, searchProducts);
router.get("/count", authenticateToken, getTotalProductCount);
router.get("/:id", authenticateToken, getProductById);
router.post("/", authenticateToken, createProduct);
router.put("/:id", authenticateToken, updateProduct);
router.delete("/:id", authenticateToken, deleteProduct);

router.patch(
    "/:id/minimum-stock",
    authenticateToken,
    adminOnly,
    updateMinimumStock
);

export default router;
