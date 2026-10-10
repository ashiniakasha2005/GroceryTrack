import { Request, Response } from 'express';
import {
  getAllCategories,
  getCategoryById,
  findCategoryByName,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../models/categoryModel';

// GET /api/categories
export async function getCategories(req: Request, res: Response) {
  try {
    const categories = await getAllCategories();
    return res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/categories
export async function addCategory(req: Request, res: Response) {
  try {
    const { category_name } = req.body;

    if (!category_name || category_name.trim() === '') {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const existing = await findCategoryByName(category_name.trim());
    if (existing) {
      return res.status(409).json({ message: 'Category already exists' });
    }

    const newId = await createCategory(category_name.trim());
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
    const { category_name } = req.body;

    if (!category_name || category_name.trim() === '') {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const existing = await getCategoryById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await updateCategory(id, category_name.trim());
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

    const existing = await getCategoryById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await deleteCategory(id);
    return res.status(200).json({ message: 'Category deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}