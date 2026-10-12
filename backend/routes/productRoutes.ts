import { Router } from 'express';
import { createProduct, updateProduct } from '../controllers/productController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware'; // හෝ අදාළ path එක
import { validateProductCategory } from '../middlewares/categoryMiddleware'; // අදාළ path එක

const router = Router();

// Category validation එකත් සමඟ Product Create කිරීම
router.post('/', authenticateToken, authorizeRoles('admin'), validateProductCategory, createProduct);

// Category validation එකත් සමඟ Product Update කිරීම
router.put('/:id', authenticateToken, authorizeRoles('admin'), validateProductCategory, updateProduct);

export default router;