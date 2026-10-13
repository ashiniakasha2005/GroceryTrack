import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Category extends RowDataPacket {
  category_id: number;
  category_name: string;
}

// Get all categories
export async function getAllCategories(): Promise<Category[]> {
  const [rows] = await pool.query<Category[]>('SELECT * FROM categories');
  return rows;
}

// Get one category by id
export async function getCategoryById(id: number): Promise<Category | null> {
  const [rows] = await pool.query<Category[]>(
    'SELECT * FROM categories WHERE category_id = ? LIMIT 1',
    [id]
  );
  return rows.length > 0 ? rows[0]! : null;
}

// Check if a category name already exists
export async function findCategoryByName(name: string): Promise<Category | null> {
  const [rows] = await pool.query<Category[]>(
    'SELECT * FROM categories WHERE category_name = ? LIMIT 1',
    [name]
  );
  return rows.length > 0 ? rows[0]! : null;
}

// Create a new category
export async function createCategory(name: string): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO categories (category_name) VALUES (?)',
    [name]
  );
  return result.insertId;
}

// Update an existing category
export async function updateCategory(id: number, name: string): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>(
    'UPDATE categories SET category_name = ? WHERE category_id = ?',
    [name, id]
  );
  return result.affectedRows > 0;
}

// Delete a category
export async function deleteCategory(id: number): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>(
    'DELETE FROM categories WHERE category_id = ?',
    [id]
  );
  return result.affectedRows > 0;
}