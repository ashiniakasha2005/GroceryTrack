const API_URL = 'http://localhost:3000/api' // same value ProductsPage uses
const TOKEN_KEY = 'token'

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem(TOKEN_KEY)

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message ?? 'Request failed.')
  }
  return data
}

// Sets the stock to an exact number (PUT /inventory/:id)
export function setStock(productId: number, quantity: number) {
  return request(`/inventory/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  })
}

// PUT /products/:id needs name, category_id, price and minimum_stock together
export function updateMinimumStock(product: {
  id: number
  name: string
  categoryId: number
  price: number
  minimumStock: number
}) {
  return request(`/products/${product.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      name: product.name,
      category_id: product.categoryId,
      price: product.price,
      minimum_stock: product.minimumStock,
    }),
  })
}