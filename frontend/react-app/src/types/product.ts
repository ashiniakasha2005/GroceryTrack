export interface Product {
  id: number
  name: string
  categoryName: string
  price: number
  currentStock: number
  minStockLevel: number
  unit?: string // wireframe shows kg / L / pcs
}