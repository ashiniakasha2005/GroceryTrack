import { Request, Response } from 'express';
import {
  getAllCategories,
  getCategoryById,
  findCategoryByName,
  createCategory,
  updateCategory,
  deleteCategory,
  countProductsInCategory,
} from '../models/categoryModel';

function cleanName(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

// GET /api/categories
export async function getCategories(req: Request, res: Response) {
  try {
    return res.status(200).json(await getAllCategories());
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/categories
export async function addCategory(req: Request, res: Response) {
  try {
    const name = cleanName(req.body.category_name);
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    if (name.length > 100) {
      return res.status(400).json({ message: 'Category name must be 100 characters or less' });
    }
    if (await findCategoryByName(name)) {
      return res.status(409).json({ message: 'Category already exists' });
    }

    const newId = await createCategory(name);
    return res.status(201).json({ message: 'Category created', category_id: newId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}

// PUT /api/categories/:id
export async function editCategory(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const name = cleanName(req.body.category_name);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid category id' });
    }
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    if (!(await getCategoryById(id))) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const sameName = await findCategoryByName(name);
    if (sameName && sameName.category_id !== id) {
      return res.status(409).json({ message: 'Category already exists' });
    }

    await updateCategory(id, name);
    return res.status(200).json({ message: 'Category updated' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}

// DELETE /api/categories/:id
export async function removeCategory(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid category id' });
    }
    if (!(await getCategoryById(id))) {
      return res.status(404).json({ message: 'Category not found' });
    }
    if ((await countProductsInCategory(id)) > 0) {
      return res.status(409).json({ message: 'Cannot delete a category that still has products' });
    }

    await deleteCategory(id);
    return res.status(200).json({ message: 'Category deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}