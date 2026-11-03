import { useRef, useState } from 'react'
import { setStock, updateMinimumStock } from '../../services/stockApi'

export type RestockProduct = {
  id: number
  name: string
  categoryId: number
  price: number
  currentStock: number
  minimumStock: number
}

type Props = {
  product: RestockProduct
  onSaved: () => void // e.g. reload the product list
  onCancel?: () => void
}

export default function RestockForm({ product, onSaved, onCancel }: Props) {
  const [addQty, setAddQty] = useState('')
  const [minLevel, setMinLevel] = useState(String(product.minimumStock))
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const savingRef = useRef(false) // blocks double clicks

  const addNumber = addQty.trim() === '' ? 0 : Number(addQty)
  const minNumber = Number(minLevel)
  const newTotal = product.currentStock + (Number.isInteger(addNumber) ? addNumber : 0)

  async function handleSubmit() {
    if (savingRef.current) return
    setError('')
    setSuccess('')

    if (!Number.isInteger(addNumber) || addNumber < 0) {
      setError('Restock quantity must be a whole number, 0 or more.')
      return
    }
    if (minLevel.trim() === '' || !Number.isInteger(minNumber) || minNumber < 0) {
      setError('Minimum level must be a whole number, 0 or more.')
      return
    }
    const stockChanged = addNumber > 0
    const minChanged = minNumber !== product.minimumStock
    if (!stockChanged && !minChanged) {
      setError('Enter a restock quantity or change the minimum level.')
      return
    }

    savingRef.current = true
    setIsSaving(true)
    let stockSaved = false
    try {
      if (stockChanged) {
        await setStock(product.id, product.currentStock + addNumber)
        stockSaved = true
      }
      if (minChanged) {
        await updateMinimumStock({ ...product, minimumStock: minNumber })
      }
      setSuccess('Saved.')
      setAddQty('')
      onSaved()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      if (stockSaved) {
        setError(`Stock was updated, but the minimum level was not saved: ${message}`)
        onSaved()
      } else {
        setError(message)
      }
    } finally {
      savingRef.current = false
      setIsSaving(false)
    }
  }

  return (
    <div>
      <h3>Restock: {product.name}</h3>
      <p>Current stock: {product.currentStock}</p>

      <label htmlFor="restock-qty">Quantity to add</label>
      <input
        id="restock-qty"
        type="number"
        min={0}
        value={addQty}
        onChange={(e) => setAddQty(e.target.value)}
        disabled={isSaving}
      />
      <p>Stock after restock: {newTotal}</p>

      <label htmlFor="restock-min">Minimum stock level</label>
      <input
        id="restock-min"
        type="number"
        min={0}
        value={minLevel}
        onChange={(e) => setMinLevel(e.target.value)}
        disabled={isSaving}
      />

      <button type="button" onClick={handleSubmit} disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save'}
      </button>
      {onCancel && (
        <button type="button" onClick={onCancel} disabled={isSaving}>
          Cancel
        </button>
      )}
      {error && <p role="alert">{error}</p>}
      {success && <p role="status">{success}</p>}
    </div>
  )
}