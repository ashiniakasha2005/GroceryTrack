export type SaleItem = { productId: number; quantity: number }

// Shape of the 201 response from POST /api/sales
export type CompleteSaleResult = {
  message: string
  sale_id: number
  total_amount: number | string
}