export type SaleItem = { productId: number; quantity: number }

// Shape inferred from POST /api/sales on feature/US-008-stock-deduction
export type SaleLine = {
  product_id: number
  quantity: number
  unit_price: number | string
  subtotal: number | string
}

export type CompleteSaleResult = {
  message: string
  sale_id: number
  total_amount: number | string
  items: SaleLine[]
  low_stock: unknown // shape not confirmed yet
}
