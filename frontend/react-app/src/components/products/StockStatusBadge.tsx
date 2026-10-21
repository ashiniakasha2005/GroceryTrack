import type { Product } from '../../types/product'
import { isLowStock } from '../../utils/stock'

type StockStatusBadgeProps = Pick<Product, 'currentStock' | 'minStockLevel'>

function StockStatusBadge({
  currentStock,
  minStockLevel,
}: StockStatusBadgeProps) {
  if (isLowStock({ currentStock, minStockLevel })) {
    return (
      <span className="inline-flex items-center gap-1 rounded-[4px] bg-[#dc3545] px-[9px] py-[3px] text-[11px] font-semibold leading-[17px] tracking-[0.3px] text-white">
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3 2 20h20L12 3z" />
          <path d="M12 10v4" />
          <path d="M12 17h.01" />
        </svg>
        Low Stock
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-[4px] bg-[#d1e7dd] px-[9px] py-[3px] text-[11px] font-semibold leading-[17px] tracking-[0.3px] text-[#0a3622]">
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m5 12 5 5 9-10" />
      </svg>
      In Stock
    </span>
  )
}

export default StockStatusBadge