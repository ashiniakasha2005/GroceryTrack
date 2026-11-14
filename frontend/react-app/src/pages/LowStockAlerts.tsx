import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// Sprint 4 – US-010
// FE-01: In-system low-stock alert / list view
// FE-02: Show product name and current stock per alert entry

const API_URL = 'http://localhost:3000/api'

type ApiLowStockProduct = {
  id?: number | string
  product_id?: number | string
  name?: string
  product_name?: string
  stock_quantity?: number | string
  current_stock?: number | string
  stock_qty?: number | string
  minimum_stock?: number | string
  min_stock_level?: number | string
}

type LowStockAlert = {
  id: string
  name: string
  stock: number
  minStock: number
}

function toAlert(p: ApiLowStockProduct): LowStockAlert {
  return {
    id: String(p.id ?? p.product_id ?? p.name ?? p.product_name),
    name: p.name ?? p.product_name ?? 'Unnamed product',
    stock: Number(p.stock_quantity ?? p.current_stock ?? p.stock_qty) || 0,
    minStock: Number(p.minimum_stock ?? p.min_stock_level) || 0,
  }
}

export default function LowStockAlerts() {
  const [alerts, setAlerts] = useState<LowStockAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Function for the "Refresh" button
  async function loadAlerts() {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/inventory/low-stock/list`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      if (res.status === 401 || res.status === 403) {
        throw new Error('Your session has expired. Please log in again.')
      }
      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`)
      }

      const data = await res.json()
      const list: ApiLowStockProduct[] = Array.isArray(data)
        ? data
        : data.products ?? data.data ?? []

      const sorted = list.map(toAlert).sort((a, b) => a.stock - b.stock)

      setAlerts(sorted)
      setLastUpdated(new Date())
    } catch (err) {
      setAlerts([])
      setError(
        err instanceof Error && err.message !== 'Failed to fetch'
          ? err.message
          : 'Cannot reach the server (http://localhost:3000). Is the backend running?',
      )
    } finally {
      setLoading(false)
    }
  }

  // FIXED: Avoid calling setState synchronously in useEffect by using an IIFE and isMounted flag
  useEffect(() => {
    let isMounted = true;

    const fetchInitialAlerts = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_URL}/inventory/low-stock/list`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })

        if (res.status === 401 || res.status === 403) {
          throw new Error('Your session has expired. Please log in again.')
        }
        if (!res.ok) {
          throw new Error(`Server responded with ${res.status}`)
        }

        const data = await res.json()
        const list: ApiLowStockProduct[] = Array.isArray(data)
          ? data
          : data.products ?? data.data ?? []

        const sorted = list.map(toAlert).sort((a, b) => a.stock - b.stock)

        if (isMounted) {
          setAlerts(sorted)
          setLastUpdated(new Date())
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          setAlerts([])
          setError(
            err instanceof Error && err.message !== 'Failed to fetch'
              ? err.message
              : 'Cannot reach the server (http://localhost:3000). Is the backend running?',
          )
          setLoading(false)
        }
      }
    }

    void fetchInitialAlerts();
    return () => { isMounted = false };
  }, [])

  const outOfStockCount = alerts.filter((a) => a.stock <= 0).length

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#212529]">Low-Stock Alerts</h2>
          <p className="mt-1 text-sm text-[#6c757d]">
            Products at or below their minimum stock level.
            {lastUpdated && (
              <span className="ml-1 text-[#adb5bd]">
                Last updated {lastUpdated.toLocaleTimeString()}.
              </span>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={loadAlerts}
          disabled={loading}
          className="rounded-md bg-[#0d6efd] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0b5ed7] disabled:opacity-60"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Summary */}
      {!loading && !error && alerts.length > 0 && (
        <div className="mb-5 flex items-start gap-3 rounded-lg border border-[#f5c2c7] bg-[#f8d7da] px-4 py-3 text-sm text-[#842029]">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-0.5 shrink-0"
          >
            <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
          <span>
            <strong>
              {alerts.length} product{alerts.length === 1 ? '' : 's'}
            </strong>{' '}
            need{alerts.length === 1 ? 's' : ''} restocking
            {outOfStockCount > 0 && (
              <>
                {' '}
                ({outOfStockCount} out of stock)
              </>
            )}
            .
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-5 flex items-center justify-between gap-4 rounded-lg border border-[#ffe69c] bg-[#fff3cd] px-4 py-3 text-sm text-[#664d03]">
          <span>{error}</span>
          <button type="button" onClick={loadAlerts} className="font-semibold underline">
            Try again
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="rounded-lg border border-[#e9ecef] bg-white px-4 py-10 text-center text-sm text-[#6c757d]">
          Loading low-stock alerts…
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && alerts.length === 0 && (
        <div className="rounded-lg border border-[#badbcc] bg-[#d1e7dd] px-4 py-10 text-center">
          <div className="text-base font-semibold text-[#0f5132]">All stocked up!</div>
          <div className="mt-1 text-sm text-[#0f5132]">
            No products are currently below their minimum stock level.
          </div>
        </div>
      )}

      {/* Alert list */}
      {!loading && !error && alerts.length > 0 && (
        <ul className="space-y-3">
          {alerts.map((alert) => {
            const isOut = alert.stock <= 0
            return (
              <li
                key={alert.id}
                className={`flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-white px-5 py-4 shadow-sm ${
                  isOut ? 'border-l-4 border-l-[#212529]' : 'border-l-4 border-l-[#dc3545]'
                }`}
              >
                {/* FE-02: product name */}
                <div className="min-w-0">
                  <div className="truncate text-base font-semibold text-[#212529]">
                    {alert.name}
                  </div>
                  <div className="mt-1 text-xs text-[#6c757d]">
                    Minimum stock level: {alert.minStock}
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  {/* FE-02: current stock */}
                  <div className="text-right">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[#adb5bd]">
                      Current stock
                    </div>
                    <div
                      className={`text-xl font-bold ${isOut ? 'text-[#212529]' : 'text-[#dc3545]'}`}
                    >
                      {alert.stock}
                    </div>
                  </div>

                  <span
                    className={`rounded px-2.5 py-1 text-xs font-semibold text-white ${
                      isOut ? 'bg-[#212529]' : 'bg-[#dc3545]'
                    }`}
                  >
                    {isOut ? 'Out of Stock' : 'Low Stock'}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {!loading && !error && alerts.length > 0 && (
        <p className="mt-4 text-xs text-[#6c757d]">
          Restock these items from the{' '}
          <Link to="/inventory" className="font-semibold text-[#0d6efd] hover:underline">
            Inventory
          </Link>{' '}
          page.
        </p>
      )}
    </div>
  )
}