
import { Router } from 'express';
import {
  authenticateToken,
  authorizeStockRoles
} from '../middleware/authMiddleware';
import {
  updateStock,
  restockStock
} from '../controllers/stockController';

const router = Router();

router.patch(
  '/:productId',
  authenticateToken,
  authorizeStockRoles,
  updateStock
);

router.post(
  '/:productId/restock',
  authenticateToken,
  authorizeStockRoles,
  restockStock
);

export default router;
