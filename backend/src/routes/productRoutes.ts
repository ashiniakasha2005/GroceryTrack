import express from "express";
import { adminOnly, authenticateToken } from "../middleware/authMiddleware";
import {
    getProducts,
    searchProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} from "../controllers/productController";

const router = express.Router();

router.get("/", authenticateToken, getProducts);
router.get("/search/:name", authenticateToken, searchProducts);
router.get("/:id", authenticateToken, getProductById);
router.post("/", authenticateToken, adminOnly, createProduct);
router.put("/:id", authenticateToken, adminOnly, updateProduct);
router.delete("/:id", authenticateToken, adminOnly, deleteProduct);

export default router;
