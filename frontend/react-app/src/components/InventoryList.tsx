import { useEffect, useMemo, useState } from 'react'

// FE-01: Inventory list view showing stock per product (US-007)

type ApiProduct = {
  id?: number | string
  _id?: string
  name: string
  category?: string | { name: string } | null
  category_name?: string
  price: number | string
  stock_qty?: number | string
  min_stock_level?: number | string
  unit?: string
}

type StockRow = {
  id: string
  name: string
  category: string
  price: number
  stock: number
  minStock: number
  unit: string
}

type Filter = 'all' | 'low'

// Change this if your backend runs on a different port.
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

// Shown only if the backend is not reachable, so the screen can still be demonstrated.
const SAMPLE_DATA: StockRow[] = [
  { id: '1', name: 'White Sugar 1kg', category: 'Dry Goods', price: 68, stock: 4, minStock: 10, unit: 'kg' },
  { id: '2', name: 'All-Purpose Flour 1kg', category: 'Dry Goods', price: 55, stock: 38, minStock: 15, unit: 'kg' },
  { id: '3', name: 'Fresh Milk 1L', category: 'Dairy', price: 89, stock: 2, minStock: 8, unit: 'L' },
  { id: '4', name: 'Salted Butter 225g', category: 'Dairy', price: 115, stock: 15, minStock: 6, unit: 'pcs' },
  { id: '5', name: 'Cooking Oil 1L', category: 'Oils & Fats', price: 72, stock: 0, minStock: 12, unit: 'L' },
]

function toRow(p: ApiProduct): StockRow {
  const category =
    typeof p.category === 'string' ? p.category : p.category?.name ?? p.category_name ?? 'Uncategorized'
  return {
    id: String(p.id ?? p._id ?? p.name),
    name: p.name,
    category,
    price: Number(p.price) || 0,
    stock: Number(p.stock_qty) || 0,
    minStock: Number(p.min_stock_level) || 0,
    unit: p.unit ?? '',
  }
}

function formatPrice(value: number) {
  return `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function getStatus(row: StockRow): 'out' | 'low' | 'ok' {
  if (row.stock <= 0) return 'out'
  if (row.stock <= row.minStock) return 'low'
  return 'ok'
}

const STATUS_STYLE = {
  out: { label: 'Out of Stock', className: 'bg-gray-800 text-white' },
  low: { label: 'Low Stock', className: 'bg-red-600 text-white' },
  ok: { label: 'In Stock', className: 'bg-green-100 text-green-800' },
}

export default function InventoryList() {
  const [rows, setRows] = useState<StockRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [usingSample, setUsingSample] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  async function loadProducts() {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/products`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) throw new Error(`Server responded with ${res.status}`)
      const data = await res.json()
      const list: ApiProduct[] = Array.isArray(data) ? data : data.products ?? data.data ?? []
      setRows(list.map(toRow))
      setUsingSample(false)
    } catch (err) {
      setRows(SAMPLE_DATA)
      setUsingSample(true)
      setError(err instanceof Error ? err.message : 'Could not load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const lowStockCount = useMemo(() => rows.filter((r) => getStatus(r) !== 'ok').length, [rows])

  const visibleRows = useMemo(() => {
    const term = search.trim().toLowerCase()
    return rows.filter((r) => {
      const matchesSearch = !term || r.name.toLowerCase().includes(term) || r.category.toLowerCase().includes(term)
      const matchesFilter = filter === 'all' || getStatus(r) !== 'ok'
      return matchesSearch && matchesFilter
    })
  }, [rows, search, filter])

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Stock Levels</h2>
          <p className="text-sm text-gray-500">
            {rows.length} total products ·{' '}
            <span className={lowStockCount > 0 ? 'font-medium text-red-600' : ''}>
              {lowStockCount} low-stock alerts
            </span>
          </p>
        </div>

        <div className="flex gap-2" role="group" aria-label="Stock filter">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            All products
          </button>
          <button
            onClick={() => setFilter('low')}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              filter === 'low' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Low stock only
          </button>
        </div>
      </div>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by product or category..."
        className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />

      {usingSample && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span>Could not reach the server ({error}). Showing sample data.</span>
          <button onClick={loadProducts} className="font-medium underline">
            Try again
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Product name</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Current stock</th>
              <th className="px-4 py-3 font-medium">Min stock level</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                  Loading products...
                </td>
              </tr>
            )}

            {!loading && visibleRows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                  {rows.length === 0
                    ? 'No products yet. Add a product to start tracking stock.'
                    : 'No products found for this search or filter.'}
                </td>
              </tr>
            )}

            {!loading &&
              visibleRows.map((row, index) => {
                const status = getStatus(row)
                return (
                  <tr key={row.id} className={`border-t border-gray-100 ${status !== 'ok' ? 'bg-red-50/60' : ''}`}>
                    <td className="px-4 py-3 text-gray-400">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">{row.category}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{formatPrice(row.price)}</td>
                    <td className={`px-4 py-3 font-semibold ${status !== 'ok' ? 'text-red-600' : 'text-gray-900'}`}>
                      {row.stock} {row.unit}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.minStock} {row.unit}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[status].className}`}>
                        {STATUS_STYLE[status].label}
                      </span>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>

        {!loading && (
          <div className="border-t border-gray-100 px-4 py-3 text-xs text-gray-500">
            Showing {visibleRows.length} of {rows.length} products
          </div>
        )}
      </div>
    </div>
  )
}