import { useRef, useState } from 'react'
import { completeSale } from '../services/salesApi'
import { useInventory } from '../context/InventoryContext'
import type { CompleteSaleResult, SaleItem } from '../types/sale'

export function useCompleteSale() {
  const { refreshInventory } = useInventory()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [lastSale, setLastSale] = useState<CompleteSaleResult | null>(null)
  const submittingRef = useRef(false) // blocks double clicks

  async function submitSale(items: SaleItem[]): Promise<boolean> {
    if (submittingRef.current) return false

    if (items.length === 0) {
      setError('Add at least one product to the sale.')
      return false
    }
    if (items.some((item) => !Number.isInteger(item.quantity) || item.quantity <= 0)) {
      setError('Quantities must be whole numbers greater than zero.')
      return false
    }

    submittingRef.current = true
    setIsSubmitting(true)
    setError('')
    setLastSale(null)
    try {
      const result = await completeSale(items)
      setLastSale(result)
      refreshInventory() // the inventory list refetches from the server
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      return false
    } finally {
      submittingRef.current = false
      setIsSubmitting(false)
    }
  }

  return { submitSale, isSubmitting, error, lastSale }
}
