import type { CompleteSaleResult, SaleItem } from '../types/sale'

const API_URL = 'http://localhost:3000/api' // same value ProductsPage uses
const TOKEN_KEY = 'token' // CHECK: must match the key the login code uses

export async function completeSale(items: SaleItem[]): Promise<CompleteSaleResult> {
  const token = localStorage.getItem(TOKEN_KEY)

  const response = await fetch(`${API_URL}/sales`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      items: items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
      })),
    }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message ?? 'Could not complete the sale.')
  }
  return data as CompleteSaleResult
}
