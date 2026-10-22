import { Request, Response, NextFunction } from 'express';
import { getCategoryById } from '../models/categoryModel';

export async function validateProductCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { category_id } = req.body;

    if (category_id === undefined || category_id === null || category_id === '') {
      return res.status(400).json({ message: 'category_id is required' });
    }

    const id = Number(category_id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'category_id must be a valid number' });
    }

    if (!(await getCategoryById(id))) {
      return res.status(400).json({ message: 'Selected category does not exist' });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}