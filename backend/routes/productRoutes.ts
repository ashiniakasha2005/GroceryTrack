import { Router } from 'express';
import { createProduct } from '../controllers/productController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// Route to create a new product with admin authorization
router.post('/', authenticateToken, authorizeRoles('admin'), createProduct);

export default router;