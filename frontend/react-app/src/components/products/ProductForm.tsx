import { useEffect, useState, type FormEvent } from 'react'
import CategoryDropdown from './CategoryDropdown'

export interface ProductFormData {
  name: string
  category: string
  unit: string
  price: number
  currentStock: number
  minimumStock: number
}

const UNIT_OPTIONS = ['pcs', 'kg', 'g', 'L', 'ml', 'pack', 'bottle']

interface ProductFormProps {
  initialValues?: ProductFormData
  onSave: (data: ProductFormData) => void | Promise<void>
  onCancel: () => void
}

function ProductForm({
  initialValues,
  onSave,
  onCancel,
}: ProductFormProps) {
  const isEditing = Boolean(initialValues)

  const [name, setName] = useState(initialValues?.name ?? '')
  const [category, setCategory] = useState(initialValues?.category ?? '')
  const [unit, setUnit] = useState(initialValues?.unit ?? 'pcs')
  const [price, setPrice] = useState(
    initialValues ? String(initialValues.price) : '',
  )
  const [currentStock, setCurrentStock] = useState(
    initialValues ? String(initialValues.currentStock) : '',
  )
  const [minimumStock, setMinimumStock] = useState(
    initialValues ? String(initialValues.minimumStock) : '',
  )
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // If a product has a unit that is not in the list, keep it selectable
  const unitOptions = UNIT_OPTIONS.includes(unit)
    ? UNIT_OPTIONS
    : [unit, ...UNIT_OPTIONS]

  // Close with the Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isSaving) onCancel()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isSaving, onCancel])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const parsedPrice = Number(price)
    const parsedCurrentStock = Number(currentStock)
    const parsedMinimumStock = Number(minimumStock)

    if (!name.trim()) {
      setError('Product name is required.')
      return
    }

    if (!category) {
      setError('Please select a category.')
      return
    }

    if (price.trim() === '' || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError('Price must be a number greater than zero.')
      return
    }

    if (
      currentStock.trim() === '' ||
      !Number.isInteger(parsedCurrentStock) ||
      parsedCurrentStock < 0
    ) {
      setError('Current stock must be a whole number greater than or equal to zero.')
      return
    }

    if (
      minimumStock.trim() === '' ||
      !Number.isInteger(parsedMinimumStock) ||
      parsedMinimumStock < 0
    ) {
      setError('Minimum stock must be a whole number greater than or equal to zero.')
      return
    }

    setIsSaving(true)

    try {
      await onSave({
        name: name.trim(),
        category,
        unit: unit.trim() || 'pcs',
        price: parsedPrice,
        currentStock: parsedCurrentStock,
        minimumStock: parsedMinimumStock,
      })
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : 'Could not save the product. Please try again.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section
      className="product-modal"
      style={{ width: 'min(100%, 480px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      <header className="product-modal-header">
        <h2 id="product-modal-title">
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h2>
        <button
          type="button"
          className="product-modal-close"
          onClick={onCancel}
          disabled={isSaving}
          aria-label="Close product form"
        >
          ×
        </button>
      </header>

      <form className="product-form" onSubmit={handleSubmit} noValidate>
        <div className="product-form-fields">
          {error && (
            <p role="alert" className="product-form-error">
              {error}
            </p>
          )}

          <div className="product-form-field product-form-field-full">
            <label htmlFor="product-name">Product Name *</label>
            <input
              autoFocus
              id="product-name"
              name="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={100}
              placeholder="e.g. White Sugar 1kg"
            />
          </div>

          <CategoryDropdown
            id="product-category"
            value={category}
            onChange={setCategory}
            required
          />

          <div className="product-form-field">
            <label htmlFor="product-unit">Unit</label>
            <select
              id="product-unit"
              name="unit"
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              {unitOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="product-form-field">
            <label htmlFor="product-price">Price (LKR) *</label>
            <input
              id="product-price"
              name="price"
              type="number"
              min="0.01"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="product-form-field">
            <label htmlFor="product-current-stock">Current Stock *</label>
            <input
              id="product-current-stock"
              name="currentStock"
              type="number"
              min="0"
              step="1"
              value={currentStock}
              onChange={(event) => setCurrentStock(event.target.value)}
              placeholder="0"
              required
            />
          </div>

          <div className="product-form-field">
            <label htmlFor="product-minimum-stock">Min Stock Level *</label>
            <input
              id="product-minimum-stock"
              name="minimumStock"
              type="number"
              min="0"
              step="1"
              value={minimumStock}
              onChange={(event) => setMinimumStock(event.target.value)}
              placeholder="0"
              required
            />
          </div>
        </div>

        <footer className="product-form-actions">
          <button type="button" onClick={onCancel} disabled={isSaving}>
            Cancel
          </button>

          <button type="submit" disabled={isSaving}>
            {isSaving
              ? 'Saving...'
              : isEditing
                ? 'Save Changes'
                : 'Add Product'}
          </button>
        </footer>
      </form>
    </section>
  )
}

export default ProductForm
