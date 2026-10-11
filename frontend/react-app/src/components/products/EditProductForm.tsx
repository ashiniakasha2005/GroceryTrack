
import { useState } from 'react'
import type { ProductFormData } from './AddProductForm'
import './ProductForms.css'

interface EditProductFormProps {
  product: ProductFormData
  onSave: (product: ProductFormData) => void
  onCancel: () => void
}

function EditProductForm({
  product,
  onSave,
  onCancel,
}: EditProductFormProps) {
  const [form, setForm] = useState<ProductFormData>({ ...product })
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
        aria-labelledby="edit-product-title"
      >
        <header className="product-modal-header">
          <div>
            <h2 id="edit-product-title">Edit Product</h2>
            <p>Update the details of this product.</p>
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
            <label htmlFor="edit-name">Product Name *</label>
            <input
              id="edit-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          
<div className="product-form-field">
  <label htmlFor="edit-category">Category *</label>
  <select
    id="edit-category"
    name="category"
    value={form.category}
    onChange={handleChange}
    required
  >
    <option value="">Select category</option>
    <option value="Dry Goods">Dry Goods</option>
    <option value="Dairy">Dairy</option>
    <option value="Beverages">Beverages</option>
    <option value="Fruits & Vegetables">Fruits & Vegetables</option>
    <option value="Bakery">Bakery</option>
    <option value="Frozen Foods">Frozen Foods</option>
    <option value="Snacks">Snacks</option>
    <option value="Household">Household</option>
    <option value="Other">Other</option>
  </select>
</div>

          <div className="product-form-grid">
            <div className="product-form-field">
              <label htmlFor="edit-unit">Unit *</label>
              <select
                id="edit-unit"
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
              <label htmlFor="edit-price">Price (LKR) *</label>
              <input
                id="edit-price"
                name="price"
                type="number"
                min="0.01"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="product-form-field">
              <label htmlFor="edit-currentStock">Current Stock *</label>
              <input
                id="edit-currentStock"
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
              <label htmlFor="edit-minimumStock">Min Stock Level *</label>
              <input
                id="edit-minimumStock"
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
              Save Changes
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}

export default EditProductForm
