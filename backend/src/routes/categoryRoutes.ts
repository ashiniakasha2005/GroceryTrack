import { Router } from 'express';
import {
  getCategories,
  addCategory,
  editCategory,
  removeCategory,
} from '../controllers/categoryController';

const router = Router();

router.get('/', getCategories);
router.post('/', addCategory);
router.put('/:id', editCategory);
router.delete('/:id', removeCategory);

export default router;