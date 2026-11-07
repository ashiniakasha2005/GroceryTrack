import type { ReactNode } from 'react'
import type { Product } from '../../types/product'
import { isLowStock } from '../../utils/stock'
import StockStatusBadge from './StockStatusBadge'

type ProductCatalogViewProps = {
  products: Product[]
  totalCount?: number // for "Showing X of Y" when search filters the list
  lowStockCount?: number // counted from ALL products, not the filtered list
  toolbar?: ReactNode // search bar slot (FE 4)
  emptyMessage?: string // e.g. "No products match your search."
  onAdd: () => void
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

const formatPrice = (price: number) =>
  `LKR ${price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const formatQty = (qty: number, unit?: string) =>
  unit ? `${qty} ${unit}` : `${qty}`

const pluralize = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? '' : 's'}`

function ProductCatalogView({
  products,
  totalCount,
  lowStockCount: lowCount,
  toolbar,
  emptyMessage = 'No products to display.',
  onAdd,
  onEdit,
  onDelete,
}: ProductCatalogViewProps) {
  const total = totalCount ?? products.length
  const lowStockCount = lowCount ?? products.filter(isLowStock).length

  return (
    <div>
      {/* Heading row */}
      <div className="mb-[18px] flex items-start justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-[#212529]">
            Product Inventory
          </h2>

          <p className="mt-1 text-[12px] text-[#adb5bd]">
            {pluralize(total, 'total product')} ·{' '}
            <span className="text-[#dc3545]">
              {pluralize(lowStockCount, 'low-stock alert')}
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-[39px] w-[176px] shrink-0 items-center justify-center gap-[7px] rounded-[7px] bg-[#0d6efd] px-[18px] py-[9px] text-[13px] font-semibold text-white transition hover:bg-[#0b5ed7]"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          Add New Product
        </button>
      </div>

      {/* Search bar slot */}
      {toolbar && <div className="mb-[18px]">{toolbar}</div>}

      {/* Table card */}
      <section className="overflow-hidden rounded-[10px] border border-[#e9ecef] bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-[13px] text-[#495057]">
            <thead className="bg-[#f8f9fa] text-[11px] font-semibold uppercase text-[#adb5bd]">
              <tr>
                <th scope="col" className="px-4 py-[11px]">#</th>
                <th scope="col" className="px-4 py-[11px]">Product Name</th>
                <th scope="col" className="px-4 py-[11px]">Category</th>
                <th scope="col" className="px-4 py-[11px]">Price</th>
                <th scope="col" className="px-4 py-[11px]">Current Stock</th>
                <th scope="col" className="px-4 py-[11px]">Min Stock Level</th>
                <th scope="col" className="px-4 py-[11px]">Status</th>
                <th scope="col" className="px-4 py-[11px]">Actions</th>
              </tr>
            </thead>

            <tbody className="whitespace-nowrap">
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-[#adb5bd]"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                products.map((product, index) => {
                  const low = isLowStock(product)

                  return (
                    <tr
                      key={product.id}
                      className={`border-b border-[#f8f9fa] last:border-b-0 ${
                        low
                          ? 'bg-[#fff8f8] hover:bg-[#ffeaea]'
                          : 'bg-white hover:bg-[#f1f3f5]'
                      }`}
                    >
                      <td className="px-4 py-[11px] text-[#adb5bd]">
                        {index + 1}
                      </td>

                      <td className="px-4 py-[11px] font-medium text-[#343a40]">
                        {product.name}
                      </td>

                      <td className="px-4 py-[11px]">
                        <span className="inline-block rounded-[4px] bg-[#e9ecef] px-2 py-[0.6px] text-[12px] font-normal leading-[18px] text-[#495057]">
                          {product.categoryName}
                        </span>
                      </td>

                      <td className="px-4 py-[11px] font-semibold text-[#343a40]">
                        {formatPrice(product.price)}
                      </td>

                      <td
                        className={`px-4 py-[11px] font-bold ${
                          low ? 'text-[#dc3545]' : 'text-[#343a40]'
                        }`}
                      >
                        {formatQty(product.currentStock, product.unit)}
                      </td>

                      <td className="px-4 py-[11px]">
                        {formatQty(product.minStockLevel, product.unit)}
                      </td>

                      <td className="px-4 py-[11px]">
                        <StockStatusBadge
                          currentStock={product.currentStock}
                          minStockLevel={product.minStockLevel}
                        />
                      </td>

                      <td className="px-4 py-[11px]">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onEdit(product)}
                            aria-label={`Edit ${product.name}`}
                            className="inline-flex h-[29.6px] items-center gap-1 rounded-[5px] border border-[#ffda6a] bg-[#fff3cd] px-3 text-[12px] font-medium leading-[18px] text-[#664d03] transition hover:bg-[#ffecb5]"
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M12 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
                              <path d="M18.4 2.6a2 2 0 0 1 2.8 2.8L11 15.6 7 16.6l1-4z" />
                            </svg>
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => onDelete(product)}
                            aria-label={`Delete ${product.name}`}
                            className="inline-flex h-[29.6px] items-center gap-1 rounded-[5px] border border-[#f5c6cb] bg-[#f8d7da] px-3 text-[12px] font-medium leading-[18px] text-[#842029] transition hover:bg-[#f5c2c7]"
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M3 6h18" />
                              <path d="M8 6V4h8v2" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-[#e9ecef] px-4 py-[11px] text-[12px] text-[#adb5bd]">
          Showing {products.length} of {pluralize(total, 'product')}
        </div>
      </section>
    </div>
  )
}

export default ProductCatalogView