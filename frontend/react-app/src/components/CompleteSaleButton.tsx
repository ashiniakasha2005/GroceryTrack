import { useCompleteSale } from '../hooks/useCompleteSale'
import type { SaleItem } from '../types/sale'

type Props = {
  items: SaleItem[] // cart lines: { productId, quantity }
  onSuccess?: () => void // called after a successful sale (e.g. clear the cart)
}

export default function CompleteSaleButton({ items, onSuccess }: Props) {
  const { submitSale, isSubmitting, error, lastSale } = useCompleteSale()

  async function handleClick() {
    const ok = await submitSale(items)
    if (ok) onSuccess?.()
  }

  return (
    <div>
      <button type="button" onClick={handleClick} disabled={isSubmitting || items.length === 0}>
        {isSubmitting ? 'Completing…' : 'Complete Sale'}
      </button>
      {error && <p role="alert">{error}</p>}
      {lastSale && (
        <p role="status">
          {lastSale.message} (Sale #{lastSale.sale_id})
        </p>
      )}
    </div>
  )
}