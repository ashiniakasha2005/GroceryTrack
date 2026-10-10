import { Router } from 'express';
import {
  getCategories,
  addCategory,
  editCategory,
  removeCategory,
} from '../controllers/categoryController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// Read: logged-in ඕනම user කෙනෙකුට
router.get('/', authenticateToken, getCategories);

// Manage: admin ට විතරයි
router.post('/', authenticateToken, authorizeRoles('admin'), addCategory);
router.put('/:id', authenticateToken, authorizeRoles('admin'), editCategory);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), removeCategory);

export default router;