import type { Product } from '../types/product'

// Low-stock rule lives here only (SRS BR-08: stock <= min).
export const isLowStock = (
  product: Pick<Product, 'currentStock' | 'minStockLevel'>,
) => product.currentStock <= product.minStockLevel