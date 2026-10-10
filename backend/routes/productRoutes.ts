import { Router } from 'express';
import { createProduct } from '../controllers/productController';

const router = Router();

// POST /api/products
router.post('/products', createProduct);

export default router;