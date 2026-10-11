
import { useState } from 'react'
import './ProductForms.css'

export interface ProductFormData {
  name: string
  category: string
  unit: string
  price: number
  currentStock: number
  minimumStock: number
}

interface AddProductFormProps {
  onSave: (product: ProductFormData) => void
  onCancel: () => void
}

function AddProductForm({ onSave, onCancel }: AddProductFormProps) {
  const [form, setForm] = useState<ProductFormData>({
    name: '',
    category: '',
    unit: 'pcs',
    price: 0,
    currentStock: 0,
    minimumStock: 0,
  })

  const [error, setError] = useState('')

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]:
        name === 'price' ||
        name === 'currentStock' ||
        name === 'minimumStock'
          ? value === '' ? 0 : Number(value)
          : value,
    }))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.name.trim() || !form.category.trim() || !form.unit) {
      setError('Please complete all required fields.')
      return
    }

    if (!Number.isFinite(form.price) || form.price <= 0) {
      setError('Price must be greater than zero.')
      return
    }

    if (
      !Number.isInteger(form.currentStock) ||
      !Number.isInteger(form.minimumStock) ||
      form.currentStock < 0 ||
      form.minimumStock < 0
    ) {
      setError('Stock values must be whole numbers of zero or more.')
      return
    }

    setError('')
    onSave({ ...form, name: form.name.trim() })
  }

  return (
    <div className="product-modal-overlay">
      <section
        className="product-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-product-title"
      >
        <header className="product-modal-header">
          <div>
            <h2 id="add-product-title">Add New Product</h2>
            <p>Enter the details for your new product.</p>
          </div>

          <button
            type="button"
            className="product-close-button"
            onClick={onCancel}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="product-form-field">
            <label htmlFor="name">Product Name *</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. White Sugar 1kg"
              required
            />
          </div>

          <div className="product-form-field">
            <label htmlFor="category">Category *</label>
            <input
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. Dry Goods"
              required
            />
          </div>

          <div className="product-form-grid">
            <div className="product-form-field">
              <label htmlFor="unit">Unit *</label>
              <select
                id="unit"
                name="unit"
                value={form.unit}
                onChange={handleChange}
                required
              >
                <option value="pcs">pcs</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="L">L</option>
                <option value="ml">ml</option>
                <option value="pack">pack</option>
                <option value="bottle">bottle</option>
              </select>
            </div>

            <div className="product-form-field">
              <label htmlFor="price">Price (LKR) *</label>
              <input
                id="price"
                name="price"
                type="number"
                min="0.01"
                step="0.01"
                value={form.price || ''}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>

            <div className="product-form-field">
              <label htmlFor="currentStock">Current Stock *</label>
              <input
                id="currentStock"
                name="currentStock"
                type="number"
                min="0"
                step="1"
                value={form.currentStock}
                onChange={handleChange}
                required
              />
            </div>

            <div className="product-form-field">
              <label htmlFor="minimumStock">Min Stock Level *</label>
              <input
                id="minimumStock"
                name="minimumStock"
                type="number"
                min="0"
                step="1"
                value={form.minimumStock}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {error && (
            <p className="product-form-error" role="alert">
              {error}
            </p>
          )}

          <footer className="product-modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onCancel}
            >
              Cancel
            </button>

            <button type="submit" className="primary-button">
              Add Product
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}

export default AddProductForm
