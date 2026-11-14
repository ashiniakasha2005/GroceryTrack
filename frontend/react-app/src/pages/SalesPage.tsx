import { useEffect, useMemo, useState } from 'react'
import type { Product } from '../types/product'

const API_URL = 'http://localhost:3000/api'

interface ApiProduct {
  id: number
  name: string
  category: string
  price: number
  stock_quantity: number
  minimum_stock: number
  unit?: string
}

interface CartItem {
  product: Product
  quantity: number
}

function toProduct(item: ApiProduct): Product {
  return {
    id: Number(item.id),
    name: item.name,
    categoryName: item.category,
    price: Number(item.price),
    currentStock: Number(item.stock_quantity),
    minStockLevel: Number(item.minimum_stock),
    unit: item.unit ?? '',
  }
}

async function request(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('Please log in to continue.')
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong.')
  }

  return data
}

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [checkoutMessage, setCheckoutMessage] = useState('')
  const [checkoutError, setCheckoutError] = useState('')
  const [stockErrors, setStockErrors] = useState<Record<number, string>>({})
  const [checkingOut, setCheckingOut] = useState(false)

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      setLoadError('')

      const data = await request('/products')
      const productList = Array.isArray(data) ? data : data.products

      if (!Array.isArray(productList)) {
        throw new Error('Invalid product data received from server.')
      }

      setProducts(productList.map((item: ApiProduct) => toProduct(item)))
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : 'Unable to load products.',
      )
    } finally {
      setLoading(false)
    }
  }

  // FIXED: Moved the async logic inside the effect to avoid warning
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const data = await request('/products');
        if (!isMounted) return;
        const productList = Array.isArray(data) ? data : data.products;
        setProducts(productList.map((item: ApiProduct) => toProduct(item)));
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : 'Unable to load products.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    void loadData();
    return () => { isMounted = false; };
  }, []);

  // Search products by name or category
  const filteredProducts = useMemo(() => {
    const searchValue = search.toLowerCase().trim()

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchValue) ||
        product.categoryName.toLowerCase().includes(searchValue),
    )
  }, [products, search])

  // Calculate total dynamically
  const total = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      ),
    [cart],
  )

  // Add product to cart
  const addToCart = (product: Product) => {
    setCheckoutMessage('')
    setCheckoutError('')

    if (product.currentStock <= 0) {
      setStockErrors((prev) => ({
        ...prev,
        [product.id]: 'This product is out of stock.',
      }))
      return
    }

    const existingItem = cart.find(
      (item) => item.product.id === product.id,
    )

    if (existingItem) {
      if (existingItem.quantity >= product.currentStock) {
        setStockErrors((prev) => ({
          ...prev,
          [product.id]: `Insufficient stock! Only ${product.currentStock} units available.`,
        }))
        return
      }

      setStockErrors((prev) => {
        const updatedErrors = { ...prev }
        delete updatedErrors[product.id]
        return updatedErrors
      })

      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      )
    } else {
      setCart([...cart, { product, quantity: 1 }])
    }
  }

  // Change cart quantity
  const changeQuantity = (productId: number, change: number) => {
    setCheckoutMessage('')
    setCheckoutError('')

    const existingItem = cart.find(
      (item) => item.product.id === productId,
    )

    if (!existingItem) {
      return
    }

    const newQuantity = existingItem.quantity + change

    if (newQuantity > existingItem.product.currentStock) {
      setStockErrors((prev) => ({
        ...prev,
        [productId]: `Insufficient stock! Only ${existingItem.product.currentStock} units available.`,
      }))
      return
    }
    setStockErrors((prev) => {
      const updatedErrors = { ...prev }
      delete updatedErrors[productId]
      return updatedErrors
    })

    setCart(
      cart
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: newQuantity }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  // Complete sale
  const handleCheckout = async () => {
    if (cart.length === 0) {
      setCheckoutError('Please add at least one product.')
      return
    }

    try {
      setCheckingOut(true)
      setCheckoutError('')
      setCheckoutMessage('')

      const result = await request('/sales', {
        method: 'POST',
        body: JSON.stringify({
          items: cart.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
          })),
        }),
      })

      setCart([])
      setCheckoutMessage(
        `Sale completed successfully! Sale ID: ${result.sale_id}`,
      )

      await fetchProducts()
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : 'Unable to complete the sale.',
      )
    } finally {
      setCheckingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">

        {/* Page heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Sales / POS Terminal
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Success message */}
        {checkoutMessage && (
          <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {checkoutMessage}
          </div>
        )}

        {/* Checkout error */}
        {checkoutError && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {checkoutError}
          </div>
        )}

        {/* Product loading error */}
        {loadError && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {loadError}
          </div>
        )}

        {/* Main layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]">

          {/* Product selection section */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

            {/* Search field */}
            <div className="mb-2">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search product by name or category..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-400">
                {filteredProducts.length} products found
              </p>
            </div>

            {/* Products table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/70 text-xs uppercase tracking-wider text-gray-400">
                    <th className="px-4 py-3 font-bold">Product Name</th>
                    <th className="px-4 py-3 font-bold">Category</th>
                    <th className="px-4 py-3 font-bold">Price</th>
                    <th className="px-4 py-3 font-bold">Available Stock</th>
                    <th className="px-4 py-3 text-right font-bold">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-sm text-gray-500">
                        Loading products...
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-sm text-gray-500">
                        No products found.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b border-gray-100 transition hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm font-medium text-gray-800">
                          {product.name}
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-500">
                          {product.categoryName}
                        </td>
                        <td className="px-4 py-4 text-xs font-medium text-gray-700">
                          Rs. {product.price.toFixed(2)}
                        </td>
                        <td className="px-4 py-4 text-xs">
                          {product.currentStock > 0 ? (
                            <span className="font-medium text-red-500">
                              {product.currentStock}
                              {product.unit ? ` ${product.unit}` : ''}
                            </span>
                          ) : (
                            <span className="font-medium text-gray-400">
                              Out of stock
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => addToCart(product)}
                            disabled={product.currentStock <= 0}
                            className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                          >
                            {product.currentStock <= 0 ? 'Out of stock' : '+ Add'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Current sale / Cart */}
          <section className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div>
              {/* Cart header */}
              <div className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3">
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H19m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h2 className="text-base font-semibold text-gray-900">Cart / Checkout</h2>
              </div>

              {/* Cart items or empty state */}
              {cart.length === 0 ? (
                <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
                  <svg className="mb-3 h-12 w-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H19m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-400">Cart is empty.</p>
                  <p className="mt-1 text-xs text-gray-400">Add products from the left panel.</p>
                </div>
              ) : (
                <div className="max-h-[40vh] space-y-4 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.product.id} className="border-b border-gray-100 pb-3">
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                          <p className="text-xs text-gray-400">Rs. {item.product.price.toFixed(2)} each</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          Rs. {(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      {stockErrors[item.product.id] && (
                        <p className="mt-2 text-xs font-medium text-red-600" role="alert">
                          {stockErrors[item.product.id]}
                        </p>
                      )}

                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => changeQuantity(item.product.id, -1)}
                          className="flex h-6 w-6 items-center justify-center rounded border border-gray-200 text-xs text-gray-600 hover:bg-gray-50"
                        >
                          -
                        </button>
                        <span className="min-w-5 text-center text-xs font-semibold text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => changeQuantity(item.product.id, 1)}
                          className="flex h-6 w-6 items-center justify-center rounded border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total, payment method and checkout */}
            <div className="mt-6 space-y-4 border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">Total Amount</span>
                <span className="text-xl font-bold text-gray-900">Rs. {total.toFixed(2)}</span>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">Payment Method</label>
                <div className="w-full rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-2 text-center text-sm font-medium text-blue-600">
                  Cash
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={cart.length === 0 || checkingOut}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-200 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
              >
                {checkingOut ? (
                  'Processing...'
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    Confirm Sale
                  </>
                )}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}