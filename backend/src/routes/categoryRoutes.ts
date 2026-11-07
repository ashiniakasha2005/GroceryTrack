import express from "express";
import { adminOnly, authenticateToken } from "../middleware/authMiddleware";
import {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} from "../controllers/categoryController";

const router = express.Router();

router.get("/", authenticateToken, getCategories);
router.get("/:id", authenticateToken, getCategoryById);
router.post("/", authenticateToken, adminOnly, createCategory);
router.put("/:id", authenticateToken, adminOnly, updateCategory);
router.delete("/:id", authenticateToken, adminOnly, deleteCategory);

export default router;
